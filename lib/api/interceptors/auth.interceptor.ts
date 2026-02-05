/**
 * Authentication Interceptor
 *
 * This module handles authentication for all API requests, including:
 * - JWT token attachment to requests
 * - Token refresh on expiration
 * - Authentication state management
 * - Token storage and retrieval
 *
 * @module lib/api/interceptors/auth.interceptor
 */

import { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from "axios";
import { EEnv } from "@/configs/env";

/**
 * Authentication configuration interface
 */
export interface AuthConfig {
  /**
   * The authentication token (JWT, Bearer, etc.)
   */
  token?: string;

  /**
   * Token type (e.g., 'Bearer', 'Token')
   * @default 'Bearer'
   */
  tokenType?: string;

  /**
   * Token storage key in localStorage
   * @default 'auth_token'
   */
  storageKey?: string;

  /**
   * Refresh token storage key
   * @default 'refresh_token'
   */
  refreshTokenKey?: string;

  /**
   * Whether to automatically refresh expired tokens
   * @default true
   */
  autoRefresh?: boolean;

  /**
   * Token refresh endpoint
   * @default '/auth/refresh'
   */
  refreshEndpoint?: string;
}

/**
 * Default authentication configuration
 */
const defaultAuthConfig: Required<AuthConfig> = {
  token: "",
  tokenType: "Bearer",
  storageKey: "auth_token",
  refreshTokenKey: "refresh_token",
  autoRefresh: true,
  refreshEndpoint: "/auth/refresh",
};

/**
 * Current authentication configuration
 */
let currentAuthConfig: Required<AuthConfig> = { ...defaultAuthConfig };

/**
 * Flag to prevent multiple simultaneous refresh attempts
 */
let isRefreshing = false;

/**
 * Queue of failed requests waiting for token refresh
 */
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

/**
 * Processes the queue of failed requests after token refresh
 *
 * @param {Error | null} error - Error if refresh failed, null if successful
 * @param {string | null} token - New token if refresh successful
 */
function processQueue(error: Error | null, token: string | null = null): void {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
}

/**
 * Retrieves the authentication token from storage
 *
 * @returns {string | null} The stored token or null if not found
 */
export function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(currentAuthConfig.storageKey);
}

/**
 * Stores the authentication token
 *
 * @param {string} token - The token to store
 */
export function setStoredToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(currentAuthConfig.storageKey, token);
  currentAuthConfig.token = token;
}

/**
 * Retrieves the refresh token from storage
 *
 * @returns {string | null} The stored refresh token or null if not found
 */
export function getStoredRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(currentAuthConfig.refreshTokenKey);
}

/**
 * Stores the refresh token
 *
 * @param {string} token - The refresh token to store
 */
export function setStoredRefreshToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(currentAuthConfig.refreshTokenKey, token);
}

/**
 * Removes authentication tokens from storage
 */
export function clearAuthTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(currentAuthConfig.storageKey);
  localStorage.removeItem(currentAuthConfig.refreshTokenKey);
  currentAuthConfig.token = "";
}

/**
 * Configures the authentication interceptor
 *
 * @param {Partial<AuthConfig>} config - Authentication configuration options
 */
export function configureAuth(config: Partial<AuthConfig>): void {
  currentAuthConfig = {
    ...currentAuthConfig,
    ...config,
  };

  // Load token from storage if not provided
  if (!currentAuthConfig.token) {
    const storedToken = getStoredToken();
    if (storedToken) {
      currentAuthConfig.token = storedToken;
    }
  }
}

/**
 * Refreshes the authentication token
 *
 * @returns {Promise<string>} Promise resolving to the new token
 * @throws {Error} If token refresh fails
 */
async function refreshAuthToken(): Promise<string> {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  try {
    // Make refresh request to the API
    const response = await fetch(
      `${EEnv.NEXT_PUBLIC_PYCELIZE_API_URL}${currentAuthConfig.refreshEndpoint}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      }
    );

    if (!response.ok) {
      throw new Error("Token refresh failed");
    }

    const data = await response.json();
    const newToken = data.access_token || data.token;

    if (!newToken) {
      throw new Error("No token in refresh response");
    }

    // Store the new token
    setStoredToken(newToken);

    // Store new refresh token if provided
    if (data.refresh_token) {
      setStoredRefreshToken(data.refresh_token);
    }

    return newToken;
  } catch (error) {
    clearAuthTokens();
    throw error;
  }
}

/**
 * Authentication Request Interceptor
 *
 * Attaches the authentication token to outgoing requests.
 *
 * @param {InternalAxiosRequestConfig} config - The Axios request configuration
 * @returns {InternalAxiosRequestConfig} The modified request configuration
 */
export function authRequestInterceptor(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  // Get current token (from config or storage)
  const token = currentAuthConfig.token || getStoredToken();

  // Attach token to Authorization header if available
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `${currentAuthConfig.tokenType} ${token}`;
  }

  // Debug logging
  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("🔐 Auth Request:", {
      url: config.url,
      hasAuth: !!token,
      tokenType: currentAuthConfig.tokenType,
    });
  }

  return config;
}

/**
 * Authentication Response Interceptor Error Handler
 *
 * Handles 401 Unauthorized responses by attempting to refresh the token
 * and retrying the original request.
 *
 * @param {AxiosError} error - The Axios error
 * @returns {Promise<AxiosResponse>} Promise resolving to the retried response
 * @throws {Error} If token refresh fails or auto-refresh is disabled
 */
export async function authResponseErrorInterceptor(
  error: AxiosError
): Promise<AxiosResponse> {
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  // Only handle 401 errors with auto-refresh enabled
  if (
    error.response?.status === 401 &&
    currentAuthConfig.autoRefresh &&
    !originalRequest._retry
  ) {
    if (isRefreshing) {
      // Wait for the ongoing refresh to complete
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `${currentAuthConfig.tokenType} ${token}`;
          }
          // Import axios to retry the request
          return import("axios").then((axios) =>
            axios.default.request(originalRequest)
          );
        })
        .catch((err) => Promise.reject(err));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAuthToken();
      processQueue(null, newToken);

      // Retry original request with new token
      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `${currentAuthConfig.tokenType} ${newToken}`;
      }

      // Import axios to retry the request
      const axios = await import("axios");
      return axios.default.request(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as Error, null);
      clearAuthTokens();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(error);
}

/**
 * Checks if the user is currently authenticated
 *
 * @returns {boolean} True if a token is available
 */
export function isAuthenticated(): boolean {
  return !!(currentAuthConfig.token || getStoredToken());
}
