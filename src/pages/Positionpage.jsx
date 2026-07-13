import React, { useState, useEffect } from "react";
import { positionApi, deptApi, employeeApi } from "../services/api";

export default function PositionPage() {
  const [positions, setPositions] = useState([]);
  const [depts,     setDepts]     = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [modal,     setModal]     = useState(null);
  const [form,      setForm]      = useState({ pos_name: "", dept_id: "" });
  const [saving,    setSaving]    = useState(false);
  const [error,     setError]     = useState("");
  const [expandedId, setExpandedId] = useState(null); // pos_id currently showing employee list

  useEffect(() => {
    Promise.all([positionApi.getAll(), deptApi.getAll(), employeeApi.getAll()])
      .then(([p, d, e]) => { setPositions(p); setDepts(d); setEmployees(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Match employees to a position by name (employee.position is free text matching pos_name)
  const employeesForPosition = (posName) =>
    employees.filter(e => (e.position ?? "").trim().toLowerCase() === posName.trim().toLowerCase());

  const filtered = positions.filter(p => {
    const matchSearch = p.pos_name.toLowerCase().includes(search.toLowerCase());
    const matchDept   = deptFilter === "all" || String(p.dept_id) === String(deptFilter);
    return matchSearch && matchDept;
  });

  const openAdd  = () => { setForm({ pos_name: "", dept_id: depts[0]?.dept_id ?? "" }); setError(""); setModal("add"); };
  const openEdit = (p) => { setForm({ pos_name: p.pos_name, dept_id: p.dept_id ?? "" }); setError(""); setModal(p); };

  const handleSave = async () => {
    if (!form.pos_name.trim()) { setError("សូមបញ្ចូលឈ្មោះមុខងារ"); return; }
    setSaving(true); setError("");
    try {
      if (modal === "add") {
        const result = await positionApi.create(form);
        setPositions(prev => [result, ...prev]);
      } else {
        const result = await positionApi.update(modal.pos_id, form);
        setPositions(prev => prev.map(p => p.pos_id === modal.pos_id ? result : p));
      }
      setModal(null);
    } catch (err) {
      setError(err.message || "មានបញ្ហា");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("លុបមុខងារនេះ?")) return;
    await positionApi.delete(id);
    setPositions(prev => prev.filter(p => p.pos_id !== id));
  };

  const toggleExpand = (id) => setExpandedId(prev => prev === id ? null : id);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>
              {modal === "add" ? "➕ បន្ថែមមុខងារ" : "✏️ កែមុខងារ"}
            </h3>
            {error && <div style={{ background: "#fee2e2", color: "#e63946", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>⚠️ {error}</div>}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>ឈ្មោះមុខងារ *</label>
              <input
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                placeholder="ឧ. Manager, Engineer, HR Officer..."
                value={form.pos_name}
                onChange={e => setForm(f => ({ ...f, pos_name: e.target.value }))}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>ផ្នែកការងារ</label>
              <select
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }}
                value={form.dept_id}
                onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}
              >
                <option value="">-- គ្មានផ្នែក --</option>
                {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
              </select>
            </div>

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>👤 មុខងារ (Position)</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>គ្រប់គ្រងមុខងាររបស់បុគ្គលិក</p>
        </div>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1a3a8f", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          + បន្ថែមមុខងារ
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
          <input
            style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
            placeholder="ស្វែងរកមុខងារ..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          style={{ padding: "10px 14px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, background: "#fff" }}
          value={deptFilter}
          onChange={e => setDeptFilter(e.target.value)}
        >
          <option value="all">ផ្នែកទាំងអស់</option>
          {depts.map(d => <option key={d.dept_id} value={d.dept_id}>{d.dept_name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textAlign: "left" }}>
              <th style={{ padding: "12px 16px" }}>#</th>
              <th style={{ padding: "12px 16px" }}>ឈ្មោះមុខងារ</th>
              <th style={{ padding: "12px 16px" }}>ផ្នែកការងារ</th>
              <th style={{ padding: "12px 16px" }}>បុគ្គលិក</th>
              <th style={{ padding: "12px 16px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
                {positions.length === 0 ? "មិនទាន់មានមុខងារ" : "រកមិនឃើញ"}
              </td></tr>
            ) : filtered.map((p, i) => {
              const empList   = employeesForPosition(p.pos_name);
              const isExpanded = expandedId === p.pos_id;
              return (
                <React.Fragment key={p.pos_id}>
                  <tr style={{ borderTop: "1px solid #f3f4f6" }}>
                    <td style={{ padding: "12px 16px", color: "#9ca3af" }}>{i + 1}</td>
                    <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a2e" }}>👤 {p.pos_name}</td>
                    <td style={{ padding: "12px 16px" }}>
                      {p.dept_name
                        ? <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>{p.dept_name}</span>
                        : <span style={{ color: "#9ca3af", fontSize: 12 }}>—</span>
                      }
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button
                        onClick={() => toggleExpand(p.pos_id)}
                        disabled={empList.length === 0}
                        style={{
                          background: empList.length > 0 ? "#d1fae5" : "#f3f4f6",
                          color: empList.length > 0 ? "#065f46" : "#9ca3af",
                          padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                          border: "none", cursor: empList.length > 0 ? "pointer" : "default",
                        }}
                      >
                        {empList.length} នាក់ {empList.length > 0 && (isExpanded ? "▲" : "▼")}
                      </button>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => openEdit(p)} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 12 }}>✏️</button>
                        <button onClick={() => handleDelete(p.pos_id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#e63946", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && empList.length > 0 && (
                    <tr>
                      <td colSpan={5} style={{ padding: 0, background: "#f8fafc" }}>
                        <div style={{ padding: "12px 16px 14px 56px" }}>
                          {empList.map(emp => (
                            <div key={emp.emp_id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                              <div style={{
                                width: 26, height: 26, borderRadius: "50%", overflow: "hidden",
                                background: "#1a3a8f", color: "#fff", display: "flex", alignItems: "center",
                                justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0,
                              }}>
                                {emp.avatar_url ? (
                                  <img src={emp.avatar_url} alt={emp.emp_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  (emp.emp_name?.[0] ?? "?").toUpperCase()
                                )}
                              </div>
                              <span style={{ fontSize: 13, color: "#374151" }}>{emp.emp_name}</span>
                              {emp.phone && <span style={{ fontSize: 12, color: "#9ca3af" }}>· {emp.phone}</span>}
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}