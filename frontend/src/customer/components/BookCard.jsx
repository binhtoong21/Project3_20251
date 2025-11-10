import { Link } from "react-router-dom";
import { useState } from "react";
import "./bookcard.css";
import PropTypes from "prop-types";
import { formatPrice } from "../../shared/utils/formatters"; 
import { useCartActions } from "../../shared/context/CartContext.jsx";

export default function BookCard({ book }) {
  const placeholder = `https://via.placeholder.com/160x240?text=${encodeURIComponent(
    book.title
  )}`;
  const handleError = (e) => {
    e.currentTarget.src = placeholder;
  };
  const cartActions = useCartActions();
  const [adding, setAdding] = useState(false);
  const [feedback, setFeedback] = useState("");

  const handleAdd = async () => {
    try {
      setAdding(true);
      await cartActions.addItem(book.id, 1);
      setFeedback("Added to cart");
      setTimeout(() => setFeedback(""), 2000);
    } catch (err) {
      console.error("Failed to add to cart", err);
      setFeedback("Failed to add");
      setTimeout(() => setFeedback(""), 2000);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="book-card">
      <img
        src={book.cover}
        alt={book.title}
        className="book-cover"
        onError={handleError}
      />
      <div className="book-body">
        <div>
          <h3>{book.title}</h3>
          <p className="author">{book.author}</p>
        </div>
        <div>
          <p className="price">{formatPrice(book.price)}</p>
          <Link to={`/books/${book.id}`} className="details">
            Details
          </Link>
          <button
            type="button"
            className="btn add-cart-btn"
            onClick={handleAdd}
            disabled={adding}
          >
            {adding ? "Adding..." : "Add to cart"}
          </button>
          {feedback && <p className="cart-feedback">{feedback}</p>}
        </div>
      </div>
    </article>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    cover: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};
