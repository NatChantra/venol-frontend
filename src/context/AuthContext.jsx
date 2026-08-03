import { createContext, useContext, useState } from "react";

const BASE = "https://my-system-vp4o.onrender.com/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("venol_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [error, setError] = useState("");

  const login = async (username, password) => {
    setError("");
    try {
      const res = await fetch(`${BASE}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "ឈ្មោះអ្នកប្រើ ឬ លេខសម្ងាត់មិនត្រឹមត្រូវ។");
        return false;
      }

      setUser(data);
      localStorage.setItem("venol_user", JSON.stringify(data));
      return true;

    } catch (err) {
      setError("មិនអាចភ្ជាប់ Server បាន។ សូមព្យាយាមម្តងទៀត!");
      return false;
    }
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