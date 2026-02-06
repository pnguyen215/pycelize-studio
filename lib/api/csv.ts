import { api } from "./client";
import type {
  StandardResponse,
  CSVInfoResponse,
  DownloadUrlResponse,
  CSVConvertRequest,
  SearchRequest,
  SearchResponse,
  SuggestOperatorsResponse,
} from "./types";

export const csvApi = {
  /**
   * Get CSV file information
   * @param file - The CSV file to get information about
   * @returns CSV file information
   */
  getInfo: async (file: File): Promise<StandardResponse<CSVInfoResponse>> => {
    const form = new FormData();
    form.append("file", file);
    return api.post("/csv/info", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Convert CSV to Excel
   * @param request - The request object
   * @returns Download URL
   */
  convertToExcel: async (
    request: CSVConvertRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();
    form.append("file", request.file);
    if (request.sheetName) {
      form.append("sheet_name", request.sheetName);
    }
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return api.post("/csv/convert-to-excel", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Search and filter CSV data
   * @param request - The request object
   * @returns Search results with download URL
   */
  search: async (
    request: SearchRequest
  ): Promise<StandardResponse<SearchResponse>> => {
    const form = new FormData();

    form.append("file", request.file);
    form.append("conditions", JSON.stringify(request.conditions));
    if (request.logic) {
      form.append("logic", request.logic);
    }
    if (request.outputFormat) {
      form.append("output_format", request.outputFormat);
    }
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }

    return api.post("/csv/search", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Get suggested operators for CSV columns
   * @param file - The CSV file
   * @returns Suggested operators for each column
   */
  suggestOperators: async (
    file: File
  ): Promise<StandardResponse<SuggestOperatorsResponse>> => {
    const form = new FormData();
    form.append("file", file);

    return api.post("/csv/search/suggest-operators", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },
};
