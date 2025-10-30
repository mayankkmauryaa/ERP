import apiClient from "../apiClient";

export interface PayrollSummary {
  id: string;
  employeeId: string;
  createdAt?: string;
  period?: string;
  grossPay?: number;
  deductions?: number;
  netPay?: number;
}

export async function getPayroll(): Promise<PayrollSummary[]> {
  try {
    const { data } = await apiClient.get("/payroll");
    return (data?.data ?? data) as PayrollSummary[];
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to fetch payroll");
  }
}

export async function getPayrollById(id: string): Promise<PayrollSummary> {
  try {
    const { data } = await apiClient.get(`/payroll/${id}`);
    return (data?.data ?? data) as PayrollSummary;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to fetch payroll detail");
  }
}

export async function generatePayroll(payload: Record<string, unknown>): Promise<PayrollSummary[]> {
  try {
    const { data } = await apiClient.post("/payroll/generate", payload);
    return (data?.data ?? data) as PayrollSummary[];
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to generate payroll");
  }
}

