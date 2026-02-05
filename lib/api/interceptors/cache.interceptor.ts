/**
 * Cache Interceptor
 *
 * This module provides caching capabilities for HTTP GET requests with:
 * - Automatic cache storage and retrieval
 * - Configurable cache policies per request
 * - Cache invalidation on mutations
 *
 * @module lib/api/interceptors/cache.interceptor
 */

import { InternalAxiosRequestConfig, AxiosResponse } from "axios";
import {
  defaultCacheManager,
  CacheManager,
} from "@/lib/services/cache-manager";
import { EEnv } from "@/configs/env";

/**
 * Cache interceptor configuration
 */
export interface CacheInterceptorConfig {
  /**
   * Whether caching is enabled for this request
   * @default false (only enabled for GET requests)
   */
  cache?: boolean;

  /**
   * Cache TTL in milliseconds
   * @default 300000 (5 minutes)
   */
  cacheTTL?: number;

  /**
   * Custom cache key (instead of URL-based)
   */
  cacheKey?: string;

  /**
   * Whether to invalidate cache on this request
   * Useful for POST/PUT/DELETE operations
   */
  invalidateCache?: boolean | string | RegExp;
}

/**
 * Global cache manager instance
 */
let cacheManager: CacheManager = defaultCacheManager;

/**
 * Configures the cache interceptor with a custom cache manager
 *
 * @param manager - Custom cache manager instance
 */
export function configureCacheManager(manager: CacheManager): void {
  cacheManager = manager;
}

/**
 * Generates cache key from request config
 *
 * @param config - Axios request configuration
 * @returns Cache key string
 */
function getCacheKey(
  config: InternalAxiosRequestConfig & CacheInterceptorConfig
): string {
  if (config.cacheKey) {
    return config.cacheKey;
  }

  const url = config.url || "";
  const params = config.params;

  return `${config.method}:${url}:${JSON.stringify(params || {})}`;
}

/**
 * Checks if request should use cache
 *
 * @param config - Axios request configuration
 * @returns True if request should use cache
 */
function shouldUseCache(
  config: InternalAxiosRequestConfig & CacheInterceptorConfig
): boolean {
  // Only cache GET requests by default
  if (config.method !== "get" && config.method !== "GET") {
    return false;
  }

  // Check if explicitly enabled
  return config.cache === true;
}

/**
 * Cache Request Interceptor
 *
 * Checks if a cached response exists and returns it instead of making
 * a new request.
 *
 * @param config - Axios request configuration
 * @returns Modified request configuration or cached response
 */
export async function cacheRequestInterceptor(
  config: InternalAxiosRequestConfig & CacheInterceptorConfig
): Promise<InternalAxiosRequestConfig | AxiosResponse> {
  // Handle cache invalidation for mutations
  if (config.invalidateCache) {
    if (
      typeof config.invalidateCache === "string" ||
      config.invalidateCache instanceof RegExp
    ) {
      cacheManager.invalidatePattern(config.invalidateCache);
    } else {
      // Invalidate related cache entries based on URL
      const urlPattern = config.url || "";
      cacheManager.invalidatePattern(urlPattern);
    }
  }

  // Check if we should use cache
  if (!shouldUseCache(config)) {
    return config;
  }

  // Try to get from cache
  const cacheKey = getCacheKey(config);
  const cachedData = cacheManager.get(cacheKey);

  if (cachedData) {
    if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
      console.debug("♻️ Cache Hit:", {
        url: config.url,
        key: cacheKey,
      });
    }

    // Return cached response (simulate Axios response)
    return Promise.resolve({
      data: cachedData,
      status: 200,
      statusText: "OK (Cached)",
      headers: {},
      config,
      request: {},
    } as AxiosResponse);
  }

  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("♻️ Cache Miss:", {
      url: config.url,
      key: cacheKey,
    });
  }

  // Mark this request as cacheable
  (config as { _useCache?: boolean })._useCache = true;

  return config;
}

/**
 * Cache Response Interceptor
 *
 * Stores successful responses in cache for future use.
 *
 * @param response - Axios response
 * @returns Original response
 */
export function cacheResponseInterceptor(
  response: AxiosResponse
): AxiosResponse {
  const config = response.config as InternalAxiosRequestConfig &
    CacheInterceptorConfig & { _useCache?: boolean };

  // Only cache if marked as cacheable
  if (!config._useCache) {
    return response;
  }

  // Store in cache
  const cacheKey = getCacheKey(config);
  const ttl = config.cacheTTL;

  cacheManager.set(cacheKey, {}, response.data, ttl);

  if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
    console.debug("♻️ Cache Store:", {
      url: config.url,
      key: cacheKey,
      ttl: ttl || "default",
    });
  }

  return response;
}

/**
 * Manually invalidates cache for a URL pattern
 *
 * @param pattern - URL pattern to invalidate
 */
export function invalidateCache(pattern: string | RegExp): void {
  cacheManager.invalidatePattern(pattern);
}

/**
 * Clears all cache
 */
export function clearAllCache(): void {
  cacheManager.clear();
}

/**
 * Gets cache statistics
 */
export function getCacheStats(): {
  size: number;
  maxSize: number;
  storage: string;
} {
  return cacheManager.stats();
}
