import { useEffect } from "react";
import styles from "../ChartDisplay.module.css";

function NintendoChart() {
  useEffect(() => {
    if (window.google) {
      window.google.charts.load("current", { packages: ["corechart", "bar"] });
      window.google.charts.setOnLoadCallback(drawBarColors);
    }
  }, []);

  function drawBarColors() {
    // https://en.wikipedia.org/wiki/List_of_best-selling_Nintendo_Switch_video_games
    const data = window.google.visualization.arrayToDataTable([
      ["Game", "Sales", { role: "annotation" }],
      ["Mario Kart 8 Deluxe", 67.35, "67.35M"],
      ["Animal Crossing: New Horizons", 47.44, "47.44M"],
      ["Super Smash Bros. Ultimate", 35.88, "35.88M"],
      ["The Legend of Zelda: Breath of the Wild", 32.62, "32.62M"],
      ["Super Mario Odyssey", 29.04, "29.04M"],
      ["Pokémon Sword and Shield", 26.6, "26.6M"],
      ["Pokémon Scarlet and Violet", 26.38, "26.38M"],
      ["The Legend of Zelda: Tears of the Kingdom", 21.55, "21.55M"],
      ["Super Mario Party", 21.1, "21.1M"],
      ["New Super Mario Bros. U Deluxe", 18.06, "18.06M"],
      ["Nintendo Switch Sports", 15.74, "15.74M"],
      ["Super Mario Bros. Wonder", 15.51, "15.51M"],
      ["Ring Fit Adventure", 15.38, "15.38M"],
      ["Pokémon: Let's Go, Pikachu! and Let's Go, Eevee!", 15.07, "15.07M"],
      ["Pokémon Brilliant Diamond and Shining Pearl", 15.06, "15.06M"],
      ["Pokémon Legends: Arceus", 14.83, "14.83M"],
      ["Luigi's Mansion 3", 14.25, "14.25M"],
      ["Splatoon 2", 13.6, "13.6M"],
      ["Super Mario 3D World + Bowser's Fury", 13.47, "13.47M"],
      ["Mario Party Superstars", 12.89, "12.89M"],
      ["Splatoon 3", 11.96, "11.96M"],
      ["Super Mario 3D All-Stars", 9.07, "9.07M"],
      ["Super Mario Maker 2", 8.42, "8.42M"],
      ["Monster Hunter Rise", 8.09, "8.09M"],
      ["Stardew Valley", 7.9, "7.9M"],
      ["Kirby and the Forgotten Land", 7.52, "7.52M"],
      ["Suika Game", 7.4, "7.4M"],
      ["The Legend of Zelda: Link's Awakening", 6.46, "6.46M"],
      ["Minecraft", 6.19, "6.19M"],
      ["Super Mario Party Jamboree", 6.17, "6.17M"],
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
      document.getElementById("nintendo_chart")
    );
    chart.draw(data, options);
  }

  return (
    <>
      <h2 className={styles.title}>
        <a
          href="https://en.wikipedia.org/wiki/List_of_best-selling_Nintendo_Switch_video_games"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Best-selling Nintendo Switch games (Top 30)
        </a>
      </h2>
      <div id="nintendo_chart" style={{ width: "100%", height: "800px" }}></div>
    </>
  );
}

export default NintendoChart;
