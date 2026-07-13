import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import styles from "./TopBar.module.css";

export default function TopBar({ pageTitle, onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, unread, markRead, markAllRead } = useNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser]   = useState(false);
  const notifRef = useRef(null);
  const userRef  = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (userRef.current  && !userRef.current.contains(e.target))  setShowUser(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        {/* ☰ Hamburger button — បើក/បិទ Sidebar */}
        <button className={styles.menuBtn} onClick={onMenuClick} title="Toggle menu">
          <span className={styles.hamburger}>☰</span>
        </button>
        <span className={styles.pageTitle}>{pageTitle}</span>
      </div>

      <div className={styles.right}>
        {/* Notifications */}
        <div className={styles.iconWrap} ref={notifRef}>
          <button className={styles.iconBtn} onClick={() => setShowNotif(v => !v)}>
            🔔
            {unread > 0 && <span className={styles.badge}>{unread}</span>}
          </button>
          {showNotif && (
            <div className={styles.dropdown}>
              <div className={styles.dropHeader}>
                <span className={styles.dropTitle}>Notifications</span>
                <button className={styles.markAll} onClick={markAllRead}>Mark all read</button>
              </div>
              <div className={styles.notifList}>
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`${styles.notifItem} ${!n.read ? styles.unread : ""}`}
                    onClick={() => markRead(n.id)}
                  >
                    <span className={styles.notifDot} />
                    <div>
                      <p className={styles.notifMsg}>{n.message}</p>
                      <span className={styles.notifTime}>{n.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button className={styles.iconBtn}>⚙️</button>

        {/* User menu */}
        <div className={styles.iconWrap} ref={userRef}>
          <button className={styles.userBtn} onClick={() => setShowUser(v => !v)}>
            <div className={styles.avatar}>{user?.name?.[0] ?? "U"}</div>
            <span className={styles.userName}>{user?.name}</span>
            <span className={styles.chevron}>▾</span>
          </button>
          {showUser && (
            <div className={styles.userDropdown}>
              <div className={styles.userInfo}>
                <div className={styles.userAvatar}>{user?.name?.[0]}</div>
                <div>
                  <p className={styles.uName}>{user?.name}</p>
                  <p className={styles.uRole}>{user?.role}</p>
                </div>
              </div>
              <hr className={styles.divider} />
              <button className={styles.menuItem}>👤 Profile</button>
              <button className={styles.menuItem}>⚙️ Settings</button>
              <hr className={styles.divider} />
              <button className={`${styles.menuItem} ${styles.logoutItem}`} onClick={logout}>
                🚪 Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}