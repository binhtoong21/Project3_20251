import mongoose from "mongoose";
import Book from "../models/book.model.js";

export async function list(req, res, next) {
  try {
    const {
      page = "1",
      limit = "10",
      sort,
      category,
      search,
      minPrice,
      maxPrice,
      sale,
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    //  1. Bộ lọc
    const filter = {};

    // Tìm kiếm
    if (search) {
      // Dùng Regex để tìm kiếm tương đối (chứa từ khóa là được)
      filter.$or = [
        // Tìm trong tiêu đề (title), $options: 'i': không phân biệt hoa thường
        { title: { $regex: search, $options: "i" } },
        // Tìm luôn cả trong tên tác giả
        { author: { $regex: search, $options: "i" } },
      ];
    }

    // Lọc theo thể loại
    if (category) {
      filter.category = category;
    }

    // Lọc theo khoảng giá
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    // Lọc sách đang giảm giá (nếu có oldPrice và oldPrice > price)
    if (sale === "true") {
      filter.oldPrice = { $exists: true, $ne: null };
      filter.$expr = { $gt: ["$oldPrice", "$price"] };
    }

    //  2. Sắp xếp
    // Quy ước từ Frontend gửi lên: 'price_asc', 'price_desc', 'a_z', 'z_a', 'newest'
    let sortOptions = {};

    switch (sort) {
      case "price_asc": // Giá tăng dần
        sortOptions = { price: 1 };
        break;
      case "price_desc": // Giá giảm dần
        sortOptions = { price: -1 };
        break;
      case "a_z": // Tên A->Z
        sortOptions = { title: 1 };
        break;
      case "z_a": // Tên Z->A
        sortOptions = { title: -1 };
        break;
      case "newest": // Mới nhất
        sortOptions = { createdAt: -1 };
        break;
      case "oldest": // Cũ nhất
        sortOptions = { createdAt: 1 };
        break;
      default:
        // Mặc định: Mới nhất trước
        sortOptions = { createdAt: -1 };
    }

    //  3. Thực thi Query
    const total = await Book.countDocuments(filter);
    const items = await Book.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.json({
      items,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid book ID format" });
    }

    const book = await Book.findById(id).lean();
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    next(err);
  }
}
