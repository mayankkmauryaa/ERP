"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Typography, Paper, Alert, Button } from "@mui/material"
import Loader from "../../../src/components/Loader"
import { useAuth } from "../../../src/contexts/AuthContext"
import { getPayroll } from "../../../lib/apis/payroll"
import { calculateTotalSalary } from "../../../src/utils/calculationUtils"
import VisibilityIcon from "@mui/icons-material/Visibility"

// Payroll List Page Component
const PayrollListPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [payroll, setPayroll] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Fetch payroll records
  useEffect(() => {
    fetchPayroll()
  }, [])

  // Fetch payroll from API
  const fetchPayroll = async () => {
    try {
      setLoading(true)
      const response = await getPayroll()
      let payrollData = response.data || []

      // Filter payroll for employees (show only their own)
      if (user?.role === "employee") {
        payrollData = payrollData.filter((p) => p.employeeId === user.id)
      }

      setPayroll(payrollData)
      setError("")
    } catch (err) {
      console.error("Error fetching payroll:", err)
      setError("Failed to load payroll records")
    } finally {
      setLoading(false)
    }
  }

  // Handle view payroll details
  const handleView = (payrollRecord) => {
    router.push(`/payroll/${payrollRecord.id}`)
  }

  if (loading) {
    return <Loader message="Loading Payroll..." />
  }

  // Table columns
  const columns = [
    { id: "id", label: "Payroll ID" },
    { id: "employeeName", label: "Employee Name" },
    { id: "month", label: "Month" },
    { id: "year", label: "Year" },
    { id: "baseSalary", label: "Base Salary" },
    { id: "totalSalary", label: "Total Salary" },
  ]

  // Transform payroll data for table
  const tableRows = payroll.map((p) => ({
    ...p,
    employeeName: p.employee?.name || "N/A",
    baseSalary: `$${Number.parseFloat(p.baseSalary).toFixed(2)}`,
    totalSalary: `$${calculateTotalSalary(p.baseSalary, p.allowances, p.deductions).toFixed(2)}`,
  }))

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar is rendered by RootLayout */}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Payroll Records
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payroll Table with View Action */}
        <Paper sx={{ p: 2 }}>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#1976d2" }}>
                  {columns.map((col) => (
                    <th key={col.id} style={{ color: "#fff", padding: "12px", textAlign: "left", fontWeight: "bold" }}>
                      {col.label}
                    </th>
                  ))}
                  <th style={{ color: "#fff", padding: "12px", textAlign: "left", fontWeight: "bold" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length + 1} style={{ padding: "12px", textAlign: "center" }}>
                      No payroll records found
                    </td>
                  </tr>
                ) : (
                  tableRows.map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #ddd" }}>
                      {columns.map((col) => (
                        <td key={col.id} style={{ padding: "12px" }}>
                          {row[col.id]}
                        </td>
                      ))}
                      <td style={{ padding: "12px" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleView(row)}
                        >
                          View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
      </Container>
    </Box>
  )
}

export default PayrollListPage
