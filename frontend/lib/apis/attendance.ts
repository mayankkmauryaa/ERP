import apiClient from "../apiClient";
import type { AttendanceRecord } from "../types";

export async function markAttendance(attendanceData: AttendanceRecord): Promise<AttendanceRecord> {
  try {
    const { data } = await apiClient.post("/attendance", attendanceData);
    return (data?.data ?? data) as AttendanceRecord;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to mark attendance");
  }
}

export async function getAttendance(month?: number, year?: number): Promise<AttendanceRecord[]> {
  try {
    const { data } = await apiClient.get("/attendance", { params: { month, year } });
    return (data?.data ?? data) as AttendanceRecord[];
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to fetch attendance");
  }
}

export async function getAttendanceById(id: string): Promise<AttendanceRecord> {
  try {
    const { data } = await apiClient.get(`/attendance/${id}`);
    return (data?.data ?? data) as AttendanceRecord;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to fetch attendance record");
  }
}

