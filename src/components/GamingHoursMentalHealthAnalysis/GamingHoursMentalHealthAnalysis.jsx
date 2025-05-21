import React, { useEffect, useRef, useState } from "react";
import { Chart } from "chart.js/auto";
import Papa from "papaparse";
import styles from "./GamingHoursMentalHealthAnalysis.module.css";
import TabSelector from "../common/TabSelector";

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
      createBubbleChart(chartData);
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

  const createBubbleChart = (data) => {
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

    // 計算每個小時和指標值組合的數量
    const bubbleData = {};

    validData.forEach((item) => {
      const hours = parseInt(item.Hours);
      const metricValue = parseInt(item[yAxisMetric]);

      // 創建唯一鍵，用於計數
      const key = `${hours}-${metricValue}`;

      if (!bubbleData[key]) {
        bubbleData[key] = {
          x: hours,
          y: metricValue,
          count: 0,
        };
      }

      bubbleData[key].count++;
    });

    // 將數據轉換為氣泡圖格式
    const bubbles = Object.values(bubbleData).map((item) => ({
      x: item.x,
      y: item.y,
      r: Math.sqrt(item.count) * 3, // 半徑根據數量的平方根進行縮放，讓視覺效果更合理
    }));

    // 計算最大值和最小值，用於自動調整軸的範圍
    const hours = validData.map((item) => parseInt(item.Hours));
    const metricValues = validData.map((item) => parseInt(item[yAxisMetric]));

    const maxHours = Math.max(...hours);
    const minHours = Math.min(...hours);
    const maxMetric = Math.max(...metricValues);
    const minMetric = Math.min(...metricValues);

    // 計算每個遊戲時間的平均指標值 - 新增
    const hourToMetricValues = {};

    validData.forEach((item) => {
      const hour = parseInt(item.Hours);
      const value = parseInt(item[yAxisMetric]);

      if (!hourToMetricValues[hour]) {
        hourToMetricValues[hour] = {
          sum: 0,
          count: 0,
        };
      }

      hourToMetricValues[hour].sum += value;
      hourToMetricValues[hour].count++;
    });

    // 計算平均值並按小時排序，只包含至少有5個樣本的遊戲時間
    const averageLineData = Object.entries(hourToMetricValues)
      .filter(([hour, data]) => data.count >= 5) // 過濾少於5個參與者的遊戲時間
      .map(([hour, data]) => ({
        x: parseInt(hour),
        y: data.sum / data.count,
      }))
      .sort((a, b) => a.x - b.x);

    // 創建單一數據集
    const dataset = {
      label: `Gaming Hours vs ${metricNames[yAxisMetric]}`,
      data: bubbles,
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
    };

    // 創建平均值折線數據集 - 新增
    const averageLineDataset = {
      type: "line",
      label: `Average ${metricNames[yAxisMetric]}`,
      data: averageLineData,
      fill: false,
      borderColor: "rgba(255, 99, 132, 1)",
      backgroundColor: "rgba(255, 99, 132, 0.5)",
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 3,
      pointBackgroundColor: "rgba(255, 99, 132, 1)",
      pointBorderColor: "#fff",
      pointBorderWidth: 1,
      pointHoverRadius: 5,
    };

    chartInstance.current = new Chart(ctx, {
      type: "bubble",
      data: {
        datasets: [averageLineDataset, dataset], // 先畫折線圖，後畫氣泡圖，這樣折線圖會在上層
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: `Relationship Between Gaming Hours and ${metricNames[yAxisMetric]}`,
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
              label: function (context) {
                if (context.datasetIndex === 0) {
                  // 氣泡數據
                  const point = context.raw;
                  const count = Math.round((point.r / 3) ** 2); // 反向計算數量
                  return `Hours: ${point.x}, ${metricNames[yAxisMetric]}: ${point.y}, Count: ${count}`;
                } else {
                  // 平均值折線
                  return `Hours: ${context.parsed.x}, Average ${
                    metricNames[yAxisMetric]
                  }: ${context.parsed.y.toFixed(2)}`;
                }
              },
            },
          },
          legend: {
            display: true, // 顯示圖例，區分氣泡和平均值線
            position: "top",
          },
        },
        scales: {
          x: {
            title: {
              display: true,
              text: "Gaming Hours per Week",
            },
            suggestedMin: Math.max(0, minHours - 2),
            suggestedMax: maxHours + 2,
            ticks: {
              stepSize: 5,
            },
          },
          y: {
            title: {
              display: true,
              text: metricNames[yAxisMetric],
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
