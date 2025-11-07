import { Link } from "react-router-dom";
import "./bookcard.css";
import PropTypes from "prop-types";
import { formatPrice } from "../../shared/utils/formatters"; // Import hàm tiện ích

export default function BookCard({ book }) {
  const placeholder = `https://via.placeholder.com/160x240?text=${encodeURIComponent(
    book.title
  )}`;
  const handleError = (e) => {
    e.currentTarget.src = placeholder;
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
        </div>
      </div>
    </article>
  );
}

// 2. Định nghĩa quy tắc cho prop 'book'
BookCard.propTypes = {
  book: PropTypes.shape({
    // book phải là một object có cấu trúc nhất định
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    cover: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
  }).isRequired,
};
