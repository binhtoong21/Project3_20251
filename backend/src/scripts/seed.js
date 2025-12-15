import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Book from "../models/book.model.js";
import Cart from "../models/cart.model.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";

import "dotenv/config";

// Dữ liệu sách đa dạng để test Lọc & Sắp xếp
const booksData = [
  //  Thể loại: Kinh doanh (business)
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    description: "Cuốn sách gối đầu giường cho mọi lập trình viên.",
    price: 350000,
    oldPrice: 450000, // Đang giảm giá
    category: "business",
    cover: "/images/books/1.jpg",
    publisher: "Prentice Hall",
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    description: "Những bài học về khởi nghiệp xây dựng tương lai.",
    price: 120000,
    oldPrice: null,
    category: "business",
    cover: "/images/books/2.jpg",
    publisher: "NXB Trẻ",
  },

  //  Thể loại: Kinh dị (horror)
  {
    title: "IT (Gã Hề Ma Quái)",
    author: "Stephen King",
    description: "Nỗi ám ảnh kinh hoàng tại thị trấn Derry.",
    price: 250000,
    category: "horror",
    oldPrice: 300000, // Đang giảm giá
    cover: "/images/books/3.jpg",
    publisher: "NXB Văn Học",
  },
  {
    title: "The Shining",
    author: "Stephen King",
    description: "Khách sạn ma ám và sự điên loạn.",
    price: 180000,
    oldPrice: null,
    category: "horror",
    cover: "/images/books/4.jpg",
    publisher: "Doubleday",
  },

  //  Thể loại: Viễn tưởng (fiction)
  {
    title: "Dune (Hành Tinh Cát)",
    author: "Frank Herbert",
    description: "Kiệt tác khoa học viễn tưởng vĩ đại nhất.",
    price: 220000,
    oldPrice: null,
    category: "fiction",
    cover: "/images/books/5.jpg",
    publisher: "Chilton Books",
  },
  {
    title: "Harry Potter 1",
    author: "J.K. Rowling",
    description: "Cậu bé phù thủy và hòn đá phù thủy.",
    price: 150000,
    oldPrice: 200000, // Đang giảm giá
    category: "fiction",
    cover: "/images/books/6.jpg",
    publisher: "NXB Trẻ",
  },

  //  Thể loại: Kỹ năng (skills)
  {
    title: "Đắc Nhân Tâm",
    author: "Dale Carnegie",
    description: "Nghệ thuật thu phục lòng người.",
    price: 80000,
    oldPrice: null,
    category: "skills",
    cover: "/images/books/7.jpg",
    publisher: "First News",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    description: "Xây dựng thói quen tốt, bỏ thói quen xấu.",
    price: 190000,
    oldPrice: 190000, // Giá cũ bằng giá mới (coi như không giảm)
    category: "skills",
    cover: "/images/books/8.jpg",
    publisher: "Penguin",
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    description: "Quy tắc để thành công trong thế giới phân tâm.",
    price: 210000,
    oldPrice: 250000,
    category: "business",
    cover: "/images/books/9.jpg",
    publisher: "NXB Thế Giới",
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    description: "Tiểu thuyết tâm lý tội phạm gây sốt toàn cầu.",
    price: 175000,
    oldPrice: null,
    category: "horror",
    cover: "/images/books/10.jpg",
    publisher: "NXB Văn Học",
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    description: "Hành trình giải cứu Trái Đất từ không gian sâu thẳm.",
    price: 230000,
    oldPrice: 280000,
    category: "fiction",
    cover: "/images/books/11.jpg",
    publisher: "NXB Kim Đồng",
  },
  {
    title: "Tư Duy Nhanh Và Chậm",
    author: "Daniel Kahneman",
    description: "Khám phá hai hệ thống tư duy của con người.",
    price: 195000,
    oldPrice: 220000,
    category: "skills",
    cover: "/images/books/12.jpg",
    publisher: "NXB Thế Giới",
  },
  {
    title: "Đại Dương Đen",
    author: "Nguyễn Ngọc Tư",
    description: "Tiểu thuyết về bi kịch gia đình và tình yêu.",
    price: 120000,
    oldPrice: null,
    category: "fiction",
    cover: "/images/books/13.jpg",
    publisher: "NXB Trẻ",
  },
  {
    title: "Nhà Giả Kim",
    author: "Paulo Coelho",
    description: "Hành trình tìm kiếm kho báu và ý nghĩa cuộc sống.",
    price: 95000,
    oldPrice: 120000,
    category: "fiction",
    cover: "/images/books/14.jpg",
    publisher: "NXB Văn Học",
  },
  {
    title: "Tôi Tài Giỏi, Bạn Cũng Thế!",
    author: "Adam Khoo",
    description: "Phương pháp học tập hiệu quả cho mọi lứa tuổi.",
    price: 110000,
    oldPrice: null,
    category: "skills",
    cover: "/images/books/15.jpg",
    publisher: "NXB Phụ Nữ",
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    description: "Những bài học bất hủ về quản lý tiền bạc.",
    price: 185000,
    oldPrice: 220000,
    category: "business",
    cover: "/images/books/16.jpg",
    publisher: "Harriman House",
  },
  {
    title: "Cây Cam Ngọt Của Tôi",
    author: "José Mauro de Vasconcelos",
    description: "Câu chuyện cảm động về tuổi thơ và sự trưởng thành.",
    price: 88000,
    oldPrice: 110000,
    category: "fiction",
    cover: "/images/books/17.jpg",
    publisher: "NXB Văn Học",
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    description: "Thư viện nửa đêm nơi mỗi cuốn sách là một cuộc đời khác.",
    price: 198000,
    oldPrice: null,
    category: "fiction",
    cover: "/images/books/18.jpg",
    publisher: "Canongate Books",
  },
  {
    title: "Tư Duy Lại Tư Duy",
    author: "Edward de Bono",
    description: "Phương pháp tư duy sáng tạo và hiệu quả.",
    price: 145000,
    oldPrice: 175000,
    category: "skills",
    cover: "/images/books/19.jpg",
    publisher: "NXB Trẻ",
  },
  {
    title: "The Exorcist",
    author: "William Peter Blatty",
    description: "Tiểu thuyết kinh dị kinh điển về hiện tượng bị quỷ ám.",
    price: 165000,
    oldPrice: 200000,
    category: "horror",
    cover: "/images/books/20.jpg",
    publisher: "Harper & Row",
  },
  {
    title: "Đắc Nhân Tâm (Bản Đặc Biệt)",
    author: "Dale Carnegie",
    description: "Phiên bản đặc biệt kỷ niệm 75 năm phát hành.",
    price: 150000,
    oldPrice: 180000,
    category: "skills",
    cover: "/images/books/21.jpg",
    publisher: "First News",
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    description: "Hành trình bất ngờ của chàng Hobbit Bilbo Baggins.",
    price: 175000,
    oldPrice: null,
    category: "fiction",
    cover: "/images/books/22.jpg",
    publisher: "George Allen & Unwin",
  },
  {
    title: "Tôi Là Một Con Lừa",
    author: "Nguyễn Phương Mai",
    description: "Hành trình khám phá bản thân và thế giới.",
    price: 125000,
    oldPrice: 150000,
    category: "skills",
    cover: "/images/books/23.jpg",
    publisher: "NXB Hội Nhà Văn",
  },
];

const usersData = [
  {
    name: "Admin User",
    email: "admin@example.com",
    password: "123456",
    role: "admin",
    phone: "",
    address: {
      province: "",
      district: "",
      ward: "",
      street: "",
    },
  },
  {
    name: "John Doe",
    email: "john@example.com",
    password: "123456",
    role: "customer",
    phone: "0987654321",
    address: {
      province: "Thành phố Hồ Chí Minh",
      district: "Quận 1",
      ward: "Phường Bến Nghé",
      street: "123 Đường ABC",
    },
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log("🌱 Database connected for seeding...");

    // Xóa dữ liệu cũ
    await Order.deleteMany({});
    await Book.deleteMany({});
    await User.deleteMany({});
    await Cart.deleteMany({});
    console.log("🗑️  Old data cleared.");

    // Thêm dữ liệu sách
    const createdBooks = await Book.insertMany(booksData);
    console.log(`✨ Added ${createdBooks.length} books successfully!`);

    // Thêm dữ liệu người dùng
    const createdUsers = await User.create(usersData);
    console.log(`✨ Added ${createdUsers.length} users successfully!`);

    // Lấy ID của admin và customer user
    const adminUser = createdUsers.find((u) => u.role === "admin");
    const customerUser = createdUsers.find((u) => u.role === "customer");

    // Tạo dữ liệu đơn hàng mẫu
    if (customerUser && createdBooks.length >= 2) {
      const ordersData = [
        {
          user: customerUser._id,
          orderItems: [
            {
              book: createdBooks[0]._id,
              title: createdBooks[0].title,
              quantity: 1,
              price: createdBooks[0].price,
              cover: createdBooks[0].cover,
            },
            {
              book: createdBooks[1]._id,
              title: createdBooks[1].title,
              quantity: 2,
              price: createdBooks[1].price,
              cover: createdBooks[1].cover,
            },
          ],
          shippingAddress: {
            name: customerUser.name,
            phone: customerUser.phone,
            ...customerUser.address,
          },
          paymentMethod: "COD",
          itemsPrice:
            createdBooks[0].price * 1 + createdBooks[1].price * 2,
          shippingPrice: 30000,
          totalPrice:
            createdBooks[0].price * 1 + createdBooks[1].price * 2 + 30000,
          status: "Processing",
        },
        // Thêm một đơn hàng khác
        {
          user: customerUser._id,
          orderItems: [
            {
              book: createdBooks[2]._id,
              title: createdBooks[2].title,
              quantity: 1,
              price: createdBooks[2].price,
              cover: createdBooks[2].cover,
            },
          ],
          shippingAddress: {
            name: "Người nhận khác",
            phone: "0123456789",
            province: "Thành phố Hà Nội",
            district: "Quận Hoàn Kiếm",
            ward: "Phường Hàng Trống",
            street: "456 Phố XYZ",
          },
          paymentMethod: "Banking",
          itemsPrice: createdBooks[2].price * 1,
          shippingPrice: 35000,
          totalPrice: createdBooks[2].price * 1 + 35000,
          isPaid: true,
          paidAt: new Date(),
          status: "Shipped",
        },
      ];

      await Order.insertMany(ordersData);
      console.log(`✨ Added ${ordersData.length} orders successfully!`);
    }

    console.log("✅ Database seeding completed.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Database connection closed.");
    process.exit(0);
  }
};

seedDatabase();
