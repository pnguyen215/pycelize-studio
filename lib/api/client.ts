import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_PYCELIZE_API_URL || 'http://localhost:5050/api/v1';
const ENABLE_DEBUGGING = process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING === 'true';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for large file uploads
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Set Content-Type for FormData automatically
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    // Debug logging
    if (ENABLE_DEBUGGING) {
      console.debug('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data instanceof FormData ? '[FormData]' : config.data,
      });
    }
    
    return config;
  },
  (error) => {
    if (ENABLE_DEBUGGING) {
      console.debug('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Debug logging
    if (ENABLE_DEBUGGING) {
      console.debug('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
    }
    
    // Show success toast for 2xx responses
    const message = response.data?.message || 'Operation completed successfully';
    toast.success(message);
    
    return response.data;
  },
  (error: AxiosError<{ message?: string; error?: string; detail?: string }>) => {
    // Debug logging
    if (ENABLE_DEBUGGING) {
      console.debug('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        data: error.response?.data,
      });
    }
    
    // Show error toast for non-2xx responses
    const message = 
      error.response?.data?.message || 
      error.response?.data?.error || 
      error.response?.data?.detail || 
      error.message || 
      'An unexpected error occurred';
    
    toast.error(message);
    
    throw new Error(message);
  }
);
