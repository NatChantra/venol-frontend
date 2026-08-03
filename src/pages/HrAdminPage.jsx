<<<<<<< HEAD
import React, { useState, useEffect } from "react";
import { employeeApi, leaveApi, deptApi } from "../services/api";
import styles from "./HrAdminPage.module.css";

export default function HrAdminPage() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState({ emp_name: "", position: "", dept_id: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ emp_name: "", position: "", dept_id: "", phone: "" });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeApi.getAll(),
      leaveApi.getAll(),
      deptApi.getAll(),
    ]).then(([emps, lvs, dps]) => {
      setEmployees(Array.isArray(emps) ? emps : []);
      setLeaves(Array.isArray(lvs) ? lvs : []);
      setDepts(Array.isArray(dps) ? dps : []);
    }).finally(() => setLoading(false));
  }, []);

  const openEdit = (emp) => {
    setEditEmp(emp);
    setForm({ emp_name: emp.emp_name ?? "", position: emp.position ?? "", dept_id: emp.dept_id ?? "", phone: emp.phone ?? "" });
  };

  const handleEdit = async () => {
    if (!form.emp_name.trim()) return alert("សូមបញ្ចូលឈ្មោះ");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("emp_name", form.emp_name);
      fd.append("position", form.position || "");
      fd.append("dept_id", form.dept_id || "");
      fd.append("phone", form.phone || "");
      const res = await fetch("https://my-system-vp4o.onrender.com/api/employees/" + editEmp.emp_id, {
        method: "POST", headers: { Accept: "application/json" }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message ?? "មានបញ្ហា");
      setEmployees(prev => prev.map(e => e.emp_id === editEmp.emp_id ? data : e));
      setEditEmp(null);
    } catch { alert("ភ្ជាប់ server មិនបាន"); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.emp_name.trim()) return alert("សូមបញ្ចូលឈ្មោះ");
    setSaving(true);
    try {
      const data = await employeeApi.create(addForm);
      setEmployees(prev => [...prev, data]);
      setAddForm({ emp_name: "", position: "", dept_id: "", phone: "" });
      setShowAdd(false);
    } catch { alert("ភ្ជាប់ server មិនបាន"); }
    finally { setSaving(false); }
  };

=======
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

>>>>>>> 99eb83218d613dee0abf685efecfe38f5f616afd
  const handleDelete = async (id) => {
    if (!window.confirm("លុបបុគ្គលិកនេះ?")) return;
    await employeeApi.delete(id);
    setEmployees(prev => prev.filter(e => e.emp_id !== id));
  };

<<<<<<< HEAD
  const handleLeaveStatus = async (id, status) => {
    await leaveApi.updateStatus(id, status);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status } : l));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>កំពុងផ្ទុក...</div>;
=======
  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;
>>>>>>> 99eb83218d613dee0abf685efecfe38f5f616afd

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
<<<<<<< HEAD
        <button className={styles.addBtn} onClick={() => { setShowAdd(true); setEditEmp(null); }}>
          + បន្ថែមបុគ្គលិក
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={styles.tab + (tab === "employees" ? " " + styles.active : "")} onClick={() => setTab("employees")}>
          HR Admin
        </button>
        <button className={styles.tab + (tab === "employees" ? " " + styles.active : "")} onClick={() => setTab("employees")}>
          បុគ្គលិក ({employees.length})
        </button>
        <button className={styles.tab + (tab === "leaves" ? " " + styles.active : "")} onClick={() => setTab("leaves")}>
          ច្បាប់ ({leaves.length})
        </button>
        <button className={styles.tab + (tab === "time" ? " " + styles.active : "")} onClick={() => setTab("time")}>
          វត្តមាន
        </button>
      </div>

      {showAdd && (
        <div className={styles.formBox}>
          <h3 className={styles.formTitle}>បន្ថែមបុគ្គលិកថ្មី</h3>
          <div className={styles.formGrid}>
            <div><label className={styles.label}>ឈ្មោះ *</label>
              <input className={styles.input} value={addForm.emp_name} onChange={e => setAddForm(f => ({ ...f, emp_name: e.target.value }))} placeholder="ឈ្មោះបុគ្គលិក" /></div>
            <div><label className={styles.label}>តួនាទី</label>
              <input className={styles.input} value={addForm.position} onChange={e => setAddForm(f => ({ ...f, position: e.target.value }))} placeholder="Manager, Staff..." /></div>
            <div><label className={styles.label}>លេខទូរស័ព្ទ</label>
              <input className={styles.input} value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="0xx-xxx-xxx" /></div>
            <div><label className={styles.label}>ផ្នែក</label>
              <select className={styles.input} value={addForm.dept_id} onChange={e => setAddForm(f => ({ ...f, dept_id: e.target.value }))}>
                <option value="">-- ជ្រើសរើសផ្នែក --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select></div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleAdd} disabled={saving}>{saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}</button>
            <button className={styles.cancelBtn} onClick={() => setShowAdd(false)}>បោះបង់</button>
          </div>
=======
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
>>>>>>> 99eb83218d613dee0abf685efecfe38f5f616afd
        </div>
      </div>

<<<<<<< HEAD
      {editEmp && (
        <div className={styles.formBox}>
          <h3 className={styles.formTitle}>កែប្រែ — V{String(editEmp.emp_id).padStart(3, "0")}</h3>
          <div className={styles.formGrid}>
            <div><label className={styles.label}>ឈ្មោះ *</label>
              <input className={styles.input} value={form.emp_name} onChange={e => setForm(f => ({ ...f, emp_name: e.target.value }))} /></div>
            <div><label className={styles.label}>តួនាទី</label>
              <input className={styles.input} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
            <div><label className={styles.label}>លេខទូរស័ព្ទ</label>
              <input className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className={styles.label}>ផ្នែក</label>
              <select className={styles.input} value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}>
                <option value="">-- ជ្រើសរើស --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select></div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleEdit} disabled={saving}>{saving ? "កំពុងរក្សាទុក..." : "រក្សាទុក"}</button>
            <button className={styles.cancelBtn} onClick={() => setEditEmp(null)}>បោះបង់</button>
          </div>
        </div>
      )}

      {tab === "employees" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>ឈ្មោះ</th><th>តួនាទី</th><th>ផ្នែក</th><th>លេខទូរស័ព្ទ</th><th>Actions</th></tr></thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.emp_id}>
                  <td>V{String(emp.emp_id).padStart(3, "0")}</td>
                  <td><div className={styles.empCell}><div className={styles.avatar}>{emp.emp_name?.[0]?.toUpperCase()}</div><span>{emp.emp_name}</span></div></td>
                  <td>{emp.position ?? "—"}</td>
                  <td>{emp.dept_name ?? "—"}</td>
                  <td>{emp.phone ?? "—"}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => openEdit(emp)}>Edit</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(emp.emp_id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "leaves" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>បុគ្គលិក</th><th>ប្រភេទ</th><th>ចាប់ពី</th><th>ដល់</th><th>ហេតុ</th><th>ស្ថានភាព</th><th>Actions</th></tr></thead>
            <tbody>
              {leaves.map(lv => (
                <tr key={lv.leave_id}>
                  <td>{lv.emp_name ?? "—"}</td>
                  <td>{lv.type_name ?? "—"}</td>
                  <td>{lv.start_date}</td>
                  <td>{lv.end_date}</td>
                  <td>{lv.reason ?? "—"}</td>
                  <td>{lv.status}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => handleLeaveStatus(lv.leave_id, "Approved")}>Approve</button>
                    <button className={styles.deleteBtn} onClick={() => handleLeaveStatus(lv.leave_id, "Rejected")}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
=======
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
>>>>>>> 99eb83218d613dee0abf685efecfe38f5f616afd
    </div>
  );
}
