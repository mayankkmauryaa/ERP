"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Button, Typography, Paper, TextField, Alert, CircularProgress, Grid } from "@mui/material"
import { generatePayroll } from "../../../lib/apis/payroll"
import PaymentIcon from "@mui/icons-material/Payment"

// Generate Payroll Page Component
const PayrollGeneratePage = () => {
  const router = useRouter()
  const [payroll, setPayroll] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    baseSalary: "",
    allowances: "",
    deductions: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setPayroll((prev) => ({
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
    if (!payroll.month || !payroll.year || !payroll.baseSalary) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      await generatePayroll(payroll)
      setSuccess("Payroll generated successfully!")
      setPayroll({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        baseSalary: "",
        allowances: "",
        deductions: "",
      })
      setTimeout(() => router.push("/payroll"), 2000)
    } catch (err) {
      console.error("Error generating payroll:", err)
      setError(err.response?.data?.message || "Failed to generate payroll")
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
          <PaymentIcon sx={{ fontSize: 40, color: "#7b1fa2", mr: 1 }} />
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Generate Payroll
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

        {/* Payroll Form */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Month"
                  name="month"
                  type="number"
                  value={payroll.month}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  inputProps={{ min: 1, max: 12 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Year"
                  name="year"
                  type="number"
                  value={payroll.year}
                  onChange={handleChange}
                  disabled={loading}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Base Salary"
                  name="baseSalary"
                  type="number"
                  value={payroll.baseSalary}
                  onChange={handleChange}
                  disabled={loading}
                  required
                  inputProps={{ step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Allowances"
                  name="allowances"
                  type="number"
                  value={payroll.allowances}
                  onChange={handleChange}
                  disabled={loading}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Deductions"
                  name="deductions"
                  type="number"
                  value={payroll.deductions}
                  onChange={handleChange}
                  disabled={loading}
                  inputProps={{ step: "0.01" }}
                />
              </Grid>
            </Grid>

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
              {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Payroll"}
            </Button>
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default PayrollGeneratePage
