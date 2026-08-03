# Venol Oil Cambodia — Enterprise Work Management System

A full-featured ERP frontend built with React + CSS Modules, faithfully implementing the provided UI designs.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

**Demo credentials:**
- Username: `admin` / Password: `admin123`
- Username: `sokdara` / Password: `password123`

---

## 📁 Project Structure

```
venol-erp/
├── index.html                    # App entry HTML (loads Google Fonts)
├── vite.config.js                # Vite bundler config
├── package.json
└── src/
    ├── main.jsx                  # React DOM mount
    ├── App.jsx                   # Root: wraps providers + router
    │
    ├── styles/
    │   └── globals.css           # CSS variables, reset, utility classes
    │
    ├── context/
    │   ├── AuthContext.jsx       # Auth state: login/logout/user
    │   └── NotificationContext.jsx # Notification state + unread count
    │
    ├── router/
    │   └── AppRouter.jsx         # Login guard: show Login or MainLayout
    │
    ├── components/
    │   ├── layout/
    │   │   ├── MainLayout.jsx    # Shell: Sidebar + TopBar + page body
    │   │   ├── MainLayout.module.css
    │   │   ├── Sidebar.jsx       # Left navigation with sub-menus
    │   │   ├── Sidebar.module.css
    │   │   ├── TopBar.jsx        # Header: title, notifications, user menu
    │   │   └── TopBar.module.css
    │   │
    │   └── shared/
    │       ├── StatCard.jsx      # Reusable KPI card with trend badge
    │       ├── StatCard.module.css
    │       ├── MiniBarChart.jsx  # Lightweight bar chart (no library)
    │       └── MiniBarChart.module.css
    │
    └── pages/
        ├── LoginPage.jsx / .module.css        # Login with error state
        ├── DashboardPage.jsx / .module.css    # Home: profile, leave chart, attendance
        ├── InventoryHealthPage.jsx / .module.css # KPI dashboard + exceptions
        ├── StockViewPage.jsx / .module.css    # Stock grid view with filter
        ├── StockListPage.jsx / .module.css    # Stock table view
        ├── AddStockPage.jsx / .module.css     # New stock entry form
        ├── AttendancePage.jsx / .module.css   # QR code attendance + live clock
        ├── HrAdminPage.jsx / .module.css      # HR module directory
        ├── SettingsPage.jsx / .module.css     # Profile, password, preferences
        └── HelpPage.jsx / .module.css         # FAQ and contact
```

---

## 🎨 Styling Approach: CSS Modules

Every component has a co-located `.module.css` file:

```
StatCard.jsx          ← component logic
StatCard.module.css   ← scoped styles (no global leakage)
```

Why CSS Modules:
- **Zero runtime overhead** (vs styled-components)
- **Locally scoped** class names — no conflicts
- **Native** to Vite/CRA — no extra setup
- **Easy to migrate** to Tailwind later if needed

### Design Tokens (in globals.css)
All colors, spacing, shadows, and typography use CSS custom properties:

```css
--primary: #1a3a8f;
--accent-red: #e63946;
--accent-green: #2cb67d;
--radius-md: 10px;
--shadow-md: 0 4px 12px rgba(0,0,0,0.10);
```

---

## 🔧 Recommended Backend Stack

### Option A — Node.js + Express + PostgreSQL ✅ RECOMMENDED

Best fit for this project due to JavaScript/TypeScript consistency with the React frontend.

```
Backend:    Node.js 20 LTS + Express 5
ORM:        Prisma (type-safe queries, excellent migrations)
Database:   PostgreSQL 16
Auth:       JWT (jsonwebtoken) + bcrypt
File store: AWS S3 or local Multer for avatars/attachments
Cache:      Redis (for session tokens, attendance rate limiting)
API style:  REST (simple, predictable, easy to test)
```

**Example folder structure:**

```
venol-backend/
├── src/
│   ├── routes/
│   │   ├── auth.js        # POST /login, POST /logout
│   │   ├── users.js       # GET/PUT /users/:id
│   │   ├── stock.js       # CRUD /stock
│   │   ├── attendance.js  # POST /attendance/scan, GET /attendance
│   │   └── hr.js          # leaves, roster, employees
│   ├── middleware/
│   │   ├── auth.js        # JWT verification
│   │   └── validate.js    # Request validation (zod)
│   ├── prisma/
│   │   └── schema.prisma  # DB models
│   └── app.js
├── .env
└── package.json
```

### Option B — Python + FastAPI + PostgreSQL

Choose if your team prefers Python or needs heavy data processing.

```
Backend:    Python 3.12 + FastAPI
ORM:        SQLAlchemy 2.0 + Alembic (migrations)
Database:   PostgreSQL 16
Auth:       python-jose (JWT) + passlib/bcrypt
```

### Option C — Supabase (Fastest to ship)

Managed Postgres + Auth + Storage + Realtime — ideal for MVP:
- **No backend code** for basic CRUD
- Built-in auth with Row Level Security
- Real-time for attendance updates
- Free tier handles small teams well

---

## 🗄️ Core Database Schema (PostgreSQL)

```sql
-- Users / Employees
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) UNIQUE NOT NULL,
  password    TEXT NOT NULL,             -- bcrypt hash
  role        VARCHAR(50),
  department  VARCHAR(80),
  avatar_url  TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- Stock Items
CREATE TABLE stock_items (
  id              SERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,
  sku             VARCHAR(80) UNIQUE NOT NULL,
  category        VARCHAR(80),
  quantity        INTEGER DEFAULT 0,
  min_alert_qty   INTEGER DEFAULT 0,
  unit            VARCHAR(20),
  cost_price      DECIMAL(10,2),
  sell_price      DECIMAL(10,2),
  supplier        VARCHAR(150),
  storage_location VARCHAR(80),
  status          VARCHAR(30) DEFAULT 'Active',  -- Active, Low Stock, Depleted
  created_at      TIMESTAMP DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  date        DATE NOT NULL,
  check_in    TIMESTAMP,
  check_out   TIMESTAMP,
  status      VARCHAR(20),  -- On Time, Late, Absent
  UNIQUE(user_id, date)
);

-- Leave Requests
CREATE TABLE leave_requests (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER REFERENCES users(id),
  type        VARCHAR(20),  -- Paid, Sick, Unpaid
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  reason      TEXT,
  status      VARCHAR(20) DEFAULT 'Pending',  -- Pending, Approved, Rejected
  created_at  TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

```
POST   /api/auth/login           → { token, user }
POST   /api/auth/logout

GET    /api/stock                → paginated list
POST   /api/stock                → create item
PUT    /api/stock/:id            → update
DELETE /api/stock/:id

GET    /api/attendance           → list with filters
POST   /api/attendance/scan      → QR scan creates record

GET    /api/users/:id/leaves     → leave history
POST   /api/leaves               → apply for leave
PATCH  /api/leaves/:id/status    → approve/reject

GET    /api/dashboard/summary    → KPI aggregates
```

---

## 🧩 State Management

The project uses React Context for global state:

| Context | Manages |
|---|---|
| `AuthContext` | User session, login/logout |
| `NotificationContext` | Notification list, unread count |

For larger teams, consider adding **Zustand** (lightweight, no boilerplate) for stock and attendance state.

---

## 🌐 Frontend → Backend Integration

Replace mock data with real API calls:

```js
// src/services/stockService.js
const BASE = import.meta.env.VITE_API_URL;

export const stockService = {
  getAll: async (params) => {
    const res = await fetch(`${BASE}/api/stock?${new URLSearchParams(params)}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
    return res.json();
  },
  create: async (data) => {
    const res = await fetch(`${BASE}/api/stock`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify(data)
    });
    return res.json();
  }
};
```

---

## 📦 Recommended Dependencies to Add

```bash
# Routing (replace simple state router)
npm install react-router-dom

# Data fetching + caching
npm install @tanstack/react-query

# Form handling + validation
npm install react-hook-form zod @hookform/resolvers

# Charts (upgrade from custom MiniBarChart)
npm install recharts

# Notifications/toasts
npm install react-hot-toast

# Date handling
npm install date-fns
```

---

## 🔒 Security Checklist

- [ ] JWT tokens stored in `httpOnly` cookies (not localStorage)
- [ ] CSRF protection on all state-changing endpoints
- [ ] Rate limiting on `/api/auth/login` (prevent brute force)
- [ ] Input sanitization with Zod/Joi
- [ ] HTTPS in production (use Let's Encrypt)
- [ ] Database connection over SSL
- [ ] `.env` never committed to git

---

## 🚀 Deployment

**Frontend:** Vercel or Netlify (static deploy)
```bash
npm run build   # outputs dist/
```

**Backend (Node):** Railway, Render, or AWS EC2
**Database:** Supabase, Neon (serverless Postgres), or RDS

---

*Built for Venol Oil Cambodia — Enterprise Work Management*