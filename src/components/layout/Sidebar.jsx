import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useLocation } from "react-router-dom";
import styles from "./Sidebar.module.css";


const ADMIN_NAV = [
  { key: "dashboard",        label: "ទំព័រដើម"},
  { key: "inventory-health", label: "ផ្ទាំងគ្រប់គ្រង"},
  {
    key: "stock", label: "ឃ្លាំងទំនិញ",
    children: [
      { key: "stock-view",    label: "View Stock" },
      { key: "stock-list",    label: "Stock List" },
      { key: "stock-add",     label: "Add Stock Item" },
      { key: "stock-history", label: "Stock History" },
    ]
  },
  { key: "attendance",    label: "QR Scan"},
  { key: "tasks",         label: "ការងារ"},
  { key: "leave-request", label: "សំណើច្បាប់"},
  { key: "usage-records", label: "កំណត់ត្រាប្រើប្រាស់" },
  { key: "hr-admin",      label: "HR Administration" },
  { key: "holidays", label: "ថ្ងៃឈប់សម្រាក" },
  {
    key: "hr-settings", label: "HR Settings",
    children: [
      { key: "departments",   label: "Department" },
      { key: "positions",     label: "Position" },
      { key: "working-hours", label: "Working Hours" },
    ]
  },
];

const STAFF_NAV = [
  { key: "dashboard",     label: "ទំព័រដើម"},
  { key: "attendance",    label: "វត្តមាន" },
  { key: "tasks",         label: "ការងារ" },
  { key: "leave-request", label: "សុំច្បាប់" },
 
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState({ stock: false });

  const isAdmin  = user?.role === "Admin";
  const NAV_ITEMS = isAdmin ? ADMIN_NAV : STAFF_NAV;

  const toggle    = (key) => setExpanded(p => ({ ...p, [key]: !p[key] }));
  const handleNav = () => onClose?.();

  return (
    <aside className={`${styles.sidebar} ${open ? styles.open : ""}`}>

      {/* Close button */}
      <button className={styles.closeBtn} onClick={onClose}>✕</button>

      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.logoBox}>
          <div className={styles.logoV}>V</div>
          <div>
            <div className={styles.logoVenol}>VENOL</div>
            <div className={styles.logoMotor}>MOTOR OIL</div>
          </div>
        </div>
        <div className={styles.companyName}>Venol Oil Cambodia</div>
      </div>

      {/* Role badge */}
      <div className={styles.roleBadge}>
        {isAdmin ? "Administrator" : "👤 Staff"}
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(item => (
          <div key={item.key}>
            {item.children ? (
              <>
                <button
                  className={styles.navItem}
                  onClick={() => toggle(item.key)}
                >
                  <span className={styles.navIcon}>{item.icon}</span>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.chevron}>{expanded[item.key] ? "▾" : "▸"}</span>
                </button>

                {expanded[item.key] && (
                  <div className={styles.subMenu}>
                    {item.children.map(child => (
                      <Link
                        key={child.key}
                        to={`/${child.key}`}
                        onClick={handleNav}
                        className={`${styles.subItem} ${location.pathname === `/${child.key}` ? styles.subActive : ""}`}
                      >
                        <span className={styles.subDot}>›</span>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                to={`/${item.key}`}
                onClick={handleNav}
                className={`${styles.navItem} ${location.pathname === `/${item.key}` ? styles.active : ""}`}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom */}
      <div className={styles.bottom}>
        <Link to="/help"     onClick={handleNav} className={styles.bottomItem}><span>🛟</span> ក្រុមជំនួយ</Link>
        <Link to="/settings" onClick={handleNav} className={styles.bottomItem}><span>⚙️</span> កំណត់</Link>
        <button className={`${styles.bottomItem} ${styles.logout}`} onClick={logout}>
          <span>🚪</span> ចេញ
        </button>
      </div>
    </aside>
  );
}