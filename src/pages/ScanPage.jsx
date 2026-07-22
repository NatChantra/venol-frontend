import React, { useState, useEffect } from "react";
import styles from "./ScanPage.module.css";

// ✅ FIX: use the SAME host the browser is currently on (window.location.hostname)
// instead of a hardcoded IP that may not match the device serving the app.
// This works whether you open it from localhost, your PC's LAN IP, or a phone.
const API_DIRECT = window.location.hostname === "localhost"
  ? "http://localhost:8000/api"
  : "https://my-system-vp4o.onrender.com/api";

export default function ScanPage() {
  const [empId,   setEmpId]   = useState("");
  const [result,  setResult]  = useState(null);
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const [time,    setTime]    = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async () => {
    if (!empId.trim()) return setError("សូមបញ្ចូល emp_id");
    setError("");
    setLoading(true);
    try {
      // ✅ Add a timeout so the button never hangs forever even if the
      // server really is unreachable — it will show an error instead.
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${API_DIRECT}/attendance/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          emp_id:       Number(empId),
          scan_token:   btoa(`${empId}:${Date.now()}`),
          gps_location: "11.5625,104.9160",
          device_id:    navigator.userAgent.slice(0, 40),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await res.json();

      // Already done
      if (res.status === 422) {
        setError(data.message ?? "✅ បានកត់ចូល និងចេញរួចហើយថ្ងៃនេះ!");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setError(data.message ?? "មានបញ្ហា");
        setLoading(false);
        return;
      }

      const record = data.record ?? data;
      const type   = data.type ?? (record.time_out ? "checkout" : "checkin");

      setResult({
        type,
        emp_name: record.emp_name ?? `emp_id: ${empId}`,
        time_in:  record.time_in  ?? "—",
        time_out: record.time_out ?? null,
        status:   record.status   ?? "—",
      });
      setEmpId("");
    } catch (err) {
      if (err.name === "AbortError") {
        setError(`⚠️ ភ្ជាប់ Server មិនបាន (Timeout) — ត្រួតពិនិត្យថា Laravel Server កំពុងដំណើរការនៅ ${API_DIRECT}`);
      } else {
        setError("ភ្ជាប់ server មិនបាន");
      }
    } finally {
      setLoading(false);
    }
  };

  const statusColor = (s) =>
    s === "On Time" ? "#2cb67d" : s === "Late" ? "#f4a261" : "#e63946";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoV}>V</div>
          <div>
            <div className={styles.logoVenol}>VENOL</div>
            <div className={styles.logoMotor}>MOTOR OIL</div>
          </div>
        </div>

        <h2 className={styles.title}>កត់វត្តមាន</h2>
        <p className={styles.sub}>Attendance Check-in / Check-out</p>

        {/* Clock */}
        <div className={styles.clock}>
          {time.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </div>
        <div className={styles.date}>
          {time.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>

        {/* Result */}
        {result && (
          <div className={`${styles.result} ${result.type === "checkout" ? styles.resultOut : styles.resultIn}`}>
            {result.type === "checkin" ? (
              <>
                <p className={styles.resultIcon}>✅</p>
                <p className={styles.resultTitle}>Check-in ជោគជ័យ!</p>
                <p className={styles.resultName}>👤 {result.emp_name}</p>
                <p>ម៉ោងចូល: <strong>{result.time_in}</strong></p>
                <p>ស្ថានភាព: <strong style={{ color: statusColor(result.status) }}>{result.status}</strong></p>
              </>
            ) : (
              <>
                <p className={styles.resultIcon}>🏃</p>
                <p className={styles.resultTitle}>Check-out ជោគជ័យ!</p>
                <p className={styles.resultName}>👤 {result.emp_name}</p>
                <p>ម៉ោងចូល: <strong>{result.time_in}</strong></p>
                <p>ម៉ោងចេញ: <strong>{result.time_out}</strong></p>
              </>
            )}
            <button className={styles.backBtn} onClick={() => setResult(null)}>
              ← ត្រឡប់វិញ
            </button>
          </div>
        )}

        {/* Form */}
        {!result && (
          <div className={styles.form}>
            <label className={styles.label}>បញ្ចូល ID បុគ្គលិក (emp_id)</label>
            <input
              className={styles.input}
              type="number"
              placeholder="ឧ. 101, 102..."
              value={empId}
              onChange={e => setEmpId(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSubmit()}
              autoFocus
            />

            {error && <div className={styles.error}>⚠️ {error}</div>}

            <button
              className={styles.submitBtn}
              onClick={handleSubmit}
              disabled={loading}
              style={{ background: "#1a3a8f", opacity: loading ? 0.7 : 1 }}
            >
              {loading ? "កំពុងដំណើរការ..." : "✅ កត់វត្តមាន"}
            </button>

            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 12, textAlign: "center" }}>
              ស្កែន ១ = Check-in · ស្កែន ២ = Check-out
            </p>
          </div>
        )}
      </div>
    </div>
  );
}