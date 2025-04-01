import React, { useEffect, useState } from "react";
import { csv } from "d3";
import SalesTable from "./SalesTable";
import SalesChart from "./SalesChart";
import "./SalesOverview.css";

const SalesOverview = () => {
  const [pcConsoleData, setPcConsoleData] = useState([]);
  const [mobileData, setMobileData] = useState([]);
  const [activeTab, setActiveTab] = useState("pcConsole");
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    // Load CSV data
    csv("/sales/pc-console-sales.csv").then((csvData) => {
      // Process the data
      const processedData = csvData.map((d) => ({
        Game_Name: d["게임 이름"], // Game name
        Platform: "PC/Console",
        Sales: parseNumber(d["Sales (2023)"]),
        Rank: d["순위"], // Rank
      }));
      setPcConsoleData(processedData);
    });

    csv("sales/mobile-sales.csv").then((csvData) => {
      // Process the data
      const processedData = csvData.map((d) => ({
        Game_Name: d["게임 이름"], // Game name
        Platform: "Mobile",
        Sales: parseNumber(d["Sales (2023)"]),
        Rank: d["순위"], // Rank
      }));
      setMobileData(processedData);
    });
  }, []);

  // Helper function to parse numbers from strings like "238000000" or "1,000,000,000"
  const parseNumber = (str) => {
    if (!str) return 0;
    return parseInt(str.replace(/,/g, ""), 10);
  };

  useEffect(() => {
    // Update filtered data based on active tab
    if (activeTab === "pcConsole" && pcConsoleData.length > 0) {
      setFilteredData(pcConsoleData);
    } else if (activeTab === "mobile" && mobileData.length > 0) {
      setFilteredData(mobileData);
    }
  }, [activeTab, pcConsoleData, mobileData]);

  return (
    <div className="visualization-container">
      <div className="tabs">
        <button
          className={`tab-button ${activeTab === "pcConsole" ? "active" : ""}`}
          onClick={() => setActiveTab("pcConsole")}
        >
          PC/Console Games
        </button>
        <button
          className={`tab-button ${activeTab === "mobile" ? "active" : ""}`}
          onClick={() => setActiveTab("mobile")}
        >
          Mobile Games
        </button>
      </div>
      <div className="data-visualization">
        <SalesTable data={filteredData} selectedMetric={"Sales"} />
        <SalesChart data={filteredData} selectedMetric={"Sales"} />
      </div>
    </div>
  );
};

export default SalesOverview;
