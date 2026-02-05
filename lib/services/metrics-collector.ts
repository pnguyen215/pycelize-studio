/**
 * Metrics Collector Service
 *
 * This module provides request metrics and analytics with:
 * - Request timing tracking
 * - Success/error rate monitoring
 * - Endpoint performance statistics
 *
 * @module lib/services/metrics-collector
 */

/**
 * Request metrics interface
 */
export interface RequestMetrics {
  url: string;
  method: string;
  status?: number;
  duration: number;
  timestamp: number;
  success: boolean;
  error?: string;
  cached?: boolean;
  retries?: number;
}

/**
 * Aggregated metrics interface
 */
export interface AggregatedMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
  endpoints: Record<string, EndpointMetrics>;
}

/**
 * Endpoint-specific metrics
 */
export interface EndpointMetrics {
  count: number;
  successCount: number;
  failureCount: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  successRate: number;
}

/**
 * Metrics configuration
 */
export interface MetricsConfig {
  /**
   * Whether metrics collection is enabled
   * @default true
   */
  enabled?: boolean;

  /**
   * Maximum number of metrics to store
   * @default 1000
   */
  maxSize?: number;

  /**
   * Whether to persist metrics to storage
   * @default false
   */
  persist?: boolean;

  /**
   * Storage key for persisted metrics
   * @default 'api_metrics'
   */
  storageKey?: string;

  /**
   * Callback for exporting metrics
   */
  onExport?: (metrics: RequestMetrics[]) => void;
}

/**
 * Metrics Collector Class
 *
 * Collects and aggregates HTTP request metrics for monitoring
 * and analytics purposes.
 */
export class MetricsCollector {
  private metrics: RequestMetrics[] = [];
  private config: Required<Omit<MetricsConfig, "onExport">> &
    Pick<MetricsConfig, "onExport">;

  constructor(config: MetricsConfig = {}) {
    this.config = {
      enabled: config.enabled !== false,
      maxSize: config.maxSize || 1000,
      persist: config.persist || false,
      storageKey: config.storageKey || "api_metrics",
      onExport: config.onExport,
    };

    if (this.config.persist) {
      this.loadMetrics();
    }
  }

  /**
   * Loads metrics from storage
   */
  private loadMetrics(): void {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (stored) {
        this.metrics = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load metrics:", error);
    }
  }

  /**
   * Saves metrics to storage
   */
  private saveMetrics(): void {
    if (!this.config.persist || typeof window === "undefined") return;

    try {
      localStorage.setItem(
        this.config.storageKey,
        JSON.stringify(this.metrics)
      );
    } catch (error) {
      console.error("Failed to save metrics:", error);
    }
  }

  /**
   * Enforces size limits on metrics array
   */
  private enforceSizeLimit(): void {
    if (this.metrics.length > this.config.maxSize) {
      // Remove oldest 10%
      const removeCount = Math.ceil(this.config.maxSize * 0.1);
      this.metrics = this.metrics.slice(removeCount);
    }
  }

  /**
   * Records a request metric
   *
   * @param metric - Request metrics to record
   */
  public record(metric: RequestMetrics): void {
    if (!this.config.enabled) return;

    this.metrics.push(metric);
    this.enforceSizeLimit();

    if (this.config.persist) {
      this.saveMetrics();
    }
  }

  /**
   * Gets all recorded metrics
   *
   * @returns Array of request metrics
   */
  public getMetrics(): RequestMetrics[] {
    return [...this.metrics];
  }

  /**
   * Gets aggregated metrics
   *
   * @param since - Optional timestamp to filter metrics from
   * @returns Aggregated metrics
   */
  public getAggregated(since?: number): AggregatedMetrics {
    const filtered = since
      ? this.metrics.filter((m) => m.timestamp >= since)
      : this.metrics;

    if (filtered.length === 0) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageDuration: 0,
        minDuration: 0,
        maxDuration: 0,
        successRate: 0,
        endpoints: {},
      };
    }

    const successCount = filtered.filter((m) => m.success).length;
    const failureCount = filtered.length - successCount;
    const durations = filtered.map((m) => m.duration);

    // Calculate endpoint-specific metrics
    const endpoints: Record<string, EndpointMetrics> = {};

    filtered.forEach((metric) => {
      const key = `${metric.method}:${metric.url}`;

      if (!endpoints[key]) {
        endpoints[key] = {
          count: 0,
          successCount: 0,
          failureCount: 0,
          averageDuration: 0,
          minDuration: Infinity,
          maxDuration: 0,
          successRate: 0,
        };
      }

      const ep = endpoints[key];
      ep.count++;

      if (metric.success) {
        ep.successCount++;
      } else {
        ep.failureCount++;
      }

      ep.minDuration = Math.min(ep.minDuration, metric.duration);
      ep.maxDuration = Math.max(ep.maxDuration, metric.duration);
    });

    // Calculate averages for each endpoint
    Object.keys(endpoints).forEach((key) => {
      const ep = endpoints[key];
      const endpointMetrics = filtered.filter(
        (m) => `${m.method}:${m.url}` === key
      );

      ep.averageDuration =
        endpointMetrics.reduce((sum, m) => sum + m.duration, 0) /
        endpointMetrics.length;
      ep.successRate = ep.successCount / ep.count;
    });

    return {
      totalRequests: filtered.length,
      successfulRequests: successCount,
      failedRequests: failureCount,
      averageDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: Math.min(...durations),
      maxDuration: Math.max(...durations),
      successRate: successCount / filtered.length,
      endpoints,
    };
  }

  /**
   * Gets metrics for a specific endpoint
   *
   * @param method - HTTP method
   * @param url - Request URL
   * @returns Endpoint metrics
   */
  public getEndpointMetrics(
    method: string,
    url: string
  ): EndpointMetrics | null {
    const key = `${method}:${url}`;
    const aggregated = this.getAggregated();
    return aggregated.endpoints[key] || null;
  }

  /**
   * Exports metrics using configured callback
   */
  public export(): void {
    if (this.config.onExport) {
      this.config.onExport(this.getMetrics());
    }
  }

  /**
   * Clears all metrics
   */
  public clear(): void {
    this.metrics = [];

    if (this.config.persist && typeof window !== "undefined") {
      localStorage.removeItem(this.config.storageKey);
    }
  }

  /**
   * Gets metrics summary as a formatted string
   */
  public getSummary(): string {
    const aggregated = this.getAggregated();

    return `
API Metrics Summary:
- Total Requests: ${aggregated.totalRequests}
- Successful: ${aggregated.successfulRequests} (${(
      aggregated.successRate * 100
    ).toFixed(2)}%)
- Failed: ${aggregated.failedRequests}
- Average Duration: ${aggregated.averageDuration.toFixed(2)}ms
- Min Duration: ${aggregated.minDuration.toFixed(2)}ms
- Max Duration: ${aggregated.maxDuration.toFixed(2)}ms
- Endpoints Tracked: ${Object.keys(aggregated.endpoints).length}
    `.trim();
  }
}

/**
 * Default metrics collector instance
 */
export const defaultMetricsCollector = new MetricsCollector();
