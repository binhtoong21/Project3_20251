import { FaFacebookF, FaInstagram, FaTiktok } from "react-icons/fa";
import "./Newsletter.css";

export default function Newsletter() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Cảm ơn bạn đã đăng ký!");
    e.target.reset();
  };

  return (
    <section className="newsletter-section">
      {/* Thêm div này để giới hạn độ rộng nội dung */}
      <div className="newsletter-container">
        {/* Phần Trái */}
        <div className="newsletter-left">
          <div className="social-icons">
            <a
              href="https://facebook.com"
              className="social-link"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="https://instagram.com"
              className="social-link"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="https://tiktok.com"
              className="social-link"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
          </div>
        </div>

        {/* Phần Giữa */}
        <div className="newsletter-center">
          <h3>NHẬN THÔNG TIN KHUYẾN MÃI TỪ CHÚNG TÔI</h3>
        </div>

        {/* Phần Phải */}
        <div className="newsletter-right">
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Nhập email ưu đãi"
              required
              aria-label="Email for newsletter"
            />
            <button type="submit">ĐĂNG KÝ</button>
          </form>
        </div>
      </div>
    </section>
  );
}
