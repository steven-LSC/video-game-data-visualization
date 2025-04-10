import React, { useState, useEffect } from "react";
import "./Introduction.css";
import GameRanking from "../GameRanking/GameRanking";
import AggressionAnalysis from "../AggressionAnalysis/AggressionAnalysis";
import AnxietyAnalysis from "../AnxietyAnalysis/AnxietyAnalysis";

// 應用程式的全局遊戲資料存儲
export const gameDataStore = {
  // 遊戲列表
  gameList: [],

  // 所有遊戲流派
  genres: [],

  // 所有可能的 PEGI 分級，按照從低到高的順序排列
  pegiRatings: ["3", "7", "12", "16", "18"],

  // 將遊戲標題轉換為URL友好的slug格式
  getGameSlug: (title) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  },

  // 根據 slug 獲取遊戲數據
  getGameBySlug: (slug) => {
    const normalizedSlug = slug
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
    return gameDataStore.gameList.find(
      (game) => gameDataStore.getGameSlug(game.title) === normalizedSlug
    );
  },

  // 從 JSON 檔案加載遊戲數據
  loadDataFromJSON: async () => {
    try {
      console.log("開始讀取遊戲數據...");

      // 同時加載遊戲資料和流派資料
      const [gamesResponse, genresResponse] = await Promise.all([
        fetch("/games.json"),
        fetch("/genres.json"),
      ]);

      if (!gamesResponse.ok || !genresResponse.ok) {
        throw new Error("無法讀取遊戲數據或流派數據");
      }

      const games = await gamesResponse.json();
      const genres = await genresResponse.json();

      // 更新遊戲列表和流派列表
      gameDataStore.gameList = games;
      gameDataStore.genres = genres;

      console.log(`成功載入 ${games.length} 個遊戲和 ${genres.length} 個流派`);
    } catch (error) {
      console.error("讀取 JSON 數據失敗:", error);
      throw error;
    }
  },
};

const Introduction = () => {
  const [dataLoaded, setDataLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  // 搜索遊戲的函數
  const searchGames = (query) => {
    if (!query.trim() || !gameDataStore.gameList.length) {
      setSearchResults([]);
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

  // 在組件載入時讀取數據
  useEffect(() => {
    const loadData = async () => {
      try {
        await gameDataStore.loadDataFromJSON();
        setDataLoaded(true);
      } catch (error) {
        console.error("載入遊戲數據失敗:", error);
        setError("無法載入遊戲數據，請刷新頁面重試");
        // 設置為已加載，這樣用戶會看到錯誤訊息
        setDataLoaded(true);
      }
    };

    loadData();
  }, []);

  return (
    <div className="introduction-container">
      <section className="hero-section">
        <div className="product-title">
          <h1>Game Data Insights</h1>
          <p className="subtitle">Search a Video Game to Learn More!</p>
        </div>
        <div className="search-container">
          <div className="search-input-wrapper">
            <input
              type="text"
              className="search-bar"
              placeholder="Enter a game name..."
              value={searchText}
              onChange={handleSearchChange}
              onBlur={() => setTimeout(() => handleClickOutside(), 200)}
            />
            {searchText && (
              <button
                className="clear-search"
                onClick={() => {
                  setSearchText("");
                  setSearchResults([]);
                }}
                aria-label="Clear search"
              >
                ×
              </button>
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

        <div className="why-content">
          <h2>Why did we make this website?</h2>
          <p>
            In modern game development, data analysis plays a crucial role. Our
            platform aims to help developers and analysts better understand
            player behavior, game performance, and market trends. Through
            intuitive data visualization, we make complex data simple and
            understandable.
          </p>
        </div>
      </section>

      <section className="ranking-section">
        {dataLoaded ? (
          error ? (
            <div className="error-message">{error}</div>
          ) : (
            <GameRanking
              gameData={gameDataStore.gameList}
              genres={gameDataStore.genres}
              pegiRatings={gameDataStore.pegiRatings}
              getGameSlug={gameDataStore.getGameSlug}
            />
          )
        ) : (
          <div className="loading">載入數據中...</div>
        )}
      </section>

      <section className="analysis-section">
        <h2 className="section-title">Gaming Hours and Aggression Analysis</h2>
        <div className="section-description">
          <p>
            According to our research, longer gaming hours, especially violent
            games, do lead to more aggressive behaviors.
          </p>
        </div>
        <AggressionAnalysis />
      </section>

      <section className="analysis-section">
        <h2 className="section-title">
          Gaming Hours and Mental Health Analysis
        </h2>
        <div className="section-description">
          <p>
            There is no significant correlation between weekly gaming hours and
            anxiety, life satisfaction, or social phobia. The more time spent
            playing games, the less likely it is to increase anxiety or social
            phobia, and it does not reduce life satisfaction.
          </p>
        </div>
        <AnxietyAnalysis />
      </section>
    </div>
  );
};

export default Introduction;
