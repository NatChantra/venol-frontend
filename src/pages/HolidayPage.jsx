import React, { useState, useEffect } from "react";
import { holidayApi } from "../services/api";

const MONTHS_KM = ["មករា","កុម្ភៈ","មិនា","មេសា","ឧសភា","មិថុនា","កក្កដា","សីហា","កញ្ញា","តុលា","វិច្ឆិកា","ធ្នូ"];

export default function HolidayPage() {
  const [holidays, setHolidays] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [yearFilter, setYearFilter] = useState("all");
  const [modal,    setModal]    = useState(null); // null | "add"
  const [form,     setForm]     = useState({ holiday_name: "", holiday_date: "", description: "" });
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState("");

  useEffect(() => {
    holidayApi.getAll()
      .then(setHolidays)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const years = ["all", ...new Set(holidays.map(h => h.holiday_date?.slice(0, 4)).filter(Boolean))].sort();

  const filtered = holidays.filter(h =>
    yearFilter === "all" || h.holiday_date?.startsWith(yearFilter)
  );

  // Group by month
  const grouped = filtered.reduce((acc, h) => {
    const month = new Date(h.holiday_date).getMonth();
    if (!acc[month]) acc[month] = [];
    acc[month].push(h);
    return acc;
  }, {});

  const openAdd = () => {
    setForm({ holiday_name: "", holiday_date: "", description: "" });
    setError("");
    setModal("add");
  };

  const handleSave = async () => {
    if (!form.holiday_name.trim()) { setError("សូមបញ្ចូលឈ្មោះថ្ងៃឈប់សម្រាក"); return; }
    if (!form.holiday_date)        { setError("សូមជ្រើសកាលបរិច្ឆេទ");        return; }
    setSaving(true); setError("");
    try {
      const result = await holidayApi.create(form);
      setHolidays(prev => [...prev, result].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date)));
      setModal(null);
    } catch (err) {
      setError(err.message || "មានបញ្ហា");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("លុបថ្ងៃឈប់សម្រាកនេះ?")) return;
    await holidayApi.delete(id);
    setHolidays(prev => prev.filter(h => h.holiday_id !== id));
  };

  const isUpcoming = (date) => {
    const today = new Date().toISOString().slice(0, 10);
    return date >= today;
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>;

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Modal */}
      {modal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, minWidth: 380, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: "0 0 20px", fontSize: 16, fontWeight: 700 }}>➕ បន្ថែមថ្ងៃឈប់សម្រាក</h3>
            {error && <div style={{ background: "#fee2e2", color: "#e63946", padding: "10px 14px", borderRadius: 8, marginBottom: 14, fontSize: 13 }}>⚠️ {error}</div>}

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>ឈ្មោះថ្ងៃឈប់សម្រាក *</label>
              <input
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                placeholder="ឧ. ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីខ្មែរ"
                value={form.holiday_name}
                onChange={e => setForm(f => ({ ...f, holiday_name: e.target.value }))}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>កាលបរិច្ឆេទ *</label>
              <input
                type="date"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                value={form.holiday_date}
                onChange={e => setForm(f => ({ ...f, holiday_date: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: "#6b7280", display: "block", marginBottom: 6 }}>ការពិពណ៌នា (English)</label>
              <input
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1.5px solid #e5e7eb", fontSize: 14, boxSizing: "border-box" }}
                placeholder="ឧ. Khmer New Year"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
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
          <h2 style={{ fontSize: 22, fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px" }}>📅 ថ្ងៃឈប់សម្រាក (Holidays)</h2>
          <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>បញ្ជីថ្ងៃឈប់សម្រាកផ្លូវការប្រចាំឆ្នាំ</p>
        </div>
        <button onClick={openAdd} style={{ padding: "10px 20px", borderRadius: 8, border: "none", background: "#1a3a8f", color: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>
          + បន្ថែមថ្ងៃឈប់សម្រាក
        </button>
      </div>

      {/* Year Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setYearFilter(y)}
            style={{
              padding: "8px 18px", borderRadius: 8, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 13,
              background: yearFilter === y ? "#1a3a8f" : "#f3f4f6",
              color:      yearFilter === y ? "#fff"    : "#374151",
            }}
          >
            {y === "all" ? "ទាំងអស់" : y}
          </button>
        ))}
      </div>

      {/* Summary */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#1a3a8f" }}>{filtered.length}</div>
        <div style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>ថ្ងៃឈប់សម្រាកសរុប</div>
      </div>

      {/* List by month */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", background: "#fff", borderRadius: 16 }}>
          មិនទាន់មានថ្ងៃឈប់សម្រាក
        </div>
      ) : (
        Object.keys(grouped).sort((a, b) => a - b).map(month => (
          <div key={month} style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#1a3a8f", marginBottom: 10 }}>
              📆 {MONTHS_KM[month]}
            </h3>
            <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
              {grouped[month]
                .sort((a, b) => a.holiday_date.localeCompare(b.holiday_date))
                .map((h, i) => {
                  const date = new Date(h.holiday_date);
                  const upcoming = isUpcoming(h.holiday_date);
                  return (
                    <div key={h.holiday_id} style={{
                      display: "flex", alignItems: "center", gap: 16, padding: "14px 20px",
                      borderTop: i > 0 ? "1px solid #f3f4f6" : "none",
                      background: upcoming ? "#f0fdf4" : "#fff",
                    }}>
                      <div style={{
                        width: 48, textAlign: "center", flexShrink: 0,
                        color: upcoming ? "#2cb67d" : "#9ca3af",
                      }}>
                        <div style={{ fontSize: 20, fontWeight: 800 }}>{date.getDate()}</div>
                        <div style={{ fontSize: 10 }}>{date.toLocaleDateString("en-US", { weekday: "short" })}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, color: "#1a1a2e", fontSize: 14 }}>{h.holiday_name}</div>
                        <div style={{ fontSize: 12, color: "#9ca3af" }}>{h.description ?? "—"}</div>
                      </div>
                      {upcoming && (
                        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: "#d1fae5", color: "#065f46" }}>
                          មិនទាន់មកដល់
                        </span>
                      )}
                      <button onClick={() => handleDelete(h.holiday_id)} style={{ padding: "6px 10px", borderRadius: 6, border: "none", background: "#fee2e2", color: "#e63946", cursor: "pointer", fontSize: 12 }}>
                        🗑️
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}