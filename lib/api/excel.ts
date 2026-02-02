import { apiClient } from './client';
import type { 
  ExcelInfoResponse, 
  ColumnExtractionRequest,
  ColumnMappingRequest,
  BindingSingleKeyRequest,
  BindingMultiKeyRequest 
} from './types';

export const excelApi = {
  // Get Excel file information
  getInfo: async (file: File): Promise<ExcelInfoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/excel/info', formData);
  },

  // Extract columns - returns JSON
  extractColumns: async (request: ColumnExtractionRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('columns', JSON.stringify(request.columns));
    formData.append('remove_duplicates', String(request.removeDuplicates || false));
    return apiClient.post('/excel/extract-columns', formData);
  },

  // Extract columns to file - returns download URL
  extractColumnsToFile: async (request: ColumnExtractionRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('columns', JSON.stringify(request.columns));
    formData.append('remove_duplicates', String(request.removeDuplicates || false));
    return apiClient.post('/excel/extract-columns-to-file', formData, {
      responseType: 'blob'
    });
  },

  // Map columns
  mapColumns: async (request: ColumnMappingRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('mapping', JSON.stringify(request.mapping));
    return apiClient.post('/excel/map-columns', formData, {
      responseType: 'blob'
    });
  },

  // Single key binding
  bindSingleKey: async (request: BindingSingleKeyRequest) => {
    const formData = new FormData();
    formData.append('source_file', request.sourceFile);
    formData.append('bind_file', request.bindFile);
    formData.append('comparison_column', request.comparisonColumn);
    formData.append('bind_columns', JSON.stringify(request.bindColumns));
    if (request.outputFilename) {
      formData.append('output_filename', request.outputFilename);
    }
    return apiClient.post('/excel/bind-single-key', formData, {
      responseType: 'blob'
    });
  },

  // Multi key binding
  bindMultiKey: async (request: BindingMultiKeyRequest) => {
    const formData = new FormData();
    formData.append('source_file', request.sourceFile);
    formData.append('bind_file', request.bindFile);
    formData.append('comparison_columns', JSON.stringify(request.comparisonColumns));
    formData.append('bind_columns', JSON.stringify(request.bindColumns));
    if (request.outputFilename) {
      formData.append('output_filename', request.outputFilename);
    }
    return apiClient.post('/excel/bind-multi-key', formData, {
      responseType: 'blob'
    });
  },
};
