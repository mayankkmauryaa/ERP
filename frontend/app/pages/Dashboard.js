"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Grid, Box, Typography, Button, Paper } from "@mui/material"
import SummaryCard from "../../src/components/SummaryCard"
import Loader from "../../src/components/Loader"
import { useAuth } from "../../src/contexts/AuthContext"
import { getEmployees } from "../../lib/apis/employee"
import { getAttendance } from "../../lib/apis/attendance"
import { getLeave } from "../../lib/apis/leave"
import { getPayroll } from "../../lib/apis/payroll"
import PeopleIcon from "@mui/icons-material/People"
import EventNoteIcon from "@mui/icons-material/EventNote"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PaymentIcon from "@mui/icons-material/Payment"

// Dashboard Page Component
const Dashboard = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingLeaves: 0,
    attendanceToday: 0,
    payrollThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const [employeesRes, leaveRes, attendanceRes, payrollRes] = await Promise.all([
          getEmployees().catch(() => ({ data: [] })),
          getLeave().catch(() => ({ data: [] })),
          getAttendance(new Date().getMonth() + 1, new Date().getFullYear()).catch(() => ({ data: [] })),
          getPayroll().catch(() => ({ data: [] })),
        ])

        const employees = employeesRes.data || []
        const leaves = leaveRes.data || []
        const attendance = attendanceRes.data || []
        const payroll = payrollRes.data || []

        // Calculate statistics
        const today = new Date().toISOString().split("T")[0]
        const attendanceToday = attendance.filter((a) => a.date === today).length
        const pendingLeaves = leaves.filter((l) => l.status === "pending").length
        const payrollThisMonth = payroll.filter((p) => {
          const payrollDate = new Date(p.createdAt)
          const now = new Date()
          return payrollDate.getMonth() === now.getMonth() && payrollDate.getFullYear() === now.getFullYear()
        }).length

        setStats({
          totalEmployees: employees.length,
          pendingLeaves: pendingLeaves,
          attendanceToday: attendanceToday,
          payrollThisMonth: payrollThisMonth,
        })
      } catch (err) {
        console.error("Error fetching dashboard stats:", err)
        setError("Failed to load dashboard statistics")
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return <Loader message="Loading Dashboard..." />
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar is already rendered in RootLayout */}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
            Welcome, {user?.name}!
          </Typography>
          <Typography variant="body1" sx={{ color: "#666" }}>
            Role: <strong>{user?.role?.toUpperCase()}</strong>
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Paper sx={{ p: 2, mb: 3, backgroundColor: "#ffebee", borderLeft: "4px solid #f44336" }}>
            <Typography color="error">{error}</Typography>
          </Paper>
        )}

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Total Employees" value={stats.totalEmployees} icon={PeopleIcon} color="#1976d2" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Pending Leaves" value={stats.pendingLeaves} icon={EventNoteIcon} color="#f57c00" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard
              title="Attendance Today"
              value={stats.attendanceToday}
              icon={CheckCircleIcon}
              color="#388e3c"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <SummaryCard title="Payroll This Month" value={stats.payrollThisMonth} icon={PaymentIcon} color="#7b1fa2" />
          </Grid>
        </Grid>

        {/* Quick Links Section */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
            Quick Links
          </Typography>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => router.push("/employees")}
                sx={{ py: 1.5 }}
              >
                View Employees
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => router.push("/attendance/mark")}
                sx={{ py: 1.5 }}
              >
                Mark Attendance
              </Button>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={() => router.push("/leave/apply")}
                sx={{ py: 1.5 }}
              >
                Apply Leave
              </Button>
            </Grid>

            {/* Admin/HR only links */}
            {user && (user.role === "admin" || user.role === "hr") && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => router.push("/attendance")}
                    sx={{ py: 1.5 }}
                  >
                    View Attendance
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => router.push("/leave")}
                    sx={{ py: 1.5 }}
                  >
                    Manage Leave
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => router.push("/payroll")}
                    sx={{ py: 1.5 }}
                  >
                    View Payroll
                  </Button>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    onClick={() => router.push("/payroll/generate")}
                    sx={{ py: 1.5 }}
                  >
                    Generate Payroll
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}

export default Dashboard
