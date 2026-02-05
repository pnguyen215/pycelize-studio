# API Client - Complete Usage Examples

This document provides real-world usage examples for all advanced features of the API client.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Authentication](#authentication)
3. [Request Retry](#request-retry)
4. [Response Caching](#response-caching)
5. [Rate Limiting](#rate-limiting)
6. [Request Cancellation](#request-cancellation)
7. [WebSocket Integration](#websocket-integration)
8. [Offline Support](#offline-support)
9. [Metrics & Analytics](#metrics--analytics)
10. [Combined Features](#combined-features)

---

## Basic Setup

### Initialize API Client

```typescript
// app/layout.tsx or app/providers.tsx
import { setupInterceptors } from '@/lib/api/interceptors';
import { axiosInstance } from '@/lib/api/axios-instance';

// Setup with desired features
export function initializeApiClient() {
  setupInterceptors(axiosInstance, {
    auth: true,        // Enable JWT auth
    retry: true,       // Enable automatic retry
    cache: true,       // Enable caching
    rateLimit: false,  // Disable rate limiting (not needed)
    offline: true,     // Enable offline support
    metrics: true,     // Enable metrics
  });
}
```

### Make Basic Requests

```typescript
import { api } from '@/lib/api/client';

// GET request
const users = await api.get<User[]>('/users');

// POST request
const newUser = await api.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await api.put<User>(`/users/${userId}`, {
  name: 'Jane Doe'
});

// DELETE request
await api.delete(`/users/${userId}`);
```

---

## Authentication

### Login & Store Token

```typescript
// pages/login.tsx
import { setStoredToken, setStoredRefreshToken } from '@/lib/api/interceptors';
import { api } from '@/lib/api/client';

async function handleLogin(email: string, password: string) {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    // Store tokens
    setStoredToken(response.access_token);
    setStoredRefreshToken(response.refresh_token);
    
    // Redirect to dashboard
    router.push('/dashboard');
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

### Logout & Clear Tokens

```typescript
import { clearAuthTokens } from '@/lib/api/interceptors';

async function handleLogout() {
  try {
    await api.post('/auth/logout');
  } finally {
    clearAuthTokens();
    router.push('/login');
  }
}
```

### Check Authentication Status

```typescript
import { isAuthenticated } from '@/lib/api/interceptors';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}
```

### Configure Token Refresh

```typescript
import { configureAuth } from '@/lib/api/interceptors';

// Configure in app initialization
configureAuth({
  tokenType: 'Bearer',
  autoRefresh: true,
  refreshEndpoint: '/auth/refresh',
  storageKey: 'auth_token',
  refreshTokenKey: 'refresh_token'
});
```

---

## Request Retry

### Global Retry Configuration

```typescript
// app/api-config.ts
import { configureRetry } from '@/lib/api/interceptors';

export function configureApiRetry() {
  configureRetry({
    retries: 3,
    retryDelay: 1000,
    exponentialBackoff: true,
    maxRetryDelay: 30000,
    retryCondition: (error) => {
      // Retry on network errors or 5xx status codes
      return !error.response || error.response.status >= 500;
    },
    onRetry: (error, retryCount) => {
      console.log(`Retrying request (attempt ${retryCount}):`, error.config?.url);
    }
  });
}
```

### Per-Request Retry

```typescript
// Retry important operations more aggressively
async function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return api.post('/upload', formData, {
    retry: {
      retries: 5,
      retryDelay: 2000,
      exponentialBackoff: true,
      onRetry: (error, count) => {
        console.log(`Upload retry ${count}/5`);
      }
    }
  });
}
```

### Disable Retry for Specific Requests

```typescript
// Don't retry user-initiated deletes
async function deleteUser(userId: string) {
  return api.delete(`/users/${userId}`, {
    retry: {
      retries: 0 // Disable retry
    }
  });
}
```

---

## Response Caching

### Enable Caching for GET Requests

```typescript
// Cache expensive data fetches
async function getAnalytics(startDate: string, endDate: string) {
  return api.get('/analytics', {
    params: { startDate, endDate },
    cache: true,
    cacheTTL: 300000, // 5 minutes
  });
}
```

### Invalidate Cache on Mutations

```typescript
// Invalidate cache when data changes
async function updateUser(userId: string, data: Partial<User>) {
  return api.put(`/users/${userId}`, data, {
    invalidateCache: '/users' // Invalidates all /users/* caches
  });
}

async function createPost(data: Post) {
  return api.post('/posts', data, {
    invalidateCache: /^\/posts/ // Regex pattern
  });
}
```

### Manual Cache Management

```typescript
import { 
  invalidateCache, 
  clearAllCache, 
  getCacheStats 
} from '@/lib/api/interceptors';

// Invalidate specific pattern
function refreshUserData() {
  invalidateCache('/users/*');
}

// Clear all cache
function handleLogout() {
  clearAllCache();
  // ... rest of logout logic
}

// View cache statistics
function CacheStatsComponent() {
  const stats = getCacheStats();
  
  return (
    <div>
      <p>Cache Size: {stats.size} / {stats.maxSize}</p>
      <p>Storage: {stats.storage}</p>
    </div>
  );
}
```

---

## Rate Limiting

### Configure Global Rate Limit

```typescript
import { configureRateLimit } from '@/lib/services/rate-limiter';

// Global rate limit for all requests
configureRateLimit('global', {
  maxRequests: 60,
  timeWindow: 60000, // 60 requests per minute
  queueRequests: true,
  maxQueueSize: 100
});
```

### Per-Endpoint Rate Limiting

```typescript
// Configure specific endpoints
configureRateLimit('/api/search', {
  maxRequests: 10,
  timeWindow: 1000, // 10 requests per second
});

configureRateLimit('/api/upload', {
  maxRequests: 5,
  timeWindow: 60000, // 5 uploads per minute
});
```

### Per-Request Rate Limiting

```typescript
// Apply rate limit to specific request
async function searchUsers(query: string) {
  return api.get('/search', {
    params: { q: query },
    rateLimit: {
      maxRequests: 5,
      timeWindow: 1000,
      pattern: '/search'
    }
  });
}
```

### Monitor Rate Limit Status

```typescript
import { getRateLimitStatus } from '@/lib/api/interceptors';

function RateLimitStatus({ pattern }: { pattern?: string }) {
  const status = getRateLimitStatus(pattern);
  
  return (
    <div>
      <p>Available: {status.availableTokens} / {status.maxTokens}</p>
      <p>Queued: {status.queueSize} / {status.maxQueueSize}</p>
    </div>
  );
}
```

---

## Request Cancellation

### Search with Debouncing & Cancellation

```typescript
import { requestCancellation } from '@/lib/services';
import { useMemo, useCallback } from 'react';
import debounce from 'lodash/debounce';

function SearchComponent() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (!searchQuery) return;

      // Cancel previous search
      requestCancellation.cancel('search');

      // Create new cancellable request
      const signal = requestCancellation.createSignal('search');

      try {
        const data = await api.get('/search', {
          params: { q: searchQuery },
          signal
        });
        setResults(data);
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Search failed:', error);
        }
      }
    }, 300),
    []
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  return <input value={query} onChange={handleSearch} />;
}
```

### Cancel on Component Unmount

```typescript
function DataFetchingComponent() {
  useEffect(() => {
    const signal = requestCancellation.createSignal('fetch-data');

    async function fetchData() {
      try {
        const data = await api.get('/data', { signal });
        // Process data...
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Fetch failed:', error);
        }
      }
    }

    fetchData();

    // Cancel on unmount
    return () => {
      requestCancellation.cancel('fetch-data');
    };
  }, []);

  return <div>...</div>;
}
```

### Cancel All Pending Requests

```typescript
// Cancel all when navigating away
function handleNavigate() {
  requestCancellation.cancelAll('Navigation');
  router.push('/other-page');
}
```

---

## WebSocket Integration

### Real-time Notifications

```typescript
import { WebSocketManager } from '@/lib/services';
import { useEffect, useState } from 'react';

function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ws = useMemo(() => new WebSocketManager({
    url: 'wss://api.example.com/ws/notifications',
    autoReconnect: true,
    heartbeatInterval: 30000
  }), []);

  useEffect(() => {
    ws.connect();

    ws.on('message', (data) => {
      if (data.type === 'notification') {
        setNotifications(prev => [data.notification, ...prev]);
      }
    });

    ws.on('stateChange', ({ state }) => {
      console.log('WebSocket state:', state);
    });

    return () => {
      ws.disconnect();
    };
  }, [ws]);

  return (
    <div>
      {notifications.map(notif => (
        <div key={notif.id}>{notif.message}</div>
      ))}
    </div>
  );
}
```

### Chat Application

```typescript
function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const ws = useMemo(() => new WebSocketManager({
    url: `wss://api.example.com/ws/chat/${roomId}`
  }), [roomId]);

  useEffect(() => {
    ws.connect();

    ws.on('message', (data) => {
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => ws.disconnect();
  }, [ws, roomId]);

  const sendMessage = (text: string) => {
    ws.send({
      type: 'message',
      text,
      roomId
    });
  };

  return (
    <div>
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} />
    </div>
  );
}
```

---

## Offline Support

### Monitor Online/Offline Status

```typescript
import { 
  getOfflineStatus, 
  onOfflineStatusChange 
} from '@/lib/api/interceptors';

function OfflineIndicator() {
  const [status, setStatus] = useState(getOfflineStatus());

  useEffect(() => {
    const handler = (isOnline: boolean) => {
      setStatus(getOfflineStatus());
    };

    onOfflineStatusChange(handler);

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (status.isOnline) {
    return null;
  }

  return (
    <div className="offline-banner">
      <p>You are offline. {status.queueSize} requests queued.</p>
    </div>
  );
}
```

### Sync on Reconnection

```typescript
import { syncOfflineQueue } from '@/lib/api/interceptors';

function SyncButton() {
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await syncOfflineQueue();
      NotificationManager.success('Sync completed');
    } catch (error) {
      NotificationManager.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button onClick={handleSync} disabled={syncing}>
      {syncing ? 'Syncing...' : 'Sync Now'}
    </button>
  );
}
```

---

## Metrics & Analytics

### Display Metrics Dashboard

```typescript
import { 
  getMetricsSummary, 
  getAggregatedMetrics 
} from '@/lib/api/interceptors';

function MetricsDashboard() {
  const [metrics, setMetrics] = useState(getAggregatedMetrics());

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(getAggregatedMetrics());
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="metrics-dashboard">
      <div className="metric-card">
        <h3>Total Requests</h3>
        <p>{metrics.totalRequests}</p>
      </div>
      
      <div className="metric-card">
        <h3>Success Rate</h3>
        <p>{(metrics.successRate * 100).toFixed(2)}%</p>
      </div>
      
      <div className="metric-card">
        <h3>Avg Duration</h3>
        <p>{metrics.averageDuration.toFixed(2)}ms</p>
      </div>
      
      <div className="metric-card">
        <h3>Failed Requests</h3>
        <p>{metrics.failedRequests}</p>
      </div>
    </div>
  );
}
```

### Endpoint Performance Table

```typescript
function EndpointPerformanceTable() {
  const metrics = getAggregatedMetrics();

  return (
    <table>
      <thead>
        <tr>
          <th>Endpoint</th>
          <th>Count</th>
          <th>Success Rate</th>
          <th>Avg Duration</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(metrics.endpoints).map(([key, stats]) => (
          <tr key={key}>
            <td>{key}</td>
            <td>{stats.count}</td>
            <td>{(stats.successRate * 100).toFixed(2)}%</td>
            <td>{stats.averageDuration.toFixed(2)}ms</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

### Export Metrics

```typescript
import { MetricsCollector } from '@/lib/services';

const collector = new MetricsCollector({
  enabled: true,
  maxSize: 1000,
  persist: true,
  onExport: (metrics) => {
    // Send to analytics service
    fetch('/analytics/metrics', {
      method: 'POST',
      body: JSON.stringify(metrics)
    });
  }
});

// Trigger export
function handleExportMetrics() {
  collector.export();
}
```

---

## Combined Features

### Complete Example: Data Fetching with All Features

```typescript
import { api } from '@/lib/api/client';
import { requestCancellation } from '@/lib/services';

async function fetchUserDashboard(userId: string) {
  // Create cancellable request
  const signal = requestCancellation.createSignal(`dashboard-${userId}`);

  try {
    const data = await api.get(`/users/${userId}/dashboard`, {
      // Enable caching for 5 minutes
      cache: true,
      cacheTTL: 300000,

      // Retry up to 3 times on failure
      retry: {
        retries: 3,
        exponentialBackoff: true
      },

      // Rate limit to 10 requests per second
      rateLimit: {
        maxRequests: 10,
        timeWindow: 1000
      },

      // Custom notification messages
      notification: {
        successMessage: 'Dashboard loaded',
        errorMessage: 'Failed to load dashboard'
      },

      // Enable metrics collection
      collectMetrics: true,

      // Support request cancellation
      signal
    });

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Request cancelled');
    } else {
      console.error('Failed to fetch dashboard:', error);
    }
    throw error;
  }
}
```

### Production-Ready API Hook

```typescript
import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { requestCancellation } from '@/lib/services';

interface UseApiOptions<T> {
  url: string;
  cache?: boolean;
  retry?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

function useApi<T>(options: UseApiOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    const requestKey = `api-${options.url}`;
    const signal = requestCancellation.createSignal(requestKey);

    setLoading(true);
    setError(null);

    try {
      const result = await api.get<T>(options.url, {
        cache: options.cache,
        retry: options.retry ? { retries: 3 } : { retries: 0 },
        signal
      });

      setData(result);
      options.onSuccess?.(result);
    } catch (err) {
      if (err.name !== 'AbortError') {
        const error = err as Error;
        setError(error);
        options.onError?.(error);
      }
    } finally {
      setLoading(false);
    }
  }, [options]);

  useEffect(() => {
    fetchData();

    return () => {
      requestCancellation.cancel(`api-${options.url}`);
    };
  }, [fetchData, options.url]);

  return { data, loading, error, refetch: fetchData };
}

// Usage
function UserProfile({ userId }: { userId: string }) {
  const { data, loading, error } = useApi<User>({
    url: `/users/${userId}`,
    cache: true,
    retry: true,
    onSuccess: (user) => console.log('User loaded:', user.name),
    onError: (err) => console.error('Failed:', err.message)
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return null;

  return <div>{data.name}</div>;
}
```

---

## Best Practices

### 1. Always Clean Up

```typescript
useEffect(() => {
  const signal = requestCancellation.createSignal('my-request');
  const ws = new WebSocketManager({ url: '...' });
  
  // ... use them ...

  return () => {
    requestCancellation.cancel('my-request');
    ws.disconnect();
  };
}, []);
```

### 2. Handle Errors Gracefully

```typescript
try {
  const data = await api.get('/endpoint');
} catch (error) {
  if (error.message.includes('offline')) {
    // Queued for later
    NotificationManager.info('Request will be sent when online');
  } else if (error.message.includes('Rate limit')) {
    // Rate limited
    NotificationManager.warning('Too many requests, please wait');
  } else {
    // Other errors
    NotificationManager.error('Request failed');
  }
}
```

### 3. Configure Features Based on Environment

```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

setupInterceptors(axiosInstance, {
  auth: true,
  retry: true,
  cache: !isDevelopment, // Disable cache in development
  rateLimit: false,
  offline: true,
  metrics: !isDevelopment // Collect metrics in production only
});
```

---

## Troubleshooting

### Enable Debug Logging

```env
# .env.local
NEXT_PUBLIC_PYCELIZE_DEBUGGING=true
```

This will log all:
- Request details
- Response details
- Cache operations
- Retry attempts
- Rate limit status
- Offline events
- Metrics

### Common Issues

**Issue**: Requests not being cached
```typescript
// Make sure cache is enabled
api.get('/endpoint', { cache: true })
```

**Issue**: Too many retries
```typescript
// Reduce retry count
configureRetry({ retries: 1 })
```

**Issue**: Rate limit errors
```typescript
// Increase limits or enable queuing
configureRateLimit('pattern', {
  maxRequests: 100,
  queueRequests: true
})
```

---

For more information, see the [API Client README](../lib/api/README.md).
