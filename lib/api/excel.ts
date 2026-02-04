import { apiClient } from "./client";
import type {
  ExcelInfoResponse,
  ColumnExtractionRequest,
  ColumnMappingRequest,
  BindingSingleKeyRequest,
  BindingMultiKeyRequest,
  StandardResponse,
} from "./types";

export const excelApi = {
  // Get Excel file information
  getInfo: async (file: File): Promise<StandardResponse<ExcelInfoResponse>> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post("/excel/info", form);
  },

  // Extract columns - returns JSON
  extractColumns: async (request: ColumnExtractionRequest): Promise<StandardResponse<{
    columns: Record<string, {
      data_type: string;
      non_null_count: number;
      null_count: number;
      total_count: number;
      unique_count: number;
      value_count: number;
      values: unknown[];
    }>;
    extraction_info: {
      extracted_columns: string[];
      remove_duplicates: boolean;
      timestamp: string;
      total_rows: number;
    };
  }>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));
    return apiClient.post("/excel/extract-columns", form);
  },

  // Extract columns to file - returns download URL
  extractColumnsToFile: async (request: ColumnExtractionRequest): Promise<StandardResponse<{ download_url: string }>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));
    return apiClient.post("/excel/extract-columns-to-file", form);
  },

  // Map columns - returns download URL
  mapColumns: async (request: ColumnMappingRequest): Promise<StandardResponse<{ download_url: string }>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("mapping", JSON.stringify(request.mapping));
    return apiClient.post("/excel/map-columns", form);
  },

  // Single key binding - returns download URL
  bindSingleKey: async (request: BindingSingleKeyRequest): Promise<StandardResponse<{ download_url: string }>> => {
    const form = new FormData();
    form.append("source_file", request.sourceFile);
    form.append("bind_file", request.bindFile);
    form.append("comparison_column", request.comparisonColumn);
    form.append("bind_columns", JSON.stringify(request.bindColumns));
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return apiClient.post("/excel/bind-single-key", form);
  },

  // Multi key binding - returns download URL
  bindMultiKey: async (request: BindingMultiKeyRequest): Promise<StandardResponse<{ download_url: string }>> => {
    const form = new FormData();
    form.append("source_file", request.sourceFile);
    form.append("bind_file", request.bindFile);
    form.append(
      "comparison_columns",
      JSON.stringify(request.comparisonColumns)
    );
    form.append("bind_columns", JSON.stringify(request.bindColumns));
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return apiClient.post("/excel/bind-multi-key", form);
  },
};
