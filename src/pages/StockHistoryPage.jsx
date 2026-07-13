import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./StockListPage.module.css";

const API = "http://localhost:8000/api";

const TYPE_STYLE = {
  "in":  { background: "#d1fae5", color: "#065f46", label: "📦 Stock In"  },
  "out": { background: "#ffedd5", color: "#9a3412", label: "📤 Stock Out" },
};

export default function StockHistoryPage() {
  const navigate = useNavigate();
  const [history,  setHistory]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");

  const loadHistory = async () => {
    try {
      let url = `${API}/stock/history?`;
      if (dateFrom) url += `date_from=${dateFrom}&`;
      if (dateTo)   url += `date_to=${dateTo}&`;
      if (typeFilter !== "all") url += `type=${typeFilter}&`;

      const res  = await fetch(url, { headers: { Accept: "application/json" } });
      const data = await res.json();
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistory(); }, [typeFilter, dateFrom, dateTo]);

  const filtered = history.filter(h =>
    (h.pro_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const totalIn  = history.filter(h => h.type === "in").reduce((s, h) => s + h.qty, 0);
  const totalOut = history.filter(h => h.type === "out").reduce((s, h) => s + h.qty, 0);

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>ប្រវត្តិស្តុក</h2>
          <p className={styles.sub}>Stock In/Out Transaction History</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate("/stock-list")}>
          ← ត្រឡប់
        </button>
      </div>

      {/* Summary */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.sumNum} style={{ color: "#2cb67d" }}>{totalIn}</div>
          <div className={styles.sumLabel}>Total In</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.sumNum} style={{ color: "#f4a261" }}>{totalOut}</div>
          <div className={styles.sumLabel}>Total Out</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.sumNum} style={{ color: "#1a3a8f" }}>{history.length}</div>
          <div className={styles.sumLabel}>Total Transactions</div>
        </div>
      </div>

      {/* Filters */}
      <div className={styles.filters} style={{ flexWrap: "wrap", gap: 10 }}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.search}
            placeholder="ស្វែងរកទំនិញ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.filterSel ?? styles.search}
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
        >
          <option value="all">ប្រភេទទាំងអស់</option>
          <option value="in">Stock In</option>
          <option value="out">Stock Out</option>
        </select>
        <input
          type="date" value={dateFrom}
          onChange={e => setDateFrom(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
        />
        <input
          type="date" value={dateTo}
          onChange={e => setDateTo(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
        />
        <button
          onClick={() => { setDateFrom(""); setDateTo(""); setTypeFilter("all"); setSearch(""); }}
          style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13, cursor: "pointer", background: "#f3f4f6" }}
        >
          🔄 Reset
        </button>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textAlign: "left" }}>
              <th style={{ padding: "10px 12px" }}>#</th>
              <th style={{ padding: "10px 12px" }}>ទំនិញ</th>
              <th style={{ padding: "10px 12px" }}>ប្រភេទ</th>
              <th style={{ padding: "10px 12px" }}>បរិមាណ</th>
              <th style={{ padding: "10px 12px" }}>តម្លៃ/unit</th>
              <th style={{ padding: "10px 12px" }}>អ្នកផ្គត់ផ្គង់</th>
              <th style={{ padding: "10px 12px" }}>កំណត់ចំណាំ</th>
              <th style={{ padding: "10px 12px" }}>ថ្ងៃ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>គ្មានទិន្នន័យ</td></tr>
            ) : filtered.map((h, i) => (
              <tr key={h.txn_id ?? i} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px", color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{h.pro_name}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, ...(TYPE_STYLE[h.type] ?? {}) }}>
                    {TYPE_STYLE[h.type]?.label ?? h.type}
                  </span>
                </td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{h.qty} <span style={{ color: "#9ca3af", fontSize: 11 }}>{h.unit}</span></td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>${h.unit_price ?? "0"}</td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>{h.sup_name ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>{h.note ?? "—"}</td>
                <td style={{ padding: "10px 12px", color: "#6b7280", fontSize: 12 }}>{h.txn_date?.slice(0, 16) ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
