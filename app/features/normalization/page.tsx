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
import { normalizationApi } from "@/lib/api/normalization";
import { FileDown, Wand2 } from "lucide-react";

export default function NormalizationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [normalizations, setNormalizations] = useState<string>('[\n  {\n    "column_name": "Column1",\n    "normalization_type": "uppercase"\n  }\n]');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const normalizationsArray = JSON.parse(normalizations);
      if (!Array.isArray(normalizationsArray)) {
        throw new Error("Normalizations must be a JSON array");
      }
      
      const blob = await normalizationApi.normalize({
        file,
        normalizations: normalizationsArray
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
          <Wand2 className="h-8 w-8" />
          Data Normalization
        </h1>
        <p className="text-muted-foreground mt-2">
          Apply various normalization transformations to Excel data
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file and specify normalization rules
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
            <Label htmlFor="normalizations">Normalization Rules (JSON Array)</Label>
            <Textarea
              id="normalizations"
              value={normalizations}
              onChange={(e) => setNormalizations(e.target.value)}
              placeholder='[{"column_name": "Column1", "normalization_type": "uppercase"}]'
              rows={10}
            />
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Available normalization types:</p>
              <ul className="list-disc list-inside ml-2 space-y-1">
                <li><strong>uppercase</strong> - Convert text to uppercase</li>
                <li><strong>lowercase</strong> - Convert text to lowercase</li>
                <li><strong>trim</strong> - Remove leading/trailing whitespace</li>
                <li><strong>remove_duplicates</strong> - Remove duplicate values</li>
                <li><strong>normalize_whitespace</strong> - Normalize multiple spaces to single space</li>
                <li><strong>remove_special_chars</strong> - Remove special characters</li>
                <li><strong>title_case</strong> - Convert to title case</li>
              </ul>
            </div>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || loading}
          >
            {loading ? "Processing..." : "Apply Normalization"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Normalizing data..." />}

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
              Your normalized file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton downloadUrl={downloadUrl} filename="normalized.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
