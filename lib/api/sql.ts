import { apiClient, api } from "./client";
import type {
  StandardResponse,
  DownloadUrlResponse,
  SQLGenerationRequest,
  CustomSQLRequest,
} from "./types";

export const sqlApi = {
  /**
   * Generate standard SQL INSERT statements
   * @param request - The request object
   * @returns Download URL
   */
  generateSQL: async (
    request: SQLGenerationRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();

    form.append("file", request.file);
    form.append("table_name", request.tableName);
    form.append("database_type", request.databaseType);
    if (request.columns) {
      form.append("columns", JSON.stringify(request.columns));
    }
    if (request.columnMapping) {
      form.append("column_mapping", JSON.stringify(request.columnMapping));
    }
    if (request.autoIncrement) {
      form.append("auto_increment", JSON.stringify(request.autoIncrement));
    }
    if (request.removeDuplicates !== undefined) {
      form.append("remove_duplicates", String(request.removeDuplicates));
    }

    return api.post("/sql/generate-to-text", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Generate custom SQL using template
   * @param request - The request object
   * @returns Download URL
   */
  generateCustomSQL: async (
    request: CustomSQLRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();

    form.append("file", request.file);
    form.append("template", request.template);
    if (request.columns) {
      form.append("columns", JSON.stringify(request.columns));
    }
    if (request.columnMapping) {
      form.append("column_mapping", JSON.stringify(request.columnMapping));
    }
    if (request.autoIncrement) {
      form.append("auto_increment", JSON.stringify(request.autoIncrement));
    }
    if (request.removeDuplicates !== undefined) {
      form.append("remove_duplicates", String(request.removeDuplicates));
    }

    return api.post("/sql/generate-custom-to-text", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },
};
