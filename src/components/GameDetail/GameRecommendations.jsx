import React, { useState, useEffect } from "react";
import styles from "./GameRecommendations.module.css";
import LinkPreview from "../common/LinkPreview";

const GameRecommendations = ({ game }) => {
  const [recommendedGames, setRecommendedGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedGames = async () => {
      try {
        // 如果當前遊戲有推薦遊戲資料，優先使用
        if (game && game.recommendedGames && game.recommendedGames.length > 0) {
          const gameRecommendations = game.recommendedGames.map(
            (rec, index) => {
              // 推薦遊戲的 PEGI 資料在 gameDataStore 處理過程中丟失了
              // 暫時使用預設值：推薦遊戲通常是更適合兒童的替代選擇
              // 根據遊戲標題設定合理的 PEGI 評級
              let pegiRating = "3"; // 預設為最安全的評級

              // 根據遊戲名稱設定特定的 PEGI 評級
              const gameTitle = rec.title.toLowerCase();
              if (
                gameTitle.includes("minecraft") &&
                gameTitle.includes("education")
              ) {
                pegiRating = "7"; // Minecraft Education Edition
              } else if (gameTitle.includes("minecraft")) {
                pegiRating = "7"; // 一般 Minecraft 相關遊戲
              }
              // 其他遊戲保持 PEGI 3

              return {
                title: rec.title,
                image: rec.image,
                link: rec.link || "#", // 保持 link 欄位名稱一致
                genres: rec.genres || [],
                pegiRating: pegiRating,
                description:
                  rec.reason ||
                  "Recommended based on similar gameplay elements.",
              };
            }
          );

          setRecommendedGames(gameRecommendations);
          setLoading(false);
          return;
        }

        // 如果沒有推薦遊戲資料，回退到原本的 recommended-games.json
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
  }, [game]);

  if (loading) {
    return <div className={styles.loading}>Loading recommendations...</div>;
  }

  return (
    <div className={styles.recommendationsContainer}>
      <div className={styles.gameCardsGrid}>
        {recommendedGames.map((game, index) => (
          <div key={index} className={styles.gameCard}>
            <LinkPreview
              content={game.link}
              title="Recommended Game"
              onlyShowOnHover={true}
              blockDisplay={true}
            >
              <a
                href={game.link}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.gameCardLink}
              >
                <img
                  src={game.image}
                  alt={game.title}
                  className={styles.gameImage}
                />
                <div className={styles.gameCardContent}>
                  <h3 className={styles.gameTitle}>{game.title}</h3>
                  <div className={styles.tagsContainer}>
                    <p
                      className={`${styles.pegiTag} ${
                        styles[`pegi${game.pegiRating}`]
                      }`}
                    >
                      PEGI {game.pegiRating}
                    </p>
                    {game.genres.slice(0, 4).map((genre, idx) => (
                      <p key={idx} className={styles.genreTag}>
                        {genre}
                      </p>
                    ))}
                  </div>
                  <p className={styles.gameDescription}>{game.description}</p>
                </div>
              </a>
            </LinkPreview>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameRecommendations;
