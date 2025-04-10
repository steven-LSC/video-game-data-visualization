import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Papa from "papaparse";
import "./AggressionAnalysis.css";

// 禁用 Chart.js 中的 datalabels 插件（如果已自動註冊）
Chart.overrides.scatter.plugins = Chart.overrides.scatter.plugins || {};
Chart.overrides.scatter.plugins.datalabels =
  Chart.overrides.scatter.plugins.datalabels || {};
Chart.overrides.scatter.plugins.datalabels.display = false;

const AggressionAnalysis = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [xAxisDataType, setXAxisDataType] = useState("gameHours"); // 默認顯示普通遊戲時間

  // 遊戲時間映射
  const gameHoursMap = {
    "less than 1 hour": 1,
    "more than 1 hour": 2,
    "more than 2 hour": 3,
    "more than 3 hour": 4,
    "more than 5 hour": 5,
  };

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

  // 第二個 useEffect：在數據載入完成後且組件渲染後創建圖表，或當 X 軸數據類型改變時重新創建
  useEffect(() => {
    // 確保 chartData 存在且圖表 refs 不為 null
    if (chartData && chartRef.current) {
      createCombinedChart(chartData);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, chartRef, xAxisDataType]);

  // 設置 X 軸數據類型
  const changeXAxisDataType = (dataType) => {
    setXAxisDataType(dataType);
  };

  const createCombinedChart = (data) => {
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

    // 根據當前選擇的 X 軸數據類型獲取數據
    const xAxisDataField =
      xAxisDataType === "gameHours"
        ? "Game Hours (Day)"
        : "Violent Game Hours (Day)";

    // 處理數據為散點圖格式
    const scatterData = data.map((item) => ({
      x: gameHoursMap[item[xAxisDataField]],
      y: parseInt(item["Buss-Perry Aggression Score"]),
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
      const hourValue = gameHoursMap[item[xAxisDataField]];
      const score = parseInt(item["Buss-Perry Aggression Score"]);

      if (!isNaN(score)) {
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

    // 計算每個遊戲時間類別中的 Delinquent Behavior yes/no 比例
    const delinquentBehaviorCounts = {
      1: { yes: 0, no: 0 },
      2: { yes: 0, no: 0 },
      3: { yes: 0, no: 0 },
      4: { yes: 0, no: 0 },
      5: { yes: 0, no: 0 },
    };

    // 計算每個類別中的 yes/no 數量
    data.forEach((item) => {
      const hourValue = gameHoursMap[item[xAxisDataField]];
      const isDelinquent = item["Delinquent Behavior"].toLowerCase() === "yes";

      if (isDelinquent) {
        delinquentBehaviorCounts[hourValue].yes++;
      } else {
        delinquentBehaviorCounts[hourValue].no++;
      }
    });

    // 準備堆疊條形圖的數據
    const yesData = [];
    const noData = [];
    const labels = [];

    // 計算每個類別的比例
    for (let i = 1; i <= 5; i++) {
      const total =
        delinquentBehaviorCounts[i].yes + delinquentBehaviorCounts[i].no;

      // 計算百分比（如果總數為0，則為0%）
      const yesPercentage =
        total > 0 ? (delinquentBehaviorCounts[i].yes / total) * 100 : 0;
      const noPercentage =
        total > 0 ? (delinquentBehaviorCounts[i].no / total) * 100 : 0;

      yesData.push(yesPercentage);
      noData.push(noPercentage);

      const hourLabel = Object.keys(gameHoursMap).find(
        (key) => gameHoursMap[key] === i
      );
      labels.push(hourLabel);
    }

    // 準備 X 軸刻度標籤
    const xLabels = Object.keys(gameHoursMap).sort(
      (a, b) => gameHoursMap[a] - gameHoursMap[b]
    );

    // 根據當前 X 軸數據類型設置圖表標題
    const chartTitle =
      xAxisDataType === "gameHours"
        ? "Game Time, Aggression Score and Delinquent Behavior Analysis"
        : "Violent Game Time, Aggression Score and Delinquent Behavior Analysis";

    // 根據當前 X 軸數據類型設置 X 軸標題
    const xAxisTitle =
      xAxisDataType === "gameHours" ? "Game Time" : "Violent Game Time";

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: xLabels,
        datasets: [
          {
            label: "Individual Data Points",
            type: "scatter",
            data: scatterData,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            pointRadius: 5,
            pointHoverRadius: 7,
            yAxisID: "y",
          },
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
            pointHoverRadius: 8,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            pointHoverBorderColor: "#fff",
            yAxisID: "y",
          },
          {
            label: "Delinquent Behavior - Yes",
            type: "bar",
            // 使用 x 值與點映射索引
            data: yesData.map((value, index) => ({
              x: index + 1,
              y: value,
            })),
            backgroundColor: "rgba(255, 159, 64, 0.7)",
            borderColor: "rgba(255, 159, 64, 1)",
            borderWidth: 1,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            yAxisID: "y1",
            order: 1,
            stack: "Stack 0",
          },
          {
            label: "Delinquent Behavior - No",
            type: "bar",
            // 使用 x 值與點映射索引
            data: noData.map((value, index) => ({
              x: index + 1,
              y: value,
            })),
            backgroundColor: "rgba(153, 102, 255, 0.7)",
            borderColor: "rgba(153, 102, 255, 1)",
            borderWidth: 1,
            categoryPercentage: 0.8,
            barPercentage: 0.9,
            yAxisID: "y1",
            order: 1,
            stack: "Stack 0",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
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
              bottom: 30,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const datasetLabel = context.dataset.label || "";

                if (context.dataset.type === "scatter") {
                  return `${datasetLabel}: ${xAxisTitle}: ${Object.keys(
                    gameHoursMap
                  ).find(
                    (key) => gameHoursMap[key] === context.parsed.x
                  )}, Aggression Score: ${context.parsed.y}`;
                } else if (context.dataset.type === "line") {
                  return `${datasetLabel}: ${Object.keys(gameHoursMap).find(
                    (key) => gameHoursMap[key] === context.parsed.x
                  )}, Value: ${context.parsed.y.toFixed(2)}`;
                } else {
                  // For bar datasets
                  const xValue = context.parsed.x;
                  return `${datasetLabel}: ${context.raw.y.toFixed(1)}%`;
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
              padding: 20,
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
            },
            ticks: {
              callback: function (value) {
                const labels = {
                  1: "less than 1 hour",
                  2: "more than 1 hour",
                  3: "more than 2 hour",
                  4: "more than 3 hour",
                  5: "more than 5 hour",
                };
                return labels[value] || "";
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
              text: "Buss-Perry Aggression Score",
            },
            suggestedMin: 30,
            suggestedMax: 150,
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            grid: {
              drawOnChartArea: false, // only want the grid lines for one axis to show up
            },
            title: {
              display: true,
              text: "Delinquent Behavior (%)",
            },
            min: 0,
            max: 100,
            ticks: {
              callback: function (value) {
                return value + "%";
              },
            },
            stacked: true,
          },
        },
      },
    });
  };

  return (
    <div className="aggression-analysis-container">
      <h1>Game Time and Aggression Score Analysis</h1>

      {loading ? (
        <div className="loading">Loading data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="chart-controls">
            <div className="metric-selector">
              <button
                className={`metric-button ${
                  xAxisDataType === "gameHours" ? "active" : ""
                }`}
                onClick={() => changeXAxisDataType("gameHours")}
              >
                Total Game Hours
              </button>
              <button
                className={`metric-button ${
                  xAxisDataType === "violentGameHours" ? "active" : ""
                }`}
                onClick={() => changeXAxisDataType("violentGameHours")}
              >
                Violent Game Hours
              </button>
            </div>
          </div>
          <div className="chart-container">
            <canvas ref={chartRef}></canvas>
          </div>
        </>
      )}
    </div>
  );
};

export default AggressionAnalysis;
