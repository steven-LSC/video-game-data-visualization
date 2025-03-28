import { useEffect } from "react";
import styles from "../ChartDisplay.module.css";

function PCChart() {
  useEffect(() => {
    if (window.google) {
      window.google.charts.load("current", { packages: ["corechart", "bar"] });
      window.google.charts.setOnLoadCallback(drawBarColors);
    }
  }, []);

  function drawBarColors() {
    // https://en.wikipedia.org/wiki/List_of_best-selling_PC_games
    const data = window.google.visualization.arrayToDataTable([
      ["Game", "Sales", { role: "annotation" }],
      ["PUBG: Battlegrounds", 42.0, "42.0M"],
      ["Minecraft", 33.0, "33.0M"],
      ["Terraria", 32.0, "32.0M"],
      ["Stardew Valley", 26.0, "26.0M"],
      ["Diablo III", 20.0, "20.0M"],
      ["Garry's Mod", 20.0, "20.0M"],
      ["Rust", 16.0, "16.0M"],
      ["Palworld", 15.0, "15.0M"],
      ["Euro Truck Simulator 2", 15.0, "15.0M"],
      ["World of Warcraft", 14.0, "14.0M"],
      ["Half-Life 2", 12.3, "12.3M"],
      ["The Witcher 3: Wild Hunt", 12.0, "12.0M"],
      ["The Sims", 11.0, "11.0M"],
      ["StarCraft", 11.0, "11.0M"],
      ["RollerCoaster Tycoon 3", 10.0, "10.0M"],
      ["Fall Guys", 10.0, "10.0M"],
      ["Civilization V", 8.0, "8.0M"],
      ["Deep Rock Galactic", 8.0, "8.0M"],
      ["Cyberpunk 2077", 7.67, "7.67M"],
      ["The Sims 3", 7.0, "7.0M"],
      ["The Sims 2", 6.0, "6.0M"],
      ["Cities: Skylines", 6.0, "6.0M"],
      ["StarCraft II: Wings of Liberty", 6.0, "6.0M"],
      ["Guild Wars", 6.0, "6.0M"],
      ["Valheim", 6.0, "6.0M"],
      ["Myst", 6.0, "6.0M"],
      ["Last Ninja 2", 5.5, "5.5M"],
      ["ARMA 3", 5.5, "5.5M"],
      ["Satisfactory", 5.5, "5.5M"],
      ["The Forest", 5.3, "5.3M"],
    ]);

    const options = {
      width: "100%",
      height: 1200,
      chartArea: {
        width: "70%",
        height: "90%",
        left: "25%",
        top: "5%",
      },
      colors: ["#107C10"],
      annotations: {
        textStyle: {
          fontSize: 12,
          bold: true,
          color: "white",
        },
      },
      hAxis: {
        title: "Sales (Million)",
        minValue: 0,
        textStyle: {
          fontSize: 12,
        },
      },
      vAxis: {
        title: "Game",
        textStyle: {
          fontSize: 12,
        },
        slantedText: false,
        slantedTextAngle: 0,
      },
      legend: { position: "none" },
      bar: { groupWidth: "70%" },
    };

    const chart = new window.google.visualization.BarChart(
      document.getElementById("pc_chart")
    );
    chart.draw(data, options);
  }

  return (
    <>
      <h2 className={styles.title}>
        <a
          href="https://en.wikipedia.org/wiki/List_of_best-selling_PC_games"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Best-selling PC games (Top 30)
        </a>
      </h2>
      <div id="pc_chart" style={{ width: "100%", height: "800px" }}></div>
    </>
  );
}

export default PCChart;
