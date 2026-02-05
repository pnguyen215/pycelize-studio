/**
 * Offline Support Service
 * 
 * This module provides offline functionality with:
 * - Network status detection
 * - Request queuing when offline
 * - Automatic sync when back online
 * 
 * @module lib/services/offline-manager
 */

import type { InternalAxiosRequestConfig } from 'axios';

/**
 * Queued request interface
 */
interface QueuedRequest {
  config: InternalAxiosRequestConfig;
  timestamp: number;
  retries: number;
}

/**
 * Offline manager configuration
 */
export interface OfflineConfig {
  /**
   * Whether offline support is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Maximum number of queued requests
   * @default 50
   */
  maxQueueSize?: number;

  /**
   * Maximum age of queued requests in milliseconds
   * @default 3600000 (1 hour)
   */
  maxAge?: number;

  /**
   * Maximum retry attempts for queued requests
   * @default 3
   */
  maxRetries?: number;

  /**
   * Storage key for persisting queue
   * @default 'offline_request_queue'
   */
  storageKey?: string;
}

/**
 * Offline Manager Class
 * 
 * Manages request queuing and synchronization for offline scenarios.
 */
export class OfflineManager {
  private isOnline: boolean;
  private queue: QueuedRequest[] = [];
  private config: Required<OfflineConfig>;
  private syncInProgress = false;
  private listeners = new Set<(isOnline: boolean) => void>();

  constructor(config: OfflineConfig = {}) {
    this.config = {
      enabled: config.enabled !== false,
      maxQueueSize: config.maxQueueSize || 50,
      maxAge: config.maxAge || 3600000, // 1 hour
      maxRetries: config.maxRetries || 3,
      storageKey: config.storageKey || 'offline_request_queue',
    };

    // Initialize online status
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

    // Load persisted queue
    this.loadQueue();

    // Set up online/offline listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  /**
   * Handles online event
   */
  private handleOnline = (): void => {
    this.isOnline = true;
    this.notifyListeners(true);
    this.syncQueue();
  };

  /**
   * Handles offline event
   */
  private handleOffline = (): void => {
    this.isOnline = false;
    this.notifyListeners(false);
  };

  /**
   * Notifies listeners of online status change
   */
  private notifyListeners(isOnline: boolean): void {
    this.listeners.forEach((listener) => listener(isOnline));
  }

  /**
   * Loads queue from storage
   */
  private loadQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.queue = JSON.parse(stored);
        this.cleanQueue();
      }
    } catch (error) {
      console.error('Failed to load offline queue:', error);
    }
  }

  /**
   * Saves queue to storage
   */
  private saveQueue(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.queue));
    } catch (error) {
      console.error('Failed to save offline queue:', error);
    }
  }

  /**
   * Cleans expired requests from queue
   */
  private cleanQueue(): void {
    const now = Date.now();
    this.queue = this.queue.filter(
      (item) => now - item.timestamp < this.config.maxAge
    );
  }

  /**
   * Adds request to offline queue
   * 
   * @param config - Request configuration
   * @returns True if added successfully
   */
  public enqueue(config: InternalAxiosRequestConfig): boolean {
    if (!this.config.enabled) return false;

    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      console.warn('Offline queue is full');
      return false;
    }

    this.queue.push({
      config,
      timestamp: Date.now(),
      retries: 0,
    });

    this.saveQueue();
    return true;
  }

  /**
   * Syncs queued requests when back online
   */
  public async syncQueue(): Promise<void> {
    if (!this.isOnline || this.syncInProgress || this.queue.length === 0) {
      return;
    }

    this.syncInProgress = true;
    this.cleanQueue();

    const axios = await import('axios').then((m) => m.default);
    const itemsToSync = [...this.queue];
    this.queue = [];

    for (const item of itemsToSync) {
      try {
        await axios.request(item.config);
      } catch (error) {
        // Re-queue if retries available
        if (item.retries < this.config.maxRetries) {
          this.queue.push({
            ...item,
            retries: item.retries + 1,
          });
        } else {
          console.error('Failed to sync request after max retries:', error);
        }
      }
    }

    this.saveQueue();
    this.syncInProgress = false;
  }

  /**
   * Checks if currently online
   */
  public getOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Gets queue size
   */
  public getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Clears the offline queue
   */
  public clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }

  /**
   * Registers a listener for online status changes
   * 
   * @param listener - Listener function
   */
  public onStatusChange(listener: (isOnline: boolean) => void): void {
    this.listeners.add(listener);
  }

  /**
   * Unregisters a listener
   * 
   * @param listener - Listener function
   */
  public offStatusChange(listener: (isOnline: boolean) => void): void {
    this.listeners.delete(listener);
  }

  /**
   * Cleans up resources
   */
  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    this.listeners.clear();
  }
}

/**
 * Default offline manager instance
 */
export const defaultOfflineManager = new OfflineManager();
