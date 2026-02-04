import { apiClient } from "./client";
import type { FileBindingRequest } from "./types";

export const fileApi = {
  // Bind files with column mapping
  bindFiles: async (request: FileBindingRequest) => {
    const form = new FormData();
    form.append("file", request.file);
    form.append("binding_file", request.bindingFile);
    form.append("column_mapping", JSON.stringify(request.columnMapping));

    if (request.outputFilename) {
      form.append("output_filename", request.outputFilename);
    }

    return apiClient.post("/files/bind", form, {
      responseType: "blob",
    });
  },
};
