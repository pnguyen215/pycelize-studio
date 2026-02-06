"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Circle, Loader2, Ban, Download, Eye } from "lucide-react";
import type { WorkflowContext, Workflow } from "@/lib/workflow";
import type { StepResult } from "@/lib/api/types";
import { DownloadButton } from "@/components/features/download-button";
import { QuickViewDrawer } from "@/components/features/quick-view-drawer";
import { useState } from "react";

interface ExecutionStatusViewProps {
  workflowContext: WorkflowContext;
  workflow: Workflow;
}

export function ExecutionStatusView({
  workflowContext,
  workflow,
}: ExecutionStatusViewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const context = workflowContext.getContext();
  const steps = workflow.getSteps();
  const stepResults = workflowContext.getStepResults();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case "cancelled":
        return <Ban className="h-5 w-5 text-gray-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "border-green-500 bg-green-50";
      case "failed":
        return "border-red-500 bg-red-50";
      case "running":
        return "border-blue-500 bg-blue-50";
      case "cancelled":
        return "border-gray-500 bg-gray-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
  };

  const getWorkflowStatusBadge = () => {
    const status = context.status;
    const colors = {
      idle: "bg-gray-100 text-gray-700",
      running: "bg-blue-100 text-blue-700",
      paused: "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      failed: "bg-red-100 text-red-700",
      cancelled: "bg-gray-100 text-gray-700",
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Workflow Status Summary */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-md">
        <div>
          <p className="text-sm text-muted-foreground">Workflow Status</p>
          <p className="text-lg font-semibold">
            Step {context.currentStepIndex + 1} of {steps.length}
          </p>
        </div>
        {getWorkflowStatusBadge()}
      </div>

      {/* Step Results */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const result = stepResults.find((r) => r.stepId === step.getId());
          const status = result?.status || "pending";

          return (
            <Card
              key={step.getId()}
              className={`p-4 ${getStatusColor(status)} border-2 transition-all`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(status)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-muted-foreground">
                      Step {index + 1}
                    </span>
                  </div>
                  
                  <h4 className="font-medium">{step.getName()}</h4>
                  <p className="text-sm text-muted-foreground capitalize">
                    {step.getType().replace(/-/g, " ")}
                  </p>

                  {/* Result Details */}
                  {result && (
                    <div className="mt-3 space-y-2">
                      {result.status === "success" && result.output.downloadUrl && (
                        <div className="flex gap-2">
                          <DownloadButton
                            url={result.output.downloadUrl}
                            filename={result.output.fileName || "output"}
                            size="sm"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setPreviewUrl(result.output.downloadUrl || null)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                        </div>
                      )}

                      {result.status === "failed" && result.error && (
                        <div className="p-3 bg-red-100 border border-red-300 rounded-md">
                          <p className="text-sm font-medium text-red-700">
                            Error: {result.error.message}
                          </p>
                          {result.error.details && (
                            <p className="text-xs text-red-600 mt-1">
                              {result.error.details}
                            </p>
                          )}
                        </div>
                      )}

                      {result.metadata && Object.keys(result.metadata).length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          <details>
                            <summary className="cursor-pointer hover:underline">
                              View metadata
                            </summary>
                            <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-auto">
                              {JSON.stringify(result.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}

                      <p className="text-xs text-muted-foreground">
                        Executed at: {new Date(result.executedAt).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Final Output */}
      {context.status === "completed" && context.currentFileUrl && (
        <Card className="p-4 bg-green-50 border-2 border-green-500">
          <h4 className="font-medium mb-2">Workflow Complete! 🎉</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Your processed file is ready for download
          </p>
          <div className="flex gap-2">
            <DownloadButton
              url={context.currentFileUrl}
              filename="workflow-output"
            />
            <Button
              variant="outline"
              onClick={() => setPreviewUrl(context.currentFileUrl || null)}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview Result
            </Button>
          </div>
        </Card>
      )}

      {/* Quick View Drawer */}
      {previewUrl && (
        <QuickViewDrawer
          url={previewUrl}
          onClose={() => setPreviewUrl(null)}
        />
      )}
    </div>
  );
}
