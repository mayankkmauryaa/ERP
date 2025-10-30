"use client"
import { Navigate, Outlet } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import Loader from "../components/Loader"

// Protected Route Component - checks if user is authenticated
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return <Loader />
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute
