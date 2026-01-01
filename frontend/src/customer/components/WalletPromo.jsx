import { Link } from 'react-router-dom';
import './WalletPromo.css';

export default function WalletPromo() {
  return (
    <div className="wallet-promo-section">
      <div className="container">
        <div className="wallet-promo-content">
          <div className="wallet-promo-text">
            <h3>Nạp Tiền Vào Ví, Nhận Ngay Ưu Đãi!</h3>
            <p>Nạp <strong>500.000đ</strong> nhận ngay thêm <strong>50.000đ</strong> vào tài khoản. <br/>Tiết kiệm hơn, mua sắm thả ga.</p>
          </div>
          <Link to="/account/wallet" className="btn btn-primary">
            Nạp tiền ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
