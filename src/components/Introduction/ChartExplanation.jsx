import React from "react";
import styles from "./ChartExplanation.module.css";

/**
 * 通用圖表解釋組件
 * @param {Object} props
 * @param {string} props.title - 圖表標題，通常是 "About this chart"
 * @param {React.ReactNode[]} props.explanations - 解釋段落數組
 */
const ChartExplanation = ({
  title = "About this chart:",
  explanations = [],
}) => {
  return (
    <div className={styles.chartExplanationWrapper}>
      <div className={styles.chartExplanation}>
        <p>
          <strong>{title}</strong>
        </p>
        {explanations.map((explanation, index) => (
          <p key={index}>{explanation}</p>
        ))}
      </div>
    </div>
  );
};

export default ChartExplanation;
