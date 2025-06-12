import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import styles from "./LinkPreview.module.css";

const LinkPreview = ({
  content,
  children,
  title = "Reference",
  onlyShowOnHover = true,
  disabled = false,
  blockDisplay = false,
}) => {
  const elementRef = useRef(null);

  useEffect(() => {
    if (disabled || !content || content === "no data") return;

    const element = d3.select(elementRef.current);
    if (element.empty()) return;

    // 創建popup元素
    const createPopup = () => {
      // 移除現有的popup
      d3.select("body").select("#link-preview-popup").remove();

      return d3
        .select("body")
        .append("div")
        .attr("id", "link-preview-popup")
        .attr("class", styles.popup);
    };

    // 顯示popup
    const showPopup = (content, mouseEvent, isUrl = false) => {
      const popup = d3.select("#link-preview-popup");
      if (popup.empty()) return;

      // 根據內容類型添加對應的CSS類
      popup.attr(
        "class",
        `${styles.popup} ${isUrl ? styles.urlPopup : styles.textPopup}`
      );

      popup
        .html(content)
        .style("left", mouseEvent.pageX + 10 + "px")
        .style("top", mouseEvent.pageY - 10 + "px")
        .style("opacity", "1");
    };

    // 隱藏popup
    const hidePopup = () => {
      d3.select("#link-preview-popup").style("opacity", "0");
    };

    // 初始化popup
    const popup = createPopup();

    // 檢查內容類型並生成預覽
    const generatePreviewContent = (content) => {
      const isUrl = typeof content === "string" && content.startsWith("http");

      let previewContent;
      if (isUrl) {
        // 如果是URL，顯示網頁連結卡片預覽
        let domain;
        try {
          domain = new URL(content).hostname;
        } catch (e) {
          domain = "External Link";
        }

        // 獲取網站 favicon
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=16`;

        previewContent = `
          <div class="${styles.popupTitle}">${title}</div>
          <div class="${styles.urlCard}">
            <div class="${styles.urlCardContent}">
              <div class="${styles.urlHeader}">
                <div class="${styles.iconContainer}">
                  <img 
                    src="${faviconUrl}" 
                    alt="${domain} favicon" 
                    class="${styles.favicon}"
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
                  />
                  <div class="${styles.fallbackIcon}">
                    <span>🔗</span>
                  </div>
                </div>
                <span class="${styles.domainName}">${domain}</span>
              </div>
              <div class="${styles.urlDisplay}">
                ${content}
              </div>
            </div>
          </div>
        `;
      } else {
        // 如果是文字內容
        previewContent = `
          <div class="${styles.popupTitle}">${title}</div>
          <div class="${styles.textContent}">
            ${
              content.length > 200 ? content.substring(0, 200) + "..." : content
            }
          </div>
          <div class="${
            styles.textClickHint
          }">Click to open full ${title.toLowerCase()}</div>
        `;
      }

      return { previewContent, isUrl };
    };

    // 處理點擊事件
    const handleClick = (content) => {
      const isUrl = typeof content === "string" && content.startsWith("http");

      if (isUrl) {
        window.open(content, "_blank");
      } else {
        // 如果是文字內容，在新視窗顯示
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(`
            <html>
              <head><title>${title}</title></head>
              <body style="font-family: Arial, sans-serif; padding: 20px; line-height: 1.6;">
                <h2>${title}</h2>
                <p style="white-space: pre-wrap;">${content}</p>
              </body>
            </html>
          `);
          newWindow.document.close();
        }
      }
    };

    // 添加事件監聽器
    if (onlyShowOnHover) {
      // 只在hover時顯示
      element
        .classed(styles.wrapper, true)
        .on("mouseenter", function (event) {
          const { previewContent, isUrl } = generatePreviewContent(content);
          showPopup(previewContent, event, isUrl);
        })
        .on("mouseleave", function () {
          hidePopup();
        })
        .on("click", function () {
          handleClick(content);
        });
    } else {
      // 總是可點擊
      element.classed(styles.wrapper, true).on("click", function () {
        handleClick(content);
      });
    }

    // 清理函數
    return () => {
      d3.select("body").select("#link-preview-popup").remove();
    };
  }, [content, title, onlyShowOnHover, disabled]);

  return (
    <span
      ref={elementRef}
      className={`${styles.wrapper} ${
        blockDisplay ? styles.blockWrapper : styles.inlineWrapper
      }`}
    >
      {children}
    </span>
  );
};

export default LinkPreview;
