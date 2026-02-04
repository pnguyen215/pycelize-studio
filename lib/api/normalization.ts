import { apiClient } from "./client";
import type { StandardResponse, DownloadUrlData, NormalizationType, NormalizationRequest } from "./types";

export const normalizationApi = {
  // Get available normalization types
  getTypes: async (): Promise<StandardResponse<NormalizationType[]>> => {
    return apiClient.get("/normalization/types");
  },

  // Apply normalizations to file - returns download URL
  normalize: async (request: NormalizationRequest): Promise<StandardResponse<DownloadUrlData>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("normalizations", request.normalizations); // Already JSON string
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return apiClient.post("/normalization/apply", form);
  },
};
