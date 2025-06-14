import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import LinkPreview from "../common/LinkPreview";
import styles from "./ImpactVisualization.module.css";

const ImpactVisualization = ({ game }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [negativeCirclePositions, setNegativeCirclePositions] = useState([]);
  const [positiveCirclePositions, setPositiveCirclePositions] = useState([]);

  useEffect(() => {
    if (!game) return;

    // 清除之前的內容
    d3.select(svgRef.current).selectAll("*").remove();

    // === 步驟1: 設定畫布尺寸 ===
    const CANVAS_WIDTH = 1200;
    const MIN_CANVAS_HEIGHT = 500; // 最小高度
    const PADDING = 0; // 上下留白

    // 先創建臨時svg來計算所需高度
    const tempSvg = d3
      .select(svgRef.current)
      .attr("width", CANVAS_WIDTH)
      .attr("height", MIN_CANVAS_HEIGHT);

    // === 步驟2: 定義內容評級數據 ===
    // 根據嚴重程度獲取對應的label
    const getLabel = (key, severity) => {
      const labelMaps = {
        sexNudity: {
          severe: "Sex<br>& Nudity",
          moderate: "Sex<br>& Nudity",
          mild: "Sex<br>& Nudity",
          none: "Sex<br>& Nudity",
        },
        violenceGore: {
          severe: "Violence & Gore",
          moderate: "Violence & Gore",
          mild: "Violence<br>& Gore",
          none: "Violence<br>& Gore",
        },
        profanity: {
          severe: "Profanity",
          moderate: "Profanity",
          mild: "Profanity",
          none: "Profanity",
        },
        alcoholDrugsSmoking: {
          severe: "Alcohol, Drugs & Smoking",
          moderate: "Alcohol, Drugs & Smoking",
          mild: "Alcohol, Drugs<br>& Smoking",
          none: "Alcohol, Drugs<br>& Smoking",
        },
        frighteningIntenseScenes: {
          severe: "Intense Scenes",
          moderate: "Intense Scenes",
          mild: "Intense Scenes",
          none: "Intense Scenes",
        },
      };

      return (
        labelMaps[key]?.[severity.toLowerCase()] ||
        labelMaps[key]?.["none"] ||
        key
      );
    };

    const contentRatings = [
      {
        key: "sexNudity",
        value: game.sexNudity || "No Data",
      },
      {
        key: "violenceGore",
        value: game.violenceGore || "No Data",
      },
      {
        key: "profanity",
        value: game.profanity || "No Data",
      },
      {
        key: "alcoholDrugsSmoking",
        value: game.alcoholDrugsSmoking || "No Data",
      },
      {
        key: "frighteningIntenseScenes",
        value: game.frighteningIntenseScenes || "No Data",
      },
    ];

    // 正面關鍵字資料
    const positiveKeywords = game.positiveKeywords || [];
    const positiveReferences = game.positiveKeywordsReferences || [];
    const maxPositiveKeywords = 5; // 最多顯示5個
    const displayedPositiveKeywords = positiveKeywords.slice(
      0,
      maxPositiveKeywords
    );

    // === 步驟3: 定義映射函數 ===
    const getSeverityColor = (severity) => {
      const colorMap = {
        severe: "#F44336",
        moderate: "#EF9690",
        mild: "#F8D7DA",
        none: "#D9D9D9",
      };
      return colorMap[severity.toLowerCase()] || "#D9D9D9";
    };

    const getSeverityRadius = (severity) => {
      const radiusMap = {
        severe: 80,
        moderate: 70,
        mild: 60,
        none: 50,
      };
      return radiusMap[severity.toLowerCase()] || 50;
    };

    // 根據嚴重程度獲取圖片透明度
    const getImageOpacity = (severity) => {
      const opacityMap = {
        severe: 0.3,
        moderate: 0.2,
        mild: 0.2,
        none: 0.1,
      };
      return opacityMap[severity.toLowerCase()] || 0.1;
    };

    // === 步驟4: 計算布局位置 ===
    const centerX = CANVAS_WIDTH / 2;
    const centerY = 300; // 遊戲圖片和圓圈的中心Y位置（臨時位置）
    const gameImageY = centerY;
    const circleRadius = 250; // 圓圈圍繞遊戲方塊的半徑
    const gameImageSize = 150; // 遊戲圖片大小

    // 檢查數據狀態
    const hasNegativeData = game.negativeKeywordsReferences !== "no data";
    const hasPositiveData = displayedPositiveKeywords.length > 0;

    // 過濾出有效的內容評級（排除No Data）
    const validContentRatings = contentRatings.filter(
      (rating) => rating.value.toLowerCase() !== "no data"
    );

    // 計算圓圈位置
    let allCirclePositions = [];

    if (hasNegativeData && hasPositiveData) {
      // 兩種都有：positive在上半部（0-180度），negative在下半部（180-360度）

      // Positive keywords位置（上半部180度）
      const positivePositions = displayedPositiveKeywords.map((_, index) => {
        const totalPositive = displayedPositiveKeywords.length;
        const angle = (Math.PI / totalPositive) * (index + 0.5); // 在0到π之間平均分布，無空隙
        return {
          x: centerX + circleRadius * Math.cos(angle - Math.PI), // -π讓positive在上方
          y: centerY + circleRadius * Math.sin(angle - Math.PI),
          type: "positive",
          index: index,
          data: displayedPositiveKeywords[index],
        };
      });

      // Negative keywords位置（下半部180度）
      const negativePositions = validContentRatings.map((_, index) => {
        const totalNegative = validContentRatings.length;
        const angle = Math.PI + (Math.PI / totalNegative) * (index + 0.5); // π到2π之間平均分布，無空隙
        return {
          x: centerX + circleRadius * Math.cos(angle - Math.PI), // -π讓negative在下方
          y: centerY + circleRadius * Math.sin(angle - Math.PI),
          type: "negative",
          index: index,
          data: validContentRatings[index],
        };
      });

      allCirclePositions = [...positivePositions, ...negativePositions];
    } else if (hasPositiveData) {
      // 只有positive keywords：360度平均分布，從正上方開始
      allCirclePositions = displayedPositiveKeywords.map((_, index) => {
        const total = displayedPositiveKeywords.length;
        const angle = ((2 * Math.PI) / total) * index - Math.PI / 2; // 從正上方(-π/2)開始
        return {
          x: centerX + circleRadius * Math.cos(angle),
          y: centerY + circleRadius * Math.sin(angle),
          type: "positive",
          index: index,
          data: displayedPositiveKeywords[index],
        };
      });
    } else if (hasNegativeData) {
      // 只有negative keywords：360度平均分布，從正上方開始
      allCirclePositions = validContentRatings.map((_, index) => {
        const total = validContentRatings.length;
        const angle = ((2 * Math.PI) / total) * index - Math.PI / 2; // 從正上方(-π/2)開始
        return {
          x: centerX + circleRadius * Math.cos(angle),
          y: centerY + circleRadius * Math.sin(angle),
          type: "negative",
          index: index,
          data: validContentRatings[index],
        };
      });
    }

    // === 步驟4.5: 計算實際需要的畫布高度 ===
    let minY = centerY - gameImageSize / 2; // 遊戲圖片頂部
    let maxY = centerY + gameImageSize / 2; // 遊戲圖片底部

    // 計算所有圓圈的Y邊界
    allCirclePositions.forEach((position) => {
      let radius;
      if (position.type === "negative") {
        radius = getSeverityRadius(position.data.value);
      } else {
        radius = 60; // positive圓圈固定半徑
      }

      const circleTop = position.y - radius - 25; // 加上文字空間
      const circleBottom = position.y + radius + 25; // 加上文字空間

      minY = Math.min(minY, circleTop);
      maxY = Math.max(maxY, circleBottom);
    });

    // 計算最終畫布高度
    const contentHeight = maxY - minY;
    const CANVAS_HEIGHT = Math.max(
      MIN_CANVAS_HEIGHT,
      contentHeight + PADDING * 2
    );

    // 調整位置讓內容從頂部開始（加上padding）
    const yOffset = PADDING - minY;

    // 更新所有位置
    allCirclePositions.forEach((position) => {
      position.y += yOffset;
    });
    const finalGameImageY = centerY + yOffset;

    // 重新設定svg尺寸
    const svg = d3
      .select(svgRef.current)
      .attr("width", CANVAS_WIDTH)
      .attr("height", CANVAS_HEIGHT)
      .attr("viewBox", `0 0 ${CANVAS_WIDTH} ${CANVAS_HEIGHT}`);

    // === 步驟5: 繪製中心遊戲圖片 ===

    // 創建圖片pattern
    const defs = svg.append("defs");
    const pattern = defs
      .append("pattern")
      .attr("id", "gameImagePattern")
      .attr("patternUnits", "objectBoundingBox")
      .attr("width", 1)
      .attr("height", 1);

    pattern
      .append("image")
      .attr("href", game.featuredImage)
      .attr("width", gameImageSize)
      .attr("height", gameImageSize)
      .attr("preserveAspectRatio", "xMidYMid slice");

    // 繪製圓角正方形
    svg
      .append("rect")
      .attr("x", centerX - gameImageSize / 2)
      .attr("y", finalGameImageY - gameImageSize / 2)
      .attr("width", gameImageSize)
      .attr("height", gameImageSize)
      .attr("rx", 20)
      .attr("fill", "url(#gameImagePattern)")
      .attr("stroke", "#333")
      .attr("stroke-width", 3);

    // === 步驟6: 繪製連接線 ===
    // 為每個圓圈繪製連接到中心方塊的線條
    allCirclePositions.forEach((position) => {
      const circleX = position.x;
      const circleY = position.y;

      // 計算圓圈半徑
      let circleRadius;
      if (position.type === "negative") {
        circleRadius = getSeverityRadius(position.data.value);
      } else {
        circleRadius = 60; // positive圓圈固定半徑
      }

      // 計算從中心方塊到圓圈的方向向量
      const dx = circleX - centerX;
      const dy = circleY - finalGameImageY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // 計算線條的起點（方塊邊緣）和終點（圓圈邊緣）
      const squareRadius = (gameImageSize / 2) * Math.sqrt(2); // 正方形對角線的一半
      const startX = centerX + (dx / distance) * (squareRadius * 0.7); // 稍微縮短起點
      const startY = finalGameImageY + (dy / distance) * (squareRadius * 0.7);
      const endX = circleX - (dx / distance) * circleRadius;
      const endY = circleY - (dy / distance) * circleRadius;

      // 繪製連接線
      svg
        .append("line")
        .attr("x1", startX)
        .attr("y1", startY)
        .attr("x2", endX)
        .attr("y2", endY)
        .attr("stroke", "#CCCCCC")
        .attr("stroke-width", 2)
        .attr("stroke-dasharray", "5,5")
        .attr("opacity", 0.6);
    });

    // 保存負面圓圈位置數據用於 LinkPreview
    const negativePositions = allCirclePositions
      .filter((position) => position.type === "negative")
      .map((position) => ({
        ...position,
        radius: getSeverityRadius(position.data.value),
      }));
    setNegativeCirclePositions(negativePositions);

    // 保存正面圓圈位置數據用於 LinkPreview
    const positivePositions = allCirclePositions
      .filter((position) => position.type === "positive")
      .map((position, index) => ({
        ...position,
        radius: 60, // positive 圓圈固定半徑
        reference: positiveReferences[index] || null, // 如果沒有對應的 reference 則為 null
      }));
    setPositiveCirclePositions(positivePositions);

    // === 步驟7: 繪製所有圓圈 ===
    // 圖片映射
    const getBackgroundImage = (key) => {
      const imageMap = {
        sexNudity: "/images/keywords/sex.png",
        violenceGore: "/images/keywords/violence.jpg",
        profanity: "/images/keywords/profanity.png",
        alcoholDrugsSmoking: "/images/keywords/alcohol.png",
        frighteningIntenseScenes: "/images/keywords/frightening.jpg",
      };
      return imageMap[key] || null;
    };

    // 繪製所有圓圈
    allCirclePositions.forEach((position) => {
      const x = position.x;
      const y = position.y;

      if (position.type === "negative") {
        // 繪製negative關鍵字圓圈
        const rating = position.data;
        const radius = getSeverityRadius(rating.value);
        const color = getSeverityColor(rating.value);
        const backgroundImage = getBackgroundImage(rating.key);

        // 創建圓圈群組
        const circleGroup = svg.append("g");

        // 先繪製顏色圓圈 (底層，100%不透明)
        circleGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", radius)
          .attr("fill", color)
          .attr("opacity", 1.0);

        // 如果有背景圖片，疊加在顏色圓圈上面
        if (backgroundImage) {
          const patternId = `pattern-${rating.key}-${position.index}`;

          // 為這個圓圈創建專用的pattern
          const imagePattern = defs
            .append("pattern")
            .attr("id", patternId)
            .attr("patternUnits", "objectBoundingBox")
            .attr("width", 1)
            .attr("height", 1);

          imagePattern
            .append("image")
            .attr("href", backgroundImage)
            .attr("width", radius * 2)
            .attr("height", radius * 2)
            .attr("x", 0)
            .attr("y", 0)
            .attr("preserveAspectRatio", "xMidYMid slice");

          // 繪製背景圖片圓圈
          circleGroup
            .append("circle")
            .attr("cx", x)
            .attr("cy", y)
            .attr("r", radius)
            .attr("fill", `url(#${patternId})`)
            .attr("opacity", getImageOpacity(rating.value));
        }

        // 添加文字
        const textMaxWidth = radius * 1.8;
        const dynamicLabel = getLabel(rating.key, rating.value);

        // 上方：分類標籤
        const labelDiv = circleGroup
          .append("foreignObject")
          .attr("x", x - textMaxWidth / 2)
          .attr("y", y - 25)
          .attr("width", textMaxWidth)
          .attr("height", 1)
          .append("xhtml:div")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .style("color", "#000000")
          .style("text-align", "center")
          .style("max-width", textMaxWidth + "px")
          .style("line-height", "1.2")
          .style("white-space", "normal")
          .html(dynamicLabel);

        // 下方：狀態文字
        const getStatusTextStyle = (severity) => {
          const lowerSeverity = severity.toLowerCase();
          if (lowerSeverity === "none") {
            return {
              color: "#000000",
              fontWeight: "normal",
            };
          } else if (lowerSeverity === "severe") {
            return {
              color: "#FFBDB7",
              fontWeight: "bold",
            };
          } else {
            return {
              color: "#740008",
              fontWeight: "bold",
            };
          }
        };

        const statusStyle = getStatusTextStyle(rating.value);
        const statusDiv = circleGroup
          .append("foreignObject")
          .attr("x", x - textMaxWidth / 2)
          .attr("y", y + 5)
          .attr("width", textMaxWidth)
          .attr("height", 1)
          .append("xhtml:div")
          .style("font-size", "14px")
          .style("color", statusStyle.color)
          .style("font-weight", statusStyle.fontWeight)
          .style("text-align", "center")
          .style("max-width", textMaxWidth + "px")
          .style("line-height", "1.1")
          .style("white-space", "normal")
          .style(
            "text-shadow",
            rating.value.toLowerCase() === "severe"
              ? "1px 1px 3px rgba(0, 0, 0, 0.6)"
              : "none"
          )
          .text(rating.value);

        // 移除交互圓圈，由 LinkPreview 覆蓋層處理

        // 調整文字位置
        setTimeout(() => {
          try {
            const labelFO = d3.select(labelDiv.node().parentNode);
            const statusFO = d3.select(statusDiv.node().parentNode);

            const labelHeight = labelDiv.node().offsetHeight;
            const statusHeight = statusDiv.node().offsetHeight;
            const spacing = 5;
            const totalHeight = labelHeight + statusHeight + spacing;

            const centerStartY = y - totalHeight / 2;

            labelFO.attr("y", centerStartY).attr("height", labelHeight);
            statusFO
              .attr("y", centerStartY + labelHeight + spacing)
              .attr("height", statusHeight);
          } catch (e) {
            // 如果DOM還沒準備好，保持原始位置
          }
        }, 0);
      } else if (position.type === "positive") {
        // 繪製positive關鍵字圓圈
        const keyword = position.data;
        const radius = 60;
        const color = "#B8EB98";
        const backgroundImage = `/images/keywords/positive-${
          position.index + 1
        }.png`;

        // 創建圓圈群組
        const circleGroup = svg.append("g");

        // 先繪製顏色圓圈 (底層，100%不透明)
        circleGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", radius)
          .attr("fill", color)
          .attr("opacity", 1.0);

        // 添加背景圖片
        const patternId = `positive-pattern-${position.index}`;

        const imagePattern = defs
          .append("pattern")
          .attr("id", patternId)
          .attr("patternUnits", "objectBoundingBox")
          .attr("width", 1)
          .attr("height", 1);

        imagePattern
          .append("image")
          .attr("href", backgroundImage)
          .attr("width", radius * 2)
          .attr("height", radius * 2)
          .attr("x", 0)
          .attr("y", 0)
          .attr("preserveAspectRatio", "xMidYMid slice");

        // 繪製背景圖片圓圈
        circleGroup
          .append("circle")
          .attr("cx", x)
          .attr("cy", y)
          .attr("r", radius)
          .attr("fill", `url(#${patternId})`)
          .attr("opacity", 0.2);

        // 添加文字（只顯示關鍵字內容，居中顯示）
        const textMaxWidth = radius * 1.8;
        const keywordDiv = circleGroup
          .append("foreignObject")
          .attr("x", x - textMaxWidth / 2)
          .attr("y", y - 10)
          .attr("width", textMaxWidth)
          .attr("height", 1)
          .append("xhtml:div")
          .style("font-size", "16px")
          .style("font-weight", "bold")
          .style("color", "#FFFFFF")
          .style("text-align", "center")
          .style("max-width", textMaxWidth + "px")
          .style("line-height", "1.2")
          .style("white-space", "normal")
          .style("text-shadow", "2px 2px 4px rgba(0, 0, 0, 0.8)")
          .text(keyword);

        // 調整文字位置到圓圈中心
        setTimeout(() => {
          try {
            const keywordFO = d3.select(keywordDiv.node().parentNode);
            const keywordHeight = keywordDiv.node().offsetHeight;

            const centerY = y - keywordHeight / 2;
            keywordFO.attr("y", centerY).attr("height", keywordHeight);
          } catch (e) {
            // 如果DOM還沒準備好，保持原始位置
          }
        }, 0);
      }
    });

    // 清理函數
    return () => {
      // 清理代碼已移除，由 LinkPreview 組件自行管理
    };
  }, [game]);

  return (
    <div
      ref={containerRef}
      style={{ width: "1200px", margin: "0 auto", position: "relative" }}
    >
      <svg ref={svgRef}></svg>
      {/* 為每個負面圓圈創建對應的 LinkPreview 覆蓋層 */}
      {game &&
        game.negativeKeywordsReferences &&
        game.negativeKeywordsReferences !== "no data" &&
        negativeCirclePositions.map((position, index) => (
          <LinkPreview
            key={`negative-link-${index}`}
            content={game.negativeKeywordsReferences}
            title="Negative Keywords Reference"
            onlyShowOnHover={true}
          >
            <div
              style={{
                position: "absolute",
                left: position.x - position.radius,
                top: position.y - position.radius,
                width: position.radius * 2,
                height: position.radius * 2,
                borderRadius: "50%",
                cursor: "pointer",
                pointerEvents: "auto",
              }}
            />
          </LinkPreview>
        ))}

      {/* 為每個正面圓圈創建對應的 LinkPreview 覆蓋層 */}
      {positiveCirclePositions.map(
        (position, index) =>
          position.reference && (
            <LinkPreview
              key={`positive-link-${index}`}
              content={position.reference}
              title="Positive Keywords Reference"
              onlyShowOnHover={true}
            >
              <div
                style={{
                  position: "absolute",
                  left: position.x - position.radius,
                  top: position.y - position.radius,
                  width: position.radius * 2,
                  height: position.radius * 2,
                  borderRadius: "50%",
                  cursor: "pointer",
                  pointerEvents: "auto",
                }}
              />
            </LinkPreview>
          )
      )}
    </div>
  );
};

export default ImpactVisualization;
