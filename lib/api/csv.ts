import { apiClient } from './client';
import type { CSVInfoResponse, CSVConvertRequest } from './types';

export const csvApi = {
  // Get CSV file information
  getInfo: async (file: File): Promise<CSVInfoResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/csv/info', formData);
  },

  // Convert CSV to Excel
  convertToExcel: async (request: CSVConvertRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    if (request.outputFilename) {
      formData.append('output_filename', request.outputFilename);
    }
    if (request.delimiter) {
      formData.append('delimiter', request.delimiter);
    }
    return apiClient.post('/csv/convert', formData, {
      responseType: 'blob'
    });
  },
};
