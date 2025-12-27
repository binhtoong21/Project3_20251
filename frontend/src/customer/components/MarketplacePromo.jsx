import React from 'react';
import { Link } from 'react-router-dom';
import './MarketplacePromo.css';

const MarketplacePromo = () => {
  return (
    <div className="promo-container">
      <div className="container">
        <div className="promo-content">
          <h2>Giao dịch & Trao đổi</h2>
          <h3>Khám phá Chợ sách cũ</h3>
          <p>
            Mua bán, trao đổi sách cũ với hàng ngàn đọc giả khác trên khắp cả nước.
            Tìm những cuốn sách hiếm, tiết kiệm chi phí và cho những cuốn sách cũ của bạn một ngôi nhà mới.
          </p>
          <Link to="/marketplace" className="btn btn-primary">
            Khám phá ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MarketplacePromo;
