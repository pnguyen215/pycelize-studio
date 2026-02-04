import axios, { AxiosInstance, AxiosError } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = process.env.NEXT_PUBLIC_PYCELIZE_API_URL || 'http://localhost:5050/api/v1';
const IS_DEBUGGING = process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING === 'true';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 120000, // 2 minutes for large file uploads
  headers: {
    'Accept': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Set Content-Type for FormData automatically
    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'multipart/form-data';
    }
    
    // Debug logging
    if (IS_DEBUGGING) {
      console.log('🚀 API Request:', {
        method: config.method?.toUpperCase(),
        url: config.url,
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data instanceof FormData ? '[FormData]' : config.data,
        params: config.params,
      });
    }
    
    return config;
  },
  (error) => {
    if (IS_DEBUGGING) {
      console.error('❌ Request Error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Debug logging
    if (IS_DEBUGGING) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        data: response.data,
      });
      console.log('📦 Response Data (Pretty):', JSON.stringify(response.data, null, 2));
    }
    
    // Show success toast if message exists
    if (response.data?.message) {
      toast.success(response.data.message);
    }
    
    return response.data;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    const errorMessage = error.response?.data?.message || 
                        error.response?.data?.error ||
                        error.message || 
                        'An unexpected error occurred';
    
    // Debug logging
    if (IS_DEBUGGING) {
      console.error('❌ API Error:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        message: errorMessage,
        data: error.response?.data,
      });
      console.error('🔍 Error Details (Pretty):', JSON.stringify({
        status: error.response?.status,
        data: error.response?.data,
        message: errorMessage,
      }, null, 2));
    } else {
      // In non-debug mode, only log errors
      console.error('API Error:', errorMessage);
    }
    
    // Show error toast
    toast.error(errorMessage);
    
    throw new Error(errorMessage);
  }
);

// Export API response interface
export interface ApiResponse<T> {
  data: T;
  message: string;
  meta: {
    api_version: string;
    locale: string;
    request_id: string;
    requested_time: string;
  };
  status_code: number;
  total: number;
}

