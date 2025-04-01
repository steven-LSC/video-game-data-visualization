import React, { useEffect, useRef } from "react";
import { Chart } from "chart.js/auto";
import { csv } from "d3";
import ChartDataLabels from "chartjs-plugin-datalabels";
import "./AggressionAnalysis.css";

Chart.register(ChartDataLabels);

const AgeChart = () => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Load and process data
    csv("/aggression-analysis.csv").then((data) => {
      // Calculate age distribution
      const ageDistribution = {};
      data.forEach((d) => {
        const age = parseInt(d["Age"]);
        ageDistribution[age] = (ageDistribution[age] || 0) + 1;
      });

      // Convert to chart format
      const ages = Object.keys(ageDistribution).sort((a, b) => a - b);
      const counts = ages.map((age) => ageDistribution[age]);

      const ctx = chartRef.current.getContext("2d");

      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: ages,
          datasets: [
            {
              label: "Age Distribution",
              data: counts,
              backgroundColor: "rgba(75, 192, 192, 0.6)",
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
              text: "Age Distribution of Respondents",
              font: {
                size: 16,
              },
            },
            datalabels: {
              anchor: "end",
              align: "top",
              color: "#666",
              font: {
                size: 12,
              },
              formatter: (value) => value,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Count",
              },
            },
            x: {
              title: {
                display: true,
                text: "Age",
              },
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

export default AgeChart;
