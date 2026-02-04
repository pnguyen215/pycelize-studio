import { apiClient } from "./client";
import type { CSVInfoResponse, CSVConvertRequest } from "./types";

export const csvApi = {
  // Get CSV file information
  getInfo: async (file: File): Promise<CSVInfoResponse> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post("/csv/info", form);
  },

  // Convert CSV to Excel
  convertToExcel: async (request: CSVConvertRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    if (request.delimiter) {
      form.append("delimiter", request.delimiter);
    }
    return apiClient.post("/csv/convert", form, {
      responseType: "blob",
    });
  },
};
