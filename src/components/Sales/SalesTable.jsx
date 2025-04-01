import React from "react";
import "./SalesTable.css";

const SalesTable = ({ data, selectedMetric }) => {
  return (
    <div className="sales-table">
      <h3>Top 30 Games by Sales</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Game Title</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.Rank}</td>
                <td>{item.Game_Name}</td>
                <td>
                  {typeof item.Sales === "number"
                    ? item.Sales.toLocaleString()
                    : item.Sales}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;
