"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MultiColumnInput } from "@/components/common/MultiColumnInput";
import { excelApi } from "@/lib/api/excel";
import { FileDown, Link } from "lucide-react";

export default function ExcelBindingSinglePage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [bindFile, setBindFile] = useState<File | null>(null);
  const [comparisonColumn, setComparisonColumn] = useState<string>("");
  const [bindColumns, setBindColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sourceFile || !bindFile || !comparisonColumn || bindColumns.length === 0) return;
    
    setLoading(true);
    setDownloadUrl(null);
    
    try {
      const blob = await excelApi.bindSingleKey({
        sourceFile,
        bindFile,
        comparisonColumn,
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
          <Link className="h-8 w-8" />
          Single Key Excel Binding
        </h1>
        <p className="text-muted-foreground mt-2">
          Bind data from one Excel file to another using a single comparison column
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Binding</CardTitle>
          <CardDescription>
            Upload source and bind files, then configure the binding
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

          <div className="space-y-2">
            <Label htmlFor="comparison-column">
              Comparison Column <span className="text-destructive">*</span>
            </Label>
            <Input
              id="comparison-column"
              placeholder="e.g., level_2"
              value={comparisonColumn}
              onChange={(e) => setComparisonColumn(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Column name used to match rows between files
            </p>
          </div>

          <MultiColumnInput
            value={bindColumns}
            onChange={setBindColumns}
            label="Columns to Bind"
            placeholder="Enter column name to bind (e.g., level_2_id)"
          />

          <Button 
            onClick={handleSubmit} 
            disabled={!sourceFile || !bindFile || !comparisonColumn || bindColumns.length === 0 || loading}
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
            <DownloadButton downloadUrl={downloadUrl} filename="bound_single_key.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
