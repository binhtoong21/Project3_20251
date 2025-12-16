import express from "express";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// Route xử lý upload 1 file ảnh có field name là 'image'
router.post("/", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "Vui lòng chọn 1 file ảnh." });
  }
  // Nếu upload thành công, trả về đường dẫn của file
  // Đường dẫn này sẽ được lưu vào trường 'cover' của sách
  res.status(201).send({
    message: "Ảnh đã được upload thành công!",
    // trả về đường dẫn để frontend sử dụng
    imagePath: `/uploads/${req.file.filename}`,
  });
});

export default router;
