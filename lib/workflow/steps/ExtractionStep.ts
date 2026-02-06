import { WorkflowStep } from "../WorkflowStep";
import type { StepResult, ExtractionStepConfig } from "@/lib/api/types";
import { excelApi } from "@/lib/api/excel";

/**
 * Concrete implementation of Column Extraction step
 */
export class ExtractionStep extends WorkflowStep {
  constructor(config: ExtractionStepConfig) {
    super(config);
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.config as ExtractionStepConfig;

    if (!config.config.columns || config.config.columns.length === 0) {
      errors.push("At least one column must be selected");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public async execute(inputFile: File, signal?: AbortSignal): Promise<StepResult> {
    const config = this.config as ExtractionStepConfig;
    this.setStatus("running");

    const input = {
      fileName: inputFile.name,
      columns: config.config.columns,
      removeDuplicates: config.config.removeDuplicates,
    };

    try {
      // Use Excel extraction API
      const response = await excelApi.extractColumnsToFile({
        file: inputFile,
        columns: config.config.columns,
        removeDuplicates: config.config.removeDuplicates,
      });

      this.setStatus("success");
      
      const result = this.createStepResult(
        "success",
        input,
        {
          downloadUrl: response.data.download_url,
          fileName: `extracted-${inputFile.name}`,
        },
        undefined,
        {
          columns: config.config.columns.length,
        }
      );

      this.result = result;
      return result;
    } catch (error) {
      this.setStatus("failed");
      
      const result = this.createStepResult(
        "failed",
        input,
        {},
        {
          message: error instanceof Error ? error.message : "Extraction failed",
          details: error instanceof Error ? error.stack : undefined,
        }
      );

      this.result = result;
      return result;
    }
  }
}
