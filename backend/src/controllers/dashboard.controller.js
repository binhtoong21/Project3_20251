import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import Book from "../models/book.model.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    // 1. Basic Counts
    const totalOrders = await Order.countDocuments();
    const totalBooks = await Book.countDocuments();
    const totalUsers = await User.countDocuments();

    // 2. Total Revenue (Net - non-cancelled)
    const revenueData = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalRevenue: { $sum: "$totalPrice" } } },
    ]);
    const totalRevenue =
      revenueData.length > 0 ? revenueData[0].totalRevenue : 0;

    // 3. Daily Revenue (Last 7 Days)
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

    // 4. Top Selling Books (All time)
    const topSellingBooks = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $unwind: "$orderItems" },
      {
        $group: {
          _id: "$orderItems.book",
          totalSold: { $sum: "$orderItems.quantity" },
          revenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookInfo"
        }
      },
      { $unwind: "$bookInfo" },
      {
        $project: {
          _id: 1,
          title: "$bookInfo.title",
          cover: "$bookInfo.cover",
          totalSold: 1,
          revenue: 1
        }
      }
    ]);

    // 5. User Growth (Last 6 Months)
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
          }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 6. Low Stock Alert
    const lowStockBooks = await Book.find({ stock: { $lt: 10 } })
      .select('title stock cover')
      .limit(5);

    // 7. Recent Orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email");

    // 8. Category Performance
    const categoryStats = await Order.aggregate([
       { $match: { status: { $ne: "Cancelled" } } },
       { $unwind: "$orderItems" },
       {
         $lookup: {
            from: "books",
            localField: "orderItems.book",
            foreignField: "_id",
            as: "bookData"
         }
       },
       { $unwind: "$bookData" },
       {
         $group: {
            _id: "$bookData.category",
            revenue: { $sum: { $multiply: ["$orderItems.quantity", "$orderItems.price"] } },
            count: { $sum: "$orderItems.quantity" }
         }
       },
       { $sort: { revenue: -1 } },
       { $limit: 5 }
    ]);

    res.json({
      totalOrders,
      totalBooks,
      totalUsers,
      totalRevenue,
      dailyRevenue,
      recentOrders,
      topSellingBooks,
      userGrowth,
      categoryStats,
      lowStockBooks
    });
  } catch (error) {
    next(error);
  }
};
