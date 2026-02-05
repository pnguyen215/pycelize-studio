/**
 * Error Interceptor
 *
 * This module handles all HTTP errors and exceptions that occur during API communication.
 * It provides centralized error handling with:
 *
 * - User-friendly error notifications
 * - Debug logging for troubleshooting
 * - Consistent error message extraction from various response formats
 * - Configurable notification behavior per request
 *
 * The interceptor ensures that all errors are handled uniformly, providing clear
 * feedback to users while maintaining detailed logs for developers.
 *
 * @module lib/api/interceptors/error.interceptor
 */

import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { EEnv } from "@/configs/env";
import { NotificationManager } from "@/lib/services/notification-manager";
import type { ApiRequestConfig } from "../types";

/**
 * Error response data structure.
 * Different APIs may return errors in different formats, this interface
 * covers the common patterns.
 */
interface BaseErrorResponse {
  message?: string;
  detail?: string;
  error?: string;
}

/**
 * Error Interceptor Handler
 *
 * Processes all HTTP errors (4xx, 5xx status codes) and network failures.
 * This function handles:
 *
 * 1. **Error Message Extraction**: Intelligently extracts error messages from
 *    various API response formats (message, detail, error fields)
 *
 * 2. **Debug Logging**: Logs comprehensive error details when debug mode is enabled
 *
 * 3. **Error Notifications**: Shows error toasts unless explicitly disabled
 *
 * 4. **Error Normalization**: Converts various error types into consistent Error objects
 *
 * The notification behavior can be controlled via the request configuration:
 * - Enabled by default for all errors
 * - Can be disabled per-request using `config.notification.enabled = false`
 * - Custom error messages can be provided via `config.notification.errorMessage`
 *
 * @param {unknown} error - The error that occurred during the request
 * @returns {Promise<never>} Rejected promise with a normalized Error object
 *
 * @example
 * // Automatic error notification
 * try {
 *   await api.get('/invalid-endpoint');
 * } catch (error) {
 *   // Error toast shown automatically
 *   console.error(error.message);
 * }
 *
 * @example
 * // Disable error notifications for this request
 * try {
 *   await api.get('/endpoint', {
 *     notification: { enabled: false }
 *   });
 * } catch (error) {
 *   // No toast shown, handle silently
 * }
 *
 * @example
 * // Custom error message
 * try {
 *   await api.delete('/resource', {
 *     notification: { errorMessage: 'Failed to delete resource' }
 *   });
 * } catch (error) {
 *   // Shows custom message instead of API error
 * }
 */
export function errorInterceptor(error: unknown): Promise<never> {
  // Type guard: Check if this is an Axios error
  if (!(error instanceof AxiosError)) {
    // Non-Axios errors (e.g., network failures, timeout)
    const message =
      error instanceof Error ? error.message : "An unexpected error occurred";

    if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
      console.debug("🔴 Non-Axios Error:", error);
    }

    NotificationManager.error(message);
    return Promise.reject(new Error(message));
  }

  // Extract request configuration with notification settings
  // Safely cast to our extended type, ensuring we handle undefined config
  const config = error.config as
    | (InternalAxiosRequestConfig & ApiRequestConfig)
    | undefined;

  // Debug logging for development and troubleshooting
  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("🔴 API Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      config: config ? "present" : "undefined",
    });
  }

  // Extract error message from various response formats
  // Different APIs may structure error responses differently
  const errorData = error.response?.data as BaseErrorResponse | undefined;
  const extractedMessage =
    errorData?.message ||
    errorData?.detail ||
    errorData?.error ||
    error.message ||
    "An unexpected error occurred";

  // Handle error notifications
  // Notifications are enabled by default unless explicitly disabled
  // Using optional chaining to safely access nested properties
  const notificationEnabled = config?.notification?.enabled !== false;

  if (notificationEnabled) {
    // Use custom error message if provided, otherwise use extracted message
    const errorMessage = config?.notification?.errorMessage || extractedMessage;
    NotificationManager.error(errorMessage);
  }

  // Throw normalized error for consistent error handling in application code
  return Promise.reject(new Error(extractedMessage));
}
