# Advanced API Client Features

This document provides a comprehensive overview of the advanced features added to the API client.

## ✅ Implemented Features

### 1. Authentication Interceptor 🔐

**File**: `lib/api/interceptors/auth.interceptor.ts`

**Features**:

- JWT token management with localStorage persistence
- Automatic token attachment to requests (Authorization header)
- Token refresh on 401 Unauthorized responses
- Queue management for concurrent requests during refresh
- Authentication state management

**Key Functions**:

```typescript
configureAuth({ token, tokenType, autoRefresh, refreshEndpoint });
setStoredToken(token);
clearAuthTokens();
isAuthenticated();
```

**Usage**:

```typescript
import { setStoredToken, configureAuth } from "@/lib/api/interceptors";

// Set token after login
setStoredToken("your-jwt-token");

// Configure behavior
configureAuth({
  autoRefresh: true,
  refreshEndpoint: "/auth/refresh",
});
```

---

### 2. Request Retry Logic 🔄

**File**: `lib/api/interceptors/retry.interceptor.ts`

**Features**:

- Automatic retry on network errors and specific HTTP status codes
- Exponential backoff with jitter
- Configurable retry conditions and policies
- Per-request retry configuration
- Retry callbacks for monitoring

**Key Functions**:

```typescript
configureRetry({ retries, retryDelay, exponentialBackoff, maxRetryDelay });
isRetryableError(error);
getRetryCount(config);
```

**Usage**:

```typescript
// Global configuration
configureRetry({
  retries: 5,
  retryDelay: 2000,
  exponentialBackoff: true,
});

// Per-request configuration
await api.get("/endpoint", {
  retry: {
    retries: 3,
    onRetry: (error, count) => console.log(`Retry ${count}`),
  },
});
```

---

### 3. Request Caching Layer 💾

**Files**:

- `lib/services/cache-manager.ts`
- `lib/api/interceptors/cache.interceptor.ts`

**Features**:

- Multiple storage strategies (memory, localStorage, sessionStorage)
- TTL (Time-To-Live) support
- LRU eviction when size limit reached
- Cache invalidation (single entry, pattern matching)
- Automatic cache for GET requests
- Size limits and statistics

**Key Functions**:

```typescript
// Cache Manager
new CacheManager({ storage, defaultTTL, maxSize });
cacheManager.get(url, params);
cacheManager.set(url, params, data, ttl);
cacheManager.invalidatePattern(pattern);

// Cache Interceptor
invalidateCache(pattern);
clearAllCache();
getCacheStats();
```

**Usage**:

```typescript
// Enable caching for request
await api.get("/expensive-data", {
  cache: true,
  cacheTTL: 300000, // 5 minutes
});

// Invalidate on mutation
await api.post("/users", data, {
  invalidateCache: "/users",
});
```

---

### 4. Rate Limiting 🚦

**Files**:

- `lib/services/rate-limiter.ts`
- `lib/api/interceptors/rate-limit.interceptor.ts`

**Features**:

- Token bucket algorithm
- Request queuing when limit exceeded
- Configurable limits per endpoint
- Global and per-pattern rate limiters
- Queue size management

**Key Functions**:

```typescript
// Rate Limiter
new RateLimiter({ maxRequests, timeWindow, queueRequests });
rateLimiter.acquire();
rateLimiter.getStatus();

// Rate Limit Interceptor
getRateLimitStatus(pattern);
```

**Usage**:

```typescript
// Configure endpoint rate limit
configureRateLimit("/api/search", {
  maxRequests: 10,
  timeWindow: 1000, // 10 requests per second
});

// Per-request configuration
await api.get("/search", {
  rateLimit: {
    maxRequests: 5,
    timeWindow: 1000,
  },
});
```

---

### 5. Request Cancellation Support ❌

**File**: `lib/services/request-cancellation.ts`

**Features**:

- AbortController integration
- Request tracking by key
- Cancel single or all requests
- Pending request monitoring

**Key Functions**:

```typescript
requestCancellation.createSignal(key);
requestCancellation.cancel(key, reason);
requestCancellation.cancelAll(reason);
requestCancellation.isPending(key);
```

**Usage**:

```typescript
import { requestCancellation } from "@/lib/services";

// Create cancellable request
const signal = requestCancellation.createSignal("search");
await api.get("/search", { signal });

// Cancel it
requestCancellation.cancel("search");
```

---

### 6. WebSocket Integration 🔌

**File**: `lib/services/websocket-manager.ts`

**Features**:

- Automatic reconnection with exponential backoff
- Heartbeat/ping-pong support
- Event-based message handling
- Connection state management
- Multiple WebSocket instances support

**Key Functions**:

```typescript
new WebSocketManager({ url, autoReconnect, heartbeatInterval });
ws.connect();
ws.disconnect();
ws.send(data);
ws.on(event, handler);
ws.off(event, handler);
ws.getState();
```

**Usage**:

```typescript
import { WebSocketManager } from "@/lib/services";

const ws = new WebSocketManager({
  url: "wss://api.example.com/ws",
  autoReconnect: true,
});

ws.connect();
ws.on("message", (data) => console.log(data));
ws.send({ type: "subscribe", channel: "updates" });
```

---

### 7. Offline Support 📡

**Files**:

- `lib/services/offline-manager.ts`
- `lib/api/interceptors/offline.interceptor.ts`

**Features**:

- Network status detection
- Request queuing when offline
- Automatic sync when connection restored
- Persistent queue in localStorage
- Queue size and age limits

**Key Functions**:

```typescript
// Offline Manager
new OfflineManager({ enabled, maxQueueSize, maxAge });
offlineManager.enqueue(config);
offlineManager.syncQueue();
offlineManager.onStatusChange(listener);

// Offline Interceptor
getOfflineStatus();
syncOfflineQueue();
clearOfflineQueue();
onOfflineStatusChange(listener);
```

**Usage**:

```typescript
import {
  getOfflineStatus,
  onOfflineStatusChange,
} from "@/lib/api/interceptors";

// Check status
const status = getOfflineStatus();
console.log(status.isOnline, status.queueSize);

// Listen for changes
onOfflineStatusChange((isOnline) => {
  if (isOnline) {
    console.log("Back online, syncing...");
  }
});
```

---

### 8. Request Metrics/Analytics 📊

**Files**:

- `lib/services/metrics-collector.ts`
- `lib/api/interceptors/metrics.interceptor.ts`

**Features**:

- Request timing tracking
- Success/error rate monitoring
- Endpoint-specific metrics
- Aggregated statistics
- Metrics persistence to localStorage
- Export capabilities

**Key Functions**:

```typescript
// Metrics Collector
new MetricsCollector({ enabled, maxSize, persist });
collector.record(metric);
collector.getAggregated(since);
collector.getEndpointMetrics(method, url);
collector.getSummary();

// Metrics Interceptor
getMetricsSummary();
getAggregatedMetrics(since);
clearMetrics();
```

**Usage**:

```typescript
import {
  getMetricsSummary,
  getAggregatedMetrics,
} from "@/lib/api/interceptors";

// Get summary
console.log(getMetricsSummary());

// Get detailed metrics
const metrics = getAggregatedMetrics();
console.log({
  successRate: metrics.successRate * 100 + "%",
  averageDuration: metrics.averageDuration + "ms",
  endpoints: Object.keys(metrics.endpoints).length,
});
```

---

## 🏗️ Architecture Enhancements

### Interceptor Pipeline

The interceptor pipeline now supports optional features that can be enabled/disabled:

```typescript
setupInterceptors(axiosInstance, {
  auth: true, // JWT authentication
  retry: true, // Automatic retry
  cache: true, // Response caching
  rateLimit: true, // Rate limiting
  offline: true, // Offline support
  metrics: true, // Metrics collection
});
```

### Execution Order

**Request Interceptors** (last-in, first-out):

1. Core Request (FormData, debugging)
2. Cache (check cache, return cached response)
3. Offline (check online status, queue if offline)
4. Rate Limit (acquire token, queue if exceeded)
5. Auth (attach JWT token)
6. Metrics (mark start time)

**Response Interceptors** (first-in, first-out):

1. Core Response (notifications, data extraction)
2. Cache (store successful responses)
3. Metrics (record timing and status)

**Error Interceptors**:

1. Metrics (record error)
2. Offline (queue on network error)
3. Retry (retry on retryable errors)
4. Auth (refresh token on 401)
5. Core Error (notification, message extraction)

---

## 🎯 Benefits Delivered

### For Developers

- ✅ **Reduced Boilerplate**: No need to manually implement retry, caching, etc.
- ✅ **Type Safety**: Full TypeScript support with IntelliSense
- ✅ **Flexibility**: Opt-in features, configure per-request or globally
- ✅ **Debugging**: Comprehensive logging when debug mode enabled

### For Applications

- ✅ **Reliability**: Automatic retry on transient failures
- ✅ **Performance**: Response caching reduces API calls
- ✅ **User Experience**: Offline support, better error handling
- ✅ **Real-time**: WebSocket integration for live updates

### For Operations

- ✅ **Monitoring**: Built-in metrics and analytics
- ✅ **Security**: JWT token management with auto-refresh
- ✅ **Rate Limiting**: Prevent API abuse
- ✅ **Observability**: Request tracking and debugging

---

## 🧪 Testing & Quality

### Build Status

✅ TypeScript compilation passes
✅ ESLint checks pass
✅ No security vulnerabilities detected

### Code Quality

- Professional JSDoc comments on all public APIs
- Comprehensive error handling
- Type-safe throughout
- Following SOLID principles
- Clean architecture patterns

---

## 🚀 Usage Examples

### Complete Feature Showcase

```typescript
import { api } from "@/lib/api/client";
import {
  setStoredToken,
  configureRetry,
  configureRateLimit,
  requestCancellation,
  WebSocketManager,
  getOfflineStatus,
  getMetricsSummary,
} from "@/lib/api/interceptors";

// 1. Authentication
setStoredToken("jwt-token-here");

// 2. Configure retry
configureRetry({ retries: 5, exponentialBackoff: true });

// 3. Configure rate limiting
configureRateLimit("/api/search", { maxRequests: 10, timeWindow: 1000 });

// 4. Make cacheable request with retry
const data = await api.get("/expensive-endpoint", {
  cache: true,
  cacheTTL: 300000,
  retry: { retries: 3 },
  notification: { enabled: false },
});

// 5. Cancellable request
const signal = requestCancellation.createSignal("search");
try {
  const results = await api.get("/search", { signal });
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Cancelled");
  }
}

// 6. WebSocket connection
const ws = new WebSocketManager({ url: "wss://api.example.com/ws" });
ws.connect();
ws.on("message", (data) => console.log(data));

// 7. Offline support
const status = getOfflineStatus();
if (!status.isOnline) {
  console.log(`Offline: ${status.queueSize} requests queued`);
}

// 8. View metrics
console.log(getMetricsSummary());
```

---

## 🎓 Migration Guide

### No Breaking Changes

All existing code continues to work without modification:

```typescript
// Old code (still works)
const data = await api.get("/endpoint");

// New features (opt-in)
const data = await api.get("/endpoint", {
  cache: true,
  retry: { retries: 5 },
  rateLimit: { maxRequests: 10 },
});
```

### Enabling Features

Choose which features to enable in your application:

```typescript
import { setupInterceptors } from "@/lib/api/interceptors";

// Production configuration
const client = setupInterceptors(axiosInstance, {
  auth: true, // Enable if using JWT
  retry: true, // Recommended for all
  cache: true, // Enable for GET-heavy apps
  rateLimit: true, // Enable to prevent abuse
  offline: true, // Enable for mobile/PWA
  metrics: true, // Recommended for monitoring
});
```

---

## 📈 Performance Impact

### Memory Usage

- Cache: Configurable max size (default 100 entries)
- Metrics: Configurable max size (default 1000 entries)
- Offline Queue: Configurable max size (default 50 requests)

### Network Impact

- Caching: Reduces redundant API calls
- Retry: May increase failed request attempts (configurable)
- Rate Limiting: May delay requests (queued, not dropped)

---

## 🔒 Security Considerations

1. **Token Storage**: Using localStorage (consider httpOnly cookies for higher security)
2. **Token Refresh**: Automatic refresh prevents session expiration
3. **Rate Limiting**: Prevents abuse and DDoS
4. **Offline Queue**: Persisted in localStorage (clear on logout)
5. **Metrics**: Does not log sensitive data
