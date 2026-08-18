import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./SettingsPage.module.css";

const API = window.location.hostname === "localhost"
  ? "http://localhost:8000/api"
  : "https://my-system-vp4o.onrender.com/api";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved]   = useState(false);
  const [notifs, setNotifs] = useState({ email: true, push: false, system: true });
  const [lang, setLang]     = useState("English (United States)");
  const [tz, setTz]         = useState("(GMT+07:00) Indochina Time (Cambodia)");
  const [darkMode, setDarkMode] = useState(false);
  const [photo, setPhoto]   = useState(localStorage.getItem("userPhoto") || null);

  // ✅ ស្ថានភាពសម្រាប់ Change Password
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwError, setPwError]     = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving]   = useState(false);

  const toggle = (k) => setNotifs(n => ({ ...n, [k]: !n[k] }));

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhoto(ev.target.result);
        localStorage.setItem("userPhoto", ev.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ ដំណើរការប្តូរ Password
  const handleChangePassword = async () => {
    setPwError("");
    setPwSuccess("");

    if (!pwForm.current || !pwForm.next || !pwForm.confirm) {
      setPwError("សូមបំពេញគ្រប់ប្រអប់ទាំងអស់");
      return;
    }
    if (pwForm.next.length < 4) {
      setPwError("Password ថ្មីត្រូវមានយ៉ាងតិច 4 តួអក្សរ");
      return;
    }
    if (pwForm.next !== pwForm.confirm) {
      setPwError("Password ថ្មី និង Confirm Password មិនដូចគ្នាទេ");
      return;
    }

    setPwSaving(true);
    try {
      const res = await fetch(`${API}/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          user_id: user?.user_id,
          current_password: pwForm.current,
          new_password: pwForm.next,
          new_password_confirmation: pwForm.confirm,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwError(data.message ?? "មានបញ្ហា សូមព្យាយាមម្តងទៀត");
        return;
      }
      setPwSuccess(data.message ?? "✅ ប្តូរ Password ជោគជ័យ!");
      setPwForm({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwSuccess(""), 4000);
    } catch (err) {
      setPwError("ភ្ជាប់ server មិនបាន — លម្អិត: " + (err?.message || err));
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>Settings</h2>
      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>👤 Profile Information</div>
            <div className={styles.profileRow}>
              {/* Avatar */}
              <div className={styles.avatar} style={{ overflow:"hidden", padding:0, background: photo ? "transparent" : "#1a3a8f" }}>
                {photo
                  ? <img src={photo} alt="profile" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"50%" }} />
                  : <span style={{ color:"#fff", fontWeight:700, fontSize:20 }}>{user?.emp_name?.[0] ?? "A"}</span>
                }
              </div>
              <div>
                <div className={styles.userName}>{user?.emp_name ?? "Admin User"}</div>
                <div className={styles.userRole}>{user?.role ?? "Admin"}</div>
                {/* Change Photo Button */}
                <input
                  type="file"
                  accept="image/*"
                  id="photoInput"
                  style={{ display:"none" }}
                  onChange={handlePhotoChange}
                />
                <button
                  className={styles.changePhotoBtn}
                  onClick={() => document.getElementById("photoInput").click()}
                >
                  📷 Change Photo
                </button>
              </div>
            </div>
            <div className={styles.fieldRow}>
              <div className={styles.field}><label>First Name</label><input className={styles.input} defaultValue={user?.emp_name?.split(" ")[0]} /></div>
              <div className={styles.field}><label>Last Name</label><input className={styles.input} defaultValue={user?.emp_name?.split(" ")[1] ?? ""} /></div>
            </div>
            <div className={styles.field}><label>Email Address</label><input className={styles.input} defaultValue={user?.email ?? ""} /></div>
            <div className={styles.field}><label>Job Title</label><input className={styles.input} defaultValue={user?.role ?? ""} /></div>
            <button className={styles.saveBtn} onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}>
              {saved ? "✓ Saved!" : "Save Changes"}
            </button>
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>🔒 Security & Password</div>

            {pwError && (
              <div style={{ background: "#fee2e2", color: "#e63946", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13 }}>
                ⚠️ {pwError}
              </div>
            )}
            {pwSuccess && (
              <div style={{ background: "#d1fae5", color: "#065f46", padding: "10px 14px", borderRadius: 8, marginBottom: 12, fontSize: 13, fontWeight: 700 }}>
                {pwSuccess}
              </div>
            )}

            <div className={styles.field}>
              <label>Current Password</label>
              <input
                className={styles.input}
                type="password"
                value={pwForm.current}
                onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>New Password</label>
              <input
                className={styles.input}
                type="password"
                value={pwForm.next}
                onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
              />
            </div>
            <div className={styles.hint}>Must be at least 4 characters.</div>
            <div className={styles.field}>
              <label>Confirm New Password</label>
              <input
                className={styles.input}
                type="password"
                value={pwForm.confirm}
                onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
              />
            </div>
            <button className={styles.updatePwBtn} onClick={handleChangePassword} disabled={pwSaving}>
              {pwSaving ? "កំពុងរក្សាទុក..." : "Update Password"}
            </button>
          </div>
        </div>

        <div className={styles.rightCol}>
          <div className={styles.card}>
            <div className={styles.cardTitle}>🔔 Notifications</div>
            {[
              { key: "email",  label: "Email Alerts",        desc: "Receive daily summary emails." },
              { key: "push",   label: "Push Notifications",  desc: "Get instant alerts on your devices." },
              { key: "system", label: "System Updates",      desc: "Notices about maintenance and features." },
            ].map(item => (
              <div key={item.key} className={styles.toggleRow}>
                <div>
                  <div className={styles.toggleLabel}>{item.label}</div>
                  <div className={styles.toggleDesc}>{item.desc}</div>
                </div>
                <button className={`${styles.toggle} ${notifs[item.key] ? styles.toggleOn : ""}`} onClick={() => toggle(item.key)}>
                  <span className={styles.toggleThumb} />
                </button>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <div className={styles.cardTitle}>⚙️ System Preferences</div>
            <div className={styles.field}>
              <label>Language</label>
              <select className={styles.input} value={lang} onChange={e => setLang(e.target.value)}>
                <option>English (United States)</option>
                <option>Khmer (Cambodia)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Timezone</label>
              <select className={styles.input} value={tz} onChange={e => setTz(e.target.value)}>
                <option>(GMT+07:00) Indochina Time (Cambodia)</option>
                <option>(GMT-08:00) Pacific Time</option>
              </select>
            </div>
            <div className={styles.toggleRow}>
              <div className={styles.toggleLabel}>🌙 Dark Mode</div>
              <button className={`${styles.toggle} ${darkMode ? styles.toggleOn : ""}`} onClick={() => setDarkMode(v => !v)}>
                <span className={styles.toggleThumb} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}