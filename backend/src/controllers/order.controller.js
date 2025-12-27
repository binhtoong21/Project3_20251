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
  const { paymentMethod, shippingAddress } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const cart = await Cart.findOne({ user: req.user._id }).session(session);

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("No order items (Cart is empty)");
    }

    const itemsPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 100000 ? 0 : 30000;
    const totalPrice = itemsPrice + shippingPrice;

    // --- Wallet Payment Logic ---
    if (paymentMethod === "wallet") {
      const user = await User.findById(req.user._id).session(session);
      if (user.walletBalance < totalPrice) {
        res.status(400);
        throw new Error("Số dư ví không đủ để thực hiện thanh toán.");
      }
      user.walletBalance -= totalPrice;
      await user.save({ session });
    }
    
    // --- Prepare Order Items and Check Stock ---
    const bookIds = cart.items.map(item => item.book);
    const books = await Book.find({ '_id': { $in: bookIds } }).session(session).lean();
    
    const bookMap = books.reduce((map, book) => {
      map[book._id.toString()] = book;
      return map;
    }, {});

    const updateOps = [];
    const orderItemsWithSeller = cart.items.map(item => {
      const book = bookMap[item.book.toString()];
      if (!book) {
        throw new Error(`Sách "${item.title}" không tồn tại hoặc đã bị xóa.`);
      }
      if (book.stock < item.quantity) {
        throw new Error(`Sách "${item.title}" không đủ tồn kho (Chỉ còn: ${book.stock}).`);
      }
      
      updateOps.push({
        updateOne: {
          filter: { _id: item.book },
          update: { $inc: { stock: -item.quantity } },
        },
      });

      return {
        book: item.book,
        title: item.title,
        quantity: item.quantity,
        price: item.price,
        cover: item.cover,
        seller: book.owner, // <-- Key change: Assign the book's owner as the seller
      };
    });

    if (updateOps.length > 0) {
      await Book.bulkWrite(updateOps, { session });
    }
    
    // --- Order Creation ---
    const order = new Order({
      user: req.user._id,
      orderItems: orderItemsWithSeller, // Use the new array with seller info
      shippingAddress,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentMethod === "wallet",
      paidAt: paymentMethod === "wallet" ? Date.now() : null,
    });
    const createdOrder = await order.save({ session });

    // --- Transaction Record & Payouts for Wallet Payment ---
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

      // C2C Seller Payout Logic
      const sellerPayouts = new Map();
      for (const item of createdOrder.orderItems) {
        if (item.seller) {
          const sellerId = item.seller.toString();
          const earnings = item.price * item.quantity;
          sellerPayouts.set(sellerId, (sellerPayouts.get(sellerId) || 0) + earnings);
        }
      }

      const transactionCreateOps = [buyerTransaction];
      if (sellerPayouts.size > 0) {
        const sellerUpdateOps = [];
        for (const [sellerId, amount] of sellerPayouts.entries()) {
          sellerUpdateOps.push({
            updateOne: {
              filter: { _id: sellerId },
              update: { $inc: { walletBalance: amount } },
            },
          });
          transactionCreateOps.push({
            user: sellerId,
            type: 'sale_income',
            amount: amount,
            status: 'completed',
            relatedEntity: { id: createdOrder._id, model: 'Order' },
            description: `Tiền bán sách từ đơn hàng ${createdOrder._id}`,
          });
        }
        await User.bulkWrite(sellerUpdateOps, { session });
      }
      await Transaction.create(transactionCreateOps, { session });
    }

    // --- Clear Cart ---
    cart.items = [];
    await cart.save({ session });

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
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );

    if (order) {
      // Kiểm tra quyền xem đơn hàng (chính chủ hoặc admin)
      if (
        order.user._id.toString() !== req.user._id.toString() &&
        req.user.role !== 'admin'
      ) {
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

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = status;

      // Nếu chuyển sang Delivered thì cập nhật luôn thời gian giao
      if (status === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = Date.now();
      }

      // Nếu trạng thái là Paid
      if (status === "Processing" || status === "Shipped") {
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all items a user has sold
// @route   GET /api/orders/my-sales
// @access  Private
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
