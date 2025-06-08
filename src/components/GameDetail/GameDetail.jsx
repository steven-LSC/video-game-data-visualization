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

    // 當 gameId 改變時滑到頁面最上面
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

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
            <span className={styles.metaLabel}>Developer:</span>
            <span className={styles.metaValue}>
              {game.developer || game.publisher}
            </span>
          </div>
          <div className={styles.metaItem}>
            <span className={styles.metaLabel}>Publisher:</span>
            <span className={styles.metaValue}>{game.publisher}</span>
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
              <h3>PEGI Rating</h3>
              <div className={styles.tagsContainer}>
                <span
                  className={`${styles.labelTag} ${styles.pegiTag} ${
                    styles[`pegi${game.pegiRating}`]
                  }`}
                >
                  PEGI {game.pegiRating}
                </span>
              </div>
            </div>

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
              Explore the potential impacts of this game on players. This
              analysis is based on our research data and feedback from players.
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
              Use this filtering system to search for games that are similar or
              different, all according to your preferances!
            </p>
            <br />
          </div>
        </div>
        <GameRanking
          gameData={gameDataStore.gameList}
          genres={uniqueGenres}
          pegiRatings={uniquePegiRatings}
          getGameSlug={getGameSlug}
          currentGameGenres={game.genres}
          currentGamePegi={game.pegiRating}
        />
      </section>

      {/* 添加遊戲推薦部分 - 只有當有推薦遊戲資料時才顯示 */}
      {game.recommendedGames &&
        game.recommendedGames.length > 0 &&
        game.recommendedGames[0].reason && (
          <section className={styles.recommendedGames + " " + styles.section}>
            <div className={styles.container}>
              <h2 className={styles.sectionTitle}>
                Not Quite Ready for {game.title}? Try These Instead!
              </h2>
              <div className={styles.sectionDescription}>
                <p>
                  These carefully curated recommendations share genres with{" "}
                  {game.title}, but offer a less intense experience that may be
                  more age-appropriate!
                </p>
                <br />
              </div>
            </div>
            <GameRecommendations game={game} />
          </section>
        )}
    </div>
  );
};

export default GameDetail;
