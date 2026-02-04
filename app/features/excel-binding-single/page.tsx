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
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { ColumnSelect } from "@/components/features/column-select";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import { excelApi } from "@/lib/api/excel";
import { Link, Plus, X } from "lucide-react";
import type { StandardResponse, DownloadUrlResponse } from "@/lib/api/types";

export default function ExcelBindingSinglePage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [bindFile, setBindFile] = useState<File | null>(null);
  const [comparisonColumn, setComparisonColumn] = useState("");
  const [bindColumns, setBindColumns] = useState<string[]>([""]);
  const [outputFilename, setOutputFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<StandardResponse<DownloadUrlResponse> | null>(null);

  // Fetch available columns from source file for comparison column
  const {
    columns: sourceColumns,
    loading: sourceColumnsLoading,
    error: sourceColumnsError,
  } = useFileColumns(sourceFile, "excel");

  // Fetch available columns from bind file for bind columns
  const {
    columns: bindFileColumns,
    loading: bindColumnsLoading,
    error: bindColumnsError,
  } = useFileColumns(bindFile, "excel");

  const handleSubmit = async () => {
    if (!sourceFile || !bindFile || !comparisonColumn) return;

    const validColumns = bindColumns.filter((col) => col.trim() !== "");
    if (validColumns.length === 0) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await excelApi.bindSingleKey({
        sourceFile,
        bindFile,
        comparisonColumn,
        bindColumns: validColumns,
        outputFilename: outputFilename || undefined,
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const addColumn = () => setBindColumns([...bindColumns, ""]);
  const removeColumn = (index: number) =>
    setBindColumns(bindColumns.filter((_, i) => i !== index));
  const updateColumn = (index: number, value: string) => {
    const newColumns = [...bindColumns];
    newColumns[index] = value;
    setBindColumns(newColumns);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Link className="h-8 w-8" />
          Single Key Excel Binding
        </h1>
        <p className="text-muted-foreground mt-2">
          Bind data from one Excel file to another using a single comparison
          column
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Binding</CardTitle>
          <CardDescription>
            Upload source and bind files, then configure the binding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source File</Label>
            <FileUpload
              accept=".xlsx,.xls"
              onChange={setSourceFile}
              value={sourceFile}
              label="Select Source Excel File"
            />
          </div>

          <div className="space-y-2">
            <Label>Bind File</Label>
            <FileUpload
              accept=".xlsx,.xls"
              onChange={setBindFile}
              value={bindFile}
              label="Select Bind Excel File"
            />
          </div>

          <div className="space-y-2">
            <ColumnSelect
              value={comparisonColumn}
              onChange={setComparisonColumn}
              columns={sourceColumns}
              loading={sourceColumnsLoading}
              error={sourceColumnsError}
              label="Comparison Column"
              placeholder="Select comparison column"
              id="comparison-column"
            />
            <p className="text-sm text-muted-foreground">
              The column name that exists in both files to match records
            </p>
          </div>

          <div className="space-y-2">
            <Label>Columns to Bind</Label>
            <div className="space-y-2">
              {bindColumns.map((column, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <ColumnSelect
                      value={column}
                      onChange={(value) => updateColumn(index, value)}
                      columns={bindFileColumns}
                      loading={bindColumnsLoading}
                      error={index === 0 ? bindColumnsError : null}
                      placeholder="Select column to bind"
                    />
                  </div>
                  {bindColumns.length > 1 && (
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
            <Label htmlFor="output-filename">Output Filename (Optional)</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="bound_single_key.xlsx"
            />
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!sourceFile || !bindFile || !comparisonColumn || loading}
          >
            {loading ? "Processing..." : "Bind Files"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Binding files..." />}

      {result && result.data && (
        <DownloadLink
          downloadUrl={result.data.download_url}
          title="Binding Complete"
          description="Your bound Excel file is ready to download"
        />
      )}
    </div>
  );
}
