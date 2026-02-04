import { apiClient } from "./client";
import type {
  StandardResponse,
  DownloadUrlResponse,
  NormalizationTypesResponse,
  NormalizationRequest,
} from "./types";

export const normalizationApi = {
  // Get available normalization types
  getTypes: async (): Promise<StandardResponse<NormalizationTypesResponse>> => {
    return apiClient.get("/normalization/types");
  },

  // Apply normalizations to file - returns download URL
  normalize: async (
    request: NormalizationRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("normalizations", request.normalizations); // Already JSON string
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return apiClient.post("/normalization/apply", form);
  },
};
