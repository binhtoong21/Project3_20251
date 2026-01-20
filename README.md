# BookStore E-Commerce

Hệ thống thương mại điện tử bán sách trực tuyến, hỗ trợ cả mô hình **B2C** (cửa hàng bán sách mới) và **C2C** (Marketplace sách cũ của người dùng).

## Tech Stack

| Layer | Công nghệ |
|-------|-----------|
| **Frontend** | React 18, Vite, React Router v6 |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB (ReplicaSet) |
| **Auth** | JWT, bcryptjs |
| **Logistics** | Logistics Simulation Tool (External) |
| **External API** | Google Books API (Admin Auto-fill), Gmail SMTP |

## Tính Năng Chính

- 🛒 **Mua bán sách đa mô hình**
    - **B2C:** Mua sách mới trực tiếp từ cửa hàng.
    - **C2C:** Người dùng đăng bán sách cũ, set giá và quản lý đơn hàng.
- 💰 **Ví điện tử & Thanh toán** 
    - Nạp/Rút tiền vào ví.
    - Thanh toán qua ví với cơ chế **Escrow** (Giữ tiền chờ xác nhận).
- � **Vận chuyển & Logistics**
    - Tích hợp **Logistics Simulation Tool** (Công cụ giả lập) để mô phỏng quy trình vận chuyển thực tế (Pending -> Shipped -> Delivered).
    - Webhook cập nhật trạng thái đơn hàng tự động.
- 👤 **Xác thực & Bảo mật**
    - Đăng ký/Đăng nhập, xác thực email OTP.
    - Password Hashing (bcrypt), JWT Authentication.
- 🛡️ **Admin Panel**
    - Dashboard thống kê doanh thu.
    - Quản lý sách (Tích hợp **Google Books API** tự động điền thông tin sách).
    - Quản lý đơn hàng, người dùng.
    - Giải quyết khiếu nại (Dispute Resolution).

## Cài Đặt

### 1. Yêu Cầu
- Node.js v18+
- MongoDB v7+ (Môi trường Local)
- Git

### 2. Cấu hình MongoDB ReplicaSet (Bắt buộc cho Transaction)

Để tính năng Ví điện tử (Transaction) hoạt động, MongoDB cần chạy ở chế độ ReplicaSet.

**Bước 1:** Tạo thư mục data (nếu chưa có)
```bash
mkdir C:\data\db
```

**Bước 2:** Chạy MongoDB với tham số `--replSet`
```bash
mongod --replSet rs0 --dbpath "C:\data\db"
```

**Bước 3:** Khởi tạo ReplicaSet (Mở terminal mới)
```bash
mongosh
rs.initiate()
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Tạo file `.env` trong thư mục `backend`:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bookstore?replicaSet=rs0
JWT_SECRET=your_super_secret_key_123
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
```

Chạy server:
```bash
npm run dev
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 5. Truy Cập

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

## Quy Trình Logistics (Simulation)

1.  **Đặt hàng:** Đơn hàng được tạo với trạng thái logistics `Pending`.
2.  **Duyệt đơn (Shipping):** Hệ thống gọi sang Logistics Tool để tạo vận đơn -> Trạng thái đơn hàng chuyển sang `Shipped`.
3.  **Mô phỏng vận chuyển:** Logistics Tool tự động cập nhật trạng thái (PickedUp -> InTransit -> Delivered) sau một khoảng thời gian.
4.  **Hoàn tất:** Webhook từ Tool gọi về cập nhật đơn hàng thành `Delivered` -> User xác nhận -> Tiền được chuyển cho người bán.

## Phân Quyền

| Role | Quyền hạn |
|------|-----------|
| **Guest** | Xem sách, tìm kiếm, xem chi tiết. |
| **Customer** | Mua sách, Quản lý ví cá nhân, Đăng bán sách cũ (Marketplace), Theo dõi đơn hàng. |
| **Admin** | Quản lý toàn bộ: Sách Store, User, Đơn hàng, Giải quyết khiếu nại, Cài đặt hệ thống. |
