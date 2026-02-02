"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { ResultDisplay } from "@/components/features/result-display";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { excelApi } from "@/lib/api/excel";
import { Columns } from "lucide-react";

export default function ColumnExtractionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string>('["Column1", "Column2"]');
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const columnArray = JSON.parse(columns);
      if (!Array.isArray(columnArray)) {
        throw new Error("Columns must be a JSON array");
      }
      
      const response = await excelApi.extractColumns({
        file,
        columns: columnArray,
        removeDuplicates: false
      });
      setResult(response);
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
          <Columns className="h-8 w-8" />
          Column Extraction to JSON
        </h1>
        <p className="text-muted-foreground mt-2">
          Extract specific columns from Excel files and return as JSON
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file and specify which columns to extract
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
            <Label htmlFor="columns">Columns to Extract (JSON Array)</Label>
            <Textarea
              id="columns"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              placeholder='["Column1", "Column2"]'
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Enter column names as a JSON array
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || loading}
          >
            {loading ? "Processing..." : "Extract Columns"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Extracting columns..." />}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <ResultDisplay title="Extracted Data" data={result} />
      )}
    </div>
  );
}
