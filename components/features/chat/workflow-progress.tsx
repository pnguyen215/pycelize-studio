"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";
import { WorkflowProgress as WorkflowProgressType } from "@/lib/hooks/useChatBot";

interface WorkflowProgressProps {
  progress: WorkflowProgressType;
}

export function WorkflowProgress({ progress }: WorkflowProgressProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "bg-blue-500";
      case "completed":
        return "bg-green-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="p-4 border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
      <div className="flex items-start gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-blue-600 shrink-0 mt-0.5" />
        
        <div className="flex-1 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">
              {progress.operation}
            </span>
            <Badge variant="secondary" className={getStatusColor(progress.status)}>
              {progress.status}
            </Badge>
          </div>

          <Progress value={progress.progress} className="h-2" />

          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>{progress.message}</span>
            <span>{progress.progress}%</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
