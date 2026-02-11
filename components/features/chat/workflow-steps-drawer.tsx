"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, XCircle, Clock, Loader2, Copy, Workflow, ChevronDown } from "lucide-react";
import { formatDate, copyToClipboard } from "@/lib/utils/chat-utils";
import { NotificationManager } from "@/lib/services/notification-manager";
import { JsonViewer } from "./json-viewer";
import type { WorkflowStep } from "@/lib/api/types";

interface WorkflowStepsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  steps: WorkflowStep[];
}

function StatusIcon({ status }: { status?: string }) {
  switch (status) {
    case "completed":
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case "pending":
      return <Clock className="h-5 w-5 text-yellow-500" />;
    case "failed":
      return <XCircle className="h-5 w-5 text-red-500" />;
    case "running":
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    default:
      return <Clock className="h-5 w-5 text-gray-500" />;
  }
}

export function WorkflowStepsDrawer({ open, onOpenChange, steps }: WorkflowStepsDrawerProps) {
  const handleCopyArguments = async (args: Record<string, unknown>) => {
    const success = await copyToClipboard(JSON.stringify(args, null, 2));
    if (success) {
      NotificationManager.success("Arguments copied to clipboard");
    } else {
      NotificationManager.error("Failed to copy arguments");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent className="fixed inset-y-0 right-0 left-auto mt-0 w-full max-w-xl rounded-l-[10px] rounded-r-none">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Steps ({steps?.length || 0})
          </DrawerTitle>
          <DrawerDescription>
            View workflow execution details and arguments
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="overflow-y-auto px-4 pb-4 flex-1">
          <div className="space-y-3">
            {steps && steps.length > 0 ? (
              steps.map((step, index) => (
                <Collapsible key={step.step_id || index}>
                  <div className="flex items-start gap-3 p-4 border rounded-lg bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <StatusIcon status={step.status} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
                        <h4 className="font-medium text-sm break-words">
                          Step {index + 1}: {step.operation}
                        </h4>
                        <Badge 
                          variant={
                            step.status === "completed" 
                              ? "default" 
                              : step.status === "failed" 
                              ? "destructive" 
                              : "secondary"
                          }
                          className="shrink-0"
                        >
                          {step.status || "unknown"}
                        </Badge>
                      </div>
                      
                      {step.progress !== undefined && step.progress < 100 && (
                        <div className="mb-2">
                          <Progress value={step.progress} className="h-2" />
                          <p className="text-xs text-gray-500 mt-1">{step.progress}% complete</p>
                        </div>
                      )}
                      
                      {step.completed_at && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 break-words">
                          Completed: {formatDate(step.completed_at)}
                        </p>
                      )}
                      
                      {step.output_file && (
                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 break-all">
                          Output: {step.output_file}
                        </p>
                      )}
                      
                      {step.error_message && (
                        <Alert variant="destructive" className="mb-2 py-2 px-3">
                          <p className="text-sm break-words">{step.error_message}</p>
                        </Alert>
                      )}
                      
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <CollapsibleTrigger asChild>
                          <Button size="sm" variant="outline">
                            <ChevronDown className="h-4 w-4 mr-1" />
                            View Arguments
                          </Button>
                        </CollapsibleTrigger>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleCopyArguments(step.arguments)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </Button>
                      </div>
                      
                      <CollapsibleContent>
                        <JsonViewer data={step.arguments} />
                      </CollapsibleContent>
                    </div>
                  </div>
                </Collapsible>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No workflow steps available
              </div>
            )}
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
