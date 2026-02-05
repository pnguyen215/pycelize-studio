# Environment Keys

This module provides centralized, strongly-typed access to environment variables across the application.

## Files

### `env.ts`

Centralized environment configuration that:

- Handles both server-side (Node.js) and client-side (browser) environments
- Provides strongly-typed access to environment variables
- Prevents scattered `process.env` access throughout the codebase
- Makes environment-related changes easier to audit and manage

## Usage

```typescript
import { EEnv } from "@/configs/env";

// Access environment variables
const apiUrl = EEnv.NEXT_PUBLIC_PYCELIZE_API_URL;
const debugMode = EEnv.NEXT_PUBLIC_DEBUGGING_REQUEST;
const firebaseConfig = EEnv.NEXT_PUBLIC_FIREBASE_CONFIG;
```

## Benefits

- ✅ Single source of truth for all environment configuration
- ✅ Type-safe access to environment variables
- ✅ Prevents typos and undefined access errors
- ✅ Easy to audit and maintain
- ✅ Immutable configuration (using Object.freeze)
- ✅ Works in both server and client contexts

## Environment Variables

All environment variables should be defined in `.env.local` (for development) or set in your deployment environment.

Reference `.env.local.example` for the complete list of supported variables.
