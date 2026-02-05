/**
 * Offline Interceptor
 * 
 * This module handles offline scenarios by queuing requests and
 * syncing when connection is restored.
 * 
 * @module lib/api/interceptors/offline.interceptor
 */

import { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { defaultOfflineManager, OfflineManager } from '@/lib/services/offline-manager';
import { EEnv } from '@/configs/env';

/**
 * Offline interceptor configuration
 */
export interface OfflineInterceptorConfig {
  /**
   * Whether to queue this request when offline
   * @default true for mutations (POST/PUT/DELETE), false for reads (GET)
   */
  queueWhenOffline?: boolean;
}

/**
 * Global offline manager instance
 */
let offlineManager: OfflineManager = defaultOfflineManager;

/**
 * Configures the offline interceptor with a custom manager
 * 
 * @param manager - Custom offline manager instance
 */
export function configureOfflineManager(manager: OfflineManager): void {
  offlineManager = manager;
}

/**
 * Checks if request should be queued when offline
 * 
 * @param config - Request configuration
 * @returns True if request should be queued
 */
function shouldQueueRequest(config: InternalAxiosRequestConfig & OfflineInterceptorConfig): boolean {
  // Check explicit configuration
  if (config.queueWhenOffline !== undefined) {
    return config.queueWhenOffline;
  }

  // By default, queue mutations but not reads
  const method = config.method?.toUpperCase();
  return method === 'POST' || method === 'PUT' || method === 'DELETE' || method === 'PATCH';
}

/**
 * Offline Request Interceptor
 * 
 * Queues requests when offline if configured to do so.
 * 
 * @param config - Axios request configuration
 * @returns Request configuration or throws error if offline
 * @throws Error if offline and request cannot be queued
 */
export async function offlineRequestInterceptor(
  config: InternalAxiosRequestConfig & OfflineInterceptorConfig
): Promise<InternalAxiosRequestConfig> {
  const isOnline = offlineManager.getOnlineStatus();

  if (!isOnline) {
    if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
      console.debug('📡 Offline detected:', {
        url: config.url,
        method: config.method,
      });
    }

    if (shouldQueueRequest(config)) {
      const queued = offlineManager.enqueue(config);
      
      if (queued) {
        if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
          console.debug('📡 Request queued for offline:', {
            url: config.url,
            queueSize: offlineManager.getQueueSize(),
          });
        }

        // Throw a special error to indicate request was queued
        const error = new Error('Request queued for offline sync');
        (error as Error & { isOfflineQueue?: boolean }).isOfflineQueue = true;
        throw error;
      } else {
        throw new Error('Failed to queue offline request');
      }
    } else {
      throw new Error('Network unavailable');
    }
  }

  return config;
}

/**
 * Offline Error Interceptor
 * 
 * Handles network errors by potentially queuing the request.
 * 
 * @param error - Axios error
 * @returns Rejected promise
 */
export async function offlineErrorInterceptor(
  error: AxiosError
): Promise<never> {
  const config = error.config as (InternalAxiosRequestConfig & OfflineInterceptorConfig) | undefined;

  // Check if this is a network error
  const isNetworkError = !error.response && error.message.includes('Network Error');

  if (isNetworkError && config && shouldQueueRequest(config)) {
    const queued = offlineManager.enqueue(config);

    if (queued) {
      if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
        console.debug('📡 Network error - request queued:', {
          url: config.url,
          queueSize: offlineManager.getQueueSize(),
        });
      }

      // Return a special error indicating the request was queued
      const queuedError = new Error('Request queued due to network error');
      (queuedError as Error & { isOfflineQueue?: boolean }).isOfflineQueue = true;
      return Promise.reject(queuedError);
    }
  }

  return Promise.reject(error);
}

/**
 * Gets current offline status
 */
export function getOfflineStatus(): {
  isOnline: boolean;
  queueSize: number;
} {
  return {
    isOnline: offlineManager.getOnlineStatus(),
    queueSize: offlineManager.getQueueSize(),
  };
}

/**
 * Manually triggers queue sync
 */
export async function syncOfflineQueue(): Promise<void> {
  return offlineManager.syncQueue();
}

/**
 * Clears the offline queue
 */
export function clearOfflineQueue(): void {
  offlineManager.clearQueue();
}

/**
 * Registers a listener for online status changes
 */
export function onOfflineStatusChange(listener: (isOnline: boolean) => void): void {
  offlineManager.onStatusChange(listener);
}

/**
 * Unregisters a listener
 */
export function offOfflineStatusChange(listener: (isOnline: boolean) => void): void {
  offlineManager.offStatusChange(listener);
}
