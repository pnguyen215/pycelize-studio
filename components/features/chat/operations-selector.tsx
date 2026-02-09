"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { chatBotAPI } from "@/lib/api/chatbot";
import type { SupportedOperationsResponse } from "@/lib/api/types";
import { Loader2, Sparkles, ChevronRight } from "lucide-react";

interface OperationsSelectorProps {
  onSelectOperation?: (operation: string, endpoint: string) => void;
}

export function OperationsSelector({ onSelectOperation }: OperationsSelectorProps) {
  const [operations, setOperations] = useState<SupportedOperationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIntent, setSelectedIntent] = useState<string>("");
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>("");

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
    setSelectedEndpoint(""); // Reset endpoint selection
  };

  const handleSelectEndpoint = (endpoint: string) => {
    setSelectedEndpoint(endpoint);
    if (onSelectOperation) {
      onSelectOperation(selectedIntent, endpoint);
    }
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (!operations) {
    return null;
  }

  const intents = Object.keys(operations.operations);
  const endpoints = selectedIntent ? operations.operations[selectedIntent] || [] : [];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Supported Operations</h3>
        <Badge variant="secondary">{operations.total_intents} intents</Badge>
      </div>

      <div className="space-y-3">
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
                    <span className="capitalize">{intent.replace(/_/g, " ")}</span>
                    <Badge variant="outline" className="text-xs">
                      {operations.operations[intent].length}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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

        {selectedIntent && selectedEndpoint && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
            <div className="flex items-start gap-2">
              <ChevronRight className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Selected: {selectedIntent.replace(/_/g, " ")}
                </p>
                <p className="text-xs font-mono text-blue-700 dark:text-blue-300 mt-1">
                  {selectedEndpoint}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
