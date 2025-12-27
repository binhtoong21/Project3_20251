import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../shared/utils/formatters';
import './MarketplaceBookItem.css';
import { FaUser, FaCalendarAlt, FaTag } from 'react-icons/fa';


const MarketplaceBookItem = ({ book }) => {
  const placeholder = `https://via.placeholder.com/150x200?text=${encodeURIComponent(book.title)}`;
  
  const handleError = (e) => {
    e.currentTarget.src = placeholder;
  };

  return (
    <div className="mp-book-item">
      <Link to={`/books/${book._id}`} className="item-cover-link">
        <img 
            src={(book.cover && book.cover[0]) || placeholder} 
            alt={book.title} 
            onError={handleError}
        />
      </Link>
      <div className="item-details">
        <Link to={`/books/${book._id}`}>
            <h3 className="item-title">{book.title}</h3>
        </Link>
        <p className="item-author">{book.author}</p>
        <p className="item-description">{book.description}</p>
        <div className="item-meta">
            <span className="item-seller">
                <FaUser /> Bán bởi: <strong>{book.owner?.name || 'Không rõ'}</strong>
            </span>
            <span className="item-condition">
                Tình trạng: <strong>{book.condition}</strong>
            </span>
             <span className="item-date">
                <FaCalendarAlt /> Đăng ngày: {formatDate(book.createdAt)}
            </span>
        </div>
      </div>
      <div className="item-price-section">
        <div className="item-price">{formatCurrency(book.price)}</div>
        <Link to={`/books/${book._id}`} className="btn-primary">
            Xem chi tiết
        </Link>
      </div>
    </div>
  );
};

export default MarketplaceBookItem;

