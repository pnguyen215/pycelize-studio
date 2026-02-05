/**
 * Axios Instance Factory
 * 
 * This module provides the core Axios instance creation and configuration.
 * It establishes the base HTTP client with default settings for timeout,
 * headers, and base URL configuration.
 * 
 * Key Responsibilities:
 * - Create and configure the base Axios instance
 * - Set default request headers
 * - Configure timeout values optimized for file uploads
 * - Provide a clean, testable HTTP client foundation
 * 
 * @module lib/api/axios-instance
 */

import axios, { AxiosInstance } from 'axios';
import { EEnv } from '@/configs/env';

/**
 * Creates and configures the base Axios instance for API communication.
 * 
 * Configuration includes:
 * - Base URL from environment configuration
 * - Extended timeout (120 seconds) optimized for large file uploads
 * - Default Accept header for JSON responses
 * 
 * @returns {AxiosInstance} Configured Axios instance ready for interceptor attachment
 * 
 * @example
 * const client = createAxiosInstance();
 * // Now attach interceptors or make requests
 * client.get('/endpoint');
 */
export function createAxiosInstance(): AxiosInstance {
  return axios.create({
    baseURL: EEnv.NEXT_PUBLIC_PYCELIZE_API_URL,
    timeout: 120000, // 2 minutes - optimized for large file uploads
    headers: {
      Accept: 'application/json',
    },
  });
}

/**
 * Default Axios instance used throughout the application.
 * This instance is pre-configured and ready for interceptor registration.
 * 
 * @constant
 */
export const axiosInstance = createAxiosInstance();
