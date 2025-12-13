import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const { paymentMethod, shippingAddress } = req.body;

    // 1. Lấy giỏ hàng của user từ DB để đảm bảo dữ liệu chính xác (không tin tưởng hoàn toàn dữ liệu từ frontend gửi lên)
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart || cart.items.length === 0) {
      res.status(400);
      throw new Error("No order items (Cart is empty)");
    }

    // 2. Tính toán lại giá tiền tại server
    const itemsPrice = cart.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const shippingPrice = itemsPrice > 100000 ? 0 : 30000; // Ví dụ: free ship cho đơn > 100k
    const totalPrice = itemsPrice + shippingPrice;

    // 3. Tạo Order mới
    const order = new Order({
      user: req.user._id,
      orderItems: cart.items, // Copy items từ Cart sang Order
      shippingAddress: shippingAddress, // Địa chỉ từ frontend gửi lên (đã lấy từ user profile)
      paymentMethod: paymentMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();

    // 4. Xóa items trong Cart sau khi đặt hàng thành công
    cart.items = [];
    await cart.save();

    res.status(201).json(createdOrder);
  } catch (error) {
    next(error);
  }
};
