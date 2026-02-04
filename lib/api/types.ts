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
export interface HealthCheckData {
  service: string;
  status: string;
  version: string;
}

// Excel Operations
export interface ExcelInfoData {
  column_names: string[];
  columns: number;
  data_types: Record<string, string>;
  file_name: string;
  file_path: string;
  rows: number;
  sheets: string[];
}

export interface ColumnExtractionData {
  columns: Record<string, {
    count: number;
    data_type: string;
    sample_values: unknown[];
  }>;
  rows_extracted: number;
  total_rows: number;
}

export interface DownloadUrlData {
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
export interface CSVInfoData {
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
export interface NormalizationType {
  type: string;
  description: string;
  category: string;
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
