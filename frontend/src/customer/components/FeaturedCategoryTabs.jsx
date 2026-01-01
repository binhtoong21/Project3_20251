import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";
import { listBooks } from "../../shared/utils/booksService";
import { BOOK_CATEGORIES } from "../../shared/constants/categories";
import "./FeaturedCategoryTabs.css";

// Choose a subset or use all. Let's use the first 5 or specific ones.
const FEATURED_CATEGORIES = BOOK_CATEGORIES.slice(0, 5); 

export default function FeaturedCategoryTabs() {
  const [activeTab, setActiveTab] = useState(FEATURED_CATEGORIES[0].value);
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchBooksForCategory() {
      if (!activeTab) return;

      setLoading(true);
      try {
        const response = await listBooks({
          category: activeTab,
          limit: 8,
          page: 1,
        });
        setBooks(response.items || []);
      } catch (error) {
        console.error(`Failed to fetch books for ${activeTab}:`, error);
        setBooks([]); // Clear books on error
      } finally {
        setLoading(false);
      }
    }

    fetchBooksForCategory();
  }, [activeTab]);

  return (
    <div className="featured-tabs-section">
      <div className="container">
        <div className="section-header">
            <h2 className="section-title">Thể Loại Nổi Bật</h2>
        </div>
        <div className="tabs-container">
          <div className="tab-list">
            {FEATURED_CATEGORIES.map((category) => (
              <button
                key={category.value}
                className={`tab-item ${activeTab === category.value ? "active" : ""}`}
                onClick={() => setActiveTab(category.value)}
              >
                {category.label}
              </button>
            ))}
          </div>
          <div className="tab-panel">
            {loading ? (
              <p>Loading books...</p>
            ) : (
              <>
                <div className="grid">
                  {books.map((book) => (
                    <BookCard key={book._id} book={book} />
                  ))}
                </div>
                <div className="see-more-container">
                    <Link to={`/books?category=${encodeURIComponent(activeTab)}`} className="see-all-link">
                        Xem tất cả &gt;
                    </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
