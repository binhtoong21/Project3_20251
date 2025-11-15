import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Book from '../models/book.model.js';

// Tải biến môi trường từ file .env
import 'dotenv/config';

const booksData = [
  {
    title: 'Clean Code',
    author: 'Robert C. Martin',
    description: 'A Handbook of Agile Software Craftsmanship.',
    price: 205000,
    cover: '/images/books/1.jpg',
    publisher: 'Nhà xuất bản Kim Đồng',
  },
  {
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    description: 'Your Journey to Mastery, 20th Anniversary Edition.',
    price: 220000,
    cover: '/images/books/2.jpg',
  },
  {
    title: 'Refactoring',
    author: 'Martin Fowler',
    description: 'Improving the Design of Existing Code.',
    price: 250000,
    cover: '/images/books/3.jpg',
  },
  {
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    description: 'Classic American novel.',
    price: 99000,
    cover: '/images/books/4.jpg',
  },
  {
    title: 'Atomic Habits',
    author: 'James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones.',
    price: 150000,
    cover: '/images/books/5.jpg',
  },
  {
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    description: 'A lone astronaut must save the earth from disaster.',
    price: 180000,
    cover: '/images/books/6.jpg',
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Database connected for seeding...');

    // Xóa dữ liệu sách cũ
    await Book.deleteMany({});
    console.log('Old book data cleared.');

    // Chèn dữ liệu mới
    await Book.insertMany(booksData);
    console.log('New book data has been seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    // Đóng kết nối
    await mongoose.disconnect();
    console.log('Database connection closed.');
    process.exit(0);
  }
};

seedDatabase();
