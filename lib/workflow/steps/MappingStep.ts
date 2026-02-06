import { WorkflowStep } from "../WorkflowStep";
import type { StepResult, MappingStepConfig } from "@/lib/api/types";
import { excelApi } from "@/lib/api/excel";

/**
 * Concrete implementation of Column Mapping step
 */
export class MappingStep extends WorkflowStep {
  constructor(config: MappingStepConfig) {
    super(config);
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.config as MappingStepConfig;

    if (!config.config.mapping || Object.keys(config.config.mapping).length === 0) {
      errors.push("At least one column mapping must be defined");
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
    const config = this.config as MappingStepConfig;
    this.setStatus("running");

    const input = {
      fileName: inputFile.name,
      mapping: config.config.mapping,
    };

    try {
      const response = await excelApi.mapColumns({
        file: inputFile,
        mapping: config.config.mapping,
        outputFilename: config.config.outputFilename,
      });

      this.setStatus("success");

      const result = this.createStepResult(
        "success",
        input,
        {
          downloadUrl: response.data.download_url,
          fileName: config.config.outputFilename || `mapped-${inputFile.name}`,
        },
        undefined,
        {
          mappingCount: Object.keys(config.config.mapping).length,
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
          message: error instanceof Error ? error.message : "Mapping failed",
          details: error instanceof Error ? error.stack : undefined,
        }
      );

      this.result = result;
      return result;
    }
  }
}
