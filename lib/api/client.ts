/**
 * API Client - Modern Axios Architecture
 * 
 * This module provides the main HTTP client for API communication using a modern,
 * layered Axios architecture. It integrates:
 * 
 * - Centralized environment configuration
 * - Modular interceptor system (request, response, error handling)
 * - Notification management with configurable behavior
 * - Type-safe API methods with generic support
 * 
 * The new architecture provides:
 * - Clear separation of concerns
 * - Improved testability and maintainability
 * - Easier debugging with centralized logging
 * - Flexible notification control per request
 * - Better scalability as API complexity grows
 * 
 * @module lib/api/client
 */

import { AxiosInstance } from 'axios';
import { axiosInstance } from './axios-instance';
import { setupInterceptors } from './interceptors';
import type { ApiRequestConfig } from './types';

/**
 * Configured Axios client instance with all interceptors registered.
 * 
 * This is the primary HTTP client used throughout the application.
 * It comes pre-configured with:
 * - Base URL from environment configuration
 * - Request/response interceptors for logging and debugging
 * - Error handling with user-friendly notifications
 * - Automatic notification management
 * 
 * @constant
 * @type {AxiosInstance}
 */
export const apiClient: AxiosInstance = setupInterceptors(axiosInstance);

/**
 * Type-safe API wrapper with convenient methods for common HTTP operations.
 * 
 * This object provides a clean, typed interface for making API requests
 * with full TypeScript support and automatic notification handling.
 * 
 * Each method supports the extended ApiRequestConfig for notification control:
 * - Notifications are enabled by default
 * - Can be disabled per-request: { notification: { enabled: false } }
 * - Custom messages supported: { notification: { successMessage: '...', errorMessage: '...' } }
 * 
 * @namespace api
 * 
 * @example
 * // Basic GET request with automatic success notification
 * const data = await api.get<User>('/users/123');
 * 
 * @example
 * // POST request without notifications
 * const result = await api.post('/analytics', payload, {
 *   notification: { enabled: false }
 * });
 * 
 * @example
 * // PUT request with custom success message
 * const updated = await api.put('/profile', data, {
 *   notification: { successMessage: 'Profile updated!' }
 * });
 * 
 * @example
 * // DELETE request with custom error message
 * await api.delete('/items/123', {
 *   notification: { errorMessage: 'Failed to delete item' }
 * });
 */
export const api = {
  /**
   * Performs a GET request to retrieve data from the server.
   * 
   * @template T - The expected response data type
   * @param {string} url - The endpoint URL (relative to base URL)
   * @param {ApiRequestConfig} [config] - Optional request configuration
   * @returns {Promise<T>} Promise resolving to the response data
   * 
   * @example
   * const users = await api.get<User[]>('/users');
   * 
   * @example
   * // Silent request without notifications
   * const data = await api.get<Data>('/data', {
   *   notification: { enabled: false }
   * });
   */
  get: <T = unknown>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<T> => apiClient.get<T, T>(url, config),

  /**
   * Performs a POST request to create new data on the server.
   * 
   * @template T - The expected response data type
   * @param {string} url - The endpoint URL (relative to base URL)
   * @param {unknown} [data] - The request payload
   * @param {ApiRequestConfig} [config] - Optional request configuration
   * @returns {Promise<T>} Promise resolving to the response data
   * 
   * @example
   * const newUser = await api.post<User>('/users', {
   *   name: 'John Doe',
   *   email: 'john@example.com'
   * });
   * 
   * @example
   * // File upload with custom success message
   * const result = await api.post<UploadResult>('/upload', formData, {
   *   notification: { successMessage: 'File uploaded successfully!' }
   * });
   */
  post: <T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> => apiClient.post<T, T>(url, data, config),

  /**
   * Performs a PUT request to update existing data on the server.
   * 
   * @template T - The expected response data type
   * @param {string} url - The endpoint URL (relative to base URL)
   * @param {unknown} [data] - The request payload
   * @param {ApiRequestConfig} [config] - Optional request configuration
   * @returns {Promise<T>} Promise resolving to the response data
   * 
   * @example
   * const updated = await api.put<User>('/users/123', {
   *   name: 'Jane Doe'
   * });
   */
  put: <T = unknown>(
    url: string,
    data?: unknown,
    config?: ApiRequestConfig
  ): Promise<T> => apiClient.put<T, T>(url, data, config),

  /**
   * Performs a DELETE request to remove data from the server.
   * 
   * @template T - The expected response data type
   * @param {string} url - The endpoint URL (relative to base URL)
   * @param {ApiRequestConfig} [config] - Optional request configuration
   * @returns {Promise<T>} Promise resolving to the response data
   * 
   * @example
   * await api.delete('/users/123');
   * 
   * @example
   * // Silent delete without notifications
   * await api.delete('/temp-data', {
   *   notification: { enabled: false }
   * });
   */
  delete: <T = unknown>(
    url: string,
    config?: ApiRequestConfig
  ): Promise<T> => apiClient.delete<T, T>(url, config),
};
