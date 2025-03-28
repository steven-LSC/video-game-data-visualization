import styles from "./ChartDisplay.module.css";

function ChartDisplay({ children }) {
  return (
    <main className={styles.container}>
      <div className={styles.chartWrapper}>{children}</div>
    </main>
  );
}

export default ChartDisplay;
