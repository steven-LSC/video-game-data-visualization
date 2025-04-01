import React from "react";
import SalesOverview from "./SalesOverview";
import "./Sales.css";

const Sales = () => {
  return (
    <div className="sales-container">
      <h2>Game Sales Analysis</h2>
      <SalesOverview />
    </div>
  );
};

export default Sales;
