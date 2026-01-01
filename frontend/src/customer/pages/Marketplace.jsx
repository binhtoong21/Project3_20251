import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import * as booksService from '../../shared/utils/booksService';
import MarketplaceBookItem from '../components/MarketplaceBookItem';
import './Marketplace.css';

const Marketplace = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsedBooks = async () => {
      try {
        setLoading(true);
        // Fetch only used books
        const data = await booksService.listBooks({ mode: 'used', limit: 50 });
        setBooks(data.items);
      } catch (err) {
        setError('Không thể tải dữ liệu từ chợ sách cũ.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsedBooks();
  }, []);

  return (
    <div className="page marketplace-page">
      <div className="container">
        <div className="marketplace-header">
          <h1>Chợ sách cũ</h1>
          <p>Khám phá sách được đăng bán từ cộng đồng đọc giả trên khắp cả nước.</p>
          <Link to="/account/my-books" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
            <FaPlus /> Đăng bán sách ngay
          </Link>
        </div>

        {loading && <p>Đang tải...</p>}
        {error && <p className="error-message">{error}</p>}
        
        {!loading && !error && (
          <div className="marketplace-list">
            {books.length > 0 ? (
              books.map(book => <MarketplaceBookItem key={book._id} book={book} />)
            ) : (
              <p>Chưa có cuốn sách cũ nào được đăng bán.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
