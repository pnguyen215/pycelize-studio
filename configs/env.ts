/**
 * Centralized Environment Configuration
 *
 * This module provides a centralized, strongly-typed access to environment variables
 * across the application. It handles both server-side (Node.js) and client-side
 * (browser) environments gracefully.
 *
 * Benefits:
 * - Avoids scattered process.env access throughout the codebase
 * - Improves maintainability and type safety
 * - Makes environment-related changes easier to audit and manage
 * - Provides a single source of truth for all environment configurations
 *
 * @module configs/env
 */

/**
 * Environment variables accessor that works in both server and client contexts.
 * Falls back to an empty object if neither process.env nor window.env is available.
 */
export const env =
  (typeof window === "undefined"
    ? process.env
    : (window as typeof window & { env?: Record<string, string | undefined> })
        .env) || {};

/**
 * Frozen environment configuration object with strongly-typed access to all
 * environment variables used throughout the application.
 *
 * Using Object.freeze ensures immutability and prevents accidental modifications
 * at runtime.
 *
 * @constant
 * @readonly
 */
export const EEnv = Object.freeze({
  /**
   * Base URL for the Pycelize API backend service.
   *
   * @default "http://localhost:5050/api/v1"
   * @example
   * // Development
   * "http://localhost:5050/api/v1"
   *
   * // Production
   * "https://api.pycelize.com/api/v1"
   */
  NEXT_PUBLIC_PYCELIZE_API_URL:
    (env.NEXT_PUBLIC_PYCELIZE_API_URL as string) ||
    "http://localhost:5050/api/v1",

  /**
   * Debug mode flag for enabling verbose request/response logging.
   * When enabled, logs detailed information about API calls, responses, and errors
   * to the console for development and troubleshooting purposes.
   *
   * @default false
   * @example
   * // Enable debugging
   * NEXT_PUBLIC_PYCELIZE_DEBUGGING=true
   */
  NEXT_PUBLIC_DEBUGGING_REQUEST: (env.NEXT_PUBLIC_PYCELIZE_DEBUGGING ==
    "true") as boolean,

  /**
   * Firebase configuration object parsed from JSON string.
   * Contains all necessary Firebase SDK initialization parameters.
   *
   * @default {}
   * @example
   * // .env file
   * NEXT_PUBLIC_FIREBASE_CONFIG='{"apiKey":"...","authDomain":"...","projectId":"..."}'
   */
  NEXT_PUBLIC_FIREBASE_CONFIG: JSON.parse(
    (env.NEXT_PUBLIC_FIREBASE_CONFIG as string) || "{}"
  ) as Record<string, unknown>,
});

/**
 * Type definition for the environment configuration.
 * Useful for type-safe access patterns and documentation.
 */
export type EnvironmentConfig = typeof EEnv;
