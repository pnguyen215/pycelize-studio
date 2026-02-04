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

export interface ColumnExtractionRequest {
  file: File;
  columns: string[];
  removeDuplicates?: boolean;
}

export interface ColumnMappingRequest {
  file: File;
  mapping: Record<string, string | { source?: string; default?: string | number | boolean }>;
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
  file_name: string;
  file_path: string;
  rows: number;
}

export interface CSVConvertRequest {
  file: File;
  sheetName?: string;
  outputFilename?: string;
  delimiter?: string;
}

// SQL Generation
export interface SQLGenerationRequest {
  file: File;
  tableName: string;
  columnMapping: Record<string, string>;
  databaseType?: "postgresql" | "mysql" | "sqlite";
  columns?: string[];
  autoIncrement?: {
    enabled: boolean;
    column_name: string;
    increment_type?: string;
    start_value?: number;
  };
  removeDuplicates?: boolean;
}

export interface CustomSQLRequest {
  file: File;
  template: string;
  columnMapping: Record<string, string>;
  columns?: string[];
  autoIncrement?: {
    enabled: boolean;
    column_name: string;
    start_value?: number;
  };
  removeDuplicates?: boolean;
}

// JSON Generation
export interface JSONGenerationRequest {
  file: File;
  columnMapping: Record<string, string>;
  columns?: string[];
  prettyPrint?: boolean;
  nullHandling?: "include" | "exclude" | "default";
  arrayWrapper?: boolean;
  outputFilename?: string;
}

export interface JSONTemplateRequest {
  file: File;
  template: string | object;
  columnMapping: Record<string, string>;
  prettyPrint?: boolean;
  aggregationMode?: "array" | "single" | "nested";
  outputFilename?: string;
}

// Normalization
export interface NormalizationType {
  type: string;
  description: string;
  category: string;
}

export interface NormalizationRequest {
  file: File;
  normalizations: Array<{
    column_name: string;
    normalization_type: string;
    config?: Record<string, unknown>;
  }>;
  returnReport?: boolean;
}

// File Binding
export interface FileBindingRequest {
  file: File;
  bindingFile: File;
  columnMapping: Record<string, string>;
  outputFilename?: string;
}

// Health Check
export interface HealthCheckResponse {
  service: string;
  status: string;
  version: string;
}
