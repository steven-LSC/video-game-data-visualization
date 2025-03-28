import React, { useEffect, useState } from "react";
import { csv } from "d3";
import GameTable from "./GameTable";
import GameChart from "./GameChart";
import "./GameDataVisualization.css";

const GameDataVisualization = () => {
  const [data, setData] = useState([]);
  const [selectedPlatform, setSelectedPlatform] = useState("PC");
  const [selectedMetric, setSelectedMetric] = useState("Global Sales");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Load CSV data
    csv("/game_dataset.csv").then((csvData) => {
      setData(csvData);
    });
  }, []);

  useEffect(() => {
    if (data.length === 0) return;

    // Set metric key based on selection
    const metricKey =
      selectedMetric === "Global Sales"
        ? "Global_Sales"
        : selectedMetric === "User Rating"
        ? "User_Rating"
        : "Active_Players";

    // 1. Filter by platform
    const platformData = data.filter((d) => d.Platform === selectedPlatform);

    // 2. Sort and get top 30
    const top30Data = [...platformData]
      .sort((a, b) => +b[metricKey] - +a[metricKey])
      .slice(0, 30);

    setFilteredData(top30Data);
  }, [data, selectedPlatform, selectedMetric]);

  return (
    <div className="visualization-container">
      <div className="controls">
        <div className="platform-selector">
          <h3>Select Platform</h3>
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
          >
            <option value="PC">PC</option>
            <option value="Mobile">Mobile</option>
            <option value="PlayStation">PlayStation</option>
            <option value="Xbox">Xbox</option>
            <option value="Switch">Switch</option>
          </select>
        </div>
        <div className="metric-selector">
          <h3>Select Metric</h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="Global Sales">Global Sales</option>
            <option value="User Rating">User Rating</option>
            <option value="Active Players">Active Players</option>
          </select>
        </div>
      </div>
      <div className="data-visualization">
        <GameTable data={filteredData} selectedMetric={selectedMetric} />
        <GameChart data={filteredData} selectedMetric={selectedMetric} />
      </div>
    </div>
  );
};

export default GameDataVisualization;
