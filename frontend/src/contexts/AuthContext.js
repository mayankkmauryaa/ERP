"use client"

import React, { createContext, useState } from "react"
import { loginUser, logoutUser } from "../../lib/apis/auth"

// Create Auth Context
export const AuthContext = createContext()

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const readStoredUser = () => {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("user")
    if (!raw || raw === "undefined") return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  }

  const readStoredToken = () => {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("token")
    if (!raw || raw === "undefined") return null
    return raw
  }

  const initialToken = readStoredToken()
  const initialUser = readStoredUser()
  const [user, setUser] = useState(initialUser)
  const [token, setToken] = useState(initialToken)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Login function
  const login = async (email, password) => {
    try {
      setError(null)
      const response = await loginUser(email, password)
      const { token: newToken, user: userData } = response

      // Store token and user in localStorage
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(userData))

      setToken(newToken)
      setUser(userData)
      return response
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Login failed"
      setError(errorMessage)
      throw err
    }
  }

  // Logout function
  const logout = () => {
    logoutUser()
    setToken(null)
    setUser(null)
    setError(null)
  }

  const value = {
    user,
    token,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use Auth Context
export const useAuth = () => {
  const context = React.useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
