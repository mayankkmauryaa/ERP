"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress, MenuItem } from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"
import { registerUser } from "../../lib/apis/auth"
import { useAuth } from "../../src/contexts/AuthContext"

const RegisterPage = () => {
  const router = useRouter()
  const { login } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("employee")
  const [error, setError] = useState("")
  const [approvalCode, setApprovalCode] = useState("")
  const [approverEmail, setApproverEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError("")
    if (!name || !email || !password) {
      setError("Please fill in all required fields")
      return
    }
    try {
      setLoading(true)
      const payload = {
        name,
        email,
        password,
        role,
        // Extra fields for admin approval/audit. Backend may ignore if unsupported.
        approvalCode: role === "admin" ? approvalCode : undefined,
        approvedByEmail: role === "admin" ? approverEmail : undefined,
      }
      await registerUser(payload)
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err?.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <LockIcon sx={{ fontSize: 40, color: "#1976d2" }} />
          </Box>
          <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: "bold" }}>
            Create Account
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 3, color: "#666" }}>
            Sign up to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleRegister}>
            <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required />
            <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
            <TextField select fullWidth label="Role" value={role} onChange={(e) => setRole(e.target.value)} margin="normal">
              <MenuItem value="employee">Employee</MenuItem>
              <MenuItem value="hr">HR</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>

            {role === "admin" && (
              <>
                <TextField
                  fullWidth
                  label="Approving Admin Email"
                  type="email"
                  value={approverEmail}
                  onChange={(e) => setApproverEmail(e.target.value)}
                  margin="normal"
                  required
                />
                <TextField
                  fullWidth
                  label="Admin Approval Code"
                  type="password"
                  value={approvalCode}
                  onChange={(e) => setApprovalCode(e.target.value)}
                  margin="normal"
                  required
                />
              </>
            )}

            <Button fullWidth variant="contained" color="primary" size="large" sx={{ mt: 3 }} type="submit" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Register"}
            </Button>
          </form>

          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Already have an account? <a href="/login">Login</a>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default RegisterPage


