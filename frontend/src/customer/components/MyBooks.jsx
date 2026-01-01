import React, { useState, useEffect, useCallback } from "react";
import * as booksService from "../../shared/utils/booksService";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import "./MyBooks.css";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import MyBooksForm from "./MyBooksForm"; // A new component for the form
import { useProfileCheck } from "../../shared/hooks/useProfileCheck";

const MyBooks = () => {
  const checkProfile = useProfileCheck();
  const [myBooks, setMyBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const fetchMyBooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await booksService.listMyBooks();
      setMyBooks(data);
    } catch (err) {
      setError("Không thể tải sách của bạn.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMyBooks();
  }, [fetchMyBooks]);

  const handleOpenModalForCreate = () => {
    checkProfile(() => {
        setEditingBook(null);
        setIsModalOpen(true);
    });
  };

  const handleOpenModalForEdit = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBook(null);
  };

  const handleSuccess = () => {
    fetchMyBooks(); // Refetch books after create/update
    handleCloseModal();
  };

  const handleDelete = async (bookId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa cuốn sách này?")) {
      try {
        await booksService.deleteUserBook(bookId);
        setMyBooks(myBooks.filter(b => b._id !== bookId));
      } catch (err) {
        alert("Xóa sách thất bại: " + err.message);
      }
    }
  }

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div className="my-books-container">
      <div className="my-books-header">
        <h2>Sách của tôi</h2>
        <button className="btn-primary" onClick={handleOpenModalForCreate}>
          <FaPlus /> Đăng bán sách mới
        </button>
      </div>

      {isModalOpen && (
        <MyBooksForm 
          book={editingBook}
          onClose={handleCloseModal}
          onSuccess={handleSuccess}
        />
      )}

      <div className="my-books-list">
        {myBooks.length > 0 ? (
          myBooks.map((book) => (
            <div key={book._id} className="my-book-card">
              <img src={book.cover[0] || "/placeholder.png"} alt={book.title} />
              <div className="my-book-card-info">
                <h4>{book.title}</h4>
                <p>{book.author}</p>
                <p className="price">{formatCurrency(book.price)}</p>
                <p>Tình trạng: {book.condition}</p>
                <p>Kho: {book.stock}</p>
              </div>
              <div className="my-book-card-actions">
                <button onClick={() => handleOpenModalForEdit(book)}><FaEdit/></button>
                <button onClick={() => handleDelete(book._id)} className="btn-delete"><FaTrash/></button>
              </div>
            </div>
          ))
        ) : (
          <p>Bạn hiện không đăng bán cuốn sách nào.</p>
        )}
      </div>
    </div>
  );
};

export default MyBooks;

