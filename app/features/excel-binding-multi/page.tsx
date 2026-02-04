"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MultiColumnInput } from "@/components/common/MultiColumnInput";
import { excelApi } from "@/lib/api/excel";
import { FileDown, Link2 } from "lucide-react";

export default function ExcelBindingMultiPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [bindFile, setBindFile] = useState<File | null>(null);
  const [comparisonColumns, setComparisonColumns] = useState<string[]>([]);
  const [bindColumns, setBindColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sourceFile || !bindFile || comparisonColumns.length === 0 || bindColumns.length === 0) return;
    
    setLoading(true);
    setDownloadUrl(null);
    
    try {
      const blob = await excelApi.bindMultiKey({
        sourceFile,
        bindFile,
        comparisonColumns,
        bindColumns
      }) as unknown as Blob;
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      // Error is handled by toast in API client
      console.error('Failed to bind files:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Link2 className="h-8 w-8" />
          Multi Key Excel Binding
        </h1>
        <p className="text-muted-foreground mt-2">
          Bind data from one Excel file to another using multiple comparison columns
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Binding</CardTitle>
          <CardDescription>
            Upload source and bind files, then configure the multi-key binding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          <MultiColumnInput
            value={comparisonColumns}
            onChange={setComparisonColumns}
            label="Comparison Columns"
            placeholder="Enter column name for matching (e.g., first_name)"
          />

          <MultiColumnInput
            value={bindColumns}
            onChange={setBindColumns}
            label="Columns to Bind"
            placeholder="Enter column name to bind (e.g., level_2_id)"
          />

          <Button 
            onClick={handleSubmit} 
            disabled={!sourceFile || !bindFile || comparisonColumns.length === 0 || bindColumns.length === 0 || loading}
          >
            {loading ? "Processing..." : "Bind Files"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Binding files..." />}

      {downloadUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Download Ready
            </CardTitle>
            <CardDescription>
              Your bound file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton downloadUrl={downloadUrl} filename="bound_multi_key.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
