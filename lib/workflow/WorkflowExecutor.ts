import type { StepResult } from "@/lib/api/types";
import { Workflow } from "./Workflow";
import { WorkflowContext } from "./WorkflowContext";
import { WorkflowStep } from "./WorkflowStep";

/**
 * Callback function types for workflow execution events
 */
export type WorkflowExecutorCallbacks = {
  onStepStart?: (step: WorkflowStep, stepIndex: number) => void;
  onStepComplete?: (step: WorkflowStep, result: StepResult) => void;
  onStepError?: (step: WorkflowStep, error: Error) => void;
  onWorkflowComplete?: (context: WorkflowContext) => void;
  onWorkflowError?: (error: Error, context: WorkflowContext) => void;
  onWorkflowCancelled?: (context: WorkflowContext) => void;
};

/**
 * Responsible for executing workflow steps sequentially
 * Handles failures, retries, cancellation, and updates workflow state
 */
export class WorkflowExecutor {
  private workflow: Workflow;
  private context: WorkflowContext;
  private abortController: AbortController | null = null;
  private callbacks: WorkflowExecutorCallbacks = {};

  constructor(workflow: Workflow, context: WorkflowContext) {
    this.workflow = workflow;
    this.context = context;
  }

  /**
   * Set execution callbacks
   */
  public setCallbacks(callbacks: WorkflowExecutorCallbacks): void {
    this.callbacks = callbacks;
  }

  /**
   * Execute the workflow from the current step index
   */
  public async execute(): Promise<WorkflowContext> {
    // Validate workflow before execution
    const validation = this.workflow.validate();
    if (!validation.valid) {
      const errorMessage = Object.entries(validation.errors)
        .map(([stepId, errors]) => `${stepId}: ${errors.join(", ")}`)
        .join("; ");
      throw new Error(`Workflow validation failed: ${errorMessage}`);
    }

    // Create abort controller for cancellation
    this.abortController = new AbortController();
    const signal = this.abortController.signal;

    // Set workflow status to running
    this.context.setStatus("running");

    const steps = this.workflow.getSteps();
    const startIndex = this.context.getCurrentStepIndex();

    try {
      for (let i = startIndex; i < steps.length; i++) {
        // Check if workflow was cancelled
        if (signal.aborted) {
          this.context.setStatus("cancelled");
          this.callbacks.onWorkflowCancelled?.(this.context);
          return this.context;
        }

        const step = steps[i];
        this.context.setCurrentStepIndex(i);

        // Get input file for this step
        const inputFile = this.context.getCurrentFile();
        if (!inputFile) {
          throw new Error(`No input file available for step ${i + 1}`);
        }

        try {
          // Notify step start
          this.callbacks.onStepStart?.(step, i);

          // Execute the step
          const result = await step.execute(inputFile, signal);

          // Store the result
          this.context.addStepResult(result);

          // Notify step complete
          this.callbacks.onStepComplete?.(step, result);

          // Check step result status
          if (result.status === "failed") {
            this.context.setStatus("paused");
            throw new Error(
              result.error?.message || `Step ${step.getName()} failed`
            );
          }

          if (result.status === "cancelled") {
            this.context.setStatus("cancelled");
            this.callbacks.onWorkflowCancelled?.(this.context);
            return this.context;
          }

          // Update current file for next step if output file is available
          if (result.output.downloadUrl) {
            const fileName =
              result.output.fileName || `step-${i + 1}-output.xlsx`;
            const nextFile = await this.downloadUrlToFile(
              result.output.downloadUrl,
              fileName
            );
            this.context.setCurrentFile(nextFile);
            this.context.setCurrentFileUrl(result.output.downloadUrl);
          }
        } catch (error) {
          // Handle step error
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
          this.callbacks.onStepError?.(step, error as Error);

          // Update step result with error if not already set
          const existingResult = this.context.getStepResult(step.getId());
          if (!existingResult || existingResult.status !== "failed") {
            const failedResult: StepResult = {
              stepId: step.getId(),
              stepType: step.getType(),
              status: "failed",
              input: {
                fileName: inputFile.name,
              },
              output: {},
              executedAt: new Date().toISOString(),
              error: {
                message: errorMessage,
              },
            };
            
            if (existingResult) {
              this.context.updateStepResult(step.getId(), failedResult);
            } else {
              this.context.addStepResult(failedResult);
            }
          }

          // Set workflow to paused state
          this.context.setStatus("paused");
          throw error;
        }
      }

      // All steps completed successfully
      this.context.setStatus("completed");
      this.callbacks.onWorkflowComplete?.(this.context);
      return this.context;
    } catch (error) {
      // Handle workflow error
      if (this.context.getStatus() !== "paused") {
        this.context.setStatus("failed");
      }
      this.callbacks.onWorkflowError?.(error as Error, this.context);
      throw error;
    }
  }

  /**
   * Cancel the workflow execution
   */
  public cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
    }
  }

  /**
   * Retry execution from a specific step
   */
  public async retry(fromStepIndex: number): Promise<WorkflowContext> {
    // Reset context for retry
    this.context.resetForRetry(fromStepIndex);

    // Execute from the specified step
    return this.execute();
  }

  /**
   * Retry execution from the failed step
   */
  public async retryFailed(): Promise<WorkflowContext> {
    const currentStepIndex = this.context.getCurrentStepIndex();
    return this.retry(currentStepIndex);
  }

  /**
   * Helper method to convert download URL to File
   */
  private async downloadUrlToFile(
    downloadUrl: string,
    fileName: string
  ): Promise<File> {
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  }

  /**
   * Get the current workflow context
   */
  public getContext(): WorkflowContext {
    return this.context;
  }

  /**
   * Get the workflow
   */
  public getWorkflow(): Workflow {
    return this.workflow;
  }
}
