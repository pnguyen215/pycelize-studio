import { WorkflowStep } from "../WorkflowStep";
import type { StepResult, SearchStepConfig } from "@/lib/api/types";
import { excelApi } from "@/lib/api/excel";
import { csvApi } from "@/lib/api/csv";

/**
 * Concrete implementation of Search/Filter step
 */
export class SearchStep extends WorkflowStep {
  constructor(config: SearchStepConfig) {
    super(config);
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.config as SearchStepConfig;

    if (!config.config.conditions || config.config.conditions.length === 0) {
      errors.push("At least one search condition must be defined");
    }

    for (const condition of config.config.conditions) {
      if (!condition.column || !condition.operator) {
        errors.push("Each condition must have a column and operator");
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public async execute(
    inputFile: File,
    signal?: AbortSignal
  ): Promise<StepResult> {
    const config = this.config as SearchStepConfig;
    this.setStatus("running");

    const input = {
      fileName: inputFile.name,
      conditions: config.config.conditions,
      logic: config.config.logic,
    };

    try {
      let response;

      // Use appropriate API based on file type
      if (inputFile.name.endsWith(".csv")) {
        response = await csvApi.search({
          file: inputFile,
          conditions: config.config.conditions,
          logic: config.config.logic,
          outputFormat: config.config.outputFormat,
          outputFilename: config.config.outputFilename,
        });
      } else {
        response = await excelApi.search({
          file: inputFile,
          conditions: config.config.conditions,
          logic: config.config.logic,
          outputFormat: config.config.outputFormat,
          outputFilename: config.config.outputFilename,
        });
      }

      this.setStatus("success");

      const result = this.createStepResult(
        "success",
        input,
        {
          downloadUrl: response.data.download_url,
          fileName: config.config.outputFilename || `filtered-${inputFile.name}`,
        },
        undefined,
        {
          conditionCount: config.config.conditions.length,
          totalRows: response.data.total_rows,
          filteredRows: response.data.filtered_rows,
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
          message: error instanceof Error ? error.message : "Search failed",
          details: error instanceof Error ? error.stack : undefined,
        }
      );

      this.result = result;
      return result;
    }
  }
}
