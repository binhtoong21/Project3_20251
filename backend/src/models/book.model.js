import mongoose from "mongoose";

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, trim: true },

    category: { type: String, required: true, trim: true, index: true },

    price: { type: Number, required: true, min: 0 },

    // Nâng cấp: Thêm giá cũ để làm tính năng "On Sale"
    // Logic: Nếu oldPrice > price nghĩa là đang giảm giá
    oldPrice: { type: Number, min: 0, default: null },

    cover: [{ type: String }], // Thay đổi: cho phép lưu nhiều ảnh
    publisher: { type: String, trim: true },

    // Tùy chọn: Thêm trending để làm mục "Sách bán chạy"
    trending: { type: Boolean, default: false },
    
    stock: { type: Number, required: true, min: 0, default: 0 },

    // MỞ RỘNG CHO CHỨC NĂNG C2C
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // ID người bán. Nếu là null -> sách của cửa hàng
    condition: { type: String, enum: ['new', 'like-new', 'good', 'fair', 'poor'], default: 'new' }, // Tình trạng sách
    isPromoted: { type: Boolean, default: false }, // Dùng để đẩy bài đăng bán sách lên top
  },
  {
    timestamps: true,
  }
);

// Index text để tìm kiếm tiêu đề và mô tả
bookSchema.index({ title: "text", author: "text" });

const Book = mongoose.model("Book", bookSchema);

export default Book;
