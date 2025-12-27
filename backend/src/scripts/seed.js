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
      password: "123456",
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
    },
    {
      name: "Bob Customer",
      email: "bob@example.com",
      password: "123456",
      role: "customer",
      phone: "0987654321",
      walletBalance: 500000,
      avatar: "/images/logo/logo.jpg", // Static path
      address: {
        province: "Thành phố Hồ Chí Minh",
        district: "Quận 1",
        ward: "Phường Bến Nghé",
        street: "42 Nguyễn Huệ",
      },
    },
    {
      name: "Charlie Seller",
      email: "charlie@example.com",
      password: "123456",
      role: "customer",
      phone: "0905123789",
      walletBalance: 250000,
      avatar: "/images/logo/logo.jpg", // Static path
      address: {
        province: "Thành phố Đà Nẵng",
        district: "Quận Hải Châu",
        ward: "Phường Thạch Thang",
        street: "18 Bạch Đằng",
      },
    },
    {
      name: "Diana Reviewer",
      email: "diana@example.com",
      password: "123456",
      role: "customer",
      phone: "0935111222",
      walletBalance: 0,
      avatar: "/images/logo/logo.jpg", // Static path
      address: {
        province: "Tỉnh Cần Thơ",
        district: "Quận Ninh Kiều",
        ward: "Phường Tân An",
        street: "Bến Ninh Kiều",
      },
    },
  ];
  const users = await Promise.all(usersData.map(user => User.create(user)));
  console.log(`✨ ${users.length} users seeded.`);
  return users;
};

const seedBooks = async (users) => {
  console.log("📚 Seeding books...");

  const bob = users.find(u => u.email === 'bob@example.com');
  const charlie = users.find(u => u.email === 'charlie@example.com');

  const booksData = [
    {
      title: "The Silent Patient",
      author: "Alex Michaelides",
      description: "A shocking psychological thriller of a woman's act of violence against her husband—and of the therapist obsessed with uncovering her motive.",
      price: 175000,
      oldPrice: 220000,
      category: "Thriller",
      cover: ["/images/books/1.jpg"],
      stock: 50,
      trending: true,
    },
    {
      title: "Dune",
      author: "Frank Herbert",
      description: "Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the “spice” melange, a drug capable of extending life and enhancing consciousness.",
      price: 230000,
      category: "Sci-Fi",
      cover: ["/images/books/2.jpg"],
      stock: 30,
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        description: "An easy and proven way to build good habits and break bad ones. Tiny changes, remarkable results.",
        price: 190000,
        category: "Self-Help",
        cover: ["/images/books/3.jpg"],
        stock: 100,
        trending: true,
    },
    {
        title: "The Psychology of Money",
        author: "Morgan Housel",
        description: "Timeless lessons on wealth, greed, and happiness. Doing well with money isn’t necessarily about what you know. It’s about how you behave. And behavior is hard to teach, even to really smart people.",
        price: 185000,
        oldPrice: 210000,
        category: "Business",
        cover: ["/images/books/4.jpg"],
        stock: 75,
    },
    {
      title: "Project Hail Mary",
      author: "Andy Weir",
      description: "A lone astronaut must save the earth from disaster in this incredible new science-based thriller from the #1 New York Times bestselling author of The Martian.",
      price: 250000,
      category: "Sci-Fi",
      cover: ["/images/books/5.jpg"],
      stock: 40,
    },
    {
      title: "Nhà Giả Kim (The Alchemist)",
      author: "Paulo Coelho",
      description: "Sách cũ, bìa mềm, còn khá mới. Nội dung về hành trình của cậu chăn cừu Santiago đi tìm kho báu.",
      price: 50000,
      category: "Fiction",
      cover: ["/images/books/6.jpg"],
      stock: 1,
      owner: bob._id,
      condition: 'good',
    },
    {
        title: "Đắc Nhân Tâm",
        author: "Dale Carnegie",
        description: "Bản in cũ, giấy đã hơi ngả vàng nhưng đọc tốt. Kinh điển về nghệ thuật giao tiếp.",
        price: 35000,
        category: "Self-Help",
        cover: ["/images/books/7.jpg"],
        stock: 1,
        owner: charlie._id,
        condition: 'fair',
    },
    {
        title: "Clean Code",
        author: "Robert C. Martin",
        description: "Sách như mới, mới đọc qua 1 lần. Rất cần thiết cho các bạn developer.",
        price: 250000,
        category: "Technology",
        cover: ["/images/books/8.jpg"],
        stock: 1,
        owner: bob._id,
        condition: 'like-new',
    },
  ];
  const books = await Book.insertMany(booksData);
  console.log(`✨ ${books.length} books seeded.`);
  return books;
}

const seedTransactions = async (users) => {
    console.log("💸 Seeding transactions...");
    const bob = users.find(u => u.email === 'bob@example.com');
    const charlie = users.find(u => u.email === 'charlie@example.com');

    const transactionsData = [
        { user: bob._id, type: 'deposit', amount: 500000, status: 'completed', description: "Nạp tiền ban đầu" },
        { user: charlie._id, type: 'deposit', amount: 300000, status: 'completed', description: "Nạp tiền ban đầu" },
        { user: charlie._id, type: 'deposit', amount: 50000, status: 'pending', description: "Yêu cầu nạp thêm" },
    ];
    await Transaction.insertMany(transactionsData);
    console.log(`✨ ${transactionsData.length} transactions seeded.`);
}


const seedDatabase = async () => {
  try {
    await connectDB();
    await clearDatabase();
    
    const users = await seedUsers();
    const books = await seedBooks(users);
    await seedTransactions(users);

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
