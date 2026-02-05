/**
 * Cache Manager Service
 * 
 * This module provides a flexible caching system for HTTP responses with:
 * - Multiple storage strategies (memory, localStorage)
 * - TTL (Time-To-Live) support
 * - Cache invalidation
 * - Size limits
 * 
 * @module lib/services/cache-manager
 */

/**
 * Cache entry interface
 */
interface CacheEntry<T> {
  /**
   * Cached data
   */
  data: T;

  /**
   * Timestamp when the entry was cached
   */
  timestamp: number;

  /**
   * Time-to-live in milliseconds
   */
  ttl: number;

  /**
   * Cache key
   */
  key: string;
}

/**
 * Cache storage strategy
 */
export type CacheStorage = 'memory' | 'localStorage' | 'sessionStorage';

/**
 * Cache configuration
 */
export interface CacheConfig {
  /**
   * Storage strategy to use
   * @default 'memory'
   */
  storage?: CacheStorage;

  /**
   * Default TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  defaultTTL?: number;

  /**
   * Maximum number of cached entries
   * @default 100
   */
  maxSize?: number;

  /**
   * Cache key prefix
   * @default 'api_cache_'
   */
  keyPrefix?: string;
}

/**
 * In-memory cache storage
 */
class MemoryStorage {
  private cache = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): CacheEntry<T> | null {
    return (this.cache.get(key) as CacheEntry<T>) || null;
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    this.cache.set(key, entry);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * LocalStorage-based cache storage
 */
class LocalStorageCache {
  constructor(private prefix: string) {}

  get<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(`${this.prefix}${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(`${this.prefix}${key}`, JSON.stringify(entry));
    } catch (error) {
      // Handle quota exceeded or other errors
      console.warn('Cache storage failed:', error);
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(`${this.prefix}${key}`);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = this.keys();
    keys.forEach((key) => this.delete(key));
  }

  keys(): string[] {
    if (typeof window === 'undefined') return [];
    
    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        allKeys.push(key.substring(this.prefix.length));
      }
    }
    return allKeys;
  }

  size(): number {
    return this.keys().length;
  }
}

/**
 * SessionStorage-based cache storage
 */
class SessionStorageCache {
  constructor(private prefix: string) {}

  get<T>(key: string): CacheEntry<T> | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = sessionStorage.getItem(`${this.prefix}${key}`);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  }

  set<T>(key: string, entry: CacheEntry<T>): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(`${this.prefix}${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  delete(key: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`${this.prefix}${key}`);
  }

  clear(): void {
    if (typeof window === 'undefined') return;
    
    const keys = this.keys();
    keys.forEach((key) => this.delete(key));
  }

  keys(): string[] {
    if (typeof window === 'undefined') return [];
    
    const allKeys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        allKeys.push(key.substring(this.prefix.length));
      }
    }
    return allKeys;
  }

  size(): number {
    return this.keys().length;
  }
}

/**
 * Cache Manager Class
 * 
 * Provides a unified interface for caching HTTP responses with multiple
 * storage strategies and automatic expiration.
 */
export class CacheManager {
  private storage: MemoryStorage | LocalStorageCache | SessionStorageCache;
  private config: Required<CacheConfig>;

  constructor(config: CacheConfig = {}) {
    this.config = {
      storage: config.storage || 'memory',
      defaultTTL: config.defaultTTL || 300000, // 5 minutes
      maxSize: config.maxSize || 100,
      keyPrefix: config.keyPrefix || 'api_cache_',
    };

    // Initialize storage based on strategy
    switch (this.config.storage) {
      case 'localStorage':
        this.storage = new LocalStorageCache(this.config.keyPrefix);
        break;
      case 'sessionStorage':
        this.storage = new SessionStorageCache(this.config.keyPrefix);
        break;
      default:
        this.storage = new MemoryStorage();
    }
  }

  /**
   * Generates a cache key from URL and params
   */
  private generateKey(url: string, params?: Record<string, unknown>): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${url}:${paramStr}`;
  }

  /**
   * Checks if a cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    const now = Date.now();
    return now - entry.timestamp < entry.ttl;
  }

  /**
   * Enforces cache size limits using LRU strategy
   */
  private enforceSizeLimit(): void {
    const keys = this.storage.keys();
    
    if (keys.length >= this.config.maxSize) {
      // Remove oldest entries
      const entries = keys
        .map((key) => ({
          key,
          entry: this.storage.get(key),
        }))
        .filter((item) => item.entry !== null)
        .sort((a, b) => a.entry!.timestamp - b.entry!.timestamp);

      // Remove 10% of oldest entries
      const removeCount = Math.ceil(this.config.maxSize * 0.1);
      entries.slice(0, removeCount).forEach((item) => {
        this.storage.delete(item.key);
      });
    }
  }

  /**
   * Retrieves data from cache
   * 
   * @param url - Request URL
   * @param params - Request parameters
   * @returns Cached data or null if not found/expired
   */
  public get<T>(url: string, params?: Record<string, unknown>): T | null {
    const key = this.generateKey(url, params);
    const entry = this.storage.get<T>(key);

    if (!entry) {
      return null;
    }

    if (!this.isValid(entry)) {
      this.storage.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Stores data in cache
   * 
   * @param url - Request URL
   * @param params - Request parameters
   * @param data - Data to cache
   * @param ttl - Time-to-live in milliseconds (optional, uses default if not provided)
   */
  public set<T>(
    url: string,
    params: Record<string, unknown> | undefined,
    data: T,
    ttl?: number
  ): void {
    const key = this.generateKey(url, params);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      key,
    };

    this.enforceSizeLimit();
    this.storage.set(key, entry);
  }

  /**
   * Invalidates a specific cache entry
   * 
   * @param url - Request URL
   * @param params - Request parameters
   */
  public invalidate(url: string, params?: Record<string, unknown>): void {
    const key = this.generateKey(url, params);
    this.storage.delete(key);
  }

  /**
   * Invalidates all cache entries matching a URL pattern
   * 
   * @param urlPattern - URL pattern to match (regex or string)
   */
  public invalidatePattern(urlPattern: string | RegExp): void {
    const pattern = typeof urlPattern === 'string' ? new RegExp(urlPattern) : urlPattern;
    const keys = this.storage.keys();

    keys.forEach((key) => {
      if (pattern.test(key)) {
        this.storage.delete(key);
      }
    });
  }

  /**
   * Clears all cache entries
   */
  public clear(): void {
    this.storage.clear();
  }

  /**
   * Gets cache statistics
   */
  public stats(): {
    size: number;
    maxSize: number;
    storage: CacheStorage;
  } {
    return {
      size: this.storage.size(),
      maxSize: this.config.maxSize,
      storage: this.config.storage,
    };
  }
}

/**
 * Default cache manager instance
 */
export const defaultCacheManager = new CacheManager();
