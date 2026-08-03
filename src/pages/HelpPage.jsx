import React from "react";
import styles from "./HelpPage.module.css";

const FAQS = [
  { q: "How do I mark attendance?", a: "Navigate to the Attendance section and scan the QR code using the Venol mobile app while connected to the office Wi-Fi." },
  { q: "How do I add a new stock item?", a: "Go to ឃ្លាំងទំនិញ → Add Stock Item. Fill in all required fields marked with ⊕ and click Add to Stock." },
  { q: "How do I apply for leave?", a: "Navigate to HR Administration → Leave Management → Leave Application and submit a new leave request." },
  { q: "How do I reset my password?", a: "Go to Settings → Security & Password. Enter your current password, then set a new one with at least 8 characters." },
];

export default function HelpPage() {
  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className={styles.heroIcon}>🛟</div>
        <h2 className={styles.heroTitle}>Help & Support</h2>
        <p className={styles.heroSub}>Find answers to common questions or contact your system administrator.</p>
      </div>
      <div className={styles.faqSection}>
        <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
        {FAQS.map((f, i) => (
          <div key={i} className={styles.faqItem}>
            <div className={styles.faqQ}>❓ {f.q}</div>
            <div className={styles.faqA}>{f.a}</div>
          </div>
        ))}
      </div>
      <div className={styles.contactCard}>
        <div className={styles.contactIcon}>📧</div>
        <div>
          <div className={styles.contactTitle}>Contact System Administrator</div>
          <div className={styles.contactSub}>For account issues, access requests, or technical problems.</div>
        </div>
        <button className={styles.contactBtn}>Send Message</button>
      </div>
    </div>
  );
}