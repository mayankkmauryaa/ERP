"use client"

import { useState, useEffect } from "react"
import { Container, Box, Typography, Paper, Alert, Button } from "@mui/material"
import ConfirmModal from "../../../src/components/ConfirmModal"
import Loader from "../../../src/components/Loader"
import { getLeave, approveLeave, rejectLeave } from "../../../lib/apis/leave"
import { formatDateReadable } from "../../../src/utils/dateUtils"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"

// Leave List Page Component
const LeaveListPage = () => {
  const [leaves, setLeaves] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionModal, setActionModal] = useState({ open: false, leave: null, action: null })
  const [processing, setProcessing] = useState(false)

  // Fetch leave records
  useEffect(() => {
    fetchLeaves()
  }, [])

  // Fetch leaves from API
  const fetchLeaves = async () => {
    try {
      setLoading(true)
      const response = await getLeave()
      setLeaves(response.data || [])
      setError("")
    } catch (err) {
      console.error("Error fetching leaves:", err)
      setError("Failed to load leave records")
    } finally {
      setLoading(false)
    }
  }

  // Handle approve leave
  const handleApprove = (leave) => {
    setActionModal({ open: true, leave, action: "approve" })
  }

  // Handle reject leave
  const handleReject = (leave) => {
    setActionModal({ open: true, leave, action: "reject" })
  }

  // Confirm action
  const handleConfirmAction = async () => {
    try {
      setProcessing(true)
      if (actionModal.action === "approve") {
        await approveLeave(actionModal.leave.id)
      } else {
        await rejectLeave(actionModal.leave.id)
      }
      fetchLeaves()
      setActionModal({ open: false, leave: null, action: null })
    } catch (err) {
      console.error("Error processing leave:", err)
      setError("Failed to process leave request")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <Loader message="Loading Leave Records..." />
  }

  // Table columns
  const columns = [
    { id: "employeeId", label: "Employee ID" },
    { id: "employeeName", label: "Employee Name" },
    { id: "startDate", label: "Start Date" },
    { id: "endDate", label: "End Date" },
    { id: "leaveType", label: "Leave Type" },
    { id: "status", label: "Status" },
  ]

  // Transform leaves data for table
  const tableRows = leaves.map((leave) => ({
    ...leave,
    startDate: formatDateReadable(leave.startDate),
    endDate: formatDateReadable(leave.endDate),
    employeeName: leave.employee?.name || "N/A",
  }))

  return (
    <Box sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh" }}>
      {/* Navbar is rendered by RootLayout */}

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Typography variant="h4" sx={{ fontWeight: "bold", mb: 3 }}>
          Leave Requests
        </Typography>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Leave Table with Actions */}
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
                      No leave requests found
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
                        {row.status === "pending" && (
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              startIcon={<CheckIcon />}
                              onClick={() => handleApprove(row)}
                              disabled={processing}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              startIcon={<CloseIcon />}
                              onClick={() => handleReject(row)}
                              disabled={processing}
                            >
                              Reject
                            </Button>
                          </Box>
                        )}
                        {row.status !== "pending" && (
                          <Typography variant="caption" sx={{ color: "#666" }}>
                            {row.status.toUpperCase()}
                          </Typography>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Box>
        </Paper>

        {/* Action Confirmation Modal */}
        <ConfirmModal
          open={actionModal.open}
          title={actionModal.action === "approve" ? "Approve Leave" : "Reject Leave"}
          message={`Are you sure you want to ${actionModal.action} this leave request?`}
          onConfirm={handleConfirmAction}
          onCancel={() => setActionModal({ open: false, leave: null, action: null })}
          confirmText={actionModal.action === "approve" ? "Approve" : "Reject"}
          cancelText="Cancel"
          isLoading={processing}
        />
      </Container>
    </Box>
  )
}

export default LeaveListPage
