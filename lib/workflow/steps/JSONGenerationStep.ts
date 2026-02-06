import { WorkflowStep } from "../WorkflowStep";
import type { StepResult, JSONGenerationStepConfig } from "@/lib/api/types";
import { jsonApi } from "@/lib/api/json";

/**
 * Concrete implementation of JSON Generation step
 */
export class JSONGenerationStep extends WorkflowStep {
  constructor(config: JSONGenerationStepConfig) {
    super(config);
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    // JSON generation has no required fields, so it's always valid
    return {
      valid: errors.length === 0,
      errors,
    };
  }

  public async execute(
    inputFile: File,
    signal?: AbortSignal
  ): Promise<StepResult> {
    const config = this.config as JSONGenerationStepConfig;
    this.setStatus("running");

    const input = {
      fileName: inputFile.name,
      columns: config.config.columns,
      prettyPrint: config.config.prettyPrint,
    };

    try {
      const response = await jsonApi.generateJSON({
        file: inputFile,
        columns: config.config.columns,
        columnMapping: config.config.columnMapping,
        prettyPrint: config.config.prettyPrint,
        nullHandling: config.config.nullHandling,
        arrayWrapper: config.config.arrayWrapper,
        outputFilename: config.config.outputFilename,
      });

      this.setStatus("success");

      const result = this.createStepResult(
        "success",
        input,
        {
          downloadUrl: response.data.download_url,
          fileName: config.config.outputFilename || `output.json`,
        },
        undefined,
        {
          prettyPrint: config.config.prettyPrint,
          nullHandling: config.config.nullHandling,
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
          message:
            error instanceof Error ? error.message : "JSON generation failed",
          details: error instanceof Error ? error.stack : undefined,
        }
      );

      this.result = result;
      return result;
    }
  }
}
