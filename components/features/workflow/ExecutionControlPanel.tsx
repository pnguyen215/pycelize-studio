"use client";

import { Button } from "@/components/ui/button";
import { Play, Square, RotateCcw } from "lucide-react";
import type { WorkflowContext } from "@/lib/workflow";

interface ExecutionControlPanelProps {
  isExecuting: boolean;
  workflowContext: WorkflowContext | null;
  onExecute: () => void;
  onCancel: () => void;
  onRetry: () => void;
}

export function ExecutionControlPanel({
  isExecuting,
  workflowContext,
  onExecute,
  onCancel,
  onRetry,
}: ExecutionControlPanelProps) {
  const canRetry =
    workflowContext?.getStatus() === "paused" ||
    workflowContext?.getStatus() === "failed";

  return (
    <div className="flex gap-4">
      {!isExecuting ? (
        <>
          <Button onClick={onExecute} size="lg" className="flex-1">
            <Play className="h-4 w-4 mr-2" />
            {workflowContext ? "Resume Workflow" : "Execute Workflow"}
          </Button>
          
          {canRetry && (
            <Button onClick={onRetry} size="lg" variant="outline" className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retry Failed Step
            </Button>
          )}
        </>
      ) : (
        <Button onClick={onCancel} size="lg" variant="destructive" className="flex-1">
          <Square className="h-4 w-4 mr-2" />
          Cancel Workflow
        </Button>
      )}
    </div>
  );
}
