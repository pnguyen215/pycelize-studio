/**
 * Notification Manager Service
 *
 * This module provides a centralized notification management system using Sonner toast
 * library. It acts as an abstraction layer that allows for:
 *
 * - Easy auditing of all notification triggers throughout the application
 * - Configurable notification behavior per API call or component
 * - Consistent user feedback patterns
 * - Future extensibility (e.g., adding analytics, custom styling, or alternative notification systems)
 *
 * @module lib/services/notification-manager
 */

import { toast, ExternalToast } from "sonner";

/**
 * Configuration options for notification behavior.
 * Allows fine-grained control over when and how notifications are displayed.
 */
export interface NotificationConfig {
  /**
   * Whether notifications should be shown for this operation.
   * When false, all notification methods will be no-ops.
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Custom duration in milliseconds before the toast auto-dismisses.
   *
   * @default undefined (uses Sonner's default)
   */
  duration?: number;

  /**
   * Additional Sonner toast options for advanced customization.
   * See Sonner documentation for full list of options.
   */
  options?: ExternalToast;
}

/**
 * Notification Manager Class
 *
 * Provides a centralized interface for managing application-wide notifications.
 * This class wraps the Sonner toast library and adds configuration capabilities
 * that allow notifications to be enabled or disabled per operation.
 *
 * Key Features:
 * - Configurable notification behavior (enable/disable per call)
 * - Support for all Sonner toast types (success, error, info, warning, loading)
 * - Consistent API across the application
 * - Easy to audit and maintain
 *
 * @class NotificationManager
 *
 * @example
 * // Basic usage with default behavior (notifications enabled)
 * NotificationManager.success("Operation completed successfully");
 *
 * @example
 * // Disable notifications for a specific operation
 * NotificationManager.success("Silent operation", { enabled: false });
 *
 * @example
 * // Custom duration
 * NotificationManager.error("Error occurred", { duration: 5000 });
 *
 * @example
 * // Advanced Sonner options
 * NotificationManager.info("Info message", {
 *   options: {
 *     description: "Additional details here",
 *     action: {
 *       label: "Undo",
 *       onClick: () => console.log("Undo clicked")
 *     }
 *   }
 * });
 */
export class NotificationManager {
  /**
   * Default notification configuration.
   * Notifications are enabled by default across the application.
   *
   * @private
   * @static
   */
  private static defaultConfig: NotificationConfig = {
    enabled: true,
  };

  /**
   * Checks if notifications are enabled based on the provided configuration.
   *
   * @private
   * @static
   * @param config - The notification configuration to check
   * @returns True if notifications should be shown, false otherwise
   */
  private static isEnabled(config?: NotificationConfig): boolean {
    return config?.enabled !== false; // Enabled by default unless explicitly disabled
  }

  /**
   * Builds the Sonner toast options from the notification configuration.
   *
   * @private
   * @static
   * @param config - The notification configuration
   * @returns Sonner toast options object
   */
  private static buildToastOptions(
    config?: NotificationConfig
  ): ExternalToast | undefined {
    if (!config) return undefined;

    return {
      ...config.options,
      duration: config.duration,
    };
  }

  /**
   * Displays a success notification.
   * Used for successful operations like API calls, form submissions, etc.
   *
   * @static
   * @param message - The success message to display
   * @param config - Optional notification configuration
   * @returns Toast ID for programmatic control (dismiss, update, etc.)
   *
   * @example
   * NotificationManager.success("File uploaded successfully");
   */
  public static success(
    message: string,
    config?: NotificationConfig
  ): string | number | undefined {
    if (!this.isEnabled(config)) return undefined;
    return toast.success(message, this.buildToastOptions(config));
  }

  /**
   * Displays an error notification.
   * Used for failed operations, validation errors, API errors, etc.
   *
   * @static
   * @param message - The error message to display
   * @param config - Optional notification configuration
   * @returns Toast ID for programmatic control
   *
   * @example
   * NotificationManager.error("Failed to upload file");
   */
  public static error(
    message: string,
    config?: NotificationConfig
  ): string | number | undefined {
    if (!this.isEnabled(config)) return undefined;
    return toast.error(message, this.buildToastOptions(config));
  }

  /**
   * Displays an informational notification.
   * Used for neutral information, tips, or system messages.
   *
   * @static
   * @param message - The informational message to display
   * @param config - Optional notification configuration
   * @returns Toast ID for programmatic control
   *
   * @example
   * NotificationManager.info("Processing in background...");
   */
  public static info(
    message: string,
    config?: NotificationConfig
  ): string | number | undefined {
    if (!this.isEnabled(config)) return undefined;
    return toast.info(message, this.buildToastOptions(config));
  }

  /**
   * Displays a warning notification.
   * Used for cautionary messages that don't prevent operation but require attention.
   *
   * @static
   * @param message - The warning message to display
   * @param config - Optional notification configuration
   * @returns Toast ID for programmatic control
   *
   * @example
   * NotificationManager.warning("Large file detected. Upload may take time.");
   */
  public static warning(
    message: string,
    config?: NotificationConfig
  ): string | number | undefined {
    if (!this.isEnabled(config)) return undefined;
    return toast.warning(message, this.buildToastOptions(config));
  }

  /**
   * Displays a loading notification with optional promise handling.
   * Useful for long-running operations where you want to show loading state.
   *
   * @static
   * @param message - The loading message to display
   * @param config - Optional notification configuration
   * @returns Toast ID for programmatic control
   *
   * @example
   * const toastId = NotificationManager.loading("Uploading file...");
   * // Later, dismiss it
   * NotificationManager.dismiss(toastId);
   */
  public static loading(
    message: string,
    config?: NotificationConfig
  ): string | number | undefined {
    if (!this.isEnabled(config)) return undefined;
    return toast.loading(message, this.buildToastOptions(config));
  }

  /**
   * Displays a generic notification (default Sonner styling).
   *
   * @static
   * @param message - The message to display
   * @param config - Optional notification configuration
   * @returns Toast ID for programmatic control
   *
   * @example
   * NotificationManager.message("Generic notification");
   */
  public static message(
    message: string,
    config?: NotificationConfig
  ): string | number | undefined {
    if (!this.isEnabled(config)) return undefined;
    return toast(message, this.buildToastOptions(config));
  }

  /**
   * Dismisses a specific toast by ID.
   * Useful when you need to programmatically close a notification.
   *
   * @static
   * @param toastId - The ID of the toast to dismiss (returned from show methods)
   *
   * @example
   * const toastId = NotificationManager.loading("Processing...");
   * // Later
   * NotificationManager.dismiss(toastId);
   */
  public static dismiss(toastId?: string | number): void {
    toast.dismiss(toastId);
  }

  /**
   * Handles promise-based operations with automatic loading, success, and error states.
   * Shows a loading toast, then automatically updates to success or error based on promise resolution.
   *
   * @static
   * @param promise - The promise to track
   * @param messages - Messages for loading, success, and error states
   * @param config - Optional notification configuration
   * @returns The original promise (for chaining)
   *
   * @example
   * NotificationManager.promise(
   *   uploadFile(file),
   *   {
   *     loading: "Uploading file...",
   *     success: "File uploaded successfully",
   *     error: "Failed to upload file"
   *   }
   * );
   */
  public static promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    },
    config?: NotificationConfig
  ): Promise<T> {
    if (!this.isEnabled(config)) return promise;

    toast.promise(promise, {
      loading: messages.loading,
      success: messages.success,
      error: messages.error,
      ...this.buildToastOptions(config),
    });

    return promise;
  }

  /**
   * Common notification function that automatically determines the notification type
   * based on HTTP status code or handles promise-based async operations.
   *
   * This method supports two modes:
   * 1. Immediate notification - Based on HTTP status code (when response is already received)
   * 2. Promise-based notification - For ongoing async operations (file uploads, processing, etc.)
   *
   * HTTP Status Code Mapping:
   * - 2xx (Success) → Success notification
   * - 3xx (Redirection/Processing) → Loading notification
   * - 4xx/5xx (Client/Server Error) → Error notification
   *
   * @static
   * @param options - Configuration object for the notification
   * @returns Toast ID for immediate notifications, or the promise for async operations
   *
   * @example
   * // Immediate notification based on HTTP status code
   * NotificationManager.notify({
   *   statusCode: 200,
   *   message: "User created successfully"
   * });
   *
   * @example
   * // Error notification
   * NotificationManager.notify({
   *   statusCode: 404,
   *   message: "User not found"
   * });
   *
   * @example
   * // Promise-based notification for async operations
   * NotificationManager.notify({
   *   promise: uploadFile(file),
   *   messages: {
   *     loading: "Uploading file...",
   *     success: "File uploaded successfully",
   *     error: "Failed to upload file"
   *   }
   * });
   *
   * @example
   * // Promise-based with custom status code handling
   * const promise = fetch('/api/users').then(res => {
   *   NotificationManager.notify({
   *     statusCode: res.status,
   *     message: res.status === 200 ? "Success" : "Error"
   *   });
   *   return res.json();
   * });
   */
  public static notify<T>(
    options:
      | {
          statusCode: number;
          message: string;
          config?: NotificationConfig;
        }
      | {
          promise: Promise<T>;
          messages: {
            loading: string;
            success: string;
            error: string;
          };
          config?: NotificationConfig;
        }
  ): string | number | undefined | Promise<T> {
    // Promise-based notification
    if ("promise" in options) {
      return this.promise(options.promise, options.messages, options.config);
    }

    // Immediate notification based on HTTP status code
    const { statusCode, message, config } = options;

    // 2xx: Success
    if (statusCode >= 200 && statusCode < 300) {
      return this.success(message, config);
    }

    // 3xx: Redirection/Processing/Pending state (show as loading)
    if (statusCode >= 300 && statusCode < 400) {
      return this.loading(message, config);
    }

    // 4xx/5xx: Client Error or Server Error
    if (statusCode >= 400) {
      return this.error(message, config);
    }

    // Default to info for any other status codes (1xx, etc.)
    return this.info(message, config);
  }
}

/**
 * Default export for convenience.
 * Allows for both named and default imports.
 */
export default NotificationManager;
