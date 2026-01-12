import { Link } from "react-router-dom";
import { useState } from "react";
import { FaShoppingCart } from "react-icons/fa";
import "./bookcard.css";
import PropTypes from "prop-types";
import { formatCurrency } from "../../shared/utils/formatters";
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

  // Tính toán giảm giá
  const isSale = book.oldPrice && book.oldPrice > book.price;
  const discountPercent = isSale
    ? Math.round(((book.oldPrice - book.price) / book.oldPrice) * 100)
    : 0;

  const handleAdd = async (e) => {
    e.preventDefault(); // Ngăn chặn click lan ra Link bao ngoài
    try {
      setAdding(true);
      await cartActions.addItem(book._id, 1);
    } catch (err) {
      console.error("Failed to add to cart", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <article className="book-card">
      {isSale && <div className="sale-badge">-{discountPercent}%</div>}
      {book.owner && <div className="c2c-badge">Used</div>}


      <Link to={`/books/${book._id}`} className="book-cover-link">
        <img
          src={book.cover[0] || book.cover} // Handle both array and string for cover
          alt={book.title}
          className="book-cover"
          onError={handleError}
        />
      </Link>

      <div className="book-body">
        <Link to={`/books/${book._id}`} className="book-title">
          {book.title}
        </Link>

        {book.owner ? (
            <p className="seller-info">Sold by: {book.owner.name}</p>
        ) : (
            <p className="seller-info">{book.author}</p>
        )}


        <div className="book-footer">
          <div className="price-container">
            <span className="price">{formatCurrency(book.price)}</span>
            {isSale && (
              <span className="old-price">{formatCurrency(book.oldPrice)}</span>
            )}
          </div>

          <button
            type="button"
            className="add-cart-icon-btn"
            onClick={handleAdd}
            disabled={adding}
            aria-label="Add to cart"
            title="Add to cart"
          >
            <FaShoppingCart />
          </button>
        </div>


      </div>
    </article>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    _id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    cover: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]).isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    oldPrice: PropTypes.number,
    owner: PropTypes.shape({
      _id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
};

