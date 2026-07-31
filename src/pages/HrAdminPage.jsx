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
    if (!form.emp_name.trim()) return alert("Ã¡Å¾Å¸Ã¡Å¾Â¼Ã¡Å¾ËœÃ¡Å¾â€Ã¡Å¾â€°Ã¡Å¸â€™Ã¡Å¾â€¦Ã¡Å¾Â¼Ã¡Å¾â€ºÃ¡Å¾Ë†Ã¡Å¸â€™Ã¡Å¾ËœÃ¡Å¸â€žÃ¡Å¸â€¡");
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
      if (!res.ok) return alert(data.message ?? "Ã¡Å¾ËœÃ¡Å¾Â¶Ã¡Å¾â€œÃ¡Å¾â€Ã¡Å¾â€°Ã¡Å¸â€™Ã¡Å¾Â Ã¡Å¾Â¶");
      setEmployees(prev => prev.map(e => e.emp_id === editEmp.emp_id ? data : e));
      setEditEmp(null);
    } catch { alert("Ã¡Å¾â€”Ã¡Å¸â€™Ã¡Å¾â€¡Ã¡Å¾Â¶Ã¡Å¾â€Ã¡Å¸â€¹ server Ã¡Å¾ËœÃ¡Å¾Â·Ã¡Å¾â€œÃ¡Å¾â€Ã¡Å¾Â¶Ã¡Å¾â€œ"); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.emp_name.trim()) return alert("Ã¡Å¾Å¸Ã¡Å¾Â¼Ã¡Å¾ËœÃ¡Å¾â€Ã¡Å¾â€°Ã¡Å¸â€™Ã¡Å¾â€¦Ã¡Å¾Â¼Ã¡Å¾â€ºÃ¡Å¾Ë†Ã¡Å¸â€™Ã¡Å¾ËœÃ¡Å¸â€žÃ¡Å¸â€¡");
    setSaving(true);
    try {
      const res = await api.post("/employees", addForm);
      const data = await res.json();
      if (!res.ok) return alert(data.message ?? "Ã¡Å¾ËœÃ¡Å¾Â¶Ã¡Å¾â€œÃ¡Å¾â€Ã¡Å¾â€°Ã¡Å¸â€™Ã¡Å¾Â Ã¡Å¾Â¶");
      setEmployees(prev => [...prev, data]);
      setAddForm({ emp_name: "", position: "", dept_id: "", phone: "" });
      setShowAdd(false);
    } catch { alert("Ã¡Å¾â€”Ã¡Å¸â€™Ã¡Å¾â€¡Ã¡Å¾Â¶Ã¡Å¾â€Ã¡Å¸â€¹ server Ã¡Å¾ËœÃ¡Å¾Â·Ã¡Å¾â€œÃ¡Å¾â€Ã¡Å¾Â¶Ã¡Å¾â€œ"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Ã¡Å¾â€ºÃ¡Å¾Â»Ã¡Å¾â€Ã¡Å¾â€Ã¡Å¾Â»Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾â€šÃ¡Å¾â€ºÃ¡Å¾Â·Ã¡Å¾â‚¬Ã¡Å¾â€œÃ¡Å¸ÂÃ¡Å¸â€¡?")) return;
    await employeeApi.delete(id);
    setEmployees(prev => prev.filter(e => e.emp_id !== id));
  };

  const handleLeaveStatus = async (id, status) => {
    await leaveApi.updateStatus(id, status);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status } : l));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Ã¡Å¾â‚¬Ã¡Å¸â€ Ã¡Å¾â€“Ã¡Å¾Â»Ã¡Å¾â€žÃ¡Å¾â€¢Ã¡Å¸â€™Ã¡Å¾â€˜Ã¡Å¾Â»Ã¡Å¾â‚¬...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>HR Administration</h2>
          <p className={styles.sub}>Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾Å¡Ã¡Å¾â€Ã¡Å¸â€¹Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾Å¡Ã¡Å¾â€žÃ¡Å¾â€Ã¡Å¾Â»Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾â€šÃ¡Å¾â€ºÃ¡Å¾Â·Ã¡Å¾â‚¬ Ã¡Å¾â€œÃ¡Å¾Â·Ã¡Å¾â€ž Ã¡Å¾â€¦Ã¡Å¸â€™Ã¡Å¾â€Ã¡Å¾Â¶Ã¡Å¾â€Ã¡Å¸â€¹Ã¡Å¾Ë†Ã¡Å¾â€Ã¡Å¸â€¹Ã¡Å¾Å¸Ã¡Å¾ËœÃ¡Å¸â€™Ã¡Å¾Å¡Ã¡Å¾Â¶Ã¡Å¾â‚¬</p>
        </div>
        <button className={styles.addBtn} onClick={() => { setShowAdd(true); setEditEmp(null); }}>
          + Ã¡Å¾â€Ã¡Å¾â€œÃ¡Å¸â€™Ã¡Å¾ÂÃ¡Å¸â€šÃ¡Å¾ËœÃ¡Å¾â€Ã¡Å¾Â»Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾â€šÃ¡Å¾â€ºÃ¡Å¾Â·Ã¡Å¾â‚¬
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={styles.tab + (tab === "employees" ? " " + styles.active : "")} onClick={() => setTab("employees")}>
          Ã°Å¸â€˜Â¥ Ã¡Å¾â€Ã¡Å¾Â»Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾â€šÃ¡Å¾â€ºÃ¡Å¾Â·Ã¡Å¾â‚¬ ({employees.length})
        </button>
        <button className={styles.tab + (tab === "leaves" ? " " + styles.active : "")} onClick={() => setTab("leaves")}>
          Ã°Å¸â€œâ€¦ Ã¡Å¾â€¦Ã¡Å¸â€™Ã¡Å¾â€Ã¡Å¾Â¶Ã¡Å¾â€Ã¡Å¸â€¹ ({leaves.length})
        </button>
      </div>

      {showAdd && (
        <div className={styles.formBox}>
          <h3 className={styles.formTitle}>Ã¡Å¾â€Ã¡Å¾â€œÃ¡Å¸â€™Ã¡Å¾ÂÃ¡Å¸â€šÃ¡Å¾ËœÃ¡Å¾â€Ã¡Å¾Â»Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾â€šÃ¡Å¾â€ºÃ¡Å¾Â·Ã¡Å¾â‚¬Ã¡Å¾ÂÃ¡Å¸â€™Ã¡Å¾ËœÃ¡Å¾Â¸</h3>
          <div className={styles.formGrid}>
            <div><label className={styles.label}>Ã¡Å¾Ë†Ã¡Å¸â€™Ã¡Å¾ËœÃ¡Å¸â€žÃ¡Å¸â€¡ *</label>
              <input className={styles.input} value={addForm.emp_name} onChange={e => setAddForm(f => ({ ...f, emp_name: e.target.value }))} placeholder="Ã¡Å¾Ë†Ã¡Å¸â€™Ã¡Å¾ËœÃ¡Å¸â€žÃ¡Å¸â€¡Ã¡Å¾â€Ã¡Å¾Â»Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾â€šÃ¡Å¾â€ºÃ¡Å¾Â·Ã¡Å¾â‚¬" /></div>
            <div><label className={styles.label}>Ã¡Å¾ÂÃ¡Å¾Â½Ã¡Å¾â€œÃ¡Å¾Â¶Ã¡Å¾â€˜Ã¡Å¾Â¸</label>
              <input className={styles.input} value={addForm.position} onChange={e => setAddForm(f => ({ ...f, position: e.target.value }))} placeholder="Manager, Staff..." /></div>
            <div><label className={styles.label}>Ã¡Å¾â€ºÃ¡Å¸ÂÃ¡Å¾ÂÃ¡Å¾â€˜Ã¡Å¾Â¼Ã¡Å¾Å¡Ã¡Å¾Å¸Ã¡Å¸ÂÃ¡Å¾â€“Ã¡Å¸â€™Ã¡Å¾â€˜</label>
              <input className={styles.input} value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="0xx-xxx-xxx" /></div>
            <div><label className={styles.label}>Ã¡Å¾â€¢Ã¡Å¸â€™Ã¡Å¾â€œÃ¡Å¸â€šÃ¡Å¾â‚¬</label>
              <select className={styles.input} value={addForm.dept_id} onChange={e => setAddForm(f => ({ ...f, dept_id: e.target.value }))}>
                <option value="">-- Ã¡Å¾â€¡Ã¡Å¸â€™Ã¡Å¾Å¡Ã¡Å¾Â¾Ã¡Å¾Å¸Ã¡Å¾Å¡Ã¡Å¾Â¾Ã¡Å¾Å¸Ã¡Å¾â€¢Ã¡Å¸â€™Ã¡Å¾â€œÃ¡Å¸â€šÃ¡Å¾â‚¬ --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select></div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleAdd} disabled={saving}>{saving ? "Ã¡Å¾â‚¬Ã¡Å¸â€ Ã¡Å¾â€“Ã¡Å¾Â»Ã¡Å¾â€žÃ¡Å¾Å¡Ã¡Å¾â‚¬Ã¡Å¸â€™Ã¡Å¾Å¸Ã¡Å¾Â¶Ã¡Å¾â€˜Ã¡Å¾Â»Ã¡Å¾â‚¬..." : "Ã¡Å¾Å¡Ã¡Å¾â‚¬Ã¡Å¸â€™Ã¡Å¾Å¸Ã¡Å¾Â¶Ã¡Å¾â€˜Ã¡Å¾Â»Ã¡Å¾â‚¬"}</button>
            <button className={styles.cancelBtn} onClick={() => setShowAdd(false)}>Ã¡Å¾â€Ã¡Å¸â€žÃ¡Å¸â€¡Ã¡Å¾â€Ã¡Å¾â€žÃ¡Å¸â€¹</button>
          </div>
        </div>
      )}

      {editEmp && (
        <div className={styles.formBox}>
          <h3 className={styles.formTitle}>Ã¡Å¾â‚¬Ã¡Å¸â€šÃ¡Å¾â€Ã¡Å¸â€™Ã¡Å¾Å¡Ã¡Å¸â€š Ã¢â‚¬â€ V{String(editEmp.emp_id).padStart(3, "0")}</h3>
          <div className={styles.formGrid}>
            <div><label className={styles.label}>Ã¡Å¾Ë†Ã¡Å¸â€™Ã¡Å¾ËœÃ¡Å¸â€žÃ¡Å¸â€¡ *</label>
              <input className={styles.input} value={form.emp_name} onChange={e => setForm(f => ({ ...f, emp_name: e.target.value }))} /></div>
            <div><label className={styles.label}>Ã¡Å¾ÂÃ¡Å¾Â½Ã¡Å¾â€œÃ¡Å¾Â¶Ã¡Å¾â€˜Ã¡Å¾Â¸</label>
              <input className={styles.input} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
            <div><label className={styles.label}>Ã¡Å¾â€ºÃ¡Å¸ÂÃ¡Å¾ÂÃ¡Å¾â€˜Ã¡Å¾Â¼Ã¡Å¾Å¡Ã¡Å¾Å¸Ã¡Å¸ÂÃ¡Å¾â€“Ã¡Å¸â€™Ã¡Å¾â€˜</label>
              <input className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
            <div><label className={styles.label}>Ã¡Å¾â€¢Ã¡Å¸â€™Ã¡Å¾â€œÃ¡Å¸â€šÃ¡Å¾â‚¬</label>
              <select className={styles.input} value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}>
                <option value="">-- Ã¡Å¾â€¡Ã¡Å¸â€™Ã¡Å¾Å¡Ã¡Å¾Â¾Ã¡Å¾Å¸Ã¡Å¾Å¡Ã¡Å¾Â¾Ã¡Å¾Å¸ --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select></div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleEdit} disabled={saving}>{saving ? "Ã¡Å¾â‚¬Ã¡Å¸â€ Ã¡Å¾â€“Ã¡Å¾Â»Ã¡Å¾â€žÃ¡Å¾Å¡Ã¡Å¾â‚¬Ã¡Å¸â€™Ã¡Å¾Å¸Ã¡Å¾Â¶Ã¡Å¾â€˜Ã¡Å¾Â»Ã¡Å¾â‚¬..." : "Ã°Å¸â€™Â¾ Ã¡Å¾Å¡Ã¡Å¾â‚¬Ã¡Å¸â€™Ã¡Å¾Å¸Ã¡Å¾Â¶Ã¡Å¾â€˜Ã¡Å¾Â»Ã¡Å¾â‚¬"}</button>
            <button className={styles.cancelBtn} onClick={() => setEditEmp(null)}>Ã¡Å¾â€Ã¡Å¸â€žÃ¡Å¸â€¡Ã¡Å¾â€Ã¡Å¾â€žÃ¡Å¸â€¹</button>
          </div>
        </div>
      )}

      {tab === "employees" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead><tr><th>ID</th><th>Ã¡Å¾Ë†Ã¡Å¸â€™Ã¡Å¾ËœÃ¡Å¸â€žÃ¡Å¸â€¡</th><th>Ã¡Å¾ÂÃ¡Å¾Â½Ã¡Å¾â€œÃ¡Å¾Â¶Ã¡Å¾â€˜Ã¡Å¾Â¸</th><th>Ã¡Å¾â€¢Ã¡Å¸â€™Ã¡Å¾â€œÃ¡Å¸â€šÃ¡Å¾â‚¬</th><th>Ã¡Å¾â€ºÃ¡Å¸ÂÃ¡Å¾ÂÃ¡Å¾â€˜Ã¡Å¾Â¼Ã¡Å¾Å¡Ã¡Å¾Å¸Ã¡Å¸ÂÃ¡Å¾â€“Ã¡Å¸â€™Ã¡Å¾â€˜</th><th>Actions</th></tr></thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.emp_id}>
                  <td>V{String(emp.emp_id).padStart(3, "0")}</td>
                  <td><div className={styles.empCell}><div className={styles.avatar}>{emp.emp_name?.[0]?.toUpperCase()}</div><span>{emp.emp_name}</span></div></td>
                  <td>{emp.position ?? "Ã¢â‚¬â€"}</td>
                  <td>{emp.dept_name ?? "Ã¢â‚¬â€"}</td>
                  <td>{emp.phone ?? "Ã¢â‚¬â€"}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => openEdit(emp)}>Ã¢Å“ÂÃ¯Â¸Â</button>
                    <button className={styles.deleteBtn} onClick={() => handleDelete(emp.emp_id)}>Ã°Å¸â€”â€˜Ã¯Â¸Â</button>
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
            <thead><tr><th>Ã¡Å¾â€Ã¡Å¾Â»Ã¡Å¾â€šÃ¡Å¸â€™Ã¡Å¾â€šÃ¡Å¾â€ºÃ¡Å¾Â·Ã¡Å¾â‚¬</th><th>Ã¡Å¾â€Ã¡Å¸â€™Ã¡Å¾Å¡Ã¡Å¾â€”Ã¡Å¸ÂÃ¡Å¾â€˜</th><th>Ã¡Å¾â€¦Ã¡Å¾Â¶Ã¡Å¾â€Ã¡Å¸â€¹Ã¡Å¾â€“Ã¡Å¾Â¸</th><th>Ã¡Å¾Å Ã¡Å¾â€ºÃ¡Å¸â€¹</th><th>Ã¡Å¾Â Ã¡Å¸ÂÃ¡Å¾ÂÃ¡Å¾Â»</th><th>Ã¡Å¾Å¸Ã¡Å¸â€™Ã¡Å¾ÂÃ¡Å¾Â¶Ã¡Å¾â€œÃ¡Å¾â€”Ã¡Å¾Â¶Ã¡Å¾â€“</th><th>Actions</th></tr></thead>
            <tbody>
              {leaves.map(lv => (
                <tr key={lv.leave_id}>
                  <td>{lv.emp_name ?? "Ã¢â‚¬â€"}</td>
                  <td>{lv.type_name ?? "Ã¢â‚¬â€"}</td>
                  <td>{lv.start_date}</td>
                  <td>{lv.end_date}</td>
                  <td>{lv.reason ?? "Ã¢â‚¬â€"}</td>
                  <td>{lv.status}</td>
                  <td>
                    <button className={styles.editBtn} onClick={() => handleLeaveStatus(lv.leave_id, "Approved")}>Ã¢Å“â€¦</button>
                    <button className={styles.deleteBtn} onClick={() => handleLeaveStatus(lv.leave_id, "Rejected")}>Ã¢ÂÅ’</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
