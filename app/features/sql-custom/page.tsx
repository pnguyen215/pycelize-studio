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
import { sqlApi } from "@/lib/api/sql";
import { FileDown, Code } from "lucide-react";

export default function SQLCustomPage() {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<string>('INSERT INTO table_name (col1, col2) VALUES ({col1}, {col2});');
  const [columnMapping, setColumnMapping] = useState<string>('{\n  "col1": "ExcelColumn1",\n  "col2": "ExcelColumn2"\n}');
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || !template) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const mappingObject = JSON.parse(columnMapping);
      if (typeof mappingObject !== 'object') {
        throw new Error("Column mapping must be a JSON object");
      }
      
      const blob = await sqlApi.generateCustomSQL({
        file,
        template,
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
          <Code className="h-8 w-8" />
          Generate Custom SQL
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate SQL statements using custom templates
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file and provide a custom SQL template
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
            <Label htmlFor="template">SQL Template</Label>
            <Textarea
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder="INSERT INTO table_name (col1, col2) VALUES ({col1}, {col2});"
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              Use {`{column_name}`} placeholders that will be replaced with actual values
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="columnMapping">Column Mapping (JSON Object)</Label>
            <Textarea
              id="columnMapping"
              value={columnMapping}
              onChange={(e) => setColumnMapping(e.target.value)}
              placeholder='{"placeholder": "ExcelColumn"}'
              rows={8}
            />
            <p className="text-sm text-muted-foreground">
              Map template placeholders to Excel column names
            </p>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || !template || loading}
          >
            {loading ? "Generating..." : "Generate Custom SQL"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Generating custom SQL..." />}

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
              Your custom SQL file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton url={downloadUrl} filename="custom_output.sql" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
