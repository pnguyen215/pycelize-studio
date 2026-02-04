"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { excelApi } from "@/lib/api/excel";
import { Link2, Plus, X } from "lucide-react";
import type { StandardResponse, DownloadUrlData } from "@/lib/api/types";

export default function ExcelBindingMultiPage() {
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [bindFile, setBindFile] = useState<File | null>(null);
  const [comparisonColumns, setComparisonColumns] = useState<string[]>([""]);
  const [bindColumns, setBindColumns] = useState<string[]>([""]);
  const [outputFilename, setOutputFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StandardResponse<DownloadUrlData> | null>(null);

  const handleSubmit = async () => {
    if (!sourceFile || !bindFile) return;
    
    const validComparisonColumns = comparisonColumns.filter(col => col.trim() !== '');
    const validBindColumns = bindColumns.filter(col => col.trim() !== '');
    
    if (validComparisonColumns.length === 0 || validBindColumns.length === 0) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await excelApi.bindMultiKey({
        sourceFile,
        bindFile,
        comparisonColumns: validComparisonColumns,
        bindColumns: validBindColumns,
        outputFilename: outputFilename || undefined
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const addComparisonColumn = () => setComparisonColumns([...comparisonColumns, ""]);
  const removeComparisonColumn = (index: number) => setComparisonColumns(comparisonColumns.filter((_, i) => i !== index));
  const updateComparisonColumn = (index: number, value: string) => {
    const newColumns = [...comparisonColumns];
    newColumns[index] = value;
    setComparisonColumns(newColumns);
  };

  const addBindColumn = () => setBindColumns([...bindColumns, ""]);
  const removeBindColumn = (index: number) => setBindColumns(bindColumns.filter((_, i) => i !== index));
  const updateBindColumn = (index: number, value: string) => {
    const newColumns = [...bindColumns];
    newColumns[index] = value;
    setBindColumns(newColumns);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
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
          <CardTitle>Configure Binding</CardTitle>
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
            <Label>Comparison Columns</Label>
            <div className="space-y-2">
              {comparisonColumns.map((column, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={column}
                    onChange={(e) => updateComparisonColumn(index, e.target.value)}
                    placeholder="Column name"
                  />
                  {comparisonColumns.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeComparisonColumn(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addComparisonColumn}>
              <Plus className="mr-2 h-4 w-4" />
              Add Comparison Column
            </Button>
            <p className="text-sm text-muted-foreground">
              Multiple column names that exist in both files to match records
            </p>
          </div>

          <div className="space-y-2">
            <Label>Columns to Bind</Label>
            <div className="space-y-2">
              {bindColumns.map((column, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={column}
                    onChange={(e) => updateBindColumn(index, e.target.value)}
                    placeholder="Column name"
                  />
                  {bindColumns.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeBindColumn(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addBindColumn}>
              <Plus className="mr-2 h-4 w-4" />
              Add Bind Column
            </Button>
            <p className="text-sm text-muted-foreground">
              Columns from bind file to add to source file
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-filename">Output Filename (Optional)</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="bound_multi_key.xlsx"
            />
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

      {result && result.data && (
        <DownloadLink 
          downloadUrl={result.data.download_url}
          title="Binding Complete"
          description="Your bound Excel file is ready to download"
        />
      )}
    </div>
  );
}
