import { Link } from "react-router-dom";
import HeroSlider from "./HeroSlider";
import "./HeroSection.css";

export default function HeroSection({ banners }) {
  const quickLinks = [
    { title: "Ví Điện Tử Mua Bán Nhanh Chóng Và An Toàn", to: "/account/wallet" }, 
    { title: "Sách Cũ Không Dùng Đến, Đăng Bán Ngay Tại Đây", to: "/account/books" },
  ];

  return (
    <div className="hero-section-container">
      <div className="container">
        <div className="hero-layout">
          <div className="hero-slider-wrapper">
            <HeroSlider banners={banners} />
          </div>
          <div className="quick-links-wrapper">
            {quickLinks.map((link) => (
              <Link key={link.title} to={link.to} className="quick-link-card">
                <h3>{link.title}</h3>
                <p>Khám phá ngay &rarr;</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
