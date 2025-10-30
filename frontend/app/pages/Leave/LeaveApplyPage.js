"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Button, Typography, Paper, TextField, Alert, CircularProgress } from "@mui/material"
import { applyLeave } from "../../../lib/apis/leave"
import { formatDate } from "../../../src/utils/dateUtils"
import EventNoteIcon from "@mui/icons-material/EventNote"

// Apply Leave Page Component
const LeaveApplyPage = () => {
  const router = useRouter()
  const [leave, setLeave] = useState({
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date()),
    reason: "",
    leaveType: "casual",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setLeave((prev) => ({
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
    if (!leave.startDate || !leave.endDate || !leave.reason) {
      setError("Please fill in all required fields")
      return
    }

    if (new Date(leave.endDate) < new Date(leave.startDate)) {
      setError("End date must be after start date")
      return
    }

    try {
      setLoading(true)
      await applyLeave(leave)
      setSuccess("Leave application submitted successfully!")
      setLeave({
        startDate: formatDate(new Date()),
        endDate: formatDate(new Date()),
        reason: "",
        leaveType: "casual",
      })
      setTimeout(() => router.push("/dashboard"), 2000)
    } catch (err) {
      console.error("Error applying leave:", err)
      setError(err.response?.data?.message || "Failed to apply leave")
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
          <EventNoteIcon sx={{ fontSize: 40, color: "#f57c00", mr: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Apply Leave
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

        {/* Leave Form */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Leave Type"
              name="leaveType"
              select
              value={leave.leaveType}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              required
              SelectProps={{
                native: true,
              }}
            >
              <option value="casual">Casual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="earned">Earned Leave</option>
              <option value="unpaid">Unpaid Leave</option>
            </TextField>

            <TextField
              fullWidth
              label="Start Date"
              name="startDate"
              type="date"
              value={leave.startDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              required
            />

            <TextField
              fullWidth
              label="End Date"
              name="endDate"
              type="date"
              value={leave.endDate}
              onChange={handleChange}
              margin="normal"
              InputLabelProps={{ shrink: true }}
              disabled={loading}
              required
            />

            <TextField
              fullWidth
              label="Reason"
              name="reason"
              multiline
              rows={4}
              value={leave.reason}
              onChange={handleChange}
              margin="normal"
              disabled={loading}
              required
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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Apply Leave"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default LeaveApplyPage
