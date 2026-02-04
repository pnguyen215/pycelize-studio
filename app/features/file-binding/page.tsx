"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { fileApi } from "@/lib/api/files";
import { FileDown, Link } from "lucide-react";

export default function FileBindingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [bindingFile, setBindingFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<string>('{\n  "source_column": "bind_column"\n}');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || !bindingFile) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const mappingObject = JSON.parse(columnMapping);
      if (typeof mappingObject !== 'object') {
        throw new Error("Column mapping must be a JSON object");
      }
      
      const blob = await fileApi.bindFiles({
        file,
        bindingFile,
        columnMapping: mappingObject
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
          <Link className="h-8 w-8" />
          File Binding with Mapping
        </h1>
        <p className="text-muted-foreground mt-2">
          Bind two files together using column mapping configuration
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Upload both files and specify the column mapping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Source File</Label>
            <FileUpload
              accept=".xlsx,.xls,.csv"
              onChange={setFile}
              value={file}
              label="Select Source File"
            />
          </div>

          <div className="space-y-2">
            <Label>Binding File</Label>
            <FileUpload
              accept=".xlsx,.xls,.csv"
              onChange={setBindingFile}
              value={bindingFile}
              label="Select Binding File"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="columnMapping">Column Mapping (JSON Object)</Label>
            <Textarea
              id="columnMapping"
              value={columnMapping}
              onChange={(e) => setColumnMapping(e.target.value)}
              placeholder='{"source_column": "bind_column"}'
              rows={8}
            />
            <p className="text-sm text-muted-foreground">
              Map source file columns to binding file columns for matching records
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || !bindingFile || loading}
          >
            {loading ? "Processing..." : "Bind Files"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Binding files..." />}

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
              Your bound file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton downloadUrl={downloadUrl} filename="bound_files.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
