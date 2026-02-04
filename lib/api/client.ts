import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { toast } from "sonner";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_PYCELIZE_API_URL || "http://localhost:5050/api/v1";
const DEBUG_MODE = process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING === "true";

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for large file uploads
  headers: {
    Accept: "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Set Content-Type for FormData automatically
    if (config.data instanceof FormData) {
      config.headers["Content-Type"] = "multipart/form-data";
    }

    // Debug logging
    if (DEBUG_MODE) {
      console.debug("API Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data instanceof FormData ? "[FormData]" : config.data,
      });
    }

    return config;
  },
  (error) => {
    if (DEBUG_MODE) {
      console.debug("API Request Error:", error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug logging
    if (DEBUG_MODE) {
      console.debug("API Response:", {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
      });
    }

    // Show success toast on 2xx responses
    const message = response.data?.message || "Operation successful";
    toast.success(message);

    return response.data;
  },
  (error: AxiosError<{ message?: string; detail?: string }>) => {
    // Debug logging
    if (DEBUG_MODE) {
      console.debug("API Response Error:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
    }

    // Extract error message from various response formats
    const message =
      error.response?.data?.message ||
      error.response?.data?.detail ||
      error.message ||
      "An unexpected error occurred";

    // Show error toast on non-2xx responses
    toast.error(message);

    throw new Error(message);
  }
);

// Typed API methods
export const api = {
  get: <T = unknown>(
    url: string,
    config?: Parameters<typeof apiClient.get>[1]
  ) => apiClient.get<T, T>(url, config),

  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof apiClient.post>[2]
  ) => apiClient.post<T, T>(url, data, config),

  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: Parameters<typeof apiClient.put>[2]
  ) => apiClient.put<T, T>(url, data, config),

  delete: <T = unknown>(
    url: string,
    config?: Parameters<typeof apiClient.delete>[1]
  ) => apiClient.delete<T, T>(url, config),
};
