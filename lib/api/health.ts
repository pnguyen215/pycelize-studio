import { api } from "./client";
import type { StandardResponse, HealthCheckResponse } from "./types";

export const healthApi = {
  /**
   * Get health check status
   * @returns Health check status
   */
  check: async (): Promise<StandardResponse<HealthCheckResponse>> => {
    return api.get("/health", {
      notification: { enabled: false },
      retry: { retries: 3 },
    });
  },
};
