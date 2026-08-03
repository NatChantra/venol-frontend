import React from "react";
import styles from "./MiniBarChart.module.css";

export default function MiniBarChart({ data = [], labels = [], highlight, colorMap = {} }) {
  const max = Math.max(...data.map(d => Math.max(...Object.values(d).filter(v => typeof v === "number"))));

  return (
    <div className={styles.chart}>
      <div className={styles.bars}>
        {data.map((d, i) => (
          <div key={i} className={`${styles.group} ${highlight === labels[i] ? styles.highlighted : ""}`}>
            {Object.entries(d).map(([key, val]) => (
              typeof val === "number" && (
                <div
                  key={key}
                  className={styles.bar}
                  style={{
                    height: `${(val / max) * 100}%`,
                    background: colorMap[key] || "#1a3a8f",
                    opacity: highlight && highlight !== labels[i] ? 0.4 : 1,
                  }}
                  title={`${key}: ${val}`}
                />
              )
            ))}
          </div>
        ))}
      </div>
      <div className={styles.labels}>
        {labels.map((l, i) => (
          <span key={i} className={`${styles.label} ${highlight === l ? styles.boldLabel : ""}`}>{l}</span>
        ))}
      </div>
    </div>
  );
}