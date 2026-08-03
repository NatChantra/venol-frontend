import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { login, error, setError } = useAuth();
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = await login(username, password);
      if (ok) navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoBox}>
            <span className={styles.logoV}>V</span>
            <div>
              <div className={styles.logoVenol}>VENOL</div>
              <div className={styles.logoMotor}>MOTOR OIL</div>
            </div>
          </div>
        </div>
        <h1 className={styles.title}>Venol Motor Oil Cambodia</h1>
        <p className={styles.subtitle}>Enterprise Work Management</p>

        {!role && (
          <div style={{ marginTop: 24 }}>
            <p style={{ textAlign: "center", color: "#6b7280", fontSize: 14, marginBottom: 16 }}>
              សូមជ្រើសរើសប្រភេទអ្នកប្រើប្រាស់
            </p>
            <div style={{ display: "flex", gap: 16 }}>
              <button onClick={() => setRole("Admin")} style={{
                flex: 1, padding: "20px 16px", borderRadius: 12,
                border: "2px solid #1a3a8f", background: "#1a3a8f",
                color: "#fff", fontSize: 16, fontWeight: 700, cursor: "pointer",
              }}>🏢 Admin</button>
              <button onClick={() => setRole("Staff")} style={{
                flex: 1, padding: "20px 16px", borderRadius: 12,
                border: "2px solid #e5e7eb", background: "#f9fafb",
                color: "#1a3a8f", fontSize: 16, fontWeight: 700, cursor: "pointer",
              }}>👤 Staff</button>
            </div>
          </div>
        )}

        {role && (
          <>
            <div style={{ textAlign: "center", marginTop: 16, marginBottom: 8 }}>
              <span style={{
                background: role === "Admin" ? "#1a3a8f" : "#e0e7ff",
                color: role === "Admin" ? "#fff" : "#1a3a8f",
                padding: "4px 16px", borderRadius: 99, fontSize: 13, fontWeight: 700,
              }}>{role === "Admin" ? "🏢 Admin" : "👤 Staff"}</span>
              <button onClick={() => { setRole(""); setError(""); }} style={{
                marginLeft: 8, background: "none", border: "none", color: "#9ca3af", cursor: "pointer", fontSize: 12,
              }}>ប្តូរ</button>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <span className={styles.errorIcon}>⚠</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>USERNAME</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>👤</span>
                  <input className={styles.input} type="text" placeholder="Enter your username"
                    value={username} onChange={e => { setUsername(e.target.value); setError(""); }} required />
                </div>
              </div>
              <div className={styles.field}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>PASSWORD</label>
                  <button type="button" className={styles.forgotLink}>Forgot Password?</button>
                </div>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input className={styles.input} type={showPw ? "text" : "password"} placeholder="••••••••"
                    value={password} onChange={e => { setPassword(e.target.value); setError(""); }} required />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                    {showPw ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
              <button type="submit" className={styles.submitBtn} disabled={loading}>
                {loading ? <span className={styles.spinner} /> : <>Sign in &#x2192;</>}
              </button>
            </form>
            <p className={styles.footer}>
              Don&apos;t have an account? <span className={styles.contactLink}>Contact Administrator</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
}