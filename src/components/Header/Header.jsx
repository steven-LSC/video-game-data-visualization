import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { gameDataStore } from "../Introduction/Introduction";
import "./Header.css";

const Header = () => {
  const location = useLocation();
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(
    gameDataStore.gameList.length > 0
  );

  // 在組件載入時，如果遊戲資料尚未加載，則加載遊戲資料
  useEffect(() => {
    const loadGameData = async () => {
      if (gameDataStore.gameList.length === 0) {
        try {
          await gameDataStore.loadDataFromJSON();
          setDataLoaded(true);
        } catch (error) {
          console.error("Failed to load game data in header:", error);
        }
      }
    };

    loadGameData();
  }, []);

  // 搜索遊戲的函數
  const searchGames = (query) => {
    if (!gameDataStore.gameList.length) {
      setSearchResults([]);
      return;
    }

    // 如果查詢為空或只有空格，顯示銷量排名前5的遊戲
    if (!query.trim()) {
      const topSalesGames = [...gameDataStore.gameList]
        .sort((a, b) => {
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
        })
        .slice(0, 5); // 取前5名

      setSearchResults(topSalesGames);
      return;
    }

    const simplifiedQuery = query.toLowerCase().trim();

    // 多策略匹配算法
    const results = gameDataStore.gameList.map((game) => {
      // 分數初始化為0
      let score = 0;
      const gameTitle = game.title.toLowerCase();

      // 策略1: 完全匹配 (最高分)
      if (gameTitle === simplifiedQuery) {
        score += 100;
      }

      // 策略2: 標題開頭匹配 (次高分)
      else if (gameTitle.startsWith(simplifiedQuery)) {
        score += 75;
      }

      // 策略3: 字詞開頭匹配 (例如：查詢"theft"匹配"Grand Theft Auto")
      else if (gameTitle.includes(` ${simplifiedQuery}`)) {
        score += 60;
      }

      // 策略4: 標題的任何位置包含查詢詞 (基本分)
      else if (gameTitle.includes(simplifiedQuery)) {
        score += 50;
      }

      // 策略5: 簡單的標記匹配 (基於單詞的匹配)
      const gameTitleTokens = gameTitle.split(/\s+/);
      const queryTokens = simplifiedQuery.split(/\s+/);

      // 計算匹配的標記數量
      const matchingTokensCount = queryTokens.filter((token) =>
        gameTitleTokens.some((gameToken) => gameToken.includes(token))
      ).length;

      if (matchingTokensCount > 0) {
        // 每個匹配標記增加分數
        score += matchingTokensCount * 10;
      }

      // 使用首字母作為縮寫的匹配
      // 例如：GTA可以匹配Grand Theft Auto
      if (simplifiedQuery.length > 1 && simplifiedQuery.length <= 5) {
        // 生成遊戲標題的首字母縮寫
        const acronym = gameTitleTokens.map((token) => token[0]).join("");
        if (acronym.toLowerCase() === simplifiedQuery) {
          score += 80; // 縮寫匹配給予較高分數
        }
      }

      return { game, score };
    });

    // 過濾掉沒有匹配的結果，並按分數排序
    const matches = results
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((result) => result.game);

    // 只顯示前5個結果
    setSearchResults(matches.slice(0, 5));
  };

  // 當用戶輸入變化時搜索
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    searchGames(value);
    setShowResults(true);
  };

  // 當用戶點擊搜索欄時顯示推薦
  const handleSearchFocus = () => {
    if (!searchText.trim()) {
      searchGames(""); // 顯示銷量前5的遊戲
    }
    setShowResults(true);
  };

  // 選擇搜索結果
  const handleSelectResult = (game) => {
    setSearchText(game.title);
    setShowResults(false);
    // 跳轉到遊戲詳情頁
    window.location.href = `/game/${gameDataStore.getGameSlug(game.title)}`;
  };

  // 點擊外部關閉結果
  const handleClickOutside = () => {
    setShowResults(false);
  };

  // 如果當前路徑是首頁，不顯示header
  if (location.pathname === "/") {
    return null;
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="header-flex">
          <div className="logo">
            <Link to="/">
              <img
                src="/images/logo.png"
                alt="Game Guardian"
                className="logo-image"
              />
            </Link>
          </div>

          <div className="search-container">
            <div className="search-input-wrapper">
              <input
                type="text"
                className="search-bar"
                placeholder="Enter a game name..."
                value={searchText}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                onBlur={() => setTimeout(() => handleClickOutside(), 200)}
              />
              {searchText ? (
                <button
                  className="clear-search"
                  onClick={() => {
                    setSearchText("");
                    // 清除後顯示推薦
                    searchGames("");
                    setShowResults(true);
                  }}
                  aria-label="Clear search"
                >
                  ×
                </button>
              ) : (
                <img
                  src="/icons/search-icon.svg"
                  alt="Search"
                  className="search-icon"
                />
              )}
              {showResults && searchResults.length > 0 && (
                <div className="search-results">
                  {searchResults.map((game, index) => (
                    <div
                      key={index}
                      className="search-result-item"
                      onClick={() => handleSelectResult(game)}
                    >
                      <img
                        src={game.featuredImage}
                        alt={game.title}
                        className="result-thumbnail"
                      />
                      <div className="result-info">
                        <div className="result-title">{game.title}</div>
                        <div className="result-genre">
                          {game.genres.join(", ")}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
