import apiClient from "../apiClient";
import type { User } from "../types";

export async function loginUser(email: string, password: string): Promise<{ token: string; user: User }>{
  const { data } = await apiClient.post("/auth/login", { email, password });
  // Normalize response to expected shape { token, user }
  // Supports both { token, user } and { success, message, data: { token, user } }
  const token = (data?.data?.token ?? data?.token) as string;
  const user = (data?.data?.user ?? data?.user) as User;
  return { token, user };
}

export function logoutUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export async function registerUser(payload: { name: string; email: string; password: string; role?: User["role"] }): Promise<{ message?: string; user?: User }>{
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

