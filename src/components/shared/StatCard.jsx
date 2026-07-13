import React from "react";
import styles from "./StatCard.module.css";

export default function StatCard({ icon, label, value, sub, color = "blue", trend }) {
  return (
    <div className={`${styles.card} ${styles[color]}`}>
      {trend !== undefined && (
        <span className={`${styles.trend} ${trend >= 0 ? styles.up : styles.down}`}>
          {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
        </span>
      )}
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.value}>{value}</div>
      <div className={styles.label}>{label}</div>
      {sub && <div className={styles.sub}>{sub}</div>}
    </div>
  );
}