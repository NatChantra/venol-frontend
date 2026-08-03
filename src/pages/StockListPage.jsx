import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resourceApi, categoryApi } from "../services/api";
import styles from "./StockListPage.module.css";

const API = window.location.hostname === "localhost"
  ? "http://localhost:8000/api"
  : `${window.location.origin}/api`;

const STATUS_STYLE = {
  "Active":    { background: "#d1fae5", color: "#065f46" },
  "Low Stock": { background: "#ffedd5", color: "#9a3412" },
  "Depleted":  { background: "#fee2e2", color: "#991b1b" },
};

function getStatus(stock_qty, low_stock_alert = 20) {
  if (stock_qty <= 0)               return "Depleted";
  if (stock_qty <= low_stock_alert) return "Low Stock";
  return "Active";
}

export default function StockListPage() {
  const navigate = useNavigate();
  const [resources,   setResources]   = useState([]);
  const [categories,  setCategories]  = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState("");
  const [selectedCat, setSelectedCat] = useState(null);
  const [editId,      setEditId]      = useState(null);
  const [editForm,    setEditForm]    = useState({});
  const [adjustId,    setAdjustId]    = useState(null);
  const [adjustQty,   setAdjustQty]   = useState("");
  const [adjustType,  setAdjustType]  = useState("in");
  const [adjustNote,  setAdjustNote]  = useState("");

  useEffect(() => {
    Promise.all([resourceApi.getAll(), categoryApi.getAll()])
      .then(([res, cats]) => { setResources(res); setCategories(cats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const active   = resources.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Active").length;
  const lowStock = resources.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Low Stock").length;
  const depleted = resources.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Depleted").length;

  const handleDelete = async (id) => {
    if (!window.confirm("លុបទំនិញនេះ?")) return;
    await resourceApi.delete(id);
    setResources(prev => prev.filter(r => r.res_id !== id));
  };

  const startEdit = (r) => {
    setEditId(r.res_id);
    setEditForm({ res_name: r.res_name, category: r.category, stock_qty: r.stock_qty, price: r.price ?? "", unit: r.unit ?? "pcs", low_stock_alert: r.low_stock_alert ?? 20 });
    setAdjustId(null);
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await resourceApi.update(editId, {
        res_name:        editForm.res_name,
        category:        editForm.category,
        stock_qty:       Number(editForm.stock_qty),
        price:           Number(editForm.price) || 0,
        unit:            editForm.unit,
        low_stock_alert: Number(editForm.low_stock_alert) || 20,
      });
      setResources(prev => prev.map(r => r.res_id === editId ? { ...r, ...updated } : r));
      setEditId(null);
    } catch (err) { alert(err.message); }
  };

  const startAdjust = (r, type) => {
    setAdjustId(r.res_id);
    setAdjustType(type);
    setAdjustQty("");
    setAdjustNote("");
    setEditId(null);
  };

  const handleAdjust = async () => {
    const qty = Number(adjustQty);
    if (!qty || qty <= 0) { alert("សូមបញ្ចូលបរិមាណ"); return; }
    const resource = resources.find(r => r.res_id === adjustId);
    try {
      const endpoint = adjustType === "in" ? `${API}/stock/in` : `${API}/stock/out`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ pro_id: adjustId, qty, note: adjustNote || (adjustType === "in" ? "Stock In" : "Stock Out") }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message ?? "មានបញ្ហា"); return; }
      const newQty = adjustType === "in" ? resource.stock_qty + qty : resource.stock_qty - qty;
      setResources(prev => prev.map(r => r.res_id === adjustId ? { ...r, stock_qty: newQty } : r));
      if (data.warning) alert(data.warning);
      setAdjustId(null);
    } catch (err) { alert("ភ្ជាប់ server មិនបាន"); }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;

  const filteredResources = resources.filter(r =>
    r.res_name.toLowerCase().includes(search.toLowerCase())
  );
  const catItems = selectedCat ? filteredResources.filter(r => r.category === selectedCat) : [];

  const ItemTable = ({ items }) => (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
      <thead style={{ background: "#f9fafb" }}>
        <tr style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textAlign: "left" }}>
          <th style={{ padding: "10px 12px" }}>#</th>
          <th style={{ padding: "10px 12px" }}>ឈ្មោះទំនិញ</th>
          <th style={{ padding: "10px 12px" }}>ស្តុក</th>
          <th style={{ padding: "10px 12px" }}>តម្លៃ</th>
          <th style={{ padding: "10px 12px" }}>ស្ថានភាព</th>
          <th style={{ padding: "10px 12px" }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>គ្មានទំនិញ</td></tr>
        ) : items.map((r, i) => {
          const status      = getStatus(r.stock_qty, r.low_stock_alert);
          const isEditing   = editId   === r.res_id;
          const isAdjusting = adjustId === r.res_id;
          return (
            <React.Fragment key={r.res_id}>
              <tr style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 12px", color: "#9ca3af", fontSize: 12 }}>{i + 1}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.res_name}</td>
                <td style={{ padding: "10px 12px", fontWeight: 600 }}>{r.stock_qty} <span style={{ color: "#9ca3af", fontSize: 11 }}>{r.unit ?? ""}</span></td>
                <td style={{ padding: "10px 12px", color: "#6b7280" }}>${r.price ?? "0"}</td>
                <td style={{ padding: "10px 12px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 99, ...STATUS_STYLE[status] }}>{status}</span>
                </td>
                <td style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button onClick={() => startAdjust(r, "in")}  style={{ padding: "4px 8px", background: "#d1fae5", color: "#065f46", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>+IN</button>
                    <button onClick={() => startAdjust(r, "out")} style={{ padding: "4px 8px", background: "#ffedd5", color: "#9a3412", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>-OUT</button>
                    <button onClick={() => startEdit(r)}           style={{ padding: "4px 8px", background: "#e0e7ff", color: "#3730a3", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✏️</button>
                    <button onClick={() => navigate(`/stock-history?res_id=${r.res_id}`)} style={{ padding: "4px 8px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>📋</button>
                    <button onClick={() => handleDelete(r.res_id)} style={{ padding: "4px 8px", background: "#fee2e2", color: "#e63946", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>🗑️</button>
                  </div>
                </td>
              </tr>

              {isAdjusting && (
                <tr style={{ background: adjustType === "in" ? "#f0fdf4" : "#fff7ed" }}>
                  <td colSpan={6} style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 700, color: adjustType === "in" ? "#065f46" : "#9a3412" }}>
                        {adjustType === "in" ? " Stock In" : " Stock Out"} — {r.res_name}
                      </span>
                      <input type="number" min="1" placeholder="បរិមាណ" value={adjustQty} onChange={e => setAdjustQty(e.target.value)}
                        style={{ width: 100, padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} autoFocus />
                      <input type="text" placeholder="កំណត់ចំណាំ" value={adjustNote} onChange={e => setAdjustNote(e.target.value)}
                        style={{ width: 180, padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
                      <button onClick={handleAdjust} style={{ padding: "6px 16px", background: adjustType === "in" ? "#2cb67d" : "#f4a261", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>
                        {adjustType === "in" ? "បញ្ចូល" : "យកចេញ"}
                      </button>
                      <button onClick={() => setAdjustId(null)} style={{ padding: "6px 12px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 6, cursor: "pointer" }}>បោះបង់</button>
                    </div>
                  </td>
                </tr>
              )}

              {isEditing && (
                <tr style={{ background: "#eff6ff" }}>
                  <td colSpan={6} style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                      <div>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>ឈ្មោះ</label>
                        <input value={editForm.res_name} onChange={e => setEditForm(f => ({...f, res_name: e.target.value}))}
                          style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 160 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>ស្តុក</label>
                        <input type="number" value={editForm.stock_qty} onChange={e => setEditForm(f => ({...f, stock_qty: e.target.value}))}
                          style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 80 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>តម្លៃ ($)</label>
                        <input type="number" value={editForm.price} onChange={e => setEditForm(f => ({...f, price: e.target.value}))}
                          style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 80 }} />
                      </div>
                      <div>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>Low Alert</label>
                        <input type="number" value={editForm.low_stock_alert} onChange={e => setEditForm(f => ({...f, low_stock_alert: e.target.value}))}
                          style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 80 }} />
                      </div>
                      <button onClick={handleSaveEdit} style={{ padding: "6px 16px", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>💾 រក្សាទុក</button>
                      <button onClick={() => setEditId(null)} style={{ padding: "6px 12px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 6, cursor: "pointer" }}>បោះបង់</button>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>ឃ្លាំងទំនិញ</h2>
          <p className={styles.sub}>Manage, track, and provision enterprise stock items.</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className={styles.addBtn} style={{ background: "#6b7280" }} onClick={() => navigate("/stock-history")}>📋 History</button>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input className={styles.search} placeholder="Search resources..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}><div className={styles.sumNum} style={{ color: "#2cb67d" }}>{active}</div><div className={styles.sumLabel}>Active</div></div>
        <div className={styles.summaryCard}><div className={styles.sumNum} style={{ color: "#f4a261" }}>{lowStock}</div><div className={styles.sumLabel}>Low Stock</div></div>
        <div className={styles.summaryCard}><div className={styles.sumNum} style={{ color: "#e63946" }}>{depleted}</div><div className={styles.sumLabel}>Depleted</div></div>
      </div>

      {!selectedCat ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
          {categories.map(cat => {
            const catResources = filteredResources.filter(r => r.category === cat.cat_name);
            const catActive    = catResources.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Active").length;
            const catLow       = catResources.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Low Stock").length;
            const catDepleted  = catResources.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Depleted").length;
            return (
              <div key={cat.cat_id} onClick={() => setSelectedCat(cat.cat_name)}
                style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", border: "2px solid transparent", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1a3a8f"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3a8f", marginBottom: 8 }}> {cat.cat_name}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>{catResources.length} items</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {catActive    > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>{catActive} Active</span>}
                  {catLow       > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#ffedd5", color: "#9a3412" }}>{catLow} Low</span>}
                  {catDepleted  > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: "#991b1b" }}>{catDepleted} Depleted</span>}
                  {catResources.length === 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>ទទេ</span>}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={() => { setSelectedCat(null); setEditId(null); setAdjustId(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#1a3a8f", fontWeight: 700, fontSize: 14 }}>
              ← ត្រឡប់
            </button>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a3a8f" }}> {selectedCat}</h3>
            <button onClick={() => navigate(`/stock-add?category=${encodeURIComponent(selectedCat)}`)}
              style={{ marginLeft: "auto", padding: "8px 16px", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              + Add Item
            </button>
          </div>
          <div className={styles.tableCard}>
            <ItemTable items={catItems} />
          </div>
        </div>
      )}
    </div>
  );
}