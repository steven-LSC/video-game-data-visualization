import React from "react";
import "./GameTable.css";

const GameTable = ({ data, selectedMetric }) => {
  return (
    <div className="game-table">
      <h3>Top 30 Games</h3>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Game Name</th>
              <th>Genre</th>
              <th>Platform</th>
              <th>{selectedMetric}</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                <td>{item.Game_Name}</td>
                <td>{item.Genre}</td>
                <td>{item.Platform}</td>
                <td>
                  {selectedMetric === "Global Sales"
                    ? item.Global_Sales
                    : selectedMetric === "User Rating"
                    ? item.User_Rating
                    : item.Active_Players}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GameTable;
