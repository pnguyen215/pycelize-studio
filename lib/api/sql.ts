import { apiClient } from './client';
import type { SQLGenerationRequest, CustomSQLRequest } from './types';

export const sqlApi = {
  // Generate standard SQL INSERT statements
  generateSQL: async (request: SQLGenerationRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('table_name', request.tableName);
    formData.append('column_mapping', JSON.stringify(request.columnMapping));
    formData.append('database_type', request.databaseType);
    
    if (request.autoIncrement) {
      formData.append('auto_increment', JSON.stringify(request.autoIncrement));
    }
    if (request.batchSize) {
      formData.append('batch_size', String(request.batchSize));
    }
    if (request.includeTransaction !== undefined) {
      formData.append('include_transaction', String(request.includeTransaction));
    }
    if (request.returnFile) {
      return apiClient.post('/sql/generate', formData, {
        responseType: 'blob'
      });
    }
    return apiClient.post('/sql/generate', formData);
  },

  // Generate custom SQL using template
  generateCustomSQL: async (request: CustomSQLRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('template', request.template);
    formData.append('column_mapping', JSON.stringify(request.columnMapping));
    
    if (request.columns) {
      formData.append('columns', JSON.stringify(request.columns));
    }
    if (request.autoIncrement) {
      formData.append('auto_increment', JSON.stringify(request.autoIncrement));
    }
    if (request.removeDuplicates !== undefined) {
      formData.append('remove_duplicates', String(request.removeDuplicates));
    }
    
    return apiClient.post('/sql/custom', formData, {
      responseType: 'blob'
    });
  },
};
