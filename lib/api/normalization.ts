import { apiClient } from './client';
import type { NormalizationType, NormalizationRequest } from './types';

export const normalizationApi = {
  // Get available normalization types
  getTypes: async (): Promise<NormalizationType[]> => {
    return apiClient.get('/normalization/types');
  },

  // Apply normalizations to file
  normalize: async (request: NormalizationRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('normalizations', JSON.stringify(request.normalizations));
    return apiClient.post('/normalization/apply', formData, {
      responseType: 'blob'
    });
  },
};
