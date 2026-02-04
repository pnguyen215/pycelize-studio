"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { excelApi } from "@/lib/api/excel";
import { ArrowLeftRight, Plus, X } from "lucide-react";
import type { StandardResponse, DownloadUrlResponse } from "@/lib/api/types";

interface MappingRow {
  newColumn: string;
  sourceColumn: string;
  defaultValue: string;
}

export default function ColumnMappingPage() {
  const [file, setFile] = useState<File | null>(null);
  const [mappingRows, setMappingRows] = useState<MappingRow[]>([
    { newColumn: "", sourceColumn: "", defaultValue: "" },
  ]);
  const [outputFilename, setOutputFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<StandardResponse<DownloadUrlResponse> | null>(null);

  const handleSubmit = async () => {
    if (!file) return;

    const validRows = mappingRows.filter(
      (row) => row.newColumn.trim() && row.sourceColumn.trim()
    );
    if (validRows.length === 0) return;

    setLoading(true);
    setResult(null);

    try {
      const mapping: Record<string, { source: string; default?: string }> = {};
      validRows.forEach((row) => {
        mapping[row.newColumn] = {
          source: row.sourceColumn,
          ...(row.defaultValue.trim() && { default: row.defaultValue }),
        };
      });

      const response = await excelApi.mapColumns({
        file,
        mapping,
        outputFilename: outputFilename || undefined,
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const addMappingRow = () =>
    setMappingRows([
      ...mappingRows,
      { newColumn: "", sourceColumn: "", defaultValue: "" },
    ]);
  const removeMappingRow = (index: number) =>
    setMappingRows(mappingRows.filter((_, i) => i !== index));
  const updateMappingRow = (
    index: number,
    field: keyof MappingRow,
    value: string
  ) => {
    const newRows = [...mappingRows];
    newRows[index][field] = value;
    setMappingRows(newRows);
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
          <CardTitle>Configure Mapping</CardTitle>
          <CardDescription>
            Upload an Excel file and define column mappings
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
            <Label>Column Mappings</Label>
            <div className="space-y-2">
              {mappingRows.map((row, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={row.newColumn}
                    onChange={(e) =>
                      updateMappingRow(index, "newColumn", e.target.value)
                    }
                    placeholder="New column name"
                  />
                  <span className="flex items-center px-2">→</span>
                  <Input
                    value={row.sourceColumn}
                    onChange={(e) =>
                      updateMappingRow(index, "sourceColumn", e.target.value)
                    }
                    placeholder="Source column"
                  />
                  <Input
                    value={row.defaultValue}
                    onChange={(e) =>
                      updateMappingRow(index, "defaultValue", e.target.value)
                    }
                    placeholder="Default value (optional)"
                  />
                  {mappingRows.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMappingRow(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addMappingRow}>
              <Plus className="mr-2 h-4 w-4" />
              Add Mapping
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-filename">Output Filename (Optional)</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="mapped_file.xlsx"
            />
          </div>

          <Button onClick={handleSubmit} disabled={!file || loading}>
            {loading ? "Processing..." : "Map Columns"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Mapping columns..." />}

      {result && result.data && (
        <DownloadLink
          downloadUrl={result.data.download_url}
          title="Mapping Complete"
          description="Your mapped Excel file is ready to download"
        />
      )}
    </div>
  );
}
