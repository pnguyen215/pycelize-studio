"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { NormalizationRuleBuilder, NormalizationRule, convertRulesToArray } from "@/components/forms/NormalizationRuleBuilder";
import { normalizationApi } from "@/lib/api/normalization";
import { FileDown, Wand2 } from "lucide-react";

export default function NormalizationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [normalizationRules, setNormalizationRules] = useState<NormalizationRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || normalizationRules.length === 0) return;
    
    setLoading(true);
    setDownloadUrl(null);
    
    try {
      const normalizationsArray = convertRulesToArray(normalizationRules);
      
      const blob = await normalizationApi.normalize({
        file,
        normalizations: normalizationsArray
      }) as unknown as Blob;
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      // Error is handled by toast in API client
      console.error('Failed to normalize data:', err);
    } finally {
      setLoading(false);
    }
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
        <CardContent className="space-y-6">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={setFile}
            value={file}
            label="Select Excel File"
          />
          
          <NormalizationRuleBuilder
            value={normalizationRules}
            onChange={setNormalizationRules}
          />

          <Button 
            onClick={handleSubmit} 
            disabled={!file || normalizationRules.length === 0 || loading}
          >
            {loading ? "Processing..." : "Apply Normalization"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Normalizing data..." />}

      {downloadUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Download Ready
            </CardTitle>
            <CardDescription>
              Your normalized file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton downloadUrl={downloadUrl} filename="normalized.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
