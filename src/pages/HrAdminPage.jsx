import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { employeeApi, deptApi, leaveApi } from "../services/api";
import styles from "./HrAdminPage.module.css";

const MENU = [
  {
    title: "General",
    items: [
      { label: "Employee", view: "employees" },
      { label: "Career History", disabled: true },
      { label: "Import Career History", disabled: true },
      { label: "Disciplinary", disabled: true },
      { label: "Contract", disabled: true },
      { label: "Accident", disabled: true },
      { label: "Insurance", disabled: true },
      { label: "Personal Family", disabled: true },
      { label: "Training Catalogue Calendar", disabled: true },
    ],
  },
  {
    title: "Leave Management",
    items: [
      { label: "Leave Entitlement", disabled: true },
      { label: "Leave Application", view: "leaves" },
      { label: "Compensatory Work", disabled: true },
      { label: "Resign Balance Pay", disabled: true },
      { label: "Yearly Close Balance", disabled: true },
      { label: "Yearly Process Forward", disabled: true },
      { label: "Yearly Balance Pay", disabled: true },
    ],
  },
  {
    title: "Time and Attendance",
    items: [
      { label: "Import Roster", disabled: true },
      { label: "Roster Template", disabled: true },
      { label: "Employee Roster", disabled: true },
      { label: "Attendance Check", route: "/attendance" },
      { label: "Generate In/Out", disabled: true },
      { label: "Monthly Summary", disabled: true },
      { label: "Download Attendance", disabled: true },
    ],
  },
];

export default function HrAdminPage() {
  const navigate = useNavigate();
  const [view, setView] = useState("menu");
  const [search, setSearch] = useState("");

  const [employees, setEmployees] = useState([]);
  const [depts, setDepts] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const [empSearch, setEmpSearch] = useState("");
  const [modal, setModal] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ emp_name: "", position: "", phone: "", dept_id: "", photo: null });

  useEffect(() => {
    Promise.all([employeeApi.getAll(), deptApi.getAll(), leaveApi.getAll()])
      .then(([emps, dpts, lvs]) => {
        setEmployees(Array.isArray(emps) ? emps : []);
        setDepts(Array.isArray(dpts) ? dpts : []);
        setLeaves(Array.isArray(lvs) ? lvs : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleItemClick = (item) => {
    if (item.disabled) return;
    if (item.route) { navigate(item.route); return; }
    if (item.view) { setView(item.view); return; }
  };

  const filtered = employees.filter(e =>
    (e.emp_name ?? "").toLowerCase().includes(empSearch.toLowerCase()) ||
    (e.position ?? "").toLowerCase().includes(empSearch.toLowerCase())
  );

  const openAdd = () => { setForm({ emp_name: "", position: "", phone: "", dept_id: "", photo: null }); setError(""); setModal("add"); };
  const openEdit = (emp) => {
    setForm({ emp_name: emp.emp_name ?? "", position: emp.position ?? "", phone: emp.phone ?? "", dept_id: emp.dept_id ?? "", photo: null });
    setError(""); setModal(emp);
  };
  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    if (!form.emp_name.trim()) { setError("សូមបញ្ចូលឈ្មោះបុគ្គលិក"); return; }
    setSaving(true); setError("");
    try {
      let result;
      if (modal === "add") {
        result = await employeeApi.create({ emp_name: form.emp_name, position: form.position, phone: form.phone, dept_id: form.dept_id || null });
        setEmployees(prev => [...prev, result]);
      } else {
        const fd = new FormData();
        fd.append("emp_name", form.emp_name);
        fd.append("position", form.position);
        fd.append("phone", form.phone);
        fd.append("dept_id", form.dept_id);
        if (form.photo) fd.append("photo", form.photo);
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

  const handleLeaveStatus = async (id, status) => {
    await leaveApi.updateStatus(id, status);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status } : l));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;

  // ===== VIEW: MENU =====
  if (view === "menu") {
    const searchLower = search.toLowerCase();
    return (
      <div className={styles.menuWrap}>
        <h2 className={styles.menuTitle}>HR Administration</h2>

        <div className={styles.searchBar}>
          <div className={styles.searchInputWrap}>
            <input
              className={styles.searchInput}
              placeholder="Search function name..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <button className={styles.exploreBtn}>Explore</button>
        </div>

        <div className={styles.menuGrid}>
          {MENU.map(cat => {
            const visibleItems = cat.items.filter(it => it.label.toLowerCase().includes(searchLower));
            if (search && visibleItems.length === 0) return null;
            return (
              <div key={cat.title} className={styles.categoryCard}>
                <div className={styles.categoryTitle}>{cat.title}</div>
                <div className={styles.menuItems}>
                  {visibleItems.map(item => (
                    <div
                      key={item.label}
                      onClick={() => handleItemClick(item)}
                      className={item.disabled ? styles.menuItemDisabled : styles.menuItem}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== VIEW: EMPLOYEES =====
  if (view === "employees") {
    return (
      <div className={styles.page}>
        {modal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h3 className={styles.modalTitle}>
                {modal === "add" ? "បន្ថែមបុគ្គលិក" : "កែបុគ្គលិក"}
              </h3>
              {error && <div className={styles.errorBox}>{error}</div>}
              {[
                { key: "emp_name", label: "ឈ្មោះបុគ្គលិក *", placeholder: "ឧ. សុខ វណ្ណ" },
                { key: "position", label: "មុខងារ", placeholder: "ឧ. Manager, Engineer" },
                { key: "phone", label: "លេខទូរស័ព្ទ", placeholder: "ឧ. 012 345 678" },
              ].map(({ key, label, placeholder }) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label className={styles.fieldLabel}>{label}</label>
                  <input
                    className={styles.fieldInput}
                    placeholder={placeholder}
                    value={form[key]}
                    onChange={set(key)}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label className={styles.fieldLabel}>ផ្នែកការងារ</label>
                <select className={styles.fieldInput} value={form.dept_id} onChange={set("dept_id")}>
                  <option value="">-- គ្មានផ្នែក --</option>
                  {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
                </select>
              </div>
              {modal !== "add" && (
                <div style={{ marginBottom: 14 }}>
                  <label className={styles.fieldLabel}>រូបភាព</label>
                  <input type="file" accept="image/*"
                    onChange={e => setForm(f => ({ ...f, photo: e.target.files[0] ?? null }))}
                    style={{ fontSize: 13 }} />
                </div>
              )}
              <div className={styles.modalActions}>
                <button onClick={() => setModal(null)} className={styles.cancelBtn}>បោះបង់</button>
                <button onClick={handleSave} disabled={saving} className={styles.saveBtn}>
                  {saving ? "កំពុងរក្សា..." : "រក្សាទុក"}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className={styles.header}>
          <div>
            <button onClick={() => setView("menu")} className={styles.backBtn}>← ត្រឡប់ទៅ Menu</button>
            <h2 className={styles.title}>គ្រប់គ្រងបុគ្គលិក</h2>
            <p className={styles.sub}>HR Administration — Employee Management</p>
          </div>
          <button onClick={openAdd} className={styles.addBtn}>+ បន្ថែមបុគ្គលិក</button>
        </div>

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

        <div className={styles.filters}>
          <div className={styles.searchWrap}>
            <input
              className={styles.search}
              placeholder="ស្វែងរកឈ្មោះ ឬ មុខងារ..."
              value={empSearch}
              onChange={e => setEmpSearch(e.target.value)}
            />
          </div>
        </div>

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
              ) : filtered.map((e) => (
                <tr key={e.emp_id} style={{ borderTop: "1px solid #f3f4f6" }}>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div className={styles.empAvatar}>
                        {e.photo_url
                          ? <img src={e.photo_url} alt="" className={styles.empAvatarImg} />
                          : <span className={styles.empAvatarText}>{(e.emp_name ?? "?")[0]}</span>
                        }
                      </div>
                      <div>
                        <div className={styles.empName}>{e.emp_name}</div>
                        <div className={styles.empId}>ID: {e.emp_id}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", color: "#6b7280" }}>{e.position ?? "—"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    {e.dept_name
                      ? <span className={styles.deptBadge}>{e.dept_name}</span>
                      : <span style={{ color: "#9ca3af" }}>—</span>
                    }
                  </td>
                  <td style={{ padding: "10px 16px", color: "#6b7280" }}>{e.phone ?? "—"}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <div className={styles.rowActions}>
                      <button onClick={() => openEdit(e)} className={styles.smallBtn}>Edit</button>
                      <button onClick={() => handleDelete(e.emp_id)} className={styles.smallDeleteBtn}>Delete</button>
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

  // ===== VIEW: LEAVES =====
  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <button onClick={() => setView("menu")} className={styles.backBtn}>← ត្រឡប់ទៅ Menu</button>
          <h2 className={styles.title}>ច្បាប់ឈប់សម្រាក</h2>
          <p className={styles.sub}>Leave Management — Applications</p>
        </div>
      </div>

      <div className={styles.tableCard}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textAlign: "left" }}>
              <th style={{ padding: "10px 16px" }}>បុគ្គលិក</th>
              <th style={{ padding: "10px 16px" }}>ប្រភេទ</th>
              <th style={{ padding: "10px 16px" }}>ចាប់ពី</th>
              <th style={{ padding: "10px 16px" }}>ដល់</th>
              <th style={{ padding: "10px 16px" }}>ហេតុផល</th>
              <th style={{ padding: "10px 16px" }}>ស្ថានភាព</th>
              <th style={{ padding: "10px 16px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>គ្មានសំណើច្បាប់</td></tr>
            ) : leaves.map(lv => (
              <tr key={lv.leave_id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "10px 16px", fontWeight: 600 }}>{lv.emp_name ?? "—"}</td>
                <td style={{ padding: "10px 16px" }}>{lv.type_name ?? "—"}</td>
                <td style={{ padding: "10px 16px" }}>{lv.start_date}</td>
                <td style={{ padding: "10px 16px" }}>{lv.end_date}</td>
                <td style={{ padding: "10px 16px", color: "#6b7280" }}>{lv.reason ?? "—"}</td>
                <td style={{ padding: "10px 16px" }}>
                  <span className={
                    lv.status === "Approved" ? styles.statusApproved :
                    lv.status === "Rejected" ? styles.statusRejected : styles.statusPending
                  } style={{ padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                    {lv.status}
                  </span>
                </td>
                <td style={{ padding: "10px 16px" }}>
                  <div className={styles.rowActions}>
                    <button onClick={() => handleLeaveStatus(lv.leave_id, "Approved")} className={styles.approveActionBtn}>អនុញ្ញាត</button>
                    <button onClick={() => handleLeaveStatus(lv.leave_id, "Rejected")} className={styles.rejectActionBtn}>បដិសេធ</button>
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