"use client";

import { useState } from "react";
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CheckCircle2, XCircle, Clock, Loader2, Copy, Workflow, ChevronDown } from "lucide-react";
import { formatDate, copyToClipboard } from "@/lib/utils/chat-utils";
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
  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const [copiedArgIndex, setCopiedArgIndex] = useState<number | null>(null);

  const handleCopyStepId = async (stepId: string) => {
    const success = await copyToClipboard(stepId);
    if (success) {
      setCopiedStepId(stepId);
      setTimeout(() => setCopiedStepId(null), 2000);
    }
  };

  const handleCopyArguments = async (args: Record<string, unknown>, index: number) => {
    const success = await copyToClipboard(JSON.stringify(args, null, 2));
    if (success) {
      setCopiedArgIndex(index);
      setTimeout(() => setCopiedArgIndex(null), 2000);
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
                      
                      {step.step_id && (
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-mono truncate">
                            ID: {step.step_id}
                          </p>
                          <TooltipProvider>
                            <Tooltip open={copiedStepId === step.step_id}>
                              <TooltipTrigger asChild>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  onClick={() => handleCopyStepId(step.step_id!)}
                                  className="h-6 w-6 p-0 cursor-pointer"
                                  title="Copy step ID"
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copied!</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      )}
                      
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
                        <TooltipProvider>
                          <Tooltip open={copiedArgIndex === index}>
                            <TooltipTrigger asChild>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                onClick={() => handleCopyArguments(step.arguments, index)}
                                className="cursor-pointer"
                              >
                                <Copy className="h-4 w-4 mr-1" />
                                Copy
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Copied!</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
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
