"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Container, Box, Button, Typography, Paper, Alert } from "@mui/material"
import ReusableTable from "../../../src/components/ReusableTable"
import ConfirmModal from "../../../src/components/ConfirmModal"
import Loader from "../../../src/components/Loader"
import { useAuth } from "../../../src/contexts/AuthContext"
import { getEmployees, deleteEmployee } from "../../../lib/apis/employee"
import { formatDateReadable } from "../../../src/utils/dateUtils"
import AddIcon from "@mui/icons-material/Add"

// Employee List Page Component
const EmployeeListPage = () => {
  const router = useRouter()
  const { user } = useAuth()
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deleteModal, setDeleteModal] = useState({ open: false, employee: null })
  const [deleting, setDeleting] = useState(false)

  // Fetch employees on component mount
  useEffect(() => {
    fetchEmployees()
  }, [])

  // Fetch employees from API
  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const response = await getEmployees()
      setEmployees(response.data || [])
      setError("")
    } catch (err) {
      console.error("Error fetching employees:", err)
      setError("Failed to load employees")
    } finally {
      setLoading(false)
    }
  }

  // Handle edit employee
  const handleEdit = (employee) => {
    router.push(`/employees/${employee.id}`)
  }

  // Handle delete employee
  const handleDeleteClick = (employee) => {
    setDeleteModal({ open: true, employee })
  }

  // Confirm delete employee
  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteEmployee(deleteModal.employee.id)
      setEmployees(employees.filter((e) => e.id !== deleteModal.employee.id))
      setDeleteModal({ open: false, employee: null })
    } catch (err) {
      console.error("Error deleting employee:", err)
      setError("Failed to delete employee")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <Loader message="Loading Employees..." />
  }

  // Table columns
  const columns = [
    { id: "id", label: "ID" },
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "department", label: "Department" },
    { id: "position", label: "Position" },
    { id: "joinDate", label: "Join Date" },
  ]

  // Transform employees data for table
  const tableRows = employees.map((emp) => ({
    ...emp,
    joinDate: formatDateReadable(emp.joinDate),
  }))

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar is rendered by RootLayout */}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: "bold" }}>
            Employees
          </Typography>

          {/* Add Employee Button - Admin/HR only */}
          {user && (user.role === "admin" || user.role === "hr") && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => router.push("/employees/new")}
            >
              Add Employee
            </Button>
          )}
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Employees Table */}
        <Paper sx={{ p: 2 }}>
          <ReusableTable
            columns={columns}
            rows={tableRows}
            onEdit={user && (user.role === "admin" || user.role === "hr") ? handleEdit : null}
            onDelete={user && (user.role === "admin" || user.role === "hr") ? handleDeleteClick : null}
          />
        </Paper>

        {/* Delete Confirmation Modal */}
        <ConfirmModal
          open={deleteModal.open}
          title="Delete Employee"
          message={`Are you sure you want to delete ${deleteModal.employee?.name}?`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteModal({ open: false, employee: null })}
          confirmText="Delete"
          cancelText="Cancel"
          isLoading={deleting}
        />
      </Container>
    </Box>
  )
}

export default EmployeeListPage
