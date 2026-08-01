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
    if (!form.emp_name.trim()) return alert("Please enter name");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("emp_name", form.emp_name);
      fd.append("position", form.position || "");
      fd.append("dept_id", form.dept_id || "");
      fd.append("phone", form.phone || "");
      const res = await fetch("https://my-system-vp4o.onrender.com/api/employees/" + editEmp.emp_id, {
        method: "PUT", headers: { Accept: "application/json" }, body: fd,
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message ?? "Error");
      setEmployees(prev => prev.map(e => e.emp_id === editEmp.emp_id ? data : e));
      setEditEmp(null);
    } catch { alert("Cannot connect to server"); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.emp_name.trim()) return alert("Please enter name");
    setSaving(true);
    try {
      const res = await fetch("https://my-system-vp4o.onrender.com/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message ?? "Error");
      setEmployees(prev => [...prev, data]);
      setAddForm({ emp_name: "", position: "", dept_id: "", phone: "" });
      setShowAdd(false);
    } catch { alert("Cannot connect to server"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await employeeApi.delete(id);
    setEmployees(prev => prev.filter(e => e.emp_id !== id));
  };

  const handleLeaveStatus = async (id, status) => {
    await leaveApi.updateStatus(id, status);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status } : l));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>HR Administration</h2>
          <p className={styles.sub}>Manage employees and leave requests</p>
        </div>
        <button className={styles.addBtn} onClick={() => { setShowAdd(true); setEditEmp(null); }}>
          + Add Employee
        </button>
      </div>

      <div className={styles.tabs}>
        <button className={styles.tab + (tab === "employees" ? " " + styles.active : "")} onClick={() => setTab("employees")}>
          HR Admin
        </button>
        <button className={styles.tab + (tab === "employees" ? " " + styles.active : "")} onClick={() => setTab("employees")}>
          Employees ({employees.length})
        </button>
        <button className={styles.tab + (tab === "leaves" ? " " + styles.active : "")} onClick={() => setTab("leaves")}>
          Leave ({leaves.length})
        </button>
        <button className={styles.tab + (tab === "time" ? " " + styles.active : "")} onClick={() => setTab("time")}>
          Attendance
        </button>
      </div>

      {showAdd && (
        <div className={styles.formBox}>
          <h3 className={styles.formTitle}>Add New Employee</h3>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Name *</label>
              <input className={styles.input} value={addForm.emp_name} onChange={e => setAddForm(f => ({ ...f, emp_name: e.target.value }))} placeholder="Employee name" />
            </div>
            <div>
              <label className={styles.label}>Position</label>
              <input className={styles.input} value={addForm.position} onChange={e => setAddForm(f => ({ ...f, position: e.target.value }))} placeholder="Manager, Staff..." />
            </div>
            <div>
              <label className={styles.label}>Phone</label>
              <input className={styles.input} value={addForm.phone} onChange={e => setAddForm(f => ({ ...f, phone: e.target.value }))} placeholder="0xx-xxx-xxx" />
            </div>
            <div>
              <label className={styles.label}>Department</label>
              <select className={styles.input} value={addForm.dept_id} onChange={e => setAddForm(f => ({ ...f, dept_id: e.target.value }))}>
                <option value="">-- Select Department --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleAdd} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button className={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {editEmp && (
        <div className={styles.formBox}>
          <h3 className={styles.formTitle}>Edit Employee - V{String(editEmp.emp_id).padStart(3, "0")}</h3>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Name *</label>
              <input className={styles.input} value={form.emp_name} onChange={e => setForm(f => ({ ...f, emp_name: e.target.value }))} />
            </div>
            <div>
              <label className={styles.label}>Position</label>
              <input className={styles.input} value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} />
            </div>
            <div>
              <label className={styles.label}>Phone</label>
              <input className={styles.input} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
            <div>
              <label className={styles.label}>Department</label>
              <select className={styles.input} value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}>
                <option value="">-- Select --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>
          </div>
          <div className={styles.formActions}>
            <button className={styles.saveBtn} onClick={handleEdit} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
            <button className={styles.cancelBtn} onClick={() => setEditEmp(null)}>Cancel</button>
          </div>
        </div>
      )}

      {tab === "employees" && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr><th>ID</th><th>Name</th><th>Position</th><th>Department</th><th>Phone</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {employees.map(emp => (
                <tr key={emp.emp_id}>
                  <td>V{String(emp.emp_id).padStart(3, "0")}</td>
                  <td>
                    <div className={styles.empCell}>
                      <div className={styles.avatar}>{emp.emp_name?.[0]?.toUpperCase()}</div>
                      <span>{emp.emp_name}</span>
                    </div>
                  </td>
                  <td>{emp.position ?? "-"}</td>
                  <td>{emp.dept_name ?? "-"}</td>
                  <td>{emp.phone ?? "-"}</td>
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
            <thead>
              <tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {leaves.map(lv => (
                <tr key={lv.leave_id}>
                  <td>{lv.emp_name ?? "-"}</td>
                  <td>{lv.type_name ?? "-"}</td>
                  <td>{lv.start_date}</td>
                  <td>{lv.end_date}</td>
                  <td>{lv.reason ?? "-"}</td>
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
    </div>
  );
}