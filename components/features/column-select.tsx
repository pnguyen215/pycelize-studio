"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ColumnSelectProps {
  value: string;
  onChange: (value: string) => void;
  columns: string[];
  loading?: boolean;
  error?: string | null;
  label?: string;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}

/**
 * Reusable column selection dropdown component
 * Uses file metadata to populate available column options
 */
export function ColumnSelect({
  value,
  onChange,
  columns,
  loading = false,
  error = null,
  label,
  placeholder = "Select column",
  id,
  disabled = false,
}: ColumnSelectProps) {
  const isDisabled = disabled || loading || columns.length === 0;

  return (
    <div className="space-y-2">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Select value={value} onValueChange={onChange} disabled={isDisabled}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue
            placeholder={
              loading
                ? "Loading columns..."
                : columns.length === 0
                  ? "No columns available"
                  : placeholder
            }
          />
        </SelectTrigger>
        <SelectContent>
          {columns.map((column) => (
            <SelectItem key={column} value={column}>
              {column}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-sm">{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
