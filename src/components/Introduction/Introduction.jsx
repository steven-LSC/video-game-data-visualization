import React, { useState, useEffect } from "react";
import styles from "./Introduction.module.css";
import GameRanking from "../GameRanking/GameRanking";
import GamingHoursAggressionAnalysis from "../GamingHoursAggressionAnalysis/GamingHoursAggressionAnalysis";
import GamingHoursMentalHealthAnalysis from "../GamingHoursMentalHealthAnalysis/GamingHoursMentalHealthAnalysis";
import GameTypesAnalysis from "../GameTypesAnalysis/GameTypesAnalysis";
import GamingHoursCreativityAnalysis from "../GamingHoursCreativityAnalysis/GamingHoursCreativityAnalysis";
import Carousel from "../Carousel/Carousel";
import ChartExplanation from "./ChartExplanation";
import LinkPreview from "../common/LinkPreview";

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

      // 載入 pc-console-data.json
      const gamesResponse = await fetch("/pc-console-data.json");

      if (!gamesResponse.ok) {
        throw new Error("無法讀取遊戲數據");
      }

      const rawGames = await gamesResponse.json();

      // 轉換資料格式以符合現有功能
      const games = rawGames.map((game) => ({
        title: game.name,
        sales: game.sales.toLocaleString(),
        pegiRating: game.pegi.toString(),
        genres: game.genre || [],
        publisher: game.publisher,
        platform: "PC/Console", // 預設平台
        otherLabels: game.editorPick ? [game.editorPick] : [],
        description: game.description,
        positiveKeywords: Array.isArray(game.positiveKeywords)
          ? game.positiveKeywords
          : game.positiveKeywords
          ? [game.positiveKeywords]
          : [],
        positiveKeywordsReferences:
          typeof game.positiveKeywordsReferences === "string"
            ? game.positiveKeywordsReferences
                .split("\n")
                .filter((ref) => ref.trim())
            : Array.isArray(game.positiveKeywordsReferences)
            ? game.positiveKeywordsReferences
            : [],
        sexNudity: game.sexNudity,
        violenceGore: game.violenceGore,
        profanity: game.profanity,
        alcoholDrugsSmoking: game.alcoholDrugsSmoking,
        frighteningIntenseScenes: game.frighteningIntenseScenes,
        negativeKeywordsReferences: game.negativeKeywordsReferences,
        featuredImage: game.featureImage,
        ranking: game.ranking,
        developer: Array.isArray(game.developer)
          ? game.developer.join(", ")
          : game.developer,
        // 推薦遊戲相關資料
        recommendedGames: [
          game.recommendedGame1
            ? {
                title: game.recommendedGame1,
                genres: game.recommendedGame1Genre || [],
                reason: game.recommendedGame1Reason,
                image: game.recommendedGame1FeatureImage,
                link: game.recommendedGame1Link,
              }
            : null,
          game.recommendedGame2
            ? {
                title: game.recommendedGame2,
                genres: game.recommendedGame2Genre || [],
                reason: game.recommendedGame2Reason,
                image: game.recommendedGame2FeatureImage,
                link: game.recommendedGame2Link,
              }
            : null,
          game.recommendedGame3
            ? {
                title: game.recommendedGame3,
                genres: game.recommendedGame3Genre || [],
                reason: game.recommendedGame3Reason,
                image: game.recommendedGame3FeatureImage,
                link: game.recommendedGame3Link,
              }
            : null,
          game.recommendedGame4
            ? {
                title: game.recommendedGame4,
                genres: game.recommendedGame4Genre || [],
                reason: game.recommendedGame4Reason,
                image: game.recommendedGame4FeatureImage,
                link: game.recommendedGame4Link,
              }
            : null,
        ].filter(Boolean),
      }));

      // 從遊戲中提取所有獨特的流派
      const genresSet = new Set();
      games.forEach((game) => {
        if (game.genres) {
          game.genres.forEach((genre) => genresSet.add(genre));
        }
      });
      const genres = Array.from(genresSet).sort();

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
  const [showWhyDropdown, setShowWhyDropdown] = useState(false);
  const [switchAnimated, setSwitchAnimated] = useState(false);
  const [ps5Animated, setPs5Animated] = useState(false);

  // 接收來自子組件的指標更新
  const handleMetricChange = (metric) => {
    setCurrentMetric(metric);
  };

  const handleGameTypeChange = (type) => {
    setCurrentGameType(type);
  };

  // 處理遊戲機圖片點擊動畫
  const handleSwitchClick = () => {
    setSwitchAnimated(true);
  };

  const handlePs5Click = () => {
    setPs5Animated(true);
  };

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
        <img
          src="/images/switch.png"
          alt="Nintendo Switch"
          className={`${styles.switchImage} ${
            switchAnimated ? styles.switchFadeOut : ""
          }`}
          onClick={handleSwitchClick}
        />
        <img
          src="/images/ps5.png"
          alt="PlayStation 5"
          className={`${styles.ps5Image} ${
            ps5Animated ? styles.ps5FadeOut : ""
          }`}
          onClick={handlePs5Click}
        />
        <div className={styles.productTitle}>
          <img
            src="/images/logo.png"
            alt="Game Guardian"
            className={styles.logo}
          />
          <p className={`${styles.subtitle} ${styles.largeSubtitle}`}>
            Search a Video Game to Learn About It!
          </p>
        </div>
        <div className={styles.searchContainer}>
          <div className={styles.searchInputWrapper}>
            <input
              type="text"
              className={styles.searchBar}
              placeholder="Enter the name of a video game"
              value={searchText}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={() => setTimeout(() => handleClickOutside(), 200)}
            />
            {searchText ? (
              <button
                className={styles.clearSearch}
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
                className={styles.searchIcon}
              />
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
          <div
            className={styles.whyHeader}
            onClick={() => setShowWhyDropdown(!showWhyDropdown)}
          >
            <h2>Why did we make this website?</h2>
            <span className={styles.dropdownIcon}>
              {showWhyDropdown ? "▲" : "▼"}
            </span>
          </div>

          {showWhyDropdown && (
            <div className={styles.whyDropdown}>
              <p>Video games are powerful—and complex.</p>
              <p>
                They can support learning, focus, and social connection, but
                they also raise valid concerns like addiction, excessive screen
                time, and behavioral risks. We believe users deserve a space to
                explore both sides, grounded in real data—not assumptions.
                That's why we built this website.
              </p>
              <p>Here, you can:</p>
              <ul>
                <li>
                  Dive into research-backed sections on both the concerns and
                  benefits of video games
                </li>
                <li>
                  Search individual titles to see their key features and
                  potential impacts
                </li>
                <li>
                  Use checkbox filters to find or avoid games with similar
                  traits
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
                      🔥 Popularity – games selected by community votes and
                      cultural buzz
                    </li>
                  </ul>
                </li>
              </ul>
              <p>
                <strong>
                  Our goal is simple: to offer a comprehensive, balanced
                  perspective on games—whether you're a parent, educator, or
                  gamer yourself.
                </strong>
              </p>
            </div>
          )}
        </div>

        {dataLoaded ? (
          error ? (
            <div className={styles.errorMessage}>{error}</div>
          ) : (
            <>
              <h2
                className={`${styles.sectionTitle} ${styles.largeSectionTitle}`}
              >
                <span className={styles.orangeText}>GAME</span> SALES RANKING
              </h2>
              <div className={styles.sectionDescription}>
                <p>
                  Discover the top-selling games worldwide. Use the filters to
                  tailor recommendations to your preferences.
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
        className={`${styles.carouselSection} ${styles.positiveCarousel} ${styles.section} ${styles.fullHeightSection} ${styles.benefitBackground}`}
      >
        <div className={styles.sectionContentWrapper}>
          <h2 className={`${styles.sectionTitle} ${styles.largeSectionTitle}`}>
            Understanding the{" "}
            <span className={styles.benefitText}>BENEFITS</span> of Video Games
          </h2>
          <div className={styles.sectionDescription}>
            <p>
              Explore the positive impacts and benefits that video games can
              bring.
            </p>
            <p>
              {" "}
              Discover how different types of games can enhance various skills
              and provide entertainment value. Click on the cards to learn more.
            </p>
          </div>
          {carouselItems.length > 0 && <Carousel items={carouselItems} />}
        </div>
      </section>

      <section
        className={`${styles.carouselSection} ${styles.negativeCarousel} ${styles.section} ${styles.fullHeightSection} ${styles.concernBackground}`}
      >
        <div className={styles.sectionContentWrapper}>
          <h2 className={`${styles.sectionTitle} ${styles.largeSectionTitle}`}>
            Understanding the{" "}
            <span className={styles.concernText}>CONCERNS</span> Around Video
            Games
          </h2>
          <div className={styles.sectionDescription}>
            <p>
              Video games are often linked in the media to issues like violence,
              addiction, and social withdrawal. Reports raise valid concerns
              about their potential impact on mental health and behavior,
              especially in young users. However, these narratives often
              overlook context, such as individual differences or broader
              societal factors. It's important to critically assess these claims
              and seek a balanced understanding.
            </p>
          </div>
          {negativeCarouselItems && negativeCarouselItems.length > 0 && (
            <Carousel
              items={negativeCarouselItems}
              className="negative-carousel"
            />
          )}
        </div>
      </section>

      <section className={`${styles.researchSection} ${styles.section}`}>
        <h2 className={`${styles.sectionTitle} ${styles.largeSectionTitle}`}>
          Understanding the <span className={styles.orangeText}>RESEARCH</span>{" "}
          About Video Games
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
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>
          Gaming Hours and Aggression Analysis
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            Based on the public dataset from Kaggle,{" "}
            <LinkPreview
              content="https://www.kaggle.com/datasets/muhammadshamoeel/effects-of-video-games-on-aggression-msdos-csv"
              title="Kaggle Dataset Reference"
            >
              <span
                style={{
                  color: "#FB9B1C",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Online Gaming Anxiety Data
              </span>
            </LinkPreview>
            , the first visualization reveals that:
          </p>
          <ul>
            <li>
              When daily gaming time is kept within two hours, players'
              aggression scores decrease.
            </li>
            <li>
              A significant increase in aggression only occurs when daily gaming
              time exceeds two hours.
            </li>
          </ul>
          <p>Furthermore, when switching the X-axis to Violent Game Hours:</p>
          <ul>
            <li>
              Aggression scores rise as time spent on violent games increases,
              echoing common concerns about the effects of violent video games.
            </li>
            <li>
              However, it is crucial to note that this trend applies only to
              violent games and should not be generalized to all video games.
            </li>
            <li>
              This visualization aims to clarify such common misconceptions.
            </li>
          </ul>
        </div>
        <GamingHoursAggressionAnalysis
          onGameTypeChange={handleGameTypeChange}
        />
        <ChartExplanation>
          <p>
            This chart shows the relationship between general/violent game hours
            and aggression scores.
          </p>
          <ul>
            <li>
              Each dot represents a participant with the specified game hours
              and aggression score.
            </li>
            <li>
              The red line shows the average aggression score for each time
              category.
            </li>
          </ul>
        </ChartExplanation>
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>
          Gaming Hours and Mental Health Analysis
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            Based on the public dataset from Kaggle,{" "}
            <LinkPreview
              content="https://www.kaggle.com/datasets/divyansh22/online-gaming-anxiety-data"
              title="Kaggle Dataset Reference"
            >
              <span
                style={{
                  color: "#FB9B1C",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Effects of Video Games on Aggression
              </span>
            </LinkPreview>
            , the second visualization shows:
          </p>
          <ul>
            <li>
              There is no significant positive or negative correlation between
              weekly average gaming time and major mental health indicators,
              including Anxiety, Life Satisfaction, and Social Anxiety.
            </li>
            <li>
              Instead, the data shows natural fluctuations without clear trends.
            </li>
          </ul>
          <p>
            <strong>Conclusion:</strong> Gaming time alone is not a direct cause
            of mental health problems. Other factors such as game content and
            context must be considered.
          </p>
        </div>
        <GamingHoursMentalHealthAnalysis onMetricChange={handleMetricChange} />
        <ChartExplanation>
          <p>
            This chart shows the relationship between weekly gaming hours and
            mental health indicator scores.
          </p>
          <ul>
            <li>
              Each box plot represents the distribution of mental health scores
              for participants with the same gaming hours.
            </li>
            <li>
              The box shows the median, quartiles (Q1, Q3), and range (min, max)
              of scores for each gaming hour group.
            </li>
            <li>
              The red line shows the average mental health indicator score for
              each gaming hour, calculated only for hours with at least 5
              participants.
            </li>
          </ul>
          <p>
            You can switch between different mental health metrics using the
            tabs above.
          </p>
        </ChartExplanation>
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>
          Gaming Hours and Creativity Analysis
        </h2>
        <div className={styles.sectionDescription}>
          <p>
            Based on the public dataset from the study,{" "}
            <LinkPreview
              content="https://files.eric.ed.gov/fulltext/EJ1461928.pdf"
              title="Research Paper Reference"
            >
              <span
                style={{
                  color: "#FB9B1C",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Impact of Video Game Use on Fostering Creativity in Waldorf
                School Students
              </span>
            </LinkPreview>
            , the third visualization shows:
          </p>
          <ul>
            <li>
              Students who play games for less than two hours or two to four
              hours daily score higher in creativity tests (TTCT) compared to
              non-gamers.
            </li>
            <li>
              Students who play for more than four hours a day have lower
              creativity scores than non-gamers.
            </li>
          </ul>
          <p>
            <strong>Conclusion:</strong> Moderate gaming, specifically 2–4 hours
            per day, can enhance creativity, while excessive gaming has a
            detrimental effect.
          </p>
        </div>
        <GamingHoursCreativityAnalysis />
        <ChartExplanation>
          <p>
            This chart shows the relationship between daily gaming hours and
            creativity scores (TTCT).
          </p>
          <ul>
            <li>
              Each blue dot represents an individual participant with their
              gaming time and creativity score.
            </li>
            <li>
              The red line shows the average creativity score for each gaming
              time category, revealing trends in how gaming time might relate to
              creativity levels.
            </li>
          </ul>
        </ChartExplanation>
      </section>

      <section className={`${styles.analysisSection} ${styles.section}`}>
        <h2 className={styles.sectionTitle}>Game Types Analysis</h2>
        <div className={styles.sectionDescription}>
          <p>
            Also based on the public dataset from the same study,{" "}
            <LinkPreview
              content="https://files.eric.ed.gov/fulltext/EJ1461928.pdf"
              title="Research Paper Reference"
            >
              <span
                style={{
                  color: "#FB9B1C",
                  textDecoration: "underline",
                  cursor: "pointer",
                }}
              >
                Impact of Video Game Use on Fostering Creativity in Waldorf
                School Students
              </span>
            </LinkPreview>
            , the fourth visualization indicates:
          </p>
          <ul>
            <li>
              Except for students who frequently (4/5 frequency) play puzzle
              games, all other game types and frequencies are associated with
              active participation in physical activities.
            </li>
            <li>
              Except for students who frequently (5/5 frequency) play fighting
              games, all other game types and frequencies are associated with
              active participation in music and art activities.
            </li>
          </ul>
          <p>
            <strong>Summary:</strong> Choosing the right type of game and
            engaging in gameplay in moderation does not reduce students’
            willingness to participate in creative activities. In fact, for
            certain game types, higher frequency is associated with increased
            willingness to engage in such activities.
          </p>
        </div>
        <GameTypesAnalysis onMetricChange={handleMetricChange} />
        <ChartExplanation>
          <p>
            This chart illustrates the relationship between different game
            types, play frequency, and creative activities.
          </p>
          <ul>
            <li>
              Each bubble represents a combination of game type and play
              frequency. - The size and color intensity of the bubble indicate
              the relationship with the creative activity — larger and darker
              bubbles represent a higher average score in the creative activity,
              while smaller and lighter bubbles indicate a lower average score.
            </li>
            <li>
              The vertical axis (1 to 5) represents how frequently participants
              play each game type, with 5 being the most frequent.
            </li>
          </ul>
          <p>
            You can switch between different creative activities using the tabs
            above to explore various relationships.
          </p>
        </ChartExplanation>
      </section>
    </div>
  );
};

export default Introduction;
