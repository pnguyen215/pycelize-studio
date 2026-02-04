"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { ResultDisplay } from "@/components/features/result-display";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MultiColumnInput } from "@/components/common/MultiColumnInput";
import { excelApi } from "@/lib/api/excel";
import { Columns } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

export default function ColumnExtractionPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    if (!file || columns.length === 0) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await excelApi.extractColumns({
        file,
        columns,
        removeDuplicates,
      });
      setResult(response);
    } catch (err) {
      // Error is handled by toast in API client
      console.error('Failed to extract columns:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
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
          <CardTitle>Configure Extraction</CardTitle>
          <CardDescription>
            Upload an Excel file and specify which columns to extract
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={setFile}
            value={file}
            label="Select Excel File"
          />
          
          <MultiColumnInput
            value={columns}
            onChange={setColumns}
            label="Columns to Extract"
            placeholder="Enter column name (e.g., Column1)"
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="remove-duplicates"
              checked={removeDuplicates}
              onCheckedChange={(checked) => setRemoveDuplicates(checked === true)}
            />
            <Label htmlFor="remove-duplicates" className="cursor-pointer">
              Remove duplicate values
            </Label>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || columns.length === 0 || loading}
          >
            {loading ? "Processing..." : "Extract Columns"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Extracting columns..." />}

      {result && (
        <ResultDisplay title="Extracted Data" data={result} />
      )}
    </div>
  );
}
