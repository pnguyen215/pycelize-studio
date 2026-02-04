"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { ColumnSelect } from "@/components/features/column-select";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import { sqlApi } from "@/lib/api/sql";
import { Code, Plus, X } from "lucide-react";
import type { StandardResponse, DownloadUrlResponse } from "@/lib/api/types";

export default function SQLCustomPage() {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState(
    "INSERT INTO table_name (col1, col2) VALUES ({col1}, {col2});"
  );
  const [columns, setColumns] = useState<string[]>([""]);
  const [columnMappings, setColumnMappings] = useState<
    Array<{ key: string; value: string }>
  >([{ key: "", value: "" }]);
  const [autoIncrementEnabled, setAutoIncrementEnabled] = useState(false);
  const [autoIncrementColumn, setAutoIncrementColumn] = useState("");
  const [incrementType, setIncrementType] = useState("");
  const [startValue, setStartValue] = useState("");
  const [sequenceName, setSequenceName] = useState("");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<StandardResponse<DownloadUrlResponse> | null>(null);

  // Fetch available columns from the uploaded file
  const {
    columns: availableColumns,
    loading: columnsLoading,
    error: columnsError,
  } = useFileColumns(file, "excel");

  const handleSubmit = async () => {
    if (!file || !template) return;

    setLoading(true);
    setResult(null);

    try {
      const validColumns = columns.filter((col) => col.trim() !== "");
      const validMappings = columnMappings.filter(
        (m) => m.key.trim() && m.value.trim()
      );
      const mappingObj: Record<string, string> = {};
      validMappings.forEach((m) => {
        mappingObj[m.key] = m.value;
      });

      const response = await sqlApi.generateCustomSQL({
        file,
        template,
        columns: validColumns.length > 0 ? validColumns : undefined,
        columnMapping: validMappings.length > 0 ? mappingObj : undefined,
        autoIncrement: autoIncrementEnabled
          ? {
              enabled: true,
              columnName: autoIncrementColumn,
              incrementType: incrementType || undefined,
              startValue: startValue ? parseInt(startValue) : undefined,
              sequenceName: sequenceName || undefined,
            }
          : undefined,
        removeDuplicates,
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const addColumn = () => setColumns([...columns, ""]);
  const removeColumn = (index: number) =>
    setColumns(columns.filter((_, i) => i !== index));
  const updateColumn = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    setColumns(newColumns);
  };

  const addMapping = () =>
    setColumnMappings([...columnMappings, { key: "", value: "" }]);
  const removeMapping = (index: number) =>
    setColumnMappings(columnMappings.filter((_, i) => i !== index));
  const updateMapping = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newMappings = [...columnMappings];
    newMappings[index][field] = value;
    setColumnMappings(newMappings);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Code className="h-8 w-8" />
          Generate Custom SQL
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate SQL statements using custom templates
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Custom SQL</CardTitle>
          <CardDescription>
            Upload an Excel file and provide a custom SQL template
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={setFile}
            value={file}
            label="Select Excel File"
          />

          <div className="space-y-2">
            <Label htmlFor="template">SQL Template</Label>
            <Textarea
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="INSERT INTO table_name (col1, col2) VALUES ({col1}, {col2});"
              rows={6}
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Use {`{column_name}`} placeholders that will be replaced with
              actual values
            </p>
          </div>

          <div className="space-y-2">
            <Label>Columns to Include (Optional)</Label>
            <div className="space-y-2">
              {columns.map((column, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <ColumnSelect
                      value={column}
                      onChange={(value) => updateColumn(index, value)}
                      columns={availableColumns}
                      loading={columnsLoading}
                      error={index === 0 ? columnsError : null}
                      placeholder="Select column"
                    />
                  </div>
                  {columns.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColumn(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addColumn}>
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Column Mapping (Optional)</Label>
            <div className="space-y-2">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={mapping.key}
                    onChange={(e) =>
                      updateMapping(index, "key", e.target.value)
                    }
                    placeholder="Template placeholder"
                  />
                  <span className="flex items-center px-2">→</span>
                  <div className="flex-1">
                    <ColumnSelect
                      value={mapping.value}
                      onChange={(value) => updateMapping(index, "value", value)}
                      columns={availableColumns}
                      loading={columnsLoading}
                      placeholder="Select Excel column"
                    />
                  </div>
                  {columnMappings.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMapping(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addMapping}>
              <Plus className="mr-2 h-4 w-4" />
              Add Mapping
            </Button>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-increment"
                checked={autoIncrementEnabled}
                onCheckedChange={setAutoIncrementEnabled}
              />
              <Label htmlFor="auto-increment">Enable Auto Increment</Label>
            </div>

            {autoIncrementEnabled && (
              <div className="space-y-4 pl-6 border-l-2">
                <div className="space-y-2">
                  <Label htmlFor="auto-column">Column Name</Label>
                  <Input
                    id="auto-column"
                    value={autoIncrementColumn}
                    onChange={(e) => setAutoIncrementColumn(e.target.value)}
                    placeholder="id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="increment-type">
                    Increment Type (Optional)
                  </Label>
                  <Input
                    id="increment-type"
                    value={incrementType}
                    onChange={(e) => setIncrementType(e.target.value)}
                    placeholder="IDENTITY, SERIAL, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="start-value">Start Value (Optional)</Label>
                  <Input
                    id="start-value"
                    type="number"
                    value={startValue}
                    onChange={(e) => setStartValue(e.target.value)}
                    placeholder="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sequence-name">
                    Sequence Name (Optional)
                  </Label>
                  <Input
                    id="sequence-name"
                    value={sequenceName}
                    onChange={(e) => setSequenceName(e.target.value)}
                    placeholder="my_seq"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="remove-duplicates"
              checked={removeDuplicates}
              onCheckedChange={setRemoveDuplicates}
            />
            <Label htmlFor="remove-duplicates">Remove Duplicates</Label>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!file || !template || loading}
          >
            {loading ? "Generating..." : "Generate Custom SQL"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Generating custom SQL..." />}

      {result && result.data && (
        <DownloadLink
          downloadUrl={result.data.download_url}
          title="Custom SQL Generated"
          description="Your custom SQL file is ready to download"
        />
      )}
    </div>
  );
}
