# Environment Configuration Centralization

## Overview

All environment variables in the Pycelize Studio application are now centralized in `configs/env.ts` to provide:
- **Type safety**: Strongly-typed access to environment variables
- **Single source of truth**: All configuration in one place
- **Better maintainability**: Easy to audit and manage environment-related changes
- **Consistent defaults**: Predefined fallback values

## Available Configuration

### API Configuration

#### `NEXT_PUBLIC_PYCELIZE_API_URL`
- **Type**: `string`
- **Default**: `"http://localhost:5050/api/v1"`
- **Description**: Base URL for the Pycelize API backend service
- **Example**: 
  - Development: `http://localhost:5050/api/v1`
  - Production: `https://api.pycelize.com/api/v1`

#### `NEXT_PUBLIC_PYCELIZE_WS_URL`
- **Type**: `string`
- **Default**: `"ws://127.0.0.1:5051"`
- **Description**: WebSocket URL for the Pycelize chat bot service
- **Example**:
  - Development: `ws://127.0.0.1:5051`
  - Production: `wss://ws.pycelize.com`
- **Usage**: WebSocket connection is formed as `${NEXT_PUBLIC_PYCELIZE_WS_URL}/chat/{chat_id}`

### Debug Configuration

#### `NEXT_PUBLIC_DEBUGGING_REQUEST`
- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable verbose request/response logging to console
- **Set via**: `NEXT_PUBLIC_PYCELIZE_DEBUGGING=true` in .env file

### Firebase Configuration

#### `NEXT_PUBLIC_FIREBASE_CONFIG`
- **Type**: `Record<string, unknown>`
- **Default**: `{}`
- **Description**: Firebase SDK initialization parameters
- **Format**: JSON string in .env file

## Usage

### Importing

```typescript
import { EEnv } from "@/configs/env";
```

### Examples

#### Using API URL
```typescript
// ✅ Correct - Use centralized config
import { EEnv } from "@/configs/env";
const apiUrl = EEnv.NEXT_PUBLIC_PYCELIZE_API_URL;

// ❌ Incorrect - Don't use process.env directly
const apiUrl = process.env.NEXT_PUBLIC_PYCELIZE_API_URL;
```

#### Using WebSocket URL
```typescript
// ✅ Correct - Use centralized config
import { EEnv } from "@/configs/env";
const wsUrl = `${EEnv.NEXT_PUBLIC_PYCELIZE_WS_URL}/chat/${chatId}`;

// ❌ Incorrect - Don't derive from API URL
const wsUrl = apiUrl.replace(/^http/, "ws") + `/chat/${chatId}`;
```

#### Using Debug Flag
```typescript
// ✅ Correct - Use centralized config
import { EEnv } from "@/configs/env";
if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
  console.debug("Debug info");
}

// ❌ Incorrect - Don't check process.env directly
if (process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING === "true") {
  console.debug("Debug info");
}
```

## Environment File Setup

### .env.local (or .env)

```bash
# Pycelize API Backend URL
NEXT_PUBLIC_PYCELIZE_API_URL=http://localhost:5050/api/v1

# Pycelize WebSocket URL
NEXT_PUBLIC_PYCELIZE_WS_URL=ws://127.0.0.1:5051

# Debugging mode
NEXT_PUBLIC_PYCELIZE_DEBUGGING=true

# Firebase configuration (optional)
NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"..."}'
```

## Changes Made

### Files Updated

1. **`configs/env.ts`**
   - Added `NEXT_PUBLIC_PYCELIZE_WS_URL` configuration
   - Updated documentation

2. **`.env.local.example`**
   - Added `NEXT_PUBLIC_PYCELIZE_WS_URL` example
   - Updated documentation

3. **`lib/hooks/useChatWebSocket.ts`**
   - Replaced direct `process.env.NEXT_PUBLIC_PYCELIZE_API_URL` usage
   - Now uses `EEnv.NEXT_PUBLIC_PYCELIZE_WS_URL`
   - Simplified URL construction

4. **`app/page.tsx`**
   - Replaced `process.env.NEXT_PUBLIC_PYCELIZE_API_URL` with `EEnv.NEXT_PUBLIC_PYCELIZE_API_URL`

5. **`app/features/health/page.tsx`**
   - Replaced `process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING` check with `EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST`

### Benefits of Changes

1. **Correct WebSocket URL**: Now uses dedicated `ws://127.0.0.1:5051` instead of deriving from API URL
2. **Type Safety**: All environment variables are strongly typed
3. **Centralized**: No scattered `process.env` access throughout codebase
4. **Better Defaults**: Clear default values in one place
5. **Easier Testing**: Configuration can be easily mocked or overridden

## Migration Guide

If you have existing code using `process.env` directly:

1. Import `EEnv` from `@/configs/env`
2. Replace `process.env.VARIABLE_NAME` with `EEnv.VARIABLE_NAME`
3. For boolean checks, use the boolean value directly (no string comparison needed)

### Before
```typescript
const apiUrl = process.env.NEXT_PUBLIC_PYCELIZE_API_URL || "http://localhost:5050/api/v1";
if (process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING === "true") {
  console.debug("Debug");
}
```

### After
```typescript
import { EEnv } from "@/configs/env";

const apiUrl = EEnv.NEXT_PUBLIC_PYCELIZE_API_URL;
if (EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST) {
  console.debug("Debug");
}
```

## Verification

To verify no direct `process.env` usage remains:

```bash
# Should only show configs/env.ts
grep -r "process.env" --include="*.ts" --include="*.tsx" | grep -v node_modules | grep -v ".next"
```

---

**Last Updated**: 2026-02-08
**Status**: ✅ Complete
