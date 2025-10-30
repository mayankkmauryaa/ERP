export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "hr" | "employee";
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  department: string;
  position: string;
  salary?: number | string;
  joinDate: string;
}

export interface AttendanceRecord {
  id?: string;
  employeeId?: string;
  employee?: Employee;
  date: string; // YYYY-MM-DD
  status: "present" | "absent" | "leave" | "half-day";
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  workingHours?: number;
}

export interface LeaveRecord {
  id: string;
  employeeId?: string;
  employee?: Employee;
  startDate: string;
  endDate: string;
  leaveType: string;
  status: "pending" | "approved" | "rejected";
}

export interface PayrollRecord {
  id: string;
  employeeId: string;
  period: string; // e.g. 2025-10
  grossPay: number;
  deductions: number;
  netPay: number;
}

