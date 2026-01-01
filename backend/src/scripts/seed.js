import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Book from "../models/book.model.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Transaction from "../models/transaction.model.js";
import "dotenv/config";

const clearDatabase = async () => {
  console.log("🔥 Clearing database...");
  await Order.deleteMany({});
  await Book.deleteMany({});
  await User.deleteMany({});
  await Cart.deleteMany({});
  await Transaction.deleteMany({});
  console.log("🗑️  Database cleared.");
};

const seedUsers = async () => {
  console.log("🌱 Seeding users...");
  const usersData = [
    {
      name: "Alice Admin",
      email: "admin@example.com",
      password: "binhtong",
      role: "admin",
      phone: "0912345678",
      walletBalance: 1000000,
      avatar: "/images/logo/logo.jpg", // Static path
      address: {
        province: "Thành phố Hà Nội",
        district: "Quận Ba Đình",
        ward: "Phường Phúc Xá",
        street: "1A P. Hàng Đậu",
      },
    }
  ];
  const users = await Promise.all(usersData.map(user => User.create(user)));
  console.log(`✨ ${users.length} users seeded.`);
  return users;
};






const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    // const books = await seedBooks(users);
    // await seedTransactions(users);

    console.log("✅ Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Database connection closed.");
    process.exit(0);
  }
};

seedDatabase();
