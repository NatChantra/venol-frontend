import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { resourceApi, supplierApi, categoryApi } from "../services/api";
import styles from "./AddStockPage.module.css";

export default function AddStockPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetCategory = searchParams.get("category") || "";

  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const [suppliers,  setSuppliers]  = useState([]);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    res_name:        "",
    cat_id:          "",
    stock_qty:       "",
    price:           "",
    unit:            "pcs",
    low_stock_alert: "10",
    sup_id:          "",
    note:            "",
  });

  useEffect(() => {
    supplierApi.getAll().then(setSuppliers).catch(() => {});
    categoryApi.getAll().then(cats => {
      setCategories(cats);
      // បើ presetCategory → រក cat_id ដែល match
      if (presetCategory) {
        const found = cats.find(c => c.cat_name === presetCategory);
        if (found) setForm(f => ({ ...f, cat_id: String(found.cat_id) }));
      }
    }).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async () => {
    if (!form.res_name.trim()) { setError("សូមបញ្ចូលឈ្មោះទំនិញ"); return; }
    if (!form.cat_id)          { setError("សូមជ្រើសប្រភេទ");        return; }
    setSaving(true);
    setError("");
    try {
      await resourceApi.create({
        res_name:        form.res_name,
        cat_id:          Number(form.cat_id),
        stock_qty:       Number(form.stock_qty)       || 0,
        price:           Number(form.price)           || 0,
        unit:            form.unit,
        low_stock_alert: Number(form.low_stock_alert) || 10,
        sup_id:          form.sup_id ? Number(form.sup_id) : null,
        note:            form.note   || null,
      });
      navigate("/stock-list");
    } catch (err) {
      setError(err.message || "មានបញ្ហា សូមព្យាយាមម្តងទៀត");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>📦 INVENTORY / ADD NEW ITEM</div>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>NEW STOCK ENTRY</h2>
          <p className={styles.sub}>Register a new product into the Inventory system.</p>
        </div>
      </div>

      {presetCategory && (
        <div style={{ background: "#e0e7ff", color: "#3730a3", padding: "10px 16px", borderRadius: 8, marginBottom: 16, fontWeight: 700, fontSize: 14 }}>
          📦 ប្រភេទ: {presetCategory}
        </div>
      )}

      {error && (
        <div style={{ background: "#fee2e2", color: "#e63946", padding: "12px 16px", borderRadius: 8, marginBottom: 16, fontSize: 14 }}>
          ⚠️ {error}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.section}>
          <div className={styles.sectionHeader}>📦 PRODUCT IDENTITY</div>
          <div className={styles.sectionSub}>Core identification details</div>
          <div className={styles.fieldGroup}>

            <div className={styles.field}>
              <label className={styles.label}>⊕ ឈ្មោះទំនិញ *</label>
              <input className={styles.input} placeholder="ឧ. Venol Gold 5W-40" value={form.res_name} onChange={set("res_name")} />
            </div>

            {/* ✅ Category Dropdown — send cat_id */}
            <div className={styles.field}>
              <label className={styles.label}>⊕ ប្រភេទ *</label>
              <select className={styles.input} value={form.cat_id} onChange={set("cat_id")}>
                <option value="">-- ជ្រើសប្រភេទ --</option>
                {categories.map(c => (
                  <option key={c.cat_id} value={c.cat_id}>{c.cat_name}</option>
                ))}
              </select>
            </div>

            <div className={styles.rowFields}>
              <div className={styles.field}>
                <label className={styles.label}>⊕ ឯកតា (unit)</label>
                <select className={styles.input} value={form.unit} onChange={set("unit")}>
                  <option value="pcs">pcs</option>
                  <option value="liter">liter</option>
                  <option value="kg">kg</option>
                  <option value="box">box</option>
                  <option value="bottle">bottle</option>
                  <option value="set">set</option>
                  <option value="gallon">gallon</option>
                  <option value="drum">drum</option>
                  <option value="can">can</option>
                </select>
              </div>
            </div>

            <div className={styles.rowFields}>
              <div className={styles.field}>
                <label className={styles.label}>⊕ បរិមាណដំបូង</label>
                <input className={styles.input} type="number" min="0" placeholder="0" value={form.stock_qty} onChange={set("stock_qty")} />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>⊕ តម្លៃ ($)</label>
                <input className={styles.input} type="number" min="0" step="0.01" placeholder="0.00" value={form.price} onChange={set("price")} />
              </div>
            </div>

          </div>
        </div>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>⚙️ STOCK SETTINGS</div>
          <div className={styles.sectionSub}>Alert threshold & supplier</div>
          <div className={styles.fieldGroup}>

            <div className={styles.field}>
              <label className={styles.label}>⊕ Low Stock Alert (បរិមាណ)</label>
              <input className={styles.input} type="number" min="1" placeholder="10" value={form.low_stock_alert} onChange={set("low_stock_alert")} />
              <span style={{ fontSize: 11, color: "#9ca3af", marginTop: 4 }}>
                ⚠️ ប្រព័ន្ធនឹងជូនដំណឹងពេល stock ស្មើ ឬ ក្រោម តម្លៃនេះ
              </span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>⊕ អ្នកផ្គត់ផ្គង់ (Supplier)</label>
              <select className={styles.input} value={form.sup_id} onChange={set("sup_id")}>
                <option value="">-- គ្មាន --</option>
                {suppliers.map(s => (
                  <option key={s.sup_id} value={s.sup_id}>{s.sup_name}</option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>⊕ កំណត់ចំណាំ</label>
              <textarea className={styles.input} rows={3} placeholder="កំណត់ចំណាំបន្ថែម..."
                value={form.note} onChange={set("note")} style={{ resize: "vertical" }} />
            </div>

          </div>
        </div>
      </div>

      <div className={styles.formFooter}>
        <button className={styles.resetBtn} onClick={() => navigate(-1)}>CANCEL</button>
        <button className={styles.submitBtn} onClick={handleSubmit} disabled={saving}>
          {saving ? "កំពុងរក្សាទុក..." : "+ ADD TO STOCK"}
        </button>
      </div>
    </div>
  );
}