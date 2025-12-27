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
      mode, // new or used
    } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    //  1. Bộ lọc
    const filter = {};

    // Filter by mode
    if (mode === 'new') {
      filter.owner = null;
    } else if (mode === 'used') {
      filter.owner = { $ne: null };
    }

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
      .populate("owner", "name")
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

    const book = await Book.findById(id).populate("owner", "name").lean();
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    next(err);
  }
}

// [POST] /api/books (Admin only)
export async function create(req, res, next) {
  try {
    const newBook = new Book(req.body);
    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    next(err);
  }
}

// [PUT] /api/books/:id (Admin only)
export async function update(req, res, next) {
  try {
    const { id } = req.params;
    const updatedBook = await Book.findByIdAndUpdate(id, req.body, {
      new: true, // Trả về data mới sau khi update
      runValidators: true,
    });
    if (!updatedBook) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(updatedBook);
  } catch (err) {
    next(err);
  }
}

// [DELETE] /api/books/:id (Admin only)
export async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const book = await Book.findByIdAndDelete(id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json({ message: "Book removed successfully" });
  } catch (err) {
    next(err);
  }
}

// =================================================================
// USER C2C CONTROLLERS
// =================================================================

// [GET] /api/books/my-books (User only)
export async function getMyBooks(req, res, next) {
  try {
    const myBooks = await Book.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(myBooks);
  } catch (err) {
    next(err);
  }
}

// [POST] /api/books/user (User only)
export async function createUserBook(req, res, next) {
  try {
    const { title, author, description, category, price, condition, stock } = req.body;

    // Validate that at least one image is uploaded
    if (!req.files || req.files.length === 0) {
      res.status(400);
      throw new Error("Bạn phải tải lên ít nhất một hình ảnh.");
    }

    const newBook = new Book({
      title,
      author,
      description,
      category,
      price,
      condition,
      stock,
      owner: req.user._id, // Set the owner
      cover: req.files.map(file => `/uploads/${file.filename}`),
    });

    const savedBook = await newBook.save();
    res.status(201).json(savedBook);
  } catch (err) {
    next(err);
  }
}

// [PUT] /api/books/user/:id (User only)
export async function updateUserBook(req, res, next) {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user owns the book
    if (book.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "User not authorized to update this book" });
    }

    const { title, author, description, category, price, condition, stock } = req.body;

    book.title = title || book.title;
    book.author = author || book.author;
    book.description = description || book.description;
    book.category = category || book.category;
    book.price = price || book.price;
    book.condition = condition || book.condition;
    book.stock = stock || book.stock;

    if (req.files && req.files.length > 0) {
      book.cover = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedBook = await book.save();
    res.json(updatedBook);
  } catch (err) {
    next(err);
  }
}

// [DELETE] /api/books/user/:id (User only)
export async function deleteUserBook(req, res, next) {
  try {
    const { id } = req.params;
    
    // Atomically find a book matching the ID and the owner, and delete it.
    const book = await Book.findOneAndDelete({ _id: id, owner: req.user._id });

    if (!book) {
      // This will happen if the book doesn't exist OR the user is not the owner.
      // For security, we don't differentiate the error message.
      return res.status(404).json({ message: "Book not found or user not authorized" });
    }

    res.json({ message: "Book listing removed successfully" });
  } catch (err) {
    next(err);
  }
}
