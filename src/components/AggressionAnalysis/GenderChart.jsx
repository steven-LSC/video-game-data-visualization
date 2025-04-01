import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { csv } from "d3";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./AggressionAnalysis.css";

Chart.register(ChartDataLabels);

const GenderChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Load and process data
    csv("/aggression-analysis.csv").then((data) => {
      // Calculate gender distribution
      const genderDistribution = {};
      data.forEach((d) => {
        const gender = d.Gender;
        genderDistribution[gender] = (genderDistribution[gender] || 0) + 1;
      });

      // Convert to chart format
      const genders = Object.keys(genderDistribution);
      const counts = genders.map((gender) => genderDistribution[gender]);

      const ctx = chartRef.current.getContext("2d");

      chartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: genders,
          datasets: [
            {
              data: counts,
              backgroundColor: [
                "rgba(255, 99, 132, 0.6)",
                "rgba(54, 162, 235, 0.6)",
              ],
              borderColor: ["rgba(255, 99, 132, 1)", "rgba(54, 162, 235, 1)"],
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
              text: "Gender Distribution of Respondents",
              font: {
                size: 16,
              },
            },
            legend: {
              position: "bottom",
            },
            datalabels: {
              color: "#666",
              font: {
                size: 14,
              },
              formatter: (value) => value,
            },
          },
        },
      });
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="chart-container">
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default GenderChart;
