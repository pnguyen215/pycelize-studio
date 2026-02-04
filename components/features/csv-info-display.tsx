"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/common/MetricCard";
import { ColumnList } from "@/components/common/ColumnList";
import { FileText, Columns, Hash, Divide } from "lucide-react";

interface CSVInfoData {
  data?: {
    filename?: string;
    file_size?: number;
    rows?: number;
    columns?: number;
    column_names?: string[];
    delimiter?: string;
    data_types?: Record<string, string>;
  };
}

interface CSVInfoDisplayProps {
  data: CSVInfoData;
  className?: string;
}

export function CSVInfoDisplay({ data, className }: CSVInfoDisplayProps) {
  const info = data.data;
  
  if (!info) {
    return (
      <Card className={className}>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* File metadata */}
      {info.filename && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              File Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-muted-foreground">Filename:</span>
                <p className="font-medium">{info.filename}</p>
              </div>
              {info.file_size && (
                <div>
                  <span className="text-sm text-muted-foreground">Size:</span>
                  <p className="font-medium">{(info.file_size / 1024).toFixed(2)} KB</p>
                </div>
              )}
              {info.delimiter && (
                <div>
                  <span className="text-sm text-muted-foreground">Delimiter:</span>
                  <code className="font-mono bg-muted px-2 py-1 rounded">
                    {info.delimiter === ',' ? 'Comma (,)' : 
                     info.delimiter === ';' ? 'Semicolon (;)' : 
                     info.delimiter === '\t' ? 'Tab (\\t)' : 
                     info.delimiter}
                  </code>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {info.rows !== undefined && (
          <MetricCard
            icon={Hash}
            label="Total Rows"
            value={info.rows}
          />
        )}
        {info.columns !== undefined && (
          <MetricCard
            icon={Columns}
            label="Total Columns"
            value={info.columns}
          />
        )}
        {info.delimiter && (
          <MetricCard
            icon={Divide}
            label="Delimiter"
            value={info.delimiter === ',' ? 'Comma' : 
                   info.delimiter === ';' ? 'Semicolon' : 
                   info.delimiter === '\t' ? 'Tab' : 
                   'Custom'}
          />
        )}
      </div>

      {/* Columns */}
      {info.column_names && info.column_names.length > 0 && (
        <ColumnList
          columns={info.column_names}
          dataTypes={info.data_types}
          title="Columns"
          className="mb-6"
        />
      )}

      {/* Debug: Show raw JSON if needed */}
      {process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING === 'true' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Debug: Raw Response</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto max-h-[300px] text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
