import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import './footer.css'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Column 1: About */}
        <div className="footer-col">
          <h3 className="footer-logo">Book-E</h3>
          <p className="footer-tagline">Your destination for new and used books. Discover, read, and share.</p>
          <div className="social-icons">
            <a href="https://facebook.com" aria-label="Facebook" className="social-link"><FaFacebookF /></a>
            <a href="https://instagram.com" aria-label="Instagram" className="social-link"><FaInstagram /></a>
            <a href="https://tiktok.com" aria-label="TikTok" className="social-link"><FaTiktok /></a>
          </div>
        </div>

        {/* Column 2: Main Pages */}
        <div className="footer-col">
          <h3>Trang chính</h3>
          <ul>
            <li><Link to="/">Trang chủ</Link></li>
            <li><Link to="/books">Tủ sách</Link></li>
            <li><Link to="/marketplace">Chợ sách cũ</Link></li>
            <li><Link to="/login">Đăng nhập</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div className="footer-col">
          <h3>Hỗ trợ</h3>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/shipping">Giao hàng & Đổi trả</Link></li>
            <li><Link to="/privacy">Chính sách bảo mật</Link></li>
            <li><Link to="/terms">Điều khoản dịch vụ</Link></li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="footer-col">
          <h3>Liên hệ</h3>
          <address>
            123 Book St, Reading City, 45678<br/>
            <strong>Email:</strong> support@bookstores.com<br/>
            <strong>Phone:</strong> 123-456-7890
          </address>
        </div>
      </div>

      <div className="footer-bottom">
        <small>© {new Date().getFullYear()} Book-E. All rights reserved.</small>
      </div>
    </footer>
  )
}
