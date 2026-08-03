import React, { useState, useEffect, useRef } from "react";
import { employeeApi, deptApi } from "../services/api";
import styles from "./HrAdminPage.module.css";

export default function HrAdminPage() {
  const [employees,  setEmployees]  = useState([]);
  const [depts,      setDepts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(null); // null | "add" | employee obj
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState("");
  const fileRef = useRef();

  const [form, setForm] = useState({
    emp_name: "",   // ✅ fix: emp_name ជំនួស name
    position: "",
    phone:    "",
    dept_id:  "",
    photo:    null,
  });

  useEffect(() => {
    Promise.all([employeeApi.getAll(), deptApi.getAll()])
      .then(([emps, dpts]) => { setEmployees(emps); setDepts(dpts); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = employees.filter(e =>
    (e.emp_name ?? "").toLowerCase().includes(search.toLowerCase()) ||
    (e.position  ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setForm({ emp_name: "", position: "", phone: "", dept_id: "", photo: null });
    setError("");
    setModal("add");
  };

  const openEdit = (emp) => {
    setForm({
      emp_name: emp.emp_name ?? "",
      position: emp.position ?? "",
      phone:    emp.phone    ?? "",
      dept_id:  emp.dept_id  ?? "",
      photo:    null,
    });
    setError("");
    setModal(emp);
  };

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.emp_name.trim()) { setError("សូមបញ្ចូលឈ្មោះបុគ្គលិក"); return; }
    setSaving(true); setError("");
    try {
      // Use FormData for file upload support
      const fd = new FormData();
      fd.append("emp_name", form.emp_name);
      fd.append("position", form.position);
      fd.append("phone",    form.phone);
      fd.append("dept_id",  form.dept_id);
      if (form.photo) fd.append("photo", form.photo);

      let result;
      if (modal === "add") {
        result = await employeeApi.create({ emp_name: form.emp_name, position: form.position, phone: form.phone, dept_id: form.dept_id || null });
        setEmployees(prev => [...prev, result]);
      } else {
        result = await employeeApi.updateForm(modal.emp_id, fd);
        setEmployees(prev => prev.map(e => e.emp_id === modal.emp_id ? result : e));
      }
      setModal(null);
    } catch (err) {
      setError(err.message || "មានបញ្ហា");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("លុបបុគ្គលិកនេះ?")) return;
    await employeeApi.delete(id);
    setEmployees(prev => prev.filter(e => e.emp_id !== id));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;

  return (
    <div className={styles.page}>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 380, maxWidth: 480, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>
              {modal === "add" ? "➕ បន្ថែមបុគ្គលិក" : "✏️ កែបុគ្គលិក"}
            </h3>
            {error && <div style={{ background: "#fee2e2", color: "#e63946", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>⚠️ {error}</div>}

            {/* ✅ emp_name field */}
            {[
              { key: "emp_name", label: "ឈ្មោះបុគ្គលិក *", placeholder: "ឧ. សុខ វណ្ណ" },
              { key: "position", label: "មុខងារ",           placeholder: "ឧ. Manager, Engineer" },
              { key: "phone",    label: "លេខទូរស័ព្ទ",      placeholder: "ឧ. 012 345 678" },
            ].map(({ key, label, placeholder }) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>{label}</label>
                <input
                  style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                  placeholder={placeholder}
                  value={form[key]}
                  onChange={set(key)}
                />
              </div>
            ))}

            {/* Department */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>ផ្នែកការងារ</label>
              <select
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }}
                value={form.dept_id}
                onChange={set("dept_id")}
              >
                <option value="">-- គ្មានផ្នែក --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>

            {/* Photo (edit only) */}
            {modal !== "add" && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>រូបភាព</label>
                <input type="file" accept="image/*" ref={fileRef}
                  onChange={e => setForm(f => ({ ...f, photo: e.target.files[0] ?? null }))}
                  style={{ fontSize: 13 }} />
              </div>
            )}

            <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{ padding: "9px 22px", borderRadius: 8, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 14 }}>
                បោះបង់
              </button>
              <button onClick={handleSave} disabled={saving} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: saving ? "#9ca3af" : "#1a3a8f", color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 700 }}>
                {saving ? "កំពុងរក្សា..." : "💾 រក្សាទុក"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>👥 គ្រប់គ្រងបុគ្គលិក</h2>
          <p className={styles.sub}>HR Administration — Employee Management</p>
        </div>
        <button onClick={openAdd} className={styles.addBtn}>+ បន្ថែមបុគ្គលិក</button>
      </div>

      {/* Summary */}
      <div className={styles.summaryRow}>
        <div className={styles.summaryCard}>
          <div className={styles.sumNum} style={{ color: "#1a3a8f" }}>{employees.length}</div>
          <div className={styles.sumLabel}>បុគ្គលិកសរុប</div>
        </div>
        <div className={styles.summaryCard}>
          <div className={styles.sumNum} style={{ color: "#2cb67d" }}>{depts.length}</div>
          <div className={styles.sumLabel}>ផ្នែកការងារ</div>
        </div>
      </div>

      {/* Search */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.search}
            placeholder="ស្វែងរកឈ្មោះ ឬ មុខងារ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textAlign: "left" }}>
              <th style={{ padding: "10px 16px" }}>បុគ្គលិក</th>
              <th style={{ padding: "10px 16px" }}>មុខងារ</th>
              <th style={{ padding: "10px 16px" }}>ផ្នែក</th>
              <th style={{ padding: "10px 16px" }}>ទូរស័ព្ទ</th>
              <th style={{ padding: "10px 16px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
                {employees.length === 0 ? "គ្មានបុគ្គលិក" : "រកមិនឃើញ"}
              </td></tr>
            ) : filtered.map((e, i) => (
              <tr key={e.emp_id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%",
                      background: e.photo_url ? "transparent" : "#1a3a8f",
                      overflow: "hidden", flexShrink: 0,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {e.photo_url
                        ? <img src={e.photo_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        : <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{(e.emp_name ?? "?")[0]}</span>
                      }
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1a1a2e" }}>{e.emp_name}</div>
                      <div style={{ fontSize: 11, color: "#9ca3af" }}>ID: {e.emp_id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{e.position ?? "—"}</td>
                <td style={{ padding: "10px 16px" }}>
                  {e.dept_name
                    ? <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "2px 8px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{e.dept_name}</span>
                    : <span style={{ color: "#9ca3af" }}>—</span>
                  }
                </td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{e.phone ?? "—"}</td>
                <td style={{ padding: "10px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(e)} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 12 }}>✏️</button>
                    <button onClick={() => handleDelete(e.emp_id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#e63946", cursor: "pointer", fontSize: 12 }}>🗑️</button>
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
