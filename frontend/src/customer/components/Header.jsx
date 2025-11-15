import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { FaShoppingCart, FaUser, FaSearch } from "react-icons/fa";
import "./header.css";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAccountDropdownVisible, setAccountDropdownVisible] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/books?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
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
              placeholder="Search for books, authors..."
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
            <NavLink to="/cart" className="icon-link">
              <FaShoppingCart />
              <span>Cart</span>
            </NavLink>
            <div
              className="account-menu"
              onMouseEnter={() => setAccountDropdownVisible(true)}
              onMouseLeave={() => setAccountDropdownVisible(false)}
            >
              <NavLink to="/account" className="icon-link">
                <FaUser />
                <span>Account</span>
              </NavLink>
              {isAccountDropdownVisible && (
                <div className="account-dropdown">
                  <Link to="/login">Login</Link>
                  <Link to="/register">Register</Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
}
