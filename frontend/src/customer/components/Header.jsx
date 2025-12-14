import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaShoppingCart, FaUser, FaSearch, FaBook } from "react-icons/fa";
import { useAuth } from "../../shared/context/AuthContext";
import { useCartState } from "../../shared/context/CartContext";
import "./header.css";
import Notification from "./Notifications";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAccountDropdownVisible, setAccountDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuth();
  const { totalQuantity } = useCartState();

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      // Điều hướng sang trang Books kèm query params search
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const logoutHandler = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="site-header">
      <div className="container">
        <div className="header-left">
          <h1 className="site-logo">
            <Link to="/">
              <img src="/images/logo/logo.jpg" alt="Bookstore Logo" />
            </Link>
          </h1>
        </div>

        <div className="header-center">
          <form className="search-form" onSubmit={handleSearch}>
            <input
              type="search"
              name="search"
              placeholder="Tìm sách, tác giả..."
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" aria-label="Search">
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="header-right">
          <nav>
            <NavLink to="/books" className="icon-link">
              <FaBook />
              <span>Tủ sách</span>
            </NavLink>

            {user ? (
              <>
                <div className="icon-link">
                  <Notification />
                  <span>Thông báo</span>
                </div>
                <NavLink to="/cart" className="icon-link">
                  <FaShoppingCart />
                  {totalQuantity > 0 && (
                    <span className="cart-badge">{totalQuantity}</span>
                  )}
                  <span>Giỏ hàng</span>
                </NavLink>
                <div
                  className="account-menu"
                  onMouseEnter={() => setAccountDropdownVisible(true)}
                  onMouseLeave={() => setAccountDropdownVisible(false)}
                >
                  <NavLink to="/account" className="icon-link">
                    <FaUser />
                    <span>{user.name}</span>
                  </NavLink>
                  {isAccountDropdownVisible && (
                    <div className="account-dropdown">
                      <Link to="/account">Hồ sơ</Link>
                      <button onClick={logoutHandler} className="logout-button">
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                className="account-menu"
                onMouseEnter={() => setAccountDropdownVisible(true)}
                onMouseLeave={() => setAccountDropdownVisible(false)}
              >
                <NavLink to="/login" className="icon-link">
                  <FaUser />
                  <span>Tài khoản</span>
                </NavLink>
                {isAccountDropdownVisible && (
                  <div className="account-dropdown">
                    <Link to="/login">Đăng nhập</Link>
                    <Link to="/register">Đăng ký</Link>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
