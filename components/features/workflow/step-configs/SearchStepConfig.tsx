"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import type { SearchCondition } from "@/lib/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SearchStepConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  inputFile: File | null;
}

const OPERATORS = [
  { value: "equals", label: "Equals" },
  { value: "not_equals", label: "Not Equals" },
  { value: "contains", label: "Contains" },
  { value: "not_contains", label: "Not Contains" },
  { value: "starts_with", label: "Starts With" },
  { value: "ends_with", label: "Ends With" },
  { value: "greater_than", label: "Greater Than" },
  { value: "less_than", label: "Less Than" },
  { value: "is_empty", label: "Is Empty" },
  { value: "is_not_empty", label: "Is Not Empty" },
];

export function SearchStepConfig({
  config,
  onChange,
  inputFile,
}: SearchStepConfigProps) {
  const [conditions, setConditions] = useState<SearchCondition[]>(
    (config.conditions as SearchCondition[]) || [
      { column: "", operator: "equals", value: "" },
    ]
  );
  const [logic, setLogic] = useState<"AND" | "OR">(
    (config.logic as "AND" | "OR") || "AND"
  );
  const [outputFormat, setOutputFormat] = useState<"xlsx" | "csv" | "json">(
    (config.outputFormat as "xlsx" | "csv" | "json") || "xlsx"
  );
  const [outputFilename, setOutputFilename] = useState<string>(
    (config.outputFilename as string) || ""
  );

  // Fetch available columns
  const {
    columns: availableColumns,
  } = useFileColumns(inputFile, inputFile?.name.endsWith(".csv") ? "csv" : "excel");

  useEffect(() => {
    onChange({
      conditions,
      logic,
      outputFormat,
      outputFilename: outputFilename || undefined,
    });
  }, [conditions, logic, outputFormat, outputFilename]);

  const addCondition = () => {
    setConditions([...conditions, { column: "", operator: "equals", value: "" }]);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const updateCondition = (
    index: number,
    field: keyof SearchCondition,
    value: string
  ) => {
    const updated = [...conditions];
    updated[index] = { ...updated[index], [field]: value };
    setConditions(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Search Conditions</Label>
        
        {conditions.map((condition, index) => (
          <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
            <div className="flex-1 space-y-2">
              <Select
                value={condition.column}
                onValueChange={(value) => updateCondition(index, "column", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column..." />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={condition.operator}
                onValueChange={(value) => updateCondition(index, "operator", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select operator..." />
                </SelectTrigger>
                <SelectContent>
                  {OPERATORS.map((op) => (
                    <SelectItem key={op.value} value={op.value}>
                      {op.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {!["is_empty", "is_not_empty"].includes(condition.operator) && (
                <Input
                  placeholder="Value"
                  value={condition.value as string}
                  onChange={(e) =>
                    updateCondition(index, "value", e.target.value)
                  }
                />
              )}
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeCondition(index)}
              disabled={conditions.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button onClick={addCondition} variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Condition
        </Button>
      </div>

      <div className="space-y-2">
        <Label>Logic Operator</Label>
        <Select value={logic} onValueChange={(value) => setLogic(value as "AND" | "OR")}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AND">AND (All conditions must match)</SelectItem>
            <SelectItem value="OR">OR (Any condition must match)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Output Format</Label>
        <Select
          value={outputFormat}
          onValueChange={(value) => setOutputFormat(value as "xlsx" | "csv" | "json")}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
            <SelectItem value="csv">CSV (.csv)</SelectItem>
            <SelectItem value="json">JSON (.json)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputFilename">Output Filename (Optional)</Label>
        <Input
          id="outputFilename"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value)}
          placeholder="filtered-output.xlsx"
        />
      </div>
    </div>
  );
}
