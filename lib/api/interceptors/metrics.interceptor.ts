/**
 * Metrics Interceptor
 * 
 * This module tracks request metrics for monitoring and analytics.
 * 
 * @module lib/api/interceptors/metrics.interceptor
 */

import { InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { defaultMetricsCollector, MetricsCollector, RequestMetrics } from '@/lib/services/metrics-collector';
import { EEnv } from '@/configs/env';

/**
 * Metrics interceptor configuration
 */
export interface MetricsInterceptorConfig {
  /**
   * Whether to collect metrics for this request
   * @default true
   */
  collectMetrics?: boolean;
}

/**
 * Global metrics collector instance
 */
let metricsCollector: MetricsCollector = defaultMetricsCollector;

/**
 * Configures the metrics interceptor with a custom collector
 * 
 * @param collector - Custom metrics collector instance
 */
export function configureMetricsCollector(collector: MetricsCollector): void {
  metricsCollector = collector;
}

/**
 * Metrics Request Interceptor
 * 
 * Marks the start time for request duration tracking.
 * 
 * @param config - Axios request configuration
 * @returns Modified request configuration
 */
export function metricsRequestInterceptor(
  config: InternalAxiosRequestConfig & MetricsInterceptorConfig
): InternalAxiosRequestConfig {
  // Skip if metrics collection disabled
  if (config.collectMetrics === false) {
    return config;
  }

  // Mark request start time
  (config as { _startTime?: number })._startTime = Date.now();

  return config;
}

/**
 * Metrics Response Interceptor
 * 
 * Records successful request metrics.
 * 
 * @param response - Axios response
 * @returns Original response
 */
export function metricsResponseInterceptor(
  response: AxiosResponse
): AxiosResponse {
  const config = response.config as InternalAxiosRequestConfig & 
    MetricsInterceptorConfig & 
    { _startTime?: number; _retryCount?: number; _useCache?: boolean };

  // Skip if metrics collection disabled or no start time
  if (config.collectMetrics === false || !config._startTime) {
    return response;
  }

  const duration = Date.now() - config._startTime;

  const metric: RequestMetrics = {
    url: config.url || '',
    method: config.method?.toUpperCase() || 'GET',
    status: response.status,
    duration,
    timestamp: config._startTime,
    success: true,
    cached: config._useCache,
    retries: config._retryCount || 0,
  };

  metricsCollector.record(metric);

  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug('📊 Request Metrics:', {
      url: metric.url,
      method: metric.method,
      duration: `${metric.duration}ms`,
      status: metric.status,
      cached: metric.cached,
      retries: metric.retries,
    });
  }

  return response;
}

/**
 * Metrics Error Interceptor
 * 
 * Records failed request metrics.
 * 
 * @param error - Axios error
 * @returns Rejected promise
 */
export function metricsErrorInterceptor(
  error: AxiosError
): Promise<never> {
  const config = error.config as (InternalAxiosRequestConfig & 
    MetricsInterceptorConfig & 
    { _startTime?: number; _retryCount?: number }) | undefined;

  // Record metric if we have config and start time
  if (config && config._startTime && config.collectMetrics !== false) {
    const duration = Date.now() - config._startTime;

    const metric: RequestMetrics = {
      url: config.url || '',
      method: config.method?.toUpperCase() || 'GET',
      status: error.response?.status,
      duration,
      timestamp: config._startTime,
      success: false,
      error: error.message,
      retries: config._retryCount || 0,
    };

    metricsCollector.record(metric);

    if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
      console.debug('📊 Request Metrics (Error):', {
        url: metric.url,
        method: metric.method,
        duration: `${metric.duration}ms`,
        status: metric.status,
        error: metric.error,
        retries: metric.retries,
      });
    }
  }

  return Promise.reject(error);
}

/**
 * Gets current metrics summary
 */
export function getMetricsSummary(): string {
  return metricsCollector.getSummary();
}

/**
 * Gets aggregated metrics
 */
export function getAggregatedMetrics(since?: number) {
  return metricsCollector.getAggregated(since);
}

/**
 * Clears all collected metrics
 */
export function clearMetrics(): void {
  metricsCollector.clear();
}
