"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { ColumnMappingBuilder, MappingRule, convertRulesToMapping } from "@/components/forms/ColumnMappingBuilder";
import { excelApi } from "@/lib/api/excel";
import { FileDown, ArrowLeftRight } from "lucide-react";

export default function ColumnMappingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mappingRules, setMappingRules] = useState<MappingRule[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || mappingRules.length === 0) return;
    
    setLoading(true);
    setDownloadUrl(null);
    
    try {
      const mappingObject = convertRulesToMapping(mappingRules);
      
      const blob = await excelApi.mapColumns({
        file,
        mapping: mappingObject
      }) as unknown as Blob;
      
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      // Error is handled by toast in API client
      console.error('Failed to map columns:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ArrowLeftRight className="h-8 w-8" />
          Column Mapping
        </h1>
        <p className="text-muted-foreground mt-2">
          Map and rename columns in Excel files with optional default values
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure Column Mapping</CardTitle>
          <CardDescription>
            Upload an Excel file and specify the column mapping
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={setFile}
            value={file}
            label="Select Excel File"
          />
          
          <ColumnMappingBuilder
            value={mappingRules}
            onChange={setMappingRules}
          />

          <Button 
            onClick={handleSubmit} 
            disabled={!file || mappingRules.length === 0 || loading}
          >
            {loading ? "Processing..." : "Map Columns"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Mapping columns..." />}

      {downloadUrl && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileDown className="h-5 w-5" />
              Download Ready
            </CardTitle>
            <CardDescription>
              Your mapped file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton downloadUrl={downloadUrl} filename="mapped_columns.xlsx" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
