"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { JsonTemplateEditor } from "@/components/forms/JsonTemplateEditor";
import { ColumnMappingBuilder, MappingRule, convertRulesToMapping } from "@/components/forms/ColumnMappingBuilder";
import { Checkbox } from "@/components/ui/checkbox";
import { jsonApi } from "@/lib/api/json";
import { FileDown, FileJson } from "lucide-react";

export default function JSONTemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState<string>('{\n  "name": "{name}",\n  "email": "{email}",\n  "age": "{age}"\n}');
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([]);
  const [prettyPrint, setPrettyPrint] = useState<boolean>(true);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || !template) return;
    
    setLoading(true);
    setDownloadUrl(null);
    
    try {
      const mappingObject = convertRulesToMapping(mappingRules);
      
      const blob = await jsonApi.generateTemplateJSON({
        file,
        template,
        columnMapping: mappingObject,
        prettyPrint
      }) as unknown as Blob;
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      // Error is handled by toast in API client
      console.error('Failed to generate JSON:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
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
          <CardTitle>Configure JSON Generation</CardTitle>
          <CardDescription>
            Upload an Excel file and provide a JSON template with column mapping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={setFile}
            value={file}
            label="Select Excel File"
          />
          
          <JsonTemplateEditor
            value={template}
            onChange={setTemplate}
            placeholder="Enter your JSON template here..."
            showHelp={true}
          />

          <ColumnMappingBuilder
            value={mappingRules}
            onChange={setMappingRules}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="pretty-print"
              checked={prettyPrint}
              onCheckedChange={(checked) => setPrettyPrint(checked === true)}
            />
            <Label htmlFor="pretty-print" className="cursor-pointer">
              Pretty print JSON output
            </Label>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || !template || loading}
          >
            {loading ? "Processing..." : "Generate JSON"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Generating JSON..." />}

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
            <DownloadButton downloadUrl={downloadUrl} filename="template_output.json" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
