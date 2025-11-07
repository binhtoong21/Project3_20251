import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { getBook } from "../../shared/utils/booksService";
import { formatPrice } from "../../shared/utils/formatters"; 
import "./page.css";

export default function BookDetail() {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1); 

  useEffect(() => {
    let mounted = true;

    const fetchBook = async () => {
      try {
        const data = await getBook(id);
        if (!mounted) return;
        setBook(data);
      } catch (err) {
        console.error('Failed to load book:', err);
        if (mounted) setError('Book not found');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBook();

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAddToCart = () => {
    if (!book) return;
    // Logic thêm vào giỏ hàng 
    console.log(`Added ${quantity} of "${book.title}" to cart.`);
    // gọi một hàm từ CartContext
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
        <div className="container">{error || 'Book not found'}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container book-detail">
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

          {book.description && (
            <p className="description">{book.description}</p>
          )}

          <p className="price">{formatPrice(book.price)}</p>

          <div className="quantity-selector">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
              -
            </button>
            <input type="number" value={quantity} readOnly />
            <button onClick={() => setQuantity((q) => q + 1)}>+</button>
          </div>

          <button className="btn primary" onClick={handleAddToCart}>
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}
