"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { ColumnSelect } from "@/components/features/column-select";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface NormalizationStepConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  inputFile: File | null;
}

interface NormalizationRule {
  column_name: string;
  normalization_type: string;
}

const NORMALIZATION_TYPES = [
  { value: "trim", label: "Trim Whitespace" },
  { value: "lowercase", label: "Lowercase" },
  { value: "uppercase", label: "Uppercase" },
  { value: "title_case", label: "Title Case" },
  { value: "remove_special_chars", label: "Remove Special Characters" },
  { value: "remove_numbers", label: "Remove Numbers" },
  { value: "normalize_phone", label: "Normalize Phone Number" },
  { value: "normalize_email", label: "Normalize Email" },
];

export function NormalizationStepConfig({
  config,
  onChange,
  inputFile,
}: NormalizationStepConfigProps) {
  const [normalizations, setNormalizations] = useState<NormalizationRule[]>(
    (config.normalizations as NormalizationRule[]) || [
      { column_name: "", normalization_type: "" },
    ]
  );
  const [outputFilename, setOutputFilename] = useState<string>(
    (config.outputFilename as string) || ""
  );

  // Fetch available columns
  const {
    columns: availableColumns,
    loading: columnsLoading,
  } = useFileColumns(inputFile, inputFile?.name.endsWith(".csv") ? "csv" : "excel");

  useEffect(() => {
    onChange({
      normalizations,
      outputFilename: outputFilename || undefined,
    });
  }, [normalizations, outputFilename]);

  const addRule = () => {
    setNormalizations([
      ...normalizations,
      { column_name: "", normalization_type: "" },
    ]);
  };

  const removeRule = (index: number) => {
    setNormalizations(normalizations.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof NormalizationRule, value: string) => {
    const updated = [...normalizations];
    updated[index] = { ...updated[index], [field]: value };
    setNormalizations(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Normalization Rules</Label>
        {normalizations.map((rule, index) => (
          <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
            <div className="flex-1 space-y-2">
              <Select
                value={rule.column_name}
                onValueChange={(value) => updateRule(index, "column_name", value)}
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
                value={rule.normalization_type}
                onValueChange={(value) =>
                  updateRule(index, "normalization_type", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select normalization type..." />
                </SelectTrigger>
                <SelectContent>
                  {NORMALIZATION_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeRule(index)}
              disabled={normalizations.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button onClick={addRule} variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputFilename">Output Filename (Optional)</Label>
        <Input
          id="outputFilename"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value)}
          placeholder="normalized-output.xlsx"
        />
      </div>
    </div>
  );
}
