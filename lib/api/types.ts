import { AxiosRequestConfig } from 'axios';
import type { RetryConfig } from './interceptors/retry.interceptor';
import type { CacheInterceptorConfig } from './interceptors/cache.interceptor';
import type { RateLimitInterceptorConfig } from './interceptors/rate-limit.interceptor';

// Request Configuration
/**
 * Extended Axios request configuration with advanced features.
 * Includes support for notifications, retry, caching, and rate limiting.
 */
export interface ApiRequestConfig extends AxiosRequestConfig, CacheInterceptorConfig, RateLimitInterceptorConfig {
  /**
   * Configuration for notification behavior on this specific request.
   * 
   * @default { enabled: true }
   */
  notification?: {
    /**
     * Whether to show notifications for this request.
     * When false, success and error toasts will be suppressed.
     * 
     * @default true
     */
    enabled?: boolean;

    /**
     * Custom success message to display instead of API response message.
     */
    successMessage?: string;

    /**
     * Custom error message to display instead of API error message.
     */
    errorMessage?: string;
  };

  /**
   * Retry configuration for this request.
   * Enables automatic retry with exponential backoff on failures.
   */
  retry?: RetryConfig;

  /**
   * AbortSignal for request cancellation support
   */
  signal?: AbortSignal;
}

// Base API Response
export interface StandardResponse<T> {
  data: T;
  message: string;
  meta: {
    api_version: string;
    locale: string;
    request_id: string;
    requested_time: string;
  };
  status_code: number;
  total?: number;
}

// Health Check
export interface HealthCheckResponse {
  service: string;
  status: string;
  version: string;
}

// Excel Operations
export interface ExcelInfoResponse {
  column_names: string[];
  columns: number;
  data_types: Record<string, string>;
  file_name: string;
  file_path: string;
  rows: number;
  sheets: string[];
}

export interface ColumnExtractionResponse {
  columns: Record<
    string,
    {
      count: number;
      data_type: string;
      sample_values: unknown[];
    }
  >;
  rows_extracted: number;
  total_rows: number;
}

export interface DownloadUrlResponse {
  download_url: string;
}

export interface ColumnExtractionRequest {
  file: File;
  columns: string[];
  removeDuplicates?: boolean;
}

export interface ColumnMappingRequest {
  file: File;
  mapping: Record<string, { source: string; default?: string }>;
  outputFilename?: string;
}

export interface BindingSingleKeyRequest {
  sourceFile: File;
  bindFile: File;
  comparisonColumn: string;
  bindColumns: string[];
  outputFilename?: string;
}

export interface BindingMultiKeyRequest {
  sourceFile: File;
  bindFile: File;
  comparisonColumns: string[];
  bindColumns: string[];
  outputFilename?: string;
}

// CSV Operations
export interface CSVInfoResponse {
  column_names: string[];
  columns: number;
  data_types: Record<string, string>;
  delimiter: string;
  file_name: string;
  file_path: string;
  rows: number;
}

export interface CSVConvertRequest {
  file: File;
  sheetName?: string;
  outputFilename?: string;
}

// SQL Generation
export interface SQLGenerationRequest {
  file: File;
  tableName: string;
  databaseType: "postgresql" | "mysql" | "sqlite";
  columns?: string[];
  columnMapping?: Record<string, string>;
  autoIncrement?: {
    enabled: boolean;
    columnName: string;
    incrementType?: string;
    startValue?: number;
    sequenceName?: string;
  };
  removeDuplicates?: boolean;
}

export interface CustomSQLRequest {
  file: File;
  template: string;
  columns?: string[];
  columnMapping?: Record<string, string>;
  autoIncrement?: {
    enabled: boolean;
    columnName: string;
    incrementType?: string;
    startValue?: number;
    sequenceName?: string;
  };
  removeDuplicates?: boolean;
}

// JSON Generation
export interface JSONGenerationRequest {
  file: File;
  columns?: string[];
  columnMapping?: Record<string, string>;
  prettyPrint?: boolean;
  nullHandling?: "include" | "exclude" | "default";
  arrayWrapper?: boolean;
  outputFilename?: string;
}

export interface JSONTemplateRequest {
  file: File;
  template: string | object;
  columnMapping?: Record<string, string>;
  prettyPrint?: boolean;
  aggregationMode?: "array" | "single" | "nested";
  outputFilename?: string;
}

// Normalization
export interface NormalizationTypesResponse {
  [key: string]: string; // key is type, value is description
}

export interface NormalizationRequest {
  file: File;
  normalizations: string; // JSON string of array
  outputFilename?: string;
}

// File Binding (Deactivated)
export interface FileBindingRequest {
  file: File;
  bindingFile: File;
  columnMapping: Record<string, string>;
  outputFilename?: string;
}
