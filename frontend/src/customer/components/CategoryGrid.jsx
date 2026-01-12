import { Link } from "react-router-dom";
import { BOOK_CATEGORIES } from "../../shared/constants/categories";
import "./CategoryGrid.css";
import { useRef } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

// Function to generate a color from a string.
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
}

export default function CategoryGrid() {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300; // Adjust scroll distance
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="category-grid-section">
      <div className="container">
        <div className="section-header">
            <h2 className="section-title">Danh Mục Sách</h2>
        </div>
        
        <div className="category-scroll-container">
          <button 
            className="scroll-btn left" 
            onClick={() => scroll("left")}
            aria-label="Scroll left"
          >
            <FaChevronLeft />
          </button>

          <div className="category-grid" ref={scrollRef}>
            {BOOK_CATEGORIES.map((cat) => (
              <Link
                key={cat.value}
                to={`/books?category=${encodeURIComponent(cat.value)}`}
                className="category-card"
                style={{
                  '--category-color': stringToColor(cat.value)
                }}
              >
                <div className="category-card-content">
                  <h3>{cat.label}</h3>
                </div>
              </Link>
            ))}
          </div>

          <button 
            className="scroll-btn right" 
            onClick={() => scroll("right")}
            aria-label="Scroll right"
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
