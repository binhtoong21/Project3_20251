import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaUser,
  FaSearch,
  FaBook,
  FaStore,
} from "react-icons/fa";
import { useAuth } from "../../shared/context/AuthContext";
import { useCartState } from "../../shared/context/CartContext";
import "./header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { totalQuantity } = useCartState();
  const [isAccountDropdownVisible, setAccountDropdownVisible] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          // Scrolling DOWN
          setIsVisible(false);
        } else {
          // Scrolling UP
          setIsVisible(true);
        }
        lastScrollY = window.scrollY;
      }
    };

    window.addEventListener("scroll", controlNavbar);

    return () => {
      window.removeEventListener("scroll", controlNavbar);
    };
  }, []);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const searchQuery = e.target.value;
      if (searchQuery.trim()) {
        navigate(`/books?search=${encodeURIComponent(searchQuery)}`);
        e.target.value = "";
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className={`site-header ${!isVisible ? "hidden" : ""}`}>
      <div className="container">
        <div className="header-left">
          <Link to="/" className="site-logo">
            <img src="/images/logo/logo.jpg" alt="BookStore Logo" />
          </Link>
        </div>

        <div className="header-center">
          <form className="search-form" onSubmit={(e) => e.preventDefault()}>
            <input
              type="search"
              placeholder="Tìm kiếm sách..."
              onKeyPress={handleSearch}
            />
            <button type="submit" aria-label="Search">
              <FaSearch />
            </button>
          </form>
        </div>

        <div className="header-right">
          <nav>
            <>
              <NavLink to="/books" className="icon-link">
                <FaBook />
                <span>Tủ sách</span>
              </NavLink>
              <NavLink to="/marketplace" className="icon-link">
                <FaStore />
                <span>Chợ sách cũ</span>
              </NavLink>

              {user ? (
                <>
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
                    <Link to="/account" className="icon-link">
                      <FaUser />
                      <span>{user?.name || "User"}</span>
                    </Link>
                    {isAccountDropdownVisible && (
                      <div className="account-dropdown">
                        <Link to="/account">Hồ sơ</Link>
                        <button
                          onClick={handleLogout}
                          className="logout-button"
                        >
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
            </>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
