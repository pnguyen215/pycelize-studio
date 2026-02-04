"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/features/file-upload";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MetricCard } from "@/components/features/metric-card";
import { ColumnList } from "@/components/features/column-list";
import { excelApi } from "@/lib/api/excel";
import { FileText, FileSpreadsheet, Rows, Columns, Sheet } from "lucide-react";

interface ExcelInfoData {
  column_names: string[];
  columns: number;
  data_types: Record<string, string>;
  file_name: string;
  file_path: string;
  rows: number;
  sheets: string[];
}

export default function ExcelInfoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ExcelInfoData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await excelApi.getInfo(file);
      setResult(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <FileText className="h-8 w-8" />
          Excel File Information
        </h1>
        <p className="text-muted-foreground mt-2">
          Extract metadata and structure information from Excel files
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file (.xlsx, .xls) to view its information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={setFile}
            value={file}
            label="Select Excel File"
          />
          <Button 
            onClick={handleSubmit} 
            disabled={!file || loading}
          >
            {loading ? "Processing..." : "Get File Info"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Analyzing file..." />}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="space-y-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              title="Total Rows"
              value={result.rows.toLocaleString()}
              icon={Rows}
            />
            <MetricCard
              title="Total Columns"
              value={result.columns}
              icon={Columns}
            />
            <MetricCard
              title="Sheets"
              value={result.sheets.length}
              icon={Sheet}
            />
            <MetricCard
              title="File Name"
              value={result.file_name}
              icon={FileSpreadsheet}
            />
          </div>

          {/* Sheets List */}
          {result.sheets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Sheets</CardTitle>
                <CardDescription>Available sheets in this workbook</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {result.sheets.map((sheet, index) => (
                    <div
                      key={index}
                      className="px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm font-medium border border-primary/20"
                    >
                      {sheet}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Column List with Data Types */}
          <ColumnList
            columns={result.column_names}
            dataTypes={result.data_types}
            title={`Columns (${result.column_names.length})`}
            description="Click the copy button to copy column names"
          />
        </div>
      )}
    </div>
  );
}
