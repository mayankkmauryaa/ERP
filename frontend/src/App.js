import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./contexts/AuthContext"
import ProtectedRoute from "./routes/ProtectedRoute"
import RoleRoute from "./routes/RoleRoute"

// Pages
import LoginPage from "./pages/LoginPage"
import Dashboard from "./pages/Dashboard"
import EmployeeListPage from "./pages/Employees/EmployeeListPage"
import EmployeeDetailPage from "./pages/Employees/EmployeeDetailPage"
import AttendanceMarkPage from "./pages/Attendance/AttendanceMarkPage"
import AttendanceListPage from "./pages/Attendance/AttendanceListPage"
import LeaveApplyPage from "./pages/Leave/LeaveApplyPage"
import LeaveListPage from "./pages/Leave/LeaveListPage"
import PayrollGeneratePage from "./pages/Payroll/PayrollGeneratePage"
import PayrollListPage from "./pages/Payroll/PayrollListPage"
import PayrollDetailPage from "./pages/Payroll/PayrollDetailPage"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Employee Routes */}
            <Route path="/employees" element={<EmployeeListPage />} />
            <Route path="/employees/:id" element={<EmployeeDetailPage />} />

            {/* Attendance Routes */}
            <Route path="/attendance/mark" element={<AttendanceMarkPage />} />
            <Route element={<RoleRoute allowedRoles={["admin", "hr"]} />}>
              <Route path="/attendance" element={<AttendanceListPage />} />
            </Route>

            {/* Leave Routes */}
            <Route path="/leave/apply" element={<LeaveApplyPage />} />
            <Route element={<RoleRoute allowedRoles={["admin", "hr"]} />}>
              <Route path="/leave" element={<LeaveListPage />} />
            </Route>

            {/* Payroll Routes */}
            <Route element={<RoleRoute allowedRoles={["admin", "hr"]} />}>
              <Route path="/payroll/generate" element={<PayrollGeneratePage />} />
              <Route path="/payroll" element={<PayrollListPage />} />
              <Route path="/payroll/:id" element={<PayrollDetailPage />} />
            </Route>
          </Route>

          {/* Redirect to login */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
