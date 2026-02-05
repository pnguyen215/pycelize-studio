import { api } from "./client";
import type {
  StandardResponse,
  DownloadUrlResponse,
  NormalizationTypesResponse,
  NormalizationRequest,
} from "./types";

export const normalizationApi = {
  /**
   * Get available normalization types
   * @param options - The options object
   * @param options.notify - Whether to show notifications
   * @returns Normalization types
   */
  getTypes: async (
    options: { notify?: boolean } = { notify: true }
  ): Promise<StandardResponse<NormalizationTypesResponse>> => {
    return api.get("/normalization/types", {
      notification: { enabled: options.notify },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Apply normalizations to file
   * @param request - The request object
   * @returns Download URL
   */
  normalize: async (
    request: NormalizationRequest
  ): Promise<StandardResponse<DownloadUrlResponse>> => {
    const form = new FormData();

    form.append("file", request.file);
    form.append("normalizations", request.normalizations); // Already JSON string
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }

    return api.post("/normalization/apply", form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },
};
