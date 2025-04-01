import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./SalesChart.css";

Chart.register(ChartDataLabels);

const SalesChart = ({ data, selectedMetric }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Fixed color
  const chartColor = "rgba(75, 192, 192, 0.6)";
  const chartBorderColor = "rgba(75, 192, 192, 1)";

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (!data || data.length === 0) return;

    const ctx = chartRef.current.getContext("2d");

    // Only show top 30 data points
    const displayData = [...data]
      .sort((a, b) => b.Sales - a.Sales)
      .slice(0, 30);

    chartInstance.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: displayData.map((item) => item.Game_Name),
        datasets: [
          {
            label: "Sales",
            data: displayData.map((item) => item.Sales),
            backgroundColor: chartColor,
            borderColor: chartBorderColor,
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
            display: false, // Hide legend
          },
          title: {
            display: true,
            text: `Top 30 Games by Sales`,
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
                return `Sales: ${context.parsed.x.toLocaleString()}`;
              },
            },
          },
          datalabels: {
            align: "end",
            anchor: "end",
            offset: 4,
            color: "#666",
            font: {
              size: 11,
            },
            formatter: function (value) {
              if (value >= 1000000000) {
                return (value / 1000000000).toFixed(1) + "B";
              } else if (value >= 1000000) {
                return (value / 1000000).toFixed(1) + "M";
              }
              return value;
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
              callback: function (value) {
                if (value >= 1000000000) {
                  return (value / 1000000000).toFixed(1) + "B";
                } else if (value >= 1000000) {
                  return (value / 1000000).toFixed(1) + "M";
                }
                return value;
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
  }, [data]);

  return (
    <div className="sales-chart">
      <div className="chart-container">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default SalesChart;
