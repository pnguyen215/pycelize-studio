/**
 * Response Interceptor
 *
 * This module handles all incoming HTTP responses before they reach the application code.
 * It performs post-processing tasks such as:
 *
 * - Success notification management
 * - Debug logging for development
 * - Response data extraction and normalization
 * - Integration with the centralized notification system
 *
 * The interceptor provides a consistent response handling pattern across the entire
 * application, ensuring uniform user feedback and data formatting.
 *
 * @module lib/api/interceptors/response.interceptor
 */

import { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { EEnv } from "@/configs/env";
import { NotificationManager } from "@/lib/services/notification-manager";
import type { ApiRequestConfig } from "../types";

/**
 * Response Interceptor Handler
 *
 * Processes successful HTTP responses (2xx status codes) before they reach the application.
 * This function handles:
 *
 * 1. **Debug Logging**: Logs response details when debug mode is enabled
 * 2. **Success Notifications**: Shows success toasts unless explicitly disabled
 * 3. **Data Extraction**: Returns the response data directly for cleaner API usage
 *
 * The notification behavior can be controlled via the request configuration:
 * - Enabled by default for all successful responses
 * - Can be disabled per-request using `config.notification.enabled = false`
 * - Custom success messages can be provided via `config.notification.successMessage`
 *
 * @param {AxiosResponse} response - The Axios response object
 * @returns {AxiosResponse['data']} The extracted response data (typically response.data)
 *
 * @example
 * // Automatic success notification
 * const data = await api.get('/endpoint'); // Shows "Operation successful" toast
 *
 * @example
 * // Disable notifications for this request
 * const data = await api.get('/endpoint', {
 *   notification: { enabled: false }
 * });
 *
 * @example
 * // Custom success message
 * const data = await api.post('/upload', formData, {
 *   notification: { successMessage: 'File uploaded successfully!' }
 * });
 */
export function responseInterceptor(
  response: AxiosResponse
): AxiosResponse["data"] {
  // Extract request configuration with notification settings
  const config = response.config as InternalAxiosRequestConfig &
    ApiRequestConfig;

  // Debug logging for development and troubleshooting
  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("🟢 API Response:", {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
    });
  }

  // Handle success notifications
  // Notifications are enabled by default unless explicitly disabled
  const notificationEnabled = config.notification?.enabled !== false;

  if (notificationEnabled) {
    // Use custom message if provided, otherwise extract from response or use default
    const successMessage =
      config.notification?.successMessage ||
      response.data?.message ||
      "Operation successful";

    NotificationManager.success(successMessage);
  }

  // Return the data directly for cleaner API usage
  // This allows: const data = await api.get('/endpoint')
  // Instead of: const response = await api.get('/endpoint'); const data = response.data
  return response.data;
}
