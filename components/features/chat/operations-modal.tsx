"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { OperationsSelector } from "./operations-selector";

interface OperationsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectOperation?: (operation: string, endpoint: string) => void;
}

export function OperationsModal({
  open,
  onOpenChange,
  onSelectOperation,
}: OperationsModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Supported Operations</DialogTitle>
          <DialogDescription>
            Select an operation to learn more or use it in your workflow
          </DialogDescription>
        </DialogHeader>
        <OperationsSelector onSelectOperation={onSelectOperation} />
      </DialogContent>
    </Dialog>
  );
}
