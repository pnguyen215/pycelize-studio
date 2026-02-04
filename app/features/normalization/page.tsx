"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { normalizationApi } from "@/lib/api/normalization";
import { Wand2, Plus, X } from "lucide-react";
import type { StandardResponse, DownloadUrlData } from "@/lib/api/types";

interface NormalizationRule {
  columnName: string;
  normalizationType: string;
}

export default function NormalizationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [rules, setRules] = useState<NormalizationRule[]>([
    { columnName: "", normalizationType: "" }
  ]);
  const [outputFilename, setOutputFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StandardResponse<DownloadUrlData> | null>(null);
  const [normalizationTypes, setNormalizationTypes] = useState<Record<string, string>>({});

  // Fetch normalization types on mount
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await normalizationApi.getTypes();
        if (response.data) {
          setNormalizationTypes(response.data);
        }
      } catch (error) {
        console.error("Failed to fetch normalization types:", error);
        // Fallback to empty object - user can still use the page without dropdown
      }
    };
    fetchTypes();
  }, []);

  const handleSubmit = async () => {
    if (!file) return;
    
    const validRules = rules.filter(rule => rule.columnName.trim() && rule.normalizationType.trim());
    if (validRules.length === 0) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const normalizations = validRules.map(rule => ({
        column_name: rule.columnName,
        normalization_type: rule.normalizationType
      }));
      
      const response = await normalizationApi.normalize({
        file,
        normalizations: JSON.stringify(normalizations),
        outputFilename: outputFilename || undefined
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const addRule = () => setRules([...rules, { columnName: "", normalizationType: "" }]);
  const removeRule = (index: number) => setRules(rules.filter((_, i) => i !== index));
  const updateRule = (index: number, field: keyof NormalizationRule, value: string) => {
    const newRules = [...rules];
    newRules[index][field] = value;
    setRules(newRules);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
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
          <CardTitle>Configure Normalization</CardTitle>
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
            <Label>Normalization Rules</Label>
            <div className="space-y-2">
              {rules.map((rule, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={rule.columnName}
                    onChange={(e) => updateRule(index, "columnName", e.target.value)}
                    placeholder="Column name"
                  />
                  <Select
                    value={rule.normalizationType}
                    onValueChange={(value) => updateRule(index, "normalizationType", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select normalization type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(normalizationTypes).map(([type, description]) => (
                        <SelectItem key={type} value={type}>
                          {type} : {description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rules.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRule(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addRule}>
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-filename">Output Filename (Optional)</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="normalized.xlsx"
            />
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

      {result && result.data && (
        <DownloadLink 
          downloadUrl={result.data.download_url}
          title="Normalization Complete"
          description="Your normalized file is ready to download"
        />
      )}
    </div>
  );
}
