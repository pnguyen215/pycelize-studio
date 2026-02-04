import { apiClient } from "./client";
import type { JSONGenerationRequest, JSONTemplateRequest } from "./types";

export const jsonApi = {
  // Generate standard JSON mapping
  generateJSON: async (request: JSONGenerationRequest) => {
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

    return apiClient.post("/json/generate", form, {
      responseType: "blob",
    });
  },

  // Generate JSON using template
  generateTemplateJSON: async (request: JSONTemplateRequest) => {
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

    return apiClient.post("/json/generate-with-template", form, {
      responseType: "blob",
    });
  },
};
