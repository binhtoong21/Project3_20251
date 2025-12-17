import NewsLetter from "../components/NewsLetter";
import BookSection from "../components/BookSection";
import HeroSlider from "../components/HeroSlider";
import "./page.css";
import { useState, useEffect } from "react";
import { listBooks } from "../../shared/utils/booksService";

export default function Home() {
  const [featuredBooks, setFeaturedBooks] = useState([]);
  const [newBooks, setNewBooks] = useState([]);
  const [saleBooks, setSaleBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const bannerImages = [
    "/images/banner1.jpg",
    "/images/banner2.jpg",
    "/images/banner3.jpg",
  ];

  useEffect(() => {
    let mounted = true;

    const fetchBooks = async () => {
      try {
        const [newRes, saleRes, featuredRes] = await Promise.all([
          listBooks({ page: 1, limit: 5, sort: "newest" }),
          listBooks({ page: 1, limit: 5, sort: "price_asc", sale: true }),
          listBooks({ page: 1, limit: 5, sort: "newest", category: "fiction" }),
        ]);
        if (!mounted) return;
        setNewBooks(newRes.items || []);
        setSaleBooks(saleRes.items || []);
        setFeaturedBooks(featuredRes.items || []);
      } catch (err) {
        console.error("Failed to load books:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBooks();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="page home-page">
      <div className="hero-section">
        <div className="container">
          <HeroSlider banners={bannerImages} />
        </div>
      </div>
      <BookSection
        title="Sách Mới Cập Nhật"
        books={newBooks}
        link="/books?sort=newest"
      />
      <BookSection
        title="Sách Đang Giảm Giá"
        books={saleBooks}
        link="/books?sale=true"
      />

      <BookSection
        title="Tiểu Thuyết Nổi Bật"
        books={featuredBooks}
        link="/books?category=fiction"
      />

      <NewsLetter />
    </div>
  );
}
