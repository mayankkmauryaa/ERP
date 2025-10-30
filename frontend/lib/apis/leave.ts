import apiClient from "../apiClient";
import type { LeaveRecord } from "../types";

export async function getLeave(): Promise<LeaveRecord[]> {
  try {
    const { data } = await apiClient.get("/leaves");
    return (data?.data ?? data) as LeaveRecord[];
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to fetch leaves");
  }
}

export async function approveLeave(id: string): Promise<LeaveRecord> {
  try {
    const { data } = await apiClient.post(`/leaves/${id}/approve`);
    return (data?.data ?? data) as LeaveRecord;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to approve leave");
  }
}

export async function rejectLeave(id: string): Promise<LeaveRecord> {
  try {
    const { data } = await apiClient.post(`/leaves/${id}/reject`);
    return (data?.data ?? data) as LeaveRecord;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to reject leave");
  }
}

export async function applyLeave(payload: Pick<LeaveRecord, "startDate" | "endDate"> & { reason: string; leaveType: string }): Promise<LeaveRecord> {
  try {
    const { data } = await apiClient.post("/leaves", payload);
    return (data?.data ?? data) as LeaveRecord;
  } catch (err: any) {
    throw new Error(err?.response?.data?.message || "Failed to apply leave");
  }
}

