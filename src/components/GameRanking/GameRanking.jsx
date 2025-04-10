import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./GameRanking.css";
import FilterModal from "./FilterModal";

const GameRanking = ({ gameData, genres, pegiRatings, getGameSlug }) => {
  // 是否顯示過濾器 Modal
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 當前選中的 Genre 過濾標籤
  const [activeGenreFilters, setActiveGenreFilters] = useState([
    "Open World",
    "Sandbox",
  ]);

  // Modal 內臨時存儲的 Genre 過濾標籤
  const [tempGenreFilters, setTempGenreFilters] = useState([]);

  // 當前選中的 PEGI 過濾標籤（預設選中 PEGI 7）
  const [selectedPegiRating, setSelectedPegiRating] = useState("7");

  // Modal 內臨時存儲的 PEGI 過濾標籤
  const [tempPegiRating, setTempPegiRating] = useState("");

  // 在組件載入時從 sessionStorage 中讀取過濾器設置
  useEffect(() => {
    try {
      // 讀取 Genre 過濾器
      const savedGenreFilters = sessionStorage.getItem(
        "gameRankingGenreFilters"
      );
      if (savedGenreFilters) {
        setActiveGenreFilters(JSON.parse(savedGenreFilters));
      }

      // 讀取 PEGI 過濾器
      const savedPegiRating = sessionStorage.getItem("gameRankingPegiRating");
      // 設置 PEGI 值，如果不存在則使用預設值 "7"
      if (savedPegiRating !== null) {
        setSelectedPegiRating(savedPegiRating);
      }
    } catch (error) {
      console.error("無法從 sessionStorage 中讀取過濾器設置:", error);
    }
  }, []);

  // 保存過濾器設置到 sessionStorage
  const saveFiltersToSessionStorage = (genres, pegi) => {
    try {
      sessionStorage.setItem("gameRankingGenreFilters", JSON.stringify(genres));
      // 總是保存 pegi 值，即使是空字串
      sessionStorage.setItem("gameRankingPegiRating", pegi || "");
    } catch (error) {
      console.error("無法將過濾器設置保存到 sessionStorage:", error);
    }
  };

  // 打開 Modal 時初始化臨時過濾標籤
  const openFilterModal = () => {
    setTempGenreFilters([...activeGenreFilters]);
    setTempPegiRating(selectedPegiRating);
    setShowFilterModal(true);
  };

  // 應用過濾器設置並保存到 sessionStorage
  const applyFilters = () => {
    setActiveGenreFilters([...tempGenreFilters]);
    setSelectedPegiRating(tempPegiRating);
    saveFiltersToSessionStorage(tempGenreFilters, tempPegiRating);
    setShowFilterModal(false);
  };

  // 關閉 Modal
  const closeModal = () => {
    setShowFilterModal(false);
  };

  // 移除 Genre 過濾標籤並更新 sessionStorage
  const removeGenreFilter = (filter) => {
    const newFilters = activeGenreFilters.filter((f) => f !== filter);
    setActiveGenreFilters(newFilters);
    saveFiltersToSessionStorage(newFilters, selectedPegiRating);
  };

  // 添加 Genre 過濾標籤並更新 sessionStorage
  const addGenreFilter = (filter) => {
    if (!activeGenreFilters.includes(filter)) {
      const newFilters = [...activeGenreFilters, filter];
      setActiveGenreFilters(newFilters);
      saveFiltersToSessionStorage(newFilters, selectedPegiRating);
    }
  };

  // 移除 PEGI 過濾標籤並更新 sessionStorage
  const removePegiFilter = () => {
    setSelectedPegiRating("");
    // 保存空字串到 sessionStorage
    saveFiltersToSessionStorage(activeGenreFilters, "");
  };

  // 移除 Genre 過濾標籤（Modal 內使用）
  const toggleGenreFilter = (filter) => {
    if (tempGenreFilters.includes(filter)) {
      setTempGenreFilters(tempGenreFilters.filter((f) => f !== filter));
    } else {
      setTempGenreFilters([...tempGenreFilters, filter]);
    }
  };

  // 設置 PEGI 分級過濾（Modal 內使用）
  const setTempPegiFilter = (rating) => {
    // 如果點擊的是當前已選中的評級，則取消選擇
    if (tempPegiRating === rating) {
      setTempPegiRating("");
    } else {
      setTempPegiRating(rating);
    }
  };

  // 過濾遊戲資料
  const filteredGames = gameData.filter((game) => {
    // Genre 過濾邏輯：遊戲必須包含所有選中的 genre 標籤
    const genreMatch =
      activeGenreFilters.length === 0 ||
      activeGenreFilters.every((filter) => game.genres.includes(filter));

    // PEGI 過濾邏輯：遊戲的分級必須不超過所選分級，若無分級限制則顯示所有遊戲
    const pegiMatch =
      selectedPegiRating === "" ||
      parseInt(game.pegiRating) <= parseInt(selectedPegiRating);

    return genreMatch && pegiMatch;
  });

  // 計算每個流派在遊戲數據中出現的次數
  const genreCounts = genres.reduce((acc, genre) => {
    const count = gameData.filter((game) => game.genres.includes(genre)).length;
    if (count > 0) {
      acc[genre] = count;
    }
    return acc;
  }, {});

  return (
    <div className="ranking-container">
      <h2>Game Ranking</h2>

      <div className="filter-container">
        <div className="filter-actions">
          <div className="filter-buttons">
            <button className="filter-button" onClick={openFilterModal}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
              </svg>
              Filter
            </button>
          </div>
          <div className="tag-container">
            {/* Genre 過濾標籤 */}
            {activeGenreFilters.map((filter, index) => (
              <div key={`genre-${index}`} className="tag genre-tag">
                {filter}
                <button
                  className="tag-remove"
                  onClick={() => removeGenreFilter(filter)}
                >
                  ×
                </button>
              </div>
            ))}

            {/* PEGI 分級標籤，只有當 selectedPegiRating 不為空時顯示 */}
            {selectedPegiRating !== "" && (
              <div className="tag pegi-tag">
                PEGI {selectedPegiRating}+
                <button className="tag-remove" onClick={removePegiFilter}>
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 過濾器 Modal 組件 */}
      <FilterModal
        showModal={showFilterModal}
        onClose={closeModal}
        tempGenreFilters={tempGenreFilters}
        toggleGenreFilter={toggleGenreFilter}
        genreCounts={genreCounts}
        tempPegiRating={tempPegiRating}
        setTempPegiFilter={setTempPegiFilter}
        allPegiRatings={pegiRatings}
        applyFilters={applyFilters}
      />

      <div className="table-container">
        <table className="ranking-table">
          <thead>
            <tr>
              <th className="game-title">Game</th>
              <th className="sales">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  Sales
                  <svg
                    className="sort-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </div>
              </th>
              <th className="pegi-rating">PEGI Rating</th>
              <th className="label" style={{ textAlign: "left" }}>
                Genre
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredGames.map((game, index) => (
              <tr key={index}>
                <td style={{ textAlign: "left" }}>
                  <Link
                    to={`/game/${getGameSlug(game.title)}`}
                    className="game-title-link"
                  >
                    <div className="game-info">
                      <img
                        src={game.featuredImage}
                        alt={game.title}
                        className="game-thumbnail"
                      />
                      <span>{game.title}</span>
                    </div>
                  </Link>
                </td>
                <td>{game.sales}</td>
                <td>
                  <div className={`rating-box pegi-${game.pegiRating}`}>
                    {game.pegiRating}
                  </div>
                </td>
                <td>
                  <div className="label-container">
                    {game.genres.map((genre, genreIndex) => (
                      <span key={genreIndex} className="label-tag">
                        {genre}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameRanking;
