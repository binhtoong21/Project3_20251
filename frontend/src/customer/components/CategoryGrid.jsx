import { Link } from "react-router-dom";
import { BOOK_CATEGORIES } from "../../shared/constants/categories";
import "./CategoryGrid.css";

// Function to generate a color from a string.
// This is a simple hash function to give each category a unique-ish color.
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
  return (
    <div className="category-grid-section">
      <div className="container">
        <div className="section-header">
            <h2 className="section-title">Danh Mục Sách</h2>
        </div>
        <div className="category-grid">
          {BOOK_CATEGORIES.map((cat) => (
            <Link
              key={cat.value}
              to={`/books?category=${encodeURIComponent(cat.value)}`}
              className="category-card"
              style={{
                // A bit of fun: generate a background color from the category value
                '--category-color': stringToColor(cat.value)
              }}
            >
              <div className="category-card-content">
                <h3>{cat.label}</h3>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
