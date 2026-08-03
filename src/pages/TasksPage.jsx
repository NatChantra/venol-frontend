import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { taskApi, employeeApi } from "../services/api";
import styles from "./TasksPage.module.css";

const STATUS_OPTIONS = ["To Do", "In Progress", "Done"];
const STATUS_COLORS = {
  "To Do":       { bg: "#eff6ff", color: "#1a3a8f" },
  "In Progress": { bg: "#fff7ed", color: "#f4a261" },
  "Done":        { bg: "#f0fdf4", color: "#2cb67d" },
};

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filterStatus, setFilterStatus] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    task_name: "", description: "", deadline: "", emp_id: user?.emp_id || "", status: "To Do",
  });

  useEffect(() => {
    Promise.all([taskApi.getAll(), employeeApi.getAll()])
      .then(([t, e]) => { setTasks(t); setEmployees(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterStatus === "All"
    ? tasks
    : tasks.filter((t) => t.status === filterStatus);

  const handleStatusChange = async (task_id, newStatus) => {
    try {
      await taskApi.update(task_id, { status: newStatus });
      setTasks(prev => prev.map(t => t.task_id === task_id ? { ...t, status: newStatus } : t));
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddTask = async () => {
    if (!form.task_name.trim() || !form.deadline) return;
    try {
      const newTask = await taskApi.create({
        task_name: form.task_name,
        description: form.description,
        deadline: form.deadline,
        emp_id: Number(form.emp_id),
        status: form.status,
      });
      setTasks(prev => [newTask, ...prev]);
      setForm({ task_name: "", description: "", deadline: "", emp_id: user?.emp_id || "", status: "To Do" });
      setShowForm(false);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (task_id) => {
    if (!window.confirm("លុបការងារនេះ?")) return;
    try {
      await taskApi.delete(task_id);
      setTasks(prev => prev.filter(t => t.task_id !== task_id));
    } catch (err) {
      alert(err.message);
    }
  };

  const getEmpName = (emp_id) =>
    employees.find(e => e.emp_id === emp_id)?.emp_name ?? `emp_id:${emp_id}`;

  const isOverdue = (deadline, status) =>
    status !== "Done" && new Date(deadline) < new Date();

  if (loading) return (
    <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>កំពុងផ្ទុក...</div>
  );

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>ការងារ / Tasks</h2>
          <p className={styles.sub}>ភ្ជាប់ទៅ ER: Tasks table — task_id, emp_id(FK), task_name, description, deadline, status</p>
        </div>
        <button className={styles.addBtn} onClick={() => setShowForm(v => !v)}>
          {showForm ? "✕ បិទ" : "+ បន្ថែមការងារ"}
        </button>
      </div>

      {/* Add task form */}
      {showForm && (
        <div className={styles.formCard}>
          <h3 className={styles.formTitle}>បន្ថែមការងារថ្មី</h3>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label>ឈ្មោះការងារ *</label>
              <input
                value={form.task_name}
                onChange={e => setForm({ ...form, task_name: e.target.value })}
                placeholder="ឈ្មោះការងារ..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>ថ្ងៃផុតកំណត់ *</label>
              <input
                type="date"
                value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label>បុគ្គលិក (emp_id FK)</label>
              <select
                value={form.emp_id}
                onChange={e => setForm({ ...form, emp_id: e.target.value })}
              >
                <option value="">-- ជ្រើសបុគ្គលិក --</option>
                {employees.map(e => (
                  <option key={e.emp_id} value={e.emp_id}>
                    {e.emp_name} (emp_id: {e.emp_id})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>ស្ថានភាព</label>
              <select
                value={form.status}
                onChange={e => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className={styles.formGroup} style={{ gridColumn: "1/-1" }}>
              <label>ការពិពណ៌នា</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="ការពិពណ៌នា..."
                rows={2}
              />
            </div>
          </div>
          <button className={styles.submitBtn} onClick={handleAddTask}>💾 រក្សាទុក</button>
        </div>
      )}

      {/* Filter */}
      <div className={styles.filters}>
        {["All", ...STATUS_OPTIONS].map(s => (
          <button
            key={s}
            className={filterStatus === s ? styles.filterActive : styles.filterBtn}
            onClick={() => setFilterStatus(s)}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Task cards */}
      <div className={styles.grid}>
        {filtered.length === 0 && (
          <p className={styles.empty}>គ្មានការងារ</p>
        )}
        {filtered.map(task => (
          <div key={task.task_id} className={`${styles.card} ${isOverdue(task.deadline, task.status) ? styles.overdue : ""}`}>
            <div className={styles.cardTop}>
              <span className={styles.badge} style={STATUS_COLORS[task.status]}>
                {task.status}
              </span>
              <button className={styles.deleteBtn} onClick={() => handleDelete(task.task_id)}>✕</button>
            </div>
            <h4 className={styles.taskName}>{task.task_name}</h4>
            <p className={styles.desc}>{task.description}</p>
            <div className={styles.cardFooter}>
              <span className={styles.meta}>👤 {getEmpName(task.emp_id)}</span>
              <span className={`${styles.meta} ${isOverdue(task.deadline, task.status) ? styles.overdueText : ""}`}>
                📅 {task.deadline}
                {isOverdue(task.deadline, task.status) && " ⚠️ ហួសកំណត់"}
              </span>
            </div>
            <select
              className={styles.statusSelect}
              value={task.status}
              onChange={e => handleStatusChange(task.task_id, e.target.value)}
            >
              {STATUS_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}