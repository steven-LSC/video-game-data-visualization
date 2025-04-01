import React from "react";
import AgeChart from "./AgeChart";
import GenderChart from "./GenderChart";
import "./AggressionAnalysis.css";

const AggressionAnalysis = () => {
  return (
    <div className="aggression-analysis-container">
      <h2>遊戲玩家行為分析</h2>
      <div className="charts-grid">
        <div className="chart-wrapper">
          <AgeChart />
        </div>
        <div className="chart-wrapper">
          <GenderChart />
        </div>
      </div>
    </div>
  );
};

export default AggressionAnalysis;
