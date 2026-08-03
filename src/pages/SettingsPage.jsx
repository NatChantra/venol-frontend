import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import styles from "./SettingsPage.module.css";

export default function SettingsPage() {
  const { user } = useAuth();
  const [saved, setSaved]   = useState(false);
  const [notifs, setNotifs] = useState({ email: true, push: false, system: true });
  const [lang, setLang]     = useState("English (United States)");
  const [tz, setTz]         = useState("(GMT+07:00) Indochina Time (Cambodia)");
  const [darkMode, setDarkMode] = useState(false);
  const [photo, setPhoto]   = useState(localStorage.getItem("userPhoto") || null);

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
            <div className={styles.field}><label>Current Password</label><input className={styles.input} type="password" /></div>
            <div className={styles.field}><label>New Password</label><input className={styles.input} type="password" /></div>
            <div className={styles.hint}>Must be at least 8 characters including a number and symbol.</div>
            <div className={styles.field}><label>Confirm New Password</label><input className={styles.input} type="password" /></div>
            <button className={styles.updatePwBtn}>Update Password</button>
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