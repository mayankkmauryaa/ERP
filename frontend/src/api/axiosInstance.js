import axios from "axios"

// Create axios instance with base URL
const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: process.env.NEXT_PUBLIC_API_WITH_CREDENTIALS === "true",
})

// Add JWT token to request headers
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      config.headers["x-access-token"] = token
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Handle response errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not force redirect here; let the caller decide how to handle 401
    return Promise.reject(error)
  },
)

export default axiosInstance
