import { apiClient } from "./client";
import type { NormalizationType, NormalizationRequest } from "./types";

export const normalizationApi = {
  // Get available normalization types
  getTypes: async (): Promise<NormalizationType[]> => {
    return apiClient.get("/normalization/types");
  },

  // Apply normalizations to file
  normalize: async (request: NormalizationRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("normalizations", JSON.stringify(request.normalizations));
    return apiClient.post("/normalization/apply", form, {
      responseType: "blob",
    });
  },
};
