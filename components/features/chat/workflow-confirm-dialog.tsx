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
import { CheckCircle2, X } from "lucide-react";
import { useState } from "react";

interface WorkflowConfirmDialogProps {
  open: boolean;
  workflow: { steps: WorkflowStep[] } | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function WorkflowConfirmDialog({
  open,
  workflow,
  onConfirm,
  onCancel,
}: WorkflowConfirmDialogProps) {
  const [confirmedSteps, setConfirmedSteps] = useState<Set<number>>(new Set());
  
  if (!workflow) return null;

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

  const allConfirmed = confirmedSteps.size === workflow.steps.length;

  const handleConfirmAll = () => {
    if (allConfirmed) {
      onConfirm();
      setConfirmedSteps(new Set());
    }
  };

  const handleCancelAll = () => {
    setConfirmedSteps(new Set());
    onCancel();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) {
        setConfirmedSteps(new Set());
        onCancel();
      }
    }}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Workflow Operations</DialogTitle>
          <DialogDescription>
            Review and confirm each operation individually before executing the workflow.
            You must confirm all operations to proceed.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {workflow.steps.map((step, index) => {
            const isConfirmed = confirmedSteps.has(index);
            
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
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Arguments:
                      </p>
                      <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md overflow-x-auto">
                        {JSON.stringify(step.arguments, null, 2)}
                      </pre>
                    </div>

                    <div className="pt-2">
                      <Button
                        size="sm"
                        variant={isConfirmed ? "outline" : "default"}
                        onClick={() => handleConfirmStep(index)}
                        className="w-full"
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
            {confirmedSteps.size} of {workflow.steps.length} operations confirmed
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancelAll}>
              Cancel All
            </Button>
            <Button 
              onClick={handleConfirmAll}
              disabled={!allConfirmed}
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
