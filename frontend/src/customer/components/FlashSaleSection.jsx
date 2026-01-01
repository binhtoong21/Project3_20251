import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookCard from "./BookCard";
import "./FlashSaleSection.css";

const calculateTimeLeft = (targetDate) => {
  const difference = +new Date(targetDate) - +new Date();
  let timeLeft = {};

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

export default function FlashSaleSection({ books, targetDate, link }) {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents = [];
  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval] && timeLeft[interval] !== 0) {
      return;
    }

    timerComponents.push(
      <span key={interval} className="timer-segment">
        <strong>{String(timeLeft[interval]).padStart(2, "0")}</strong>
        <span className="timer-label">{interval}</span>
      </span>
    );
  });
  
  if(books.length === 0){
      return null;
  }

  return (
    <div className="flash-sale-section">
      <div className="container">
        <div className="section-header">
          <div className="flash-sale-title">
            <h2 className="section-title">Flash Sale</h2>
            <div className="countdown-timer">
              {timerComponents.length ? timerComponents : <span>Time's up!</span>}
            </div>
          </div>
          <Link to={link} className="see-all-link">
            See all &gt;
          </Link>
        </div>

        <div className="grid">
          {books.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
}
