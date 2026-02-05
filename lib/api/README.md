# API Client Module - Enterprise-Grade HTTP Client

A comprehensive, production-ready HTTP client built on Axios with enterprise features including authentication, caching, retry logic, rate limiting, offline support, WebSocket integration, and request metrics.

## 🚀 Features

✅ **Core Features**

- Type-safe HTTP methods (GET, POST, PUT, DELETE)
- Centralized environment configuration
- Automatic notification management
- Request/response logging and debugging

✅ **Authentication & Security**

- JWT token management with automatic refresh
- Secure token storage (localStorage)
- Authentication state management
- Automatic retry on 401 Unauthorized

✅ **Reliability & Performance**

- Automatic retry with exponential backoff
- Request caching with multiple storage strategies
- Rate limiting with token bucket algorithm
- Request cancellation support (AbortController)

✅ **Offline & Real-time**

- Offline detection and request queuing
- Automatic sync when connection restored
- WebSocket manager with auto-reconnection
- Real-time event handling

✅ **Monitoring & Analytics**

- Request metrics collection (timing, success rates)
- Endpoint performance statistics
- Aggregated analytics and reporting
- Request debugging and troubleshooting

## 📁 Architecture

```
lib/api/
├── client.ts                    # Main API client with HTTP methods
├── axios-instance.ts            # Axios instance factory
├── types.ts                     # TypeScript interfaces
├── interceptors/
│   ├── index.ts                 # Interceptor registration
│   ├── request.interceptor.ts  # Request preprocessing
│   ├── response.interceptor.ts # Response handling
│   ├── error.interceptor.ts    # Error handling
│   ├── auth.interceptor.ts     # Authentication
│   ├── retry.interceptor.ts    # Automatic retry
│   ├── cache.interceptor.ts    # Response caching
│   ├── rate-limit.interceptor.ts # Rate limiting
│   ├── offline.interceptor.ts  # Offline support
│   └── metrics.interceptor.ts  # Metrics collection

lib/services/
├── notification-manager.ts      # Notification service
├── cache-manager.ts             # Cache storage service
├── rate-limiter.ts              # Rate limiting service
├── request-cancellation.ts      # Cancellation utilities
├── websocket-manager.ts         # WebSocket service
├── offline-manager.ts           # Offline support service
└── metrics-collector.ts         # Metrics collection service
```

## 🔧 Setup & Configuration

### Basic Setup (Core Features Only)

```typescript
import { axiosInstance } from "@/lib/api/axios-instance";
import { setupCoreInterceptors } from "@/lib/api/interceptors";

// Setup with core features only
const client = setupCoreInterceptors(axiosInstance);
```

### Advanced Setup (All Features)

```typescript
import { axiosInstance } from "@/lib/api/axios-instance";
import { setupInterceptors } from "@/lib/api/interceptors";

// Setup with all features enabled
const client = setupInterceptors(axiosInstance, {
  auth: true, // Enable authentication
  retry: true, // Enable automatic retry
  cache: true, // Enable response caching
  rateLimit: true, // Enable rate limiting
  offline: true, // Enable offline support
  metrics: true, // Enable metrics collection
});
```

### Configure Individual Features

```typescript
import {
  configureAuth,
  configureRetry,
  configureRateLimit,
} from "@/lib/api/interceptors";

// Configure authentication
configureAuth({
  tokenType: "Bearer",
  autoRefresh: true,
  refreshEndpoint: "/auth/refresh",
});

// Configure retry behavior
configureRetry({
  retries: 5,
  retryDelay: 2000,
  exponentialBackoff: true,
});

// Configure rate limiting
configureRateLimit("/api/search", {
  maxRequests: 10,
  timeWindow: 1000, // 10 requests per second
});
```

## 📖 Usage Examples

### 1. Basic HTTP Requests

```typescript
import { api } from "@/lib/api/client";

// GET request
const user = await api.get<User>("/users/123");

// POST request
const newUser = await api.post<User>("/users", {
  name: "John Doe",
  email: "john@example.com",
});

// PUT request
const updated = await api.put<User>("/users/123", { name: "Jane" });

// DELETE request
await api.delete("/users/123");
```

### 2. Authentication

```typescript
import {
  configureAuth,
  setStoredToken,
  clearAuthTokens,
  isAuthenticated,
} from "@/lib/api/interceptors";

// Set authentication token
setStoredToken("your-jwt-token-here");

// Check if authenticated
if (isAuthenticated()) {
  const data = await api.get("/protected-resource");
}

// Clear tokens on logout
clearAuthTokens();
```

### 3. Request Retry

```typescript
// Automatic retry with default config (3 retries, exponential backoff)
const data = await api.get("/unreliable-endpoint");

// Custom retry configuration per request
const data = await api.get("/endpoint", {
  retry: {
    retries: 5,
    retryDelay: 2000,
    exponentialBackoff: false,
    onRetry: (error, retryCount) => {
      console.log(`Retry attempt ${retryCount}`);
    },
  },
});
```

### 4. Response Caching

```typescript
// Enable caching for a GET request
const data = await api.get("/expensive-operation", {
  cache: true,
  cacheTTL: 300000, // 5 minutes
});

// Invalidate cache on mutations
await api.post("/users", newUser, {
  invalidateCache: "/users", // Invalidates all /users/* caches
});

// Manual cache management
import {
  invalidateCache,
  clearAllCache,
  getCacheStats,
} from "@/lib/api/interceptors";

invalidateCache("/users/*");
clearAllCache();
console.log(getCacheStats());
```

### 5. Rate Limiting

```typescript
// Global rate limiting (applied to all requests)
import { configureRateLimit } from "@/lib/services/rate-limiter";

configureRateLimit("global", {
  maxRequests: 60,
  timeWindow: 60000, // 60 requests per minute
});

// Per-endpoint rate limiting
const data = await api.get("/api/search", {
  rateLimit: {
    maxRequests: 10,
    timeWindow: 1000,
    pattern: "/api/search",
  },
});
```

### 6. Request Cancellation

```typescript
import { requestCancellation } from "@/lib/services";

// Create cancellable request
const signal = requestCancellation.createSignal("search-request");

try {
  const results = await api.get("/search", {
    params: { q: "query" },
    signal,
  });
} catch (error) {
  if (error.name === "AbortError") {
    console.log("Request cancelled");
  }
}

// Cancel the request
requestCancellation.cancel("search-request");

// Cancel all pending requests
requestCancellation.cancelAll();
```

### 7. Offline Support

```typescript
// Requests are automatically queued when offline
// and synced when connection is restored

// Check online status
import { getOfflineStatus, syncOfflineQueue } from "@/lib/api/interceptors";

const status = getOfflineStatus();
console.log(status.isOnline, status.queueSize);

// Manually trigger sync
await syncOfflineQueue();

// Listen for online/offline events
import { onOfflineStatusChange } from "@/lib/api/interceptors";

onOfflineStatusChange((isOnline) => {
  console.log(isOnline ? "Connected" : "Disconnected");
});
```

### 8. WebSocket Integration

```typescript
import { WebSocketManager, WebSocketState } from "@/lib/services";

const ws = new WebSocketManager({
  url: "wss://api.example.com/ws",
  autoReconnect: true,
  heartbeatInterval: 30000,
});

// Connect
ws.connect();

// Listen for events
ws.on("message", (data) => {
  console.log("Received:", data);
});

ws.on("stateChange", ({ state }) => {
  console.log("State changed:", state);
});

// Send data
ws.send({ type: "subscribe", channel: "updates" });

// Disconnect
ws.disconnect();
```

### 9. Metrics & Analytics

```typescript
import {
  getMetricsSummary,
  getAggregatedMetrics,
  clearMetrics,
} from "@/lib/api/interceptors";

// Get metrics summary
console.log(getMetricsSummary());

// Get detailed metrics
const metrics = getAggregatedMetrics();
console.log({
  totalRequests: metrics.totalRequests,
  successRate: metrics.successRate * 100 + "%",
  averageDuration: metrics.averageDuration + "ms",
  endpoints: metrics.endpoints,
});

// Clear metrics
clearMetrics();
```

### 10. Advanced: Notification Control

```typescript
// Disable notifications
const data = await api.get("/analytics", {
  notification: { enabled: false },
});

// Custom messages
const result = await api.post("/upload", formData, {
  notification: {
    successMessage: "File uploaded successfully!",
    errorMessage: "Failed to upload file",
  },
});

// Manual notifications
import { NotificationManager } from "@/lib/services";

NotificationManager.success("Operation completed");
NotificationManager.error("Something went wrong");
NotificationManager.loading("Processing...");
```

## 🎯 Configuration Options

### ApiRequestConfig (Extended Axios Config)

```typescript
interface ApiRequestConfig extends AxiosRequestConfig {
  // Notification control
  notification?: {
    enabled?: boolean;
    successMessage?: string;
    errorMessage?: string;
  };

  // Retry configuration
  retry?: {
    retries?: number;
    retryDelay?: number;
    exponentialBackoff?: boolean;
    maxRetryDelay?: number;
    retryCondition?: (error: AxiosError) => boolean;
    onRetry?: (error: AxiosError, retryCount: number) => void;
  };

  // Cache configuration
  cache?: boolean;
  cacheTTL?: number;
  cacheKey?: string;
  invalidateCache?: boolean | string | RegExp;

  // Rate limiting
  rateLimit?: {
    maxRequests?: number;
    timeWindow?: number;
    queueRequests?: boolean;
    maxQueueSize?: number;
    pattern?: string;
  };

  // Offline support
  queueWhenOffline?: boolean;

  // Metrics collection
  collectMetrics?: boolean;

  // Request cancellation
  signal?: AbortSignal;
}
```

## 📊 Monitoring & Debugging

### Enable Debug Logging

Set `NEXT_PUBLIC_PYCELIZE_DEBUGGING=true` in your `.env.local` to enable detailed logging:

- 🚀 Request details (method, URL, headers)
- 🟢 Response details (status, data)
- 🔴 Error details (status, message)
- 🔐 Authentication events
- 🔄 Retry attempts
- 💾 Cache hits/misses
- 🚦 Rate limit status
- 📡 Offline events
- 📊 Request metrics

### Metrics Dashboard Example

```typescript
import { MetricsCollector } from "@/lib/services";

const collector = new MetricsCollector({
  enabled: true,
  maxSize: 1000,
  persist: true,
});

// Get aggregated metrics
const stats = collector.getAggregated();

// Display in UI
<MetricsDashboard
  totalRequests={stats.totalRequests}
  successRate={stats.successRate}
  averageDuration={stats.averageDuration}
  endpoints={stats.endpoints}
/>;
```

## 🔒 Security Best Practices

1. **Token Storage**: Tokens are stored in localStorage. For higher security, consider using httpOnly cookies.
2. **Token Refresh**: Automatic token refresh prevents session expiration.
3. **HTTPS Only**: Always use HTTPS in production.
4. **Rate Limiting**: Prevents API abuse and DDoS attacks.
5. **Request Validation**: Validate and sanitize all input data.

## 🧪 Testing

```typescript
import { api } from "@/lib/api/client";
import { configureAuth, clearAuthTokens } from "@/lib/api/interceptors";

// Mock setup
beforeEach(() => {
  clearAuthTokens();
  configureAuth({ token: "test-token" });
});

// Test authenticated request
test("makes authenticated request", async () => {
  const data = await api.get("/protected");
  expect(data).toBeDefined();
});
```

## 🚨 Error Handling

```typescript
try {
  const data = await api.post("/endpoint", payload);
} catch (error) {
  if (error.message.includes("offline")) {
    // Request was queued for offline sync
  } else if (error.message.includes("Rate limit")) {
    // Rate limit exceeded
  } else if (error.name === "AbortError") {
    // Request was cancelled
  } else {
    // Other errors
    console.error("API Error:", error.message);
  }
}
```

## 📝 Migration from Old Client

The new client is fully backward compatible:

```typescript
// Old usage (still works)
import { api } from "@/lib/api/client";
const data = await api.get("/endpoint");

// New features (opt-in)
const data = await api.get("/endpoint", {
  cache: true,
  retry: { retries: 5 },
  notification: { enabled: false },
});
```

## 🎓 Best Practices

1. **Use TypeScript**: Leverage type safety for API responses
2. **Enable Caching**: Cache expensive GET requests
3. **Configure Retry**: Set appropriate retry policies
4. **Monitor Metrics**: Track API performance
5. **Handle Offline**: Test offline scenarios
6. **Rate Limit**: Protect your API from abuse
7. **Cancel Requests**: Cancel outdated requests (search, autocomplete)

---
