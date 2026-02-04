import { apiClient } from "./client";
import type {
  StandardResponse,
  ExcelInfoResponse,
  ColumnExtractionResponse,
  DownloadUrlResponse,
  ColumnExtractionRequest,
  ColumnMappingRequest,
  BindingSingleKeyRequest,
  BindingMultiKeyRequest,
} from "./types";

export const excelApi = {
  // Get Excel file information
  getInfo: async (file: File): Promise<StandardResponse<ExcelInfoResponse>> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post("/excel/info", form);
  },

  // Extract columns - returns JSON with statistics
  extractColumns: async (
    request: ColumnExtractionRequest
  ): Promise<StandardResponse<ColumnExtractionResponse>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));
    return apiClient.post("/excel/extract-columns", form);
  },

  // Extract columns to file - returns download URL
  extractColumnsToFile: async (
    request: ColumnExtractionRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));
    return apiClient.post("/excel/extract-columns-to-file", form);
  },

  // Map columns - returns download URL
  mapColumns: async (
    request: ColumnMappingRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("mapping", JSON.stringify(request.mapping));
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return apiClient.post("/excel/map-columns", form);
  },

  // Single key binding - returns download URL
  bindSingleKey: async (
    request: BindingSingleKeyRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
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
  bindMultiKey: async (
    request: BindingMultiKeyRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
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
