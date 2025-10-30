import axiosInstance from "./axiosInstance"

// Login API call
export const loginUser = async (email, password) => {
  const response = await axiosInstance.post("/auth/login", { email, password })
  return response.data
}

// Logout (client-side only)
export const logoutUser = () => {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}
