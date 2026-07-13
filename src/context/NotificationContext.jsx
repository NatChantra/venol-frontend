import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const NotificationContext = createContext(null);

const API = "/api";

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const prevAttRef = useRef([]);
  const prevResRef = useRef([]);
  const prevLeaveRef = useRef([]);

  const unread = notifications.filter((n) => !n.read).length;

  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: Date.now() + Math.random(), read: false, time: "ឥឡូវ", ...notif },
      ...prev,
    ]);
  };

  // ពិនិត្យ Attendance ថ្មី (scan check-in/check-out)
  const checkAttendance = async () => {
    try {
      const res = await fetch(`${API}/attendance`, { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [];

      const prev = prevAttRef.current;
      if (prev.length > 0) {
        arr.forEach((r) => {
          const old = prev.find((p) => p.att_id === r.att_id);
          if (!old) {
            addNotification({
              type: "attendance",
              message: `👤 ${r.emp_name} បានចូលធ្វើការ ${r.status === "Late" ? "⚠️ យឺត" : "✅ ទាន់ម៉ោង"} — ${r.time_in}`,
            });
          } else if (!old.time_out && r.time_out) {
            addNotification({
              type: "attendance",
              message: `👤 ${r.emp_name} បានចេញធ្វើការ — ${r.time_out} ${r.checkout_status === "Early Leave" ? "⚠️ មុនម៉ោង" : "✅"}`,
            });
          }
        });
      }
      prevAttRef.current = arr;
    } catch (err) {
      // silent error
    }
  };

  // ពិនិត្យ Stock ចូល/ចេញ/ទាប
  const checkStock = async () => {
    try {
      const res = await fetch(`${API}/resources`, { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [];

      const prev = prevResRef.current;
      if (prev.length > 0) {
        arr.forEach((r) => {
          const old = prev.find((p) => p.res_id === r.res_id);
          if (old) {
            // Stock ចូលថ្មី (qty កើនឡើង)
            if (r.stock_qty > old.stock_qty) {
              addNotification({
                type: "stock",
                message: `📦 ស្តុកចូល: ${r.res_name} +${r.stock_qty - old.stock_qty} units (សរុប: ${r.stock_qty})`,
              });
            }
            // Stock ចេញថ្មី (qty ថយចុះ)
            if (r.stock_qty < old.stock_qty) {
              addNotification({
                type: "stock",
                message: `📤 ស្តុកចេញ: ${r.res_name} -${old.stock_qty - r.stock_qty} units (សរុប: ${r.stock_qty})`,
              });
            }
            // ស្តុកទាប
            if (old.stock_qty > old.low_stock_alert && r.stock_qty <= r.low_stock_alert && r.stock_qty > 0) {
              addNotification({
                type: "alert",
                message: `⚠️ ស្តុកទាប: ${r.res_name} នៅសល់ ${r.stock_qty} units`,
              });
            }
            // ស្តុកអស់
            if (old.stock_qty > 0 && r.stock_qty <= 0) {
              addNotification({
                type: "alert",
                message: `🚨 ស្តុកអស់: ${r.res_name} — 0 units`,
              });
            }
          } else {
            // Resource ថ្មីបង្កើត
            addNotification({
              type: "stock",
              message: `🆕 ស្តុកថ្មី: ${r.res_name} — ${r.stock_qty} units`,
            });
          }
        });
      }
      prevResRef.current = arr;
    } catch (err) {
      // silent error
    }
  };

  // ពិនិត្យ Leave Request ថ្មី
  const checkLeaves = async () => {
    try {
      const res = await fetch(`${API}/leaves`, { headers: { Accept: "application/json" } });
      if (!res.ok) return;
      const text = await res.text();
      if (!text) return;
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : [];

      const prev = prevLeaveRef.current;
      if (prev.length > 0) {
        arr.forEach((l) => {
          const old = prev.find((p) => p.leave_id === l.leave_id);
          if (!old) {
            // សំណើច្បាប់ថ្មី
            addNotification({
              type: "leave",
              message: `📝 ${l.emp_name} បានសុំច្បាប់ ${l.type_name ?? ""} (${l.start_date} - ${l.end_date})`,
            });
          } else if (old.status !== l.status) {
            // ស្ថានភាពផ្លាស់ប្តូរ
            const icon = l.status === "Approved" ? "✅" : l.status === "Rejected" ? "❌" : "📋";
            addNotification({
              type: "leave",
              message: `${icon} សំណើច្បាប់របស់ ${l.emp_name} ត្រូវបាន${l.status === "Approved" ? "អនុញ្ញាត" : l.status === "Rejected" ? "បដិសេធ" : "ផ្លាស់ប្តូរ"}`,
            });
          }
        });
      }
      prevLeaveRef.current = arr;
    } catch (err) {
      // silent error
    }
  };

  // Poll រៀងរាល់ 5 វិនាទី
  useEffect(() => {
    checkAttendance();
    checkStock();
    checkLeaves();
    const t = setInterval(() => {
      checkAttendance();
      checkStock();
      checkLeaves();
    }, 5000);
    return () => clearInterval(t);
  }, []);

  const markRead = (id) =>
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));

  const markAllRead = () =>
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));

  return (
    <NotificationContext.Provider value={{ notifications, unread, markRead, markAllRead }}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationContext);