"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MappingStepConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  inputFile: File | null;
}

interface MappingRule {
  target: string;
  source: string;
  default: string;
}

export function MappingStepConfig({
  config,
  onChange,
  inputFile,
}: MappingStepConfigProps) {
  const [mappingRules, setMappingRules] = useState<MappingRule[]>(() => {
    const mapping = config.mapping as Record<string, { source: string; default?: string }> || {};
    return Object.entries(mapping).map(([target, value]) => ({
      target,
      source: value.source,
      default: value.default || "",
    }));
  });
  const [outputFilename, setOutputFilename] = useState<string>(
    (config.outputFilename as string) || ""
  );

  // Fetch available columns
  const {
    columns: availableColumns,
  } = useFileColumns(inputFile, inputFile?.name.endsWith(".csv") ? "csv" : "excel");

  useEffect(() => {
    const mapping: Record<string, { source: string; default?: string }> = {};
    mappingRules.forEach((rule) => {
      if (rule.target && rule.source) {
        mapping[rule.target] = {
          source: rule.source,
          default: rule.default || undefined,
        };
      }
    });

    onChange({
      mapping,
      outputFilename: outputFilename || undefined,
    });
  }, [mappingRules, outputFilename]);

  const addRule = () => {
    setMappingRules([...mappingRules, { target: "", source: "", default: "" }]);
  };

  const removeRule = (index: number) => {
    setMappingRules(mappingRules.filter((_, i) => i !== index));
  };

  const updateRule = (index: number, field: keyof MappingRule, value: string) => {
    const updated = [...mappingRules];
    updated[index] = { ...updated[index], [field]: value };
    setMappingRules(updated);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Label>Column Mappings</Label>
        <p className="text-xs text-muted-foreground">
          Map source columns to new target column names
        </p>
        
        {mappingRules.map((rule, index) => (
          <div key={index} className="flex gap-2 items-start p-3 border rounded-md">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Target column name"
                value={rule.target}
                onChange={(e) => updateRule(index, "target", e.target.value)}
              />
              
              <Select
                value={rule.source}
                onValueChange={(value) => updateRule(index, "source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source column..." />
                </SelectTrigger>
                <SelectContent>
                  {availableColumns.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Default value (optional)"
                value={rule.default}
                onChange={(e) => updateRule(index, "default", e.target.value)}
              />
            </div>

            <Button
              size="icon"
              variant="ghost"
              onClick={() => removeRule(index)}
              disabled={mappingRules.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}

        <Button onClick={addRule} variant="outline" size="sm" className="w-full">
          <Plus className="h-4 w-4 mr-2" />
          Add Mapping
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputFilename">Output Filename (Optional)</Label>
        <Input
          id="outputFilename"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value)}
          placeholder="mapped-output.xlsx"
        />
      </div>
    </div>
  );
}
