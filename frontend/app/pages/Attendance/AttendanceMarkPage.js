"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Button, Typography, Paper, TextField, Alert, CircularProgress } from "@mui/material"
import { markAttendance } from "../../../lib/apis/attendance"
import { formatDate } from "../../../src/utils/dateUtils"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"

// Mark Attendance Page Component
const AttendanceMarkPage = () => {
  const router = useRouter()
  const [attendance, setAttendance] = useState({
    date: formatDate(new Date()),
    status: "present",
    checkIn: "",
    checkOut: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setAttendance((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    // Validation
    if (!attendance.date || !attendance.status) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      await markAttendance(attendance)
      setSuccess("Attendance marked successfully!")
      setAttendance({
        date: formatDate(new Date()),
        status: "present",
        checkIn: "",
        checkOut: "",
      })
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err) {
      console.error("Error marking attendance:", err)
      setError(err.response?.data?.message || "Failed to mark attendance")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar is rendered by RootLayout */}

      <Container maxWidth="sm" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 40, color: "#388e3c", mr: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Mark Attendance
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Success Alert */}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Attendance Form */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Date"
              name="date"
              type="date"
              value={attendance.date}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              required
            />

            <TextField
              fullWidth
              label="Status"
              name="status"
              select
              value={attendance.status}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              required
              SelectProps={{
                native: true,
              }}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="leave">Leave</option>
              <option value="half-day">Half Day</option>
            </TextField>

            <TextField
              fullWidth
              label="Check In Time"
              name="checkIn"
              type="time"
              value={attendance.checkIn}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Check Out Time"
              name="checkOut"
              type="time"
              value={attendance.checkOut}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
            />

            {/* Submit Button */}
            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Mark Attendance"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default AttendanceMarkPage
