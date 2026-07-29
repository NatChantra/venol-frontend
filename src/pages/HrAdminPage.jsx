import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi, leaveApi, deptApi } from "../services/api";
import styles from "./HrAdminPage.module.css";

const API = window.location.hostname === "localhost"
  ? "http://localhost:8000/api"
  : `${window.location.origin}/api`;

const COLORS = ["#1a3a8f","#2cb67d","#f4a261","#e63946","#9ca3af","#4895ef"];

const STATUS_STYLE = {
  "On Time": { background: "#d1fae5", color: "#065f46" },
  "Late":    { background: "#ffedd5", color: "#9a3412" },
  "Absent":  { background: "#fee2e2", color: "#991b1b" },
};

const HR_MODULES = {
  general: [
    { name: "Employee" },
    { name: "Career History" },
    { name: "Import Career History" },
    { name: "Disciplinary" },
    { name: "Contract" },
    { name: "Accident" },
    { name: "Insurance" },
    { name: "Personal Family" },
    { name: "Training Catalogue Calendar" },
  ],
  leave: [
    { name: "Leave Entitlement" },
    { name: "Leave Application" },
    { name: "Compensatory Work" },
    { name: "Resign Balance Pay" },
    { name: "Yearly Close Balance" },
    { name: "Yearly Process Forward" },
    { name: "Yearly Balance Pay" },
  ],
  time: [
    { name: "Import Roster" },
    { name: "Roster Template"},
    { name: "Employee Roster" },
    { name: "Attendance Check"},
    { name: "Generate In/Out" },
  ],
  
};

export default function HrAdminPage() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const [leaves,    setLeaves]    = useState([]);
  const [depts,     setDepts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("hr");
  const [search,    setSearch]    = useState("");
  const [openGeneral, setOpenGeneral] = useState(true);
  const [openLeave,   setOpenLeave]   = useState(true);
  const [openTime,    setOpenTime]    = useState(true);
  const [openHiring,  setOpenHiring]  = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ emp_name: "", position: "", phone: "", dept_id: "" });
  const [saving, setSaving] = useState(false);

  // Attendance states
  const [attRecords,    setAttRecords]    = useState([]);
  const [attTab,        setAttTab]        = useState("today");
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  // Attendance Check states
  const [checkDate,     setCheckDate]     = useState(new Date().toISOString().slice(0, 10));
  const [checkSearch,   setCheckSearch]   = useState("");
  const [statusFilter,  setStatusFilter]  = useState("all");

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    Promise.all([employeeApi.getAll(), leaveApi.getAll(), deptApi.getAll()])
      .then(([emps, lvs, dps]) => { setEmployees(emps); setLeaves(lvs); setDepts(dps); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const loadAttendance = async () => {
    try {
      const res  = await fetch(`${API}/attendance`, { headers: { "Accept": "application/json" } });
      const data = await res.json();
      setAttRecords(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === "attendance") loadAttendance();
  }, [activeTab]);

  const todayRecords   = attRecords.filter(r => r.date === today);
  const historyRecords = attRecords.filter(r => r.date !== today);

  // Monthly Summary
  const monthlyRecords = attRecords.filter(r => r.date?.startsWith(selectedMonth));
  const monthlySummary = employees.map(emp => {
    const empRecords = monthlyRecords.filter(r => r.emp_id === emp.emp_id);
    return { ...emp, present: empRecords.length, late: empRecords.filter(r => r.status === "Late").length, onTime: empRecords.filter(r => r.status === "On Time").length };
  });

  // Attendance Check
  const attForDate = attRecords.filter(r => r.date === checkDate);
  const merged = employees.map(emp => {
    const att = attForDate.find(a => a.emp_id === emp.emp_id);
    return {
      emp_id:   emp.emp_id,
      emp_name: emp.emp_name,
      position: emp.position ?? "ΓÇö",
      time_in:  att?.time_in  ?? null,
      time_out: att?.time_out ?? null,
      status:   att?.time_in ? (att?.status ?? "On Time") : "Absent",
    };
  });

  const filteredCheck = merged.filter(r => {
    const matchSearch = r.emp_name.toLowerCase().includes(checkSearch.toLowerCase());
    const matchStatus =
      statusFilter === "all"     ? true :
      statusFilter === "present" ? r.time_in !== null :
      statusFilter === "absent"  ? r.time_in === null :
      statusFilter === "late"    ? r.status === "Late" : true;
    return matchSearch && matchStatus;
  });

  const present = merged.filter(r => r.time_in !== null).length;
  const absent  = merged.filter(r => r.time_in === null).length;
  const late    = merged.filter(r => r.status === "Late").length;
  const total   = employees.length;

  const handleDownloadAttendance = async () => {
    try {
      const res  = await fetch(`${API}/attendance`, { headers: { "Accept": "application/json" } });
      const data = await res.json();
      const csv  = ["emp_id,emp_name,date,time_in,time_out,status", ...data.map(r => `${r.emp_id},${r.emp_name},${r.date},${r.time_in ?? ""},${r.time_out ?? ""},${r.status}`)].join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a"); a.href = url; a.download = `attendance_${today}.csv`; a.click();
    } catch (err) { alert("Download ß₧ÿß₧╢ß₧ôß₧öß₧ëßƒÆß₧áß₧╢!"); }
  };

  const handleAddEmployee = async () => {
    if (!form.emp_name.trim()) return;
    setSaving(true);
    try {
      const newEmp = await employeeApi.create(form);
      setEmployees(prev => [...prev, newEmp]);
      setForm({ emp_name: "", position: "", phone: "", dept_id: "" });
      setShowForm(false);
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("ß₧¢ß₧╗ß₧öß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Çß₧ôßƒüßƒç?")) return;
    await employeeApi.delete(id);
    setEmployees(prev => prev.filter(e => e.emp_id !== id));
  };

  const handleLeaveStatus = async (id, status) => {
    const updated = await leaveApi.updateStatus(id, status);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status: updated.status } : l));
  };

  const statusColor = (s) => ({
    "Pending":  { background: "#fef9c3", color: "#854d0e" },
    "Approved": { background: "#d1fae5", color: "#065f46" },
    "Rejected": { background: "#fee2e2", color: "#991b1b" },
  }[s] || {});

  const attStatusColor = (s) =>
    s === "On Time" ? "#2cb67d" : s === "Late" ? "#f4a261" : "#e63946";

  const filterModules = (list) =>
    list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const handleModuleClick = (m) => {
    if (m.name === "Employee")          setActiveTab("employees");
    if (m.name === "Leave Application") setActiveTab("leaves");
    if (m.name === "Employee Roster")   setActiveTab("employees");
    if (m.name === "Attendance Check")  { setActiveTab("attendance"); setAttTab("check"); loadAttendance(); }
    if (m.name === "Generate In/Out")   { setActiveTab("attendance"); setAttTab("today"); loadAttendance(); }
  };

  const ModuleItem = ({ m }) => (
    <div onClick={() => handleModuleClick(m)}
      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 4px", borderBottom: "1px solid #f3f4f6", cursor: "pointer", borderRadius: 6 }}
      onMouseEnter={e => e.currentTarget.style.background = "#f9fafb"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
      <span style={{ fontSize: 13, color: "#374151" }}>{m.icon} {m.name}</span>
      <span style={{ color: "#9ca3af", fontSize: 18 }}>Γèò</span>
    </div>
  );

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>ß₧Çßƒåß₧ûß₧╗ß₧äß₧òßƒÆß₧æß₧╗ß₧Ç...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>HR Administration</h2>
          <p className={styles.sub}>ß₧éßƒÆß₧Üß₧ößƒïß₧éßƒÆß₧Üß₧äß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç ß₧ôß₧╖ß₧ä ß₧àßƒÆß₧öß₧╢ß₧ößƒïß₧êß₧ößƒïß₧ƒß₧ÿßƒÆß₧Üß₧╢ß₧Ç</p>
        </div>
        {activeTab === "employees" && (
          <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
            {showForm ? "Γ£ò ß₧öß₧╖ß₧æ" : "+ ß₧öß₧ôßƒÆß₧Éßƒéß₧ÿß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç"}
          </button>
        )}
      </div>

      {activeTab !== "hr" && (
        <button onClick={() => { setActiveTab("hr"); setShowForm(false); }}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#1a3a8f", fontWeight: 600, fontSize: 14, marginBottom: 12, padding: "6px 0" }}>
          ΓåÉ ß₧ÅßƒÆß₧Üß₧íß₧ößƒï HR Admin
        </button>
      )}

      <div className={styles.tabs}>
        <button className={activeTab === "hr"         ? styles.tabActive : styles.tab} onClick={() => setActiveTab("hr")}>≡ƒÅó HR Admin</button>
        <button className={activeTab === "employees"  ? styles.tabActive : styles.tab} onClick={() => setActiveTab("employees")}>≡ƒæÑ ß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç ({employees.length})</button>
        <button className={activeTab === "leaves"     ? styles.tabActive : styles.tab} onClick={() => setActiveTab("leaves")}>≡ƒôà ß₧àßƒÆß₧öß₧╢ß₧ößƒï ({leaves.length})</button>
        <button className={activeTab === "attendance" ? styles.tabActive : styles.tab} onClick={() => { setActiveTab("attendance"); loadAttendance(); }}>ΓÅ░ ß₧£ß₧ÅßƒÆß₧Åß₧ÿß₧╢ß₧ô</button>
      </div>

      {/* HR Admin Tab */}
      {activeTab === "hr" && (
        <div>
          <div style={{ background: "linear-gradient(135deg, #1a3a8f, #4895ef)", borderRadius: 12, padding: "20px 24px", marginBottom: 24, display: "flex", gap: 12, alignItems: "center" }}>
            <input style={{ flex: 1, padding: "10px 16px", borderRadius: 8, border: "none", fontSize: 14, outline: "none" }}
              placeholder="Search function name..." value={search} onChange={e => setSearch(e.target.value)} />
            <button style={{ padding: "10px 20px", background: "#e63946", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 700 }}>Explore</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {[
              { label: " General",            color: "#1a3a8f", key: "general", open: openGeneral, setOpen: setOpenGeneral },
              { label: " Leave Management",    color: "#2cb67d", key: "leave",   open: openLeave,   setOpen: setOpenLeave   },
              { label: " Time and Attendance", color: "#f4a261", key: "time",    open: openTime,    setOpen: setOpenTime    },
            ].map(({ label, color, key, open, setOpen }) => (
              <div key={key} style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, cursor: "pointer" }} onClick={() => setOpen(v => !v)}>
                  <span style={{ fontWeight: 700, color, fontSize: 14 }}>{label}</span>
                  <span>{open ? "Γû▓" : "Γû╝"}</span>
                </div>
                {open && filterModules(HR_MODULES[key]).map((m, i) => <ModuleItem key={i} m={m} />)}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <>
          {showForm && (
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>ß₧öß₧ôßƒÆß₧Éßƒéß₧ÿß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Çß₧ÉßƒÆß₧ÿß₧╕</h3>
              <div className={styles.formRow}>
                <div className={styles.formGroup}><label>ß₧êßƒÆß₧ÿßƒäßƒç *</label><input value={form.emp_name} onChange={e => setForm({...form, emp_name: e.target.value})} placeholder="ß₧êßƒÆß₧ÿßƒäßƒçß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç" /></div>
                <div className={styles.formGroup}><label>ß₧Åß₧╜ß₧ôß₧╢ß₧æß₧╕</label><input value={form.position} onChange={e => setForm({...form, position: e.target.value})} placeholder="Manager, Staff..." /></div>
                <div className={styles.formGroup}><label>ß₧¢ßƒüß₧üß₧æß₧╝ß₧Üß₧ƒßƒÉß₧ûßƒÆß₧æ</label><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0xx-xxx-xxx" /></div>
                <div className={styles.formGroup}>
                  <label>ß₧òßƒÆß₧ôßƒéß₧Ç</label>
                  <select value={form.dept_id} onChange={e => setForm({...form, dept_id: e.target.value})}>
                    <option value="">-- ß₧çßƒÆß₧Üß₧╛ß₧ƒß₧òßƒÆß₧ôßƒéß₧Ç --</option>
                    {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
                  </select>
                </div>
              </div>
              <button className={styles.submitBtn} onClick={handleAddEmployee} disabled={saving}>
                {saving ? "ß₧Çßƒåß₧ûß₧╗ß₧äß₧Üß₧ÇßƒÆß₧ƒß₧╢ß₧æß₧╗ß₧Ç..." : " ß₧Üß₧ÇßƒÆß₧ƒß₧╢ß₧æß₧╗ß₧Ç"}
              </button>
            </div>
          )}
          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead><tr><th>emp_id</th><th>ß₧êßƒÆß₧ÿßƒäßƒç</th><th>ß₧Åß₧╜ß₧ôß₧╢ß₧æß₧╕</th><th>ß₧òßƒÆß₧ôßƒéß₧Ç</th><th>ß₧¢ßƒüß₧üß₧æß₧╝ß₧Üß₧ƒßƒÉß₧ûßƒÆß₧æ</th><th>Actions</th></tr></thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={6} className={styles.empty}>ß₧éßƒÆß₧ÿß₧╢ß₧ôß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç</td></tr>
                ) : employees.map((e, i) => (
                  <tr key={e.emp_id}>
                    <td style={{ color: "#9ca3af", fontSize: 12 }}>{e.emp_id}</td>
                    <td><div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: COLORS[i % COLORS.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{e.emp_name?.[0]}</div>
                      <span style={{ fontWeight: 600 }}>{e.emp_name}</span>
                    </div></td>
                    <td style={{ color: "#6b7280" }}>{e.position ?? "ΓÇö"}</td>
                    <td>{e.dept_name ? <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{e.dept_name}</span> : "ΓÇö"}</td>
                    <td style={{ color: "#6b7280" }}>{e.phone ?? "ΓÇö"}</td>
                    <td><button className={styles.deleteBtn} onClick={() => handleDeleteEmployee(e.emp_id)}>≡ƒùæ∩╕Å</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <div>
          <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
            {[
              { key: "check",   label: " Attendance Check" },
              { key: "today",   label: ` ß₧ÉßƒÆß₧äßƒâß₧ôßƒüßƒç (${todayRecords.length})` },
              { key: "history", label: "ß₧ößƒÆß₧Üß₧£ß₧ÅßƒÆß₧Åß₧╖" },
              { key: "monthly", label: " Monthly" },
            ].map(t => (
              <button key={t.key} onClick={() => setAttTab(t.key)}
                style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, background: attTab === t.key ? "#1a3a8f" : "#f3f4f6", color: attTab === t.key ? "#fff" : "#374151" }}>
                {t.label}
              </button>
            ))}
            <button onClick={handleDownloadAttendance}
              style={{ padding: "8px 16px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, background: "#2cb67d", color: "#fff" }}>
               Download CSV
            </button>
          </div>

          {/* Attendance Check */}
          {attTab === "check" && (
            <div className={styles.tableCard}>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
                <input type="date" value={checkDate} onChange={e => { setCheckDate(e.target.value); setStatusFilter("all"); setCheckSearch(""); }}
                  style={{ padding: "8px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
                <button onClick={() => setCheckDate(today)}
                  style={{ padding: "8px 14px", borderRadius: 8, border: "1.5px solid #1a3a8f", color: "#1a3a8f", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  ß₧ÉßƒÆß₧äßƒâß₧ôßƒüßƒç
                </button>
              </div>

              {/* Summary Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "EMPLOYEES", value: total,   color: "#1a3a8f", key: "all" },
                  { label: "PRESENT",   value: present, color: "#2cb67d", key: "present" },
                  { label: "ABSENT",    value: absent,  color: "#e63946", key: "absent" },
                  { label: "LATE",      value: late,    color: "#f4a261", key: "late" },
                ].map(c => (
                  <div key={c.key} onClick={() => setStatusFilter(statusFilter === c.key ? "all" : c.key)}
                    style={{ background: statusFilter === c.key ? c.color : "#fff", borderRadius: 10, padding: "12px 14px", cursor: "pointer", border: `2px solid ${statusFilter === c.key ? c.color : "#f3f4f6"}` }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: statusFilter === c.key ? "#fff" : c.color }}>{c.value}</div>
                    <div style={{ fontSize: 10, color: statusFilter === c.key ? "rgba(255,255,255,0.8)" : "#6b7280", fontWeight: 600 }}>{c.label}</div>
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#6b7280", marginBottom: 4 }}>
                  <span>ß₧£ß₧ÅßƒÆß₧Åß₧ÿß₧╢ß₧ô {total > 0 ? Math.round((present/total)*100) : 0}%</span>
                  <span>{present}/{total} ß₧ôß₧╢ß₧Çßƒï</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "#f3f4f6" }}>
                  <div style={{ height: "100%", borderRadius: 99, width: `${total > 0 ? (present/total)*100 : 0}%`, background: "#2cb67d" }} />
                </div>
              </div>

              {/* Search */}
              <div style={{ position: "relative", marginBottom: 12 }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>≡ƒöì</span>
                <input style={{ width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 13, boxSizing: "border-box" }}
                  placeholder="ß₧ƒßƒÆß₧£ßƒéß₧äß₧Üß₧Çß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç..." value={checkSearch} onChange={e => setCheckSearch(e.target.value)} />
              </div>

              <table className={styles.table}>
                <thead><tr><th>#</th><th>ß₧êßƒÆß₧ÿßƒäßƒç</th><th>ß₧Åß₧╜ß₧ôß₧╢ß₧æß₧╕</th><th>ß₧ÿßƒëßƒäß₧äß₧àß₧╝ß₧¢</th><th>ß₧ÿßƒëßƒäß₧äß₧àßƒüß₧ë</th><th>ß₧ƒßƒÆß₧Éß₧╢ß₧ôß₧ùß₧╢ß₧û</th></tr></thead>
                <tbody>
                  {filteredCheck.length === 0 ? (
                    <tr><td colSpan={6} className={styles.empty}>ß₧éßƒÆß₧ÿß₧╢ß₧ôß₧æß₧╖ß₧ôßƒÆß₧ôß₧ôßƒÉß₧Ö</td></tr>
                  ) : filteredCheck.map((r, i) => (
                    <tr key={r.emp_id} style={{ background: r.time_in === null ? "#fafafa" : "#fff" }}>
                      <td style={{ color: "#9ca3af" }}>{i + 1}</td>
                      <td style={{ fontWeight: 600 }}>{r.emp_name}</td>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>{r.position}</td>
                      <td style={{ fontWeight: 700, color: r.time_in ? "#2cb67d" : "#e63946" }}>{r.time_in ?? "ΓÇö"}</td>
                      <td style={{ color: r.time_out ? "#1a3a8f" : "#f4a261" }}>{r.time_out ?? (r.time_in ? "ß₧ÿß₧╖ß₧ôß₧æß₧╢ß₧ôßƒïß₧àßƒüß₧ë" : "ΓÇö")}</td>
                      <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, ...(STATUS_STYLE[r.status] ?? { background: "#f3f4f6", color: "#6b7280" }) }}>{r.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Today */}
          {attTab === "today" && (
            <div className={styles.tableCard}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>ß₧£ß₧ÅßƒÆß₧Åß₧ÿß₧╢ß₧ôß₧ÉßƒÆß₧äßƒâß₧ôßƒüßƒç ΓÇö {today}</h3>
              <table className={styles.table}>
                <thead><tr><th>ß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç</th><th>ß₧ÿßƒëßƒäß₧äß₧àß₧╝ß₧¢</th><th>ß₧ÿßƒëßƒäß₧äß₧àßƒüß₧ë</th><th>ß₧ƒßƒÆß₧Éß₧╢ß₧ôß₧ùß₧╢ß₧û</th></tr></thead>
                <tbody>
                  {todayRecords.length === 0 ? (
                    <tr><td colSpan={4} className={styles.empty}>ß₧éßƒÆß₧ÿß₧╢ß₧ôß₧£ß₧ÅßƒÆß₧Åß₧ÿß₧╢ß₧ôß₧ÉßƒÆß₧äßƒâß₧ôßƒüßƒç</td></tr>
                  ) : todayRecords.map((r, i) => (
                    <tr key={r.att_id ?? i}>
                      <td style={{ fontWeight: 600 }}>{r.emp_name ?? r.emp_id}</td>
                      <td>{r.time_in ?? "ΓÇö"}</td>
                      <td>{r.time_out ? r.time_out : <span style={{ color: "#f4a261", fontSize: 12 }}>ß₧ÿß₧╖ß₧ôß₧æß₧╢ß₧ôßƒïß₧àßƒüß₧ë</span>}</td>
                      <td style={{ color: attStatusColor(r.status), fontWeight: 600 }}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* History */}
          {attTab === "history" && (
            <div className={styles.tableCard}>
              <h3 style={{ margin: "0 0 12px", fontSize: 15, fontWeight: 700 }}>ß₧ößƒÆß₧Üß₧£ß₧ÅßƒÆß₧Åß₧╖ß₧£ß₧ÅßƒÆß₧Åß₧ÿß₧╢ß₧ô</h3>
              <table className={styles.table}>
                <thead><tr><th>ß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç</th><th>ß₧Çß₧╢ß₧¢ß₧öß₧Üß₧╖ß₧àßƒÆß₧åßƒüß₧æ</th><th>ß₧ÿßƒëßƒäß₧äß₧àß₧╝ß₧¢</th><th>ß₧ÿßƒëßƒäß₧äß₧àßƒüß₧ë</th><th>ß₧ƒßƒÆß₧Éß₧╢ß₧ôß₧ùß₧╢ß₧û</th></tr></thead>
                <tbody>
                  {historyRecords.length === 0 ? (
                    <tr><td colSpan={5} className={styles.empty}>ß₧éßƒÆß₧ÿß₧╢ß₧ôß₧æß₧╖ß₧ôßƒÆß₧ôß₧ôßƒÉß₧Ö</td></tr>
                  ) : historyRecords.map((r, i) => (
                    <tr key={r.att_id ?? i}>
                      <td style={{ fontWeight: 600 }}>{r.emp_name ?? r.emp_id}</td>
                      <td>{r.date}</td>
                      <td>{r.time_in ?? "ΓÇö"}</td>
                      <td>{r.time_out ? r.time_out : <span style={{ color: "#f4a261", fontSize: 12 }}>ß₧ÿß₧╖ß₧ôß₧æß₧╢ß₧ôßƒïß₧àßƒüß₧ë</span>}</td>
                      <td style={{ color: attStatusColor(r.status), fontWeight: 600 }}>{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Monthly */}
          {attTab === "monthly" && (
            <div className={styles.tableCard}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>≡ƒôè Monthly Summary</h3>
                <input type="month" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }} />
              </div>
              <table className={styles.table}>
                <thead><tr><th>ß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç</th><th>ß₧Åß₧╜ß₧ôß₧╢ß₧æß₧╕</th><th>ß₧ÉßƒÆß₧äßƒâß₧öß₧╢ß₧ôß₧ÿß₧Ç</th><th>ß₧æß₧╢ß₧ôßƒïß₧ÿßƒëßƒäß₧ä</th><th>ß₧Öß₧║ß₧Å</th></tr></thead>
                <tbody>
                  {monthlySummary.filter(e => e.present > 0).length === 0 ? (
                    <tr><td colSpan={5} className={styles.empty}>ß₧éßƒÆß₧ÿß₧╢ß₧ôß₧æß₧╖ß₧ôßƒÆß₧ôß₧ôßƒÉß₧Ö ß₧üßƒé {selectedMonth}</td></tr>
                  ) : monthlySummary.filter(e => e.present > 0).map((e, i) => (
                    <tr key={e.emp_id ?? i}>
                      <td><div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: COLORS[i % COLORS.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{e.emp_name?.[0]}</div>
                        <span style={{ fontWeight: 600 }}>{e.emp_name}</span>
                      </div></td>
                      <td style={{ color: "#6b7280", fontSize: 12 }}>{e.position ?? "ΓÇö"}</td>
                      <td><span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{e.present} ß₧ÉßƒÆß₧äßƒâ</span></td>
                      <td style={{ color: "#2cb67d", fontWeight: 700 }}>{e.onTime}</td>
                      <td style={{ color: "#f4a261", fontWeight: 700 }}>{e.late}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Leaves Tab */}
      {activeTab === "leaves" && (
        <div className={styles.tableCard}>
          <table className={styles.table}>
            <thead><tr><th>ß₧öß₧╗ß₧éßƒÆß₧éß₧¢ß₧╖ß₧Ç</th><th>ß₧ößƒÆß₧Üß₧ùßƒüß₧æ</th><th>ß₧àß₧╢ß₧ößƒïß₧òßƒÆß₧Åß₧╛ß₧ÿ</th><th>ß₧öß₧ëßƒÆß₧àß₧ößƒï</th><th>ß₧ƒßƒÆß₧Éß₧╢ß₧ôß₧ùß₧╢ß₧û</th><th>Actions</th></tr></thead>
            <tbody>
              {leaves.length === 0 ? (
                <tr><td colSpan={6} className={styles.empty}>ß₧éßƒÆß₧ÿß₧╢ß₧ôß₧ƒßƒåß₧Äß₧╛ß₧àßƒÆß₧öß₧╢ß₧ößƒï</td></tr>
              ) : leaves.map(l => (
                <tr key={l.leave_id}>
                  <td style={{ fontWeight: 600 }}>{l.emp_name ?? `emp_id:${l.emp_id}`}</td>
                  <td style={{ color: "#6b7280" }}>{l.leave_type}</td>
                  <td style={{ color: "#6b7280" }}>{l.start_date}</td>
                  <td style={{ color: "#6b7280" }}>{l.end_date}</td>
                  <td><span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, ...statusColor(l.status) }}>{l.status}</span></td>
                  <td>
                    {l.status === "Pending" && (
                      <div style={{ display: "flex", gap: 6 }}>
                        <button className={styles.approveBtn} onClick={() => handleLeaveStatus(l.leave_id, "Approved")}>Γ£à</button>
                        <button className={styles.rejectBtn} onClick={() => handleLeaveStatus(l.leave_id, "Rejected")}>Γ¥î</button>
                      </div>
                    )}
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