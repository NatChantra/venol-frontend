import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { leaveApi, employeeApi, leaveTypeApi } from "../services/api";

export default function LeaveRequestPage() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    emp_id: user?.emp_id || "",
    leave_type_id: "",
    start_date: "",
    end_date: "",
    reason: "",
  });

  useEffect(() => {
    Promise.all([leaveApi.getAll(), employeeApi.getAll(), leaveTypeApi.getAll()])
      .then(([l, e, lt]) => {
        setLeaves(l);
        setEmployees(e);
        setLeaveTypes(lt);
        if (lt.length > 0) setForm(f => ({ ...f, leave_type_id: lt[0].leave_type_id }));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (!form.emp_id || !form.start_date || !form.end_date) {
      return alert("សូមបំពេញព័ត៌មានឱ្យបរិបូរណ៍!");
    }
    setSaving(true);
    try {
      const newLeave = await leaveApi.create({
        emp_id: Number(form.emp_id),
        leave_type_id: Number(form.leave_type_id),
        start_date: form.start_date,
        end_date: form.end_date,
        reason: form.reason,
      });
      setLeaves(prev => [newLeave, ...prev]);
      setForm({
        emp_id: user?.emp_id || "",
        leave_type_id: leaveTypes[0]?.leave_type_id || "",
        start_date: "",
        end_date: "",
        reason: "",
      });
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const statusColor = (s) => ({
    "Pending":  { background: "#fef9c3", color: "#854d0e" },
    "Approved": { background: "#d1fae5", color: "#065f46" },
    "Rejected": { background: "#fee2e2", color: "#991b1b" },
  }[s] || {});

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#1a3a8f", margin: 0 }}>
            📝 សំណើច្បាប់ / Leave Request
          </h2>
          <p style={{ color: "#6b7280", fontSize: 13, marginTop: 4 }}>
            សុំច្បាប់ និង មើលស្ថានភាព
          </p>
        </div>
        <button
          onClick={() => setShowForm(v => !v)}
          style={{ background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer", fontWeight: 700, fontSize: 14 }}
        >
          {showForm ? "✕ បិទ" : "+ សុំច្បាប់"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
          <h3 style={{ margin: "0 0 16px", color: "#1a3a8f", fontSize: 16 }}>សំណើច្បាប់ថ្មី</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

            {/* Employee */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                បុគ្គលិក *
              </label>
              <select
                value={form.emp_id}
                onChange={e => setForm({ ...form, emp_id: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
              >
                <option value="">-- ជ្រើសបុគ្គលិក --</option>
                {employees.map(e => (
                  <option key={e.emp_id} value={e.emp_id}>{e.emp_name}</option>
                ))}
              </select>
            </div>

            {/* Leave Type */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                ប្រភេទច្បាប់ *
              </label>
              <select
                value={form.leave_type_id}
                onChange={e => setForm({ ...form, leave_type_id: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
              >
                <option value="">-- ជ្រើសប្រភេទ --</option>
                {leaveTypes.map(lt => (
                  <option key={lt.leave_type_id} value={lt.leave_type_id}>{lt.type_name}</option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                ថ្ងៃចាប់ផ្តើម *
              </label>
              <input
                type="date"
                value={form.start_date}
                onChange={e => setForm({ ...form, start_date: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
              />
            </div>

            {/* End Date */}
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                ថ្ងៃបញ្ចប់ *
              </label>
              <input
                type="date"
                value={form.end_date}
                onChange={e => setForm({ ...form, end_date: e.target.value })}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14 }}
              />
            </div>

            {/* Reason */}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                មូលហេតុ
              </label>
              <textarea
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                placeholder="មូលហេតុសុំច្បាប់..."
                rows={3}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 14, resize: "vertical" }}
              />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            style={{ marginTop: 16, background: "#2cb67d", color: "#fff", border: "none", borderRadius: 8, padding: "10px 24px", cursor: "pointer", fontWeight: 700, fontSize: 14, opacity: saving ? 0.7 : 1 }}
          >
            {saving ? "កំពុងរក្សាទុក..." : "💾 រក្សាទុក"}
          </button>
        </div>
      )}

      {/* Leave List */}
      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f9fafb" }}>
              {["បុគ្គលិក", "ប្រភេទ", "ចាប់ផ្តើម", "បញ្ចប់", "មូលហេតុ", "ស្ថានភាព"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#374151", borderBottom: "1px solid #e5e7eb" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leaves.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "#9ca3af" }}>
                  គ្មានសំណើច្បាប់
                </td>
              </tr>
            ) : leaves.map(l => (
              <tr key={l.leave_id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                  {l.emp_name ?? `emp_id:${l.emp_id}`}
                </td>
                <td style={{ padding: "12px 16px", color: "#6b7280" }}>
                  {l.type_name ?? `type_id:${l.leave_type_id}`}
                </td>
                <td style={{ padding: "12px 16px", color: "#6b7280" }}>{l.start_date}</td>
                <td style={{ padding: "12px 16px", color: "#6b7280" }}>{l.end_date}</td>
                <td style={{ padding: "12px 16px", color: "#6b7280", maxWidth: 200 }}>
                  {l.reason ?? "—"}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, ...statusColor(l.status) }}>
                    {l.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}