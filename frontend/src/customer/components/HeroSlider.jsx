import { useState, useEffect } from 'react';
import './slider.css'; 

export default function HeroSlider({ banners, autoPlayInterval = 5000 }) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide(current => (current === banners.length - 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setCurrentSlide(current => (current === 0 ? banners.length - 1 : current - 1));
  };

  useEffect(() => {
    const sliderInterval = setInterval(nextSlide, autoPlayInterval);
    return () => clearInterval(sliderInterval);
  }, [currentSlide, banners.length, autoPlayInterval]);

  return (
    <div className="slider-container">
      {banners.map((bannerSrc, index) => (
        <img
          key={index}
          src={bannerSrc}
          alt={`Banner ${index + 1}`}
          className={index === currentSlide ? 'slide active' : 'slide'}
        />
      ))}
      <button onClick={prevSlide} className="slider-arrow prev">&#10094;</button>
      <button onClick={nextSlide} className="slider-arrow next">&#10095;</button>
      <div className="slider-dots">
        {banners.map((_, index) => (
          <div
            key={index}
            className={index === currentSlide ? 'dot active' : 'dot'}
            onClick={() => setCurrentSlide(index)}
          ></div>
        ))}
      </div>
    </div>
  );
}