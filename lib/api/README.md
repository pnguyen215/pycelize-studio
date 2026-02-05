# API Client Module - Modern Axios Architecture

This module provides a modern, layered HTTP client architecture using Axios with clear separation of concerns.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        API Client                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌───────────────────────┐       │
│  │  Axios Instance  │──────│   Interceptors        │       │
│  │  (axios-instance)│      │   ├─ Request          │       │
│  └──────────────────┘      │   ├─ Response         │       │
│                             │   └─ Error            │       │
│                             └───────────────────────┘       │
│                                      │                       │
│                                      ↓                       │
│                         ┌─────────────────────────┐         │
│                         │  Notification Manager   │         │
│                         └─────────────────────────┘         │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Files

### Core Files

- **`client.ts`**: Main API client with type-safe HTTP methods (get, post, put, delete)
- **`axios-instance.ts`**: Axios instance factory with base configuration
- **`types.ts`**: TypeScript interfaces for API requests and responses

### Interceptors (`interceptors/`)

- **`request.interceptor.ts`**: Handles outgoing requests (FormData detection, debug logging)
- **`response.interceptor.ts`**: Handles successful responses (notifications, data extraction)
- **`error.interceptor.ts`**: Handles errors and failures (error notifications, message extraction)
- **`index.ts`**: Exports all interceptors and provides `setupInterceptors()` utility

## Usage

### Basic Usage

```typescript
import { api } from '@/lib/api/client';

// GET request with automatic success notification
const data = await api.get<User>('/users/123');

// POST request
const newUser = await api.post<User>('/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// PUT request
const updated = await api.put<User>('/users/123', {
  name: 'Jane Doe'
});

// DELETE request
await api.delete('/users/123');
```

### Controlling Notifications

```typescript
// Disable notifications for a specific request
const data = await api.get('/analytics', {
  notification: { enabled: false }
});

// Custom success message
const result = await api.post('/upload', formData, {
  notification: { successMessage: 'File uploaded successfully!' }
});

// Custom error message
await api.delete('/items/123', {
  notification: { errorMessage: 'Failed to delete item' }
});

// Both custom messages
const updated = await api.put('/profile', data, {
  notification: {
    successMessage: 'Profile updated!',
    errorMessage: 'Failed to update profile'
  }
});
```

### Using NotificationManager Directly

```typescript
import { NotificationManager } from '@/lib/services/notification-manager';

// Manual notifications
NotificationManager.success('Operation completed');
NotificationManager.error('Something went wrong');
NotificationManager.info('FYI: Processing in background');
NotificationManager.warning('Large file detected');

// Loading state
const toastId = NotificationManager.loading('Uploading...');
// Later...
NotificationManager.dismiss(toastId);
NotificationManager.success('Upload complete!');

// Promise-based notifications
NotificationManager.promise(
  uploadFile(file),
  {
    loading: 'Uploading...',
    success: 'Upload complete!',
    error: 'Upload failed'
  }
);
```

## Features

### ✅ Separation of Concerns
- Each interceptor has a single, well-defined responsibility
- Easy to test, debug, and maintain individual components

### ✅ Centralized Notification Management
- Consistent user feedback across the application
- Configurable per-request (enable/disable)
- Custom messages supported
- Integration with Sonner toast library

### ✅ Type Safety
- Full TypeScript support with generics
- Extended `ApiRequestConfig` type for notification control
- Proper error typing and handling

### ✅ Debug Mode
- Comprehensive logging when `NEXT_PUBLIC_DEBUGGING_REQUEST` is enabled
- Request/response details logged to console
- Easy troubleshooting during development

### ✅ Automatic Features
- FormData Content-Type detection
- Error message extraction from multiple response formats
- Response data extraction (clean API usage pattern)

## Configuration

All configuration is centralized in `configs/env.ts`:

```typescript
import { EEnv } from '@/configs/env';

// Access configuration
const apiUrl = EEnv.NEXT_PUBLIC_PYCELIZE_API_URL;
const debugMode = EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST;
```

## Extending the API Client

### Adding New Interceptors

1. Create your interceptor in `lib/api/interceptors/`
2. Export it from `lib/api/interceptors/index.ts`
3. Register it in the `setupInterceptors()` function

### Custom Request Configuration

Extend the `ApiRequestConfig` interface in `types.ts` to add new configuration options:

```typescript
export interface ApiRequestConfig extends AxiosRequestConfig {
  notification?: { ... };
  // Add your custom options here
  customOption?: boolean;
}
```

## Migration from Old Client

The new architecture maintains backward compatibility with the old client.ts API:

```typescript
// Old usage (still works)
import { api } from '@/lib/api/client';
const data = await api.get('/endpoint');

// New features (notification control)
const data = await api.get('/endpoint', {
  notification: { enabled: false }
});
```

No changes required to existing API calls unless you want to use the new notification control features.

## Benefits

- 🎯 **Clear Architecture**: Easy to understand and maintain
- 🔒 **Type Safe**: Full TypeScript support
- 🎨 **Flexible**: Configurable notifications per request
- 🐛 **Debuggable**: Comprehensive logging in debug mode
- 📈 **Scalable**: Easy to extend with new interceptors
- ✅ **Tested**: Clean separation makes testing easier
- 📚 **Documented**: Professional comments throughout

## Related Modules

- **Configs** (`/configs`): Environment configuration
- **Services** (`/lib/services`): Notification manager and other services
