import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import {
  BoxPlotController,
  BoxAndWiskers,
} from "@sgratzl/chartjs-chart-boxplot";
import Papa from "papaparse";
import styles from "./GamingHoursMentalHealthAnalysis.module.css";
import TabSelector from "../common/TabSelector";

// 註冊 box plot 組件
Chart.register(BoxPlotController, BoxAndWiskers);

// 禁用 Chart.js 中的 datalabels 插件（如果已自動註冊）
Chart.overrides.bubble.plugins = Chart.overrides.bubble.plugins || {};
Chart.overrides.bubble.plugins.datalabels =
  Chart.overrides.bubble.plugins.datalabels || {};
Chart.overrides.bubble.plugins.datalabels.display = false;

const AnxietyAnalysis = ({ onMetricChange }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [yAxisMetric, setYAxisMetric] = useState("GAD_T"); // 默認顯示 GAD_T

  // 指標名稱映射
  const metricNames = {
    GAD_T: "Generalized Anxiety Disorder",
    SWL_T: "Satisfaction with Life",
    SPIN_T: "Social Phobia Inventory",
  };

  // Tab 選項配置
  const tabOptions = [
    { id: "GAD_T", label: "Anxiety (GAD)" },
    { id: "SWL_T", label: "Life Satisfaction" },
    { id: "SPIN_T", label: "Social Anxiety" },
  ];

  // 第一個 useEffect：獲取和解析數據
  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);
        // 獲取CSV文件
        const response = await fetch("/anxiety-analysis.csv");
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

  // 第二個 useEffect：在數據載入完成後且組件渲染後創建圖表，或當 Y 軸指標改變時重新創建
  useEffect(() => {
    // 確保 chartData 存在且圖表 refs 不為 null
    if (chartData && chartRef.current) {
      createBoxPlotChart(chartData);
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [chartData, chartRef, yAxisMetric]);

  // 切換 Y 軸指標
  const changeYAxisMetric = (metric) => {
    setYAxisMetric(metric);

    // 通知父組件當前選定的指標
    if (onMetricChange) {
      onMetricChange(metricNames[metric]);
    }
  };

  const createBoxPlotChart = (data) => {
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

    // 過濾有效數據
    const validData = data.filter((item) => {
      const hours = parseInt(item.Hours);
      const metricValue = parseInt(item[yAxisMetric]);
      return !isNaN(hours) && !isNaN(metricValue) && hours >= 0;
    });

    // 按每個具體的遊戲小時數分組數據
    const hoursGrouped = {};

    validData.forEach((item) => {
      const hours = parseInt(item.Hours);
      const metricValue = parseInt(item[yAxisMetric]);

      // 按具體小時數分組
      const hourGroup = `${hours}h`;

      if (!hoursGrouped[hourGroup]) {
        hoursGrouped[hourGroup] = [];
      }

      hoursGrouped[hourGroup].push(metricValue);
    });

    // 過濾掉樣本數少於 5 的小時數，確保統計意義，然後按小時數排序
    const filteredGroups = Object.entries(hoursGrouped)
      .filter(([group, values]) => values.length >= 5)
      .sort((a, b) => {
        // 按數字大小排序
        const hourA = parseInt(a[0].replace("h", ""));
        const hourB = parseInt(b[0].replace("h", ""));
        return hourA - hourB;
      });

    // 創建 box plot 數據
    const boxplotData = filteredGroups.map(([group, values]) => ({
      label: group,
      data: values,
    }));

    // 計算每個小時的平均值，用於繪製平均線
    const averageLineData = filteredGroups
      .map(([group, values]) => {
        const hourValue = parseInt(group.replace("h", ""));
        const average =
          values.reduce((sum, val) => sum + val, 0) / values.length;
        return {
          x: hourValue,
          y: average,
        };
      })
      .sort((a, b) => a.x - b.x);

    // 計算統計範圍
    const allValues = Object.values(hoursGrouped).flat();
    const maxMetric = Math.max(...allValues);
    const minMetric = Math.min(...allValues);

    chartInstance.current = new Chart(ctx, {
      type: "boxplot",
      data: {
        labels: boxplotData.map((item) => item.label),
        datasets: [
          {
            label: metricNames[yAxisMetric],
            data: boxplotData.map((item) => item.data),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
            outlierColor: "transparent", // 隱藏異常值點
            outlierRadius: 0, // 設為0隱藏異常值
            itemRadius: 0, // 隱藏個別數據點，只顯示箱型圖
            order: 2, // 箱型圖在下層
            // Hover 效果
            hoverBackgroundColor: "rgba(75, 192, 192, 0.8)",
            hoverBorderColor: "rgba(75, 192, 192, 1)",
            hoverBorderWidth: 3,
          },
          {
            type: "line",
            label: `Average ${metricNames[yAxisMetric]}`,
            data: averageLineData,
            fill: false,
            borderColor: "rgba(255, 99, 132, 1)",
            backgroundColor: "rgba(255, 99, 132, 1)",
            borderWidth: 3,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "rgba(255, 99, 132, 1)",
            pointBorderColor: "#fff",
            pointBorderWidth: 1,
            pointHoverRadius: 20,
            pointHoverBackgroundColor: "rgba(255, 99, 132, 1)",
            pointHoverBorderColor: "#fff",
            order: 1, // 平均線在上層
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Distribution of ${metricNames[yAxisMetric]} by Gaming Hours`,
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
              title: function (context) {
                return `Gaming Hours: ${context[0].label}`;
              },
              label: function (context) {
                if (context.datasetIndex === 1) {
                  // 平均值線的 tooltip
                  return `Average ${
                    metricNames[yAxisMetric]
                  }: ${context.parsed.y.toFixed(2)}`;
                } else {
                  // Box plot 的 tooltip
                  const stats = context.parsed;
                  return [
                    `Min: ${stats.min.toFixed(1)}`,
                    `Q1: ${stats.q1.toFixed(1)}`,
                    `Median: ${stats.median.toFixed(1)}`,
                    `Q3: ${stats.q3.toFixed(1)}`,
                    `Max: ${stats.max.toFixed(1)}`,
                    `Sample size: ${
                      context.dataset.data[context.dataIndex].length
                    }`,
                  ];
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
            },
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Gaming Hours per Week",
              padding: {
                top: 15,
              },
            },
          },
          y: {
            title: {
              display: true,
              text: metricNames[yAxisMetric],
              padding: {
                bottom: 15,
              },
            },
            suggestedMin: Math.max(0, minMetric - 2),
            suggestedMax: maxMetric + 2,
          },
        },
      },
    });
  };

  return (
    <div className={styles.anxietyAnalysisContainer}>
      <h1>Gaming Hours and Mental Health Analysis</h1>

      <div className={styles.chartControls}>
        <TabSelector
          options={tabOptions}
          activeTab={yAxisMetric}
          onChange={changeYAxisMetric}
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

export default AnxietyAnalysis;
