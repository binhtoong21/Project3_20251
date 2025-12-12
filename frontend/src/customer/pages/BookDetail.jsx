import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBook, listBooks } from "../../shared/utils/booksService";
import { formatPrice } from "../../shared/utils/formatters";
import { useCartActions } from "../../shared/context/CartContext.jsx";
import BookSection from "../components/BookSection.jsx";
import "./page.css";
import "./BookDetail.css";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");
  const cartActions = useCartActions();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setBook(null);
    setRelatedBooks([]);

    const fetchBook = async () => {
      try {
        const data = await getBook(id);
        if (!mounted) return;
        setBook(data);
      } catch (err) {
        console.error("Failed to load book:", err);
        if (mounted) setError("Book not found");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBook();

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    if (!book || !book.category) return;

    let mounted = true;
    const fetchRelatedBooks = async () => {
      try {
        const { items } = await listBooks({
          category: book.category,
          limit: 5,
          sort: "newest",
        });
        if (mounted) {
          // --- SỬA LẠI DÒNG NÀY: đổi .id thành ._id ---
          const filteredBooks = items.filter((item) => item._id !== book._id);
          // --------------------------------------------
          setRelatedBooks(filteredBooks.slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load related books:", err);
      }
    };

    fetchRelatedBooks();
    return () => {
      mounted = false;
    };
  }, [book]);

  const handleAddToCart = async () => {
    if (!book || adding) return;
    try {
      setAdding(true);
      await cartActions.addItem(book._id, quantity);
      setFeedback("Added to cart");
      setTimeout(() => setFeedback(""), 2500);
    } catch (err) {
      console.error("Failed to add to cart", err);
      setFeedback("Failed to add to cart");
      setTimeout(() => setFeedback(""), 2500);
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container">Loading...</div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="page">
        <div className="container">{error || "Book not found"}</div>
      </div>
    );
  }

  const renderDescription = () => {
    if (!book.description) return null;
    const paragraphs = book.description
      .split("\n")
      .filter((p) => p.trim() !== "");
    return paragraphs.map((para, index) => <p key={index}>{para}</p>);
  };
  console.log("relatedBooks", relatedBooks);
  return (
    <div className="page">
      <div className="container">
        <div className="book-detail">
          <div className="detail-cover-wrapper">
            <img
              src={book.cover}
              alt={book.title}
              className="detail-cover"
              onError={(e) => {
                e.currentTarget.src = `https://via.placeholder.com/200x300?text=${encodeURIComponent(
                  book.title
                )}`;
              }}
            />
          </div>
          <div className="detail-body">
            <h2>{book.title}</h2>
            <p className="author">by {book.author}</p>
            <p className="price">{formatPrice(book.price)}</p>

            <div className="quantity-selector">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                -
              </button>
              <input type="number" value={quantity} readOnly />
              <button onClick={() => setQuantity((q) => q + 1)}>+</button>
            </div>

            <button
              className="btn primary"
              onClick={handleAddToCart}
              disabled={adding}
            >
              {adding ? "Adding..." : "Add to cart"}
            </button>
            {feedback && <p className="cart-feedback">{feedback}</p>}
          </div>
        </div>

        <div className="book-content-section">
          <h3>Giới thiệu sách</h3>
          <div className="book-description">{renderDescription()}</div>
        </div>

        <div className="book-content-section">
          <h3>Thông tin chi tiết</h3>
          <div className="detail-info-grid">
            <div className="info-label">Mã hàng</div>
            <div className="info-value">{book.id}</div>

            <div className="info-label">Nhà cung cấp</div>
            <div className="info-value">Đang cập nhật</div>

            <div className="info-label">Tác giả</div>
            <div className="info-value">{book.author}</div>

            <div className="info-label">Nhà xuất bản</div>
            <div className="info-value">
              {book.publisher || "Đang cập nhật"}
            </div>

            <div className="info-label">Năm xuất bản</div>
            <div className="info-value">Đang cập nhật</div>

            <div className="info-label">Trọng lượng</div>
            <div className="info-value">Đang cập nhật</div>

            <div className="info-label">Kích thước</div>
            <div className="info-value">Đang cập nhật</div>

            <div className="info-label">Số trang</div>
            <div className="info-value">Đang cập nhật</div>
          </div>
        </div>

        {relatedBooks.length > 0 && (
          <BookSection
            title="Sách liên quan"
            books={relatedBooks}
            link={`/books?category=${book.category}`}
          />
        )}
      </div>
    </div>
  );
}
