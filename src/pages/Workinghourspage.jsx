import React, { useState, useEffect } from "react";
import { workingHoursApi, deptApi } from "../services/api";

const DAYS_OPTIONS = ["Mon-Fri", "Mon-Sat", "Mon-Sun", "Sat-Sun"];

export default function WorkingHoursPage() {
  const [hours,   setHours]   = useState([]);
  const [depts,   setDepts]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({ dept_id: "", start_time: "08:00", end_time: "17:00", days: "Mon-Fri", note: "" });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    Promise.all([workingHoursApi.getAll(), deptApi.getAll()])
      .then(([h, d]) => { setHours(h); setDepts(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const openAdd = () => {
  setForm({ 
    dept_id: depts.length > 0 ? String(depts[0].dept_id) : "", 
    start_time: "08:00", 
    end_time: "17:00", 
    days: "Mon-Fri", 
    note: "" 
  }); 
  setError(""); 
  setModal("add"); 
};
  const openEdit = (h) => { setForm({ dept_id: h.dept_id, start_time: h.start_time, end_time: h.end_time, days: h.days, note: h.note ?? "" }); setError(""); setModal(h); };

  const handleSave = async () => {
    if (!form.dept_id)    { setError("សូមជ្រើសផ្នែក");         return; }
    if (!form.start_time) { setError("សូមបញ្ចូលម៉ោងចូល");    return; }
    if (!form.end_time)   { setError("សូមបញ្ចូលម៉ោងចេញ");    return; }
    setSaving(true); setError("");
    try {
      if (modal === "add") {
        const result = await workingHoursApi.create(form);
        setHours(prev => [result, ...prev]);
      } else {
        const result = await workingHoursApi.update(modal.wh_id, form);
        setHours(prev => prev.map(h => h.wh_id === modal.wh_id ? result : h));
      }
      setModal(null);
    } catch (err) {
      setError(err.message || "មានបញ្ហា");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("លុបម៉ោងធ្វើការនេះ?")) return;
    await workingHoursApi.delete(id);
    setHours(prev => prev.filter(h => h.wh_id !== id));
  };

  // Calculate hours
  const calcHours = (start, end) => {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const diff = (eh * 60 + em) - (sh * 60 + sm);
    return diff > 0 ? `${Math.floor(diff/60)}h ${diff%60}m` : "—";
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>
              {modal === "add" ? "➕ បន្ថែមម៉ោងធ្វើការ" : "✏️ កែម៉ោងធ្វើការ"}
            </h3>
            {error && <div style={{ background: "#fee2e2", color: "#e63946", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>⚠️ {error}</div>}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>ផ្នែកការងារ *</label>
              <select style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }}
                value={form.dept_id} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))}>
                <option value="">-- ជ្រើសផ្នែក --</option>
               {depts.map(d => (
                <option key={d.dept_id} value={String(d.dept_id)}>
                    {d.dept_name}
                </option>
                ))}
              </select>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>⏰ ម៉ោងចូល *</label>
                <input type="time" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                  value={form.start_time} onChange={e => setForm(f => ({ ...f, dept_id: e.target.value }))} />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>🏃 ម៉ោងចេញ *</label>
                <input type="time" style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                  value={form.end_time} onChange={e => setForm(f => ({ ...f, end_time: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>📅 ថ្ងៃធ្វើការ</label>
              <select style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14 }}
                value={form.days} onChange={e => setForm(f => ({ ...f, days: e.target.value }))}>
                {DAYS_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>📝 កំណត់ចំណាំ</label>
              <input style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                placeholder="ឧ. ម៉ោងធ្វើការបន្ថែម..." value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))} />
            </div>

            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>⏰ ម៉ោងធ្វើការ (Working Hours)</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>គ្រប់គ្រងម៉ោងធ្វើការតាមផ្នែក</p>
        </div>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1a3a8f", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          + បន្ថែមម៉ោង
        </button>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead style={{ background: "#f9fafb" }}>
            <tr style={{ color: "#9ca3af", fontSize: 11, fontWeight: 700, textAlign: "left" }}>
              <th style={{ padding: "12px 16px" }}>#</th>
              <th style={{ padding: "12px 16px" }}>ផ្នែកការងារ</th>
              <th style={{ padding: "12px 16px" }}>ម៉ោងចូល</th>
              <th style={{ padding: "12px 16px" }}>ម៉ោងចេញ</th>
              <th style={{ padding: "12px 16px" }}>រយៈពេល</th>
              <th style={{ padding: "12px 16px" }}>ថ្ងៃ</th>
              <th style={{ padding: "12px 16px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {hours.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 24, textAlign: "center", color: "#9ca3af" }}>មិនទាន់មានម៉ោងធ្វើការ</td></tr>
            ) : hours.map((h, i) => (
              <tr key={h.wh_id} style={{ borderTop: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", color: "#9ca3af" }}>{i + 1}</td>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                  <span style={{ background: "#e0e7ff", color: "#3730a3", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                    {h.dept_name ?? "—"}
                  </span>
                </td>
                <td style={{ padding: "12px 16px", color: "#2cb67d", fontWeight: 700 }}>{h.start_time}</td>
                <td style={{ padding: "12px 16px", color: "#e63946", fontWeight: 700 }}>{h.end_time}</td>
                <td style={{ padding: "12px 16px", color: "#6b7280" }}>{calcHours(h.start_time, h.end_time)}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: "#f0fdf4", color: "#065f46", padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 700 }}>
                    {h.days}
                  </span>
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => openEdit(h)} style={{ padding: "5px 12px", borderRadius: 6, border: "1.5px solid #e5e7eb", background: "#f9fafb", cursor: "pointer", fontSize: 12 }}>✏️</button>
                    <button onClick={() => handleDelete(h.wh_id)} style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#e63946", cursor: "pointer", fontSize: 12 }}>🗑️</button>
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