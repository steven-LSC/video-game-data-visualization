import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./GameRanking.module.css";
import FilterModal from "./FilterModal";

const GameRanking = ({
  gameData,
  genres,
  pegiRatings,
  getGameSlug,
  currentGameGenres = [],
  currentGamePegi = "",
}) => {
  // 是否顯示過濾器 Modal
  const [showFilterModal, setShowFilterModal] = useState(false);

  // 用來標記是否已經初始化
  const isInitialized = useRef(false);

  // 當前選中的 Genre 過濾標籤
  const [activeGenreFilters, setActiveGenreFilters] = useState(
    currentGameGenres.length > 0
      ? [...currentGameGenres]
      : ["Open World", "Sandbox"]
  );

  // Modal 內臨時存儲的 Genre 過濾標籤
  const [tempGenreFilters, setTempGenreFilters] = useState([]);

  // 當前選中的 PEGI 過濾標籤（預設選中傳入的PEGI或PEGI 7）
  const [selectedPegiRating, setSelectedPegiRating] = useState(
    currentGamePegi || "7"
  );

  // Modal 內臨時存儲的 PEGI 過濾標籤
  const [tempPegiRating, setTempPegiRating] = useState("");

  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 5;

  // 在組件載入時從 sessionStorage 中讀取過濾器設置，如果沒有傳入當前遊戲的過濾器
  useEffect(() => {
    // 避免重覆初始化和無限循環
    if (isInitialized.current) {
      return;
    }

    // 如果傳入了當前遊戲的過濾器，則優先使用這些，且不再讀取 sessionStorage
    if (currentGameGenres.length > 0 || currentGamePegi) {
      isInitialized.current = true;
      return;
    }

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

      isInitialized.current = true;
    } catch (error) {
      console.error("無法從 sessionStorage 中讀取過濾器設置:", error);
      isInitialized.current = true;
    }
  }, []); // 移除依賴項，只在組件掛載時執行一次

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
    setCurrentPage(1); // 重置到第一頁
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
    setCurrentPage(1); // 重置到第一頁
  };

  // 添加 Genre 過濾標籤並更新 sessionStorage
  const addGenreFilter = (filter) => {
    if (!activeGenreFilters.includes(filter)) {
      const newFilters = [...activeGenreFilters, filter];
      setActiveGenreFilters(newFilters);
      saveFiltersToSessionStorage(newFilters, selectedPegiRating);
      setCurrentPage(1); // 重置到第一頁
    }
  };

  // 移除 PEGI 過濾標籤並更新 sessionStorage
  const removePegiFilter = () => {
    setSelectedPegiRating("");
    // 保存空字串到 sessionStorage
    saveFiltersToSessionStorage(activeGenreFilters, "");
    setCurrentPage(1); // 重置到第一頁
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

  // 根據 Sales 排序遊戲（降序）
  const sortedGames = [...filteredGames].sort((a, b) => {
    // 如果 sales 是字符串，先轉換為數字
    const salesA =
      typeof a.sales === "string"
        ? parseInt(a.sales.replace(/[^0-9]/g, ""))
        : a.sales;
    const salesB =
      typeof b.sales === "string"
        ? parseInt(b.sales.replace(/[^0-9]/g, ""))
        : b.sales;

    return salesB - salesA; // 降序排列
  });

  // 分頁邏輯：計算當前頁應顯示的遊戲
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = sortedGames.slice(indexOfFirstGame, indexOfLastGame);

  // 計算總頁數
  const totalPages = Math.max(1, Math.ceil(sortedGames.length / gamesPerPage));

  // 頁面切換函數
  const paginate = (pageNumber) => {
    if (totalPages === 0) return;
    setCurrentPage(pageNumber);
  };

  // 計算每個流派在遊戲數據中出現的次數
  const genreCounts = genres.reduce((acc, genre) => {
    const count = gameData.filter((game) => game.genres.includes(genre)).length;
    if (count > 0) {
      acc[genre] = count;
    }
    return acc;
  }, {});

  return (
    <div className={styles.rankingContainer}>
      <div className={styles.filterContainer}>
        <div className={styles.filterActions}>
          <button className={styles.filterButton} onClick={openFilterModal}>
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
          <div className={styles.tagContainer}>
            {/* Genre 過濾標籤 */}
            {activeGenreFilters.map((filter, index) => (
              <div
                key={`genre-${index}`}
                className={`${styles.tag} ${styles.genreTag}`}
              >
                {filter}
                <button
                  className={styles.tagRemove}
                  onClick={() => removeGenreFilter(filter)}
                >
                  ×
                </button>
              </div>
            ))}

            {/* PEGI 分級標籤 */}
            {selectedPegiRating !== "" && (
              <div
                className={`${styles.tag} ${styles.pegiTag}`}
                data-rating={selectedPegiRating}
              >
                PEGI {selectedPegiRating}+
                <button className={styles.tagRemove} onClick={removePegiFilter}>
                  ×
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <table className={styles.rankingTable}>
          <thead>
            <tr>
              <th className={styles.gameTitle}>Game Title</th>
              <th className={styles.sales}>Sales</th>
              <th className={styles.pegiRating}>PEGI</th>
              <th className={styles.label}>Labels</th>
            </tr>
          </thead>
          <tbody>
            {currentGames.map((game) => (
              <tr key={game.title}>
                <td>
                  <Link
                    to={`/game/${getGameSlug(game.title)}`}
                    className={styles.gameTitleLink}
                  >
                    <div className={styles.gameInfo}>
                      <img
                        src={game.featuredImage}
                        alt={game.title}
                        className={styles.gameThumbnail}
                      />
                      <span>{game.title}</span>
                    </div>
                  </Link>
                </td>
                <td>{game.sales}</td>
                <td>
                  <div
                    className={`${styles.ratingBox} ${
                      styles[`pegi${game.pegiRating}`]
                    }`}
                    onClick={() => {
                      setSelectedPegiRating(game.pegiRating);
                      saveFiltersToSessionStorage(
                        activeGenreFilters,
                        game.pegiRating
                      );
                      setCurrentPage(1);
                    }}
                  >
                    {game.pegiRating}
                  </div>
                </td>
                <td>
                  <div className={styles.labelContainer}>
                    {game.genres.map((genre, index) => (
                      <span
                        key={index}
                        className={styles.tableLabelTag}
                        onClick={() => addGenreFilter(genre)}
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
            {/* 添加空白行來保持固定高度 */}
            {[...Array(Math.max(0, 5 - currentGames.length))].map(
              (_, index) => (
                <tr key={`empty-${index}`} className={styles.emptyRow}>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className={styles.pagination}>
        <button
          className={styles.paginationButton}
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className={styles.pageInfo}>
          {currentPage} of {totalPages}
        </span>
        <button
          className={styles.paginationButton}
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {/* Filter Modal */}
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
    </div>
  );
};

export default GameRanking;
