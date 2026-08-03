import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { employeeApi, attendanceApi, taskApi, leaveApi } from "../services/api";
import { useNotifications } from "../context/NotificationContext";
import styles from "./DashboardPage.module.css";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function LeaveBarChart({ data }) {
  const max = Math.max(...data.flatMap(d => [d.paid, d.sick, d.unpaid]), 1);
  return (
    <div>
      <div style={{ display:"flex", alignItems:"flex-end", gap:4, height:120 }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
            <div style={{ width:"100%", display:"flex", gap:1, alignItems:"flex-end", height:100 }}>
              <div style={{ flex:1, borderRadius:"3px 3px 0 0", height:`${(d.paid/max)*100}%`, background:"#1a3a8f", minHeight: d.paid > 0 ? 4 : 0 }} />
              <div style={{ flex:1, borderRadius:"3px 3px 0 0", height:`${(d.sick/max)*100}%`, background:"#93c5fd", minHeight: d.sick > 0 ? 4 : 0 }} />
              <div style={{ flex:1, borderRadius:"3px 3px 0 0", height:`${(d.unpaid/max)*100}%`, background:"#e5e7eb", minHeight: d.unpaid > 0 ? 4 : 0 }} />
            </div>
            <span style={{ fontSize:9, color:"#9ca3af" }}>{MONTHS[i]}</span>
          </div>
        ))}
      </div>
      <div style={{ display:"flex", gap:12, marginTop:8, fontSize:11, flexWrap:"wrap" }}>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ width:10, height:10, borderRadius:2, background:"#1a3a8f", display:"inline-block" }} />Paid Leave
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ width:10, height:10, borderRadius:2, background:"#93c5fd", display:"inline-block" }} />Sick Leave
        </span>
        <span style={{ display:"flex", alignItems:"center", gap:4 }}>
          <span style={{ width:10, height:10, borderRadius:2, background:"#e5e7eb", display:"inline-block" }} />Unpaid Leave
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const { unread }  = useNotifications();

  const [employees,  setEmployees]  = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [leaves,     setLeaves]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [photo,      setPhoto]      = useState(localStorage.getItem("userPhoto") || null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    Promise.all([
      employeeApi.getAll(),
      attendanceApi.getAll({ date: today }),
      taskApi.getAll(),
      leaveApi.getAll(),
    ]).then(([emps, att, tsk, lvs]) => {
      setEmployees(emps);
      setAttendance(att);
      setTasks(tsk);
      setLeaves(Array.isArray(lvs) ? lvs : []);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Attendance
  const onTime    = attendance.filter(a => a.status === "On Time").length;
  const late      = attendance.filter(a => a.status === "Late").length;
  const absent    = Math.max(0, employees.length - onTime - late);
  const totalEmp  = employees.length || 1;
  const attendPct = Math.round(((onTime + late) / totalEmp) * 100);

  // My Tasks
  const myTasks = tasks.filter(t => t.emp_id === user?.emp_id || user?.role === "Admin");

  // Annual Leave — real data
  const leaveData = MONTHS.map((_, i) => {
    const monthLeaves = leaves.filter(l => {
      if (!l.start_date) return false;
      const month = new Date(l.start_date).getMonth();
      return month === i && l.status === "Approved";
    });
    return {
      paid:   monthLeaves.filter(l => (l.leave_type ?? l.type_name ?? "").toLowerCase().includes("paid")).length,
      sick:   monthLeaves.filter(l => (l.leave_type ?? l.type_name ?? "").toLowerCase().includes("sick")).length,
      unpaid: monthLeaves.filter(l => (l.leave_type ?? l.type_name ?? "").toLowerCase().includes("unpaid")).length,
    };
  });

  const teamMembers = employees.filter(e => e.emp_id !== user?.emp_id).slice(0, 4);
  const COLORS = ["#1a3a8f","#2cb67d","#f4a261","#e63946","#9ca3af","#4895ef"];

  if (loading) return (
    <div style={{ padding:40, textAlign:"center", color:"#9ca3af" }}>កំពុងផ្ទុក...</div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.mainGrid}>

        {/* ===== LEFT ===== */}
        <div className={styles.leftCol}>
          <div className={styles.card}>
            <div style={{ textAlign:"center", marginBottom:12 }}>
              <div style={{ width:72, height:72, borderRadius:"50%", background:"#1a3a8f", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, fontWeight:700, margin:"0 auto 8px", overflow:"hidden" }}>
                {photo
                  ? <img src={photo} alt="profile" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  : user?.emp_name?.[0] ?? "A"
                }
              </div>
              <div style={{ fontWeight:700, fontSize:16, color:"#1a1a2e" }}>{user?.emp_name ?? "Admin User"}</div>
              <div style={{ display:"inline-block", background:"#e0e7ff", color:"#1a3a8f", fontSize:11, fontWeight:600, padding:"3px 12px", borderRadius:99, margin:"4px 0" }}>
                {user?.role ?? "Admin"}
              </div>
              <div style={{ fontSize:12, color:"#6b7280", marginTop:4 }}>
                📍 {user?.position ?? "Manager"} 📞 {user?.phone ?? "012-345-678"}
              </div>
              <button onClick={() => navigate("/settings")} style={{ marginTop:10, padding:"6px 20px", background:"#1a3a8f", color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontWeight:600, fontSize:13 }}>
                View Profile
              </button>
            </div>
            {["Personal Information","Length of Service","Education","Location","Phone","Email"].map((item, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderTop:"1px solid #f3f4f6", cursor:"pointer", fontSize:13, color:"#374151" }}
                onMouseEnter={e => e.currentTarget.style.color = "#1a3a8f"}
                onMouseLeave={e => e.currentTarget.style.color = "#374151"}
              >
                <span>{item}</span>
                <span style={{ color:"#9ca3af" }}>›</span>
              </div>
            ))}
          </div>

          <div className={styles.card}>
            <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e", marginBottom:12 }}>
              👥 Team Members ({teamMembers.length} នាក់)
            </div>
            {teamMembers.length === 0 ? (
              <div style={{ color:"#9ca3af", fontSize:13 }}>គ្មានសមាជិក</div>
            ) : teamMembers.map((e, i) => (
              <div key={e.emp_id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 0", borderTop: i > 0 ? "1px solid #f3f4f6" : "none", cursor:"pointer" }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background:COLORS[i % COLORS.length], color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:14, flexShrink:0 }}>
                  {e.emp_name?.[0]}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:600 }}>{e.emp_name}</div>
                  <div style={{ fontSize:11, color:"#9ca3af" }}>{e.position ?? "—"}</div>
                </div>
                <span style={{ color:"#9ca3af" }}>›</span>
              </div>
            ))}
          </div>
        </div>

        {/* ===== CENTER ===== */}
        <div className={styles.centerCol}>
          <div className={styles.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e" }}>📊 Annual Leave Taken</div>
              <button style={{ background:"none", border:"none", cursor:"pointer", fontSize:18, color:"#9ca3af" }}>⋮</button>
            </div>
            <LeaveBarChart data={leaveData} />
            {leaves.filter(l => l.status === "Approved").length === 0 && (
              <div style={{ textAlign:"center", color:"#9ca3af", fontSize:12, marginTop:8 }}>
                គ្មានច្បាប់ Approved ទាន់
              </div>
            )}
          </div>

          <div className={styles.card}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e" }}>⏰ Daily Attendance</div>
              <button onClick={() => navigate("/attendance")} style={{ fontSize:12, color:"#1a3a8f", background:"none", border:"1px solid #e5e7eb", borderRadius:6, padding:"4px 10px", cursor:"pointer" }}>
                ចូលមើល
              </button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:24, flexWrap:"wrap" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:28, fontWeight:800, color:"#1a3a8f" }}>{attendPct}%</div>
                <div style={{ fontSize:11, color:"#9ca3af" }}>PRESENT</div>
              </div>
              <div style={{ flex:1, display:"flex", flexDirection:"column", gap:10, minWidth:120 }}>
                {[
                  { label:"ON TIME", value:onTime, color:"#1a3a8f" },
                  { label:"LATE",    value:late,   color:"#f4a261" },
                  { label:"ABSENT",  value:absent, color:"#e5e7eb" },
                ].map((row, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:4, height:32, borderRadius:2, background:row.color }} />
                    <div>
                      <div style={{ fontSize:11, color:"#9ca3af" }}>{row.label}</div>
                      <div style={{ fontWeight:700 }}>{row.value} នាក់</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ===== RIGHT ===== */}
        <div className={styles.rightCol}>
          <div style={{ background:"#e8eaf6", borderRadius:16, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e" }}>My Tasks</div>
              <button onClick={() => navigate("/tasks")} style={{ background:"none", border:"none", cursor:"pointer", color:"#1a3a8f", fontSize:16 }}>↗</button>
            </div>
            <div style={{ fontSize:32, fontWeight:800, color:"#1a3a8f", margin:"8px 0 4px" }}>{myTasks.length}</div>
            <div style={{ fontSize:12, color:"#6b7280" }}>• Total Tasks</div>
            <div style={{ marginTop:8, display:"flex", gap:6, flexWrap:"wrap" }}>
              {[
                { label:"To Do",       value: myTasks.filter(t => t.status === "To Do").length,       color:"#9ca3af" },
                { label:"In Progress", value: myTasks.filter(t => t.status === "In Progress").length, color:"#f4a261" },
                { label:"Done",        value: myTasks.filter(t => t.status === "Done").length,        color:"#2cb67d" },
              ].map((s, i) => (
                <div key={i} style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:99, background:"rgba(255,255,255,0.6)", color:s.color }}>
                  {s.label}: {s.value}
                </div>
              ))}
            </div>
          </div>

          <div style={{ background:"#fce4ec", borderRadius:16, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e" }}>Notification</div>
              <button style={{ background:"none", border:"none", cursor:"pointer", color:"#e63946", fontSize:16 }}>↗</button>
            </div>
            <div style={{ fontSize:32 }}>🔔</div>
            <div style={{ fontSize:32, fontWeight:800, color:"#e63946", margin:"4px 0" }}>{unread}</div>
            <div style={{ fontSize:12, color:"#6b7280" }}>• Total Notification</div>
          </div>

          {/* Attendance Summary */}
          <div style={{ background:"#e8f5e9", borderRadius:16, padding:20, boxShadow:"0 2px 8px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight:700, fontSize:14, color:"#1a1a2e", marginBottom:8 }}>👥 បុគ្គលិក</div>
            <div style={{ fontSize:32, fontWeight:800, color:"#2cb67d", margin:"4px 0" }}>{employees.length}</div>
            <div style={{ fontSize:12, color:"#6b7280", marginBottom:8 }}>• បុគ្គលិកសរុប</div>
            <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
              <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:99, background:"#d1fae5", color:"#065f46" }}>
                Present: {onTime + late}
              </span>
              <span style={{ fontSize:11, fontWeight:600, padding:"3px 8px", borderRadius:99, background:"#fee2e2", color:"#991b1b" }}>
                Absent: {absent}
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}