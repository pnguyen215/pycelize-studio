"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Pause,
  RefreshCcw,
  X,
  Edit,
  Trash2,
  Download,
  Eye,
  Loader2,
  CheckCircle,
  XCircle,
  Circle,
  Ban,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getWorkflowById,
  updateWorkflowStatus,
  deleteWorkflow,
  type StoredWorkflow,
} from "@/lib/services/workflow-storage";
import { Workflow, WorkflowContext, WorkflowExecutor, StepFactory } from "@/lib/workflow";
import Link from "next/link";
import type { StepResult } from "@/lib/api/types";

interface WorkflowDetailPageProps {
  params: {
    id: string;
  };
}

export default function WorkflowDetailPage({ params }: WorkflowDetailPageProps) {
  const router = useRouter();
  const [storedWorkflow, setStoredWorkflow] = useState<StoredWorkflow | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [workflowContext, setWorkflowContext] = useState<WorkflowContext | null>(null);
  const [executor, setExecutor] = useState<WorkflowExecutor | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflow();
  }, [params.id]);

  const loadWorkflow = () => {
    const stored = getWorkflowById(params.id);
    
    if (!stored) {
      toast.error("Workflow not found");
      router.push("/features/workflows");
      return;
    }

    setStoredWorkflow(stored);

    // Create Workflow instance from config
    const wf = new Workflow(stored);
    const steps = stored.steps.map(stepConfig => StepFactory.createStep(stepConfig));
    wf.setSteps(steps);
    setWorkflow(wf);

    setLoading(false);
  };

  const handleExecute = useCallback(async () => {
    if (!workflow || !storedWorkflow) {
      toast.error("Workflow not available");
      return;
    }

    // For execution, we need the input file
    // Since we don't have it stored, we'll need to ask user to provide it
    toast.error("Please use Workflow Builder to execute workflows with files");
    return;
  }, [workflow, storedWorkflow]);

  const handleCancelStep = useCallback((stepIndex: number) => {
    if (!executor) {
      toast.error("No active execution");
      return;
    }

    executor.cancel();
    toast.info(`Workflow execution cancelled`);
  }, [executor]);

  const handleRetryStep = useCallback(async (stepIndex: number) => {
    if (!executor) {
      toast.error("No active executor");
      return;
    }

    setIsExecuting(true);
    try {
      await executor.retry(stepIndex);
    } catch (error) {
      console.error("Retry error:", error);
    }
  }, [executor]);

  const handleDelete = () => {
    if (deleteWorkflow(params.id)) {
      toast.success("Workflow deleted");
      router.push("/features/workflows");
    } else {
      toast.error("Failed to delete workflow");
    }
  };

  const getStepStatus = (stepId: string, stepIndex: number) => {
    if (!workflowContext) return "pending";
    
    const result = workflowContext.getStepResult(stepId);
    if (result) return result.status;
    
    const context = workflowContext.getContext();
    if (context?.status === "running" && stepIndex === context.currentStepIndex) {
      return "running";
    }
    
    return "pending";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case "failed":
        return <XCircle className="h-6 w-6 text-red-500" />;
      case "running":
        return <Loader2 className="h-6 w-6 text-blue-500 animate-spin" />;
      case "cancelled":
        return <Ban className="h-6 w-6 text-gray-500" />;
      default:
        return <Circle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-50 border-green-200";
      case "failed":
        return "bg-red-50 border-red-200";
      case "running":
        return "bg-blue-50 border-blue-200";
      case "cancelled":
        return "bg-gray-50 border-gray-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 max-w-7xl">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!storedWorkflow || !workflow) {
    return (
      <div className="container mx-auto p-8 max-w-7xl">
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Workflow Not Found</h3>
              <p className="text-muted-foreground mb-6">
                The workflow you are looking for does not exist or has been deleted.
              </p>
              <Link href="/features/workflows">
                <Button>Back to Workflows</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = workflow.getSteps();

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/features/workflows">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{storedWorkflow.name}</h1>
            <p className="text-muted-foreground mt-1">
              {storedWorkflow.description || "No description"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Workflow Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Workflow Information</CardTitle>
            <Badge className={
              storedWorkflow.status === "completed" ? "bg-green-100 text-green-700" :
              storedWorkflow.status === "failed" ? "bg-red-100 text-red-700" :
              storedWorkflow.status === "running" ? "bg-blue-100 text-blue-700" :
              ""
            }>
              {storedWorkflow.status || "draft"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Steps</p>
              <p className="font-semibold">{steps.length}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Created</p>
              <p className="font-semibold">
                {new Date(storedWorkflow.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-semibold">
                {new Date(storedWorkflow.updatedAt).toLocaleDateString()}
              </p>
            </div>
            {storedWorkflow.lastExecutionTime && (
              <div>
                <p className="text-muted-foreground">Last Execution</p>
                <p className="font-semibold">
                  {new Date(storedWorkflow.lastExecutionTime).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Visual Workflow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>
            Visual representation of workflow execution flow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, index) => {
              const status = getStepStatus(step.getId(), index);
              const result = workflowContext?.getStepResult(step.getId());
              const isCurrentStep = workflowContext?.getContext().currentStepIndex === index;

              return (
                <div key={step.getId()} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-7 top-16 w-0.5 h-8 bg-gray-300 z-0" />
                  )}

                  <Card className={`relative z-10 ${getStatusColor(status)} border-2 ${
                    isCurrentStep ? "ring-2 ring-blue-500 ring-offset-2" : ""
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="flex-shrink-0 mt-1">
                          {getStatusIcon(status)}
                        </div>

                        {/* Step Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold text-muted-foreground bg-white px-2 py-0.5 rounded">
                              STEP {index + 1}
                            </span>
                            {isCurrentStep && (
                              <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded animate-pulse">
                                PROCESSING
                              </span>
                            )}
                          </div>
                          
                          <h4 className="font-semibold text-base mb-1">{step.getName()}</h4>
                          <p className="text-sm text-muted-foreground capitalize">
                            {step.getType().replace(/-/g, " ")}
                          </p>

                          {/* Error Message */}
                          {status === "failed" && result?.error && (
                            <div className="mt-3 p-3 bg-red-100 border border-red-300 rounded-md">
                              <p className="text-sm font-medium text-red-700">
                                ⚠️ {result.error.message}
                              </p>
                            </div>
                          )}

                          {/* Success Message */}
                          {status === "success" && (
                            <div className="mt-2 text-sm text-green-700">
                              ✓ Completed successfully
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        {status === "failed" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRetryStep(index)}
                            >
                              <RefreshCcw className="h-3 w-3 mr-1" />
                              Retry
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancelStep(index)}
                            >
                              <X className="h-3 w-3 mr-1" />
                              Skip
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Note about execution */}
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900">
                Note: Direct execution from dashboard
              </p>
              <p className="text-sm text-amber-700 mt-1">
                To execute this workflow with a file, please use the{" "}
                <Link href="/features/workflow-builder" className="underline font-medium">
                  Workflow Builder
                </Link>
                {" "}page.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
