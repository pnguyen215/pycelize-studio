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
import { FileUpload } from "@/components/features/file-upload";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MetricCard } from "@/components/features/metric-card";
import { ColumnList } from "@/components/features/column-list";
import { csvApi } from "@/lib/api/csv";
import { FileText, Rows, Columns, FileSpreadsheet, Split } from "lucide-react";
import type { StandardResponse, CSVInfoResponse } from "@/lib/api/types";

export default function CSVInfoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<StandardResponse<CSVInfoResponse> | null>(null);

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await csvApi.getInfo(file);
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8" />
          CSV File Information
        </h1>
        <p className="text-muted-foreground mt-2">
          Extract metadata and structure information from CSV files
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>
            Upload a CSV file to view its information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept=".csv"
            onChange={setFile}
            value={file}
            label="Select CSV File"
          />
          <Button onClick={handleSubmit} disabled={!file || loading}>
            {loading ? "Processing..." : "Get File Info"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Analyzing file..." />}

      {result !== null && result.data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <MetricCard
              icon={Rows}
              title="Rows"
              value={result.data.rows.toLocaleString()}
              iconColor="text-blue-500"
            />
            <MetricCard
              icon={Columns}
              title="Columns"
              value={result.data.columns}
              iconColor="text-green-500"
            />
            <MetricCard
              icon={FileSpreadsheet}
              title="Filename"
              value={result.data.file_name}
              iconColor="text-purple-500"
            />
            <MetricCard
              icon={Split}
              title="Delimiter"
              value={result.data.delimiter}
              iconColor="text-orange-500"
            />
          </div>

          <ColumnList
            columns={result.data.column_names}
            dataTypes={result.data.data_types}
            title="Columns & Data Types"
          />
        </div>
      )}
    </div>
  );
}
