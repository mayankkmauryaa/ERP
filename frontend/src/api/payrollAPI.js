import axiosInstance from "./axiosInstance"

// Generate payroll
export const generatePayroll = async (payrollData) => {
  const response = await axiosInstance.post("/payroll", payrollData)
  return response.data
}

// Get payroll records
export const getPayroll = async () => {
  const response = await axiosInstance.get("/payroll")
  return response.data
}

// Get payroll by ID
export const getPayrollById = async (id) => {
  const response = await axiosInstance.get(`/payroll/${id}`)
  return response.data
}
