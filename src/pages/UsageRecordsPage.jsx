import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./UsageRecordsPage.module.css";

// Mock data — matches ER Usage_Records table:
// usage_id, res_id(FK→Resource), emp_id(FK→Employee), qty_used, usage_date
const MOCK_RESOURCES = [
  { res_id: 1, res_name: "Venol Gold 5W-40", category: "Engine Oil", stock_qty: 120 },
  { res_id: 2, res_name: "Venol Gear Oil 90",  category: "Gear Oil",   stock_qty: 80  },
  { res_id: 3, res_name: "Venol Grease EP2",   category: "Grease",     stock_qty: 45  },
  { res_id: 4, res_name: "Venol ATF Dexron",   category: "ATF",        stock_qty: 60  },
];

const MOCK_EMPLOYEES = [
  { emp_id: 101, emp_name: "Admin User" },
  { emp_id: 102, emp_name: "Sokdara Chan" },
];

const INITIAL_USAGE = [
  { usage_id: 1, res_id: 1, emp_id: 101, qty_used: 10, usage_date: "2026-05-27" },
  { usage_id: 2, res_id: 2, emp_id: 102, qty_used: 5,  usage_date: "2026-05-27" },
  { usage_id: 3, res_id: 1, emp_id: 101, qty_used: 8,  usage_date: "2026-05-28" },
  { usage_id: 4, res_id: 3, emp_id: 102, qty_used: 3,  usage_date: "2026-05-28" },
  { usage_id: 5, res_id: 4, emp_id: 101, qty_used: 12, usage_date: "2026-05-29" },
];

export default function UsageRecordsPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState(INITIAL_USAGE);
  const [resources, setResources] = useState(MOCK_RESOURCES);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    res_id: 1,
    emp_id: user?.emp_id || 101,
    qty_used: "",
    usage_date: new Date().toISOString().slice(0, 10),
  });
  const [error, setError] = useState("");

  const getResource = (res_id) => resources.find((r) => r.res_id === Number(res_id));
  const getEmployee = (emp_id) => MOCK_EMPLOYEES.find((e) => e.emp_id === Number(emp_id));

  const handleAdd = () => {
    const qty = Number(form.qty_used);
    if (!qty || qty <= 0) { setError("បញ្ចូលបរិមាណត្រឹមត្រូវ"); return; }
    const res = getResource(form.res_id);
    if (!res) return;
    if (qty > res.stock_qty) { setError(`ស្តុកមិនគ្រប់គ្រាន់ — មានតែ ${res.stock_qty} units`); return; }

    // Deduct stock_qty from Resource (matches ER relationship: Usage_Records uses item → Resource)
    setResources((prev) =>
      prev.map((r) =>
        r.res_id === Number(form.res_id) ? { ...r, stock_qty: r.stock_qty - qty } : r
      )
    );

    const newRecord = {
      usage_id: records.length + 1,
      res_id: Number(form.res_id),
      emp_id: Number(form.emp_id),
      qty_used: qty,
      usage_date: form.usage_date,
    };
    setRecords((prev) => [newRecord, ...prev]);
    setForm({ res_id: 1, emp_id: user?.emp_id || 101, qty_used: "", usage_date: new Date().toISOString().slice(0, 10) });
    setError("");
    setShowForm(false);
  };

  // Summary: total usage per resource
  const summary = resources.map((r) => {
    const totalUsed = records
      .filter((u) => u.res_id === r.res_id)
      .reduce((sum, u) => sum + u.qty_used, 0);
    return { ...r, totalUsed };
  });

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>កំណត់ត្រាប្រើប្រាស់ / Usage Records</h2>
          <p className={styles.sub}>ភ្ជាប់ទៅ ER: Usage_Records — usage_id, res_id(FK), emp_id(FK), qty_used, usage_date</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm((v) => !v)}>
          {showForm ? "✕ បិទ" : "+ បន្ថែមកំណត់ត្រា"}
        </button>
      </div>

      {/* Resource stock summary */}
      <div className={styles.summaryGrid}>
        {summary.map((r) => (
          <div key={r.res_id} className={styles.summaryCard}>
            <p className={styles.resName}>{r.res_name}</p>
            <p className={styles.resCat}>{r.category}</p>
            <div className={styles.stockRow}>
              <span>ស្តុកនៅ: <strong style={{ color: r.stock_qty < 20 ? "#e63946" : "#2cb67d" }}>{r.stock_qty}</strong></span>
              <span className={styles.usedBadge}>ប្រើ: {r.totalUsed}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add form */}
      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>បន្ថែមកំណត់ត្រាប្រើប្រាស់</h3>
          {error && <p className={styles.errorMsg}>⚠️ {error}</p>}
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>ធនធាន (res_id FK → Resource)</label>
              <select value={form.res_id} onChange={(e) => { setForm({ ...form, res_id: e.target.value }); setError(""); }}>
                {resources.map((r) => (
                  <option key={r.res_id} value={r.res_id}>
                    {r.res_name} — ស្តុក: {r.stock_qty}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>បុគ្គលិក (emp_id FK → Employee)</label>
              <select value={form.emp_id} onChange={(e) => setForm({ ...form, emp_id: e.target.value })}>
                {MOCK_EMPLOYEES.map((e) => (
                  <option key={e.emp_id} value={e.emp_id}>{e.emp_name} (emp_id: {e.emp_id})</option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>បរិមាណដែលបានប្រើ (qty_used)</label>
              <input
                type="number" min="1"
                value={form.qty_used}
                onChange={(e) => setForm({ ...form, qty_used: e.target.value })}
                placeholder="0"
              />
            </div>
            <div className={styles.formGroup}>
              <label>កាលបរិច្ឆេទ (usage_date)</label>
              <input
                type="date"
                value={form.usage_date}
                onChange={(e) => setForm({ ...form, usage_date: e.target.value })}
              />
            </div>
          </div>
          <button className={styles.submitBtn} onClick={handleAdd}>💾 រក្សាទុក</button>
        </div>
      )}

      {/* Records table */}
      <div className={styles.tableCard}>
        <h3 className={styles.tableTitle}>កំណត់ត្រាទាំងអស់</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>usage_id</th>
              <th>ធនធាន (res_id)</th>
              <th>បុគ្គលិក (emp_id)</th>
              <th>បរិមាណប្រើ</th>
              <th>កាលបរិច្ឆេទ</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={5} className={styles.empty}>គ្មានទិន្នន័យ</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.usage_id}>
                  <td className={styles.idCell}>{r.usage_id}</td>
                  <td>
                    <span className={styles.resLabel}>{getResource(r.res_id)?.res_name ?? "—"}</span>
                    <span className={styles.fkNote}> res_id:{r.res_id}</span>
                  </td>
                  <td>
                    <span>{getEmployee(r.emp_id)?.emp_name ?? "—"}</span>
                    <span className={styles.fkNote}> emp_id:{r.emp_id}</span>
                  </td>
                  <td><strong>{r.qty_used}</strong></td>
                  <td>{r.usage_date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}