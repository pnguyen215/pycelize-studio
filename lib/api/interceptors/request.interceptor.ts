/**
 * Request Interceptor
 *
 * This module handles all outgoing HTTP requests before they are sent to the server.
 * It performs pre-processing tasks such as:
 *
 * - Automatic Content-Type header management for FormData
 * - Debug logging for development troubleshooting
 * - Request metadata enrichment
 *
 * The interceptor operates transparently, allowing clean API call code while
 * providing powerful request manipulation capabilities.
 *
 * @module lib/api/interceptors/request.interceptor
 */

import { InternalAxiosRequestConfig } from "axios";
import { EEnv } from "@/configs/env";

/**
 * Headers
 * @description Headers constants
 * @example
 * config.headers[Headers.CONTENT_TYPE] = MediaTypes.FORM_DATA;
 * config.headers[Headers.AUTHORIZATION] = `Bearer ${token}`;
 * config.headers[Headers.ACCEPT] = MediaTypes.JSON;
 * config.headers[Headers.USER_AGENT] = "MyApp/1.0.0";
 * config.headers[Headers.REFERER] = "https://myapp.com";
 * config.headers[Headers.COOKIE] = "sessionId=1234567890";
 */
export const Headers = {
  CONTENT_TYPE: "Content-Type",
  AUTHORIZATION: "Authorization",
  ACCEPT: "Accept",
  USER_AGENT: "User-Agent",
  REFERER: "Referer",
  COOKIE: "Cookie",
};

/**
 * Media Types
 * @description Media types constants
 * @example
 * config.headers[Headers.CONTENT_TYPE] = MediaTypes.FORM_DATA;
 * config.headers[Headers.AUTHORIZATION] = `Bearer ${token}`;
 * config.headers[Headers.ACCEPT] = MediaTypes.JSON;
 * config.headers[Headers.USER_AGENT] = "MyApp/1.0.0";
 * config.headers[Headers.REFERER] = "https://myapp.com";
 * config.headers[Headers.COOKIE] = "sessionId=1234567890";
 */
export const MediaTypes = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  TEXT: "text/plain",
  HTML: "text/html",
  XML: "application/xml",
  CSV: "text/csv",
};

/**
 * Request Interceptor Handler
 *
 * Processes outgoing HTTP requests before they are transmitted to the server.
 * This function handles:
 *
 * 1. **Content-Type Auto-Detection**: Automatically sets multipart/form-data
 *    header when FormData is detected in the request body
 *
 * 2. **Debug Logging**: When debug mode is enabled, logs comprehensive request
 *    details including method, URL, headers, and sanitized data
 *
 * @param {InternalAxiosRequestConfig} config - The Axios request configuration object
 * @returns {InternalAxiosRequestConfig} The modified request configuration
 *
 * @example
 * // This runs automatically for all requests
 * axios.interceptors.request.use(requestInterceptor);
 */
export function requestInterceptor(
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig {
  // Auto-detect and set Content-Type for FormData
  // This ensures proper multipart boundaries are set for file uploads
  if (config.data instanceof FormData) {
    config.headers[Headers.CONTENT_TYPE] = MediaTypes.FORM_DATA;
  }

  // Debug logging for development and troubleshooting
  // Only active when NEXT_PUBLIC_DEBUGGING_REQUEST is enabled
  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("📩 API Request:", {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      headers: config.headers,
      // Sanitize FormData in logs for readability
      data: config.data instanceof FormData ? "[{binary}]" : config.data,
    });
  }

  return config;
}

/**
 * Request Error Handler
 *
 * Handles errors that occur during request preparation or transmission.
 * This typically catches network issues, invalid configurations, or
 * errors in request interceptors.
 *
 * @param {unknown} error - The error that occurred during request preparation
 * @returns {Promise<never>} Rejected promise with the error
 *
 * @example
 * // This runs automatically when request preparation fails
 * axios.interceptors.request.use(requestInterceptor, requestErrorHandler);
 */
export function requestErrorHandler(error: unknown): Promise<never> {
  // Log request errors in debug mode for troubleshooting
  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("🔴 API Request Error:", error);
  }

  return Promise.reject(error);
}
