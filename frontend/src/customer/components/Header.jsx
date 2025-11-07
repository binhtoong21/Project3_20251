import { NavLink, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./header.css";

export default function Header() {
  const [searchTerm, setSearchTerm] = useState("");
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
            <button type="submit">Search</button>
          </form>
        </div>

        <div className="header-right">
          <nav>
            <NavLink to="/books">Books</NavLink>
            <NavLink to="/cart">Cart</NavLink>
            <NavLink to="/login">Login</NavLink>
          </nav>
        </div>
      </div>
    </header>
  );
}
