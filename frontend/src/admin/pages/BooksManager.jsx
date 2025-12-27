import React, { useState, useEffect } from "react";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency } from "../../shared/utils/formatters";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import "./BooksManager.css";

export default function BooksManager() {
  // State quản lý danh sách
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // State quản lý Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentBookId, setCurrentBookId] = useState(null);

  // State Form
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    category: "",
    price: "",
    oldPrice: "",
    stock: "", 
    publisher: "",
    description: "",
    cover: "", // Đường dẫn ảnh (string)
  });

  // State file ảnh (khi người dùng chọn file mới)
  const [selectedFile, setSelectedFile] = useState(null);

  // 1. FETCH BOOKS
  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Gọi API listBooks 
      const res = await apiClient.get(
        `/books?page=${page}&limit=10&sort=newest`
      );
      setBooks(res.items || []);
      setTotalPages(res.pagination?.totalPages || 1);
    } catch (err) {
      console.error("Lỗi tải sách:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page]);

  // 2. XỬ LÝ FORM
  const resetForm = () => {
    setFormData({
      title: "",
      author: "",
      category: "",
      price: "",
      oldPrice: "",
      stock: "",
      publisher: "",
      description: "",
      cover: "",
    });
    setSelectedFile(null);
    setIsEditing(false);
    setCurrentBookId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (book) => {
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      price: book.price,
      oldPrice: book.oldPrice || "",
      stock: book.stock || 0, // Fallback nếu DB cũ chưa có stock
      publisher: book.publisher || "",
      description: book.description || "",
      cover: book.cover || "",
    });
    setCurrentBookId(book._id);
    setIsEditing(true);
    setSelectedFile(null); // Reset file mới
    setShowModal(true);
  };

  // 3. XỬ LÝ UPLOAD ẢNH RIÊNG
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    // Lấy token để xác thực 
    const token = JSON.parse(localStorage.getItem("userData"))?.token;

    const response = await fetch("/api/uploads", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Nếu route upload cần protect
        // Không set Content-Type, để browser tự set boundary
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Lỗi upload ảnh");
    }

    const data = await response.json();
    return data.imagePath; // Trả về đường dẫn: /uploads/filename.jpg
  };

  // 4. SUBMIT FORM (CREATE / UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let coverPath = formData.cover;

      // Nếu có chọn file mới -> Upload trước
      if (selectedFile) {
        coverPath = await uploadImage(selectedFile);
      }

      // Chuẩn bị data gửi lên
      const payload = {
        ...formData,
        cover: coverPath,
        price: Number(formData.price),
        oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
        stock: Number(formData.stock),
      };

      if (isEditing) {
        await apiClient.put(`/books/${currentBookId}`, payload);
      } else {
        await apiClient.post("/books", payload);
      }

      // Thành công -> Đóng modal, reload list
      setShowModal(false);
      fetchBooks();
    } catch (err) {
      alert("Có lỗi xảy ra: " + err.message);
    }
  };

  // 5. DELETE BOOK
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sách này không?")) {
      try {
        await apiClient.delete(`/books/${id}`);
        fetchBooks();
      } catch (err) {
        alert("Xóa thất bại");
      }
    }
  };

  return (
    <div className="books-manager-container">
      <div className="page-header">
        <h2 className="page-title">Quản lý Sách</h2>
        <button className="btn-add-new" onClick={handleOpenAdd}>
          <FaPlus /> Thêm mới
        </button>
      </div>

      {/* DANH SÁCH SÁCH */}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên sách</th>
            <th>Tác giả</th>
            <th>Giá</th>
            <th>Kho</th>
            <th>Thể loại</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="7">Đang tải...</td>
            </tr>
          ) : (
            books.map((book) => (
              <tr key={book._id}>
                <td>
                  <img
                    src={book.cover}
                    alt=""
                    className="book-thumb"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/50x70")
                    }
                  />
                </td>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{formatCurrency(book.price)}</td>
                <td>{book.stock !== undefined ? book.stock : 0}</td>
                <td>{book.category}</td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleOpenEdit(book)}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(book._id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* PHÂN TRANG ĐƠN GIẢN */}
      <div
        className="pagination"
        style={{ marginTop: "20px", display: "flex", gap: "10px" }}
      >
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </button>
        <span>
          Trang {page} / {totalPages}
        </span>
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>

      {/* MODAL FORM */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "Chỉnh sửa sách" : "Thêm sách mới"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Tên sách</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Tác giả</label>
                    <input
                      type="text"
                      required
                      value={formData.author}
                      onChange={(e) =>
                        setFormData({ ...formData, author: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Thể loại (Mã)</label>
                    <select
                      required
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      <option value="">-- Chọn thể loại --</option>
                      <option value="business">Kinh doanh</option>
                      <option value="fiction">Viễn tưởng</option>
                      <option value="horror">Kinh dị</option>
                      <option value="skills">Kỹ năng</option>
                      {/* Thêm các option khác tùy DB */}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Nhà xuất bản</label>
                    <input
                      type="text"
                      value={formData.publisher}
                      onChange={(e) =>
                        setFormData({ ...formData, publisher: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Giá bán (VNĐ)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Giá gốc (để hiện Sale)</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.oldPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, oldPrice: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Tồn kho (Stock)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Ảnh bìa</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setSelectedFile(e.target.files[0])}
                    />
                    {formData.cover && !selectedFile && (
                      <div
                        style={{
                          marginTop: "5px",
                          fontSize: "12px",
                          color: "#718096",
                        }}
                      >
                        Ảnh hiện tại: {formData.cover}
                      </div>
                    )}
                  </div>

                  <div className="form-group full-width">
                    <label>Mô tả sách</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  {isEditing ? "Cập nhật" : "Lưu sách"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

