import { Link } from "react-router-dom";
import BookCard from "./BookCard";
import PropTypes from "prop-types"; // 1. Import PropTypes

export default function BookSection({ title, books, link }) {
  return (
    <div className="books-section">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link to={link} className="see-all-link">
            See all &gt;
          </Link>
        </div>

        <div className="grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}

BookSection.propTypes = {
  title: PropTypes.string.isRequired, // title phải là string và là bắt buộc
  books: PropTypes.array.isRequired, // books phải là một mảng và là bắt buộc
  link: PropTypes.string.isRequired, // link phải là string và là bắt buộc
};
