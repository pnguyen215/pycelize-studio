"use client";

import { Button } from "@/components/ui/button";
import { Plus, Trash2, CheckCircle2, Circle, XCircle, Loader2, Ban } from "lucide-react";
import { StepFactory } from "@/lib/workflow";
import type { Workflow } from "@/lib/workflow";
import type { WorkflowContext } from "@/lib/workflow";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

interface StepListPanelProps {
  workflow: Workflow;
  selectedStepIndex: number;
  onSelectStep: (index: number) => void;
  onAddStep: (stepType: string) => void;
  onRemoveStep: (stepId: string) => void;
  workflowContext?: WorkflowContext | null;
}

export function StepListPanel({
  workflow,
  selectedStepIndex,
  onSelectStep,
  onAddStep,
  onRemoveStep,
  workflowContext,
}: StepListPanelProps) {
  const [selectedStepType, setSelectedStepType] = useState<string>("");
  const steps = workflow.getSteps();
  const availableStepTypes = StepFactory.getAvailableStepTypes();

  const handleAddStep = () => {
    if (selectedStepType) {
      onAddStep(selectedStepType);
      setSelectedStepType("");
    }
  };

  const getStepStatus = (stepId: string) => {
    if (!workflowContext) return "pending";
    
    const result = workflowContext.getStepResult(stepId);
    return result?.status || "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "running":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "cancelled":
        return <Ban className="h-4 w-4 text-gray-500" />;
      default:
        return <Circle className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Add Step Section */}
      <div className="flex gap-2">
        <Select value={selectedStepType} onValueChange={setSelectedStepType}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Select step type..." />
          </SelectTrigger>
          <SelectContent>
            {availableStepTypes.map((stepType) => (
              <SelectItem key={stepType.type} value={stepType.type}>
                <div>
                  <div className="font-medium">{stepType.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {stepType.description}
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleAddStep}
          disabled={!selectedStepType}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Steps List */}
      <div className="space-y-2">
        {steps.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No steps added yet</p>
            <p className="text-sm">Add a step to get started</p>
          </div>
        ) : (
          steps.map((step, index) => {
            const status = getStepStatus(step.getId());
            const isSelected = index === selectedStepIndex;

            return (
              <div
                key={step.getId()}
                className={`flex items-center gap-2 p-3 rounded-md border cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => onSelectStep(index)}
              >
                <div className="flex-shrink-0">{getStatusIcon(status)}</div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  <p className="font-medium truncate">{step.getName()}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {step.getType().replace(/-/g, " ")}
                  </p>
                </div>

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveStep(step.getId());
                  }}
                  className="flex-shrink-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {steps.length > 0 && (
        <div className="text-xs text-muted-foreground pt-2 border-t">
          Total steps: {steps.length}
        </div>
      )}
    </div>
  );
}
