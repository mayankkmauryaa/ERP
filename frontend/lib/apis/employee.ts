import apiClient from "../apiClient";
import type { Employee } from "../types";

export async function getEmployees(): Promise<Employee[]> {
  try {
    const { data } = await apiClient.get("/employees");
    return (data?.data ?? data) as Employee[];
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to fetch employees");
  }
}

export async function getEmployeeById(id: string): Promise<Employee> {
  try {
    const { data } = await apiClient.get(`/employees/${id}`);
    return (data?.data ?? data) as Employee;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to fetch employee");
  }
}

export async function createEmployee(employeeData: Partial<Employee>): Promise<Employee> {
  try {
    const { data } = await apiClient.post("/employees", employeeData);
    return (data?.data ?? data) as Employee;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to create employee");
  }
}

export async function updateEmployee(id: string, employeeData: Partial<Employee>): Promise<Employee> {
  try {
    const { data } = await apiClient.put(`/employees/${id}`, employeeData);
    return (data?.data ?? data) as Employee;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to update employee");
  }
}

export async function deleteEmployee(id: string): Promise<{ success: boolean }>{
  try {
    const { data } = await apiClient.delete(`/employees/${id}`);
    return (data?.data ?? data) as { success: boolean };
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to delete employee");
  }
}

