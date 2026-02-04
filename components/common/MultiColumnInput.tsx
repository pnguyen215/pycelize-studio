"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface MultiColumnInputProps {
  value: string[];
  onChange: (columns: string[]) => void;
  availableColumns?: string[];
  label?: string;
  placeholder?: string;
  className?: string;
}

export function MultiColumnInput({
  value,
  onChange,
  availableColumns = [],
  label = "Columns",
  placeholder = "Enter column name",
  className,
}: MultiColumnInputProps) {
  const [inputValue, setInputValue] = useState("");

  const addColumn = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      onChange([...value, inputValue.trim()]);
      setInputValue("");
    }
  };

  const removeColumn = (column: string) => {
    onChange(value.filter((c) => c !== column));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addColumn();
    }
  };

  const addFromAvailable = (column: string) => {
    if (!value.includes(column)) {
      onChange([...value, column]);
    }
  };

  return (
    <div className={className}>
      <Label className="mb-2 block">{label}</Label>

      {/* Input for adding columns */}
      <div className="flex gap-2 mb-3">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="button" onClick={addColumn} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Available columns (if provided) */}
      {availableColumns.length > 0 && (
        <Card className="mb-3">
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-2">Quick add from available:</p>
            <div className="flex flex-wrap gap-2">
              {availableColumns.map((col) => (
                <Badge
                  key={col}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => addFromAvailable(col)}
                >
                  {col}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected columns */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Selected columns ({value.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {value.map((column) => (
              <Badge key={column} variant="secondary" className="pr-1">
                {column}
                <button
                  type="button"
                  onClick={() => removeColumn(column)}
                  className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {value.length === 0 && (
        <p className="text-sm text-muted-foreground">No columns selected</p>
      )}
    </div>
  );
}
