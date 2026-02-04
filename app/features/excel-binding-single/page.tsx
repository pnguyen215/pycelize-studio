"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { excelApi } from "@/lib/api/excel";
import { FileDown, Link } from "lucide-react";

export default function ExcelBindingSinglePage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [bindFile, setBindFile] = useState<File | null>(null);
  const [comparisonColumn, setComparisonColumn] = useState<string>("");
  const [bindColumns, setBindColumns] = useState<string>('["Column1", "Column2"]');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!sourceFile || !bindFile || !comparisonColumn) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const bindColumnsArray = JSON.parse(bindColumns);
      if (!Array.isArray(bindColumnsArray)) {
        throw new Error("Bind columns must be a JSON array");
      }
      
      const response = await excelApi.bindSingleKey({
        sourceFile,
        bindFile,
        comparisonColumn,
        bindColumns: bindColumnsArray
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
          <Link className="h-8 w-8" />
          Single Key Excel Binding
        </h1>
        <p className="text-muted-foreground mt-2">
          Bind data from one Excel file to another using a single comparison column
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel Files</CardTitle>
          <CardDescription>
            Upload source and bind files, then configure the binding
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
            <Label htmlFor="comparisonColumn">Comparison Column</Label>
            <Input
              id="comparisonColumn"
              value={comparisonColumn}
              onChange={(e) => setComparisonColumn(e.target.value)}
              placeholder="Column name to compare"
            />
            <p className="text-sm text-muted-foreground">
              The column name that exists in both files to match records
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bindColumns">Columns to Bind (JSON Array)</Label>
            <Textarea
              id="bindColumns"
              value={bindColumns}
              onChange={(e) => setBindColumns(e.target.value)}
              placeholder='["Column1", "Column2"]'
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Columns from bind file to add to source file
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!sourceFile || !bindFile || !comparisonColumn || loading}
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
            <DownloadButton url={downloadUrl} filename="bound_single_key.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
