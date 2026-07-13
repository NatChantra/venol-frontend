import React, { useState, useEffect } from "react";
import { deptApi } from "../services/api";

export default function DepartmentPage() {
  const [depts,   setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [modal,   setModal]   = useState(null); // null | "add" | dept object
  const [form,    setForm]    = useState({ dept_name: "" });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    deptApi.getAll()
      .then(setDepts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = depts.filter(d =>
    d.dept_name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = () => { setForm({ dept_name: "" }); setError(""); setModal("add"); };
  const openEdit = (d) => { setForm({ dept_name: d.dept_name }); setError(""); setModal(d); };

  const handleSave = async () => {
    if (!form.dept_name.trim()) { setError("សូមបញ្ចូលឈ្មោះផ្នែក"); return; }
    setSaving(true); setError("");
    try {
      if (modal === "add") {
        const result = await deptApi.create(form);
        setDepts(prev => [result, ...prev]);
      } else {
        const result = await deptApi.update(modal.dept_id, form);
        setDepts(prev => prev.map(d => d.dept_id === modal.dept_id ? result : d));
      }
      setModal(null);
    } catch (err) {
      setError(err.message || "មានបញ្ហា");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("លុបផ្នែកការងារនេះ?")) return;
    await deptApi.delete(id);
    setDepts(prev => prev.filter(d => d.dept_id !== id));
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>
              {modal === "add" ? "➕ បន្ថែមផ្នែកការងារ" : "✏️ កែផ្នែកការងារ"}
            </h3>
            {error && <div style={{ background: "#fee2e2", color: "#e63946", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>⚠️ {error}</div>}
            <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>ឈ្មោះផ្នែក *</label>
            <input
              style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
              placeholder="ឧ. HR, IT, Finance..."
              value={form.dept_name}
              onChange={e => setForm({ dept_name: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleSave()}
              autoFocus
            />
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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>🏢 ផ្នែកការងារ (Department)</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>គ្រប់គ្រងផ្នែកការងាររបស់ក្រុមហ៊ុន</p>
        </div>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1a3a8f", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          + បន្ថែមផ្នែក
        </button>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 20 }}>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#1a3a8f" }}>{depts.length}</div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>ផ្នែកសរុប</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#2cb67d" }}>
            {depts.reduce((s, d) => s + (d.emp_count ?? 0), 0)}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>បុគ្គលិកសរុប</div>
        </div>
        <div style={{ background: "#fff", borderRadius: 12, padding: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "#f4a261" }}>
            {depts.filter(d => (d.emp_count ?? 0) === 0).length}
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>ផ្នែកទទេ</div>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 16, position: "relative" }}>
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#9ca3af" }}>🔍</span>
        <input
          style={{ width: "100%", padding: "10px 12px 10px 36px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
          placeholder="ស្វែងរកផ្នែក..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textAlign: "left" }}>
              <th style={{ padding: "12px 16px" }}>#</th>
              <th style={{ padding: "12px 16px" }}>ឈ្មោះផ្នែក</th>
              <th style={{ padding: "12px 16px" }}>បុគ្គលិក</th>
              <th style={{ padding: "12px 16px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>
                {depts.length === 0 ? "មិនទាន់មានផ្នែក" : "រកមិនឃើញ"}
              </td></tr>
            ) : filtered.map((d, i) => (
              <tr key={d.dept_id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", color: "#9ca3af" }}>{i + 1}</td>
                <td style={{ padding: "12px 16px", fontWeight: 600, color: "#1a1a2e" }}>
                  🏢 {d.dept_name}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                    {d.emp_count ?? 0} នាក់
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(d)} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>✏️</button>
                    <button onClick={() => handleDelete(d.dept_id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#e63946", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🗑️</button>
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