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

#### Configuration Options

```typescript
interface NotificationConfig {
  enabled?: boolean;     // Enable/disable notifications (default: true)
  duration?: number;     // Duration in ms before auto-dismiss
  options?: ExternalToast; // Advanced Sonner options
}
```

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
