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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadLink } from "@/components/features/download-link";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { ColumnSelect } from "@/components/features/column-select";
import { useFileColumns } from "@/lib/hooks/useFileColumns";
import { jsonApi } from "@/lib/api/json";
import { Braces, Plus, X } from "lucide-react";
import type { StandardResponse, DownloadUrlResponse } from "@/lib/api/types";

export default function JSONGenerationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [columns, setColumns] = useState<string[]>([""]);
  const [columnMappings, setColumnMappings] = useState<
    Array<{ key: string; value: string }>
  >([{ key: "", value: "" }]);
  const [nullHandling, setNullHandling] = useState<
    "include" | "exclude" | "default"
  >("include");
  const [prettyPrint, setPrettyPrint] = useState(true);
  const [arrayWrapper, setArrayWrapper] = useState(true);
  const [outputFilename, setOutputFilename] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] =
    useState<StandardResponse<DownloadUrlResponse> | null>(null);

  // Fetch available columns from the uploaded file
  const {
    columns: availableColumns,
    loading: columnsLoading,
    error: columnsError,
  } = useFileColumns(file, "excel");

  const handleSubmit = async () => {
    if (!file) return;

    setLoading(true);
    setResult(null);

    try {
      const validColumns = columns.filter((col) => col.trim() !== "");
      const validMappings = columnMappings.filter(
        (m) => m.key.trim() && m.value.trim()
      );
      const mappingObj: Record<string, string> = {};
      validMappings.forEach((m) => {
        mappingObj[m.key] = m.value;
      });

      const response = await jsonApi.generateJSON({
        file,
        columns: validColumns.length > 0 ? validColumns : undefined,
        columnMapping: validMappings.length > 0 ? mappingObj : undefined,
        nullHandling,
        prettyPrint,
        arrayWrapper,
        outputFilename: outputFilename || undefined,
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  const addColumn = () => setColumns([...columns, ""]);
  const removeColumn = (index: number) =>
    setColumns(columns.filter((_, i) => i !== index));
  const updateColumn = (index: number, value: string) => {
    const newColumns = [...columns];
    newColumns[index] = value;
    setColumns(newColumns);
  };

  const addMapping = () =>
    setColumnMappings([...columnMappings, { key: "", value: "" }]);
  const removeMapping = (index: number) =>
    setColumnMappings(columnMappings.filter((_, i) => i !== index));
  const updateMapping = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newMappings = [...columnMappings];
    newMappings[index][field] = value;
    setColumnMappings(newMappings);
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Braces className="h-8 w-8" />
          Generate Standard JSON
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate JSON data from Excel files with column mapping
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Configure JSON Generation</CardTitle>
          <CardDescription>
            Upload an Excel file and configure JSON generation options
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
            <Label>Columns to Include (Optional)</Label>
            <div className="space-y-2">
              {columns.map((column, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <ColumnSelect
                      value={column}
                      onChange={(value) => updateColumn(index, value)}
                      columns={availableColumns}
                      loading={columnsLoading}
                      error={index === 0 ? columnsError : null}
                      placeholder="Select column"
                    />
                  </div>
                  {columns.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeColumn(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={addColumn}>
              <Plus className="mr-2 h-4 w-4" />
              Add Column
            </Button>
          </div>

          <div className="space-y-2">
            <Label>Column Mapping (Optional)</Label>
            <div className="space-y-2">
              {columnMappings.map((mapping, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <ColumnSelect
                      value={mapping.value}
                      onChange={(value) => updateMapping(index, "value", value)}
                      columns={availableColumns}
                      loading={columnsLoading}
                      error={index === 0 ? columnsError : null}
                      placeholder="Select Excel column"
                    />
                  </div>
                  <span className="flex items-center px-2">→</span>
                  <Input
                    value={mapping.key}
                    onChange={(e) =>
                      updateMapping(index, "key", e.target.value)
                    }
                    placeholder="JSON key"
                  />
                  {columnMappings.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMapping(index)}
                    >
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
            <Label htmlFor="null-handling">Null Handling</Label>
            <Select
              value={nullHandling}
              onValueChange={(value) =>
                setNullHandling(value as "include" | "exclude" | "default")
              }
            >
              <SelectTrigger id="null-handling">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="include">Include nulls</SelectItem>
                <SelectItem value="exclude">Exclude nulls</SelectItem>
                <SelectItem value="default">Use default value</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="pretty-print"
              checked={prettyPrint}
              onCheckedChange={setPrettyPrint}
            />
            <Label htmlFor="pretty-print">
              Pretty Print (formatted with indentation)
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="array-wrapper"
              checked={arrayWrapper}
              onCheckedChange={setArrayWrapper}
            />
            <Label htmlFor="array-wrapper">
              Array Wrapper (wrap result in array)
            </Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="output-filename">Output Filename (Optional)</Label>
            <Input
              id="output-filename"
              value={outputFilename}
              onChange={(e) => setOutputFilename(e.target.value)}
              placeholder="output.json"
            />
          </div>

          <Button onClick={handleSubmit} disabled={!file || loading}>
            {loading ? "Generating..." : "Generate JSON"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Generating JSON..." />}

      {result && result.data && (
        <DownloadLink
          downloadUrl={result.data.download_url}
          title="JSON Generated"
          description="Your JSON file is ready to download"
        />
      )}
    </div>
  );
}
