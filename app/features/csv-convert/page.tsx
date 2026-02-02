"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { csvApi } from "@/lib/api/csv";
import { FileDown, RefreshCw } from "lucide-react";

export default function CSVConvertPage() {
  const [file, setFile] = useState<File | null>(null);
  const [outputFilename, setOutputFilename] = useState<string>("");
  const [delimiter, setDelimiter] = useState<string>(",");
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const blob = await csvApi.convertToExcel({
        file,
        outputFilename: outputFilename || undefined,
        delimiter: delimiter || undefined
      }) as unknown as Blob;
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <RefreshCw className="h-8 w-8" />
          CSV to Excel Conversion
        </h1>
        <p className="text-muted-foreground mt-2">
          Convert CSV files to Excel format with customizable delimiter
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
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
            <Label htmlFor="delimiter">Delimiter (Optional)</Label>
            <Input
              id="delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              placeholder=","
              maxLength={1}
            />
            <p className="text-sm text-muted-foreground">
              Default is comma (,). Can use tab, semicolon, etc.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="outputFilename">Output Filename (Optional)</Label>
            <Input
              id="outputFilename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="converted.xlsx"
            />
            <p className="text-sm text-muted-foreground">
              Leave empty for default filename
            </p>
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

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {downloadUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Download Ready
            </CardTitle>
            <CardDescription>
              Your converted Excel file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton url={downloadUrl} filename={outputFilename || "converted.xlsx"} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
