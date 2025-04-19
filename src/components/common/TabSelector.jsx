import React from "react";
import styles from "./TabSelector.module.css";

/**
 * 通用 Tab 選擇器組件
 * @param {Object} props
 * @param {Array} props.options - 選項列表，每個選項需包含 id 和 label
 * @param {string|number} props.activeTab - 當前選中的 tab 的 id
 * @param {Function} props.onChange - 切換 tab 時的回調函數，參數為選中的選項 id
 * @param {string} [props.containerClassName] - 可選的額外容器 className
 * @param {string} [props.buttonClassName] - 可選的額外按鈕 className
 */
const TabSelector = ({
  options,
  activeTab,
  onChange,
  containerClassName,
  buttonClassName,
}) => {
  return (
    <div className={`${styles.tabControls} ${containerClassName || ""}`}>
      <div className={styles.tabSelector}>
        {options.map((option) => (
          <button
            key={option.id}
            className={`${styles.tabButton} ${buttonClassName || ""} ${
              activeTab === option.id ? styles.active : ""
            }`}
            onClick={() => onChange(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabSelector;
