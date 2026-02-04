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
import { FileDown, Link2 } from "lucide-react";

export default function ExcelBindingMultiPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [bindFile, setBindFile] = useState<File | null>(null);
  const [comparisonColumns, setComparisonColumns] = useState<string>('["Column1", "Column2"]');
  const [bindColumns, setBindColumns] = useState<string>('["BindColumn1", "BindColumn2"]');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sourceFile || !bindFile) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const comparisonColumnsArray = JSON.parse(comparisonColumns);
      const bindColumnsArray = JSON.parse(bindColumns);
      
      if (!Array.isArray(comparisonColumnsArray) || !Array.isArray(bindColumnsArray)) {
        throw new Error("Both columns fields must be JSON arrays");
      }
      
      const blob = await excelApi.bindMultiKey({
        sourceFile,
        bindFile,
        comparisonColumns: comparisonColumnsArray,
        bindColumns: bindColumnsArray
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
          <Link2 className="h-8 w-8" />
          Multi Key Excel Binding
        </h1>
        <p className="text-muted-foreground mt-2">
          Bind data from one Excel file to another using multiple comparison columns
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel Files</CardTitle>
          <CardDescription>
            Upload source and bind files, then configure the multi-key binding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
            <Label htmlFor="comparisonColumns">Comparison Columns (JSON Array)</Label>
            <Textarea
              id="comparisonColumns"
              value={comparisonColumns}
              onChange={(e) => setComparisonColumns(e.target.value)}
              placeholder='["Column1", "Column2"]'
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Multiple column names that exist in both files to match records
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bindColumns">Columns to Bind (JSON Array)</Label>
            <Textarea
              id="bindColumns"
              value={bindColumns}
              onChange={(e) => setBindColumns(e.target.value)}
              placeholder='["BindColumn1", "BindColumn2"]'
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Columns from bind file to add to source file
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!sourceFile || !bindFile || loading}
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
            <DownloadButton downloadUrl={downloadUrl} filename="bound_multi_key.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
