"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/features/file-upload";
import { ExcelInfoDisplay } from "@/components/features/excel-info-display";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { excelApi } from "@/lib/api/excel";
import { FileText } from "lucide-react";

export default function ExcelInfoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await excelApi.getInfo(file);
      setResult(response);
    } catch (err) {
      // Error is handled by toast in API client
      console.error('Failed to get Excel info:', err);
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

      {result && <ExcelInfoDisplay data={result} />}
    </div>
  );
}
