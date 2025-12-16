import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Book from "../models/book.model.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    //  Đếm tổng số lượng
    const totalOrders = await Order.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();

    //  Tính tổng doanh thu (chỉ tính đơn không bị hủy)
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    //  Lấy dữ liệu doanh thu 7 ngày gần nhất
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 7)),
          },
          status: { $ne: "Cancelled" },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalPrice" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    //  Lấy 5 đơn hàng gần nhất
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    res.json({
      totalOrders,
      totalBooks,
      totalUsers,
      totalRevenue,
      dailyRevenue,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
