/**
 * Interceptors Index
 * 
 * This module provides a centralized export point for all Axios interceptors.
 * It also includes utility functions to register interceptors on an Axios instance.
 * 
 * @module lib/api/interceptors
 */

// Core interceptors
export { requestInterceptor, requestErrorHandler } from './request.interceptor';
export { responseInterceptor } from './response.interceptor';
export { errorInterceptor } from './error.interceptor';

// Advanced feature interceptors
export { 
  authRequestInterceptor, 
  authResponseErrorInterceptor,
  configureAuth,
  setStoredToken,
  clearAuthTokens,
  isAuthenticated,
} from './auth.interceptor';

export { 
  retryInterceptor,
  configureRetry,
  isRetryableError,
} from './retry.interceptor';

export {
  cacheRequestInterceptor,
  cacheResponseInterceptor,
  invalidateCache,
  clearAllCache,
  getCacheStats,
} from './cache.interceptor';

export {
  rateLimitInterceptor,
  getRateLimitStatus,
} from './rate-limit.interceptor';

export {
  offlineRequestInterceptor,
  offlineErrorInterceptor,
  getOfflineStatus,
  syncOfflineQueue,
  clearOfflineQueue,
  onOfflineStatusChange,
  offOfflineStatusChange,
} from './offline.interceptor';

export {
  metricsRequestInterceptor,
  metricsResponseInterceptor,
  metricsErrorInterceptor,
  getMetricsSummary,
  getAggregatedMetrics,
  clearMetrics,
} from './metrics.interceptor';

import { AxiosInstance } from 'axios';
import { requestInterceptor, requestErrorHandler } from './request.interceptor';
import { responseInterceptor } from './response.interceptor';
import { errorInterceptor } from './error.interceptor';
import { authRequestInterceptor, authResponseErrorInterceptor } from './auth.interceptor';
import { retryInterceptor } from './retry.interceptor';
import { cacheRequestInterceptor, cacheResponseInterceptor } from './cache.interceptor';
import { rateLimitInterceptor } from './rate-limit.interceptor';
import { offlineRequestInterceptor, offlineErrorInterceptor } from './offline.interceptor';
import { metricsRequestInterceptor, metricsResponseInterceptor, metricsErrorInterceptor } from './metrics.interceptor';

/**
 * Interceptor setup options
 */
export interface InterceptorOptions {
  /**
   * Enable authentication interceptor
   * @default false
   */
  auth?: boolean;

  /**
   * Enable retry interceptor
   * @default true
   */
  retry?: boolean;

  /**
   * Enable cache interceptor
   * @default false
   */
  cache?: boolean;

  /**
   * Enable rate limiting interceptor
   * @default false
   */
  rateLimit?: boolean;

  /**
   * Enable offline support interceptor
   * @default false
   */
  offline?: boolean;

  /**
   * Enable metrics collection interceptor
   * @default true
   */
  metrics?: boolean;
}

/**
 * Registers core interceptors on the provided Axios instance.
 * This includes basic request/response handling, errors, and notifications.
 * 
 * @param {AxiosInstance} instance - The Axios instance to configure
 * @returns {AxiosInstance} The configured Axios instance (for chaining)
 */
export function setupCoreInterceptors(instance: AxiosInstance): AxiosInstance {
  // Register request interceptors
  instance.interceptors.request.use(requestInterceptor, requestErrorHandler);

  // Register response interceptors with proper typing
  instance.interceptors.response.use(
    responseInterceptor as Parameters<typeof instance.interceptors.response.use>[0],
    errorInterceptor
  );

  return instance;
}

/**
 * Registers all interceptors on the provided Axios instance with full feature set.
 * This includes authentication, retry, caching, rate limiting, offline support, and metrics.
 * 
 * @param {AxiosInstance} instance - The Axios instance to configure
 * @param {InterceptorOptions} options - Options to enable/disable specific interceptors
 * @returns {AxiosInstance} The configured Axios instance (for chaining)
 * 
 * @example
 * import { axiosInstance } from './axios-instance';
 * import { setupInterceptors } from './interceptors';
 * 
 * // Setup with all features enabled
 * const client = setupInterceptors(axiosInstance, {
 *   auth: true,
 *   retry: true,
 *   cache: true,
 *   rateLimit: true,
 *   offline: true,
 *   metrics: true,
 * });
 */
export function setupInterceptors(
  instance: AxiosInstance,
  options: InterceptorOptions = {}
): AxiosInstance {
  const opts = {
    auth: false,
    retry: true,
    cache: false,
    rateLimit: false,
    offline: false,
    metrics: true,
    ...options,
  };

  // Request interceptors (order matters - first registered executes last)
  // The order should be: metrics -> auth -> rate limit -> offline -> cache -> core request
  
  if (opts.metrics) {
    instance.interceptors.request.use(metricsRequestInterceptor);
  }

  if (opts.auth) {
    instance.interceptors.request.use(authRequestInterceptor);
  }

  if (opts.rateLimit) {
    instance.interceptors.request.use(rateLimitInterceptor);
  }

  if (opts.offline) {
    instance.interceptors.request.use(offlineRequestInterceptor);
  }

  if (opts.cache) {
    instance.interceptors.request.use(cacheRequestInterceptor as Parameters<typeof instance.interceptors.request.use>[0]);
  }

  // Core request interceptor (always enabled)
  instance.interceptors.request.use(requestInterceptor, requestErrorHandler);

  // Response interceptors (order matters - first registered executes first)
  // The order should be: core response -> cache -> metrics
  
  // Core response interceptor (always enabled)
  instance.interceptors.response.use(
    responseInterceptor as Parameters<typeof instance.interceptors.response.use>[0],
    errorInterceptor
  );

  if (opts.cache) {
    instance.interceptors.response.use(cacheResponseInterceptor);
  }

  if (opts.metrics) {
    instance.interceptors.response.use(metricsResponseInterceptor, metricsErrorInterceptor);
  }

  // Error interceptors (handle errors in specific order)
  // The order should be: auth refresh -> retry -> offline -> metrics
  
  if (opts.auth) {
    instance.interceptors.response.use(undefined, authResponseErrorInterceptor);
  }

  if (opts.retry) {
    instance.interceptors.response.use(undefined, retryInterceptor);
  }

  if (opts.offline) {
    instance.interceptors.response.use(undefined, offlineErrorInterceptor);
  }

  return instance;
}

