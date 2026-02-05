# NotificationManager `notify` Method

## 🎯 Overview

Successfully added a smart `notify` method to NotificationManager that automatically determines notification types based on HTTP status codes and handles promise-based async operations.

---

## ✅ Implementation Details

### HTTP Status Code Mapping

The `notify` method implements the following automatic mapping:

| Status Code Range | Notification Type | Icon | Use Case                              |
| ----------------- | ----------------- | ---- | ------------------------------------- |
| **2xx** (200-299) | Success           | ✅   | Successful operations                 |
| **3xx** (300-399) | Loading           | ⏳   | Redirects, processing, pending        |
| **4xx** (400-499) | Error             | 🔴   | Client errors (validation, not found) |
| **5xx** (500-599) | Error             | 🔴   | Server errors                         |

### Two Operation Modes

#### 1. Immediate Notification (Status Code Based)

Use when you already have an HTTP response:

```typescript
NotificationManager.notify({
  statusCode: 200,
  message: "User created successfully",
});

NotificationManager.notify({
  statusCode: 404,
  message: "User not found",
});

NotificationManager.notify({
  statusCode: 500,
  message: "Server error occurred",
});
```

#### 2. Promise-Based Notification (Async Operations)

Use for ongoing async operations with automatic state transitions:

```typescript
NotificationManager.notify({
  promise: uploadFile(file),
  messages: {
    loading: "Uploading file...", // Shows initially
    success: "File uploaded!", // Shows on resolve
    error: "Upload failed", // Shows on reject
  },
});
```

---

## 📚 Real-World Examples

### Example 1: Fetch API Integration

```typescript
async function fetchUsers() {
  try {
    const response = await fetch("/api/users");
    const data = await response.json();

    // Automatic notification based on status
    NotificationManager.notify({
      statusCode: response.status,
      message: response.ok
        ? "Users loaded successfully"
        : data.message || "Failed to load users",
    });

    return data;
  } catch (error) {
    NotificationManager.notify({
      statusCode: 500,
      message: "Network error occurred",
    });
  }
}
```

### Example 2: File Upload with Promise

```typescript
async function handleFileUpload(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  return NotificationManager.notify({
    promise: fetch("/api/upload", {
      method: "POST",
      body: formData,
    }).then((res) => {
      if (!res.ok) throw new Error("Upload failed");
      return res.json();
    }),
    messages: {
      loading: `Uploading ${file.name}...`,
      success: `${file.name} uploaded successfully`,
      error: `Failed to upload ${file.name}`,
    },
  });
}
```

### Example 3: Axios Integration

```typescript
async function createUser(userData: User) {
  try {
    const response = await axios.post("/api/users", userData);

    NotificationManager.notify({
      statusCode: response.status,
      message: "User created successfully",
    });

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      NotificationManager.notify({
        statusCode: error.response.status,
        message: error.response.data.message || "Failed to create user",
      });
    }
  }
}
```

### Example 4: Excel/CSV Processing

```typescript
// Long-running operations with progress feedback
NotificationManager.notify({
  promise: processExcelFile(file),
  messages: {
    loading: "Processing Excel file...",
    success: "Excel file processed successfully",
    error: "Failed to process Excel file",
  },
});

NotificationManager.notify({
  promise: convertCsvToJson(file),
  messages: {
    loading: "Converting CSV to JSON...",
    success: "Conversion completed",
    error: "Conversion failed",
  },
});
```

---

## 🎓 Decision Guide

### When to Use `notify()`

✅ **Use `notify()` when:**

- You have HTTP status codes and want automatic type selection
- You're handling API responses with varying status codes
- You want unified notification handling across your app
- You're working with promise-based async operations
- You want consistent notification patterns

### When to Use Specific Methods

✅ **Use `success()`, `error()`, etc. when:**

- You know the exact notification type needed
- You don't have status codes to work with
- You want explicit control over notification type
- You're handling non-HTTP operations

---

## 📊 Method Comparison

| Method      | Input                  | When to Use                                                |
| ----------- | ---------------------- | ---------------------------------------------------------- |
| `success()` | Message                | Explicit success notification                              |
| `error()`   | Message                | Explicit error notification                                |
| `loading()` | Message                | Manual loading state                                       |
| `promise()` | Promise + messages     | Known async operation with fixed messages                  |
| `notify()`  | Status code OR promise | **Dynamic notification based on HTTP status or async ops** |

---

## 🔧 Type Signature

```typescript
// Immediate notification
NotificationManager.notify({
  statusCode: number;
  message: string;
  config?: NotificationConfig;
});

// Promise-based notification
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

---

## ✨ Benefits

1. **Automatic Type Selection**: No need to manually decide between success/error/loading
2. **Consistent UX**: Standardized notification patterns across the app
3. **Reduced Boilerplate**: Less code to write for common scenarios
4. **Type Safety**: Full TypeScript support with proper type inference
5. **Flexible**: Works with any HTTP client (fetch, Axios, etc.)
6. **Promise Support**: Built-in handling for async operations
7. **Easy to Audit**: All notifications go through one method

---

## 📝 Code Quality

- ✅ Full TypeScript support with proper type definitions
- ✅ Comprehensive JSDoc documentation
- ✅ Build passing (Next.js compilation successful)
- ✅ Lint passing (ESLint validation successful)
- ✅ Extensive usage examples in documentation
- ✅ Real-world integration patterns documented

---
