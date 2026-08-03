import React, { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import styles from "./AttendancePage.module.css";

function getScanUrl() {
  if (window.location.hostname === "localhost") {
<<<<<<< HEAD
    /*return `http://172.20.10.2:5173/scan`;*/
   return `http://192.168.100.232:5173/scan`;
  /* return `http://192.168.100.67:5173/scan`;*/
  }
  return `${window.location.origin}/?page=scan`;
=======
    /*return `http://172.20.10.2:5173/qr-attendance`;*/
   return `http://192.168.100.232:5173/qr-attendance`;
  }
  return `${window.location.origin}/qr-attendance`;
>>>>>>> 99eb83218d613dee0abf685efecfe38f5f616afd
}

export default function AttendancePage() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.instruction}>
           QR Code  — បុគ្គលិក scan ហើយវាយ ID
        </div>

        <div className={styles.qrBox}>
          <QRCodeSVG value={getScanUrl()} size={200} />
          <p className={styles.tokenLabel}>Scan ដើម្បីចូល/ចេញធ្វើការ</p>
        </div>

        <div className={styles.clock}>
          {time.toLocaleTimeString("en-US", {
            hour: "2-digit", minute: "2-digit", second: "2-digit"
          })}
        </div>
        <div className={styles.date}>
          {time.toLocaleDateString("en-US", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
          })}
        </div>
      </div>
    </div>
  );
}
