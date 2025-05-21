import React, { useState, useEffect } from "react";
import styles from "./Introduction.module.css";
import GameRanking from "../GameRanking/GameRanking";
import GamingHoursAggressionAnalysis from "../GamingHoursAggressionAnalysis/GamingHoursAggressionAnalysis";
import GamingHoursMentalHealthAnalysis from "../GamingHoursMentalHealthAnalysis/GamingHoursMentalHealthAnalysis";
import GameTypesAnalysis from "../GameTypesAnalysis/GameTypesAnalysis";
import GamingHoursCreativityAnalysis from "../GamingHoursCreativityAnalysis/GamingHoursCreativityAnalysis";
import Carousel from "../Carousel/Carousel";
import ChartExplanation from "./ChartExplanation";

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
  const [carouselItems, setCarouselItems] = useState([]);
  const [negativeCarouselItems, setNegativeCarouselItems] = useState([]);
  const [currentMetric, setCurrentMetric] = useState("Anxiety");
  const [currentGameType, setCurrentGameType] = useState("gameHours");

  // 圖表說明內容
  const aggressionExplanations = [
    `This chart shows the relationship between ${
      currentGameType === "gameHours"
        ? "general gaming hours"
        : "violent gaming hours"
    } and aggression scores.`,
    `Each dot represents a participant with the specified ${
      currentGameType === "gameHours" ? "gaming hours" : "violent gaming hours"
    } and aggression score. The red line shows the average aggression score for each time category.`,
    `You can switch between general gaming hours and violent gaming hours using the tabs above.`,
  ];

  const mentalHealthExplanations = [
    `This bubble chart shows the relationship between daily gaming hours and ${currentMetric} scores.`,
    `Each bubble represents a group of participants with the same gaming hours and ${currentMetric} score. The size of the bubble indicates the number of participants in that group.`,
    `The red line shows the average ${currentMetric} score for each gaming hour, calculated only for hours with at least 5 participants.`,
    `You can switch between different mental health metrics using the tabs above.`,
  ];

  const creativityExplanations = [
    `This chart shows the relationship between daily gaming hours and creativity scores (TTCT).`,
    `Each blue dot represents an individual participant with their gaming time and creativity score. The size of the scattered points indicates the number of participants with the same values.`,
    `The red line shows the average creativity score for each gaming time category, revealing trends in how gaming time might relate to creativity levels.`,
    `Gaming time categories range from non-gamers to those who play more than 6 hours daily.`,
  ];

  const gameTypesExplanations = [
    `This bubble chart shows the relationship between different game types and creativity scores.`,
    `Each bubble represents a combination of game type and play frequency. The size and color intensity of the bubble indicate the average creativity score - larger and darker bubbles represent higher scores.`,
    `The vertical axis (1-5) represents how frequently participants play each game type, with 5 being the most frequent.`,
    `You can switch between different metrics using the tabs above to explore various relationships.`,
  ];

  // 接收來自子組件的指標更新
  const handleMetricChange = (metric) => {
    setCurrentMetric(metric);
  };

  const handleGameTypeChange = (type) => {
    setCurrentGameType(type);
  };

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
        // 同時加載遊戲資料和輪播資料
        const loadCarouselData = fetch("/positive-news.json").then((res) =>
          res.json()
        );
        // 加載負面影響輪播數據
        const loadNegativeCarouselData = fetch("/negative-news.json").then(
          (res) => res.json()
        );

        await gameDataStore.loadDataFromJSON();

        // 設置輪播數據
        const carouselData = await loadCarouselData;
        setCarouselItems(
          carouselData.map((item) => ({
            title: item.title,
            description: item.content,
            image: item.image,
            link: item.link,
          }))
        );

        // 設置負面影響輪播數據（假設你會添加一個新的狀態來存儲它）
        const negativeCarouselData = await loadNegativeCarouselData;
        setNegativeCarouselItems(
          negativeCarouselData.map((item) => ({
            title: item.title,
            description: item.content,
            image: item.image,
            link: item.link,
          }))
        );

        setDataLoaded(true);
      } catch (error) {
        console.error("Loading data failed:", error);
        setError("Unable to load data. Please refresh the page and try again.");
        // 設置為已加載，這樣用戶會看到錯誤訊息
        setDataLoaded(true);
      }
    };

    loadData();
  }, []);

  return (
    <div className={styles.introductionContainer}>
      <section className={`${styles.heroSection} ${styles.section}`}>
        <div className={styles.productTitle}>
          <h1>Game Guardian</h1>
          <p className={styles.subtitle}>Search a Video Game to Learn More!</p>
        </div>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchBar}
              placeholder="Enter a game name..."
              value={searchText}
              onChange={handleSearchChange}
              onBlur={() => setTimeout(() => handleClickOutside(), 200)}
            />
            {searchText && (
              <button
                className={styles.clearSearch}
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
              <div className={styles.searchResults}>
                {searchResults.map((game, index) => (
                  <div
                    key={index}
                    className={styles.searchResultItem}
                    onClick={() => handleSelectResult(game)}
                  >
                    <img
                      src={game.featuredImage}
                      alt={game.title}
                      className={styles.resultThumbnail}
                    />
                    <div className={styles.resultInfo}>
                      <div className={styles.resultTitle}>{game.title}</div>
                      <div className={styles.resultGenre}>
                        {game.genres.join(", ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={styles.whyContent}>
          <h2>Why did we make this website?</h2>
          <p>Video games are powerful—and complex.</p>
          <p>
            They can support learning, focus, and social connection, but they
            also raise valid concerns like addiction, excessive screen time, and
            behavioral risks. We believe users deserve a space to explore both
            sides, grounded in real data—not assumptions. That's why we built
            this website.
          </p>
          <p>Here, you can:</p>
          <ul>
            <li>
              Dive into research-backed sections on both the concerns and
              benefits of video games
            </li>
            <li>
              Search individual titles to see their key features and potential
              impacts
            </li>
            <li>
              Use checkbox filters to find or avoid games with similar traits
            </li>
            <li>
              Browse our Editor's Picks, featuring:
              <ul>
                <li>
                  🎮 Accessibility – games well-suited for younger or
                  inexperienced players
                </li>
                <li>
                  🏆 Artistry – award-winning or critically acclaimed titles
                </li>
                <li>
                  🔥 Popularity – games selected by community votes and cultural
                  buzz
                </li>
              </ul>
            </li>
          </ul>
          <p>
            Our goal is simple: to offer a comprehensive, balanced perspective
            on games—whether you're a parent, educator, or gamer yourself.
          </p>
        </div>
      </section>

      <section className={`${styles.rankingSection} ${styles.section}`}>
        {dataLoaded ? (
          error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : (
            <>
              <h2 className={styles.sectionTitle}>Game Ranking</h2>
              <div className={styles.sectionDescription}>
                <p>
                  Explore the positive impacts and benefits that video games can
                  bring. Discover how different types of games can enhance
                  various skills and provide entertainment value. Click on the
                  cards to learn more.
                </p>
              </div>
              <GameRanking
                gameData={gameDataStore.gameList}
                genres={gameDataStore.genres}
                pegiRatings={gameDataStore.pegiRatings}
                getGameSlug={gameDataStore.getGameSlug}
              />
            </>
          )
        ) : (
          <div className={styles.loading}>Loading data...</div>
        )}
      </section>

      <section
        className={`${styles.carouselSection} ${styles.positiveCarousel} ${styles.section}`}
      >
        <h2 className={styles.sectionTitle}>
          Understanding the <span className={styles.benefitText}>Benefits</span>{" "}
          of Video Games
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            Explore the positive impacts and benefits that video games can
            bring. Discover how different types of games can enhance various
            skills and provide entertainment value. Click on the cards to learn
            more.
          </p>
        </div>
        {carouselItems.length > 0 && <Carousel items={carouselItems} />}
      </section>

      <section
        className={`${styles.carouselSection} ${styles.negativeCarousel} ${styles.section}`}
      >
        <h2 className={styles.sectionTitle}>
          Understanding the <span className={styles.concernText}>Concerns</span>{" "}
          Around Video Games
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            Video games are often linked in the media to issues like violence,
            addiction, and social withdrawal. Reports raise valid concerns about
            their potential impact on mental health and behavior, especially in
            young users. However, these narratives often overlook context, such
            as individual differences or broader societal factors. It's
            important to critically assess these claims and seek a balanced
            understanding.
          </p>
        </div>
        {negativeCarouselItems && negativeCarouselItems.length > 0 && (
          <Carousel
            items={negativeCarouselItems}
            className="negative-carousel"
          />
        )}
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>
          Gaming Hours and Aggression Analysis
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            According to our research, longer gaming hours, especially violent
            games, do lead to a little bit more aggressive behaviors, but not
            very obvious. Our Recommendation: Don't play games / video games
            more than 2 hours a day.
          </p>
        </div>
        <GamingHoursAggressionAnalysis
          onGameTypeChange={handleGameTypeChange}
        />
        <ChartExplanation explanations={aggressionExplanations} />
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>
          Gaming Hours and Mental Health Analysis
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            There is no significant correlation between weekly gaming hours and
            anxiety, life satisfaction, or social phobia. The more time spent
            playing games, the less likely it is to increase anxiety or social
            phobia, and it does not reduce life satisfaction.
          </p>
        </div>
        <GamingHoursMentalHealthAnalysis onMetricChange={handleMetricChange} />
        <ChartExplanation explanations={mentalHealthExplanations} />
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>
          Gaming Hours and Creativity Analysis
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            Explore the relationship between daily gaming hours and creativity
            test (TTCT) scores. The analysis reveals interesting patterns in how
            gaming time might influence creative thinking abilities.
          </p>
        </div>
        <GamingHoursCreativityAnalysis />
        <ChartExplanation explanations={creativityExplanations} />
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Game Types Analysis</h2>
        <div className={styles.sectionDescription}>
          <p>
            Explore the relationship between different game types and creativity
            scores, physical activities, musical activities, and artistic
            activities.
          </p>
        </div>
        <GameTypesAnalysis onMetricChange={handleMetricChange} />
        <ChartExplanation explanations={gameTypesExplanations} />
      </section>
    </div>
  );
};

export default Introduction;
