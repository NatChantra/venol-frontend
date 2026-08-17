import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { resourceApi, categoryApi } from "../services/api";
import styles from "./StockViewPage.module.css";

const API = window.location.hostname === "localhost"
  ? "http://localhost:8000/api"
  : "https://my-system-vp4o.onrender.com/api";

function getStatus(stock_qty, low_stock_alert = 20) {
  if (stock_qty <= 0)               return "Depleted";
  if (stock_qty <= low_stock_alert) return "Low Stock";
  return "Active";
}

const STATUS_BADGE_CLASS = {
  "Active":    "badgeActive",
  "Low Stock": "badgeLow",
  "Depleted":  "badgeDepleted",
};

// ProductList is defined OUTSIDE StockViewPage so React does not recreate it
// on every render (that bug caused inputs to lose focus after every keystroke).
function ProductList({
  items, editId, editForm, setEditForm, adjustId, adjustType,
  adjustQty, setAdjustQty, adjustNote, setAdjustNote,
  startEdit, handleSaveEdit, setEditId, startAdjust, handleAdjust, setAdjustId, handleDelete,
}) {
  if (items.length === 0) {
    return <div className={styles.emptyState}>គ្មានទំនិញ</div>;
  }

  return (
    <div className={styles.listCard}>
      {items.map((r) => {
        const status      = getStatus(r.stock_qty, r.low_stock_alert);
        const isEditing   = editId   === r.res_id;
        const isAdjusting = adjustId === r.res_id;

        return (
          <div key={r.res_id} className={styles.row}>
            <div className={styles.rowMain}>
              <div className={styles.itemInfo}>
                <div className={styles.itemName}>{r.res_name}</div>
                <div className={styles.itemCategory}>▤ {r.category ?? "—"}</div>
              </div>

              <div className={styles.qtyBlock}>
                <div className={styles.qtyLabel}>STOCK QTY</div>
                <div className={styles.qtyVal}>{r.stock_qty} {r.unit ?? ""}</div>
              </div>

              <span className={`${styles.badge} ${styles[STATUS_BADGE_CLASS[status]]}`}>
                {status}
              </span>

              <div className={styles.rowActions}>
                <button className={styles.btnIn} onClick={() => startAdjust(r, "in")}>+IN</button>
                <button className={styles.btnOut} onClick={() => startAdjust(r, "out")}>-OUT</button>
                <button className={styles.btnEdit2} onClick={() => startEdit(r)}>✏️</button>
                <button className={styles.btnDelete} onClick={() => handleDelete(r.res_id)}>🗑️</button>
              </div>
            </div>

            {isAdjusting && (
              <div className={`${styles.adjustPanel} ${adjustType === "in" ? styles.adjustPanelIn : styles.adjustPanelOut}`}>
                <div className={styles.adjustRow}>
                  <span className={adjustType === "in" ? styles.adjustLabelIn : styles.adjustLabelOut}>
                    {adjustType === "in" ? "Stock In" : "Stock Out"} — {r.res_name}
                  </span>
                  <input
                    className={styles.adjustQtyInput}
                    type="number" min="1" placeholder="បរិមាណ"
                    value={adjustQty} onChange={e => setAdjustQty(e.target.value)} autoFocus
                  />
                  <input
                    className={styles.adjustNoteInput}
                    type="text" placeholder="កំណត់ចំណាំ"
                    value={adjustNote} onChange={e => setAdjustNote(e.target.value)}
                  />
                  <button
                    className={adjustType === "in" ? styles.adjustConfirmIn : styles.adjustConfirmOut}
                    onClick={handleAdjust}
                  >
                    {adjustType === "in" ? "បញ្ចូល" : "យកចេញ"}
                  </button>
                  <button className={styles.adjustCancelBtn} onClick={() => setAdjustId(null)}>
                    បោះបង់
                  </button>
                </div>
              </div>
            )}

            {isEditing && (
              <div className={styles.editPanel}>
                <div className={styles.editRow}>
                  <div className={styles.editFieldName}>
                    <label>ឈ្មោះ</label>
                    <input
                      value={editForm.res_name}
                      onChange={e => setEditForm(f => ({ ...f, res_name: e.target.value }))}
                    />
                  </div>
                  <div className={styles.editFieldQty}>
                    <label>ស្តុក</label>
                    <input
                      type="number"
                      value={editForm.stock_qty}
                      onChange={e => setEditForm(f => ({ ...f, stock_qty: e.target.value }))}
                    />
                  </div>
                  <div className={styles.editFieldPrice}>
                    <label>តម្លៃ ($)</label>
                    <input
                      type="number"
                      value={editForm.price}
                      onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                  <div className={styles.editFieldAlert}>
                    <label>Low Alert</label>
                    <input
                      type="number"
                      value={editForm.low_stock_alert}
                      onChange={e => setEditForm(f => ({ ...f, low_stock_alert: e.target.value }))}
                    />
                  </div>
                  <button className={styles.editSaveBtn} onClick={handleSaveEdit}>💾 រក្សាទុក</button>
                  <button className={styles.editCancelBtn} onClick={() => setEditId(null)}>បោះបង់</button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function StockViewPage() {
  const navigate = useNavigate();
  const [resources, setResources]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatusFilter] = useState("All Statuses");
  const [selectedCat, setSelectedCat]   = useState(null);

  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});

  const [adjustId,   setAdjustId]   = useState(null);
  const [adjustType, setAdjustType] = useState("in");
  const [adjustQty,  setAdjustQty]  = useState("");
  const [adjustNote, setAdjustNote] = useState("");

  const [addingCat, setAddingCat]   = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [savingCat, setSavingCat]   = useState(false);

  const [editingCatId, setEditingCatId] = useState(null);
  const [editCatName,  setEditCatName]  = useState("");

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
      const original = resources.find(r => r.res_id === editId);
      const updated = await resourceApi.update(editId, {
        res_name:        editForm.res_name,
        cat_id:          original.cat_id,
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

  const handleUpdateCategory = async (id) => {
    if (!editCatName.trim()) { alert("សូមបញ្ចូលឈ្មោះ Category"); return; }
    try {
      const updated = await categoryApi.update(id, { cat_name: editCatName.trim() });
      setCategories(prev => prev.map(c => c.cat_id === id ? { ...c, ...updated } : c));
      setEditingCatId(null);
    } catch (err) {
      alert(err.message || "មិនអាចកែ Category បានទេ");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("លុប Category នេះ? (ទំនិញក្នុងនេះនឹងលែងមាន category)")) return;
    try {
      await categoryApi.delete(id);
      setCategories(prev => prev.filter(c => c.cat_id !== id));
    } catch (err) {
      alert(err.message || "មិនអាចលុប Category បានទេ");
    }
  };

  if (loading) return <div className={styles.loading}>កំពុងផ្ទុក...</div>;

  const filteredResources = resources.filter(r => {
    const status = getStatus(r.stock_qty, r.low_stock_alert);
    const matchSearch = r.res_name.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All Statuses" || status === statusFilter;
    return matchSearch && matchStatus;
  });

  const catItems = selectedCat ? filteredResources.filter(r => r.category === selectedCat) : [];

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
        <div className={styles.grid}>
          {categories.map(cat => {
            const items     = filteredResources.filter(r => r.category === cat.cat_name);
            const active    = items.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Active").length;
            const low       = items.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Low Stock").length;
            const depleted  = items.filter(r => getStatus(r.stock_qty, r.low_stock_alert) === "Depleted").length;
            const isEditingThisCat = editingCatId === cat.cat_id;

            return (
              <div
                key={cat.cat_id}
                className={`${styles.catCard} ${isEditingThisCat ? styles.catCardEditing : ""}`}
              >
                {isEditingThisCat ? (
                  <div onClick={e => e.stopPropagation()}>
                    <input
                      autoFocus
                      className={styles.catEditInput}
                      value={editCatName}
                      onChange={e => setEditCatName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleUpdateCategory(cat.cat_id);
                        if (e.key === "Escape") setEditingCatId(null);
                      }}
                    />
                    <div className={styles.catEditActions}>
                      <button className={styles.btnSave} onClick={() => handleUpdateCategory(cat.cat_id)}>
                        រក្សាទុក
                      </button>
                      <button className={styles.btnCancel} onClick={() => setEditingCatId(null)}>
                        បោះបង់
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setSelectedCat(cat.cat_name)}>
                    <div className={styles.catHeaderRow}>
                      <div className={styles.catName}>{cat.cat_name}</div>
                      <div className={styles.catActions}>
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnEdit}`}
                          onClick={e => { e.stopPropagation(); setEditingCatId(cat.cat_id); setEditCatName(cat.cat_name); }}
                        >
                          ✏️
                        </button>
                        <button
                          className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
                          onClick={e => { e.stopPropagation(); handleDeleteCategory(cat.cat_id); }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className={styles.catCount}>{items.length} items</div>
                    <div className={styles.catBadges}>
                      {active   > 0 && <span className={`${styles.badge} ${styles.badgeActive}`}>{active} Active</span>}
                      {low      > 0 && <span className={`${styles.badge} ${styles.badgeLow}`}>{low} Low</span>}
                      {depleted > 0 && <span className={`${styles.badge} ${styles.badgeDepleted}`}>{depleted} Depleted</span>}
                      {items.length === 0 && <span className={styles.badgeEmpty}>ទទេ</span>}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {!addingCat ? (
            <div className={styles.addCatCard} onClick={() => setAddingCat(true)}>
              <div className={styles.addCatPlus}>+</div>
              <div className={styles.addCatLabel}>បន្ថែម Category</div>
            </div>
          ) : (
            <div className={styles.newCatCard}>
              <div className={styles.newCatTitle}>Category ថ្មី</div>
              <input
                autoFocus
                className={styles.newCatInput}
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === "Enter") handleAddCategory();
                  if (e.key === "Escape") { setAddingCat(false); setNewCatName(""); }
                }}
                placeholder="ឧ. ACCESSORIES"
              />
              <div className={styles.newCatActions}>
                <button className={styles.btnSave} onClick={handleAddCategory} disabled={savingCat}>
                  {savingCat ? "..." : "រក្សាទុក"}
                </button>
                <button className={styles.btnCancel} onClick={() => { setAddingCat(false); setNewCatName(""); }}>
                  បោះបង់
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div>
          <div className={styles.detailHeader}>
            <button
              className={styles.backBtn}
              onClick={() => { setSelectedCat(null); setEditId(null); setAdjustId(null); }}
            >
              ← ត្រឡប់
            </button>
            <h3 className={styles.detailTitle}>{selectedCat}</h3>
            <button
              className={styles.addItemBtn}
              onClick={() => navigate(`/stock-add?category=${encodeURIComponent(selectedCat)}`)}
            >
              + Add Item
            </button>
          </div>
          <ProductList
            items={catItems}
            editId={editId} editForm={editForm} setEditForm={setEditForm}
            adjustId={adjustId} adjustType={adjustType}
            adjustQty={adjustQty} setAdjustQty={setAdjustQty}
            adjustNote={adjustNote} setAdjustNote={setAdjustNote}
            startEdit={startEdit} handleSaveEdit={handleSaveEdit} setEditId={setEditId}
            startAdjust={startAdjust} handleAdjust={handleAdjust} setAdjustId={setAdjustId}
            handleDelete={handleDelete}
          />
        </div>
      )}
    </div>
  );
}