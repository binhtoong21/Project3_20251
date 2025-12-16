import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Book from "../models/book.model.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;

    //  Lấy giỏ hàng từ DB
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("No order items (Cart is empty)");
    }
    //  LOGIC TRỪ TỒN KHO
    //  Kiểm tra tồn kho cho TẤT CẢ sản phẩm trước
    const updateOperations = [];

    for (const item of cart.items) {
      const book = await Book.findById(item.book);
      if (!book) {
        res.status(400);
        throw new Error(`Sách "${item.title}" không còn tồn tại.`);
      }
      if (book.stock < item.quantity) {
        res.status(400);
        throw new Error(
          `Sách "${item.title}" không đủ số lượng tồn kho (Còn lại: ${book.stock}).`
        );
      }

      // Chuẩn bị lệnh update
      updateOperations.push({
        updateOne: {
          filter: { _id: item.book },
          update: { $inc: { stock: -item.quantity } },
        },
      });
    }

    //  Thực hiện trừ tồn kho hàng loạt
    if (updateOperations.length > 0) {
      await Book.bulkWrite(updateOperations);
    }

    //  Tính toán giá tiền
    const itemsPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 100000 ? 0 : 30000;
    const totalPrice = itemsPrice + shippingPrice;

    //  Tạo Order mới
    const order = new Order({
      user: req.user._id,
      orderItems: cart.items,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    //  Lưu đơn hàng
    const createdOrder = await order.save();

    //  Xóa giỏ hàng
    cart.items = [];
    await cart.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
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
        !req.user.isAdmin
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
