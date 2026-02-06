"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { MultiColumnSelect } from "../MultiColumnSelect";
import { useFileColumns } from "@/lib/hooks/useFileColumns";

interface ExtractionStepConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  inputFile: File | null;
}

export function ExtractionStepConfig({
  config,
  onChange,
  inputFile,
}: ExtractionStepConfigProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    (config.columns as string[]) || [""]
  );
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(
    (config.removeDuplicates as boolean) || false
  );

  // Fetch available columns from the uploaded file
  const {
    columns: availableColumns,
    loading: columnsLoading,
  } = useFileColumns(inputFile, inputFile?.name.endsWith(".csv") ? "csv" : "excel");

  useEffect(() => {
    // Filter out empty columns before saving
    const validColumns = selectedColumns.filter(col => col.trim() !== "");
    onChange({
      columns: validColumns,
      removeDuplicates,
    });
  }, [selectedColumns, removeDuplicates]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Columns to Extract</Label>
        <MultiColumnSelect
          columns={availableColumns}
          selectedColumns={selectedColumns}
          onChange={setSelectedColumns}
          loading={columnsLoading}
          placeholder="Select column..."
        />
        <p className="text-xs text-muted-foreground">
          Select the columns you want to extract from the input file
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="removeDuplicates">Remove Duplicates</Label>
          <p className="text-xs text-muted-foreground">
            Remove duplicate rows from the extracted data
          </p>
        </div>
        <Switch
          id="removeDuplicates"
          checked={removeDuplicates}
          onCheckedChange={setRemoveDuplicates}
        />
      </div>
    </div>
  );
}
