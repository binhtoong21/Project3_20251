import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaCartPlus, FaBolt } from "react-icons/fa";
import { getBook, listBooks } from "../../shared/utils/booksService";
import { formatCurrency, formatDate } from "../../shared/utils/formatters";
import { useCartActions } from "../../shared/context/CartContext.jsx";
import { useAuth } from "../../shared/context/AuthContext.jsx";
import { useProfileCheck } from "../../shared/hooks/useProfileCheck";
import apiClient from "../../shared/utils/apiClient";
import BookSection from "../components/BookSection.jsx";
import "./page.css";
import "./BookDetail.css";

export default function BookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState(null);
  const [relatedBooks, setRelatedBooks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const cartActions = useCartActions();
  const { user } = useAuth();
  const checkProfile = useProfileCheck();

  const stock = book?.stock ?? 0;
  const isOutOfStock = stock === 0;
  const isOwner = user && book && book.owner && (book.owner === user._id || book.owner._id === user._id);

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
        
        // Fetch reviews
        try {
            const reviewsData = await apiClient.get(`/reviews/${id}`);
            if (mounted) setReviews(reviewsData);
        } catch (rErr) {
            console.error("Failed to fetch reviews", rErr);
        }

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
          const filteredBooks = items.filter((item) => item._id !== book._id);
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

  const handleBuyNow = () => {
    checkProfile(() => {
      // Handle cover image: if it's an array, take the first one; otherwise use as is
      const coverImage = Array.isArray(book.cover) ? book.cover[0] : book.cover;
      
      // Redirect to Checkout with state
      navigate('/checkout', { 
          state: { 
              directPurchaseItem: {
                  book: book._id,
                  title: book.title,
                  price: book.price,
                  cover: coverImage,
                  quantity: quantity,
                  seller: book.owner
              }
          } 
      });
    });
  };

  const handleAddToCart = async () => {
    if (!book || adding) return;

    checkProfile(async () => {
      // Check tồn kho sơ bộ ở frontend
      if (quantity > stock) {
        toast.warn(`Chỉ còn ${stock} sản phẩm.`);
        return;
      }

      try {
        setAdding(true);
        await cartActions.addItem(book._id, quantity);
      } catch (err) {
        // Hiển thị lỗi từ backend
        console.error("Failed to add to cart", err);
      } finally {
        setAdding(false);
      }
    });
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
              src={Array.isArray(book.cover) ? book.cover[0] : book.cover}
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
            <p className="author">Tác giả: {book.author}</p>
            {!book.owner && <p className="stock">Tồn kho: {book.stock}</p>}
            <p className="price">{formatCurrency(book.price)}</p>

            {!book.owner && (
              <div className="quantity-selector">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                  -
                </button>
                <input type="number" value={quantity} readOnly />
                <button onClick={() => setQuantity((q) => q + 1)}>+</button>
              </div>
            )}

            <div className="book-detail-actions">
              {book.owner ? (
                <button
                  className="btn primary"
                  onClick={handleBuyNow}
                  disabled={isOwner || isOutOfStock}
                  style={{
                    backgroundColor: isOwner ? '#ccc' : '',
                    cursor: isOwner ? 'not-allowed' : ''
                  }}
                >
                  <FaBolt /> {isOwner ? "Bạn là người bán" : "Mua ngay"}
                </button>
              ) : (
                <>
                  <button
                    className="btn secondary"
                    onClick={handleAddToCart}
                    disabled={adding || isOutOfStock}
                  >
                    <FaCartPlus /> {adding ? "Đang thêm..." : "Thêm vào giỏ"}
                  </button>
                  <button
                    className="btn primary"
                    onClick={handleBuyNow}
                    disabled={isOutOfStock}
                  >
                   <FaBolt /> Mua ngay
                  </button>
                </>
              )}
            </div>

          </div>
        </div>

        <div className="book-info-container">
          {/* Cột trái: Mô tả sản phẩm */}
          <div className="book-description-card">
            <h3 className="card-title">Mô tả sản phẩm</h3>
            <div className={`description-content ${
              (book.description && book.description.length > 500 && !isExpanded) ? 'collapsed' : 'expanded'
            }`}>
              {renderDescription()}
            </div>
            
            {book.description && book.description.length > 500 && (
                <button 
                  className="btn-toggle-description"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm"} {isExpanded ? '▲' : '▼'}
                </button>
            )}
          </div>

          {/* Cột phải: Thông tin chi tiết */}
          <div className="book-details-card">
            <h3 className="card-title">Thông tin chi tiết</h3>
            <table className="details-table">
              <tbody>
                <tr>
                  <td className="detail-label">Mã hàng</td>
                  <td className="detail-value">{book.id}</td>
                </tr>
                <tr>
                  <td className="detail-label">Tác giả</td>
                  <td className="detail-value">{book.author}</td>
                </tr>
                <tr>
                  <td className="detail-label">Nhà xuất bản</td>
                  <td className="detail-value">{book.publisher || "Đang cập nhật"}</td>
                </tr>
                <tr>
                  <td className="detail-label">Năm xuất bản</td>
                  <td className="detail-value">{book.publishedYear || "Đang cập nhật"}</td>
                </tr>
                 <tr>
                  <td className="detail-label">Trọng lượng</td>
                  <td className="detail-value">{book.weight ? `${book.weight} gr` : "Đang cập nhật"}</td>
                </tr>
                <tr>
                  <td className="detail-label">Kích thước</td>
                   <td className="detail-value">{book.size || "Đang cập nhật"}</td>
                </tr>
                <tr>
                  <td className="detail-label">Số trang</td>
                  <td className="detail-value">{book.pageCount || "Đang cập nhật"}</td>
                </tr>
                 <tr>
                  <td className="detail-label">Hình thức</td>
                  <td className="detail-value">{book.form || "Bìa mềm"}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {relatedBooks.length > 0 && (
          <BookSection
            title="Sách cùng thể loại"
            books={relatedBooks}
            link={`/books?category=${book.category}`}
          />
        )}
      </div>
    </div>
  );
}

