import { api } from "./client";
import type {
  StandardResponse,
  DownloadUrlResponse,
  JSONGenerationRequest,
  JSONTemplateRequest,
} from "./types";

export const jsonApi = {
  /**
   * Generate standard JSON mapping
   * @param request - The request object
   * @returns Download URL
   */
  generateJSON: async (
    request: JSONGenerationRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();

    form.append("file", request.file);
    if (request.columns) {
      form.append("columns", JSON.stringify(request.columns));
    }
    if (request.columnMapping) {
      form.append("column_mapping", JSON.stringify(request.columnMapping));
    }
    if (request.prettyPrint !== undefined) {
      form.append("pretty_print", String(request.prettyPrint));
    }
    if (request.nullHandling) {
      form.append("null_handling", request.nullHandling);
    }
    if (request.arrayWrapper !== undefined) {
      form.append("array_wrapper", String(request.arrayWrapper));
    }
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }

    return api.post("/json/generate", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Generate JSON using template
   * @param request - The request object
   * @returns Download URL
   */
  generateTemplateJSON: async (
    request: JSONTemplateRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();
    const template =
      typeof request.template === "object"
        ? JSON.stringify(request.template)
        : request.template;

    form.append("file", request.file);
    form.append("template", template);
    if (request.columnMapping) {
      form.append("column_mapping", JSON.stringify(request.columnMapping));
    }
    if (request.prettyPrint !== undefined) {
      form.append("pretty_print", String(request.prettyPrint));
    }
    if (request.aggregationMode) {
      form.append("aggregation_mode", request.aggregationMode);
    }
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }

    return api.post("/json/generate-with-template", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },
};
