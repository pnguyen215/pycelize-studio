"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  XCircle, 
  Circle, 
  Loader2, 
  Ban,
  ArrowRight,
  Edit,
  RotateCcw,
  AlertCircle
} from "lucide-react";
import type { Workflow, WorkflowContext } from "@/lib/workflow";

interface WorkflowOverviewPanelProps {
  workflow: Workflow;
  workflowContext: WorkflowContext | null;
  onEditStep: (stepIndex: number) => void;
  onRetryStep: (stepIndex: number) => void;
}

export function WorkflowOverviewPanel({
  workflow,
  workflowContext,
  onEditStep,
  onRetryStep,
}: WorkflowOverviewPanelProps) {
  const steps = workflow.getSteps();
  const context = workflowContext?.getContext();
  const currentStepIndex = context?.currentStepIndex ?? -1;

  const getStepStatus = (stepId: string, stepIndex: number) => {
    if (!workflowContext) return "pending";
    
    const result = workflowContext.getStepResult(stepId);
    if (result) return result.status;
    
    // If workflow is running and this is the current step
    if (context?.status === "running" && stepIndex === currentStepIndex) {
      return "running";
    }
    
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "running":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case "cancelled":
        return <Ban className="h-6 w-6 text-gray-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      case "running":
        return "bg-blue-50 border-blue-200";
      case "cancelled":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (steps.length === 0) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">
          No steps configured yet. Add steps to see the workflow overview.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground mb-4">
        Workflow Progress: {currentStepIndex + 1} / {steps.length} steps
      </div>
      
      {steps.map((step, index) => {
        const status = getStepStatus(step.getId(), index);
        const result = workflowContext?.getStepResult(step.getId());
        const isCurrentStep = index === currentStepIndex && context?.status === "running";

        return (
          <div key={step.getId()} className="relative">
            {/* Connector line to next step */}
            {index < steps.length - 1 && (
              <div className="absolute left-7 top-16 w-0.5 h-8 bg-gray-300 z-0" />
            )}
            
            <Card className={`relative z-10 ${getStatusColor(status)} border-2 transition-all ${
              isCurrentStep ? "ring-2 ring-blue-500 ring-offset-2" : ""
            }`}>
              <div className="p-4">
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {getStatusIcon(status)}
                  </div>

                  {/* Step Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-muted-foreground bg-white px-2 py-0.5 rounded">
                        STEP {index + 1}
                      </span>
                      {isCurrentStep && (
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded animate-pulse">
                          PROCESSING
                        </span>
                      )}
                    </div>
                    
                    <h4 className="font-semibold text-base mb-1">{step.getName()}</h4>
                    <p className="text-sm text-muted-foreground capitalize">
                      {step.getType().replace(/-/g, " ")}
                    </p>

                    {/* Error Message */}
                    {status === "failed" && result?.error && (
                      <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-md">
                        <p className="text-sm font-medium text-red-700">
                          ⚠️ {result.error.message}
                        </p>
                      </div>
                    )}

                    {/* Success Message */}
                    {status === "success" && (
                      <div className="mt-2 text-sm text-green-700">
                        ✓ Completed successfully
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {status === "failed" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRetryStep(index)}
                          className="text-xs"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Retry
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onEditStep(index)}
                          className="text-xs"
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </>
                    )}
                    {(status === "pending" || status === "success") && !isCurrentStep && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditStep(index)}
                        className="text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    )}
                  </div>
                </div>

                {/* Arrow to next step */}
                {index < steps.length - 1 && (
                  <div className="mt-2 ml-7 flex items-center text-xs text-muted-foreground">
                    <ArrowRight className="h-4 w-4 mr-1" />
                    <span>Passes output to next step</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}
