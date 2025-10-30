"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../src/contexts/AuthContext"
import { Container, Paper, TextField, Button, Typography, Box, Alert, CircularProgress } from "@mui/material"
import LockIcon from "@mui/icons-material/Lock"

// Login Page Component
const LoginPage = () => {
  const router = useRouter()
  const { login, error: authError } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Handle login form submission
  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!email || !password) {
      setError("Please enter both email and password")
      return
    }

    try {
      setLoading(true)
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(authError || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: "100%" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <LockIcon sx={{ fontSize: 40, color: "#1976d2" }} />
          </Box>

          <Typography variant="h4" align="center" sx={{ mb: 1, fontWeight: "bold" }}>
            ERP System
          </Typography>
          <Typography variant="body2" align="center" sx={{ mb: 3, color: "#666" }}>
            Employee Management & Payroll
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              variant="outlined"
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              margin="normal"
              variant="outlined"
              disabled={loading}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{ mt: 3 }}
              type="submit"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
            </Button>
          </form>

          {/* Demo Credentials */}
          <Box sx={{ mt: 3, p: 2, backgroundColor: "#f5f5f5", borderRadius: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              Demo Credentials:
            </Typography>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Typography variant="body2">
              Don't have an account? <a href="/register">Register</a>
            </Typography>
          </Box>
            <Typography variant="caption" display="block">
              Admin: admin@example.com / password123
            </Typography>
            <Typography variant="caption" display="block">
              HR: hr@example.com / password123
            </Typography>
            <Typography variant="caption" display="block">
              Employee: emp@example.com / password123
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Container>
  )
}

export default LoginPage
