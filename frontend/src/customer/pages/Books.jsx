import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import { listBooks } from "../../shared/utils/booksService";
import "./page.css";
import "./books.css";

export default function Books() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy các tham số từ URL
  const currentCategory = searchParams.get("category") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const isSale = searchParams.get("sale") === "true";
  const currentSearch = searchParams.get("search") || "";

  // Lấy trang hiện tại từ URL (mặc định là 1)
  const currentPage = parseInt(searchParams.get("page")) || 1;

  useEffect(() => {
    let mounted = true;

    const fetchBooks = async () => {
      setLoading(true);
      try {
        const params = {
          page: currentPage, // Gửi trang hiện tại
          limit: 20, // Lấy 20 cuốn mỗi trang
          category: currentCategory,
          sort: currentSort,
          sale: isSale,
          search: currentSearch,
        };

        const response = await listBooks(params);

        if (!mounted) return;

        // Cập nhật sách
        setBooks(response.items || []);

        // Cập nhật tổng số trang từ Backend trả về
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages);
        }

        // Cuộn lên đầu trang mỗi khi load xong data mới
        window.scrollTo(0, 0);
      } catch (err) {
        console.error("Failed to load books:", err);
        if (mounted) setError("Failed to load books");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBooks();

    return () => {
      mounted = false;
    };
  }, [searchParams]); // URL thay đổi (bao gồm cả page) -> Gọi lại API

  // Hàm xử lý thay đổi bộ lọc
  const handleFilterChange = (key, value) => {
    const newParams = Object.fromEntries([...searchParams]);
    if (value) newParams[key] = value;
    else delete newParams[key];

    // Khi lọc lại (đổi thể loại/search),  reset về trang 1
    newParams.page = 1;

    setSearchParams(newParams);
  };

  const handleClearFilter = () => {
    setSearchParams({});
  };

  // Hàm chuyển trang
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    const newParams = Object.fromEntries([...searchParams]);
    newParams.page = newPage;
    setSearchParams(newParams);
  };

  if (loading) {
    return (
      <div className="page books-page">
        <div className="container">
          <p style={{ textAlign: "center", padding: "40px" }}>
            Đang tải sách...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page books-page">
        <div className="container">
          <p style={{ color: "red", textAlign: "center" }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page books-page">
      <div className="container">
        {/* HEADER & FILTER */}
        <div className="books-header">
          <h2 className="books-title">
            {currentSearch
              ? `Kết quả cho "${currentSearch}"`
              : isSale
              ? "Sách Đang Giảm Giá"
              : "Tủ Sách"}
          </h2>

          <div className="filter-controls">
            <select
              value={currentCategory}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">-- Tất cả thể loại --</option>
              <option value="business">Kinh doanh</option>
              <option value="fiction">Viễn tưởng</option>
              <option value="horror">Kinh dị</option>
              <option value="skills">Kỹ năng</option>
            </select>

            <select
              value={currentSort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
              <option value="a_z">Tên A-Z</option>
              <option value="z_a">Tên Z-A</option>
            </select>

            {(currentCategory || isSale || currentSearch) && (
              <button onClick={handleClearFilter} className="clear-filter-btn">
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* DANH SÁCH SÁCH */}
        {books.length === 0 ? (
          <div className="no-books-message">
            <p>Không tìm thấy cuốn sách nào phù hợp.</p>
            <button
              onClick={handleClearFilter}
              className="back-to-all-books-btn"
            >
              Quay lại xem tất cả sách
            </button>
          </div>
        ) : (
          <>
            <div className="grid">
              {books.map((b) => (
                <BookCard key={b._id || b.id} book={b} />
              ))}
            </div>

            {/*  PHÂN TRANG (PAGINATION)  */}
            {totalPages > 1 && (
              <div className="pagination">
                {/* Nút Previous */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  &laquo; Trước
                </button>

                {/* Hiển thị số trang */}
                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`page-number-btn ${
                          pageNum === currentPage ? "active" : ""
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                {/* Nút Next */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Sau &raquo;
                </button>
              </div>
            )}
            {/*  KẾT THÚC PHÂN TRANG  */}
          </>
        )}
      </div>
    </div>
  );
}
