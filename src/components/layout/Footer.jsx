import React from "react";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      © {new Date().getFullYear()} Venol Oil Cambodia. All rights reserved.
    </footer>
  );
}