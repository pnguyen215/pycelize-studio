import type { WorkflowConfig, WorkflowStepConfig } from "@/lib/api/types";
import { WorkflowStep } from "./WorkflowStep";

/**
 * Represents the entire workflow definition and state
 * Manages workflow steps, tracks execution state, stores step results, controls execution flow
 */
export class Workflow {
  private config: WorkflowConfig;
  private steps: WorkflowStep[] = [];

  constructor(config: WorkflowConfig) {
    this.config = config;
  }

  /**
   * Get the workflow ID
   */
  public getId(): string {
    return this.config.id;
  }

  /**
   * Get the workflow name
   */
  public getName(): string {
    return this.config.name;
  }

  /**
   * Get the workflow description
   */
  public getDescription(): string | undefined {
    return this.config.description;
  }

  /**
   * Get the workflow configuration
   */
  public getConfig(): WorkflowConfig {
    return { ...this.config };
  }

  /**
   * Get all workflow steps
   */
  public getSteps(): WorkflowStep[] {
    return [...this.steps];
  }

  /**
   * Get a specific step by index
   */
  public getStep(index: number): WorkflowStep | undefined {
    return this.steps[index];
  }

  /**
   * Get a specific step by ID
   */
  public getStepById(stepId: string): WorkflowStep | undefined {
    return this.steps.find((step) => step.getId() === stepId);
  }

  /**
   * Get the number of steps
   */
  public getStepCount(): number {
    return this.steps.length;
  }

  /**
   * Set the workflow steps (concrete implementations)
   */
  public setSteps(steps: WorkflowStep[]): void {
    this.steps = steps;
  }

  /**
   * Add a step to the workflow
   */
  public addStep(step: WorkflowStep): void {
    this.steps.push(step);
    this.config.steps.push(step.getConfig());
  }

  /**
   * Remove a step from the workflow
   */
  public removeStep(stepId: string): boolean {
    const stepIndex = this.steps.findIndex((s) => s.getId() === stepId);
    if (stepIndex === -1) return false;

    this.steps.splice(stepIndex, 1);
    this.config.steps.splice(stepIndex, 1);
    return true;
  }

  /**
   * Update a step configuration
   */
  public updateStep(stepId: string, newConfig: WorkflowStepConfig): boolean {
    const stepIndex = this.config.steps.findIndex((s) => s.id === stepId);
    if (stepIndex === -1) return false;

    this.config.steps[stepIndex] = newConfig;
    return true;
  }

  /**
   * Reorder steps
   */
  public reorderSteps(fromIndex: number, toIndex: number): boolean {
    if (
      fromIndex < 0 ||
      fromIndex >= this.steps.length ||
      toIndex < 0 ||
      toIndex >= this.steps.length
    ) {
      return false;
    }

    // Reorder steps array
    const [movedStep] = this.steps.splice(fromIndex, 1);
    this.steps.splice(toIndex, 0, movedStep);

    // Reorder config array
    const [movedConfig] = this.config.steps.splice(fromIndex, 1);
    this.config.steps.splice(toIndex, 0, movedConfig);

    return true;
  }

  /**
   * Validate all steps in the workflow
   */
  public validate(): { valid: boolean; errors: Record<string, string[]> } {
    const errors: Record<string, string[]> = {};
    let valid = true;

    for (const step of this.steps) {
      const validation = step.validate();
      if (!validation.valid) {
        errors[step.getId()] = validation.errors;
        valid = false;
      }
    }

    return { valid, errors };
  }

  /**
   * Clone the workflow
   */
  public clone(newId?: string): Workflow {
    const clonedConfig = {
      ...this.config,
      id: newId || `${this.config.id}-copy`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return new Workflow(clonedConfig);
  }

  /**
   * Update the workflow's updated timestamp
   */
  public touch(): void {
    this.config.updatedAt = new Date().toISOString();
  }
}
