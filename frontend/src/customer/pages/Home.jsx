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
        const [featuredRes, newRes, saleRes] = await Promise.all([
          listBooks({ page: 1, limit: 4, sort: "price", order: "desc" }),
          listBooks({ page: 1, limit: 4, sort: "createdAt", order: "desc" }),
          listBooks({ page: 1, limit: 4, sort: "price", order: "asc" }),
        ]);
        if (!mounted) return;
        setFeaturedBooks(featuredRes.items || []);
        setNewBooks(newRes.items || []);
        setSaleBooks(saleRes.items || []);
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

      <BookSection title="Featured Books" books={featuredBooks} link="/books" />
      <BookSection
        title="New Arrivals"
        books={newBooks}
        link="/books?category=new"
      />
      <BookSection
        title="On Sale"
        books={saleBooks}
        link="/books?category=sale"
      />
    </div>
  );
}
