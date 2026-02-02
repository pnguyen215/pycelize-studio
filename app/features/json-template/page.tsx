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
import { FileDown, FileJson } from "lucide-react";

export default function JSONTemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<string>('{\n  "name": "{name}",\n  "email": "{email}",\n  "age": "{age}"\n}');
  const [columnMapping, setColumnMapping] = useState<string>('{\n  "name": "FullName",\n  "email": "EmailAddress",\n  "age": "Age"\n}');
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
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
      
      const blob = await jsonApi.generateTemplateJSON({
        file,
        template,
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
          <FileJson className="h-8 w-8" />
          Generate JSON with Template
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate custom JSON data using templates with placeholders
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file and provide a JSON template
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
            <Label htmlFor="template">JSON Template</Label>
            <Textarea
              id="template"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              placeholder='{"key": "{placeholder}"}'
              rows={8}
            />
            <p className="text-sm text-muted-foreground">
              Use {`{placeholder}`} syntax that will be replaced with actual values
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
            disabled={!file || !template || loading}
          >
            {loading ? "Generating..." : "Generate Template JSON"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Generating JSON with template..." />}

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
              Your template JSON file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton url={downloadUrl} filename="template_output.json" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
