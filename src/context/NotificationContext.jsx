import React, { createContext, useContext, useState, useEffect, useRef } from "react";

const NotificationContext = createContext(null);

const API = "https://my-system-vp4o.onrender.com/api";

// Helper មុខងារសុវត្ថិភាព ដើម្បីទាញ JSON ដោយពិនិត្យ content-type មុន
async function safeFetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  const contentType = res.headers.get("content-type");
  if (!res.ok || !contentType || !contentType.includes("application/json")) {
    return null;
  }
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// ✅ សារជូនពរតាមប្រភេទថ្ងៃឈប់សម្រាក — ផ្គូផ្គងតាមពាក្យគន្លឹះក្នុងឈ្មោះថ្ងៃឈប់សម្រាក
function getHolidayGreeting(holidayName) {
  const name = holidayName || "";

  const patterns = [
    { keywords: ["ចូលឆ្នាំសកល"],                  greeting: "🎉 សូមរីករាយថ្ងៃចូលឆ្នាំសកល! Happy New Year!" },
    { keywords: ["ជ័យជម្នះ", "ប្រល័យពូជសាសន៍"],    greeting: "🕊️ ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍" },
    { keywords: ["នារីអន្តរជាតិ"],                  greeting: "🌷 សូមរីករាយថ្ងៃនារីអន្តរជាតិ ៨ មីនា!" },
    { keywords: ["ចូលឆ្នាំថ្មីប្រពៃណី"],            greeting: "🎊 សូមរីករាយបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ! 🇰🇭" },
    { keywords: ["ពលកម្មអន្តរជាតិ"],                greeting: "👷 សូមរីករាយទិវាពលកម្មអន្តរជាតិ!" },
    { keywords: ["ច្រត់ព្រះនង្គ័ល"],                greeting: "🌾 សូមរីករាយពិធីបុណ្យច្រត់ព្រះនង្គ័ល!" },
    { keywords: ["វិសាខបូជា"],                      greeting: "🙏 សូមរីករាយថ្ងៃវិសាខបូជា!" },
    { keywords: ["ព្រះមហាក្សត្រ", "ព្រះមហាក្សត្រី"], greeting: "👑 សូមថ្វាយព្រះពរបំណងឲ្យព្រះជន្មាយុយឺនយូរ!" },
    { keywords: ["រដ្ឋធម្មនុញ្ញ"],                   greeting: "📜 សូមរីករាយទិវាបុណ្យរដ្ឋធម្មនុញ្ញ!" },
    { keywords: ["ភ្ជុំបិណ្ឌ"],                      greeting: "🙏 សូមរីករាយបុណ្យភ្ជុំបិណ្ឌ!" },
    { keywords: ["សីហនុ", "វិញ្ញាណក្ខន្ធ"],          greeting: "🕯️ ទិវាប្រារព្ធពិធីគោរពព្រះវិញ្ញាណក្ខន្ធ ព្រះករុណា" },
    { keywords: ["គ្រងព្រះបរមរាជសម្បត្តិ"],          greeting: "👑 សូមរីករាយព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ!" },
    { keywords: ["ឯករាជ្យជាតិ"],                     greeting: "🇰🇭 សូមរីករាយទិវាឯករាជ្យជាតិ!" },
    { keywords: ["ព្រះនាងព្រះទង"],                   greeting: "👑 ខួបកំណើតព្រះនាងព្រះទង" },
    { keywords: ["អុំទូក"],                          greeting: "🚣 សូមរីករាយបុណ្យអុំទូក!" },
    { keywords: ["សន្តិភាព"],                        greeting: "☮️ សូមរីករាយទិវាសន្តិភាពនៅកម្ពុជា!" },
  ];

  for (const p of patterns) {
    if (p.keywords.some(k => name.includes(k))) return p.greeting;
  }
  return `🎉 ថ្ងៃនេះជា "${name}"! សូមរីករាយ`;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const prevAttRef     = useRef([]);
  const prevResRef     = useRef([]);
  const prevLeaveRef   = useRef([]);

  // ✅ ធានាកុំឲ្យ notification ថ្ងៃឈប់សម្រាកលោតច្រើនដងក្នុងមួយថ្ងៃ
  const notifiedHolidayDateRef = useRef(null);

  // ✅ Guard flag — ការពារកុំឲ្យ polling ជាំគ្នា
  const isCheckingRef = useRef(false);

  const unread = notifications.filter((n) => !n.read).length;

  const addNotification = (notif) => {
    setNotifications((prev) => [
      { id: Date.now() + Math.random(), read: false, time: "ឥឡូវ", ...notif },
      ...prev,
    ]);
  };

  const checkAttendance = async () => {
    const data = await safeFetchJson(`${API}/attendance`);
    if (!data) return;
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
  };

  const checkStock = async () => {
    const data = await safeFetchJson(`${API}/resources`);
    if (!data) return;
    const arr = Array.isArray(data) ? data : [];

    const prev = prevResRef.current;
    if (prev.length > 0) {
      arr.forEach((r) => {
        const old = prev.find((p) => p.res_id === r.res_id);
        if (old) {
          if (r.stock_qty > old.stock_qty) {
            addNotification({
              type: "stock",
              message: `📦 ស្តុកចូល: ${r.res_name} +${r.stock_qty - old.stock_qty} units (សរុប: ${r.stock_qty})`,
            });
          }
          if (r.stock_qty < old.stock_qty) {
            addNotification({
              type: "stock",
              message: `📤 ស្តុកចេញ: ${r.res_name} -${old.stock_qty - r.stock_qty} units (សរុប: ${r.stock_qty})`,
            });
          }
          if (old.stock_qty > old.low_stock_alert && r.stock_qty <= r.low_stock_alert && r.stock_qty > 0) {
            addNotification({
              type: "alert",
              message: `⚠️ ស្តុកទាប: ${r.res_name} នៅសល់ ${r.stock_qty} units`,
            });
          }
          if (old.stock_qty > 0 && r.stock_qty <= 0) {
            addNotification({
              type: "alert",
              message: `🚨 ស្តុកអស់: ${r.res_name} — 0 units`,
            });
          }
        } else {
          addNotification({
            type: "stock",
            message: `🆕 ស្តុកថ្មី: ${r.res_name} — ${r.stock_qty} units`,
          });
        }
      });
    }
    prevResRef.current = arr;
  };

  const checkLeaves = async () => {
    const data = await safeFetchJson(`${API}/leaves`);
    if (!data) return;
    const arr = Array.isArray(data) ? data : [];

    const prev = prevLeaveRef.current;
    if (prev.length > 0) {
      arr.forEach((l) => {
        const old = prev.find((p) => p.leave_id === l.leave_id);
        if (!old) {
          addNotification({
            type: "leave",
            message: `📝 ${l.emp_name} បានសុំច្បាប់ ${l.type_name ?? ""} (${l.start_date} - ${l.end_date})`,
          });
        } else if (old.status !== l.status) {
          const icon = l.status === "Approved" ? "✅" : l.status === "Rejected" ? "❌" : "📋";
          addNotification({
            type: "leave",
            message: `${icon} សំណើច្បាប់របស់ ${l.emp_name} ត្រូវបាន${l.status === "Approved" ? "អនុញ្ញាត" : l.status === "Rejected" ? "បដិសេធ" : "ផ្លាស់ប្តូរ"}`,
          });
        }
      });
    }
    prevLeaveRef.current = arr;
  };

  // ✅ ត្រួតពិនិត្យថ្ងៃឈប់សម្រាក — បើថ្ងៃនេះជាថ្ងៃឈប់សម្រាក ផ្ញើ notification ជូនពរ
  const checkHolidays = async () => {
    const data = await safeFetchJson(`${API}/holidays`);
    if (!data) return;
    const arr = Array.isArray(data) ? data : [];

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // បើថ្ងៃនេះបានជូនដំណឹងរួចហើយ (ក្នុង session នេះ) កុំធ្វើម្តងទៀត
    if (notifiedHolidayDateRef.current === today) return;

    const todayHoliday = arr.find((h) => (h.holiday_date || "").slice(0, 10) === today);

    if (todayHoliday) {
      addNotification({
        type: "holiday",
        message: getHolidayGreeting(todayHoliday.holiday_name),
      });
      notifiedHolidayDateRef.current = today;
    }
  };

  // ✅ ដំណើរការតាមលំដាប់ (sequential) ជំនួសឲ្យ concurrent
  const runChecks = async () => {
    if (isCheckingRef.current) return;
    isCheckingRef.current = true;
    try {
      await checkAttendance();
      await checkStock();
      await checkLeaves();
      await checkHolidays();
    } finally {
      isCheckingRef.current = false;
    }
  };

  useEffect(() => {
    runChecks();
    const t = setInterval(runChecks, 30000);
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