import React, { useState, useEffect } from "react";
import { employeeApi, leaveApi, deptApi } from "../services/api";
import styles from "./HrAdminPage.module.css";

export default function HrAdminPage() {
  const [tab, setTab] = useState("employees");
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [depts, setDepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editEmp, setEditEmp] = useState(null);
  const [form, setForm] = useState({ emp_name: "", position: "", dept_id: "", phone: "" });
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({ emp_name: "", position: "", dept_id: "", phone: "" });

  useEffect(() => {
    setLoading(true);
    Promise.all([
      employeeApi.getAll(),
      leaveApi.getAll(),
      deptApi.getAll(),
    ]).then(([emps, lvs, dps]) => {
      setEmployees(Array.isArray(emps) ? emps : []);
      setLeaves(Array.isArray(lvs) ? lvs : []);
      setDepts(Array.isArray(dps) ? dps : []);
    }).finally(() => setLoading(false));
  }, []);

  const openEdit = (emp) => {
    setEditEmp(emp);
    setForm({ emp_name: emp.emp_name ?? "", position: emp.position ?? "", dept_id: emp.dept_id ?? "", phone: emp.phone ?? "" });
  };

  const handleEdit = async () => {
    if (!form.emp_name.trim()) return alert("Please enter name");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("emp_name", form.emp_name);
      fd.append("position", form.position || "");
      fd.append("dept_id", form.dept_id || "");
      fd.append("phone", form.phone || "");
      const res = await fetch("https://my-system-vp4o.onrender.com/api/employees/" + editEmp.emp_id, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message ?? "Error");
      setEmployees(prev => prev.map(e => e.emp_id === editEmp.emp_id ? data : e));
      setEditEmp(null);
    } catch { alert("Cannot connect"); }
    finally { setSaving(false); }
  };

  const handleAdd = async () => {
    if (!addForm.emp_name.trim()) return alert("Please enter name");
    setSaving(true);
    try {
      const res = await fetch("https://my-system-vp4o.onrender.com/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (!res.ok) return alert(data.message ?? "Error");
      setEmployees(prev => [...prev, data]);
      setAddForm({ emp_name: "", position: "", dept_id: "", phone: "" });
      setShowAdd(false);
    } catch { alert("Cannot connect"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    await employeeApi.delete(id);
    setEmployees(prev => prev.filter(e => e.emp_id !== id));
  };

  const handleLeaveStatus = async (id, status) => {
    await leaveApi.updateStatus(id, status);
    setLeaves(prev => prev.map(l => l.leave_id === id ? { ...l, status } : l));
  };

  if (loading) return React.createElement("div", { style: { padding: 40, textAlign: "center" } }, "Loading...");

  return (
    React.createElement("div", { className: styles.page },
      React.createElement("div", { className: styles.header },
        React.createElement("div", null,
          React.createElement("h2", { className: styles.title }, "HR Administration"),
          React.createElement("p", { className: styles.sub }, "Manage employees and leave")
        ),
        React.createElement("button", { className: styles.addBtn, onClick: () => { setShowAdd(true); setEditEmp(null); } }, "+ Add Employee")
      ),
      React.createElement("div", { className: styles.tabs },
        React.createElement("button", { className: styles.tab + (tab === "employees" ? " " + styles.active : ""), onClick: () => setTab("employees") }, "Employees (" + employees.length + ")"),
        React.createElement("button", { className: styles.tab + (tab === "leaves" ? " " + styles.active : ""), onClick: () => setTab("leaves") }, "Leave (" + leaves.length + ")")
      ),
      showAdd && React.createElement("div", { className: styles.formBox },
        React.createElement("h3", { className: styles.formTitle }, "Add New Employee"),
        React.createElement("div", { className: styles.formGrid },
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Name *"), React.createElement("input", { className: styles.input, value: addForm.emp_name, onChange: e => setAddForm(f => ({ ...f, emp_name: e.target.value })), placeholder: "Name" })),
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Position"), React.createElement("input", { className: styles.input, value: addForm.position, onChange: e => setAddForm(f => ({ ...f, position: e.target.value })), placeholder: "Position" })),
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Phone"), React.createElement("input", { className: styles.input, value: addForm.phone, onChange: e => setAddForm(f => ({ ...f, phone: e.target.value })), placeholder: "Phone" })),
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Department"),
            React.createElement("select", { className: styles.input, value: addForm.dept_id, onChange: e => setAddForm(f => ({ ...f, dept_id: e.target.value })) },
              React.createElement("option", { value: "" }, "-- Select --"),
              depts.map(d => React.createElement("option", { key: d.dept_id, value: d.dept_id }, d.dept_name))
            )
          )
        ),
        React.createElement("div", { className: styles.formActions },
          React.createElement("button", { className: styles.saveBtn, onClick: handleAdd, disabled: saving }, saving ? "Saving..." : "Save"),
          React.createElement("button", { className: styles.cancelBtn, onClick: () => setShowAdd(false) }, "Cancel")
        )
      ),
      editEmp && React.createElement("div", { className: styles.formBox },
        React.createElement("h3", { className: styles.formTitle }, "Edit - V" + String(editEmp.emp_id).padStart(3, "0")),
        React.createElement("div", { className: styles.formGrid },
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Name *"), React.createElement("input", { className: styles.input, value: form.emp_name, onChange: e => setForm(f => ({ ...f, emp_name: e.target.value })) })),
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Position"), React.createElement("input", { className: styles.input, value: form.position, onChange: e => setForm(f => ({ ...f, position: e.target.value })) })),
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Phone"), React.createElement("input", { className: styles.input, value: form.phone, onChange: e => setForm(f => ({ ...f, phone: e.target.value })) })),
          React.createElement("div", null, React.createElement("label", { className: styles.label }, "Department"),
            React.createElement("select", { className: styles.input, value: form.dept_id, onChange: e => setForm(f => ({ ...f, dept_id: e.target.value })) },
              React.createElement("option", { value: "" }, "-- Select --"),
              depts.map(d => React.createElement("option", { key: d.dept_id, value: d.dept_id }, d.dept_name))
            )
          )
        ),
        React.createElement("div", { className: styles.formActions },
          React.createElement("button", { className: styles.saveBtn, onClick: handleEdit, disabled: saving }, saving ? "Saving..." : "Save"),
          React.createElement("button", { className: styles.cancelBtn, onClick: () => setEditEmp(null) }, "Cancel")
        )
      ),
      tab === "employees" && React.createElement("div", { className: styles.tableWrap },
        React.createElement("table", { className: styles.table },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", null, "ID"),
            React.createElement("th", null, "Name"),
            React.createElement("th", null, "Position"),
            React.createElement("th", null, "Department"),
            React.createElement("th", null, "Phone"),
            React.createElement("th", null, "Actions")
          )),
          React.createElement("tbody", null,
            employees.map(emp =>
              React.createElement("tr", { key: emp.emp_id },
                React.createElement("td", null, "V" + String(emp.emp_id).padStart(3, "0")),
                React.createElement("td", null,
                  React.createElement("div", { className: styles.empCell },
                    React.createElement("div", { className: styles.avatar }, emp.emp_name ? emp.emp_name[0].toUpperCase() : "?"),
                    React.createElement("span", null, emp.emp_name)
                  )
                ),
                React.createElement("td", null, emp.position ?? "-"),
                React.createElement("td", null, emp.dept_name ?? "-"),
                React.createElement("td", null, emp.phone ?? "-"),
                React.createElement("td", null,
                  React.createElement("button", { className: styles.editBtn, onClick: () => openEdit(emp) }, "Edit"),
                  React.createElement("button", { className: styles.deleteBtn, onClick: () => handleDelete(emp.emp_id) }, "Delete")
                )
              )
            )
          )
        )
      ),
      tab === "leaves" && React.createElement("div", { className: styles.tableWrap },
        React.createElement("table", { className: styles.table },
          React.createElement("thead", null, React.createElement("tr", null,
            React.createElement("th", null, "Employee"),
            React.createElement("th", null, "Type"),
            React.createElement("th", null, "From"),
            React.createElement("th", null, "To"),
            React.createElement("th", null, "Status"),
            React.createElement("th", null, "Actions")
          )),
          React.createElement("tbody", null,
            leaves.map(lv =>
              React.createElement("tr", { key: lv.leave_id },
                React.createElement("td", null, lv.emp_name ?? "-"),
                React.createElement("td", null, lv.type_name ?? "-"),
                React.createElement("td", null, lv.start_date),
                React.createElement("td", null, lv.end_date),
                React.createElement("td", null, lv.status),
                React.createElement("td", null,
                  React.createElement("button", { className: styles.editBtn, onClick: () => handleLeaveStatus(lv.leave_id, "Approved") }, "Approve"),
                  React.createElement("button", { className: styles.deleteBtn, onClick: () => handleLeaveStatus(lv.leave_id, "Rejected") }, "Reject")
                )
              )
            )
          )
        )
      )
    )
  );
}