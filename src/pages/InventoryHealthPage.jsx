import React, { useState, useEffect } from "react";
import StatCard from "../components/shared/StatCard";
import MiniBarChart from "../components/shared/MiniBarChart";
import styles from "./InventoryHealthPage.module.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const STATUS_COLOR = { Critical: "red", "Low Stock": "orange", Approaching: "blue" };

const EMPTY = {
  total_stock_value: 0,
  low_stock_count: 0,
  avg_attendance: 0,
  late_count: 0,
  attendance_trend: [],
  exceptions: [],
  stock_categories: [],
  reorder_list: [],
};

const BASE_URL = "https://my-system-vp4o.onrender.com";

export default function InventoryHealthPage() {
  const [data,    setData]    = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [period,  setPeriod]  = useState("week");

  useEffect(() => {
    setLoading(true);
    setError("");

    // ដាស់ Backend មុន (Render Free Plan Sleep)
    fetch(`${BASE_URL}/api/ping`, {
      headers: { Accept: "application/json" },
    })
      .catch(() => {}) // មិនបាច់ handle ping error
      .finally(() => {
        // fetch ទិន្នន័យពិតប្រាកដ
        fetch(`${BASE_URL}/api/dashboard?period=${period}`, {
          headers: { Accept: "application/json" },
        })
          .then(r => {
            if (!r.ok) throw new Error(`Server error: ${r.status}`);
            return r.json();
          })
          .then(json => setData({ ...EMPTY, ...json }))
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));
      });
  }, [period]);

  if (loading) return (
    <div style={{
      padding: 40,
      textAlign: "center",
      color: "#9ca3af",
      fontSize: 15,
    }}>
      ⏳ កំពុងភ្ជាប់ Server... សូមរង់ចាំមួយភ្លែត
    </div>
  );

  if (error) return (
    <div style={{
      padding: 40,
      textAlign: "center",
      color: "#e63946",
      background: "#fee2e2",
      borderRadius: 12,
      margin: 24,
    }}>
      ⚠️ {error} — សូមពិនិត្យ Laravel log
    </div>
  );

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>ផ្ទាំងគ្រប់គ្រង</h2>
          <p className={styles.sub}>
            Comprehensive metrics across Attendance and Inventory departments.
          </p>
        </div>
        <div className={styles.headerActions}>
          <select
            className={styles.filterSelect}
            value={period}
            onChange={e => setPeriod(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="last_week">Last Week</option>
            <option value="month">This Month</option>
          </select>
          <button className={styles.exportBtn}>↓ Export PDF</button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className={styles.statsRow}>
        <StatCard
          label="Total Stock Value"
          value={`$${Number(data.total_stock_value).toLocaleString()}`}
          color="blue"
        />
        <StatCard
          label="Low Stock Alerts"
          value={`${data.low_stock_count} Items`}
          color="orange"
        />
        <StatCard
          label="Average Attendance %"
          value={`${data.avg_attendance}%`}
          color="green"
        />
        <StatCard
          label="Late Arrivals This Week"
          value={data.late_count}
          color="red"
        />
      </div>

      {/* Mid Row */}
      <div className={styles.midRow}>

        {/* Attendance Trends */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Attendance Trends</div>
              <div className={styles.cardSub}>Monthly rolling average vs target</div>
            </div>
          </div>
          <div className={styles.trendLine}>
            <span>Target 87%</span>
          </div>
          <div className={styles.trendChart}>
            <MiniBarChart
              data={data.attendance_trend}
              labels={DAYS}
              colorMap={{ actual: "#1a3a8f" }}
            />
          </div>
        </div>

        {/* Today's Exceptions */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardTitle}>Today's Exceptions</div>
          </div>
          <div className={styles.exceptList}>
            {data.exceptions.length === 0 ? (
              <div style={{ padding: 20, color: "#9ca3af", textAlign: "center" }}>
                គ្មានករណីលើកលែង
              </div>
            ) : (
              data.exceptions.map(e => (
                <div key={e.emp_id} className={styles.exceptItem}>
                  <div className={styles.exceptAvatar}>{e.emp_name?.[0]}</div>
                  <div>
                    <div className={styles.exceptName}>{e.emp_name}</div>
                    <div className={styles.exceptDept}>{e.department}</div>
                  </div>
                  <span style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 8px",
                    borderRadius: 99,
                    background: e.status === "Absent" ? "#fee2e2" : "#ffedd5",
                    color: e.status === "Absent" ? "#991b1b" : "#9a3412",
                  }}>
                    {e.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Bottom Row */}
      <div className={styles.bottomRow}>

        {/* Stock by Category */}
        <div className={styles.card}>
          <div className={styles.cardTitle} style={{ marginBottom: 14 }}>
            Stock by Category
          </div>
          <div className={styles.catList}>
            {data.stock_categories.length === 0 ? (
              <div style={{ padding: 20, color: "#9ca3af", textAlign: "center" }}>
                គ្មានទិន្នន័យ
              </div>
            ) : (
              data.stock_categories.map(c => (
                <div key={c.name} className={styles.catItem}>
                  <div className={styles.catLabel}>
                    <span>{c.name}</span>
                    <span className={styles.catPct}>{c.pct}%</span>
                  </div>
                  <div className={styles.catBar}>
                    <div
                      style={{ width: `${c.pct}%`, background: c.color }}
                      className={styles.catFill}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Critical Reorder List */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <div className={styles.cardTitle}>Critical Reorder List</div>
              <div className={styles.cardSub}>Items below minimum stock threshold</div>
            </div>
            <button className={styles.draftBtn}>🖊 Draft PO</button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ color: "#9ca3af", textAlign: "left" }}>
                <th style={{ padding: "6px 8px" }}>ITEM NAME / SKU</th>
                <th style={{ padding: "6px 8px" }}>CURRENT</th>
                <th style={{ padding: "6px 8px" }}>REORDER</th>
                <th style={{ padding: "6px 8px" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {data.reorder_list.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ padding: 20, color: "#9ca3af", textAlign: "center" }}>
                    គ្មានទំនិញដែលត្រូវការកម្មង់
                  </td>
                </tr>
              ) : (
                data.reorder_list.map(r => (
                  <tr key={r.sku} style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: 8 }}>
                      <div className={styles.itemName}>{r.name}</div>
                      <div className={styles.itemSku}>{r.sku}</div>
                    </td>
                    <td style={{ padding: 8, fontWeight: 700 }}>{r.current}</td>
                    <td style={{ padding: 8, color: "#6b7280" }}>{r.reorder}</td>
                    <td style={{ padding: 8 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 99,
                        background:
                          STATUS_COLOR[r.status] === "red"    ? "#fee2e2" :
                          STATUS_COLOR[r.status] === "orange" ? "#ffedd5" : "#dbeafe",
                        color:
                          STATUS_COLOR[r.status] === "red"    ? "#991b1b" :
                          STATUS_COLOR[r.status] === "orange" ? "#9a3412" : "#1e40af",
                      }}>
                        ⚠ {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
