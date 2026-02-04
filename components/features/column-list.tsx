"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CopyButton } from "./copy-button";
import { DataTypeBadge } from "./data-type-badge";

interface ColumnListProps {
  columns: string[];
  dataTypes?: Record<string, string>;
  title?: string;
  description?: string;
}

export function ColumnList({ 
  columns, 
  dataTypes, 
  title = "Columns",
  description 
}: ColumnListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {columns.map((column, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors border border-border/50"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="font-mono text-sm font-medium truncate">
                  {column}
                </span>
                {dataTypes && dataTypes[column] && (
                  <DataTypeBadge type={dataTypes[column]} />
                )}
              </div>
              <CopyButton text={column} showIcon={true} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
