import { apiClient } from "./client";
import type {
  ExcelInfoResponse,
  ColumnExtractionRequest,
  ColumnMappingRequest,
  BindingSingleKeyRequest,
  BindingMultiKeyRequest,
} from "./types";

export const excelApi = {
  // Get Excel file information
  getInfo: async (file: File): Promise<ExcelInfoResponse> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post("/excel/info", form);
  },

  // Extract columns - returns JSON
  extractColumns: async (request: ColumnExtractionRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));
    return apiClient.post("/excel/extract-columns", form);
  },

  // Extract columns to file - returns download URL
  extractColumnsToFile: async (request: ColumnExtractionRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));
    return apiClient.post("/excel/extract-columns-to-file", form, {
      responseType: "blob",
    });
  },

  // Map columns
  mapColumns: async (request: ColumnMappingRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("mapping", JSON.stringify(request.mapping));
    return apiClient.post("/excel/map-columns", form, {
      responseType: "blob",
    });
  },

  // Single key binding
  bindSingleKey: async (request: BindingSingleKeyRequest) => {
    const form = new FormData();
    form.append("source_file", request.sourceFile);
    form.append("bind_file", request.bindFile);
    form.append("comparison_column", request.comparisonColumn);
    form.append("bind_columns", JSON.stringify(request.bindColumns));
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return apiClient.post("/excel/bind-single-key", form, {
      responseType: "blob",
    });
  },

  // Multi key binding
  bindMultiKey: async (request: BindingMultiKeyRequest) => {
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
    return apiClient.post("/excel/bind-multi-key", form, {
      responseType: "blob",
    });
  },
};
