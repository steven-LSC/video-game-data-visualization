import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { gameDataStore } from "../Introduction/Introduction";
import ImpactVisualization from "./ImpactVisualization";
import "./GameDetail.css";

const GameDetail = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <div className="game-detail-container loading-container">
        <div className="container">
          <p>Loading game data...</p>
        </div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="game-detail-container error-container">
        <h2>Game Not Found</h2>
        <p>Sorry, we couldn't find a game matching "{gameId}".</p>
        <Link to="/" className="back-link">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="game-detail-container">
      <div className="game-header">
        <div className="container">
          <div className="header-top">
            <div className="back-navigation">
              <Link to="/" className="back-link">
                ← Back to Games
              </Link>
            </div>
          </div>
          <h1>{game.title}</h1>
          <div className="game-meta">
            <div className="meta-item">
              <span className="meta-label">Platform:</span>
              <span className="meta-value">{game.platform}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Sales:</span>
              <span className="meta-value">{game.sales}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">PEGI:</span>
              <span className="meta-value pegi-tag">
                PEGI {game.pegiRating}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Publisher:</span>
              <span className="meta-value">{game.publisher}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="game-introduction">
        <div className="container">
          <div className="featured-image">
            <img
              src={game.featuredImage}
              alt={`${game.title} featured image`}
            />
          </div>

          <div className="game-details">
            <h2>Game Introduction</h2>
            <p className="game-description">{game.description}</p>

            <div className="tags-section">
              <h3>Genres</h3>
              <div className="tags-container">
                {game.genres.map((genre, index) => (
                  <span key={index} className="label-tag genre-tag">
                    {genre}
                  </span>
                ))}
              </div>
            </div>

            <div className="tags-section">
              <h3>Other</h3>
              <div className="tags-container">
                {game.otherLabels.map((tag, index) => (
                  <span key={index} className="label-tag other-tag">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 使用新的 ImpactVisualization 元件 */}
      <ImpactVisualization game={game} />
    </div>
  );
};

export default GameDetail;
