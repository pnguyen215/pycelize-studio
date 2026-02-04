"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { csvApi } from "@/lib/api/csv";
import { RefreshCw } from "lucide-react";
import type { StandardResponse, DownloadUrlData } from "@/lib/api/types";

export default function CSVConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState("");
  const [outputFilename, setOutputFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StandardResponse<DownloadUrlData> | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await csvApi.convertToExcel({
        file,
        sheetName: sheetName || undefined,
        outputFilename: outputFilename || undefined
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <RefreshCw className="h-8 w-8" />
          CSV to Excel Conversion
        </h1>
        <p className="text-muted-foreground mt-2">
          Convert CSV files to Excel format with customizable options
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Conversion</CardTitle>
          <CardDescription>
            Upload a CSV file and configure conversion options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept=".csv"
            onChange={setFile}
            value={file}
            label="Select CSV File"
          />
          
          <div className="space-y-2">
            <Label htmlFor="sheet-name">Sheet Name (Optional)</Label>
            <Input
              id="sheet-name"
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              placeholder="Sheet1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-filename">Output Filename (Optional)</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="converted.xlsx"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || loading}
          >
            {loading ? "Converting..." : "Convert to Excel"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Converting file..." />}

      {result && result.data && (
        <DownloadLink 
          downloadUrl={result.data.download_url}
          title="Conversion Complete"
          description="Your Excel file is ready to download"
        />
      )}
    </div>
  );
}
