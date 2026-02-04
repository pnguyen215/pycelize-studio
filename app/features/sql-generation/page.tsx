"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/features/file-upload";
import { DownloadButton } from "@/components/features/download-button";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { sqlApi } from "@/lib/api/sql";
import { FileDown, Database } from "lucide-react";

export default function SQLGenerationPage() {
  const [file, setFile] = useState<File | null>(null);
  const [tableName, setTableName] = useState<string>("");
  const [columnMapping, setColumnMapping] = useState<string>('{\n  "table_column": "excel_column"\n}');
  const [columns, setColumns] = useState<string>('');
  const [databaseType, setDatabaseType] = useState<"postgresql" | "mysql" | "sqlite">("postgresql");
  const [autoIncrementEnabled, setAutoIncrementEnabled] = useState(false);
  const [autoIncrementColumn, setAutoIncrementColumn] = useState("");
  const [autoIncrementStart, setAutoIncrementStart] = useState("1");
  const [removeDuplicates, setRemoveDuplicates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!file || !tableName) return;
    
    setLoading(true);
    setError(null);
    setDownloadUrl(null);
    
    try {
      const mappingObject = JSON.parse(columnMapping);
      if (typeof mappingObject !== 'object') {
        throw new Error("Column mapping must be a JSON object");
      }
      
      let columnsArray: string[] | undefined;
      if (columns.trim()) {
        columnsArray = JSON.parse(columns);
        if (!Array.isArray(columnsArray)) {
          throw new Error("Columns must be a JSON array");
        }
      }
      
      const response = await sqlApi.generateToText({
        file,
        tableName,
        columnMapping: mappingObject,
        databaseType,
        columns: columnsArray,
        autoIncrement: autoIncrementEnabled ? {
          enabled: true,
          column_name: autoIncrementColumn,
          start_value: parseInt(autoIncrementStart, 10) || 1
        } : undefined,
        removeDuplicates
      });
      
      setDownloadUrl(response.data.download_url);
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
          <Database className="h-8 w-8" />
          Generate Standard SQL
        </h1>
        <p className="text-muted-foreground mt-2">
          Generate SQL INSERT statements from Excel data
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file and configure SQL generation
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
            <Label htmlFor="tableName">Table Name</Label>
            <Input
              id="tableName"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="my_table"
            />
            <p className="text-sm text-muted-foreground">
              The database table name for INSERT statements
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="databaseType">Database Type</Label>
            <Select value={databaseType} onValueChange={(value) => setDatabaseType(value as "postgresql" | "mysql" | "sqlite")}>
              <SelectTrigger id="databaseType">
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="postgresql">PostgreSQL</SelectItem>
                <SelectItem value="mysql">MySQL</SelectItem>
                <SelectItem value="sqlite">SQLite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="columnMapping">Column Mapping (JSON Object)</Label>
            <Textarea
              id="columnMapping"
              value={columnMapping}
              onChange={(e) => setColumnMapping(e.target.value)}
              placeholder='{"db_column": "excel_column"}'
              rows={8}
            />
            <p className="text-sm text-muted-foreground">
              Map database column names to Excel column names
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="columns">Columns (Optional JSON Array)</Label>
            <Textarea
              id="columns"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              placeholder='["column1", "column2", "column3"]'
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Specify specific columns to include (leave empty for all columns)
            </p>
          </div>

          <div className="space-y-4 border rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoIncrementEnabled"
                checked={autoIncrementEnabled}
                onCheckedChange={setAutoIncrementEnabled}
              />
              <Label htmlFor="autoIncrementEnabled" className="cursor-pointer">
                Enable Auto Increment
              </Label>
            </div>
            
            {autoIncrementEnabled && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="autoIncrementColumn">Column Name</Label>
                  <Input
                    id="autoIncrementColumn"
                    value={autoIncrementColumn}
                    onChange={(e) => setAutoIncrementColumn(e.target.value)}
                    placeholder="id"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="autoIncrementStart">Start Value</Label>
                  <Input
                    id="autoIncrementStart"
                    type="number"
                    value={autoIncrementStart}
                    onChange={(e) => setAutoIncrementStart(e.target.value)}
                    placeholder="1"
                  />
                </div>
              </>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="removeDuplicates"
              checked={removeDuplicates}
              onCheckedChange={setRemoveDuplicates}
            />
            <Label htmlFor="removeDuplicates" className="cursor-pointer">
              Remove Duplicates
            </Label>
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={!file || !tableName || loading}
          >
            {loading ? "Generating..." : "Generate SQL"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Generating SQL..." />}

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
              Your SQL file is ready to download
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DownloadButton url={downloadUrl} filename={`${tableName || 'output'}.sql`} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
