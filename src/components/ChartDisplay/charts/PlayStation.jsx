import { useEffect } from "react";
import styles from "../ChartDisplay.module.css";

function PlayStationChart() {
  useEffect(() => {
    if (window.google) {
      window.google.charts.load("current", { packages: ["corechart", "bar"] });
      window.google.charts.setOnLoadCallback(drawBarColors);
    }
  }, []);

  function drawBarColors() {
    // https://en.wikipedia.org/wiki/List_of_best-selling_PlayStation_video_games
    const data = window.google.visualization.arrayToDataTable([
      ["Game", "Sales", { role: "annotation" }],
      ["Gran Turismo", 10.85, "10.8M"],
      ["Final Fantasy VII", 10.022228, "10.0M"],
      ["Gran Turismo 2", 9.37, "9.4M"],
      ["Final Fantasy VIII", 8.6, "8.6M"],
      ["Tekken 3", 8.3, "8.3M"],
      ["Harry Potter and the Philosopher's Stone", 8.0, "8.0M"],
      ["Crash Bandicoot 2: Cortex Strikes Back", 7.58, "7.6M"],
      ["Crash Bandicoot: Warped", 7.13, "7.1M"],
      ["Metal Gear Solid", 7.0, "7.0M"],
      ["Crash Bandicoot", 6.82, "6.8M"],
      ["Resident Evil 2", 5.77, "5.8M"],
      ["Tekken 2", 5.7, "5.7M"],
      ["Final Fantasy IX", 5.5, "5.5M"],
      ["Resident Evil", 5.08, "5.1M"],
      ["Spyro the Dragon", 4.832145, "4.8M"],
      ["Dragon Quest VII", 4.11, "4.1M"],
      ["Rayman", 4.0, "4.0M"],
      ["Crash Team Racing", 4.0, "4.0M"],
      ["Oddworld: Abe's Oddysee", 3.5, "3.5M"],
      ["Tony Hawk's Pro Skater", 3.5, "3.5M"],
      ["Resident Evil 3: Nemesis", 3.5, "3.5M"],
      ["Spyro 2: Ripto's Rage", 3.451064, "3.5M"],
      ["Frogger", 3.37, "3.4M"],
      ["Spyro: Year of the Dragon", 3.283077, "3.3M"],
      ["Driver", 3.22, "3.2M"],
      ["Tony Hawk's Pro Skater 2", 3.15, "3.1M"],
      ["Croc: Legend of the Gobbos", 3.0, "3.0M"],
      ["Driver 2", 2.85, "2.9M"],
      ["Yu-Gi-Oh! Forbidden Memories", 2.510804, "2.5M"],
      ["Dino Crisis", 2.4, "2.4M"],
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
      document.getElementById("playstation_chart")
    );
    chart.draw(data, options);
  }

  return (
    <>
      <h2 className={styles.title}>
        <a
          href="https://en.wikipedia.org/wiki/List_of_best-selling_PlayStation_video_games"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Best-selling PlayStation games (Top 30)
        </a>
      </h2>
      <div
        id="playstation_chart"
        style={{ width: "100%", height: "800px" }}
      ></div>
    </>
  );
}

export default PlayStationChart;
