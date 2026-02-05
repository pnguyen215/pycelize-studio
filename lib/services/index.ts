/**
 * Services Module Index
 *
 * Centralized export point for all application services.
 *
 * @module lib/services
 */

// Notification Manager
export {
  NotificationManager,
  type NotificationConfig,
} from "./notification-manager";

// Cache Manager
export {
  CacheManager,
  defaultCacheManager,
  type CacheConfig,
  type CacheStorage,
} from "./cache-manager";

// Rate Limiter
export {
  RateLimiter,
  getRateLimiter,
  configureRateLimit,
  resetAllRateLimiters,
  type RateLimitConfig,
} from "./rate-limiter";

// Request Cancellation
export {
  RequestCancellation,
  requestCancellation,
} from "./request-cancellation";

// WebSocket Manager
export {
  WebSocketManager,
  defaultWebSocketManager,
  WebSocketState,
  type WebSocketConfig,
  type WebSocketEventType,
  type WebSocketEventHandler,
} from "./websocket-manager";

// Offline Manager
export {
  OfflineManager,
  defaultOfflineManager,
  type OfflineConfig,
} from "./offline-manager";

// Metrics Collector
export {
  MetricsCollector,
  defaultMetricsCollector,
  type MetricsConfig,
  type RequestMetrics,
  type AggregatedMetrics,
  type EndpointMetrics,
} from "./metrics-collector";
