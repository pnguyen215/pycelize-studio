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
import { CheckCircle2 } from "lucide-react";

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
  if (!workflow) return null;

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Confirm Workflow Execution</DialogTitle>
          <DialogDescription>
            Review the workflow steps below and confirm to proceed with execution.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {workflow.steps.map((step, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                    {index + 1}
                  </span>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{step.operation}</h4>
                    <Badge variant="secondary">Step {index + 1}</Badge>
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
                </div>
              </div>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirm & Execute
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
