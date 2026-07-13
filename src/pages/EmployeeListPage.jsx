import React, { useState, useEffect } from "react";

const API = window.location.hostname === "localhost"
  ? "http://localhost:8000/api"
  : `http://${window.location.hostname}:8000/api`;

export default function EmployeeListPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [editId, setEditId]       = useState(null);
  const [form, setForm]           = useState({});
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [saving, setSaving]       = useState(false);

  const loadEmployees = () => {
    setLoading(true);
    fetch(`${API}/employees`, { headers: { Accept: "application/json" } })
      .then(r => r.json())
      .then(setEmployees)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadEmployees(); }, []);

  const startEdit = (emp) => {
    setEditId(emp.emp_id);
    setForm({
      emp_name: emp.emp_name ?? "",
      phone:    emp.phone ?? "",
      position: emp.position ?? "",
      dept_id:  emp.dept_id ?? "",
      address:  emp.address ?? "",
    });
    setPhotoFile(null);
    setPhotoPreview(emp.photo_url ?? null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setForm({});
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.emp_name.trim()) {
      alert("សូមបញ្ចូលឈ្មោះបុគ្គលិក");
      return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("emp_name", form.emp_name);
      fd.append("phone", form.phone || "");
      fd.append("position", form.position || "");
      fd.append("dept_id", form.dept_id || "");
      fd.append("address", form.address || "");
      if (photoFile) fd.append("photo", photoFile);

      const res = await fetch(`${API}/employees/${editId}`, {
        method: "POST", // Laravel reads this as update via route
        headers: { Accept: "application/json" },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message ?? "មានបញ្ហា");
        setSaving(false);
        return;
      }
      setEmployees(prev => prev.map(e => e.emp_id === editId ? data : e));
      cancelEdit();
    } catch (err) {
      alert("ភ្ជាប់ server មិនបាន");
    } finally {
      setSaving(false);
    }
  };

  const filtered = employees.filter(e =>
    (e.emp_name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h2 style={{ margin: 0, color: "#1a3a8f" }}>បុគ្គលិក</h2>
          <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: 14 }}>
            Manage employee profiles and photos.
          </p>
        </div>
        <input
          placeholder="🔍 ស្វែងរកបុគ្គលិក..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: 14, width: 240 }}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>គ្មានបុគ្គលិក</div>
        ) : filtered.map((emp, i) => {
          const isEditing = editId === emp.emp_id;
          return (
            <div key={emp.emp_id} style={{ borderTop: i === 0 ? "none" : "1px solid #f3f4f6" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px" }}>
                {/* Avatar */}
                <div style={{
                  width: 48, height: 48, borderRadius: "50%", flexShrink: 0, overflow: "hidden",
                  background: "#1a3a8f", color: "#fff", display: "flex", alignItems: "center",
                  justifyContent: "center", fontWeight: 700, fontSize: 16,
                }}>
                  {emp.photo_url ? (
                    <img src={emp.photo_url} alt={emp.emp_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    (emp.emp_name?.[0] ?? "?").toUpperCase()
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: "#1f2937" }}>{emp.emp_name}</div>
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    {emp.position ?? "—"} · {emp.department ?? "គ្មានផ្នែក"}
                  </div>
                </div>

                <div style={{ fontSize: 13, color: "#6b7280", minWidth: 120 }}>
                  📞 {emp.phone ?? "—"}
                </div>

                <button
                  onClick={() => isEditing ? cancelEdit() : startEdit(emp)}
                  style={{
                    padding: "6px 14px", background: isEditing ? "#f3f4f6" : "#e0e7ff",
                    color: isEditing ? "#6b7280" : "#3730a3", border: "none", borderRadius: 6,
                    cursor: "pointer", fontSize: 12, fontWeight: 700,
                  }}
                >
                  {isEditing ? "បិទ" : "✏️ កែប្រែ"}
                </button>
              </div>

              {/* Inline edit form */}
              {isEditing && (
                <div style={{ background: "#eff6ff", padding: "16px 20px" }}>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    {/* Photo uploader */}
                    <div style={{ textAlign: "center" }}>
                      <div style={{
                        width: 90, height: 90, borderRadius: "50%", overflow: "hidden",
                        background: "#dbeafe", display: "flex", alignItems: "center",
                        justifyContent: "center", margin: "0 auto 8px", border: "2px solid #1a3a8f",
                      }}>
                        {photoPreview ? (
                          <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <span style={{ fontSize: 28, color: "#1a3a8f" }}>{form.emp_name?.[0]?.toUpperCase() ?? "?"}</span>
                        )}
                      </div>
                      <label style={{
                        display: "inline-block", padding: "6px 12px", background: "#1a3a8f", color: "#fff",
                        borderRadius: 6, fontSize: 12, cursor: "pointer", fontWeight: 700,
                      }}>
                        📷 ប្តូររូបភាព
                        <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} />
                      </label>
                    </div>

                    {/* Fields */}
                    <div style={{ flex: 1, display: "flex", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 160 }}>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>ឈ្មោះ *</label>
                        <input
                          value={form.emp_name}
                          onChange={e => setForm(f => ({ ...f, emp_name: e.target.value }))}
                          style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ minWidth: 140 }}>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>លេខទូរស័ព្ទ</label>
                        <input
                          value={form.phone}
                          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                          style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ minWidth: 140 }}>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>តួនាទី</label>
                        <input
                          value={form.position}
                          onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                          style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }}
                        />
                      </div>
                      <div style={{ minWidth: 220 }}>
                        <label style={{ fontSize: 11, color: "#6b7280" }}>អាសយដ្ឋាន</label>
                        <input
                          value={form.address}
                          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                          style={{ display: "block", width: "100%", padding: "8px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, boxSizing: "border-box" }}
                        />
                      </div>

                      <div style={{ width: "100%", display: "flex", gap: 8, marginTop: 8 }}>
                        <button
                          onClick={handleSave}
                          disabled={saving}
                          style={{ padding: "8px 20px", background: "#1a3a8f", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 700, fontSize: 13, opacity: saving ? 0.7 : 1 }}
                        >
                          {saving ? "កំពុងរក្សាទុក..." : "💾 រក្សាទុក"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          style={{ padding: "8px 16px", background: "#f3f4f6", color: "#6b7280", border: "none", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
                        >
                          បោះបង់
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}