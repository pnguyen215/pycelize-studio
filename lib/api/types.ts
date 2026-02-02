// Base API Response
export interface ApiResponse<T> {
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
  filename: string;
  file_size: number;
  sheets: Array<{
    name: string;
    rows: number;
    columns: number;
    column_names: string[];
  }>;
}

export interface ColumnExtractionRequest {
  file: File;
  columns: string[];
  removeDuplicates?: boolean;
}

export interface ColumnMappingRequest {
  file: File;
  mapping: Record<string, { source: string; default?: string }>;
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
  filename: string;
  file_size: number;
  rows: number;
  columns: number;
  column_names: string[];
  delimiter: string;
}

export interface CSVConvertRequest {
  file: File;
  outputFilename?: string;
  delimiter?: string;
}

// SQL Generation
export interface SQLGenerationRequest {
  file: File;
  tableName: string;
  columnMapping: Record<string, string>;
  databaseType: 'postgresql' | 'mysql' | 'sqlite';
  autoIncrement?: {
    enabled: boolean;
    columnName: string;
    incrementType?: string;
    startValue?: number;
    sequenceName?: string;
  };
  batchSize?: number;
  includeTransaction?: boolean;
  returnFile?: boolean;
}

export interface CustomSQLRequest {
  file: File;
  template: string;
  columnMapping: Record<string, string>;
  columns?: string[];
  autoIncrement?: Record<string, unknown>;
  removeDuplicates?: boolean;
}

// JSON Generation
export interface JSONGenerationRequest {
  file: File;
  columnMapping: Record<string, string>;
  columns?: string[];
  prettyPrint?: boolean;
  nullHandling?: 'include' | 'exclude' | 'default';
  arrayWrapper?: boolean;
  outputFilename?: string;
}

export interface JSONTemplateRequest {
  file: File;
  template: string | object;
  columnMapping: Record<string, string>;
  prettyPrint?: boolean;
  aggregationMode?: 'array' | 'single' | 'nested';
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
  status: string;
  timestamp: string;
  version: string;
  services: Record<string, string>;
}
