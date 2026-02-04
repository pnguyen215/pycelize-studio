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
import { jsonApi } from "@/lib/api/json";
import { FileDown, Braces } from "lucide-react";

export default function JSONGenerationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columnMapping, setColumnMapping] = useState<string>('{\n  "json_key": "excel_column"\n}');
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const mappingObject = JSON.parse(columnMapping);
      if (typeof mappingObject !== 'object') {
        throw new Error("Column mapping must be a JSON object");
      }
      
      const blob = await jsonApi.generateJSON({
        file,
        columnMapping: mappingObject,
        prettyPrint
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
          <Braces className="h-8 w-8" />
          Generate Standard JSON
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate JSON data from Excel files with column mapping
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file and configure JSON generation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={setFile}
            value={file}
            label="Select Excel File"
          />
          
          <div className="space-y-2">
            <Label htmlFor="columnMapping">Column Mapping (JSON Object)</Label>
            <Textarea
              id="columnMapping"
              value={columnMapping}
              onChange={(e) => setColumnMapping(e.target.value)}
              placeholder='{"json_key": "excel_column"}'
              rows={8}
            />
            <p className="text-sm text-muted-foreground">
              Map JSON keys to Excel column names
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="prettyPrint"
              checked={prettyPrint}
              onChange={(e) => setPrettyPrint(e.target.checked)}
              className="w-4 h-4"
            />
            <Label htmlFor="prettyPrint" className="cursor-pointer">
              Pretty Print JSON (formatted with indentation)
            </Label>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || loading}
          >
            {loading ? "Generating..." : "Generate JSON"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Generating JSON..." />}

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
              Your JSON file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton downloadUrl={downloadUrl} filename="output.json" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
