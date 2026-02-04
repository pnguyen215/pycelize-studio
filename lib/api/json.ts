import { apiClient } from "./client";
import type { JSONGenerationRequest, JSONTemplateRequest, StandardResponse } from "./types";

export const jsonApi = {
  // Generate standard JSON mapping - returns download URL
  generateJSON: async (request: JSONGenerationRequest): Promise<StandardResponse<{ download_url: string; total_records?: number; file_size?: number }>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("column_mapping", JSON.stringify(request.columnMapping));

    if (request.columns) {
      form.append("columns", JSON.stringify(request.columns));
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

    return apiClient.post("/json/generate", form);
  },

  // Generate JSON using template - returns download URL
  generateTemplateJSON: async (request: JSONTemplateRequest): Promise<StandardResponse<{ download_url: string; total_records?: number; file_size?: number }>> => {
    const form = new FormData();
    form.append("file", request.file);

    const template =
      typeof request.template === "object"
        ? JSON.stringify(request.template)
        : request.template;
    form.append("template", template);
    form.append("column_mapping", JSON.stringify(request.columnMapping));

    if (request.prettyPrint !== undefined) {
      form.append("pretty_print", String(request.prettyPrint));
    }
    if (request.aggregationMode) {
      form.append("aggregation_mode", request.aggregationMode);
    }
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }

    return apiClient.post("/json/generate-with-template", form);
  },
};
