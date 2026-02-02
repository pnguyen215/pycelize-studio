import { apiClient } from "./client";
import type { JSONGenerationRequest, JSONTemplateRequest } from "./types";

export const jsonApi = {
  // Generate standard JSON mapping
  generateJSON: async (request: JSONGenerationRequest) => {
    const formData = new FormData();
    formData.append("file", request.file);
    formData.append("column_mapping", JSON.stringify(request.columnMapping));

    if (request.columns) {
      formData.append("columns", JSON.stringify(request.columns));
    }
    if (request.prettyPrint !== undefined) {
      formData.append("pretty_print", String(request.prettyPrint));
    }
    if (request.nullHandling) {
      formData.append("null_handling", request.nullHandling);
    }
    if (request.arrayWrapper !== undefined) {
      formData.append("array_wrapper", String(request.arrayWrapper));
    }
    if (request.outputFilename) {
      formData.append("output_filename", request.outputFilename);
    }

    return apiClient.post("/json/generate", formData, {
      responseType: "blob",
    });
  },

  // Generate JSON using template
  generateTemplateJSON: async (request: JSONTemplateRequest) => {
    const formData = new FormData();
    formData.append("file", request.file);

    const template =
      typeof request.template === "object"
        ? JSON.stringify(request.template)
        : request.template;
    formData.append("template", template);
    formData.append("column_mapping", JSON.stringify(request.columnMapping));

    if (request.prettyPrint !== undefined) {
      formData.append("pretty_print", String(request.prettyPrint));
    }
    if (request.aggregationMode) {
      formData.append("aggregation_mode", request.aggregationMode);
    }
    if (request.outputFilename) {
      formData.append("output_filename", request.outputFilename);
    }

    return apiClient.post("/json/generate-with-template", formData, {
      responseType: "blob",
    });
  },
};
