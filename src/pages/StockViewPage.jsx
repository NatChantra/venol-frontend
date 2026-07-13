import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resourceApi, categoryApi } from "../services/api";
import styles from "./StockViewPage.module.css";

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

export default function StockViewPage() {
  const navigate = useNavigate();
  const [resources, setResources]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedCat, setSelectedCat]   = useState(null);

  // Edit state
  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});

  // Stock In/Out state
  const [adjustId,   setAdjustId]   = useState(null);
  const [adjustType, setAdjustType] = useState("in");
  const [adjustQty,  setAdjustQty]  = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  // Add category state
  const [addingCat, setAddingCat]   = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat]   = useState(false);

  useEffect(() => {
    Promise.all([resourceApi.getAll(), categoryApi.getAll()])
      .then(([res, cats]) => { setResources(res); setCategories(cats); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("លុបធនធាននេះ?")) return;
    await resourceApi.delete(id);
    setResources(prev => prev.filter(r => r.res_id !== id));
  };

  const startEdit = (r) => {
    setEditId(r.res_id);
    setEditForm({
      res_name: r.res_name,
      stock_qty: r.stock_qty,
      price: r.price ?? "",
      unit: r.unit ?? "pcs",
      low_stock_alert: r.low_stock_alert ?? 20,
    });
    setAdjustId(null);
  };

  const handleSaveEdit = async () => {
    try {
      const updated = await resourceApi.update(editId, {
        res_name:        editForm.res_name,
        stock_qty:       Number(editForm.stock_qty),
        price:           Number(editForm.price) || 0,
        unit:            editForm.unit,
        low_stock_alert: Number(editForm.low_stock_alert) || 20,
      });
      setResources(prev => prev.map(r => r.res_id === editId ? { ...r, ...updated } : r));
      setEditId(null);
    } catch (err) {
      alert(err.message);
    }
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
        body: JSON.stringify({
          pro_id: adjustId,
          qty,
          note: adjustNote || (adjustType === "in" ? "Stock In" : "Stock Out"),
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message ?? "មានបញ្ហា"); return; }
      const newQty = adjustType === "in" ? resource.stock_qty + qty : resource.stock_qty - qty;
      setResources(prev => prev.map(r => r.res_id === adjustId ? { ...r, stock_qty: newQty } : r));
      if (data.warning) alert(data.warning);
      setAdjustId(null);
    } catch (err) {
      alert("ភ្ជាប់ server មិនបាន");
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) { alert("សូមបញ្ចូលឈ្មោះ Category"); return; }
    setSavingCat(true);
    try {
      const created = await categoryApi.create({ cat_name: newCatName.trim() });
      setCategories(prev => [...prev, created]);
      setNewCatName("");
      setAddingCat(false);
    } catch (err) {
      alert(err.message || "មិនអាចបន្ថែម Category បានទេ");
    } finally {
      setSavingCat(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>
  );

  const filteredResources = resources.filter(r => {
    const status = getStatus(r.stock_qty, r.low_stock_alert);
    const matchSearch = r.res_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Statuses" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const catItems = selectedCat ? filteredResources.filter(r => r.category === selectedCat) : [];

  const ProductList = ({ items }) => (
    items.length === 0 ? (
      <div style={{ textAlign: "center", padding: 48, color: "#9ca3af" }}>គ្មានទំនិញ</div>
    ) : (
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {items.map((r, i) => {
          const status      = getStatus(r.stock_qty, r.low_stock_alert);
          const isEditing   = editId   === r.res_id;
          const isAdjusting = adjustId === r.res_id;
          return (
            <div key={r.res_id} style={{ borderTop: i === 0 ? "none" : "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px" }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#1a3a8f", color: "#fff", fontSize: 10, fontWeight: 700,
                }}>
                  VNL
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1f2937", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {r.res_name}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>▤ {r.category ?? "—"}</div>
                </div>

                <div style={{ textAlign: "right", minWidth: 90 }}>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>STOCK QTY</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{r.stock_qty} {r.unit ?? ""}</div>
                </div>

                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 99,
                  whiteSpace: "nowrap", ...STATUS_STYLE[status],
                }}>
                  {status}
                </span>

                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => startAdjust(r, "in")}
                    style={{ padding: "6px 10px", background: "#d1fae5", color: "#065f46", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                    +IN
                  </button>
                  <button onClick={() => startAdjust(r, "out")}
                    style={{ padding: "6px 10px", background: "#ffedd5", color: "#9a3412", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>
                    -OUT
                  </button>
                  <button onClick={() => startEdit(r)}
                    style={{ padding: "6px 10px", background: "#e0e7ff", color: "#3730a3", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(r.res_id)}
                    style={{ padding: "6px 10px", background: "#fee2e2", color: "#e63946", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>
                    🗑️
                  </button>
                </div>
              </div>

              {isAdjusting && (
                <div style={{ background: adjustType === "in" ? "#f0fdf4" : "#fff7ed", padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, color: adjustType === "in" ? "#065f46" : "#9a3412" }}>
                      {adjustType === "in" ? "Stock In" : "Stock Out"} — {r.res_name}
                    </span>
                    <input type="number" min="1" placeholder="បរិមាណ" value={adjustQty}
                      onChange={e => setAdjustQty(e.target.value)}
                      style={{ width: 100, padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} autoFocus />
                    <input type="text" placeholder="កំណត់ចំណាំ" value={adjustNote}
                      onChange={e => setAdjustNote(e.target.value)}
                      style={{ width: 180, padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }} />
                    <button onClick={handleAdjust}
                      style={{ padding: "6px 16px", background: adjustType === "in" ? "#2cb67d" : "#f4a261", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>
                      {adjustType === "in" ? "បញ្ចូល" : "យកចេញ"}
                    </button>
                    <button onClick={() => setAdjustId(null)}
                      style={{ padding: "6px 12px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 6, cursor: "pointer" }}>
                      បោះបង់
                    </button>
                  </div>
                </div>
              )}

              {isEditing && (
                <div style={{ background: "#eff6ff", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                    <div>
                      <label style={{ fontSize: 11, color: "#6b7280" }}>ឈ្មោះ</label>
                      <input value={editForm.res_name} onChange={e => setEditForm(f => ({ ...f, res_name: e.target.value }))}
                        style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 180 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#6b7280" }}>ស្តុក</label>
                      <input type="number" value={editForm.stock_qty} onChange={e => setEditForm(f => ({ ...f, stock_qty: e.target.value }))}
                        style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 80 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#6b7280" }}>តម្លៃ ($)</label>
                      <input type="number" value={editForm.price} onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                        style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 80 }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 11, color: "#6b7280" }}>Low Alert</label>
                      <input type="number" value={editForm.low_stock_alert} onChange={e => setEditForm(f => ({ ...f, low_stock_alert: e.target.value }))}
                        style={{ display: "block", padding: "6px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 80 }} />
                    </div>
                    <button onClick={handleSaveEdit}
                      style={{ padding: "6px 16px", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700 }}>
                      💾 រក្សាទុក
                    </button>
                    <button onClick={() => setEditId(null)}
                      style={{ padding: "6px 12px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 6, cursor: "pointer" }}>
                      បោះបង់
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    )
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>ឃ្លាំងទំនិញ</h2>
          <p className={styles.sub}>Manage, track, and provision enterprise stock items.</p>
        </div>
        <button className={styles.addBtn} onClick={() => navigate("/stock-add")}>+ Add Stock Item</button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.search}
            placeholder="Search resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className={styles.filterSel} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option>All Statuses</option>
          <option>Active</option>
          <option>Low Stock</option>
          <option>Depleted</option>
        </select>
      </div>

      {!selectedCat ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16, marginTop: 16 }}>
          {categories.map(cat => {
            const items     = filteredResources.filter(r => r.category === cat.cat_name);
            const active    = items.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Active").length;
            const low       = items.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Low Stock").length;
            const depleted  = items.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Depleted").length;
            return (
              <div key={cat.cat_id} onClick={() => setSelectedCat(cat.cat_name)}
                style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", cursor: "pointer", border: "2px solid transparent", transition: "all 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "#1a3a8f"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "transparent"}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#1a3a8f", marginBottom: 8 }}>{cat.cat_name}</div>
                <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>{items.length} items</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {active   > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>{active} Active</span>}
                  {low      > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#ffedd5", color: "#9a3412" }}>{low} Low</span>}
                  {depleted > 0 && <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "#fee2e2", color: "#991b1b" }}>{depleted} Depleted</span>}
                  {items.length === 0 && <span style={{ fontSize: 11, color: "#9ca3af" }}>ទទេ</span>}
                </div>
              </div>
            );
          })}

          {/* + Add Category folder card */}
          {!addingCat ? (
            <div onClick={() => setAddingCat(true)}
              style={{
                background: "#f8fafc", borderRadius: 12, padding: 20,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                cursor: "pointer", border: "2px dashed #c7d2fe", minHeight: 110, transition: "all 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.borderColor = "#1a3a8f"}
              onMouseLeave={e => e.currentTarget.style.borderColor = "#c7d2fe"}>
              <div style={{ fontSize: 28, color: "#1a3a8f", lineHeight: 1 }}>+</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3a8f", marginTop: 4 }}>បន្ថែម Category</div>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", border: "2px solid #1a3a8f" }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#1a3a8f", marginBottom: 8 }}>Category ថ្មី</div>
              <input
                autoFocus
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") handleAddCategory(); if (e.key === "Escape") { setAddingCat(false); setNewCatName(""); } }}
                placeholder="ឧ. ACCESSORIES"
                style={{ width: "100%", padding: "8px 10px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 13, marginBottom: 10, boxSizing: "border-box" }}
              />
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={handleAddCategory} disabled={savingCat}
                  style={{ flex: 1, padding: "8px 0", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
                  {savingCat ? "..." : "រក្សាទុក"}
                </button>
                <button onClick={() => { setAddingCat(false); setNewCatName(""); }}
                  style={{ flex: 1, padding: "8px 0", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                  បោះបង់
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ marginTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={() => { setSelectedCat(null); setEditId(null); setAdjustId(null); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#1a3a8f", fontWeight: 700, fontSize: 14 }}>
              ← ត្រឡប់
            </button>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#1a3a8f" }}>{selectedCat}</h3>
            <button onClick={() => navigate(`/stock-add?category=${encodeURIComponent(selectedCat)}`)}
              style={{ marginLeft: "auto", padding: "8px 16px", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700, fontSize: 13 }}>
              + Add Item
            </button>
          </div>
          <ProductList items={catItems} />
        </div>
      )}
    </div>
  );
}