import { apiClient } from "./client";
import type { StandardResponse, HealthCheckResponse } from "./types";

export const healthApi = {
  // Get health check status
  check: async (): Promise<StandardResponse<HealthCheckResponse>> => {
    return apiClient.get("/health");
  },
};
