import React, { useState } from "react";
import * as booksService from "../../shared/utils/booksService";
import "./MyBooksForm.css";

const MyBooksForm = ({ book, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: book?.title || "",
    author: book?.author || "",
    description: book?.description || "",
    category: book?.category || "",
    price: book?.price || "",
    condition: book?.condition || "good",
    stock: book?.stock || 1,
  });
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend validation for new book image
    if (!book && (!files || files.length === 0)) {
      setError("Bạn phải tải lên ít nhất một hình ảnh.");
      return;
    }

    setIsSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    
    // The field name for multer on backend is 'cover'
    if (files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        data.append("cover", files[i]);
      }
    }

    try {
      if (book) {
        // Update
        await booksService.updateUserBook(book._id, data);
      } else {
        // Create
        await booksService.createUserBook(data);
      }
      onSuccess();
    } catch (err) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <form onSubmit={handleSubmit}>
          <h2>{book ? "Chỉnh sửa sách" : "Đăng bán sách mới"}</h2>
          
          {/* Form fields */}
          <div className="form-row">
            <div className="form-group">
                <label>Tiêu đề sách</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} required/>
            </div>
            <div className="form-group">
                <label>Tác giả</label>
                <input type="text" name="author" value={formData.author} onChange={handleChange} required/>
            </div>
          </div>
          
          <div className="form-group">
            <label>Mô tả</label>
            <textarea name="description" value={formData.description} onChange={handleChange}></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Thể loại</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} required/>
            </div>
             <div className="form-group">
                <label>Tình trạng sách</label>
                <select name="condition" value={formData.condition} onChange={handleChange}>
                    <option value="new">Mới</option>
                    <option value="like-new">Như mới</option>
                    <option value="good">Tốt</option>
                    <option value="fair">Khá</option>
                    <option value="poor">Cũ</option>
                </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
                <label>Giá (VNĐ)</label>
                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
            </div>
            <div className="form-group">
                <label>Số lượng</label>
                <input type="number" name="stock" value={formData.stock} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh (Tối đa 5 ảnh)</label>
            <input type="file" name="cover" onChange={handleFileChange} multiple accept="image/*" />
            <small>Giữ nguyên nếu bạn không muốn thay đổi ảnh.</small>
          </div>


          {error && <p className="error-message">{error}</p>}
          
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>Hủy</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu lại"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MyBooksForm;
