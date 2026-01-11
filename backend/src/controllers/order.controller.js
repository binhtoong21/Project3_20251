import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Book from "../models/book.model.js";

import User from "../models/user.model.js";
import Transaction from "../models/transaction.model.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  const { paymentMethod, shippingAddress, orderItems } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    let finalOrderItems = [];
    let itemsPrice = 0;

    // A. Direct Purchase (Buy Now)
    if (orderItems && orderItems.length > 0) {
        finalOrderItems = orderItems;
        // Don't calculate itemsPrice yet, do it after validation for security
    } 
    // B. Purchase from Cart
    else {
        const cart = await Cart.findOne({ user: req.user._id }).session(session);

        if (!cart || cart.items.length === 0) {
            res.status(400);
            throw new Error("No order items (Cart is empty)");
        }
        
        // Map cart items to simple structure initially
        finalOrderItems = cart.items.map(item => ({
            book: item.book,
            title: item.title,
            quantity: item.quantity,
            price: item.price,
            cover: item.cover
        }));
    }


    
    //  Prepare Order Items and Check Stock 
    // At this point finalOrderItems contains minimal info. We need to verify stock & get seller info.
    const bookIds = finalOrderItems.map(item => item.book);
    const books = await Book.find({ '_id': { $in: bookIds } }).session(session).lean();
    
    const bookMap = books.reduce((map, book) => {
      map[book._id.toString()] = book;
      return map;
    }, {});

    const updateOps = [];
    const orderItemsWithSeller = finalOrderItems.map(item => {
      const book = bookMap[item.book.toString()];
      if (!book) {
        throw new Error(`Sách "${item.title || 'Unknown'}" không tồn tại hoặc đã bị xóa.`);
      }
      if (book.stock < item.quantity) {
        throw new Error(`Sách "${book.title}" không đủ tồn kho (Chỉ còn: ${book.stock}).`);
      }
      
      updateOps.push({
        updateOne: {
          filter: { _id: item.book },
          update: { $inc: { stock: -item.quantity } },
        },
      });

      return {
        book: item.book,
        title: book.title, // Use title from DB
        quantity: item.quantity,
        price: book.price, // Use price from DB (Security)
        cover: Array.isArray(book.cover) ? (book.cover.length > 0 ? book.cover[0] : '') : (book.cover || ''), // Use cover from DB
        seller: book.owner, 
      };
    });

    // Recalculate itemsPrice securely using verified DB prices
    itemsPrice = orderItemsWithSeller.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    //  Calculate Shipping & Total With C2C Logic 
    const isC2C = orderItemsWithSeller.some(item => item.seller);
    const shippingPrice = isC2C ? 0 : (itemsPrice > 100000 ? 0 : 30000);
    
    // Fee Logic: 2% for C2C orders (Deducted from Seller, NOT charged to Buyer)
    let transactionFee = 0;
    if (isC2C) {
      transactionFee = itemsPrice * 0.02;
    }

    // Buyer pays: Items + Shipping. (Fee is hidden from buyer)
    const totalPrice = itemsPrice + shippingPrice;

    //  Wallet Payment Logic 
    if (paymentMethod === "wallet") {
      const user = await User.findById(req.user._id).session(session);
      if (user.walletBalance < totalPrice) {
        res.status(400);
        throw new Error("Số dư ví không đủ để thực hiện thanh toán.");
      }
      user.walletBalance -= totalPrice;
      await user.save({ session });
    }

    if (updateOps.length > 0) {
      await Book.bulkWrite(updateOps, { session });
    }
    
    //  Order Creation 
    const order = new Order({
      user: req.user._id,
      orderItems: orderItemsWithSeller, // Use the new array with seller info
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      transactionFee,
      totalPrice,
      isPaid: paymentMethod === "wallet",
      paidAt: paymentMethod === "wallet" ? Date.now() : null,
      escrowStatus: paymentMethod === "wallet" ? "Held" : null,
    });
    const createdOrder = await order.save({ session });

    //  Transaction Record & Payouts for Wallet Payment 
    if (paymentMethod === "wallet") {
      // Buyer's transaction
      const buyerTransaction = {
        user: req.user._id,
        type: 'purchase',
        amount: -totalPrice,
        status: 'completed',
        relatedEntity: { id: createdOrder._id, model: 'Order' },
        description: `Thanh toán cho đơn hàng ${createdOrder._id}`
      };

      await Transaction.create([buyerTransaction], { session, ordered: true });
    }

    //  Clear Cart 
    //  Clear Cart (Only if NOT a direct purchase) 
    if (!orderItems || orderItems.length === 0) {
        const cart = await Cart.findOne({ user: req.user._id }).session(session);
        if (cart) {
            cart.items = [];
            await cart.save({ session });
        }
    }

    await session.commitTransaction();
    res.status(201).json(createdOrder);

  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone")
      .populate({
          path: "orderItems.seller",
          select: "name phone address"
      });

    if (order) {
      // Access Control: Buyer, Admin, or Seller involved in the order
      const isBuyer = order.user._id.toString() === req.user._id.toString();
      const isAdmin = req.user.role === 'admin';
      
      // Check if current user is a seller in any of the items
      // Note: Since we populated 'seller', it's an object now.
      const isSeller = order.orderItems.some(item => 
          item.seller && item.seller._id.toString() === req.user._id.toString()
      );

      if (!isBuyer && !isAdmin && !isSeller) {
        res.status(401);
        throw new Error("Not authorized to view this order");
      }
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin)
// @route   GET /api/orders/all
// @access  Private/Admin
export const getAllOrders = async (req, res, next) => {
  try {
    // Lấy tất cả đơn hàng, populate thêm tên và id của người mua
    const orders = await Order.find({})
      .populate("user", "id name")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Admin or Seller)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin/Seller
export const updateOrderStatus = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).session(session);

    if (order) {
       // Access Control
       const isAdmin = req.user.role === 'admin';
       
       // Check if user is a seller in this order
       const isSeller = order.orderItems.some(item => 
            item.seller && item.seller.toString() === req.user._id.toString()
       );

       if (!isAdmin && !isSeller) {
           res.status(401);
           throw new Error("Not authorized to update this order");
       }

       // Mixed Order Protection
       if (isSeller && !isAdmin) {
           const hasOtherItems = order.orderItems.some(item => {
                return !item.seller || item.seller.toString() !== req.user._id.toString();
           });

           if (hasOtherItems) {
               res.status(403);
               throw new Error("Cannot update Mixed Order (contains items from Shop or other Sellers). Please contact Admin.");
           }
       }

       // Checks if transitioning TO Cancelled FROM a non-cancelled state
       if (status === 'Cancelled' && order.status !== 'Cancelled') {
           const stockUpdateOps = order.orderItems.map(item => ({
               updateOne: {
                   filter: { _id: item.book },
                   update: { $inc: { stock: item.quantity } }
               }
           }));
           
           if (stockUpdateOps.length > 0) {
               await Book.bulkWrite(stockUpdateOps, { session });
           }
           
           // If it was a C2C Wallet order that is NOT yet released/refunded (Held/Disputed), we might need to handle the money.
           // However, usually cancellation implies refunding. 
           // If Admin manually cancels a B2C order that was PAID via Wallet but not delivered?
           // Currently manual cancellation assumes MONEY is handled separately (or COD).
           // If manual cancel on a PAID Wallet order -> We should probably auto-refund or warn?
           // For MVP: We assume manual cancellation is operational. Refund logic is separate via 'resolveDispute' or 'confirmRefundRequest'.
           // BUT: If Admin just sets status='Cancelled' on a Paid B2C order, the money sits in Admin Wallet? 
           // Let's keep it simple: Just restore stock for now as requested.
       }

      order.status = status;

       // Nếu chuyển sang Delivered thì cập nhật luôn thời gian giao
       if (status === 'Delivered') { 
            order.isDelivered = true;
            order.deliveredAt = Date.now();
       }

      const updatedOrder = await order.save({ session });
      await session.commitTransaction();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Get all items a user has sold
// @route   GET /api/orders/my-sales
// @access  Private
// @desc    Buyer confirms receipt -> Release funds to seller
// @route   PUT /api/orders/:id/confirm-receipt
// @access  Private (Buyer only)
export const confirmReceipt = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized");
    }

    // Validate status based on Payment Method
    if (order.paymentMethod === 'wallet') {
        if (order.escrowStatus !== 'Held') {
            res.status(400);
            throw new Error("Order funds are not currently held (Already released or refunded).");
        }
    } else {
        // For COD, user can confirm receipt if status is not already Completed
         if (order.status === 'Completed' || order.status === 'Cancelled') {
            res.status(400);
            throw new Error("Order is already completed or cancelled.");
         }
    }

    // Release Funds Logic (Only for Wallet/Escrow)
    if (order.paymentMethod === 'wallet') {
        const sellerPayouts = new Map();
        const sellerFees = new Map(); // Track fees

        for (const item of order.orderItems) {
            if (item.seller) {
                const sellerId = item.seller.toString();
                const earnings = item.price * item.quantity;
                
                // Calculate Fee per item (or accumulate)
                const fee = earnings * 0.02; // 2%
                
                sellerPayouts.set(sellerId, (sellerPayouts.get(sellerId) || 0) + earnings);
                sellerFees.set(sellerId, (sellerFees.get(sellerId) || 0) + fee);
            }
        }

        if (sellerPayouts.size > 0) {
            const sellerUpdateOps = [];
            const transactionCreateOps = [];
            
            for (const [sellerId, totalEarnings] of sellerPayouts.entries()) {
                const totalFee = sellerFees.get(sellerId) || 0;
                const netEarnings = totalEarnings - totalFee;

                sellerUpdateOps.push({
                    updateOne: {
                        filter: { _id: sellerId },
                        update: { $inc: { walletBalance: netEarnings } },
                    },
                });
                transactionCreateOps.push({
                    user: sellerId,
                    type: 'sale_income',
                    amount: netEarnings,
                    fee: totalFee, // Log the fee
                    status: 'completed',
                    relatedEntity: { id: order._id, model: 'Order' },
                    description: `Tiền bán sách từ đơn hàng ${order._id} (Đã trừ phí ${totalFee})`,
                });
            }
            
        await User.bulkWrite(sellerUpdateOps, { session });
        await Transaction.create(transactionCreateOps, { session });
        }
        order.escrowStatus = 'Released';
    }
    order.status = 'Completed'; // Optional: Auto-complete order
    
    // Auto confirm logic (if any) could be cleared here
    await order.save({ session });
    await session.commitTransaction();

    res.json(order);
  } catch (error) {
    await session.abortTransaction();
    next(error);
  } finally {
    session.endSession();
  }
};

// @desc    Buyer raises a dispute
// @route   PUT /api/orders/:id/dispute
// @access  Private (Buyer only)
export const disputeOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.user.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error("Not authorized");
    }

    if (order.escrowStatus !== 'Held') {
       res.status(400);
       throw new Error("Can only dispute orders where funds are currently held.");
    }

    order.escrowStatus = 'Disputed';
    if (reason) {
        order.disputeReason = reason;
    }
    
    const updatedOrder = await order.save();
    res.json(updatedOrder);

  } catch (error) {
    next(error);
  }
};

// @desc    Admin resolves dispute
// @route   PUT /api/orders/:id/resolve-dispute
// @access  Private (Admin)
export const resolveDispute = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
  try {
    const { decision } = req.body; // 'refund' or 'release'
    const order = await Order.findById(req.params.id).session(session);

    if (!order) {
      res.status(404);
      throw new Error("Order not found");
    }

    if (order.escrowStatus !== 'Disputed' && order.escrowStatus !== 'Held') {
        res.status(400);
        throw new Error("Order is not in a state to be resolved (Must be Held or Disputed).");
    }

    if (decision === 'release') {
        // Same Release Logic as confirmReceipt
        const sellerPayouts = new Map();
        const sellerFees = new Map();

        for (const item of order.orderItems) {
          if (item.seller) {
            const sellerId = item.seller.toString();
            const earnings = item.price * item.quantity;
            
            const fee = earnings * 0.02;

            sellerPayouts.set(sellerId, (sellerPayouts.get(sellerId) || 0) + earnings);
            sellerFees.set(sellerId, (sellerFees.get(sellerId) || 0) + fee);
          }
        }

        if (sellerPayouts.size > 0) {
            const sellerUpdateOps = [];
            const transactionCreateOps = [];
            for (const [sellerId, totalEarnings] of sellerPayouts.entries()) {
                const totalFee = sellerFees.get(sellerId) || 0;
                const netEarnings = totalEarnings - totalFee;

                sellerUpdateOps.push({
                    updateOne: {
                        filter: { _id: sellerId },
                        update: { $inc: { walletBalance: netEarnings } },
                    },
                });
                transactionCreateOps.push({
                    user: sellerId,
                    type: 'sale_income',
                    amount: netEarnings,
                    fee: totalFee,
                    status: 'completed',
                    relatedEntity: { id: order._id, model: 'Order' },
                    description: `Tiền bán sách từ đơn hàng ${order._id} (Admin đã giải quyết tranh chấp - Release - Trừ phí ${totalFee})`,
                });
            }
            await User.bulkWrite(sellerUpdateOps, { session });
            await Transaction.create(transactionCreateOps, { session });
        }
        order.escrowStatus = 'Released';
        order.status = 'Completed';

    } else if (decision === 'refund') {
        // Refund Buyer Logic
        const buyerId = order.user;
        const refundAmount = order.totalPrice; // Full refund

        await User.findByIdAndUpdate(buyerId, {
            $inc: { walletBalance: refundAmount }
        }).session(session);

        await Transaction.create([{
            user: buyerId,
            type: 'refund',
            amount: refundAmount,
            status: 'completed',
            relatedEntity: { id: order._id, model: 'Order' },
            description: `Hoàn tiền đơn hàng ${order._id} (Admin đã giải quyết tranh chấp - Refund)`,
        }], { session });

        // Restore Stock Logic
        const stockUpdateOps = order.orderItems.map(item => ({
            updateOne: {
                filter: { _id: item.book },
                update: { $inc: { stock: item.quantity } }
            }
        }));

        if (stockUpdateOps.length > 0) {
            await Book.bulkWrite(stockUpdateOps, { session });
        }

        order.escrowStatus = 'Refunded';
        order.status = 'Cancelled';
    } else {
        res.status(400);
        throw new Error("Invalid decision. Use 'refund' or 'release'.");
    }

    const updatedOrder = await order.save({ session });
    await session.commitTransaction();
    res.json(updatedOrder);

  } catch (error) {
    await session.abortTransaction();
     next(error);
  } finally {
    session.endSession();
  }
};

export const getMySales = async (req, res, next) => {
  try {
    // Find orders where the current user is listed as a seller in at least one orderItem
    const ordersWithUserSales = await Order.find({ 
      'orderItems.seller': req.user._id 
    }).populate('user', 'name').sort({ createdAt: -1 });

    if (!ordersWithUserSales) {
      return res.json([]);
    }

    // Process the orders to return a flat list of sold items
    const sales = ordersWithUserSales.flatMap(order => {
      // Filter to get only the items sold by the current user in this order
      const userSoldItems = order.orderItems.filter(
        item => item.seller && item.seller.toString() === req.user._id.toString()
      );

      // Map these items to a more useful format
      return userSoldItems.map(item => ({
        orderId: order._id,
        soldAt: order.createdAt,
        status: order.status,
        escrowStatus: order.escrowStatus, // Include escrow status info
        buyer: {
          name: order.user.name,
        },
        shippingAddress: order.shippingAddress,
        item: {
          title: item.title,
          quantity: item.quantity,
          price: item.price,
          cover: item.cover,
        },
        totalSaleValue: item.quantity * item.price,
      }));
    });

    res.json(sales);

  } catch (error) {
    next(error);
  }
};

// @desc    Buyer requests a refund (return)
// @route   PUT /api/orders/:id/refund-request
// @access  Private (Buyer)
export const requestRefund = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        if (order.user.toString() !== req.user._id.toString()) {
            res.status(401);
            throw new Error("Not authorized");
        }

        if (order.escrowStatus !== 'Held') {
            res.status(400);
            throw new Error("Can only request refund where funds are currently held.");
        }

        order.escrowStatus = 'ReturnRequested';
        if (reason) order.disputeReason = reason;

        const updatedOrder = await order.save();
        res.json(updatedOrder);
    } catch (error) {
        next(error);
    }
};

// @desc    Seller approves refund request
// @route   PUT /api/orders/:id/refund-confirm
// @access  Private (Seller)
export const confirmRefundRequest = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        // Check if user is a seller in this order
        const isSeller = order.orderItems.some(item => 
             item.seller && item.seller.toString() === req.user._id.toString()
        );

        if (!isSeller) {
            res.status(401);
            throw new Error("Not authorized (Must be a seller in this order)");
        }

        if (order.escrowStatus !== 'ReturnRequested') {
            res.status(400);
            throw new Error("Order state must be 'ReturnRequested' to confirm refund.");
        }

        // Execute Refund Logic (Refund to Buyer)
        const buyerId = order.user;
        const refundAmount = order.totalPrice; 

        await User.findByIdAndUpdate(buyerId, {
            $inc: { walletBalance: refundAmount }
        }).session(session);

        await Transaction.create([{
            user: buyerId,
            type: 'refund',
            amount: refundAmount,
            status: 'completed',
            relatedEntity: { id: order._id, model: 'Order' },
            description: `Hoàn tiền đơn hàng ${order._id} (Người bán đã xác nhận hoàn trả)`,
        }], { session });

        // Restore Stock
        const stockUpdateOps = order.orderItems.map(item => ({
            updateOne: {
                filter: { _id: item.book },
                update: { $inc: { stock: item.quantity } }
            }
        }));

        if (stockUpdateOps.length > 0) {
            await Book.bulkWrite(stockUpdateOps, { session });
        }

        order.escrowStatus = 'Refunded';
        order.status = 'Cancelled';

        const updatedOrder = await order.save({ session });
        await session.commitTransaction();
        res.json(updatedOrder);

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};

// @desc    Seller rejects refund request -> Escalates to Dispute
// @route   PUT /api/orders/:id/refund-reject
// @access  Private (Seller)
export const rejectRefundRequest = async (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = await Order.findById(req.params.id);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        // Check if user is a seller in this order OR is Admin
        const isSeller = order.orderItems.some(item => 
             item.seller && item.seller.toString() === req.user._id.toString()
        );
        const isAdmin = req.user.role === 'admin';

        if (!isSeller && !isAdmin) {
            res.status(401);
            throw new Error("Not authorized (Must be a seller in this order or Admin)");
        }

        if (order.escrowStatus !== 'ReturnRequested') {
            res.status(400);
            throw new Error("Order state must be 'ReturnRequested' to reject refund.");
        }

        order.escrowStatus = 'Disputed';
        // Append seller's/admin's rejection reason
        const actor = isAdmin ? "Admin" : "Seller";
        order.disputeReason = (order.disputeReason ? order.disputeReason + " | " : "") + `${actor} Rejected: ${reason || 'No reason provided'}`;

        const updatedOrder = await order.save();
        res.json(updatedOrder);

    } catch (error) {
        next(error);
    }
};

// @desc    Admin forces order completion (Releases funds)
// @route   PUT /api/orders/:id/force-complete
// @access  Private/Admin
export const forceComplete = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
            res.status(404);
            throw new Error("Order not found");
        }

        // Logic Release Funds (Copy from confirmReceipt)
        const sellerPayouts = new Map();
        const sellerFees = new Map();

        for (const item of order.orderItems) {
            if (item.seller) {
                const sellerId = item.seller.toString();
                const earnings = item.price * item.quantity;
                const fee = earnings * 0.02;

                sellerPayouts.set(sellerId, (sellerPayouts.get(sellerId) || 0) + earnings);
                sellerFees.set(sellerId, (sellerFees.get(sellerId) || 0) + fee);
            }
        }

        if (sellerPayouts.size > 0) {
            const sellerUpdateOps = [];
            const transactionCreateOps = [];
            for (const [sellerId, totalEarnings] of sellerPayouts.entries()) {
                const totalFee = sellerFees.get(sellerId) || 0;
                const netEarnings = totalEarnings - totalFee;

                sellerUpdateOps.push({
                    updateOne: {
                        filter: { _id: sellerId },
                        update: { $inc: { walletBalance: netEarnings } },
                    },
                });
                transactionCreateOps.push({
                    user: sellerId,
                    type: 'sale_income',
                    amount: netEarnings,
                    fee: totalFee,
                    status: 'completed',
                    relatedEntity: { id: order._id, model: 'Order' },
                    description: `Tiền bán sách từ đơn hàng ${order._id} (Admin FORCE COMPLETE - Trừ phí ${totalFee})`,
                });
            }
            await User.bulkWrite(sellerUpdateOps, { session });
            await Transaction.create(transactionCreateOps, { session });
        }

        order.escrowStatus = 'Released';
        order.status = 'Completed';
        
        const updatedOrder = await order.save({ session });
        await session.commitTransaction();
        res.json(updatedOrder);

    } catch (error) {
        await session.abortTransaction();
        next(error);
    } finally {
        session.endSession();
    }
};
