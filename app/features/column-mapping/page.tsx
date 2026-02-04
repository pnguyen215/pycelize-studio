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
import { excelApi } from "@/lib/api/excel";
import { FileDown, ArrowLeftRight } from "lucide-react";

export default function ColumnMappingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<string>('{\n  "NewColumn1": {"source": "OldColumn1"},\n  "NewColumn2": {"source": "OldColumn2", "default": "N/A"}\n}');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const mappingObject = JSON.parse(mapping);
      if (typeof mappingObject !== 'object') {
        throw new Error("Mapping must be a JSON object");
      }
      
      const response = await excelApi.mapColumns({
        file,
        mapping: mappingObject
      });
      
      setDownloadUrl(response.data.download_url);
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
          <ArrowLeftRight className="h-8 w-8" />
          Column Mapping
        </h1>
        <p className="text-muted-foreground mt-2">
          Map and rename columns in Excel files with optional default values
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file and specify the column mapping
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
            <Label htmlFor="mapping">Column Mapping (JSON Object)</Label>
            <Textarea
              id="mapping"
              value={mapping}
              onChange={(e) => setMapping(e.target.value)}
              placeholder='{"NewName": {"source": "OldName", "default": "value"}}'
              rows={8}
            />
            <p className="text-sm text-muted-foreground">
              Map new column names to source columns. Optional &quot;default&quot; value for missing data.
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || loading}
          >
            {loading ? "Processing..." : "Map Columns"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Mapping columns..." />}

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
              Your mapped file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton url={downloadUrl} filename="mapped_columns.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
