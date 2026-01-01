import NewsLetter from "../components/NewsLetter";
import BookSection from "../components/BookSection";

import HeroSection from "../components/HeroSection";
import CategoryGrid from "../components/CategoryGrid";
import FlashSaleSection from "../components/FlashSaleSection";
import FeaturedCategoryTabs from "../components/FeaturedCategoryTabs";
import WalletPromo from "../components/WalletPromo";
import "./page.css";
import { useState, useEffect } from "react";
import { listBooks } from "../../shared/utils/booksService";

export default function Home() {
  const [newBooks, setNewBooks] = useState([]);
  const [saleBooks, setSaleBooks] = useState([]);
  const [bestsellingBooks, setBestsellingBooks] = useState([]);
  const [usedBooks, setUsedBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const bannerImages = [
    "/images/banner1.jpg",
    "/images/banner2.jpg",
    "/images/banner3.jpg",
  ];

  // Create a "Fake" Flash Sale Timer that resets every day (Counts down to next midnight)
  const flashSaleEndDate = new Date();
  flashSaleEndDate.setHours(24, 0, 0, 0); // Sets time to 00:00:00 of tomorrow

  useEffect(() => {
    let mounted = true;

    const fetchBooks = async () => {
      try {
        const [newRes, bestsellingRes, saleRes, usedRes] = await Promise.all([
          listBooks({ page: 1, limit: 5, sort: "newest", mode: "new" }),
          listBooks({ trending: true, limit: 5 }),
          listBooks({ sale: true, limit: 10 }), // Fetch more for flash sale
          listBooks({ mode: 'used', limit: 6 }),
        ]);
        if (!mounted) return;
        setNewBooks(newRes.items || []);
        setBestsellingBooks(bestsellingRes.items || []);
        setSaleBooks(saleRes.items || []);
        setUsedBooks(usedRes.items || []);
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
      <HeroSection banners={bannerImages} />

      <CategoryGrid />

      <BookSection
        title="Sách Mới Cập Nhật"
        books={newBooks}
        link="/books?sort=newest"
      />

      <FlashSaleSection 
        books={saleBooks}
        targetDate={flashSaleEndDate}
        link="/books?sale=true"
      />

      <FeaturedCategoryTabs />

      <BookSection
        title="Chợ Sách Cũ Nổi Bật"
        books={usedBooks}
        link="/marketplace"
      />

      <NewsLetter />
    </div>
  );
}
