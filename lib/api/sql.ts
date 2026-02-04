import { apiClient } from "./client";
import type { SQLGenerationRequest, CustomSQLRequest } from "./types";

export const sqlApi = {
  // Generate standard SQL INSERT statements
  generateSQL: async (request: SQLGenerationRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("table_name", request.tableName);
    form.append("column_mapping", JSON.stringify(request.columnMapping));
    form.append("database_type", request.databaseType);

    if (request.autoIncrement) {
      form.append("auto_increment", JSON.stringify(request.autoIncrement));
    }
    if (request.batchSize) {
      form.append("batch_size", String(request.batchSize));
    }
    if (request.includeTransaction !== undefined) {
      form.append("include_transaction", String(request.includeTransaction));
    }
    if (request.returnFile) {
      return apiClient.post("/sql/generate", form, {
        responseType: "blob",
      });
    }
    return apiClient.post("/sql/generate", form);
  },

  // Generate custom SQL using template
  generateCustomSQL: async (request: CustomSQLRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("template", request.template);
    form.append("column_mapping", JSON.stringify(request.columnMapping));

    if (request.columns) {
      form.append("columns", JSON.stringify(request.columns));
    }
    if (request.autoIncrement) {
      form.append("auto_increment", JSON.stringify(request.autoIncrement));
    }
    if (request.removeDuplicates !== undefined) {
      form.append("remove_duplicates", String(request.removeDuplicates));
    }

    return apiClient.post("/sql/custom", form, {
      responseType: "blob",
    });
  },
};
