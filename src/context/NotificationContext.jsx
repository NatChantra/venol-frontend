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

// ✅ សារជូនពរផ្ទាល់ខ្លួនសម្រាប់ថ្ងៃឈប់សម្រាកសំខាន់ៗ
// អាចបន្ថែម/កែសារបានតាមចង់ — key ត្រូវផ្គូផ្គងជាមួយផ្នែកណាមួយក្នុង holiday_name
const HOLIDAY_GREETINGS = [
  { match: "ចូលឆ្នាំសកល",        greeting: "🎉 រីករាយថ្ងៃចូលឆ្នាំសកលថ្មី! សូមឆ្នាំនេះនាំមកនូវសំណាងល្អ!" },
  { match: "ជ័យជម្នះលើរបបប្រល័យពូជសាសន៍", greeting: "🕊️ ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍ — សូមរំលឹកគុណដល់ជាតិមាតុភូមិ" },
  { match: "នារីអន្តរជាតិ",       greeting: "💐 រីករាយទិវានារីអន្តរជាតិ ៨ មីនា! សូមគោរពដល់នារីទាំងអស់!" },
  { match: "ចូលឆ្នាំថ្មីប្រពៃណីជាតិ", greeting: "🎊 រីករាយបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិខ្មែរ! សូមមានសុខភាពល្អ សំណាងល្អ!" },
  { match: "ពលកម្មអន្តរជាតិ",      greeting: "👷 រីករាយទិវាពលកម្មអន្តរជាតិ! សូមអរគុណដល់កម្លាំងពលកម្មទាំងអស់!" },
  { match: "ច្រត់ព្រះនង្គ័ល",      greeting: "🌾 រីករាយពិធីបុណ្យច្រត់ព្រះនង្គ័ល!" },
  { match: "វិសាខបូជា",           greeting: "🙏 រីករាយថ្ងៃវិសាខបូជា! សូមប្រកបដោយសន្តិភាព" },
  { match: "ព្រះមហាក្សត្រ",        greeting: "👑 រីករាយព្រះរាជពិធីបុណ្យខួបកំណើត ព្រះមហាក្សត្រ!" },
  { match: "ព្រះមហាក្សត្រី",       greeting: "👑 រីករាយព្រះរាជពិធីបុណ្យខួបកំណើត ព្រះមហាក្សត្រី!" },
  { match: "រដ្ឋធម្មនុញ្ញ",         greeting: "📜 រីករាយទិវាបុណ្យរដ្ឋធម្មនុញ្ញកម្ពុជា!" },
  { match: "ភ្ជុំបិណ្ឌ",            greeting: "🙏 រីករាយពិធីបុណ្យភ្ជុំបិណ្ឌ! សូមរំលឹកគុណដល់អយ្យកោអយ្យិកា" },
  { match: "សីហនុ",               greeting: "🕯️ ទិវាប្រារព្ធពិធីគោរពព្រះវិញ្ញាណក្ខន្ធព្រះករុណា ព្រះបាទសម្តេចព្រះនរោត្តម សីហនុ" },
  { match: "គ្រងព្រះបរមរាជសម្បត្តិ", greeting: "👑 រីករាយព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ!" },
  { match: "ឯករាជ្យជាតិ",          greeting: "🇰🇭 រីករាយទិវាឯករាជ្យជាតិកម្ពុជា!" },
  { match: "ព្រះនាងព្រះទង",        greeting: "👑 រីករាយព្រះរាជពិធីបុណ្យខួបកំណើត ព្រះនាងព្រះទង!" },
  { match: "អុំទូក",              greeting: "🚣 រីករាយពិធីបុណ្យអុំទូក! សូមមានសុភមង្គល" },
  { match: "សន្តិភាព",            greeting: "🕊️ រីករាយទិវាសន្តិភាពនៅកម្ពុជា!" },
];

function getHolidayGreeting(holidayName) {
  const found = HOLIDAY_GREETINGS.find(h => holidayName?.includes(h.match));
  return found ? found.greeting : `🎉 ថ្ងៃនេះជាថ្ងៃឈប់សម្រាក: ${holidayName}! សូមរីករាយថ្ងៃបុណ្យ!`;
}

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const prevAttRef   = useRef([]);
  const prevResRef   = useRef([]);
  const prevLeaveRef = useRef([]);

  // ✅ Guard flag — ការពារកុំឲ្យ polling ជាំគ្នា ខណៈពេលមុនមិនទាន់ចប់
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

  // ✅ ពិនិត្យថ្ងៃឈប់សម្រាក — បើថ្ងៃនេះជាថ្ងៃឈប់សម្រាក ផ្ញើសារជូនពរស្វ័យប្រវត្តិ
  // ប្រើ localStorage ដើម្បីកុំឲ្យផ្ញើសារជាំគ្នាច្រើនដងក្នុងមួយថ្ងៃ (ទោះបើ refresh ក៏ដោយ)
  const checkHolidays = async () => {
    const data = await safeFetchJson(`${API}/holidays`);
    if (!data) return;
    const arr = Array.isArray(data) ? data : [];

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const todaysHolidays = arr.filter(h => h.holiday_date?.slice(0, 10) === today);

    todaysHolidays.forEach(h => {
      const seenKey = `holidayNotified_${h.holiday_id}_${today}`;
      if (localStorage.getItem(seenKey)) return; // ធ្លាប់ជូនដំណឹងរួចហើយថ្ងៃនេះ

      addNotification({
        type: "holiday",
        message: getHolidayGreeting(h.holiday_name),
      });
      localStorage.setItem(seenKey, "1");
    });
  };

  // ✅ ដំណើរការតាមលំដាប់ (sequential) ជំនួសឲ្យ concurrent
  const runChecks = async () => {
    if (isCheckingRef.current) return; // បើមុនមិនទាន់ចប់ រំលងវគ្គនេះចោល
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
    // ✅ ពិនិត្យរៀងរាល់ 30 វិនាទី (កាត់បន្ថយបន្ទុក server)
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