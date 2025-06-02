import React from "react";
import styles from "./ChartExplanation.module.css";

/**
 * 通用圖表解釋組件
 * @param {Object} props
 * @param {string} props.title - 圖表標題，通常是 "About this chart"
 * @param {React.ReactNode[]} props.explanations - 解釋段落數組（舊用法，保持向後兼容）
 * @param {React.ReactNode} props.children - 子元素（新用法，推薦）
 */
const ChartExplanation = ({
  title = "About this chart:",
  explanations = [],
  children,
}) => {
  return (
    <div className={styles.chartExplanationWrapper}>
      <div className={styles.chartExplanation}>
        <p>
          <strong>{title}</strong>
        </p>
        {/* 如果有 children，優先使用 children；否則使用舊的 explanations 數組 */}
        {children
          ? children
          : explanations.map((explanation, index) => (
              <p key={index}>{explanation}</p>
            ))}
      </div>
    </div>
  );
};

export default ChartExplanation;
