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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/features/file-upload";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MetricCard } from "@/components/features/metric-card";
import { CopyButton } from "@/components/features/copy-button";
import { DataTypeBadge } from "@/components/features/data-type-badge";
import { ColumnSelect } from "@/components/features/column-select";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import { excelApi } from "@/lib/api/excel";
import { Columns, X, Plus, Hash, Rows } from "lucide-react";
import type {
  StandardResponse,
  ColumnExtractionResponse,
} from "@/lib/api/types";

export default function ColumnExtractionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([""]);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<StandardResponse<ColumnExtractionResponse> | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch available columns from the uploaded file
  const {
    columns: availableColumns,
    loading: columnsLoading,
    error: columnsError,
  } = useFileColumns(file, "excel");

  const handleSubmit = async () => {
    if (!file) return;

    const validColumns = columns.filter((col) => col.trim() !== "");
    if (validColumns.length === 0) {
      setError("Please enter at least one column name");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await excelApi.extractColumns({
        file,
        columns: validColumns,
        removeDuplicates,
      });
      setResult(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Columns className="h-8 w-8" />
          Column Extraction to JSON
        </h1>
        <p className="text-muted-foreground mt-2">
          Extract specific columns from Excel files and return as JSON with
          statistics
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Extraction</CardTitle>
          <CardDescription>
            Upload an Excel file and specify which columns to extract
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
            <Label>Columns to Extract</Label>
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
                      placeholder="Select column to extract"
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

          <div className="flex items-center space-x-2">
            <Switch
              id="remove-duplicates"
              checked={removeDuplicates}
              onCheckedChange={setRemoveDuplicates}
            />
            <Label htmlFor="remove-duplicates">Remove Duplicates</Label>
          </div>

          <Button onClick={handleSubmit} disabled={!file || loading}>
            {loading ? "Processing..." : "Extract Columns"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Extracting columns..." />}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && result.data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <MetricCard
              icon={Rows}
              title="Rows Extracted"
              value={result?.data?.rows_extracted?.toLocaleString()}
              iconColor="text-blue-500"
            />
            <MetricCard
              icon={Hash}
              title="Total Rows"
              value={result.data.total_rows.toLocaleString()}
              iconColor="text-green-500"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Column Statistics</h3>
            {Object.entries(result.data.columns).map(([columnName, stats]) => (
              <Card key={columnName}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="font-mono text-lg">
                        {columnName}
                      </CardTitle>
                      <CopyButton text={columnName} />
                    </div>
                    <DataTypeBadge dataType={stats.data_type} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        Count:
                      </span>
                      <span className="font-semibold">
                        {stats.count.toLocaleString()}
                      </span>
                    </div>
                    {stats.sample_values && stats.sample_values.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">
                          Sample Values:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {stats.sample_values.slice(0, 5).map((value, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-muted px-2 py-1 rounded"
                            >
                              {String(value)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
