import { useEffect } from "react";
import styles from "../ChartDisplay.module.css";

function MobileChart() {
  useEffect(() => {
    if (window.google) {
      window.google.charts.load("current", { packages: ["corechart", "bar"] });
      window.google.charts.setOnLoadCallback(drawBarColors);
    }
  }, []);

  function drawBarColors() {
    // https://en.wikipedia.org/wiki/List_of_most-played_mobile_games_by_player_count
    const data = window.google.visualization.arrayToDataTable([
      ["Game", "Sales", { role: "annotation" }],
      ["Call of Duty: Mobile", 500.0, "500.0M"],
      ["Among Us", 485.0, "485.0M"],
      ["Mini World", 400.0, "400.0M"],
      ["Dragon Ball Z: Dokkan Battle", 350.0, "350.0M"],
      ["Sonic Dash", 350.0, "350.0M"],
      ["Helix Jump", 334.0, "334.0M"],
      ["Gardenscapes: New Acres", 324.0, "324.0M"],
      ["Homescapes", 312.0, "312.0M"],
      ["Super Mario Run", 300.0, "300.0M"],
      ["Township", 274.0, "274.0M"],
      ["Knives Out", 250.0, "250.0M"],
      ["Angry Birds 2", 230.0, "230.0M"],
      ["Honor of Kings / Arena of Valor", 200.0, "200.0M"],
      ["QQ Speed Mobile / Speed Drifters", 200.0, "200.0M"],
      ["Fishdom", 173.0, "173.0M"],
      ["Rise Up", 162.0, "162.0M"],
      ["PES 2018 Mobile", 150.0, "150.0M"],
      ["War Robots", 150.0, "150.0M"],
      ["World of Tanks", 140.0, "140.0M"],
      ["Mario Kart Tour", 123.9, "123.9M"],
      ["Ice Age Village", 120.0, "120.0M"],
      ["FIFA Mobile (now EA FC )", 113.0, "113.0M"],
      ["Tiao Yi Tiao", 100.0, "100.0M"],
      ["Subway Surfers", 100.0, "100.0M"],
      ["Drag Racing", 100.0, "100.0M"],
      ["Junior Three Kingdoms", 100.0, "100.0M"],
      ["Ludo King", 100.0, "100.0M"],
      ["One Piece Treasure Cruise", 100.0, "100.0M"],
      ["Star Wars: Galaxy of Heroes", 100.0, "100.0M"],
      ["White Cat Project", 100.0, "100.0M"],
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
      document.getElementById("mobile_chart")
    );
    chart.draw(data, options);
  }

  return (
    <>
      <h2 className={styles.title}>
        <a
          href="https://en.wikipedia.org/wiki/List_of_most-played_mobile_games_by_player_count"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "inherit", textDecoration: "underline" }}
        >
          Best-selling Mobile games (Top 30)
        </a>
      </h2>
      <div id="mobile_chart" style={{ width: "100%", height: "800px" }}></div>
    </>
  );
}

export default MobileChart;
