import { apiClient } from './client';
import type { FileBindingRequest } from './types';

export const fileApi = {
  // Bind files with column mapping
  bindFiles: async (request: FileBindingRequest) => {
    const formData = new FormData();
    formData.append('file', request.file);
    formData.append('binding_file', request.bindingFile);
    formData.append('column_mapping', JSON.stringify(request.columnMapping));
    
    if (request.outputFilename) {
      formData.append('output_filename', request.outputFilename);
    }
    
    return apiClient.post('/files/bind', formData, {
      responseType: 'blob'
    });
  },
};
