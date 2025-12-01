import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Book from "../models/book.model.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";

import "dotenv/config";

const booksData = [
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "A Handbook of Agile Software Craftsmanship.",
    price: 205000,
    cover: "/images/books/1.jpg",
    publisher: "Nhà xuất bản Kim Đồng",
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    description: "Your Journey to Mastery, 20th Anniversary Edition.",
    price: 220000,
    cover: "/images/books/2.jpg",
  },
];

const usersData = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "123456",
    role: "customer",
  },
];
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("Database connected for seeding...");

    await Book.deleteMany({});
    console.log("Old book data cleared.");
    await User.deleteMany({});
    console.log("Old user data cleared.");
    await Cart.deleteMany({});
    console.log("Old cart data cleared.");

    await Book.insertMany(booksData);
    console.log("New book data has been seeded successfully!");

    for (const userData of usersData) {
      await User.create(userData);
    }
    console.log("New user data has been seeded successfully!");

    console.log("Database seeding completed.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Database connection closed.");
    process.exit(0);
  }
};

seedDatabase();