import axiosInstance from "./axiosInstance"

// Apply for leave
export const applyLeave = async (leaveData) => {
  const response = await axiosInstance.post("/leave", leaveData)
  return response.data
}

// Get leave records
export const getLeave = async () => {
  const response = await axiosInstance.get("/leave")
  return response.data
}

// Approve leave
export const approveLeave = async (id) => {
  const response = await axiosInstance.put(`/leave/${id}/approve`)
  return response.data
}

// Reject leave
export const rejectLeave = async (id) => {
  const response = await axiosInstance.put(`/leave/${id}/reject`)
  return response.data
}
