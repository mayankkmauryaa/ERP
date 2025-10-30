import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
const withCredentials = (process.env.NEXT_PUBLIC_API_WITH_CREDENTIALS === "true");

export const apiClient = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials,
});

apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
      // Fallback for backends expecting alternative header name
      (config.headers as any)["x-access-token"] = token;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Do not auto-redirect on 401; let pages handle it gracefully
    return Promise.reject(error);
  },
);

export default apiClient;

