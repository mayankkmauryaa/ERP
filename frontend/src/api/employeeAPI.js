import axiosInstance from "./axiosInstance"

// Get all employees
export const getEmployees = async () => {
  const response = await axiosInstance.get("/employees")
  return response.data
}

// Get employee by ID
export const getEmployeeById = async (id) => {
  const response = await axiosInstance.get(`/employees/${id}`)
  return response.data
}

// Create employee
export const createEmployee = async (employeeData) => {
  const response = await axiosInstance.post("/employees", employeeData)
  return response.data
}

// Update employee
export const updateEmployee = async (id, employeeData) => {
  const response = await axiosInstance.put(`/employees/${id}`, employeeData)
  return response.data
}

// Delete employee
export const deleteEmployee = async (id) => {
  const response = await axiosInstance.delete(`/employees/${id}`)
  return response.data
}
