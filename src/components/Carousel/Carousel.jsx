import React, { useState } from "react";
import "./Carousel.css";

const Carousel = ({ items, className = "" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const totalItems = items.length;

  const nextSlide = () => {
    setActiveIndex((current) => (current === totalItems - 1 ? 0 : current + 1));
  };

  const prevSlide = () => {
    setActiveIndex((current) => (current === 0 ? totalItems - 1 : current - 1));
  };

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  // 檢查是否為YouTube鏈接
  const isYouTubeLink = (link) => {
    return (
      link && (link.includes("youtube.com/watch") || link.includes("youtu.be/"))
    );
  };

  // 獲取要顯示的項目，無論總數多少，始終顯示5個
  const getVisibleItems = () => {
    let visibleItems = [];

    // 優先顯示當前項目及其左右各2個項目
    for (let i = -2; i <= 2; i++) {
      // 計算索引，並確保它在有效範圍內 (循環)
      const index = (activeIndex + i + totalItems) % totalItems;
      visibleItems.push({
        item: items[index],
        index: index,
        position: i,
        isYouTube: isYouTubeLink(items[index].link),
      });
    }

    return visibleItems;
  };

  return (
    <div className={`carousel-container ${className}`}>
      <div className="carousel-track">
        {getVisibleItems().map(({ item, index, position, isYouTube }) => (
          <div
            key={index}
            className={`carousel-card ${
              position === 0 ? "active" : ""
            } position-${position}`}
          >
            <div className="image-container">
              <img src={item.image} alt={item.title} />
              {isYouTube && <div className="youtube-icon"></div>}
            </div>
            <div className="card-content">
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <a
                href={item.link}
                className="learn-more"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More →
              </a>
            </div>
          </div>
        ))}

        <button
          className="carousel-arrow prev"
          onClick={prevSlide}
          aria-label="Previous slide"
        >
          <span>&lt;</span>
        </button>

        <button
          className="carousel-arrow next"
          onClick={nextSlide}
          aria-label="Next slide"
        >
          <span>&gt;</span>
        </button>
      </div>

      <div className="carousel-dots">
        {items.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === activeIndex ? "active" : ""}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
