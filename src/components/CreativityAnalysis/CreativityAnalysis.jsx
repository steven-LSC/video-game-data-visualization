import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Papa from "papaparse";
import "./CreativityAnalysis.css";

// 禁用 Chart.js 中的 datalabels 插件
Chart.overrides.scatter.plugins = Chart.overrides.scatter.plugins || {};
Chart.overrides.scatter.plugins.datalabels =
  Chart.overrides.scatter.plugins.datalabels || {};
Chart.overrides.scatter.plugins.datalabels.display = false;

const CreativityAnalysis = () => {
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
            filteredData.reduce(
              (sum, item) => sum + parseInt(item[selectedMetric]),
              0
            ) / filteredData.length;

          maxScore = Math.max(maxScore, avgScore);
          minScore = Math.min(minScore, avgScore);
        }
      }
    });

    // 計算氣泡大小的範圍
    const minBubbleSize = 5;
    const maxBubbleSize = 40;

    gameTypes.forEach((gameType, gameIndex) => {
      for (let frequency = 1; frequency <= 5; frequency++) {
        const key = `${gameType}-${frequency}`;
        const filteredData = data.filter(
          (item) => parseInt(item[gameType]) === frequency
        );

        if (filteredData.length > 0) {
          const avgScore =
            filteredData.reduce(
              (sum, item) => sum + parseInt(item[selectedMetric]),
              0
            ) / filteredData.length;

          // 使用指數縮放來強調差異
          const normalizedScore = (avgScore - minScore) / (maxScore - minScore);
          const exponentialFactor = 2;
          const scaledScore = Math.pow(normalizedScore, exponentialFactor);
          const bubbleSize =
            minBubbleSize + (maxBubbleSize - minBubbleSize) * scaledScore;

          bubbleData[key] = {
            x: gameIndex,
            y: frequency,
            r: bubbleSize,
            avgScore: avgScore,
            sampleCount: filteredData.length,
          };
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
              return `rgba(75, 192, 192, ${0.3 + normalizedScore * 0.7})`;
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
              bottom: 30,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const point = context.raw;
                const gameType = gameTypes[point.x];
                return [
                  `Game Type: ${gameType}`,
                  `Play Frequency: ${point.y}`,
                  `${metricNames[selectedMetric]}: ${point.avgScore.toFixed(
                    2
                  )}`,
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
          },
          y: {
            title: {
              display: true,
              text: "Play Frequency (1-5)",
            },
            min: 0,
            max: 6,
            ticks: {
              stepSize: 1,
            },
          },
        },
      },
    });
  };

  return (
    <div className="creativity-analysis-container">
      <div className="metric-controls">
        <div className="metric-selector">
          {Object.entries(metricNames).map(([key, name]) => (
            <button
              key={key}
              className={`metric-button ${
                selectedMetric === key ? "active" : ""
              }`}
              onClick={() => setSelectedMetric(key)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="loading">Loading data...</div>
      ) : error ? (
        <div className="error">{error}</div>
      ) : (
        <div className="chart-container">
          <canvas ref={chartRef}></canvas>
        </div>
      )}
    </div>
  );
};

export default CreativityAnalysis;
