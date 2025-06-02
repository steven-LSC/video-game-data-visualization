import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Papa from "papaparse";
import styles from "./GamingHoursAggressionAnalysis.module.css";
import TabSelector from "../common/TabSelector";

// 禁用 Chart.js 中的 datalabels 插件（如果已自動註冊）
Chart.overrides.bubble.plugins = Chart.overrides.bubble.plugins || {};
Chart.overrides.bubble.plugins.datalabels =
  Chart.overrides.bubble.plugins.datalabels || {};
Chart.overrides.bubble.plugins.datalabels.display = false;

const AggressionAnalysis = ({ onGameTypeChange }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [xAxisType, setXAxisType] = useState("gameHours"); // 默認使用一般遊戲時間

  // 遊戲時間映射
  const gameHoursMap = {
    "less than 1 hour": 1,
    "more than 1 hour": 2,
    "more than 2 hours": 3,
    "more than 3 hours": 4,
    "more than 5 hours": 5,
  };

  // X 軸類型映射到 CSV 欄位名稱
  const xAxisMetrics = {
    gameHours: "Game Hours (Day)",
    violentGameHours: "Violent Game Hours (Day)",
  };

  // X 軸選項配置
  const xAxisOptions = [
    { id: "gameHours", label: "Game Hours" },
    { id: "violentGameHours", label: "Violent Game Hours" },
  ];

  // 第一個 useEffect：獲取和解析數據
  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        // 獲取CSV文件
        const response = await fetch("/aggression-analysis.csv");
        if (!response.ok) {
          throw new Error("Failed to fetch data file");
        }

        const csvText = await response.text();

        // 使用 PapaParse 解析 CSV
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

  // 第二個 useEffect：在數據載入完成後且組件渲染後創建圖表，或當 X 軸類型改變時重新創建
  useEffect(() => {
    // 確保 chartData 存在且圖表 refs 不為 null
    if (chartData && chartRef.current) {
      createChart(chartData);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, chartRef, xAxisType]);

  // 當 X 軸類型變更時
  const changeXAxisType = (type) => {
    setXAxisType(type);
    if (chartData) {
      setChartOption(type);
    }
    // 通知父組件當前選定的遊戲類型
    if (onGameTypeChange) {
      onGameTypeChange(type);
    }
  };

  const createChart = (data) => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // 額外檢查確保 chartRef.current 不為 null
    if (!chartRef.current) {
      console.error("Chart canvas element is not available");
      return;
    }

    const ctx = chartRef.current.getContext("2d");
    if (!ctx) {
      console.error("Could not get 2D context from chart canvas");
      return;
    }

    // 獲取當前 X 軸對應的數據欄位名稱
    const xAxisField = xAxisMetrics[xAxisType];

    // 處理數據為散點圖格式
    const scatterData = data
      .filter((item) => {
        const hours = gameHoursMap[item[xAxisField]];
        const score = parseInt(item["Buss-Perry Aggression Score"]);
        return !isNaN(hours) && !isNaN(score) && hours > 0;
      })
      .map((item) => ({
        x: gameHoursMap[item[xAxisField]],
        y: parseInt(item["Buss-Perry Aggression Score"]),
        // 保存原始時間文字，方便顯示
        originalHours: item[xAxisField],
      }));

    // 計算每個遊戲時間類別的平均攻擊性得分
    const aggScoresByGameHours = {};
    const countByGameHours = {};

    // 初始化計數器和總和
    Object.values(gameHoursMap).forEach((value) => {
      aggScoresByGameHours[value] = 0;
      countByGameHours[value] = 0;
    });

    // 計算總和和計數
    data.forEach((item) => {
      const hourValue = gameHoursMap[item[xAxisField]];
      const score = parseInt(item["Buss-Perry Aggression Score"]);

      if (
        !isNaN(hourValue) &&
        !isNaN(score) &&
        aggScoresByGameHours[hourValue] !== undefined
      ) {
        aggScoresByGameHours[hourValue] += score;
        countByGameHours[hourValue]++;
      }
    });

    // 計算平均值並準備折線圖數據
    const averageLineData = Object.keys(aggScoresByGameHours)
      .map((hourValue) => {
        const count = countByGameHours[hourValue];
        const average = count > 0 ? aggScoresByGameHours[hourValue] / count : 0;

        return {
          x: parseInt(hourValue),
          y: average,
        };
      })
      .sort((a, b) => a.x - b.x); // 確保按照 x 值排序

    // 準備 X 軸刻度標籤
    const xLabels = Object.keys(gameHoursMap).sort(
      (a, b) => gameHoursMap[a] - gameHoursMap[b]
    );

    // 根據當前 X 軸數據類型設置圖表標題
    const xAxisTitle =
      xAxisType === "gameHours" ? "Game Time" : "Violent Game Time";
    const chartTitle = `${xAxisTitle} and Aggression Score Analysis`;

    chartInstance.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: "Average Aggression Score",
            type: "line",
            data: averageLineData,
            fill: false,
            backgroundColor: "rgba(255, 99, 132, 1)",
            borderColor: "rgba(255, 99, 132, 1)",
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 6,
            pointBackgroundColor: "rgba(255, 99, 132, 1)",
            pointBorderColor: "#fff",
            pointBorderWidth: 2,
            pointHoverRadius: 12,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            pointHoverBorderColor: "#fff",
            order: 1,
          },
          {
            label: "Individual Data Points",
            data: scatterData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 12,
            pointBackgroundColor: "rgba(75, 192, 192, 0.8)",
            pointBorderColor: "rgba(75, 192, 192, 1)",
            pointHoverBackgroundColor: "rgba(75, 192, 192, 1)",
            pointHoverBorderColor: "#fff",
            pointHoverBorderWidth: 2,
            order: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "nearest",
          intersect: true,
          axis: "xy",
        },
        plugins: {
          datalabels: {
            display: false,
          },
          title: {
            display: true,
            text: chartTitle,
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 20,
            },
          },
          tooltip: {
            filter: function (tooltipItem) {
              // 只顯示被hover的那個數據點的tooltip
              return true;
            },
            callbacks: {
              title: function () {
                // 移除tooltip的標題
                return "";
              },
              label: function (context) {
                const datasetLabel = context.dataset.label || "";

                if (context.datasetIndex === 1) {
                  // 對於散點圖數據（Individual Data Points）
                  const originalHours =
                    context.raw.originalHours ||
                    Object.keys(gameHoursMap).find(
                      (key) => gameHoursMap[key] === context.parsed.x
                    );
                  return `${datasetLabel}: ${xAxisTitle}: ${originalHours}, Aggression Score: ${context.parsed.y}`;
                } else {
                  // 對於平均值線（Average Aggression Score）
                  const hourText = Object.keys(gameHoursMap).find(
                    (key) => gameHoursMap[key] === context.parsed.x
                  );
                  return `${datasetLabel}: ${hourText}, Average Score: ${context.parsed.y.toFixed(
                    2
                  )}`;
                }
              },
            },
          },
          legend: {
            display: true,
            position: "top",
            labels: {
              font: {
                size: 12,
              },
              usePointStyle: true,
              // padding: 20,
            },
          },
        },
        scales: {
          x: {
            type: "linear",
            position: "bottom",
            offset: true,
            grid: {
              offset: true,
            },
            title: {
              display: true,
              text: xAxisTitle,
              padding: {
                top: 15,
              },
            },
            ticks: {
              callback: function (value) {
                // 將標籤的第一個字母改為大寫
                const label = xLabels[value - 1] || "";
                if (label.length > 0) {
                  return label.charAt(0).toUpperCase() + label.slice(1);
                }
                return label;
              },
              stepSize: 1,
            },
          },
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Aggression Score",
              padding: {
                bottom: 15,
              },
            },
            suggestedMin: 30,
            suggestedMax: 150,
          },
        },
      },
    });
  };

  return (
    <div className={styles.aggressionAnalysisContainer}>
      <h1>Gaming Hours and Aggression Analysis</h1>

      <div className={styles.chartControls}>
        <TabSelector
          options={xAxisOptions}
          activeTab={xAxisType}
          onChange={changeXAxisType}
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

export default AggressionAnalysis;
