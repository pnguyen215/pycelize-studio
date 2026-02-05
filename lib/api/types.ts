import { AxiosRequestConfig } from "axios";
import type { RetryConfig } from "./interceptors/retry.interceptor";
import type { CacheInterceptorConfig } from "./interceptors/cache.interceptor";
import type { RateLimitInterceptorConfig } from "./interceptors/rate-limit.interceptor";

// Request Configuration
/**
 * Extended Axios request configuration with advanced features.
 * Includes support for notifications, retry, caching, and rate limiting.
 */
export interface ApiRequestConfig
  extends AxiosRequestConfig,
    CacheInterceptorConfig,
    RateLimitInterceptorConfig {
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

/**
 * Standard Response
 * @param data - The data returned from the API
 * @param message - The message returned from the API
 * @param meta - The meta data returned from the API
 * @param status_code - The status code returned from the API
 * @param total - The total number of items returned from the API
 */
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

/**
 * Health Check Response
 * @param service - The service name
 * @param status - The status of the service
 * @param version - The version of the service
 */
export interface HealthCheckResponse {
  service: string;
  status: string;
  version: string;
}

/**
 * Excel Info Response
 * @param column_names - The column names
 * @param columns - The number of columns
 * @param data_types - The data types
 * @param file_name - The name of the file
 * @param file_path - The path of the file
 * @param rows - The number of rows
 * @param sheets - The sheets in the file
 */
export interface ExcelInfoResponse {
  column_names: string[];
  columns: number;
  data_types: Record<string, string>;
  file_name: string;
  file_path: string;
  rows: number;
  sheets: string[];
}

/**
 * Column Extraction Response
 * @param columns - The columns
 * @param rows_extracted - The number of rows extracted
 * @param total_rows - The total number of rows
 */
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

/**
 * Download URL Response
 * @param download_url - The download URL
 */
export interface DownloadUrlResponse {
  download_url: string;
}

/**
 * Column Extraction Request
 * @param file - The file to extract columns from
 * @param columns - The columns to extract
 * @param remove_duplicates - Whether to remove duplicates
 */
export interface ColumnExtractionRequest {
  file: File;
  columns: string[];
  removeDuplicates?: boolean;
}

/**
 * Column Mapping Request
 * @param file - The file to map columns
 * @param mapping - The mapping of columns
 * @param output_filename - The output filename
 */
export interface ColumnMappingRequest {
  file: File;
  mapping: Record<string, { source: string; default?: string }>;
  outputFilename?: string;
}

/**
 * Binding Single Key Request
 * @param sourceFile - The source file
 * @param bindFile - The bind file
 * @param comparisonColumn - The comparison column
 * @param bindColumns - The columns to bind
 * @param output_filename - The output filename
 */
export interface BindingSingleKeyRequest {
  sourceFile: File;
  bindFile: File;
  comparisonColumn: string;
  bindColumns: string[];
  outputFilename?: string;
}

/**
 * Binding Multi Key Request
 * @param sourceFile - The source file
 * @param bindFile - The bind file
 * @param comparisonColumns - The comparison columns
 * @param bindColumns - The columns to bind
 * @param output_filename - The output filename
 */
export interface BindingMultiKeyRequest {
  sourceFile: File;
  bindFile: File;
  comparisonColumns: string[];
  bindColumns: string[];
  outputFilename?: string;
}

/**
 * CSV Info Response
 * @param column_names - The column names
 * @param columns - The number of columns
 * @param data_types - The data types
 * @param delimiter - The delimiter of the CSV file
 * @param file_name - The name of the file
 * @param file_path - The path of the file
 * @param rows - The number of rows
 */
export interface CSVInfoResponse {
  column_names: string[];
  columns: number;
  data_types: Record<string, string>;
  delimiter: string;
  file_name: string;
  file_path: string;
  rows: number;
}

/**
 * CSV Convert Request
 * @param file - The file to convert
 * @param sheetName - The name of the sheet to convert
 * @param output_filename - The output filename
 */
export interface CSVConvertRequest {
  file: File;
  sheetName?: string;
  outputFilename?: string;
}

/**
 * SQL Generation Request
 * @param file - The file to generate SQL from
 * @param tableName - The name of the table to generate SQL for
 * @param databaseType - The type of database to generate SQL for
 * @param columns - The columns to generate SQL for
 * @param columnMapping - The mapping of columns
 * @param autoIncrement - The auto increment configuration
 * @param remove_duplicates - Whether to remove duplicates
 */
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

/**
 * Custom SQL Request
 * @param file - The file to generate custom SQL from
 * @param template - The template to use for the custom SQL
 * @param columns - The columns to generate custom SQL for
 * @param columnMapping - The mapping of columns
 * @param autoIncrement - The auto increment configuration
 * @param remove_duplicates - Whether to remove duplicates
 */
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

/**
 * JSON Generation Request
 * @param file - The file to generate JSON from
 * @param columns - The columns to generate JSON for
 * @param columnMapping - The mapping of columns
 * @param prettyPrint - Whether to pretty print the JSON
 * @param nullHandling - Whether to include nulls
 * @param arrayWrapper - Whether to wrap the JSON in an array
 * @param output_filename - The output filename
 */
export interface JSONGenerationRequest {
  file: File;
  columns?: string[];
  columnMapping?: Record<string, string>;
  prettyPrint?: boolean;
  nullHandling?: "include" | "exclude" | "default";
  arrayWrapper?: boolean;
  outputFilename?: string;
}

/**
 * JSON Template Request
 * @param file - The file to generate JSON from
 * @param template - The template to use for the JSON
 * @param columnMapping - The mapping of columns
 * @param prettyPrint - Whether to pretty print the JSON
 * @param aggregationMode - The aggregation mode to use for the JSON
 * @param output_filename - The output filename
 */
export interface JSONTemplateRequest {
  file: File;
  template: string | object;
  columnMapping?: Record<string, string>;
  prettyPrint?: boolean;
  aggregationMode?: "array" | "single" | "nested";
  outputFilename?: string;
}

/**
 * Normalization Types Response
 * @param [key: string] - The key is the type of normalization and the value is the description
 */
export interface NormalizationTypesResponse {
  [key: string]: string;
}

/**
 * Normalization Request
 * @param file - The file to normalize
 * @param normalizations - The normalizations to apply
 * @param outputFilename - The output filename
 */
export interface NormalizationRequest {
  file: File;
  normalizations: string; // JSON string of array
  outputFilename?: string;
}

/**
 * File Binding Request
 * @param file - The file to bind
 * @param bindingFile - The file to bind to
 * @param columnMapping - The column mapping
 * @param outputFilename - The output filename
 */
export interface FileBindingRequest {
  file: File;
  bindingFile: File;
  columnMapping: Record<string, string>;
  outputFilename?: string;
}
