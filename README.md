# Bookstore E-Commerce

> Dự án đang trong quá trình phát triển

Ứng dụng web bán sách trực tuyến full-stack.

## Tech Stack

**Frontend:** React 19 + Vite + React Router  
**Backend:** Node.js + Express  
**Data:** In-memory storage (demo)

## Cài Đặt

### Backend

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Backend sẽ chạy tại `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend sẽ chạy tại `http://localhost:5173`

## Tính Năng

- Xem danh sách sách
- Xem chi tiết sách
- Pagination và sorting
- Responsive design

## Ghi Chú

- Dữ liệu lưu trong memory (sẽ mất khi restart server)
- Chưa có authentication
- Chưa có database
