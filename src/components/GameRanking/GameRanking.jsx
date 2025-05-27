import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import styles from "./GameRanking.module.css";

const GameRanking = ({
  gameData,
  genres,
  pegiRatings,
  getGameSlug,
  currentGameGenres = [],
  currentGamePegi = "",
}) => {
  // 檢查是否來自 Game Detail 頁面（有傳入過濾器參數）
  const isFromGameDetail = currentGameGenres.length > 0 || currentGamePegi;

  // 用來標記是否已經初始化
  const isInitialized = useRef(false);

  // 當前選中的 Genre 過濾標籤
  const [activeGenreFilters, setActiveGenreFilters] = useState(() => {
    if (isFromGameDetail) {
      // 如果來自 Game Detail，直接使用傳入的參數
      return [...currentGameGenres];
    } else {
      // 如果是首頁，嘗試從 sessionStorage 讀取，否則使用預設值
      try {
        const saved = sessionStorage.getItem("gameRankingGenreFilters");
        return saved ? JSON.parse(saved) : ["Open World", "Sandbox"];
      } catch {
        return ["Open World", "Sandbox"];
      }
    }
  });

  // 當前選中的 PEGI 過濾標籤
  const [selectedPegiRating, setSelectedPegiRating] = useState(() => {
    if (isFromGameDetail) {
      // 如果來自 Game Detail，直接使用傳入的參數
      return currentGamePegi || "7";
    } else {
      // 如果是首頁，嘗試從 sessionStorage 讀取，否則使用預設值
      try {
        const saved = sessionStorage.getItem("gameRankingPegiRating");
        return saved !== null ? saved : "7";
      } catch {
        return "7";
      }
    }
  });

  // 分頁相關狀態
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 5;

  // 監聽 props 變化，當從 Game Detail 傳入新的過濾器時更新狀態
  useEffect(() => {
    if (isFromGameDetail) {
      setActiveGenreFilters([...currentGameGenres]);
      setSelectedPegiRating(currentGamePegi || "7");
      setCurrentPage(1);
    }
  }, [currentGameGenres, currentGamePegi, isFromGameDetail]);

  // 保存過濾器設置到 sessionStorage（只有首頁才儲存）
  const saveFiltersToSessionStorage = (genres, pegi) => {
    // 只有在首頁（非來自 Game Detail）時才儲存到 sessionStorage
    if (!isFromGameDetail) {
      try {
        sessionStorage.setItem(
          "gameRankingGenreFilters",
          JSON.stringify(genres)
        );
        sessionStorage.setItem("gameRankingPegiRating", pegi || "");
      } catch (error) {
        console.error("無法將過濾器設置保存到 sessionStorage:", error);
      }
    }
  };

  // 處理 Genre 過濾標籤的選擇
  const toggleGenreFilter = (filter) => {
    let newFilters;
    if (activeGenreFilters.includes(filter)) {
      newFilters = activeGenreFilters.filter((f) => f !== filter);
    } else {
      newFilters = [...activeGenreFilters, filter];
    }
    setActiveGenreFilters(newFilters);
    saveFiltersToSessionStorage(newFilters, selectedPegiRating);
    setCurrentPage(1); // 重置到第一頁
  };

  // 處理 PEGI 過濾標籤的選擇
  const togglePegiFilter = (rating) => {
    const newRating = selectedPegiRating === rating ? "" : rating;
    setSelectedPegiRating(newRating);
    saveFiltersToSessionStorage(activeGenreFilters, newRating);
    setCurrentPage(1); // 重置到第一頁
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

  // 計算每個流派在當前過濾結果中出現的次數
  const getAvailableGenres = () => {
    // 獲取基於 PEGI 過濾的遊戲（不考慮 Genre 過濾）
    const pegiFilteredGames = gameData.filter((game) => {
      const pegiMatch =
        selectedPegiRating === "" ||
        parseInt(game.pegiRating) <= parseInt(selectedPegiRating);
      return pegiMatch;
    });

    // 如果沒有選擇任何 Genre，使用 PEGI 過濾後的遊戲
    // 如果選擇了 Genre，使用完整的過濾結果
    const baseGames =
      activeGenreFilters.length === 0 ? pegiFilteredGames : filteredGames;

    // 計算在當前過濾結果中每個 Genre 的出現次數
    const genreCounts = {};

    baseGames.forEach((game) => {
      game.genres.forEach((genre) => {
        if (genreCounts[genre]) {
          genreCounts[genre]++;
        } else {
          genreCounts[genre] = 1;
        }
      });
    });

    // 只返回有遊戲的 Genre，並按字母順序排序
    return Object.entries(genreCounts)
      .filter(([genre, count]) => count > 0)
      .sort(([a], [b]) => a.localeCompare(b));
  };

  // 準備顯示的 Genre 列表 - 基於當前過濾結果動態計算
  const genreEntries = getAvailableGenres();

  return (
    <div className={styles.rankingContainer}>
      <div className={styles.filterContainer}>
        {/* PEGI 過濾區塊 */}
        <div className={styles.filterSection}>
          <h4>PEGI Rating</h4>
          <div className={`${styles.filterOptions} ${styles.pegiOptions}`}>
            {pegiRatings.map((rating) => (
              <div
                key={rating}
                className={`${styles.filterOption} ${
                  selectedPegiRating === rating
                    ? styles.filterOptionSelected
                    : ""
                }`}
                onClick={() => togglePegiFilter(rating)}
                data-rating={rating}
              >
                PEGI {rating}+
              </div>
            ))}
          </div>
        </div>

        {/* Genre 過濾區塊 */}
        <div className={styles.filterSection}>
          <h4>Genre</h4>
          <div className={`${styles.filterOptions} ${styles.genreOptions}`}>
            {genreEntries.map(([genre, count]) => (
              <div
                key={genre}
                className={`${styles.filterOption} ${
                  activeGenreFilters.includes(genre)
                    ? styles.filterOptionSelected
                    : ""
                }`}
                onClick={() => toggleGenreFilter(genre)}
              >
                {genre} ({count})
              </div>
            ))}
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
                  >
                    {game.pegiRating}
                  </div>
                </td>
                <td>
                  <div className={styles.labelContainer}>
                    {game.genres.map((genre, index) => (
                      <span key={index} className={styles.tableLabelTag}>
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
    </div>
  );
};

export default GameRanking;
