"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../contexts/AuthContext"
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from "@mui/material"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"

// Navbar Component - displays navigation and user menu
const Navbar = () => {
  const router = useRouter()
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = React.useState(null)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
    handleMenuClose()
  }

  const handleNavigation = (path) => {
    router.push(path)
  }

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, cursor: "pointer" }} onClick={() => handleNavigation("/dashboard")}>
          ERP System
        </Typography>

        {/* Navigation Links based on role */}
        <Box sx={{ display: "flex", gap: 2, mr: 3 }}>
          <Button color="inherit" onClick={() => handleNavigation("/dashboard")}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={() => handleNavigation("/employees")}>
            Employees
          </Button>
          <Button color="inherit" onClick={() => handleNavigation("/attendance/mark")}>
            Attendance
          </Button>
          <Button color="inherit" onClick={() => handleNavigation("/leave/apply")}>
            Leave
          </Button>

          {/* Admin/HR only links */}
          {user && (user.role === "admin" || user.role === "hr") && (
            <>
              <Button color="inherit" onClick={() => handleNavigation("/attendance")}>
                View Attendance
              </Button>
              <Button color="inherit" onClick={() => handleNavigation("/leave")}>
                Manage Leave
              </Button>
              <Button color="inherit" onClick={() => handleNavigation("/payroll")}>
                Payroll
              </Button>
            </>
          )}
        </Box>

        {/* User Menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button color="inherit" startIcon={<AccountCircleIcon />} onClick={handleMenuOpen}>
            {user?.name || "User"}
          </Button>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem disabled>{user?.email}</MenuItem>
            <MenuItem disabled>Role: {user?.role}</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}

export default Navbar
