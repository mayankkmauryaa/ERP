"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Button, Typography, Paper, TextField, Grid, Alert, CircularProgress } from "@mui/material"
import Loader from "../../../src/components/Loader"
import { useAuth } from "../../../src/contexts/AuthContext"
import { getEmployeeById, createEmployee, updateEmployee } from "../../../lib/apis/employee"
import { formatDate } from "../../../src/utils/dateUtils"
import ArrowBackIcon from "@mui/icons-material/ArrowBack"

// Employee Detail/Form Page Component
const EmployeeDetailPage = ({ employeeId, mode: initialMode }) => {
  const router = useRouter()
  const { user } = useAuth()
  const mode = initialMode || (employeeId ? "view" : "create")

  const [employee, setEmployee] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    position: "",
    salary: "",
    joinDate: "",
  })
  const [loading, setLoading] = useState(mode === "view" || mode === "edit")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  // Fetch employee details if editing or viewing
  useEffect(() => {
    if ((mode === "edit" || mode === "view") && employeeId) {
      fetchEmployee()
    }
  }, [employeeId, mode])

  // Fetch employee from API
  const fetchEmployee = async () => {
    try {
      setLoading(true)
      const response = await getEmployeeById(employeeId)
      setEmployee(response.data || {})
      setError("")
    } catch (err) {
      console.error("Error fetching employee:", err)
      setError("Failed to load employee details")
    } finally {
      setLoading(false)
    }
  }

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setEmployee((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!employee.name || !employee.email || !employee.department || !employee.position) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)
      if (mode === "create") {
        await createEmployee(employee)
      } else {
        await updateEmployee(employeeId, employee)
      }
      router.push("/employees")
    } catch (err) {
      console.error("Error saving employee:", err)
      setError(err.response?.data?.message || "Failed to save employee")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <Loader message="Loading Employee..." />
  }

  const isReadOnly = mode === "view" && user?.role === "employee"
  const isEditable = mode === "create" || mode === "edit" || (mode === "view" && (user?.role === "admin" || user?.role === "hr"))

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar is rendered by RootLayout */}

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => router.push("/employees")} sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            {mode === "create" ? "Add Employee" : mode === "edit" ? "Edit Employee" : "Employee Details"}
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Employee Form */}
        <Paper sx={{ p: 3 }}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={employee.name}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={employee.email}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={employee.phone}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Department"
                  name="department"
                  value={employee.department}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Position"
                  name="position"
                  value={employee.position}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Salary"
                  name="salary"
                  type="number"
                  value={employee.salary}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Join Date"
                  name="joinDate"
                  type="date"
                  value={formatDate(employee.joinDate)}
                  onChange={handleChange}
                  disabled={isReadOnly || saving}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {/* Action Buttons */}
            {isEditable && (
              <Box sx={{ display: "flex", gap: 2, mt: 3 }}>
                <Button variant="contained" color="primary" type="submit" disabled={saving} sx={{ minWidth: 120 }}>
                  {saving ? <CircularProgress size={24} color="inherit" /> : mode === "create" ? "Create" : "Update"}
                </Button>
                <Button variant="outlined" onClick={() => router.push("/employees")} disabled={saving}>
                  Cancel
                </Button>
              </Box>
            )}
          </form>
        </Paper>
      </Container>
    </Box>
  )
}

export default EmployeeDetailPage
