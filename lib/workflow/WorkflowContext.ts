import type { WorkflowContext as WorkflowContextType, StepResult } from "@/lib/api/types";

/**
 * Represents the current workflow execution context
 * Contains current file reference, intermediate outputs, step results, and execution metadata
 */
export class WorkflowContext {
  private context: WorkflowContextType;

  constructor(workflowId: string, inputFile: File) {
    this.context = {
      workflowId,
      currentStepIndex: 0,
      currentFile: inputFile,
      currentFileUrl: undefined,
      stepResults: [],
      status: "idle",
      metadata: {},
    };
  }

  /**
   * Get the complete context
   */
  public getContext(): WorkflowContextType {
    return { ...this.context };
  }

  /**
   * Get the current file
   */
  public getCurrentFile(): File | null {
    return this.context.currentFile;
  }

  /**
   * Set the current file
   */
  public setCurrentFile(file: File): void {
    this.context.currentFile = file;
  }

  /**
   * Get the current file URL (if available)
   */
  public getCurrentFileUrl(): string | undefined {
    return this.context.currentFileUrl;
  }

  /**
   * Set the current file URL
   */
  public setCurrentFileUrl(url: string): void {
    this.context.currentFileUrl = url;
  }

  /**
   * Get the current step index
   */
  public getCurrentStepIndex(): number {
    return this.context.currentStepIndex;
  }

  /**
   * Set the current step index
   */
  public setCurrentStepIndex(index: number): void {
    this.context.currentStepIndex = index;
  }

  /**
   * Get the workflow status
   */
  public getStatus(): WorkflowContextType["status"] {
    return this.context.status;
  }

  /**
   * Set the workflow status
   */
  public setStatus(status: WorkflowContextType["status"]): void {
    this.context.status = status;
    
    if (status === "running" && !this.context.startedAt) {
      this.context.startedAt = new Date().toISOString();
    }
    
    if (
      (status === "completed" || status === "failed" || status === "cancelled") &&
      !this.context.completedAt
    ) {
      this.context.completedAt = new Date().toISOString();
    }
  }

  /**
   * Get all step results
   */
  public getStepResults(): StepResult[] {
    return [...this.context.stepResults];
  }

  /**
   * Add a step result
   */
  public addStepResult(result: StepResult): void {
    this.context.stepResults.push(result);
  }

  /**
   * Update a step result
   */
  public updateStepResult(stepId: string, result: StepResult): void {
    const index = this.context.stepResults.findIndex((r) => r.stepId === stepId);
    if (index !== -1) {
      this.context.stepResults[index] = result;
    }
  }

  /**
   * Get a step result by ID
   */
  public getStepResult(stepId: string): StepResult | undefined {
    return this.context.stepResults.find((r) => r.stepId === stepId);
  }

  /**
   * Get metadata
   */
  public getMetadata(): Record<string, unknown> {
    return { ...this.context.metadata };
  }

  /**
   * Set metadata value
   */
  public setMetadata(key: string, value: unknown): void {
    this.context.metadata[key] = value;
  }

  /**
   * Clear metadata
   */
  public clearMetadata(): void {
    this.context.metadata = {};
  }

  /**
   * Reset context for retry
   */
  public resetForRetry(fromStepIndex: number): void {
    this.context.currentStepIndex = fromStepIndex;
    this.context.status = "idle";
    this.context.completedAt = undefined;
    
    // Keep step results up to the retry point
    this.context.stepResults = this.context.stepResults.slice(0, fromStepIndex);
  }
}
