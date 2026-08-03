import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InventoryHealthPage from './pages/InventoryHealthPage';
import StockViewPage from './pages/StockViewPage';
import StockListPage from './pages/StockListPage';
import AddStockPage from './pages/AddStockPage';
import AttendancePage from './components/attendance/AttendancePage';
import HrAdminPage from './pages/HrAdminPage';
import TasksPage from './pages/TasksPage';
import UsageRecordsPage from './pages/UsageRecordsPage';
import SettingsPage from './pages/SettingsPage';
import HelpPage from './pages/HelpPage';
import MainLayout from './components/layout/MainLayout';
import ScanPage from './pages/ScanPage';
import StockHistoryPage from './pages/StockHistoryPage';
import LeaveRequestPage from './pages/LeaveRequestPage';
import DepartmentPage from './pages/Departmentpage';
import PositionPage from './pages/Positionpage';
import WorkingHoursPage from './pages/Workinghourspage';
import HolidayPage from './pages/HolidayPage';



function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/" />;
}

function AdminOnly({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/" />;
  if (user.role !== "Admin") return <Navigate to="/dashboard" />;
  return children;
}

export default function AppRouter() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
      <Route path="/qr-attendance" element={<ScanPage />} />
      <Route element={<MainLayout />}>
        {/* Staff + Admin */}
        <Route path="/holidays" element={<Protected><HolidayPage /></Protected>} />
        <Route path="/dashboard"  element={<Protected><DashboardPage /></Protected>} />
        <Route path="/attendance" element={<Protected><AttendancePage /></Protected>} />
        <Route path="/tasks"      element={<Protected><TasksPage /></Protected>} />
        <Route path="/settings"   element={<Protected><SettingsPage /></Protected>} />
        <Route path="/help"       element={<Protected><HelpPage /></Protected>} />
        <Route path="/leave-request" element={<Protected><LeaveRequestPage /></Protected>} />

        {/* Admin Only */}
        <Route path="/departments"    element={<AdminOnly><DepartmentPage /></AdminOnly>} />
        <Route path="/positions"      element={<AdminOnly><PositionPage /></AdminOnly>} />
        <Route path="/working-hours"  element={<AdminOnly><WorkingHoursPage /></AdminOnly>} />
        <Route path="/inventory-health" element={<AdminOnly><InventoryHealthPage /></AdminOnly>} />
        <Route path="/stock-view"       element={<AdminOnly><StockViewPage /></AdminOnly>} />
        <Route path="/stock-list"       element={<AdminOnly><StockListPage /></AdminOnly>} />
        <Route path="/stock-add"        element={<AdminOnly><AddStockPage /></AdminOnly>} />
        <Route path="/stock-history"    element={<AdminOnly><StockHistoryPage /></AdminOnly>} />
        <Route path="/usage-records"    element={<AdminOnly><UsageRecordsPage /></AdminOnly>} />
        <Route path="/hr-admin"         element={<AdminOnly><HrAdminPage /></AdminOnly>} />
      </Route>
    </Routes>
  );
}
