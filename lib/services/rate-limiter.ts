/**
 * Rate Limiter Service
 *
 * This module provides rate limiting functionality to prevent API abuse with:
 * - Token bucket algorithm
 * - Request queuing
 * - Configurable limits per endpoint
 *
 * @module lib/services/rate-limiter
 */

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /**
   * Maximum number of requests allowed in the time window
   * @default 60
   */
  maxRequests?: number;

  /**
   * Time window in milliseconds
   * @default 60000 (1 minute)
   */
  timeWindow?: number;

  /**
   * Whether to queue requests that exceed the limit
   * @default true
   */
  queueRequests?: boolean;

  /**
   * Maximum queue size
   * @default 100
   */
  maxQueueSize?: number;
}

/**
 * Request queue item
 */
interface QueuedRequest {
  resolve: (value: boolean) => void;
  reject: (reason: Error) => void;
  timestamp: number;
}

/**
 * Rate Limiter Class using Token Bucket Algorithm
 *
 * The token bucket algorithm allows bursts of requests up to the bucket capacity,
 * then enforces a steady rate of requests over time.
 */
export class RateLimiter {
  private tokens: number;
  private lastRefill: number;
  private queue: QueuedRequest[] = [];
  private config: Required<RateLimitConfig>;
  private isProcessing = false;

  constructor(config: RateLimitConfig = {}) {
    this.config = {
      maxRequests: config.maxRequests || 60,
      timeWindow: config.timeWindow || 60000,
      queueRequests: config.queueRequests !== false,
      maxQueueSize: config.maxQueueSize || 100,
    };

    this.tokens = this.config.maxRequests;
    this.lastRefill = Date.now();
  }

  /**
   * Refills tokens based on elapsed time
   */
  private refillTokens(): void {
    const now = Date.now();
    const elapsed = now - this.lastRefill;

    // Calculate tokens to add based on elapsed time
    const tokensToAdd =
      (elapsed / this.config.timeWindow) * this.config.maxRequests;

    this.tokens = Math.min(this.config.maxRequests, this.tokens + tokensToAdd);
    this.lastRefill = now;
  }

  /**
   * Processes the request queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.queue.length > 0) {
      this.refillTokens();

      if (this.tokens >= 1) {
        const item = this.queue.shift();
        if (item) {
          this.tokens -= 1;
          item.resolve(true);
        }
      } else {
        // Wait for tokens to refill
        const waitTime = this.config.timeWindow / this.config.maxRequests;
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }

    this.isProcessing = false;
  }

  /**
   * Attempts to acquire a token for making a request
   *
   * @returns Promise resolving to true if request can proceed
   * @throws Error if queue is full and queueRequests is disabled
   */
  public async acquire(): Promise<boolean> {
    this.refillTokens();

    // If we have tokens available, consume one and proceed
    if (this.tokens >= 1) {
      this.tokens -= 1;
      return true;
    }

    // If queuing is disabled, reject immediately
    if (!this.config.queueRequests) {
      throw new Error("Rate limit exceeded. Request rejected.");
    }

    // Check queue size limit
    if (this.queue.length >= this.config.maxQueueSize) {
      throw new Error("Rate limit queue is full. Request rejected.");
    }

    // Queue the request
    return new Promise<boolean>((resolve, reject) => {
      this.queue.push({
        resolve,
        reject,
        timestamp: Date.now(),
      });

      // Start processing queue
      this.processQueue();
    });
  }

  /**
   * Gets current rate limit status
   */
  public getStatus(): {
    availableTokens: number;
    maxTokens: number;
    queueSize: number;
    maxQueueSize: number;
  } {
    this.refillTokens();

    return {
      availableTokens: Math.floor(this.tokens),
      maxTokens: this.config.maxRequests,
      queueSize: this.queue.length,
      maxQueueSize: this.config.maxQueueSize,
    };
  }

  /**
   * Resets the rate limiter
   */
  public reset(): void {
    this.tokens = this.config.maxRequests;
    this.lastRefill = Date.now();
    this.queue = [];
  }

  /**
   * Updates rate limit configuration
   */
  public updateConfig(config: Partial<RateLimitConfig>): void {
    this.config = {
      ...this.config,
      ...config,
    };

    // Reset tokens if limits changed
    if (config.maxRequests) {
      this.tokens = Math.min(this.tokens, config.maxRequests);
    }
  }
}

/**
 * Global rate limiters by endpoint pattern
 */
const rateLimiters = new Map<string, RateLimiter>();

/**
 * Default rate limiter for all requests
 */
const defaultRateLimiter = new RateLimiter();

/**
 * Gets or creates a rate limiter for an endpoint pattern
 *
 * @param pattern - Endpoint pattern (URL or regex)
 * @param config - Rate limit configuration
 * @returns Rate limiter instance
 */
export function getRateLimiter(
  pattern?: string,
  config?: RateLimitConfig
): RateLimiter {
  if (!pattern) {
    return defaultRateLimiter;
  }

  if (!rateLimiters.has(pattern)) {
    rateLimiters.set(pattern, new RateLimiter(config));
  }

  return rateLimiters.get(pattern)!;
}

/**
 * Configures rate limiting for a specific endpoint pattern
 *
 * @param pattern - Endpoint pattern
 * @param config - Rate limit configuration
 */
export function configureRateLimit(
  pattern: string,
  config: RateLimitConfig
): void {
  const limiter = getRateLimiter(pattern, config);
  limiter.updateConfig(config);
}

/**
 * Resets all rate limiters
 */
export function resetAllRateLimiters(): void {
  defaultRateLimiter.reset();
  rateLimiters.forEach((limiter) => limiter.reset());
}
