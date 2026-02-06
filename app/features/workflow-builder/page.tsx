"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/features/file-upload";
import { Play, Save, Plus, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import type { WorkflowConfig, WorkflowStepConfig } from "@/lib/api/types";
import { Workflow, WorkflowContext, WorkflowExecutor, StepFactory } from "@/lib/workflow";
import { StepListPanel } from "@/components/features/workflow/StepListPanel";
import { StepConfigurationPanel } from "@/components/features/workflow/StepConfigurationPanel";
import { ExecutionStatusView } from "@/components/features/workflow/ExecutionStatusView";
import { ExecutionControlPanel } from "@/components/features/workflow/ExecutionControlPanel";
import { WorkflowOverviewPanel } from "@/components/features/workflow/WorkflowOverviewPanel";
import { generateWorkflowId, generateStepId } from "@/lib/utils/id-generator";
import { saveWorkflow, updateWorkflowStatus } from "@/lib/services/workflow-storage";

export default function WorkflowBuilderPage() {
  const [inputFile, setInputFile] = useState<File | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [selectedStepIndex, setSelectedStepIndex] = useState<number>(-1);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const [executor, setExecutor] = useState<WorkflowExecutor | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isWorkflowConfirmed, setIsWorkflowConfirmed] = useState(false);

  // Initialize workflow when file is uploaded
  const handleFileUpload = useCallback((file: File | null) => {
    if (!file) return;
    
    setInputFile(file);
    
    // Create a new workflow if none exists
    if (!workflow) {
      const workflowConfig: WorkflowConfig = {
        id: generateWorkflowId(),
        name: "New Workflow",
        description: `Workflow for ${file.name}`,
        steps: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const newWorkflow = new Workflow(workflowConfig);
      setWorkflow(newWorkflow);
      toast.success("Workflow initialized");
    }
  }, [workflow]);

  // Add a new step to the workflow
  const handleAddStep = useCallback((stepType: string) => {
    if (!workflow) {
      toast.error("Please upload a file first");
      return;
    }

    const stepConfig: WorkflowStepConfig = {
      id: generateStepId(),
      type: stepType as any,
      name: `${stepType} Step`,
      description: "",
      config: {},
      enabled: true,
    };

    try {
      const step = StepFactory.createStep(stepConfig);
      workflow.addStep(step);
      
      // Properly recreate workflow with all steps
      const config = workflow.getConfig();
      const updatedWorkflow = new Workflow(config);
      const steps = config.steps.map(stepConfig => StepFactory.createStep(stepConfig));
      updatedWorkflow.setSteps(steps);
      
      setWorkflow(updatedWorkflow);
      setSelectedStepIndex(steps.length - 1);
      setIsWorkflowConfirmed(false); // Reset confirmation when workflow changes
      toast.success("Step added to workflow");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add step");
    }
  }, [workflow]);

  // Remove a step from the workflow
  const handleRemoveStep = useCallback((stepId: string) => {
    if (!workflow) return;

    const success = workflow.removeStep(stepId);
    if (success) {
      // Properly recreate workflow with all remaining steps
      const config = workflow.getConfig();
      const updatedWorkflow = new Workflow(config);
      const steps = config.steps.map(stepConfig => StepFactory.createStep(stepConfig));
      updatedWorkflow.setSteps(steps);
      
      setWorkflow(updatedWorkflow);
      setSelectedStepIndex(-1);
      setIsWorkflowConfirmed(false); // Reset confirmation when workflow changes
      toast.success("Step removed");
    }
  }, [workflow]);

  // Update step configuration
  const handleUpdateStep = useCallback((stepId: string, newConfig: WorkflowStepConfig) => {
    if (!workflow) return;

    const success = workflow.updateStep(stepId, newConfig);
    if (success) {
      // Recreate steps with updated configuration
      const config = workflow.getConfig();
      const updatedWorkflow = new Workflow(config);
      const steps = config.steps.map(stepConfig => StepFactory.createStep(stepConfig));
      updatedWorkflow.setSteps(steps);
      
      setWorkflow(updatedWorkflow);
      setIsWorkflowConfirmed(false); // Reset confirmation when step config changes
      toast.success("Step updated");
    }
  }, [workflow]);

  // Confirm workflow steps
  const handleConfirmWorkflow = useCallback(() => {
    if (!workflow || workflow.getStepCount() === 0) {
      toast.error("Please add at least one step");
      return;
    }

    // Validate workflow
    const validation = workflow.validate();
    if (!validation.valid) {
      const errors = Object.entries(validation.errors)
        .map(([stepId, errors]) => `Step ${stepId}: ${errors.join(", ")}`)
        .join("\n");
      toast.error(`Please configure all steps properly:\n${errors}`);
      return;
    }

    setIsWorkflowConfirmed(true);
    
    // Save workflow to localStorage
    const config = workflow.getConfig();
    saveWorkflow({
      ...config,
      status: "draft",
    });
    
    toast.success("Workflow confirmed and saved! Ready to execute.");
  }, [workflow]);

  // Edit a step (from overview panel)
  const handleEditStep = useCallback((stepIndex: number) => {
    setSelectedStepIndex(stepIndex);
    setIsWorkflowConfirmed(false); // Unconfirm when editing
    toast.info("Edit the step configuration, then confirm again");
  }, []);

  // Retry a failed step
  const handleRetryStep = useCallback(async (stepIndex: number) => {
    if (!executor) {
      toast.error("No active executor to retry");
      return;
    }

    setIsExecuting(true);
    try {
      await executor.retry(stepIndex);
    } catch (error) {
      console.error("Retry error:", error);
    }
  }, [executor]);

  // Execute the workflow
  const handleExecute = useCallback(async () => {
    if (!workflow || !inputFile) {
      toast.error("Please upload a file and add steps");
      return;
    }

    if (!isWorkflowConfirmed) {
      toast.error("Please confirm the workflow before executing");
      return;
    }

    // Validate workflow
    const validation = workflow.validate();
    if (!validation.valid) {
      const errors = Object.entries(validation.errors)
        .map(([stepId, errors]) => `${stepId}: ${errors.join(", ")}`)
        .join("\n");
      toast.error(`Workflow validation failed:\n${errors}`);
      return;
    }

    setIsExecuting(true);
    
    // Update workflow status to running
    updateWorkflowStatus(workflow.getId(), "running");

    // Create workflow context and executor
    const context = new WorkflowContext(workflow.getId(), inputFile);
    const newExecutor = new WorkflowExecutor(workflow, context);

    // Set callbacks
    newExecutor.setCallbacks({
      onStepStart: (step, stepIndex) => {
        setWorkflowContext(newExecutor.getContext());
        toast.info(`Executing: ${step.getName()}`);
      },
      onStepComplete: (step, result) => {
        setWorkflowContext(newExecutor.getContext());
        toast.success(`Completed: ${step.getName()}`);
      },
      onStepError: (step, error) => {
        setWorkflowContext(newExecutor.getContext());
        toast.error(`Failed: ${step.getName()} - ${error.message}`);
      },
      onWorkflowComplete: (context) => {
        setWorkflowContext(context);
        updateWorkflowStatus(workflow.getId(), "completed");
        toast.success("Workflow completed successfully!");
        setIsExecuting(false);
      },
      onWorkflowError: (error, context) => {
        setWorkflowContext(context);
        updateWorkflowStatus(workflow.getId(), "failed");
        setIsExecuting(false);
      },
      onWorkflowCancelled: (context) => {
        setWorkflowContext(context);
        updateWorkflowStatus(workflow.getId(), "cancelled");
        toast.info("Workflow cancelled");
        setIsExecuting(false);
      },
    });

    setExecutor(newExecutor);
    setWorkflowContext(context);

    try {
      await newExecutor.execute();
    } catch (error) {
      // Error already handled in callbacks
      console.error("Workflow execution error:", error);
    }
  }, [workflow, inputFile]);

  // Cancel workflow execution
  const handleCancel = useCallback(() => {
    if (executor) {
      executor.cancel();
      toast.info("Cancelling workflow...");
    }
  }, [executor]);

  // Retry failed step
  const handleRetry = useCallback(async () => {
    if (!executor) return;

    setIsExecuting(true);
    try {
      await executor.retryFailed();
    } catch (error) {
      console.error("Retry error:", error);
    }
  }, [executor]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Workflow Builder</h1>
        <p className="text-muted-foreground">
          Create and execute multi-step data processing workflows
        </p>
      </div>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>1. Upload Input File</CardTitle>
          <CardDescription>
            Upload an Excel (.xlsx, .xls) or CSV (.csv) file to process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            value={inputFile}
          />
          {inputFile && (
            <div className="mt-4 p-4 bg-muted rounded-md">
              <p className="text-sm font-medium">Selected File:</p>
              <p className="text-sm text-muted-foreground">{inputFile.name}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      {workflow && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Step List Panel */}
          <Card>
            <CardHeader>
              <CardTitle>2. Configure Workflow Steps</CardTitle>
              <CardDescription>
                Add and arrange processing steps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StepListPanel
                workflow={workflow}
                selectedStepIndex={selectedStepIndex}
                onSelectStep={setSelectedStepIndex}
                onAddStep={handleAddStep}
                onRemoveStep={handleRemoveStep}
                workflowContext={workflowContext}
              />
            </CardContent>
          </Card>

          {/* Step Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Step Configuration</CardTitle>
              <CardDescription>
                {selectedStepIndex >= 0
                  ? `Configure step ${selectedStepIndex + 1}`
                  : "Select a step to configure"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedStepIndex >= 0 && workflow.getStep(selectedStepIndex) ? (
                <StepConfigurationPanel
                  step={workflow.getStep(selectedStepIndex)!}
                  stepConfig={workflow.getConfig().steps[selectedStepIndex]}
                  onUpdate={handleUpdateStep}
                  inputFile={inputFile}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Select a step from the list to configure it
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Confirm Workflow Button */}
      {workflow && workflow.getStepCount() > 0 && !isWorkflowConfirmed && !isExecuting && (
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>3. Confirm Workflow Steps</CardTitle>
            <CardDescription>
              Review and confirm all steps before execution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleConfirmWorkflow}
              size="lg"
              className="w-full"
            >
              <CheckCircle2 className="mr-2 h-5 w-5" />
              Confirm Workflow Configuration
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Workflow Overview Panel - Shows after confirmation */}
      {workflow && workflow.getStepCount() > 0 && isWorkflowConfirmed && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Overview</CardTitle>
            <CardDescription>
              Visual overview of all workflow steps and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WorkflowOverviewPanel
              workflow={workflow}
              workflowContext={workflowContext}
              onEditStep={handleEditStep}
              onRetryStep={handleRetryStep}
            />
          </CardContent>
        </Card>
      )}

      {/* Execution Controls */}
      {workflow && workflow.getStepCount() > 0 && isWorkflowConfirmed && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>4. Execute Workflow</CardTitle>
              <CardDescription>
                Run the workflow or control its execution
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ExecutionControlPanel
                isExecuting={isExecuting}
                workflowContext={workflowContext}
                onExecute={handleExecute}
                onCancel={handleCancel}
                onRetry={handleRetry}
              />
            </CardContent>
          </Card>

          {/* Execution Status */}
          {workflowContext && (
            <Card>
              <CardHeader>
                <CardTitle>Execution Results</CardTitle>
                <CardDescription>
                  View detailed results and download output files
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ExecutionStatusView
                  workflowContext={workflowContext}
                  workflow={workflow}
                />
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
