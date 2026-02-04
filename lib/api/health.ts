import { apiClient } from './client';
import type { StandardResponse, HealthCheckData } from './types';

export const healthApi = {
  // Get health check status
  check: async (): Promise<StandardResponse<HealthCheckData>> => {
    return apiClient.get('/health');
  },
};
