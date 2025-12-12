import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import BookCard from "../components/BookCard";
import { listBooks } from "../../shared/utils/booksService";
import "./page.css";

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
        <div
          className="books-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <h2 style={{ margin: 0 }}>
            {currentSearch
              ? `Kết quả cho "${currentSearch}"`
              : isSale
              ? "Sách Đang Giảm Giá"
              : "Tủ Sách"}
          </h2>

          <div
            className="filter-controls"
            style={{ display: "flex", gap: "10px" }}
          >
            <select
              value={currentCategory}
              onChange={(e) => handleFilterChange("category", e.target.value)}
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
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
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ddd",
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>

            {(currentCategory || isSale || currentSearch) && (
              <button
                onClick={handleClearFilter}
                style={{
                  padding: "8px 12px",
                  background: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Xóa lọc
              </button>
            )}
          </div>
        </div>

        {/* DANH SÁCH SÁCH */}
        {books.length === 0 ? (
          <div
            style={{ textAlign: "center", marginTop: "40px", color: "#666" }}
          >
            <p>Không tìm thấy cuốn sách nào phù hợp.</p>
            <button
              onClick={handleClearFilter}
              style={{
                marginTop: "10px",
                color: "blue",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
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
              <div
                className="pagination"
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginTop: "40px",
                  gap: "10px",
                }}
              >
                {/* Nút Previous */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background: currentPage === 1 ? "#f5f5f5" : "white",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    color: currentPage === 1 ? "#aaa" : "#333",
                  }}
                >
                  &laquo; Trước
                </button>

                {/* Hiển thị số trang */}
                <div style={{ display: "flex", gap: "5px" }}>
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNum = index + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          padding: "8px 12px",
                          border:
                            pageNum === currentPage
                              ? "1px solid #007bff"
                              : "1px solid #ddd",
                          borderRadius: "4px",
                          background:
                            pageNum === currentPage ? "#007bff" : "white",
                          color: pageNum === currentPage ? "white" : "#333",
                          cursor: "pointer",
                          fontWeight:
                            pageNum === currentPage ? "bold" : "normal",
                        }}
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
                  style={{
                    padding: "8px 16px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    background:
                      currentPage === totalPages ? "#f5f5f5" : "white",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    color: currentPage === totalPages ? "#aaa" : "#333",
                  }}
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
