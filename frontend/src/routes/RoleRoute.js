"use client"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

// Role-based Route Component - checks if user has required role
const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAuth()

  // Check if user's role is in allowed roles
  const hasRequiredRole = user && allowedRoles.includes(user.role)

  return hasRequiredRole ? <Outlet /> : <Navigate to="/dashboard" replace />
}

export default RoleRoute
