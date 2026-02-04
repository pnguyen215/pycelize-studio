import { apiClient } from "./client";
import type { StandardResponse, CSVInfoData, DownloadUrlData, CSVConvertRequest } from "./types";

export const csvApi = {
  // Get CSV file information
  getInfo: async (file: File): Promise<StandardResponse<CSVInfoData>> => {
    const form = new FormData();
    form.append("file", file);
    return apiClient.post("/csv/info", form);
  },

  // Convert CSV to Excel - returns download URL
  convertToExcel: async (request: CSVConvertRequest): Promise<StandardResponse<DownloadUrlData>> => {
    const form = new FormData();
    form.append("file", request.file);
    if (request.sheetName) {
      form.append("sheet_name", request.sheetName);
    }
    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }
    return apiClient.post("/csv/convert-to-excel", form);
  },
};
