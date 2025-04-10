import React, { useState, useEffect } from "react";
import "./Introduction.css";
import GameRanking from "../GameRanking/GameRanking";

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
      <section className="why-section">
        <div className="container">
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
    </div>
  );
};

export default Introduction;
