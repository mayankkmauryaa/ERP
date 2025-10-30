"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Button, Typography, Paper, Grid, Alert } from "@mui/material"
import Loader from "../../../src/components/Loader"
import { getPayrollById } from "../../../lib/apis/payroll"
import { calculateTotalSalary } from "../../utils/calculationUtils"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"
import PrintIcon from "@mui/icons-material/Print"

// Payroll Detail Page Component
const PayrollDetailPage = ({ payrollId }) => {
  const router = useRouter()
  const [payroll, setPayroll] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch payroll details
  useEffect(() => {
    fetchPayrollDetails()
  }, [payrollId])

  // Fetch payroll from API
  const fetchPayrollDetails = async () => {
    try {
      setLoading(true)
      const response = await getPayrollById(payrollId)
      setPayroll(response || {})
      setError("")
    } catch (err) {
      console.error("Error fetching payroll:", err)
      setError("Failed to load payroll details")
    } finally {
      setLoading(false)
    }
  }

  // Handle print
  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return <Loader message="Loading Payroll Details..." />
  }

  if (!payroll) {
    return (
      <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Alert severity="error">Payroll record not found</Alert>
        </Container>
      </Box>
    )
  }

  const totalSalary = calculateTotalSalary(payroll.baseSalary, payroll.allowances, payroll.deductions)

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/payroll")} sx={{ mr: 2 }}>
              Back
            </Button>
            <Typography variant="h4" sx={{ fontWeight: "bold" }}>
              Payroll Details
            </Typography>
          </Box>
          <Button variant="contained" color="primary" startIcon={<PrintIcon />} onClick={handlePrint}>
            Print
          </Button>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payroll Details */}
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Employee Information */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Employee Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Employee Name
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {payroll.employee?.name || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Employee ID
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {payroll.employeeId}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Department
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {payroll.employee?.department || "N/A"}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Position
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {payroll.employee?.position || "N/A"}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Payroll Period */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Payroll Period
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Month
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {payroll.month}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" sx={{ color: "#666" }}>
                    Year
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                    {payroll.year}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {/* Salary Breakdown */}
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: "bold", mb: 2 }}>
                Salary Breakdown
              </Typography>
              <Box sx={{ backgroundColor: "#f5f5f5", p: 2, borderRadius: 1 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Base Salary:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        ${Number.parseFloat(payroll.baseSalary).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Allowances:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold", color: "#388e3c" }}>
                        +${Number.parseFloat(payroll.allowances || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography variant="body2">Deductions:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold", color: "#d32f2f" }}>
                        -${Number.parseFloat(payroll.deductions || 0).toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mb: 1,
                        pt: 1,
                        borderTop: "2px solid #ddd",
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Total Salary:
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold", color: "#1976d2", fontSize: "1.1rem" }}>
                        ${totalSalary.toFixed(2)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  )
}

export default PayrollDetailPage
