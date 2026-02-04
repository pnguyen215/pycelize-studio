"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/features/file-upload";
import { CSVInfoDisplay } from "@/components/features/csv-info-display";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { csvApi } from "@/lib/api/csv";
import { FileText } from "lucide-react";

export default function CSVInfoPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await csvApi.getInfo(file);
      setResult(response);
    } catch (err) {
      // Error is handled by toast in API client
      console.error('Failed to get CSV info:', err);
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
          <Button 
            onClick={handleSubmit} 
            disabled={!file || loading}
          >
            {loading ? "Processing..." : "Get File Info"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Analyzing file..." />}

      {result && <CSVInfoDisplay data={result} />}
    </div>
  );
}
