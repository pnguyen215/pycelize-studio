"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { MultiColumnSelect } from "../MultiColumnSelect";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface JSONGenerationStepConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  inputFile: File | null;
}

export function JSONGenerationStepConfig({
  config,
  onChange,
  inputFile,
}: JSONGenerationStepConfigProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    (config.columns as string[]) || []
  );
  const [prettyPrint, setPrettyPrint] = useState<boolean>(
    (config.prettyPrint as boolean) !== false
  );
  const [nullHandling, setNullHandling] = useState<"include" | "exclude" | "default">(
    (config.nullHandling as "include" | "exclude" | "default") || "include"
  );
  const [arrayWrapper, setArrayWrapper] = useState<boolean>(
    (config.arrayWrapper as boolean) !== false
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
    const validColumns = selectedColumns.filter(col => col.trim() !== "");
    onChange({
      columns: validColumns.length > 0 ? validColumns : undefined,
      prettyPrint,
      nullHandling,
      arrayWrapper,
      outputFilename: outputFilename || undefined,
    });
  }, [selectedColumns, prettyPrint, nullHandling, arrayWrapper, outputFilename]);

  return (
    <div className="space-y-4">
      {selectedColumns.length > 0 && (
        <div className="space-y-2">
          <Label>Columns (Optional)</Label>
          <MultiColumnSelect
            columns={availableColumns}
            selectedColumns={selectedColumns}
            onChange={setSelectedColumns}
            loading={columnsLoading}
            placeholder="Select column..."
          />
          <p className="text-xs text-muted-foreground">
            Leave empty to include all columns
          </p>
        </div>
      )}

      {selectedColumns.length === 0 && (
        <div className="space-y-2">
          <Label>Columns</Label>
          <p className="text-sm text-muted-foreground">
            All columns will be included. Click below to specify columns.
          </p>
          <button
            type="button"
            onClick={() => setSelectedColumns([""])}
            className="text-sm text-primary hover:underline"
          >
            Specify columns
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="prettyPrint">Pretty Print</Label>
          <p className="text-xs text-muted-foreground">
            Format JSON with indentation
          </p>
        </div>
        <Switch
          id="prettyPrint"
          checked={prettyPrint}
          onCheckedChange={setPrettyPrint}
        />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="arrayWrapper">Array Wrapper</Label>
          <p className="text-xs text-muted-foreground">
            Wrap output in an array
          </p>
        </div>
        <Switch
          id="arrayWrapper"
          checked={arrayWrapper}
          onCheckedChange={setArrayWrapper}
        />
      </div>

      <div className="space-y-2">
        <Label>Null Handling</Label>
        <Select
          value={nullHandling}
          onValueChange={(value) => setNullHandling(value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="include">Include nulls</SelectItem>
            <SelectItem value="exclude">Exclude nulls</SelectItem>
            <SelectItem value="default">Use default values</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="outputFilename">Output Filename (Optional)</Label>
        <Input
          id="outputFilename"
          value={outputFilename}
          onChange={(e) => setOutputFilename(e.target.value)}
          placeholder="output.json"
        />
      </div>
    </div>
  );
}
