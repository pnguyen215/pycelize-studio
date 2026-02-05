import { api } from "./client";
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
  /**
   * Get Excel file information
   * @param file - The Excel file to get information about
   * @returns Excel file information
   */
  getInfo: async (file: File): Promise<StandardResponse<ExcelInfoResponse>> => {
    const form = new FormData();

    form.append("file", file);

    return api.post("/excel/info", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Extract columns
   * @param request - The request object
   * @returns JSON with statistics
   */
  extractColumns: async (
    request: ColumnExtractionRequest
  ): Promise<StandardResponse<ColumnExtractionResponse>> => {
    const form = new FormData();

    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));

    return api.post("/excel/extract-columns", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Extract columns to file
   * @param request - The request object
   * @returns Download URL
   */
  extractColumnsToFile: async (
    request: ColumnExtractionRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();

    form.append("file", request.file);
    form.append("columns", JSON.stringify(request.columns));
    form.append("remove_duplicates", String(request.removeDuplicates || false));

    return api.post("/excel/extract-columns-to-file", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Map columns
   * @param request - The request object
   * @returns Download URL
   */
  mapColumns: async (
    request: ColumnMappingRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("mapping", JSON.stringify(request.mapping));
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }

    return api.post("/excel/map-columns", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Single key binding
   * @param request - The request object
   * @returns Download URL
   */
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

    return api.post("/excel/bind-single-key", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Multi key binding
   * @param request - The request object
   * @returns Download URL
   */
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

    return api.post("/excel/bind-multi-key", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },
};
