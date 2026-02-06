import { WorkflowStep } from "../WorkflowStep";
import type { StepResult, SQLGenerationStepConfig } from "@/lib/api/types";
import { sqlApi } from "@/lib/api/sql";

/**
 * Concrete implementation of SQL Generation step
 */
export class SQLGenerationStep extends WorkflowStep {
  constructor(config: SQLGenerationStepConfig) {
    super(config);
  }

  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const config = this.config as SQLGenerationStepConfig;

    if (!config.config.tableName) {
      errors.push("Table name is required");
    }

    if (!config.config.databaseType) {
      errors.push("Database type is required");
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
    const config = this.config as SQLGenerationStepConfig;
    this.setStatus("running");

    const input = {
      fileName: inputFile.name,
      tableName: config.config.tableName,
      databaseType: config.config.databaseType,
    };

    try {
      const response = await sqlApi.generateSQL({
        file: inputFile,
        tableName: config.config.tableName,
        databaseType: config.config.databaseType,
        columns: config.config.columns,
        columnMapping: config.config.columnMapping,
        autoIncrement: config.config.autoIncrement,
        removeDuplicates: config.config.removeDuplicates,
      });

      this.setStatus("success");

      const result = this.createStepResult(
        "success",
        input,
        {
          downloadUrl: response.data.download_url,
          fileName: `${config.config.tableName}.sql`,
        },
        undefined,
        {
          tableName: config.config.tableName,
          databaseType: config.config.databaseType,
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
            error instanceof Error ? error.message : "SQL generation failed",
          details: error instanceof Error ? error.stack : undefined,
        }
      );

      this.result = result;
      return result;
    }
  }
}
