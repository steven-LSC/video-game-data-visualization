import React, { useState } from "react";
import "./Carousel.css";
import LinkPreview from "../common/LinkPreview";

const Carousel = ({ items, className = "" }) => {
  const [translateX, setTranslateX] = useState(0);
  const totalItems = items.length;
  const slideDistance = 200; // 每次滑動距離

  // 計算最大滑動距離
  const getMaxTranslate = () => {
    const cardWidth = 280; // 卡片寬度
    const cardGap = 25; // 卡片間距
    const trackPadding = 40; // 軌道左右 padding 總和 (20px * 2)
    const containerMaxWidth = 1500; // 容器最大寬度

    const totalCardsWidth = cardWidth * totalItems + cardGap * (totalItems - 1); // 所有卡片寬度 + 間距
    const availableWidth = containerMaxWidth - trackPadding; // 實際可用寬度

    return Math.min(0, -(totalCardsWidth - availableWidth + cardGap)); // 最多能移動距離 (多留一點間距)
  };

  const nextSlide = () => {
    const maxTranslate = getMaxTranslate();
    setTranslateX((current) => Math.max(current - slideDistance, maxTranslate));
  };

  const prevSlide = () => {
    setTranslateX((current) => Math.min(current + slideDistance, 0));
  };

  // 檢查是否為YouTube鏈接
  const isYouTubeLink = (link) => {
    return (
      link && (link.includes("youtube.com/watch") || link.includes("youtu.be/"))
    );
  };

  return (
    <div className={`carousel-container ${className}`}>
      <div className="carousel-viewport">
        <div
          className="carousel-track"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="carousel-card">
              <LinkPreview
                content={item.link}
                title="External Reference"
                onlyShowOnHover={true}
              >
                <div className="card-link">
                  <div className="image-container">
                    <img src={item.image} alt={item.title} />
                    {isYouTubeLink(item.link) && (
                      <div className="youtube-icon"></div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                </div>
              </LinkPreview>
            </div>
          ))}
        </div>

        <button
          className="carousel-arrow prev"
          onClick={prevSlide}
          aria-label="Previous slide"
          disabled={translateX >= 0}
        >
          <img
            src="/icons/arrow_left_alt.svg"
            alt="Previous"
            className="arrow-icon"
          />
        </button>

        <button
          className="carousel-arrow next"
          onClick={nextSlide}
          aria-label="Next slide"
          disabled={translateX <= getMaxTranslate()}
        >
          <img
            src="/icons/arrow_right_alt.svg"
            alt="Next"
            className="arrow-icon"
          />
        </button>
      </div>
    </div>
  );
};

export default Carousel;
