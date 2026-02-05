/**
 * Retry Interceptor
 *
 * This module provides automatic retry logic for failed requests with:
 * - Exponential backoff strategy
 * - Configurable retry conditions
 * - Customizable retry policies per request
 *
 * @module lib/api/interceptors/retry.interceptor
 */

import { AxiosError, InternalAxiosRequestConfig } from "axios";
import { EEnv } from "@/configs/env";

/**
 * Retry configuration interface
 */
export interface RetryConfig {
  /**
   * Maximum number of retry attempts
   * @default 3
   */
  retries?: number;

  /**
   * Initial delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;

  /**
   * Whether to use exponential backoff
   * @default true
   */
  exponentialBackoff?: boolean;

  /**
   * Maximum delay between retries in milliseconds
   * @default 30000
   */
  maxRetryDelay?: number;

  /**
   * HTTP status codes that should trigger a retry
   * @default [408, 429, 500, 502, 503, 504]
   */
  retryCondition?: (error: AxiosError) => boolean;

  /**
   * Callback invoked before each retry attempt
   */
  onRetry?: (error: AxiosError, retryCount: number) => void;
}

/**
 * Default retry configuration
 */
const defaultRetryConfig: Required<Omit<RetryConfig, "onRetry">> &
  Pick<RetryConfig, "onRetry"> = {
  retries: 3,
  retryDelay: 1000,
  exponentialBackoff: true,
  maxRetryDelay: 30000,
  retryCondition: (error: AxiosError) => {
    // Retry on network errors or specific HTTP status codes
    const retryStatusCodes = [408, 429, 500, 502, 503, 504];

    return (
      !error.response || // Network error
      retryStatusCodes.includes(error.response.status)
    );
  },
  onRetry: undefined,
};

/**
 * Current global retry configuration
 */
let globalRetryConfig = { ...defaultRetryConfig };

/**
 * Configures global retry behavior
 *
 * @param {Partial<RetryConfig>} config - Retry configuration options
 */
export function configureRetry(config: Partial<RetryConfig>): void {
  globalRetryConfig = {
    ...globalRetryConfig,
    ...config,
  };
}

/**
 * Calculates the delay before the next retry attempt
 *
 * @param {number} retryCount - Current retry attempt number (0-based)
 * @param {RetryConfig} config - Retry configuration
 * @returns {number} Delay in milliseconds
 */
function calculateRetryDelay(
  retryCount: number,
  config: Required<Omit<RetryConfig, "onRetry">>
): number {
  if (!config.exponentialBackoff) {
    return config.retryDelay;
  }

  // Exponential backoff: delay * (2 ^ retryCount) with jitter
  const exponentialDelay = config.retryDelay * Math.pow(2, retryCount);

  // Add jitter to prevent thundering herd problem
  const jitter = Math.random() * 0.3 * exponentialDelay;

  // Cap at max delay
  return Math.min(exponentialDelay + jitter, config.maxRetryDelay);
}

/**
 * Delays execution for the specified duration
 *
 * @param {number} ms - Delay in milliseconds
 * @returns {Promise<void>} Promise that resolves after the delay
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry Error Interceptor
 *
 * Automatically retries failed requests based on configured conditions
 * and retry policies.
 *
 * @param {AxiosError} error - The Axios error from the failed request
 * @returns {Promise<unknown>} Promise resolving to the retry attempt
 * @throws {AxiosError} If all retry attempts are exhausted
 *
 * @example
 * // Automatic retry on network errors and 5xx status codes
 * try {
 *   const data = await api.get('/endpoint');
 * } catch (error) {
 *   // Retries exhausted
 * }
 *
 * @example
 * // Custom retry configuration per request
 * const data = await api.get('/endpoint', {
 *   retry: {
 *     retries: 5,
 *     retryDelay: 2000,
 *     exponentialBackoff: false
 *   }
 * });
 */
export async function retryInterceptor(error: AxiosError): Promise<unknown> {
  const config = error.config as InternalAxiosRequestConfig & {
    retry?: RetryConfig;
    _retryCount?: number;
  };

  // Skip if no config or retries disabled
  if (!config) {
    return Promise.reject(error);
  }

  // Merge request-specific retry config with global config
  const retryConfig = {
    ...globalRetryConfig,
    ...(config.retry || {}),
  };

  // Initialize retry count
  config._retryCount = config._retryCount || 0;

  // Check if we should retry this error
  const shouldRetry = retryConfig.retryCondition
    ? retryConfig.retryCondition(error)
    : defaultRetryConfig.retryCondition(error);

  // Check if we've exhausted retry attempts
  if (!shouldRetry || config._retryCount >= retryConfig.retries) {
    return Promise.reject(error);
  }

  // Increment retry count
  config._retryCount += 1;

  // Calculate delay for this retry
  const retryDelay = calculateRetryDelay(config._retryCount - 1, retryConfig);

  // Debug logging
  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("🔄 Retrying request:", {
      url: config.url,
      attempt: config._retryCount,
      maxRetries: retryConfig.retries,
      delay: `${retryDelay}ms`,
      status: error.response?.status,
    });
  }

  // Call onRetry callback if provided
  if (retryConfig.onRetry) {
    retryConfig.onRetry(error, config._retryCount);
  }

  // Wait before retrying
  await delay(retryDelay);

  // Retry the request
  const axios = await import("axios");
  return axios.default.request(config);
}

/**
 * Checks if an error is retryable based on default conditions
 *
 * @param {AxiosError} error - The error to check
 * @returns {boolean} True if the error is retryable
 */
export function isRetryableError(error: AxiosError): boolean {
  return defaultRetryConfig.retryCondition(error);
}

/**
 * Gets the current retry count for a request config
 *
 * @param {InternalAxiosRequestConfig} config - The request configuration
 * @returns {number} Current retry count
 */
export function getRetryCount(
  config: InternalAxiosRequestConfig & { _retryCount?: number }
): number {
  return config._retryCount || 0;
}
