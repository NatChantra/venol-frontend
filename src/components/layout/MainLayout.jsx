import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import styles from "./MainLayout.module.css";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false); // លាក់ដោយ default

  return (
    <div className={styles.layout}>
      {/* Overlay — ចុចក្រៅ Sidebar ដើម្បីបិទ */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className={styles.content}>
        <TopBar
          pageTitle=""
          onMenuClick={() => setSidebarOpen(v => !v)}
        />
        <main className={styles.body}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}