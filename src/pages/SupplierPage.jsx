import React, { useState, useEffect } from "react";
import { supplierApi } from "../services/api";
import styles from "./StockListPage.module.css";

function SupplierModal({ supplier, onClose, onSave }) {
  const [form, setForm] = useState({
    sup_name:    supplier?.sup_name    ?? "",
    sup_phone:   supplier?.sup_phone   ?? "",
    sup_email:   supplier?.sup_email   ?? "",
    sup_address: supplier?.sup_address ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState("");
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.sup_name.trim()) { setError("សូមបញ្ចូលឈ្មោះ"); return; }
    setSaving(true);
    setError("");
    try {
      const result = supplier
        ? await supplierApi.update(supplier.sup_id, form)
        : await supplierApi.create(form);
      onSave(result);
    } catch (err) {
      setError(err.message || "មានបញ្ហា");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999 }}>
      <div style={{ background:"#fff", borderRadius:16, padding:32, minWidth:360, maxWidth:480, width:"90%", boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>
        <h3 style={{ margin:"0 0 20px", fontSize:16, fontWeight:700 }}>
          {supplier ? "✏️ កែអ្នកផ្គត់ផ្គង់" : "➕ បន្ថែមអ្នកផ្គត់ផ្គង់"}
        </h3>

        {error && <div style={{ background:"#fee2e2", color:"#e63946", padding:"10px 14px", borderRadius:8, marginBottom:14, fontSize:13 }}>⚠️ {error}</div>}

        {[
          { key:"sup_name",    label:"ឈ្មោះ *",         placeholder:"ឧ. Cam Supplier Co." },
          { key:"sup_phone",   label:"លេខទូរស័ព្ទ",      placeholder:"ឧ. 012 345 678" },
          { key:"sup_email",   label:"អ៊ីមែល",           placeholder:"ឧ. info@supplier.com" },
          { key:"sup_address", label:"អាសយដ្ឋាន",        placeholder:"ឧ. ភ្នំពេញ" },
        ].map(({ key, label, placeholder }) => (
          <div key={key} style={{ marginBottom:14 }}>
            <label style={{ fontSize:12, fontWeight:700, color:"#6b7280", display:"block", marginBottom:5 }}>{label}</label>
            <input
              style={{ width:"100%", padding:"10px 12px", borderRadius:8, border:"1.5px solid #e5e7eb", fontSize:14, boxSizing:"border-box" }}
              placeholder={placeholder}
              value={form[key]}
              onChange={set(key)}
            />
          </div>
        ))}

        <div style={{ display:"flex", gap:10, marginTop:8, justifyContent:"flex-end" }}>
          <button onClick={onClose} style={{ padding:"9px 22px", borderRadius:8, border:"1.5px solid #e5e7eb", background:"#f9fafb", cursor:"pointer", fontSize:14, fontWeight:600 }}>
            បោះបង់
          </button>
          <button onClick={handleSave} disabled={saving} style={{ padding:"9px 22px", borderRadius:8, border:"none", background: saving ? "#9ca3af" : "#1a3a8f", color:"#fff", cursor:"pointer", fontSize:14, fontWeight:700 }}>
            {saving ? "កំពុងរក្សា..." : "💾 រក្សាទុក"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null); // null | "add" | supplier object

  useEffect(() => {
    supplierApi.getAll()
      .then(setSuppliers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = suppliers.filter(s =>
    s.sup_name.toLowerCase().includes(search.toLowerCase()) ||
    (s.sup_phone ?? "").includes(search)
  );

  const handleSave = (result) => {
    setSuppliers(prev => {
      const exists = prev.find(s => s.sup_id === result.sup_id);
      return exists
        ? prev.map(s => s.sup_id === result.sup_id ? result : s)
        : [result, ...prev];
    });
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("លុបអ្នកផ្គត់ផ្គង់នេះ?")) return;
    await supplierApi.delete(id);
    setSuppliers(prev => prev.filter(s => s.sup_id !== id));
  };

  if (loading) return <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>កំពុងផ្ទុក...</div>;

  return (
    <div className={styles.page}>
      {modal && (
        <SupplierModal
          supplier={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}

      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>អ្នកផ្គត់ផ្គង់ (Suppliers)</h2>
          <p className={styles.sub}>គ្រប់គ្រងអ្នកផ្គត់ផ្គង់ទំនិញ</p>
        </div>
        <button className={styles.addBtn} onClick={() => setModal("add")}>+ បន្ថែមអ្នកផ្គត់ផ្គង់</button>
      </div>

      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.search}
            placeholder="ស្វែងរកឈ្មោះ ឬ លេខទូរស័ព្ទ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.sumNum} style={{ color:"#1a3a8f" }}>{suppliers.length}</div>
          <div className={styles.sumLabel}>អ្នកផ្គត់ផ្គង់ទាំងអស់</div>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
          <thead style={{ background:"#f9fafb" }}>
            <tr style={{ color:"#9ca3af", fontSize:11, fontWeight:700, textAlign:"left" }}>
              <th style={{ padding:"10px 12px" }}>#</th>
              <th style={{ padding:"10px 12px" }}>ឈ្មោះ</th>
              <th style={{ padding:"10px 12px" }}>ទូរស័ព្ទ</th>
              <th style={{ padding:"10px 12px" }}>អ៊ីមែល</th>
              <th style={{ padding:"10px 12px" }}>អាសយដ្ឋាន</th>
              <th style={{ padding:"10px 12px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} style={{ padding:24, textAlign:"center", color:"#9ca3af" }}>
                {suppliers.length === 0 ? "មិនទាន់មានអ្នកផ្គត់ផ្គង់" : "រកមិនឃើញ"}
              </td></tr>
            ) : filtered.map((s, i) => (
              <tr key={s.sup_id} style={{ borderTop:"1px solid #f3f4f6" }}>
                <td style={{ padding:"10px 12px", color:"#9ca3af", fontSize:12 }}>{i + 1}</td>
                <td style={{ padding:"10px 12px", fontWeight:600 }}>{s.sup_name}</td>
                <td style={{ padding:"10px 12px", color:"#6b7280" }}>{s.sup_phone ?? "—"}</td>
                <td style={{ padding:"10px 12px", color:"#6b7280" }}>{s.sup_email ?? "—"}</td>
                <td style={{ padding:"10px 12px", color:"#6b7280" }}>{s.sup_address ?? "—"}</td>
                <td style={{ padding:"10px 12px" }}>
                  <div style={{ display:"flex", gap:6 }}>
                    <button
                      onClick={() => setModal(s)}
                      style={{ padding:"5px 12px", borderRadius:6, border:"1.5px solid #e5e7eb", background:"#f9fafb", cursor:"pointer", fontSize:12, fontWeight:600 }}
                    >✏️</button>
                    <button
                      onClick={() => handleDelete(s.sup_id)}
                      style={{ padding:"5px 12px", borderRadius:6, border:"none", background:"#fee2e2", color:"#e63946", cursor:"pointer", fontSize:12, fontWeight:600 }}
                    >🗑️</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}