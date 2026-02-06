import { WorkflowStep } from "../WorkflowStep";
import type { StepResult, NormalizationStepConfig } from "@/lib/api/types";
import { normalizationApi } from "@/lib/api/normalization";

/**
 * Concrete implementation of Normalization step
 */
export class NormalizationStep extends WorkflowStep {
  constructor(config: NormalizationStepConfig) {
    super(config);
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.config as NormalizationStepConfig;

    if (
      !config.config.normalizations ||
      config.config.normalizations.length === 0
    ) {
      errors.push("At least one normalization rule must be defined");
    }

    for (const norm of config.config.normalizations) {
      if (!norm.column_name || !norm.normalization_type) {
        errors.push("Each normalization must have a column name and type");
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
    const config = this.config as NormalizationStepConfig;
    this.setStatus("running");

    const input = {
      fileName: inputFile.name,
      normalizations: config.config.normalizations,
    };

    try {
      const response = await normalizationApi.normalize({
        file: inputFile,
        normalizations: JSON.stringify(config.config.normalizations),
        outputFilename: config.config.outputFilename,
      });

      this.setStatus("success");

      const result = this.createStepResult(
        "success",
        input,
        {
          downloadUrl: response.data.download_url,
          fileName:
            config.config.outputFilename || `normalized-${inputFile.name}`,
        },
        undefined,
        {
          normalizationCount: config.config.normalizations.length,
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
            error instanceof Error ? error.message : "Normalization failed",
          details: error instanceof Error ? error.stack : undefined,
        }
      );

      this.result = result;
      return result;
    }
  }
}
