"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chatBotAPI } from "@/lib/api/chatbot";
import type { SupportedOperationsResponse, WorkflowStep } from "@/lib/api/types";
import { Loader2, Sparkles, ChevronRight, Play, AlertCircle } from "lucide-react";
import { getOperationMetadata } from "@/lib/config/operations-metadata";
import { OperationFormFields } from "./operation-form-fields";

// Friendly names for operation intents
const INTENT_LABELS: Record<string, string> = {
  bind_data: "Bind Data",
  convert_format: "Convert Format",
  extract_columns: "Extract Columns",
  generate_json: "Generate JSON",
  generate_sql: "Generate SQL",
  map_columns: "Map Columns",
  normalize_data: "Normalize Data",
  search_filter: "Search Filter",
};

interface OperationsSelectorProps {
  onSelectOperation?: (operation: string, endpoint: string) => void;
  onApplyOperation?: (workflowStep: WorkflowStep) => void;
  chatId?: string;
}

export function OperationsSelector({ 
  onSelectOperation, 
  onApplyOperation,
  chatId 
}: OperationsSelectorProps) {
  const [operations, setOperations] = useState<SupportedOperationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntent, setSelectedIntent] = useState<string>("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isApplying, setIsApplying] = useState(false);

  useEffect(() => {
    loadOperations();
  }, []);

  const loadOperations = async () => {
    try {
      setLoading(true);
      const response = await chatBotAPI.getSupportedOperations();
      setOperations(response.data);
    } catch (error) {
      console.error("Error loading operations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectIntent = (intent: string) => {
    setSelectedIntent(intent);
    setSelectedEndpoint("");
    setFormValues({});
    setFormErrors({});
  };

  const handleSelectEndpoint = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    setFormValues({});
    setFormErrors({});
    
    // Initialize form values with defaults
    const metadata = getOperationMetadata(endpoint);
    if (metadata) {
      const initialValues: Record<string, any> = {};
      metadata.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          initialValues[field.name] = field.defaultValue;
        }
      });
      setFormValues(initialValues);
    }

    if (onSelectOperation) {
      onSelectOperation(selectedIntent, endpoint);
    }
  };

  const handleFieldChange = (name: string, value: any) => {
    setFormValues(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const metadata = getOperationMetadata(selectedEndpoint);
    if (!metadata) return false;

    const errors: Record<string, string> = {};

    metadata.fields.forEach(field => {
      const value = formValues[field.name];

      if (field.required && (value === undefined || value === null || value === '')) {
        errors[field.name] = `${field.label} is required`;
      }

      // Validate JSON fields
      if (field.type === 'json' && value) {
        try {
          JSON.parse(value);
        } catch (e) {
          errors[field.name] = 'Invalid JSON format';
        }
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleApply = async () => {
    if (!validateForm()) {
      return;
    }

    const metadata = getOperationMetadata(selectedEndpoint);
    if (!metadata) {
      return;
    }

    // Process form values
    const processedArguments: Record<string, any> = {};
    
    metadata.fields.forEach(field => {
      const value = formValues[field.name];
      
      if (value !== undefined && value !== null && value !== '') {
        // Parse JSON fields
        if (field.type === 'json') {
          try {
            processedArguments[field.name] = JSON.parse(value);
          } catch (e) {
            processedArguments[field.name] = value;
          }
        } 
        // Convert checkbox values to boolean
        else if (field.type === 'checkbox') {
          processedArguments[field.name] = value === true || value === 'true';
        }
        // Convert number fields
        else if (field.type === 'number') {
          processedArguments[field.name] = parseFloat(value);
        }
        else {
          processedArguments[field.name] = value;
        }
      }
    });

    // Build workflow step
    const workflowStep: WorkflowStep = {
      operation: selectedEndpoint,
      arguments: processedArguments,
      description: metadata.description,
    };

    if (onApplyOperation) {
      setIsApplying(true);
      try {
        await onApplyOperation(workflowStep);
      } finally {
        setIsApplying(false);
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </Card>
    );
  }

  if (!operations) {
    return null;
  }

  const intents = Object.keys(operations.operations);
  const endpoints = selectedIntent ? operations.operations[selectedIntent] || [] : [];
  const selectedMetadata = selectedEndpoint ? getOperationMetadata(selectedEndpoint) : null;
  const hasFields = selectedMetadata && selectedMetadata.fields.length > 0;
  const canApply = selectedEndpoint && (!hasFields || Object.keys(formValues).length > 0);

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Supported Operations</h3>
        <Badge variant="secondary">{operations.total_intents} intents</Badge>
      </div>

      <div className="space-y-4">
        {/* Select Operation Type */}
        <div>
          <label className="text-sm font-medium mb-2 block">
            Select Operation Type
          </label>
          <Select value={selectedIntent} onValueChange={handleSelectIntent}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an operation..." />
            </SelectTrigger>
            <SelectContent>
              {intents.map((intent) => (
                <SelectItem key={intent} value={intent}>
                  <div className="flex items-center gap-2">
                    <span>{INTENT_LABELS[intent] || intent.replace(/_/g, " ")}</span>
                    <Badge variant="outline" className="text-xs">
                      {operations.operations[intent].length}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Select Endpoint */}
        {selectedIntent && endpoints.length > 0 && (
          <div>
            <label className="text-sm font-medium mb-2 block">
              Select Endpoint
            </label>
            <Select value={selectedEndpoint} onValueChange={handleSelectEndpoint}>
              <SelectTrigger>
                <SelectValue placeholder="Choose an endpoint..." />
              </SelectTrigger>
              <SelectContent>
                {endpoints.map((endpoint) => (
                  <SelectItem key={endpoint} value={endpoint}>
                    <span className="font-mono text-xs">{endpoint}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Selected Operation Info */}
        {selectedIntent && selectedEndpoint && selectedMetadata && (
          <>
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
              <div className="flex items-start gap-2">
                <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    {selectedMetadata.name}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                    {selectedMetadata.description}
                  </p>
                  <p className="text-xs font-mono text-blue-600 dark:text-blue-400 mt-1">
                    {selectedEndpoint}
                  </p>
                </div>
              </div>
            </div>

            {/* File requirement notice */}
            {selectedMetadata.requiresFile && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This operation requires a file to be uploaded first.
                </AlertDescription>
              </Alert>
            )}

            {/* Dynamic Form Fields */}
            {hasFields && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium mb-3">Operation Parameters</h4>
                  <OperationFormFields
                    fields={selectedMetadata.fields}
                    values={formValues}
                    onChange={handleFieldChange}
                    errors={formErrors}
                  />
                </div>
              </>
            )}

            {/* Apply Button */}
            <Separator />
            <div className="flex justify-end">
              <Button
                onClick={handleApply}
                disabled={!canApply || isApplying || !chatId}
                className="w-full sm:w-auto"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Apply Operation
                  </>
                )}
              </Button>
            </div>

            {!chatId && (
              <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                Start a conversation to apply operations
              </p>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
