// src/services/api.js

// ប្រើប្រាស់ Environment Variable ពី Render, បើអត់មានទើបប្រើ URL លេខ ២
// កែ file src/services/api.js ត្រង់បន្ទាត់ទី ៤ នេះ៖
const BASE = import.meta.env.VITE_API_BASE_URL || "https://my-system-vp4o.onrender.com/api";

async function request(method, path, body = null) {
  const options = {
    method,
    mode: 'cors', // អនុញ្ញាតឱ្យតភ្ជាប់ឆ្លង Domain
    headers: { 
      "Content-Type": "application/json", 
      "Accept": "application/json" 
    },
  };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE}${path}`, options);
    const data = await res.json();
    
    // បើមាន Error ពី Server (ដូចជា 404, 500)
    if (!res.ok) throw new Error(data.message || "API Error");
    
    return data;
  } catch (error) {
    console.error("Fetch Error:", error);
    throw error; // បោះ Error ទៅកន្លែងហៅ (Component) ដើម្បីឱ្យវាបង្ហាញ Error
  }
}

// ===== API Modules =====

export const employeeApi = {
  getAll:   ()          => request("GET",    "/employees"),
  create:   (data)      => request("POST",   "/employees", data),
  update:   (id, data)  => request("PUT",    `/employees/${id}`, data),
  delete:   (id)        => request("DELETE", `/employees/${id}`),
};

export const attendanceApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/attendance${q ? "?" + q : ""}`);
  },
  scan: (data) => request("POST", "/attendance/scan", data),
};

export const taskApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/tasks${q ? "?" + q : ""}`);
  },
  create:   (data)      => request("POST",   "/tasks", data),
  update:   (id, data)  => request("PUT",    `/tasks/${id}`, data),
  delete:   (id)        => request("DELETE", `/tasks/${id}`),
};

export const leaveApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/leaves${q ? "?" + q : ""}`);
  },
  create:        (data)       => request("POST",  "/leaves", data),
  updateStatus:  (id, status) => request("PATCH", `/leaves/${id}/status`, { status }),
  delete:        (id)         => request("DELETE", `/leaves/${id}`),
};

export const leaveTypeApi = {
  getAll: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request("GET", `/leave-types${q ? "?" + q : ""}`);
  },
  create:   (data)      => request("POST",   "/leave-types", data),
  update:   (id, data)  => request("PUT",    `/leave-types/${id}`, data),
  delete:   (id)        => request("DELETE", `/leave-types/${id}`),
};

export const resourceApi = {
  getAll:   ()          => request("GET",    "/resources"),
  create:   (data)      => request("POST",   "/resources", data),
  update:   (id, data)  => request("PUT",    `/resources/${id}`, data),
  delete:   (id)        => request("DELETE", `/resources/${id}`),
};

export const usageApi = {
  getAll:   ()      => request("GET",    "/usage-records"),
  create:   (data)  => request("POST",   "/usage-records", data),
  delete:   (id)    => request("DELETE", `/usage-records/${id}`),
};

export const supplierApi = {
  getAll:   ()          => request("GET",    "/suppliers"),
  create:   (data)      => request("POST",   "/suppliers", data),
  update:   (id, data)  => request("PUT",    `/suppliers/${id}`, data),
  delete:   (id)        => request("DELETE", `/suppliers/${id}`),
};

export const categoryApi = {
  getAll:   ()      => request("GET",    "/categories"),
  create:   (data)  => request("POST",   "/categories", data),
  delete:   (id)    => request("DELETE", `/categories/${id}`),
};

export const holidayApi = {
  getAll: () => request("GET", "/holidays"),
  create: (data) => request("POST", "/holidays", data),
  delete: (id) => request("DELETE", `/holidays/${id}`),
};

export const stockApi = {
  stockIn:   (data)        => request("POST", "/stock/in",  data),
  stockOut:  (data)        => request("POST", "/stock/out", data),
  history:   (queryString) => request("GET",  `/stock/history${queryString ? "?" + queryString : ""}`),
  report:    ()            => request("GET",  "/stock/report"),
};

export const deptApi = {
  getAll:   ()          => request("GET",    "/departments"),
  create:   (data)      => request("POST",   "/departments", data),
  update:   (id, data)  => request("PUT",    `/departments/${id}`, data),
  delete:   (id)        => request("DELETE", `/departments/${id}`),
};

export const positionApi = {
  getAll:   ()          => request("GET",    "/positions"),
  create:   (data)      => request("POST",   "/positions", data),
  update:   (id, data)  => request("PUT",    `/positions/${id}`, data),
  delete:   (id)        => request("DELETE", `/positions/${id}`),
};

export const workingHoursApi = {
  getAll:   ()          => request("GET",    "/working-hours"),
  create:   (data)      => request("POST",   "/working-hours", data),
  update:   (id, data)  => request("PUT",    `/working-hours/${id}`, data),
  delete:   (id)        => request("DELETE", `/working-hours/${id}`),
};