import mongoose from "mongoose";
import dotenv from "dotenv";
import Book from "../models/book.model.js";

// Load biến môi trường từ file .env
dotenv.config();

const updateStock = async () => {
  try {
    // 1. Kết nối Database
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // 2. Thực hiện Update
    // Logic: Tìm tất cả sách chưa có trường 'stock', set stock = 50
    const result = await Book.updateMany(
      { stock: { $exists: false } }, // Điều kiện: chưa có field stock
      { $set: { stock: 50 } } // Hành động: set stock thành 50
    );

    console.log("-----------------------------------");
    console.log(`✅ Đã tìm thấy và khớp: ${result.matchedCount} sách`);
    console.log(`✅ Đã cập nhật thành công: ${result.modifiedCount} sách`);
    console.log("-----------------------------------");
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  } finally {
    // 3. Ngắt kết nối và thoát
    await mongoose.disconnect();
    process.exit();
  }
};

updateStock();
