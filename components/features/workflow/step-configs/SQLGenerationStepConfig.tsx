"use client";

import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ColumnSelect } from "@/components/features/column-select";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SQLGenerationStepConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
  inputFile: File | null;
}

export function SQLGenerationStepConfig({
  config,
  onChange,
  inputFile,
}: SQLGenerationStepConfigProps) {
  const [tableName, setTableName] = useState<string>(
    (config.tableName as string) || ""
  );
  const [databaseType, setDatabaseType] = useState<"postgresql" | "mysql" | "sqlite">(
    (config.databaseType as "postgresql" | "mysql" | "sqlite") || "postgresql"
  );
  const [selectedColumns, setSelectedColumns] = useState<string[]>(
    (config.columns as string[]) || []
  );
  const [removeDuplicates, setRemoveDuplicates] = useState<boolean>(
    (config.removeDuplicates as boolean) || false
  );

  // Fetch available columns
  const {
    columns: availableColumns,
    loading: columnsLoading,
  } = useFileColumns(inputFile, inputFile?.name.endsWith(".csv") ? "csv" : "excel");

  useEffect(() => {
    onChange({
      tableName,
      databaseType,
      columns: selectedColumns.length > 0 ? selectedColumns : undefined,
      removeDuplicates,
    });
  }, [tableName, databaseType, selectedColumns, removeDuplicates]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tableName">Table Name *</Label>
        <Input
          id="tableName"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
          placeholder="my_table"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Database Type *</Label>
        <Select
          value={databaseType}
          onValueChange={(value) => setDatabaseType(value as any)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="postgresql">PostgreSQL</SelectItem>
            <SelectItem value="mysql">MySQL</SelectItem>
            <SelectItem value="sqlite">SQLite</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Columns (Optional)</Label>
        <ColumnSelect
          columns={availableColumns}
          selectedColumns={selectedColumns}
          onChange={setSelectedColumns}
          loading={columnsLoading}
          placeholder="All columns (leave empty for all)"
        />
        <p className="text-xs text-muted-foreground">
          Leave empty to include all columns
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label htmlFor="removeDuplicates">Remove Duplicates</Label>
          <p className="text-xs text-muted-foreground">
            Remove duplicate rows before generating SQL
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
