import type {
  WorkflowStepConfig,
  StepResult,
  WorkflowStepStatus,
} from "@/lib/api/types";
import { apiClient } from "@/lib/api/client";

/**
 * Abstract base class for workflow steps
 * All concrete step implementations must extend this class
 */
export abstract class WorkflowStep {
  protected config: WorkflowStepConfig;
  protected status: WorkflowStepStatus = "pending";
  protected result: StepResult | null = null;

  constructor(config: WorkflowStepConfig) {
    this.config = config;
  }

  /**
   * Get the step ID
   */
  public getId(): string {
    return this.config.id;
  }

  /**
   * Get the step type
   */
  public getType() {
    return this.config.type;
  }

  /**
   * Get the step name
   */
  public getName(): string {
    return this.config.name;
  }

  /**
   * Get the step configuration
   */
  public getConfig(): WorkflowStepConfig {
    return this.config;
  }

  /**
   * Get the step status
   */
  public getStatus(): WorkflowStepStatus {
    return this.status;
  }

  /**
   * Get the step result
   */
  public getResult(): StepResult | null {
    return this.result;
  }

  /**
   * Set the step status
   */
  protected setStatus(status: WorkflowStepStatus): void {
    this.status = status;
  }

  /**
   * Validate step configuration before execution
   * Must be implemented by concrete step classes
   */
  public abstract validate(): { valid: boolean; errors: string[] };

  /**
   * Execute the step with the provided input file
   * Must be implemented by concrete step classes
   * @param inputFile - The input file or blob URL for this step
   * @param signal - Optional abort signal for cancellation
   * @returns The result of the step execution
   */
  public abstract execute(
    inputFile: File,
    signal?: AbortSignal
  ): Promise<StepResult>;

  /**
   * Create a step result object
   */
  protected createStepResult(
    status: WorkflowStepStatus,
    input: StepResult["input"],
    output: StepResult["output"],
    error?: StepResult["error"],
    metadata?: Record<string, unknown>
  ): StepResult {
    return {
      stepId: this.config.id,
      stepType: this.config.type,
      status,
      input,
      output,
      executedAt: new Date().toISOString(),
      error,
      metadata,
    };
  }

  /**
   * Helper method to convert download URL to File
   */
  protected async downloadUrlToFile(
    downloadUrl: string,
    fileName: string
  ): Promise<File> {
    try {
      // Use axios to download the file with proper headers
      const response = await apiClient.get(downloadUrl, {
        responseType: 'blob',
        notification: { enabled: false },
      } as any);
      
      if (response.status !== 200) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }
      
      const blob = response.data;
      return new File([blob], fileName, { type: blob.type });
    } catch (error) {
      console.error('Error downloading file from URL:', downloadUrl, error);
      throw new Error(
        `Failed to download file: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    }
  }
}
