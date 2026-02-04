"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { jsonApi } from "@/lib/api/json";
import { FileJson, Plus, X } from "lucide-react";
import type { StandardResponse, DownloadUrlData } from "@/lib/api/types";

export default function JSONTemplatePage() {
  const [file, setFile] = useState<File | null>(null);
  const [template, setTemplate] = useState('{\n  "name": "{name}",\n  "email": "{email}",\n  "age": "{age}"\n}');
  const [columnMappings, setColumnMappings] = useState<Array<{ key: string; value: string }>>([{ key: "", value: "" }]);
  const [aggregationMode, setAggregationMode] = useState<"array" | "single" | "nested">("array");
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [outputFilename, setOutputFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StandardResponse<DownloadUrlData> | null>(null);

  const handleSubmit = async () => {
    if (!file || !template) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const validMappings = columnMappings.filter(m => m.key.trim() && m.value.trim());
      const mappingObj: Record<string, string> = {};
      validMappings.forEach(m => { mappingObj[m.key] = m.value; });
      
      const response = await jsonApi.generateTemplateJSON({
        file,
        template,
        columnMapping: validMappings.length > 0 ? mappingObj : undefined,
        aggregationMode,
        prettyPrint,
        outputFilename: outputFilename || undefined
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const addMapping = () => setColumnMappings([...columnMappings, { key: "", value: "" }]);
  const removeMapping = (index: number) => setColumnMappings(columnMappings.filter((_, i) => i !== index));
  const updateMapping = (index: number, field: "key" | "value", value: string) => {
    const newMappings = [...columnMappings];
    newMappings[index][field] = value;
    setColumnMappings(newMappings);
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
          <CardTitle>Configure Template JSON</CardTitle>
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
              className="font-mono"
            />
            <p className="text-sm text-muted-foreground">
              Use {`{placeholder}`} syntax that will be replaced with actual values
            </p>
          </div>

          <div className="space-y-2">
            <Label>Column Mapping (Optional)</Label>
            <div className="space-y-2">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={mapping.key}
                    onChange={(e) => updateMapping(index, "key", e.target.value)}
                    placeholder="Template placeholder"
                  />
                  <span className="flex items-center px-2">→</span>
                  <Input
                    value={mapping.value}
                    onChange={(e) => updateMapping(index, "value", e.target.value)}
                    placeholder="Excel column"
                  />
                  {columnMappings.length > 1 && (
                    <Button variant="ghost" size="sm" onClick={() => removeMapping(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addMapping}>
              <Plus className="mr-2 h-4 w-4" />
              Add Mapping
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="aggregation-mode">Aggregation Mode</Label>
            <Select value={aggregationMode} onValueChange={(value) => setAggregationMode(value as "array" | "single" | "nested")}>
              <SelectTrigger id="aggregation-mode">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="array">Array (multiple records)</SelectItem>
                <SelectItem value="single">Single (first record only)</SelectItem>
                <SelectItem value="nested">Nested (grouped structure)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="pretty-print"
              checked={prettyPrint}
              onCheckedChange={setPrettyPrint}
            />
            <Label htmlFor="pretty-print">Pretty Print (formatted with indentation)</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-filename">Output Filename (Optional)</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="template_output.json"
            />
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

      {result && result.data && (
        <DownloadLink 
          downloadUrl={result.data.download_url}
          title="Template JSON Generated"
          description="Your template JSON file is ready to download"
        />
      )}
    </div>
  );
}
