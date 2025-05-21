import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./ImpactVisualization.module.css";

const ImpactVisualization = ({ game }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!game || !game.positiveImpacts || !game.negativeImpacts) return;

    // 清除之前的視覺化
    d3.select(svgRef.current).selectAll("*").remove();

    // 準備資料
    const prepareData = () => {
      // 中心節點（遊戲）
      const centerNode = {
        id: "center",
        name: game.title,
        type: "center",
        radius: 70, // 中心圓半徑，由60增加到70
      };

      // 正面影響節點
      const positiveNodes = game.positiveImpacts.map((impact, i) => ({
        id: `positive-${i}`,
        name: impact,
        type: "positive",
        radius: 50, // 正面影響圓半徑，由40增加到50
        index: i,
        totalInGroup: game.positiveImpacts.length,
      }));

      // 負面影響節點
      const negativeNodes = game.negativeImpacts.map((impact, i) => ({
        id: `negative-${i}`,
        name: impact,
        type: "negative",
        radius: 50, // 負面影響圓半徑，由40增加到50
        index: i,
        totalInGroup: game.negativeImpacts.length,
      }));

      // 所有節點
      const nodes = [centerNode, ...positiveNodes, ...negativeNodes];

      // 連接線（與中心點連接）
      const links = [...positiveNodes, ...negativeNodes].map((node) => ({
        source: node.id,
        target: "center",
        type: node.type,
      }));

      return { nodes, links };
    };

    const { nodes, links } = prepareData();

    // SVG 相關設定
    const width = 450;
    const height = 450;
    const svg = d3
      .select(svgRef.current)
      .attr("viewBox", [-width / 2, -height / 2, width, height])
      .attr("width", "100%")
      .attr("height", "100%");

    // 計算所有節點固定位置
    nodes.forEach((node) => {
      if (node.type === "center") {
        // 中心點固定在中央
        node.x = 0;
        node.y = 0;
      } else {
        // 計算固定位置
        let angle;
        if (node.type === "positive") {
          // 正面影響在上半部 (0-180度)
          angle = node.index * (180 / node.totalInGroup) * (Math.PI / 180);
        } else {
          // 負面影響在下半部 (180-360度)
          angle =
            (180 + node.index * (180 / node.totalInGroup)) * (Math.PI / 180);
        }

        const distance = 170; // 到中心的距離，由150增加到170
        node.x = distance * Math.cos(angle);
        node.y = distance * Math.sin(angle);
      }
    });

    // 繪製連結線
    const links_g = svg
      .append("g")
      .attr("class", styles.links)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr(
        "class",
        (d) => `${styles.connector} ${styles[`${d.type}Connector`]}`
      )
      .attr("x1", (d) => {
        const source = nodes.find((node) => node.id === d.source);
        return source.x;
      })
      .attr("y1", (d) => {
        const source = nodes.find((node) => node.id === d.source);
        return source.y;
      })
      .attr("x2", (d) => {
        const target = nodes.find((node) => node.id === d.target);
        return target.x;
      })
      .attr("y2", (d) => {
        const target = nodes.find((node) => node.id === d.target);
        return target.y;
      });

    // 節點群組
    const nodes_g = svg
      .append("g")
      .attr("class", styles.nodes)
      .selectAll("g")
      .data(nodes)
      .join("g")
      .attr("class", (d) => `${styles.node} ${styles[`${d.type}Node`]}`)
      .attr("transform", (d) => `translate(${d.x}, ${d.y})`);

    // 節點圓形
    nodes_g
      .append("circle")
      .attr("r", (d) => d.radius)
      .attr("class", (d) => styles[`${d.type}Circle`])
      .on("mouseover", function (event, d) {
        // 只保留放大動畫效果
        d3.select(this)
          .transition()
          .duration(300)
          .attr("r", d.radius * 1.1);
      })
      .on("mouseout", function (event, d) {
        // 恢復原始大小
        d3.select(this).transition().duration(300).attr("r", d.radius);
      });

    // 節點文字
    nodes_g
      .append("text")
      .text((d) => d.name)
      .attr("class", styles.nodeText)
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "middle")
      .attr("font-size", (d) => (d.type === "center" ? "15px" : "13px"))
      .attr("font-weight", (d) => (d.type === "center" ? "bold" : "normal"))
      .each(function (d) {
        // 文字自動換行
        const text = d3.select(this);

        // 如果文字太長，切割成單詞或單字
        let words;
        if (d.name.length > 20) {
          // 先檢查是否有空格，如果有就按單詞分割
          if (d.name.includes(" ")) {
            words = d.name.split(/\s+/);
          } else {
            // 如果沒有空格，按固定長度分割
            const chunkSize = d.type === "center" ? 12 : 9;
            words = [];
            for (let i = 0; i < d.name.length; i += chunkSize) {
              words.push(
                d.name.substring(i, Math.min(i + chunkSize, d.name.length))
              );
            }
          }
        } else {
          // 較短文字按空格分詞
          words = d.name.split(/\s+/);
        }

        // 清除現有內容
        text.text(null);

        // 根據節點類型調整最大行數和行高
        const lineHeight = d.type === "center" ? 16 : 13;
        // 允許更多行顯示文字
        const maxLines = d.type === "center" ? 5 : 4;

        // 計算所需的行數（不超過最大行數）
        const numLines = Math.min(words.length, maxLines);

        // 計算文本整體應該垂直偏移多少，以確保整體居中
        const totalHeight = lineHeight * (numLines - 1);
        const startY = -totalHeight / 2;

        // 創建 tspan 元素顯示每個詞/段落
        words.forEach((word, i) => {
          // 如果超過最大行數，不繼續添加
          if (i >= maxLines) return;

          const tspan = text
            .append("tspan")
            .attr("x", 0)
            .attr("y", startY)
            .attr("dy", i * lineHeight);

          // 處理最後一行
          if (i === maxLines - 1 && i < words.length - 1) {
            // 如果是最後顯示的一行，但還有更多未顯示的文字，添加省略號
            tspan.text(word + "...");
          } else {
            tspan.text(word);
          }
        });
      });
  }, [game]);

  return (
    <div ref={containerRef}>
      <div className={styles.impactVisualizationContainer}>
        <svg ref={svgRef} className={styles.impactVisualizationSvg}></svg>
      </div>

      <div className={styles.impactLegend}>
        <div className={`${styles.legendItem} ${styles.positive}`}>
          <span className={styles.legendColor}></span>
          <span className={styles.legendText}>Positive Impacts</span>
        </div>
        <div className={`${styles.legendItem} ${styles.negative}`}>
          <span className={styles.legendColor}></span>
          <span className={styles.legendText}>Negative Impacts</span>
        </div>
      </div>
    </div>
  );
};

export default ImpactVisualization;
