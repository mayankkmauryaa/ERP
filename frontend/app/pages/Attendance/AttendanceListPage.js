"use client"

import { useState, useEffect } from "react"
import { Container, Box, Typography, Paper, TextField, Button, Alert, Grid } from "@mui/material"
import ReusableTable from "../../../src/components/ReusableTable"
import Loader from "../../../src/components/Loader"
import { getAttendance } from "../../../lib/apis/attendance"
import { formatDateReadable } from "../../../src/utils/dateUtils"
import { getCurrentMonthYear } from "../../../src/utils/dateUtils"

// Attendance List Page Component
const AttendanceListPage = () => {
  const { month: currentMonth, year: currentYear } = getCurrentMonthYear()
  const [attendance, setAttendance] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [month, setMonth] = useState(currentMonth)
  const [year, setYear] = useState(currentYear)

  // Fetch attendance records
  useEffect(() => {
    fetchAttendance()
  }, [month, year])

  // Fetch attendance from API
  const fetchAttendance = async () => {
    try {
      setLoading(true)
      const response = await getAttendance(month, year)
      setAttendance(response.data || [])
      setError("")
    } catch (err) {
      console.error("Error fetching attendance:", err)
      setError("Failed to load attendance records")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loader message="Loading Attendance..." />
  }

  // Table columns
  const columns = [
    { id: "employeeId", label: "Employee ID" },
    { id: "employeeName", label: "Employee Name" },
    { id: "date", label: "Date" },
    { id: "status", label: "Status" },
    { id: "checkIn", label: "Check In" },
    { id: "checkOut", label: "Check Out" },
    { id: "workingHours", label: "Working Hours" },
  ]

  // Transform attendance data for table
  const tableRows = attendance.map((att) => ({
    ...att,
    date: formatDateReadable(att.date),
    employeeName: att.employee?.name || "N/A",
  }))

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar is rendered by RootLayout */}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Attendance Records
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Filter Section */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Month"
                type="number"
                value={month}
                onChange={(e) => setMonth(Number.parseInt(e.target.value))}
                inputProps={{ min: 1, max: 12 }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={year}
                onChange={(e) => setYear(Number.parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button variant="contained" color="primary" onClick={fetchAttendance} fullWidth>
                Filter
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Attendance Table */}
        <Paper sx={{ p: 2 }}>
          <ReusableTable columns={columns} rows={tableRows} />
        </Paper>
      </Container>
    </Box>
  )
}

export default AttendanceListPage
