import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { gameDataStore } from "../Introduction/Introduction";
import ImpactVisualization from "./ImpactVisualization";
import GameRanking from "../GameRanking/GameRanking";
import GameRecommendations from "./GameRecommendations";
import styles from "./GameDetail.module.css";

const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uniqueGenres, setUniqueGenres] = useState([]);
  const [uniquePegiRatings, setUniquePegiRatings] = useState([]);

  // 獲取所有遊戲唯一的genres
  const getUniqueGenres = (games) => {
    if (!games || !games.length) return [];
    const allGenres = new Set();
    games.forEach((game) => {
      if (game.genres && Array.isArray(game.genres)) {
        game.genres.forEach((genre) => {
          allGenres.add(genre);
        });
      }
    });
    return Array.from(allGenres).sort();
  };

  // 獲取所有遊戲唯一的PEGI評級
  const getUniquePegiRatings = (games) => {
    if (!games || !games.length) return [];
    const allRatings = new Set();
    games.forEach((game) => {
      if (game.pegiRating) {
        allRatings.add(game.pegiRating);
      }
    });
    return Array.from(allRatings).sort((a, b) => Number(a) - Number(b));
  };

  useEffect(() => {
    const loadGameData = async () => {
      setLoading(true);

      // Try to get game data from gameDataStore
      let gameData = gameDataStore.getGameBySlug(gameId);

      // If game data doesn't exist, try to load data first
      if (!gameData && gameDataStore.gameList.length === 0) {
        try {
          await gameDataStore.loadDataFromJSON();
          gameData = gameDataStore.getGameBySlug(gameId);
        } catch (error) {
          console.error("Failed to load game data:", error);
        }
      }

      if (gameData) {
        setGame(gameData);

        // 更新唯一genres和PEGI評級
        setUniqueGenres(getUniqueGenres(gameDataStore.gameList));
        setUniquePegiRatings(getUniquePegiRatings(gameDataStore.gameList));
      } else {
        // If data still not found, log a warning
        console.warn(`Game not found: ${gameId}`);
      }

      setLoading(false);
    };

    loadGameData();
  }, [gameId, navigate]);

  if (loading) {
    return (
      <div
        className={styles.gameDetailContainer + " " + styles.loadingContainer}
      >
        <div className={styles.container}>
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className={styles.gameDetailContainer + " " + styles.errorContainer}>
        <h2>Game Not Found</h2>
        <p>Sorry, we couldn't find a game matching "{gameId}".</p>
        <Link to="/" className={styles.backLink}>
          Return to Home
        </Link>
      </div>
    );
  }

  // 用於獲取遊戲的URL slug
  const getGameSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  return (
    <div className={styles.gameDetailContainer}>
      <div className={styles.gameHeader}>
        <div className={styles.container}>
          <div className={styles.headerTop}>{/* 移除返回連結 */}</div>
          <h1>{game.title}</h1>
          <div className={styles.gameMeta}>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Platform:</span>
              <span className={styles.metaValue}>{game.platform}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Sales:</span>
              <span className={styles.metaValue}>{game.sales}</span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>PEGI:</span>
              <span className={styles.metaValue + " " + styles.pegiTag}>
                PEGI {game.pegiRating}
              </span>
            </div>
            <div className={styles.metaItem}>
              <span className={styles.metaLabel}>Publisher:</span>
              <span className={styles.metaValue}>{game.publisher}</span>
            </div>
          </div>
        </div>
      </div>

      <section className={styles.gameIntroduction + " " + styles.section}>
        <div className={styles.container}>
          <div className={styles.featuredImage}>
            <img
              src={game.featuredImage}
              alt={`${game.title} featured image`}
            />
          </div>

          <div className={styles.gameDetails}>
            <h2>Game Introduction</h2>
            <p className={styles.gameDescription}>{game.description}</p>

            <div className={styles.tagsSection}>
              <h3>Genres</h3>
              <div className={styles.tagsContainer}>
                {game.genres.map((genre, index) => (
                  <span
                    key={index}
                    className={styles.labelTag + " " + styles.genreTag}
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className={styles.tagsSection}>
              <h3>Other</h3>
              <div className={styles.tagsContainer}>
                {game.otherLabels.map((tag, index) => (
                  <span
                    key={index}
                    className={styles.labelTag + " " + styles.otherTag}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 添加Impact Analysis標題並使用ImpactVisualization元件 */}
      <section
        className={styles.gameImpactVisualization + " " + styles.section}
      >
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Game Impact Analysis</h2>
          <div className={styles.sectionDescription}>
            <p>
              Explore the potential impacts of this game on players, including
              both positive and negative effects. This analysis is based on
              research data and player feedback.
            </p>
          </div>
          <ImpactVisualization game={game} />
        </div>
      </section>

      {/* 添加相關遊戲排行 */}
      <section className={styles.relatedGames + " " + styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Similar Games</h2>
          <div className={styles.sectionDescription}>
            <p>
              Discover games that share similar genres, age ratings, or gameplay
              elements. These recommendations are tailored based on {game.title}
              's characteristics.
            </p>
          </div>
          <GameRanking
            gameData={gameDataStore.gameList}
            genres={uniqueGenres}
            pegiRatings={uniquePegiRatings}
            getGameSlug={getGameSlug}
            currentGameGenres={game.genres}
            currentGamePegi={game.pegiRating}
          />
        </div>
      </section>

      {/* 添加遊戲推薦部分 */}
      <section className={styles.recommendedGames + " " + styles.section}>
        <div className={styles.container}>
          <h2 className={styles.sectionTitle}>Recommended Games For You</h2>
          <div className={styles.sectionDescription}>
            <p>
              Based on your interest in {game.title}, you might also enjoy these
              games available on other platforms. Click any game to visit its
              official website.
            </p>
          </div>
          <GameRecommendations />
        </div>
      </section>
    </div>
  );
};

export default GameDetail;
