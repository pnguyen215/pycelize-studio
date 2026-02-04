import { apiClient } from "./client";
import type { NormalizationType, NormalizationRequest, StandardResponse } from "./types";

export const normalizationApi = {
  // Get available normalization types
  getTypes: async (): Promise<StandardResponse<NormalizationType[]>> => {
    return apiClient.get("/normalization/types");
  },

  // Apply normalizations to file - returns download URL
  normalize: async (request: NormalizationRequest): Promise<StandardResponse<{ download_url: string }>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("normalizations", JSON.stringify(request.normalizations));
    if (request.returnReport !== undefined) {
      form.append("return_report", String(request.returnReport));
    }
    return apiClient.post("/normalization/apply", form);
  },
};
