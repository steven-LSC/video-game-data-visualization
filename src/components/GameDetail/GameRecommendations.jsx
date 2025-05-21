import React, { useState, useEffect } from "react";
import styles from "./GameRecommendations.module.css";

const GameRecommendations = () => {
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedGames = async () => {
      try {
        const response = await fetch("/recommended-games.json");
        if (!response.ok) {
          throw new Error("Failed to fetch recommended games");
        }
        const data = await response.json();

        // 隨機選取4個遊戲
        const shuffled = [...data].sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 4);

        setRecommendedGames(selected);
        setLoading(false);
      } catch (error) {
        console.error("Error loading recommended games:", error);
        setLoading(false);
      }
    };

    fetchRecommendedGames();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading recommendations...</div>;
  }

  return (
    <div className={styles.recommendationsContainer}>
      <div className={styles.gameCardsGrid}>
        {recommendedGames.map((game, index) => (
          <div key={index} className={styles.gameCard}>
            <a
              href={game.url}
              className={styles.gameCardLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img
                src={game.image}
                alt={game.title}
                className={styles.gameImage}
              />
              <div className={styles.gameCardContent}>
                <h3 className={styles.gameTitle}>{game.title}</h3>
                <div className={styles.genreContainer}>
                  <p className={styles.genreLabel}>Genre: </p>
                  <div className={styles.genreTags}>
                    {game.genres.slice(0, 4).map((genre, idx) => (
                      <p key={idx} className={styles.genreTag}>
                        {genre}
                      </p>
                    ))}
                  </div>
                </div>
                <p className={styles.gameDescription}>{game.description}</p>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameRecommendations;
