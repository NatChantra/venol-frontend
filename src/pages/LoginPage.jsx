import { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import { useNavigate } from 'react-router-dom';
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { login, error, setError } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const ok = login(username, password);
      if (ok) navigate('/dashboard');
    } catch (err) {
      console.error("Login failed", err);
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
              <input
                className={styles.input}
                type="text"
                placeholder="Enter your ID or Email"
                value={username}
                onChange={e => { setUsername(e.target.value); setError(""); }}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <div className={styles.labelRow}>
              <label className={styles.label}>PASSWORD</label>
              <button type="button" className={styles.forgotLink}>Forgot Password?</button>
            </div>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input
                className={styles.input}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(""); }}
                required
              />
              <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : <>Sign in →</>}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <span className={styles.contactLink}>Contact Administrator</span>
        </p>

      </div>
    </div>
  );
}