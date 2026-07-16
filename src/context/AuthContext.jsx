import { createContext, useContext, useState } from "react";

// Mock data aligned with ER: Employee + User tables
// Employee: emp_id, emp_name, position, phone
// User:     user_id, emp_id (FK), username, password, role
const MOCK_USERS = [
  {
    user_id: 1,
    emp_id: 101,
    username: "venol",
    password: "venol",
    role: "Admin",
    // Employee fields
    emp_name: "Admin User",
    position: "Manager",
    phone: "012-345-678",
  },
  {
    user_id: 2,
    emp_id: 102,
    username: "sokdara",
    password: "password123",
    role: "Staff",
    // Employee fields
    emp_name: "Sokdara Chan",
    position: "Sales Staff",
    phone: "098-765-432",
  },
];

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("venol_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");

  const login = (username, password) => {
    const found = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );
    if (found) {
      // Don't store password in state/localStorage
      const safe = { ...found };
      delete safe.password;
      setUser(safe);
      localStorage.setItem("venol_user", JSON.stringify(safe));
      setError("");
      return true;
    }
    setError("ឈ្មោះអ្នកប្រើ ឬ លេខសម្ងាត់មិនត្រឹមត្រូវ។");
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("venol_user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, setError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
