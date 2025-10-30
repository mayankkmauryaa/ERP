import axiosInstance from "./axiosInstance"

// Mark attendance
export const markAttendance = async (attendanceData) => {
  const response = await axiosInstance.post("/attendance", attendanceData)
  return response.data
}

// Get attendance records
export const getAttendance = async (month, year) => {
  const response = await axiosInstance.get("/attendance", {
    params: { month, year },
  })
  return response.data
}

// Get attendance by ID
export const getAttendanceById = async (id) => {
  const response = await axiosInstance.get(`/attendance/${id}`)
  return response.data
}
