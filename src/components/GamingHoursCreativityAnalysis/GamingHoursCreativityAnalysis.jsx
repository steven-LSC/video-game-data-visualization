import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Papa from "papaparse";
import styles from "./GamingHoursCreativityAnalysis.module.css";

// 禁用 Chart.js 中的 datalabels 插件
Chart.overrides.scatter.plugins = Chart.overrides.scatter.plugins || {};
Chart.overrides.scatter.plugins.datalabels =
  Chart.overrides.scatter.plugins.datalabels || {};
Chart.overrides.scatter.plugins.datalabels.display = false;

const CreativityTimeAnalysis = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);

  // 遊戲時間映射
  const gameHoursMap = {
    "I don't play video games": 0,
    "Less than 2 hours": 1,
    "From 2 to 4 hours": 2,
    "From 4 to 6 hours": 3,
    "More than 6 hours": 4,
  };

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
      createChart(chartData);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData]);

  const createChart = (data) => {
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

    // 處理數據為散點圖格式
    const scatterData = data.map((item) => ({
      x: gameHoursMap[item["Daily game time"]],
      y: parseInt(item["TTCT Test Score"]),
    }));

    // 計算每個遊戲時間類別的平均創意度得分
    const creativityScoresByGameHours = {};
    const countByGameHours = {};

    // 初始化計數器和總和
    Object.values(gameHoursMap).forEach((value) => {
      creativityScoresByGameHours[value] = 0;
      countByGameHours[value] = 0;
    });

    // 計算總和和計數
    data.forEach((item) => {
      const hourValue = gameHoursMap[item["Daily game time"]];
      const score = parseInt(item["TTCT Test Score"]);

      if (!isNaN(score)) {
        creativityScoresByGameHours[hourValue] += score;
        countByGameHours[hourValue]++;
      }
    });

    // 計算平均值並準備折線圖數據
    const averageLineData = Object.keys(creativityScoresByGameHours)
      .map((hourValue) => {
        const count = countByGameHours[hourValue];
        const average =
          count > 0 ? creativityScoresByGameHours[hourValue] / count : 0;

        return {
          x: parseInt(hourValue),
          y: average,
        };
      })
      .sort((a, b) => a.x - b.x);

    // 準備 X 軸刻度標籤
    const xLabels = Object.keys(gameHoursMap).sort(
      (a, b) => gameHoursMap[a] - gameHoursMap[b]
    );

    chartInstance.current = new Chart(ctx, {
      type: "scatter",
      data: {
        datasets: [
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
          {
            label: "Average Creativity Score",
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
          title: {
            display: true,
            text: "Relationship Between Gaming Hours and Creativity Scores",
            font: {
              size: 16,
              weight: "bold",
            },
            padding: {
              bottom: 20,
            },
          },
          tooltip: {
            callbacks: {
              title: function () {
                // 移除tooltip的標題
                return "";
              },
              label: function (context) {
                const datasetLabel = context.dataset.label || "";

                if (context.datasetIndex === 0) {
                  // 對於散點圖數據（Individual Data Points）
                  const originalHours = Object.keys(gameHoursMap).find(
                    (key) => gameHoursMap[key] === context.parsed.x
                  );
                  return `${datasetLabel}: Gaming Time: ${originalHours}, Creativity Score: ${context.parsed.y}`;
                } else {
                  // 對於平均值線（Average Creativity Score）
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
              text: "Daily Gaming Hours",
              padding: {
                top: 15,
              },
            },
            ticks: {
              callback: function (value) {
                return Object.keys(gameHoursMap).find(
                  (key) => gameHoursMap[key] === value
                );
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
              text: "Creativity Score (TTCT)",
              padding: {
                bottom: 15,
              },
            },
            suggestedMin: 50,
            suggestedMax: 150,
          },
        },
      },
    });
  };

  return (
    <div className={styles.creativityTimeAnalysisContainer}>
      <h1>Gaming Hours and Creativity Analysis</h1>

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

export default CreativityTimeAnalysis;
