import { apiClient } from './client';
import type { HealthCheckResponse, StandardResponse } from './types';

export const healthApi = {
  // Get health check status
  check: async (): Promise<StandardResponse<HealthCheckResponse>> => {
    return apiClient.get('/health');
  },
};
