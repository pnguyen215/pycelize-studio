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
import { DownloadLink } from "@/components/features/download-link";
import { ColumnSelect } from "@/components/features/column-select";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import { excelApi } from "@/lib/api/excel";
import { Columns, X, Plus } from "lucide-react";
import type { StandardResponse, DownloadUrlResponse } from "@/lib/api/types";

export default function ColumnExtractionFilePage() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([""]);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<StandardResponse<DownloadUrlResponse> | null>(null);
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
      const response = await excelApi.extractColumnsToFile({
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
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Columns className="h-8 w-8" />
          Column Extraction to File
        </h1>
        <p className="text-muted-foreground mt-2">
          Extract specific columns from Excel files and download as a new Excel
          file
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
        <DownloadLink
          downloadUrl={result.data.download_url}
          filename="extracted_columns.xlsx"
        />
      )}
    </div>
  );
}
