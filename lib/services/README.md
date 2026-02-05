# Services Module

This module contains centralized service classes and utilities used throughout the application.

## Files

### `notification-manager.ts`

A centralized notification management system using Sonner toast library.

## NotificationManager

The `NotificationManager` class provides a clean, consistent API for displaying notifications to users.

### Features

- ✅ Centralized notification management
- ✅ Configurable notification behavior (enable/disable per call)
- ✅ Support for all Sonner toast types
- ✅ Promise-based notifications with automatic state handling
- ✅ Professional OOP design with static methods
- ✅ Easy to audit and maintain

### Usage

#### Basic Notifications

```typescript
import { NotificationManager } from '@/lib/services/notification-manager';

// Success notification
NotificationManager.success('Operation completed successfully');

// Error notification
NotificationManager.error('Failed to complete operation');

// Info notification
NotificationManager.info('Processing in background...');

// Warning notification
NotificationManager.warning('Large file detected');

// Generic notification
NotificationManager.message('Something happened');
```

#### Loading State

```typescript
// Show loading notification
const toastId = NotificationManager.loading('Uploading file...');

// Later, dismiss it
NotificationManager.dismiss(toastId);

// Show success
NotificationManager.success('Upload complete!');
```

#### Promise-Based Notifications

```typescript
// Automatic loading → success/error handling
NotificationManager.promise(
  uploadFile(file),
  {
    loading: 'Uploading file...',
    success: 'File uploaded successfully',
    error: 'Failed to upload file'
  }
);
```

#### Configurable Notifications

```typescript
// Disable notifications
NotificationManager.success('Silent success', { enabled: false });

// Custom duration (5 seconds)
NotificationManager.error('Error occurred', { duration: 5000 });

// Advanced Sonner options
NotificationManager.info('Update available', {
  duration: 10000,
  options: {
    description: 'Click to learn more',
    action: {
      label: 'View',
      onClick: () => console.log('Clicked')
    }
  }
});
```

#### HTTP Status Code Based Notifications

The `notify` function automatically determines the notification type based on HTTP status codes:

```typescript
import { NotificationManager } from '@/lib/services/notification-manager';

// 2xx - Success notification
NotificationManager.notify({
  statusCode: 200,
  message: 'User created successfully'
});

// 2xx - Success (204 No Content)
NotificationManager.notify({
  statusCode: 204,
  message: 'User deleted successfully'
});

// 3xx - Loading notification (for redirects/processing)
NotificationManager.notify({
  statusCode: 302,
  message: 'Redirecting...'
});

// 4xx - Error notification (client errors)
NotificationManager.notify({
  statusCode: 404,
  message: 'User not found'
});

// 4xx - Error notification (validation error)
NotificationManager.notify({
  statusCode: 422,
  message: 'Invalid data provided'
});

// 5xx - Error notification (server errors)
NotificationManager.notify({
  statusCode: 500,
  message: 'Server error occurred'
});
```

**Status Code Mapping:**
- **2xx (Success)** → Success notification ✅
- **3xx (Redirection/Processing)** → Loading notification ⏳
- **4xx (Client Error)** → Error notification ❌
- **5xx (Server Error)** → Error notification ❌

#### Promise-Based Notifications with `notify`

For async operations like file uploads, data processing, or long-running tasks:

```typescript
// File upload with automatic loading → success/error transitions
NotificationManager.notify({
  promise: uploadFile(file),
  messages: {
    loading: 'Uploading file...',
    success: 'File uploaded successfully',
    error: 'Failed to upload file'
  }
});

// Excel processing
NotificationManager.notify({
  promise: processExcelFile(file),
  messages: {
    loading: 'Processing Excel file...',
    success: 'Excel file processed successfully',
    error: 'Failed to process Excel file'
  }
});

// CSV conversion
NotificationManager.notify({
  promise: convertCsvToJson(file),
  messages: {
    loading: 'Converting CSV to JSON...',
    success: 'Conversion completed',
    error: 'Conversion failed'
  }
});
```

#### Real-World API Integration

```typescript
// Example: Fetch API with status code handling
async function fetchUsers() {
  try {
    const response = await fetch('/api/users');
    const data = await response.json();
    
    // Show notification based on status code
    NotificationManager.notify({
      statusCode: response.status,
      message: response.ok ? 'Users loaded successfully' : data.message || 'Failed to load users'
    });
    
    return data;
  } catch (error) {
    NotificationManager.notify({
      statusCode: 500,
      message: 'Network error occurred'
    });
  }
}

// Example: POST request with promise notification
async function createUser(userData: User) {
  return NotificationManager.notify({
    promise: fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    }).then(res => res.json()),
    messages: {
      loading: 'Creating user...',
      success: 'User created successfully',
      error: 'Failed to create user'
    }
  });
}

// Example: File upload with progress
async function handleFileUpload(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return NotificationManager.notify({
    promise: fetch('/api/upload', {
      method: 'POST',
      body: formData
    }).then(res => {
      // After promise resolves, check status code
      if (!res.ok) {
        throw new Error('Upload failed');
      }
      return res.json();
    }),
    messages: {
      loading: `Uploading ${file.name}...`,
      success: `${file.name} uploaded successfully`,
      error: `Failed to upload ${file.name}`
    }
  });
}
```

#### Using with Axios

```typescript
import axios from 'axios';
import { NotificationManager } from '@/lib/services/notification-manager';

// GET request with status code notification
async function getUsers() {
  try {
    const response = await axios.get('/api/users');
    
    NotificationManager.notify({
      statusCode: response.status,
      message: 'Users loaded successfully'
    });
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      NotificationManager.notify({
        statusCode: error.response.status,
        message: error.response.data.message || 'Failed to load users'
      });
    }
  }
}

// POST request with promise notification
function createUser(userData: User) {
  return NotificationManager.notify({
    promise: axios.post('/api/users', userData).then(res => res.data),
    messages: {
      loading: 'Creating user...',
      success: 'User created successfully',
      error: 'Failed to create user'
    }
  });
}
```

### API Reference

#### Methods

- **`success(message, config?)`** - Display success notification
- **`error(message, config?)`** - Display error notification
- **`info(message, config?)`** - Display info notification
- **`warning(message, config?)`** - Display warning notification
- **`loading(message, config?)`** - Display loading notification
- **`message(message, config?)`** - Display generic notification
- **`dismiss(toastId?)`** - Dismiss specific toast
- **`promise(promise, messages, config?)`** - Handle promise with notifications
- **`notify(options)`** - Smart notification based on HTTP status code or promise

#### `notify` Method Signatures

```typescript
// Immediate notification based on HTTP status code
NotificationManager.notify({
  statusCode: number;
  message: string;
  config?: NotificationConfig;
});

// Promise-based notification for async operations
NotificationManager.notify({
  promise: Promise<T>;
  messages: {
    loading: string;
    success: string;
    error: string;
  };
  config?: NotificationConfig;
});
```

#### Configuration Options

```typescript
interface NotificationConfig {
  enabled?: boolean;     // Enable/disable notifications (default: true)
  duration?: number;     // Duration in ms before auto-dismiss
  options?: ExternalToast; // Advanced Sonner options
}
```

### When to Use Each Method

| Method | Use Case |
|--------|----------|
| `success()` | Explicitly show success message |
| `error()` | Explicitly show error message |
| `info()` | Neutral information or tips |
| `warning()` | Cautionary messages |
| `loading()` | Manual loading state management |
| `promise()` | Async operations with known message templates |
| `notify()` | **Dynamic notification based on HTTP status or async operations** |

**Use `notify()` when:**
- ✅ You have HTTP status codes and want automatic type selection
- ✅ You're handling API responses with varying status codes
- ✅ You want unified notification handling across your app
- ✅ You're working with promise-based async operations

**Use specific methods when:**
- ✅ You know the exact notification type needed
- ✅ You don't have status codes to work with
- ✅ You want explicit control over notification type

### Integration with API Client

The NotificationManager is integrated into the API client's interceptors for automatic notification handling:

```typescript
import { api } from '@/lib/api/client';

// Automatic success notification
const data = await api.get('/endpoint');

// Disable notifications for specific request
const data = await api.get('/endpoint', {
  notification: { enabled: false }
});
```

### Benefits

- 🎯 **Centralized**: All notifications go through one place
- 🔍 **Auditable**: Easy to track all notification triggers
- 🎨 **Flexible**: Enable/disable per call, custom durations
- 📦 **Abstraction**: Can swap toast library without changing app code
- 🏗️ **OOP Design**: Professional class-based architecture
- 📚 **Well Documented**: Comprehensive JSDoc comments

---

## WebSocketManager

The `WebSocketManager` class provides robust WebSocket connectivity with automatic reconnection, event handling, and heartbeat support for real-time communication.

### Features

- ✅ Automatic reconnection with exponential backoff
- ✅ Heartbeat/ping-pong support for connection health
- ✅ Event-based message handling
- ✅ Connection state management
- ✅ Multiple WebSocket instances support
- ✅ Configurable reconnection policies

### Basic Usage

#### Creating a WebSocket Connection

```typescript
import { WebSocketManager } from '@/lib/services/websocket-manager';

// Create WebSocket manager instance
const ws = new WebSocketManager({
  url: 'wss://api.example.com/ws',
  autoReconnect: true,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000 // 30 seconds
});

// Connect to the server
ws.connect();

// Listen for messages
ws.on('message', (data) => {
  console.log('Received:', data);
});

// Send data
ws.send({ type: 'subscribe', channel: 'updates' });

// Disconnect when done
ws.disconnect();
```

#### Event Handling

```typescript
import { WebSocketManager, WebSocketState } from '@/lib/services/websocket-manager';

const ws = new WebSocketManager({ url: 'wss://api.example.com/ws' });

// Connection opened
ws.on('open', () => {
  console.log('Connected to WebSocket server');
});

// Connection closed
ws.on('close', ({ code, reason }) => {
  console.log(`Disconnected: ${code} - ${reason}`);
});

// Connection error
ws.on('error', ({ error }) => {
  console.error('WebSocket error:', error);
});

// State change
ws.on('stateChange', ({ state }) => {
  console.log('Connection state:', state);
  // States: CONNECTING, CONNECTED, DISCONNECTING, DISCONNECTED, RECONNECTING, ERROR
});

// Reconnection attempt
ws.on('reconnect', ({ attempt }) => {
  console.log(`Reconnection attempt ${attempt}`);
});

ws.connect();
```

#### React Component Example

```typescript
import { useEffect, useMemo } from 'react';
import { WebSocketManager } from '@/lib/services/websocket-manager';

function NotificationsComponent() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  // Create WebSocket instance (memoized to avoid recreation)
  const ws = useMemo(() => new WebSocketManager({
    url: 'wss://api.example.com/ws/notifications',
    autoReconnect: true,
    heartbeatInterval: 30000
  }), []);

  useEffect(() => {
    // Connect to WebSocket
    ws.connect();

    // Handle incoming messages
    ws.on('message', (data) => {
      if (data.type === 'notification') {
        setNotifications(prev => [data.notification, ...prev]);
      }
    });

    // Handle connection state changes
    ws.on('stateChange', ({ state }) => {
      console.log('WebSocket state:', state);
    });

    // Cleanup on unmount
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

#### Chat Application Example

```typescript
function ChatRoom({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  
  const ws = useMemo(() => new WebSocketManager({
    url: `wss://api.example.com/ws/chat/${roomId}`,
    autoReconnect: true
  }), [roomId]);

  useEffect(() => {
    ws.connect();

    ws.on('message', (data) => {
      if (data.type === 'message') {
        setMessages(prev => [...prev, data.message]);
      }
    });

    return () => ws.disconnect();
  }, [ws]);

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

### Configuration Options

```typescript
interface WebSocketConfig {
  url?: string;                    // WebSocket server URL
  autoReconnect?: boolean;         // Auto-reconnect on disconnect (default: true)
  maxReconnectAttempts?: number;   // Max reconnection attempts (default: 5)
  reconnectDelay?: number;         // Initial reconnect delay in ms (default: 1000)
  maxReconnectDelay?: number;      // Max reconnect delay in ms (default: 30000)
  heartbeatInterval?: number;      // Heartbeat interval in ms (default: 30000, 0 to disable)
  heartbeatMessage?: string;       // Heartbeat message (default: 'ping')
  protocols?: string | string[];   // WebSocket protocols
}
```

### API Reference

#### Methods

- **`connect()`** - Connect to WebSocket server
- **`disconnect(code?, reason?)`** - Disconnect from server
- **`send(data)`** - Send data through WebSocket (auto-stringified if object)
- **`on(event, handler)`** - Register event handler
- **`off(event, handler)`** - Unregister event handler
- **`getState()`** - Get current connection state
- **`isConnected()`** - Check if currently connected

#### Events

- **`open`** - Connection opened
- **`close`** - Connection closed
- **`error`** - Connection error
- **`message`** - Message received
- **`reconnect`** - Reconnection attempt
- **`stateChange`** - Connection state changed

#### States

- `CONNECTING` - Currently connecting
- `CONNECTED` - Successfully connected
- `DISCONNECTING` - Currently disconnecting
- `DISCONNECTED` - Disconnected
- `RECONNECTING` - Attempting to reconnect
- `ERROR` - Error state

### Best Practices

1. **Always clean up**: Disconnect in component cleanup/unmount
2. **Use memoization**: Create WebSocket instance with `useMemo` in React
3. **Handle all states**: Listen to `stateChange` for UI updates
4. **Implement heartbeat**: Keep connections alive with periodic pings
5. **Error handling**: Always listen to `error` events

---

## CacheManager

The `CacheManager` class provides a flexible caching system with multiple storage strategies, TTL support, and automatic cache management for improving application performance.

### Features

- ✅ Multiple storage strategies (memory, localStorage, sessionStorage)
- ✅ TTL (Time-To-Live) support with automatic expiration
- ✅ LRU eviction when size limit reached
- ✅ Cache invalidation (single entry, pattern matching)
- ✅ Size limits and statistics
- ✅ Persistent storage options

### Basic Usage

#### Creating a Cache Manager

```typescript
import { CacheManager } from '@/lib/services/cache-manager';

// Create cache manager with default settings (memory storage)
const cache = new CacheManager();

// Or with custom configuration
const cache = new CacheManager({
  storage: 'localStorage',      // 'memory', 'localStorage', or 'sessionStorage'
  defaultTTL: 300000,            // 5 minutes
  maxSize: 100,                  // Max 100 cached entries
  keyPrefix: 'my_app_cache_'     // Storage key prefix
});
```

#### Storing and Retrieving Data

```typescript
// Store data in cache
cache.set('/api/users', undefined, usersData, 300000); // 5 minutes TTL

// Retrieve data from cache
const cachedUsers = cache.get('/api/users');
if (cachedUsers) {
  console.log('Cache hit!', cachedUsers);
} else {
  console.log('Cache miss, fetching from API...');
}

// Store with query parameters
cache.set('/api/search', { q: 'query' }, searchResults, 60000); // 1 minute TTL

// Retrieve with same parameters
const cachedResults = cache.get('/api/search', { q: 'query' });
```

#### Cache Invalidation

```typescript
// Invalidate specific cache entry
cache.invalidate('/api/users');

// Invalidate by pattern (regex)
cache.invalidatePattern('/api/users/*');
cache.invalidatePattern(/^\/api\/users/);

// Clear all cache
cache.clear();
```

#### Cache Statistics

```typescript
// Get cache statistics
const stats = cache.stats();
console.log(stats);
// {
//   size: 45,              // Current number of entries
//   maxSize: 100,          // Maximum capacity
//   storage: 'memory'      // Storage strategy
// }
```

### Storage Strategies

#### Memory Storage (Default)

Fast, volatile storage that clears on page refresh.

```typescript
const memoryCache = new CacheManager({
  storage: 'memory'
});
```

**Use cases:**
- Temporary data that doesn't need persistence
- Fast access required
- Development/testing

#### LocalStorage

Persistent storage that survives page refreshes.

```typescript
const persistentCache = new CacheManager({
  storage: 'localStorage',
  keyPrefix: 'app_cache_'
});
```

**Use cases:**
- Data that should persist across sessions
- User preferences
- Frequently accessed API responses

#### SessionStorage

Storage that persists only for the current browser session.

```typescript
const sessionCache = new CacheManager({
  storage: 'sessionStorage'
});
```

**Use cases:**
- Session-specific data
- Temporary data that shouldn't persist after tab close
- Privacy-sensitive cached data

### Real-World Examples

#### Caching API Responses

```typescript
import { CacheManager } from '@/lib/services/cache-manager';

const apiCache = new CacheManager({
  storage: 'localStorage',
  defaultTTL: 300000, // 5 minutes
  maxSize: 50
});

async function fetchUsers() {
  // Check cache first
  const cached = apiCache.get('/api/users');
  if (cached) {
    return cached;
  }

  // Fetch from API if not cached
  const response = await fetch('/api/users');
  const users = await response.json();

  // Store in cache
  apiCache.set('/api/users', undefined, users);

  return users;
}
```

#### React Hook with Caching

```typescript
import { useState, useEffect } from 'react';
import { CacheManager } from '@/lib/services/cache-manager';

const cache = new CacheManager({ storage: 'localStorage' });

function useCachedApi<T>(url: string, ttl = 300000) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Try cache first
      const cached = cache.get<T>(url);
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch from API
      try {
        const response = await fetch(url);
        const result = await response.json();
        
        // Cache the result
        cache.set(url, undefined, result, ttl);
        setData(result);
      } catch (error) {
        console.error('Failed to fetch:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [url, ttl]);

  return { data, loading };
}

// Usage
function UsersList() {
  const { data: users, loading } = useCachedApi<User[]>('/api/users');

  if (loading) return <div>Loading...</div>;
  return <div>{users?.map(user => <div key={user.id}>{user.name}</div>)}</div>;
}
```

#### Invalidate Cache on Mutations

```typescript
import { CacheManager } from '@/lib/services/cache-manager';

const cache = new CacheManager({ storage: 'localStorage' });

async function createUser(userData: User) {
  const response = await fetch('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  // Invalidate users cache after creating a new user
  cache.invalidatePattern('/api/users');

  return response.json();
}

async function updateUser(userId: string, userData: Partial<User>) {
  const response = await fetch(`/api/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData)
  });

  // Invalidate specific user and list cache
  cache.invalidate(`/api/users/${userId}`);
  cache.invalidatePattern('/api/users');

  return response.json();
}
```

#### Multi-level Caching Strategy

```typescript
// Short-lived memory cache for frequently accessed data
const memoryCache = new CacheManager({
  storage: 'memory',
  defaultTTL: 60000, // 1 minute
  maxSize: 20
});

// Long-lived persistent cache for less frequently changing data
const persistentCache = new CacheManager({
  storage: 'localStorage',
  defaultTTL: 3600000, // 1 hour
  maxSize: 100
});

async function fetchWithMultiCache(url: string) {
  // Try memory cache first (fastest)
  let data = memoryCache.get(url);
  if (data) return data;

  // Try persistent cache second
  data = persistentCache.get(url);
  if (data) {
    // Promote to memory cache
    memoryCache.set(url, undefined, data);
    return data;
  }

  // Fetch from API as last resort
  const response = await fetch(url);
  data = await response.json();

  // Store in both caches
  memoryCache.set(url, undefined, data);
  persistentCache.set(url, undefined, data);

  return data;
}
```

### Configuration Options

```typescript
interface CacheConfig {
  storage?: 'memory' | 'localStorage' | 'sessionStorage'; // Storage strategy (default: 'memory')
  defaultTTL?: number;        // Default TTL in ms (default: 300000 = 5 minutes)
  maxSize?: number;           // Max cached entries (default: 100)
  keyPrefix?: string;         // Storage key prefix (default: 'api_cache_')
}
```

### API Reference

#### Methods

- **`get<T>(url, params?)`** - Retrieve cached data
- **`set<T>(url, params, data, ttl?)`** - Store data in cache
- **`invalidate(url, params?)`** - Invalidate specific cache entry
- **`invalidatePattern(pattern)`** - Invalidate by pattern (regex or string)
- **`clear()`** - Clear all cache entries
- **`stats()`** - Get cache statistics (size, maxSize, storage)

#### Parameters

- **`url`**: Request URL used as cache key
- **`params`**: Optional query parameters (included in cache key)
- **`data`**: Data to cache
- **`ttl`**: Time-to-live in milliseconds (overrides default)
- **`pattern`**: String or RegExp pattern for matching cache keys

### Best Practices

1. **Choose appropriate storage**: Memory for temporary, localStorage for persistent
2. **Set reasonable TTLs**: Balance freshness vs. performance
3. **Invalidate on mutations**: Clear cache when data changes
4. **Monitor cache size**: Use `stats()` to track cache usage
5. **Use patterns for bulk invalidation**: Clear related caches efficiently
6. **Consider cache warming**: Pre-populate cache for critical data
7. **Handle cache misses**: Always have fallback to API

### Performance Tips

- **Memory cache** is fastest (no serialization/deserialization)
- **LocalStorage** adds overhead but provides persistence
- Use **pattern invalidation** sparingly (iterates all keys)
- Set **appropriate maxSize** to prevent memory issues
- Use **shorter TTLs** for frequently changing data

### Integration with API Client

The CacheManager can be used with the API client's cache interceptor:

```typescript
import { api } from '@/lib/api/client';

// API client handles caching automatically
const data = await api.get('/endpoint', {
  cache: true,
  cacheTTL: 300000
});
```

See [API Client README](../api/README.md) for more details on integrated caching.

---

## Adding New Services

To add a new service to this module:

1. Create a new file in `lib/services/`
2. Implement your service class or utility functions
3. Export from `lib/services/index.ts`
4. Document in this README

Example:

```typescript
// lib/services/my-service.ts
export class MyService {
  public static doSomething() {
    // Implementation
  }
}

// lib/services/index.ts
export { MyService } from './my-service';
```
