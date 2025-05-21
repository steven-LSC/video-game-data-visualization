import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Papa from "papaparse";
import styles from "./GameTypesAnalysis.module.css";
import TabSelector from "../common/TabSelector";

// 禁用 Chart.js 中的 datalabels 插件
Chart.overrides.scatter.plugins = Chart.overrides.scatter.plugins || {};
Chart.overrides.scatter.plugins.datalabels =
  Chart.overrides.scatter.plugins.datalabels || {};
Chart.overrides.scatter.plugins.datalabels.display = false;

const CreativityAnalysis = ({ onMetricChange }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [selectedMetric, setSelectedMetric] = useState("TTCT Test Score");

  // 指標名稱映射
  const metricNames = {
    "TTCT Test Score": "Creativity Test Score",
    "Physical exercise/sports": "Physical Activities",
    "Musical activities": "Musical Activities",
    "Artistic activities": "Artistic Activities",
  };

  // 指標選項配置
  const metricOptions = [
    { id: "TTCT Test Score", label: "Creativity Test Score" },
    { id: "Physical exercise/sports", label: "Physical Activities" },
    { id: "Musical activities", label: "Musical Activities" },
    { id: "Artistic activities", label: "Artistic Activities" },
  ];

  // 遊戲類型列表
  const gameTypes = [
    "Action/adventure",
    "Shooting",
    "Sports",
    "Fantasy/rol",
    "Racing",
    "Fight",
    "Strategy",
    "Puzzles",
  ];

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/creativity.csv");
        if (!response.ok) {
          throw new Error("Failed to fetch data file");
        }

        const csvText = await response.text();
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            setChartData(results.data);
            setLoading(false);
          },
          error: (error) => {
            setError(`CSV parsing error: ${error.message}`);
            setLoading(false);
          },
        });
      } catch (error) {
        setError(`Data fetch error: ${error.message}`);
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  useEffect(() => {
    if (chartData && chartRef.current) {
      createBubbleChart(chartData);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, selectedMetric]);

  // 切換選項指標
  const changeMetric = (metric) => {
    setSelectedMetric(metric);

    // 通知父組件當前選定的指標
    if (onMetricChange) {
      onMetricChange(metricNames[metric]);
    }
  };

  const createBubbleChart = (data) => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!chartRef.current) {
      console.error("Chart canvas element is not available");
      return;
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context from chart canvas");
      return;
    }

    // 計算每個遊戲類型和頻率組合的平均分數
    const bubbleData = {};

    // 找出所有分數的最大值和最小值，用於縮放氣泡大小
    let maxScore = -Infinity;
    let minScore = Infinity;

    gameTypes.forEach((gameType) => {
      for (let frequency = 1; frequency <= 5; frequency++) {
        const filteredData = data.filter(
          (item) => parseInt(item[gameType]) === frequency
        );

        if (filteredData.length > 0) {
          const avgScore =
            filteredData.reduce((sum, item) => {
              const score = parseInt(item[selectedMetric]);
              return sum + (isNaN(score) ? 0 : score);
            }, 0) / filteredData.length;

          if (!isNaN(avgScore)) {
            maxScore = Math.max(maxScore, avgScore);
            minScore = Math.min(minScore, avgScore);
          }
        }
      }
    });

    // 確保分數範圍有效
    if (minScore === Infinity) minScore = 0;
    if (maxScore === -Infinity) maxScore = 100;
    if (maxScore === minScore) maxScore = minScore + 50;

    // 計算氣泡大小的範圍，增大大小差異
    const minBubbleSize = 4;
    const maxBubbleSize = 40;

    // 為每個遊戲類型和頻率組合創建氣泡數據
    gameTypes.forEach((gameType, gameIndex) => {
      for (let frequency = 1; frequency <= 5; frequency++) {
        const key = `${gameType}-${frequency}`;
        const filteredData = data.filter(
          (item) => parseInt(item[gameType]) === frequency
        );

        if (filteredData.length > 0) {
          let totalScore = 0;
          let validScores = 0;

          filteredData.forEach((item) => {
            const score = parseInt(item[selectedMetric]);
            if (!isNaN(score)) {
              totalScore += score;
              validScores++;
            }
          });

          if (validScores > 0) {
            const avgScore = totalScore / validScores;

            // 使用指數縮放來增強氣泡大小差異
            const normalizedScore =
              (avgScore - minScore) / (maxScore - minScore);
            const exponentialFactor = 1.5; // 指數因子，增強差異
            const scaledScore = Math.pow(normalizedScore, exponentialFactor);
            const bubbleSize =
              minBubbleSize + (maxBubbleSize - minBubbleSize) * scaledScore;

            bubbleData[key] = {
              x: gameIndex, // 使用遊戲類型的索引作為 x 座標
              y: frequency, // 使用頻率作為 y 座標
              r: bubbleSize, // 氣泡半徑
              avgScore: avgScore, // 平均分數
              sampleCount: filteredData.length, // 樣本數量
              gameType: gameType, // 遊戲類型名稱
            };
          }
        }
      }
    });

    const bubbles = Object.values(bubbleData);

    chartInstance.current = new Chart(ctx, {
      type: "bubble",
      data: {
        datasets: [
          {
            label: `Game Types and ${metricNames[selectedMetric]}`,
            data: bubbles,
            backgroundColor: (context) => {
              const point = context.raw;
              const normalizedScore =
                (point.avgScore - minScore) / (maxScore - minScore);
              // 增強顏色差異
              return `rgba(75, 192, 192, ${0.2 + normalizedScore * 0.8})`;
            },
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Relationship Between Game Types and ${metricNames[selectedMetric]}`,
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 20, // 統一使用 20px 的間距
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const point = context.raw;
                const gameType = gameTypes[point.x];
                return [
                  `Game Type: ${gameType}`,
                  `Frequency: ${point.y}`,
                  `Average ${
                    metricNames[selectedMetric]
                  }: ${point.avgScore.toFixed(2)}`,
                  `Sample Size: ${point.sampleCount}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Game Types",
            },
            ticks: {
              callback: function (value) {
                return gameTypes[value];
              },
            },
            offset: true,
            grid: {
              offset: true,
            },
          },
          y: {
            title: {
              display: true,
              text: "Frequency of Play",
            },
            min: 1,
            max: 5,
            ticks: {
              stepSize: 1,
              callback: function (value) {
                // 確保只顯示 1-5 的整數
                return Number.isInteger(value) && value >= 1 && value <= 5
                  ? value
                  : "";
              },
            },
            offset: true, // 使Y軸標籤對齊格子中心
            grid: {
              offset: true, // 使格線與數據點之間錯開
            },
          },
        },
      },
    });
  };

  return (
    <div className={styles.creativityAnalysisContainer}>
      <h1>Game Types Analysis</h1>

      <div className={styles.chartControls}>
        <TabSelector
          options={metricOptions}
          activeTab={selectedMetric}
          onChange={changeMetric}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading data...</div>
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : (
        <div className={styles.chartContainer}>
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default CreativityAnalysis;
