import { apiClient } from './client';
import type { HealthCheckResponse } from './types';

export const healthApi = {
  // Get health check status
  check: async (): Promise<HealthCheckResponse> => {
    return apiClient.get('/health');
  },
};
