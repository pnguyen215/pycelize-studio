"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { WorkflowStep } from "@/lib/api/types";
import { CheckCircle2, X, Edit2 } from "lucide-react";
import { useState } from "react";

interface WorkflowConfirmDialogProps {
  open: boolean;
  workflow: { steps: WorkflowStep[] } | null;
  onConfirm: (modifiedWorkflow?: WorkflowStep[]) => void;
  onCancel: () => void;
}

export function WorkflowConfirmDialog({
  open,
  workflow,
  onConfirm,
  onCancel,
}: WorkflowConfirmDialogProps) {
  const [confirmedSteps, setConfirmedSteps] = useState<Set<number>>(new Set());
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [modifiedSteps, setModifiedSteps] = useState<WorkflowStep[]>([]);
  const [editedArguments, setEditedArguments] = useState<string>("");
  
  if (!workflow) return null;

  // Initialize modified steps from workflow
  const currentSteps = modifiedSteps.length > 0 ? modifiedSteps : workflow.steps;

  const handleConfirmStep = (index: number) => {
    setConfirmedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleEditStep = (index: number) => {
    setEditingStep(index);
    const step = currentSteps[index];
    setEditedArguments(JSON.stringify(step.arguments, null, 2));
  };

  const handleSaveEdit = () => {
    if (editingStep === null) return;
    
    try {
      const parsedArguments = JSON.parse(editedArguments);
      const newSteps = [...currentSteps];
      newSteps[editingStep] = {
        ...newSteps[editingStep],
        arguments: parsedArguments,
      };
      setModifiedSteps(newSteps);
      setEditingStep(null);
      setEditedArguments("");
    } catch (error) {
      console.error("Invalid JSON:", error);
      alert("Invalid JSON format. Please fix the syntax and try again.");
    }
  };

  const handleCancelEdit = () => {
    setEditingStep(null);
    setEditedArguments("");
  };

  const allConfirmed = confirmedSteps.size === currentSteps.length;

  const handleConfirmAll = () => {
    if (allConfirmed) {
      // Pass modified workflow only if changes were made
      const workflowToSend = modifiedSteps.length > 0 ? modifiedSteps : undefined;
      onConfirm(workflowToSend);
      setConfirmedSteps(new Set());
      setModifiedSteps([]);
    }
  };

  const handleCancelAll = () => {
    setConfirmedSteps(new Set());
    setModifiedSteps([]);
    setEditingStep(null);
    setEditedArguments("");
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setConfirmedSteps(new Set());
        setModifiedSteps([]);
        setEditingStep(null);
        setEditedArguments("");
        onCancel();
      }
    }}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Workflow Operations</DialogTitle>
          <DialogDescription>
            Review and confirm each operation individually before executing the workflow.
            You can edit operation arguments before confirmation.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {currentSteps.map((step, index) => {
            const isConfirmed = confirmedSteps.has(index);
            const isEditing = editingStep === index;
            
            return (
              <Card 
                key={index} 
                className={`p-4 border-2 transition-colors ${
                  isConfirmed 
                    ? 'border-green-500 bg-green-50 dark:bg-green-950/20' 
                    : 'border-gray-200 dark:border-gray-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                    isConfirmed 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-100 dark:bg-blue-900'
                  }`}>
                    {isConfirmed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{step.operation}</h4>
                      <Badge variant="secondary">Step {index + 1}</Badge>
                      {isConfirmed && (
                        <Badge variant="default" className="bg-green-500">
                          Confirmed
                        </Badge>
                      )}
                    </div>

                    {step.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {step.description}
                      </p>
                    )}

                    <Separator className="my-2" />

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                          Arguments:
                        </p>
                        {!isEditing && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditStep(index)}
                            className="h-6 px-2 text-xs"
                          >
                            <Edit2 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        )}
                      </div>
                      
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            value={editedArguments}
                            onChange={(e) => setEditedArguments(e.target.value)}
                            className="w-full h-32 text-xs font-mono bg-gray-100 dark:bg-gray-900 p-3 rounded-md border border-gray-300 dark:border-gray-700"
                            placeholder="Enter JSON arguments..."
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={handleSaveEdit}
                            >
                              Save Changes
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
                          {JSON.stringify(step.arguments, null, 2)}
                        </pre>
                      )}
                    </div>

                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant={isConfirmed ? "outline" : "default"}
                        onClick={() => handleConfirmStep(index)}
                        className="w-full"
                        disabled={isEditing}
                      >
                        {isConfirmed ? (
                          <>
                            <X className="h-4 w-4 mr-2" />
                            Revoke Confirmation
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Confirm This Operation
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {confirmedSteps.size} of {currentSteps.length} operations confirmed
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelAll}>
              Cancel All
            </Button>
            <Button 
              onClick={handleConfirmAll}
              disabled={!allConfirmed || editingStep !== null}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Execute Workflow
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
