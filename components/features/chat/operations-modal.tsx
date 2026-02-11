"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OperationsSelector } from "./operations-selector";
import type { WorkflowStep } from "@/lib/api/types";

interface OperationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOperation?: (operation: string, endpoint: string) => void;
  onApplyOperation?: (workflowStep: WorkflowStep) => void;
  chatId?: string;
}

export function OperationsModal({
  open,
  onOpenChange,
  onSelectOperation,
  onApplyOperation,
  chatId,
}: OperationsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Supported Operations</DialogTitle>
          <DialogDescription>
            Select an operation, configure its parameters, and apply it to your workflow
          </DialogDescription>
        </DialogHeader>
        <OperationsSelector 
          onSelectOperation={onSelectOperation} 
          onApplyOperation={onApplyOperation}
          chatId={chatId}
        />
      </DialogContent>
    </Dialog>
  );
}
