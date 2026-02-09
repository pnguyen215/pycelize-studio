"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Copy, ChevronDown, ChevronRight, CheckCircle2, XCircle, Loader2, FileText } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { NotificationManager } from "@/lib/services/notification-manager";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WorkflowStep {
  step_id?: string;
  operation: string;
  status: string;
  progress?: number;
  output_file?: string;
  completed_at?: string;
  error_message?: string;
  arguments?: Record<string, unknown>;
}

interface WorkflowStepsProps {
  steps: WorkflowStep[];
}

export function WorkflowSteps({ steps }: WorkflowStepsProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [selectedArguments, setSelectedArguments] = useState<{
    index: number;
    args: Record<string, unknown>;
  } | null>(null);
  const { copyToClipboard } = useCopyToClipboard();

  if (!steps || steps.length === 0) {
    return null;
  }

  const toggleStep = (index: number) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  const handleCopyArguments = async (args: Record<string, unknown>) => {
    const success = await copyToClipboard(JSON.stringify(args, null, 2));
    if (success) {
      NotificationManager.success("Arguments copied!");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "failed":
      case "error":
        return <XCircle className="h-5 w-5 text-red-600" />;
      case "running":
      case "in_progress":
        return <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "success":
        return <Badge className="bg-green-600">Completed</Badge>;
      case "failed":
      case "error":
        return <Badge variant="destructive">Failed</Badge>;
      case "running":
      case "in_progress":
        return <Badge className="bg-blue-600">Running</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <>
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold">Workflow Steps</h3>
          <span className="text-sm text-gray-500">({steps.length})</span>
        </div>

        <div className="space-y-3">
          {steps.map((step, index) => {
            const isExpanded = expandedSteps.has(index);

            return (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-800 rounded-md overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleStep(index)}
                >
                  <button className="shrink-0">
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {getStatusIcon(step.status)}

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        Step {index + 1}:
                      </span>
                      <code className="text-sm text-blue-600 dark:text-blue-400 truncate">
                        {step.operation}
                      </code>
                    </div>
                  </div>

                  {getStatusBadge(step.status)}
                </div>

                {isExpanded && (
                  <div className="p-4 space-y-3 bg-white dark:bg-gray-950">
                    {step.progress !== undefined && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
                          Progress:
                        </span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{ width: `${step.progress}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{step.progress}%</span>
                      </div>
                    )}

                    {step.output_file && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-20 shrink-0">
                          Output:
                        </span>
                        <code className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded flex-1 break-all">
                          {step.output_file}
                        </code>
                      </div>
                    )}

                    {step.completed_at && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400 w-20">
                          Completed:
                        </span>
                        <span className="text-sm">
                          {new Date(step.completed_at).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {step.error_message && (
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-red-600 w-20 shrink-0">
                          Error:
                        </span>
                        <span className="text-sm text-red-600 flex-1">
                          {step.error_message}
                        </span>
                      </div>
                    )}

                    {step.arguments && Object.keys(step.arguments).length > 0 && (
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setSelectedArguments({ index, args: step.arguments! })
                          }
                        >
                          View Arguments
                        </Button>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCopyArguments(step.arguments!)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy Arguments</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Arguments JSON Viewer Dialog */}
      <Dialog
        open={!!selectedArguments}
        onOpenChange={() => setSelectedArguments(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>
              Workflow Arguments - Step {(selectedArguments?.index ?? 0) + 1}
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <div className="flex justify-end mb-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  selectedArguments &&
                  handleCopyArguments(selectedArguments.args)
                }
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy JSON
              </Button>
            </div>

            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md overflow-auto text-xs">
              <code className="language-json">
                {JSON.stringify(selectedArguments?.args, null, 2)}
              </code>
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
