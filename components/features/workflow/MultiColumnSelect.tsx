"use client";

import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MultiColumnSelectProps {
  columns: string[];
  selectedColumns: string[];
  onChange: (columns: string[]) => void;
  loading?: boolean;
  placeholder?: string;
}

export function MultiColumnSelect({
  columns,
  selectedColumns,
  onChange,
  loading = false,
  placeholder = "Select columns...",
}: MultiColumnSelectProps) {
  const addColumn = () => {
    onChange([...selectedColumns, ""]);
  };

  const removeColumn = (index: number) => {
    onChange(selectedColumns.filter((_, i) => i !== index));
  };

  const updateColumn = (index: number, value: string) => {
    const updated = [...selectedColumns];
    updated[index] = value;
    onChange(updated);
  };

  return (
    <div className="space-y-2">
      {selectedColumns.map((selectedCol, index) => (
        <div key={index} className="flex gap-2">
          <Select
            value={selectedCol}
            onValueChange={(value) => updateColumn(index, value)}
            disabled={loading}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder={loading ? "Loading..." : placeholder} />
            </SelectTrigger>
            <SelectContent>
              {columns.map((col) => (
                <SelectItem key={col} value={col}>
                  {col}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => removeColumn(index)}
            disabled={selectedColumns.length === 1}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      
      <Button onClick={addColumn} variant="outline" size="sm" className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Column
      </Button>
    </div>
  );
}
