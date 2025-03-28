import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import "./GameChart.css";

const GameChart = ({ data, selectedMetric }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // 定義不同遊戲類型的顏色
  const genreColors = {
    RPG: "rgba(255, 99, 132, 0.6)", // 紅色
    Action: "rgba(54, 162, 235, 0.6)", // 藍色
    Adventure: "rgba(75, 192, 192, 0.6)", // 青色
    Strategy: "rgba(255, 206, 86, 0.6)", // 黃色
    Racing: "rgba(153, 102, 255, 0.6)", // 紫色,
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const metricKey =
      selectedMetric === "Global Sales"
        ? "Global_Sales"
        : selectedMetric === "User Rating"
        ? "User_Rating"
        : "Active_Players";

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.map((item) => item.Game_Name),
        datasets: [
          {
            label: selectedMetric,
            data: data.map((item) => item[metricKey]),
            backgroundColor: data.map(
              (item) => genreColors[item.Genre] || "rgba(201, 203, 207, 0.6)" // 默認顏色
            ),
            borderWidth: 1,
            barThickness: 25,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: `Data Visualization`,
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
                const item = data[context.dataIndex];
                return [
                  `${selectedMetric}: ${context.parsed.x}`,
                  `Genre: ${item.Genre}`,
                ];
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: {
              display: true,
            },
            ticks: {
              font: {
                size: 12,
              },
            },
          },
          y: {
            grid: {
              display: false,
            },
            ticks: {
              font: {
                size: 13,
                weight: "bold",
              },
              padding: 10,
            },
          },
        },
        layout: {
          padding: {
            left: 20,
            right: 30,
            top: 20,
            bottom: 20,
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, selectedMetric]);

  return (
    <div className="game-chart">
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default GameChart;
