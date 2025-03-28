import { useEffect } from "react";
import styles from "../ChartDisplay.module.css";

function XboxChart() {
  useEffect(() => {
    if (window.google) {
      window.google.charts.load("current", { packages: ["corechart", "bar"] });
      window.google.charts.setOnLoadCallback(drawBarColors);
    }
  }, []);

  function drawBarColors() {
    // https://en.wikipedia.org/wiki/List_of_best-selling_Xbox_video_games
    const data = window.google.visualization.arrayToDataTable([
      ["Game", "Sales", { role: "annotation" }],
      ["Halo 2", 8.46, "8.46M"],
      ["Halo: Combat Evolved", 6, "6.0M"],
      ["Fable", 3, "3.0M"],
      ["Grand Theft Auto III and Vice City", 2.49, "2.49M"],
      ["Tom Clancy's Splinter Cell", 2.4, "2.4M"],
      ["Dead or Alive 3", 2, "2.0M"],
      ["Star Wars: Knights of the Old Republic", 1.58, "1.58M"],
      ["Counter-Strike", 1.5, "1.5M"],
      ["Ninja Gaiden", 1.5, "1.5M"],
      ["Grand Theft Auto: San Andreas", 1.46, "1.46M"],
      ["Need for Speed: Underground 2", 1.44, "1.44M"],
      ["Madden NFL 2005", 1.42, "1.42M"],
      ["Madden NFL 06", 1.41, "1.41M"],
      ["Call of Duty 2: Big Red One", 1.39, "1.39M"],
      ["ESPN NFL 2K5", 1.38, "1.38M"],
      ["The Elder Scrolls III: Morrowind", 1.36, "1.36M"],
      ["Star Wars: Battlefront", 1.22, "1.22M"],
      ["Project Gotham Racing", 1.2, "1.2M"],
      ["Star Wars: Battlefront II", 1.17, "1.17M"],
      ["Tom Clancy's Ghost Recon", 1.13, "1.13M"],
    ]);

    const options = {
      width: "100%",
      height: 800,
      chartArea: {
        width: "70%",
        height: "85%",
        left: "25%",
        top: "10%",
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
      document.getElementById("xbox_chart")
    );
    chart.draw(data, options);
  }

  return (
    <>
      <h2 className={styles.title}>
        <a
          href="https://en.wikipedia.org/wiki/List_of_best-selling_Xbox_video_games"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Best-selling Xbox games (Top 20)
        </a>
      </h2>
      <div id="xbox_chart" style={{ width: "100%", height: "800px" }}></div>
    </>
  );
}

export default XboxChart;
