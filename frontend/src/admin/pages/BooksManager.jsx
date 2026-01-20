import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import apiClient from "../../shared/utils/apiClient";
import { formatCurrency } from "../../shared/utils/formatters";
import { FaPlus, FaEdit, FaTrash, FaTimes } from "react-icons/fa";
import { BOOK_CATEGORIES } from "../../shared/constants/categories";
import "./BooksManager.css";

export default function BooksManager() {
  // State quản lý danh sách
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();

  // State filter theo mode (B2C / C2C)
  const [bookMode, setBookMode] = useState("new"); // "new" = B2C, "used" = C2C

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

  // Tabs configuration
  const bookModeTabs = [
    { id: "new", label: "Sách của Shop (B2C)" },
    { id: "used", label: "Sách cũ của User (C2C)" },
  ];

  // 1. FETCH BOOKS
  const fetchBooks = async () => {
    try {
      setLoading(true);
      // Gọi API listBooks với mode filter
      const res = await apiClient.get(
        `/books?page=${page}&limit=10&sort=newest&includeOutOfStock=true&mode=${bookMode}`
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
    setPage(1); // Reset to page 1 when mode changes
  }, [bookMode]);

  useEffect(() => {
    fetchBooks();
  }, [page, bookMode]);

  // Handle URL "edit" query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const editId = params.get("edit");
    if (editId) {
      // Fetch specific book to edit
      apiClient.get(`/books/${editId}`)
        .then(book => {
             handleOpenEdit(book);
             // Optional: Clear param so modal doesn't reopen if closed
             navigate('/admin/books', { replace: true });
        })
        .catch(err => console.error("Could not load book to edit:", err));
    }
  }, [location.search]);

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

  // 2.5: GOOGLE BOOKS API AUTO-FILL
  const fetchGoogleBookInfo = async () => {
    if (!formData.title) {
        alert("Vui lòng nhập tên sách để tìm kiếm!");
        return;
    }

    try {
        setLoading(true); 
        // Fetch 10 results to have a good pool for filtering
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(formData.title)}&maxResults=10`);
        const data = await response.json();

        if (data.totalItems > 0 && data.items && data.items.length > 0) {
            // SMART SELECTION LOGIC:
            // 1. Filter for items that actually have a title
            const candidates = data.items.map(item => item.volumeInfo).filter(info => info.title);
            
            // 2. Score each candidate to find the best match
            // Score components:
            // - Language 'vi': +10 points
            // - Has Authors: +5 points
            // - Has Description: +3 points
            // - Has Image: +2 points
            // - Exact Title Match: +20 points
            
            const scoredCandidates = candidates.map(info => {
                let score = 0;
                if (info.language === 'vi') score += 10;
                if (info.authors && info.authors.length > 0) score += 5;
                if (info.description) score += 3;
                if (info.imageLinks) score += 2;
                if (info.title.toLowerCase().trim() === formData.title.toLowerCase().trim()) score += 20;
                return { info, score };
            });

            // Sort by score descending
            scoredCandidates.sort((a, b) => b.score - a.score);
            
            const bestBook = scoredCandidates[0].info;

            // Map Google data to our form
            setFormData(prev => ({
                ...prev,
                title: bestBook.title || prev.title, // Auto correct title casing
                author: bestBook.authors ? bestBook.authors.join(', ') : prev.author,
                publisher: bestBook.publisher || prev.publisher,
                description: bestBook.description || prev.description,
                category: bestBook.categories ? bestBook.categories[0] : prev.category, // Bonus
                cover: bestBook.imageLinks?.thumbnail || bestBook.imageLinks?.smallThumbnail || prev.cover,
            }));
            
            alert(`Đã tìm thấy: ${bestBook.title}\n(Tác giả: ${bestBook.authors ? bestBook.authors.join(', ') : 'N/A'})`);
        } else {
            alert("Không tìm thấy thông tin sách này trên Google Books.");
        }
    } catch (error) {
        console.error("Google Books API Error:", error);
        alert("Lỗi khi tìm kiếm sách.");
    } finally {
        setLoading(false);
    }
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
        {/* Only show Add button for Store books (B2C) */}
        {bookMode === "new" && (
          <button className="btn-add-new" onClick={handleOpenAdd}>
            <FaPlus /> Thêm mới
          </button>
        )}
      </div>

      {/* Tabs B2C / C2C */}
      <div className="order-tabs" style={{marginBottom: '20px'}}>
        {bookModeTabs.map(tab => (
          <button 
            key={tab.id} 
            className={`tab-item ${bookMode === tab.id ? 'active' : ''}`}
            onClick={() => setBookMode(tab.id)}
            style={{
              padding: '10px 20px',
              border: 'none',
              background: bookMode === tab.id ? '#4F46E5' : '#E5E7EB',
              color: bookMode === tab.id ? '#fff' : '#374151',
              cursor: 'pointer',
              borderRadius: '6px',
              marginRight: '10px',
              fontWeight: '500'
            }}
          >
            {tab.label}
          </button>
        ))}
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
            {bookMode === "used" && <th>Người bán</th>}
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={bookMode === "used" ? 8 : 7}>Đang tải...</td>
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
                <td>
                  <div className="book-title-cell" title={book.title}>
                    {book.title}
                  </div>
                </td>
                <td>{book.author}</td>
                <td>{formatCurrency(book.price)}</td>
                <td>{book.stock !== undefined ? book.stock : 0}</td>
                <td>{book.category}</td>
                {bookMode === "used" && <td>{book.owner?.name || "N/A"}</td>}
                <td className="action-cell">
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
        <div className="books-manager-modal-overlay">
          <div className="books-manager-modal-content">
            <div className="modal-header">
              <h3>{isEditing ? "Chỉnh sửa sách" : "Thêm sách mới"}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Tên sách</label>
                    <div style={{display: 'flex', gap: '10px'}}>
                        <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                            setFormData({ ...formData, title: e.target.value })
                        }
                        style={{flex: 1}}
                        placeholder="Nhập tên sách..."
                        />
                        <button 
                            type="button" 
                            onClick={fetchGoogleBookInfo}
                            className="btn-secondary"
                            style={{
                                padding: '8px 12px', 
                                backgroundColor: '#4F46E5', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '4px', 
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            🔍 Tìm trên Google
                        </button>
                    </div>
                    <p style={{fontSize: '0.8rem', color: '#6B7280', marginTop: '5px', fontStyle: 'italic'}}>
                        * Mẹo: Dữ liệu Google Books chuẩn nhất với <strong>sách Tiếng Anh</strong>. Nếu tìm sách Việt không ra, hãy thử nhập kèm tên Tác giả (VD: "Mắt biếc Nguyễn Nhật Ánh").
                    </p>
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
                      {BOOK_CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
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

