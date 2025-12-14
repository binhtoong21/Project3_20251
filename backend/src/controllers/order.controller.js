import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;

    // 1. Lấy giỏ hàng từ DB (Bỏ .session(session))
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("No order items (Cart is empty)");
    }

    // 2. Tính toán giá tiền
    const itemsPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 100000 ? 0 : 30000;
    const totalPrice = itemsPrice + shippingPrice;

    // 3. Tạo Order mới
    const order = new Order({
      user: req.user._id,
      orderItems: cart.items,
      shippingAddress: shippingAddress,
      paymentMethod: paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    // 4. Lưu đơn hàng (Bỏ { session })
    const createdOrder = await order.save();

    // 5. Xóa giỏ hàng (Bỏ { session })
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
