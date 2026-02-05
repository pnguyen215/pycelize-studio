/**
 * Rate Limit Interceptor
 * 
 * This module enforces rate limiting on API requests to prevent abuse
 * and comply with API rate limits.
 * 
 * @module lib/api/interceptors/rate-limit.interceptor
 */

import { InternalAxiosRequestConfig } from 'axios';
import { getRateLimiter, RateLimitConfig } from '@/lib/services/rate-limiter';
import { EEnv } from '@/configs/env';

/**
 * Rate limit interceptor configuration
 */
export interface RateLimitInterceptorConfig {
  /**
   * Rate limit configuration for this request
   */
  rateLimit?: RateLimitConfig & {
    /**
     * Endpoint pattern to match for rate limiting
     * If not provided, uses global rate limiter
     */
    pattern?: string;
  };
}

/**
 * Rate Limit Request Interceptor
 * 
 * Enforces rate limiting by acquiring a token before allowing the
 * request to proceed. Queues requests that exceed the limit.
 * 
 * @param config - Axios request configuration
 * @returns Modified request configuration
 * @throws Error if rate limit exceeded and queuing disabled
 * 
 * @example
 * // Use global rate limiter
 * const data = await api.get('/endpoint');
 * 
 * @example
 * // Custom rate limit for specific request
 * const data = await api.get('/endpoint', {
 *   rateLimit: {
 *     maxRequests: 10,
 *     timeWindow: 1000,
 *     pattern: '/api/search'
 *   }
 * });
 */
export async function rateLimitInterceptor(
  config: InternalAxiosRequestConfig & RateLimitInterceptorConfig
): Promise<InternalAxiosRequestConfig> {
  const rateLimitConfig = config.rateLimit;
  const pattern = rateLimitConfig?.pattern;

  // Get appropriate rate limiter
  const limiter = getRateLimiter(pattern, rateLimitConfig);

  try {
    // Acquire token (may queue request if limit exceeded)
    const startTime = Date.now();
    await limiter.acquire();
    const waitTime = Date.now() - startTime;

    if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
      const status = limiter.getStatus();
      console.debug('🚦 Rate Limit:', {
        url: config.url,
        pattern: pattern || 'global',
        availableTokens: status.availableTokens,
        queueSize: status.queueSize,
        waitTime: waitTime > 0 ? `${waitTime}ms` : 'none',
      });
    }
  } catch (error) {
    if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
      console.debug('🚫 Rate Limit Exceeded:', {
        url: config.url,
        pattern: pattern || 'global',
        error: (error as Error).message,
      });
    }
    throw error;
  }

  return config;
}

/**
 * Gets current rate limit status for a pattern
 * 
 * @param pattern - Endpoint pattern (optional, uses global if not provided)
 * @returns Rate limit status
 */
export function getRateLimitStatus(pattern?: string): {
  availableTokens: number;
  maxTokens: number;
  queueSize: number;
  maxQueueSize: number;
} {
  const limiter = getRateLimiter(pattern);
  return limiter.getStatus();
}
