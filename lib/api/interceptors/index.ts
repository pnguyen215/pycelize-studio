/**
 * Interceptors Index
 * 
 * This module provides a centralized export point for all Axios interceptors.
 * It also includes a utility function to register all interceptors on an Axios instance.
 * 
 * @module lib/api/interceptors
 */

export { requestInterceptor, requestErrorHandler } from './request.interceptor';
export { responseInterceptor } from './response.interceptor';
export { errorInterceptor } from './error.interceptor';

import { AxiosInstance } from 'axios';
import { requestInterceptor, requestErrorHandler } from './request.interceptor';
import { responseInterceptor } from './response.interceptor';
import { errorInterceptor } from './error.interceptor';

/**
 * Registers all interceptors on the provided Axios instance.
 * 
 * This function provides a clean, single-line way to attach all
 * request and response interceptors to an Axios client.
 * 
 * @param {AxiosInstance} instance - The Axios instance to configure
 * @returns {AxiosInstance} The configured Axios instance (for chaining)
 * 
 * @example
 * import { axiosInstance } from './axios-instance';
 * import { setupInterceptors } from './interceptors';
 * 
 * const client = setupInterceptors(axiosInstance);
 */
export function setupInterceptors(instance: AxiosInstance): AxiosInstance {
  // Register request interceptors
  instance.interceptors.request.use(requestInterceptor, requestErrorHandler);

  // Register response interceptors
  instance.interceptors.response.use(responseInterceptor, errorInterceptor);

  return instance;
}
