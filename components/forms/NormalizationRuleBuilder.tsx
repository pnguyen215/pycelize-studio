"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface NormalizationRule {
  id: string;
  column_name: string;
  normalization_type: string;
}

interface NormalizationRuleBuilderProps {
  value: NormalizationRule[];
  onChange: (rules: NormalizationRule[]) => void;
  availableColumns?: string[];
  className?: string;
}

// Common normalization types
const NORMALIZATION_TYPES = [
  { value: "trim_whitespace", label: "Trim Whitespace" },
  { value: "lowercase", label: "Lowercase" },
  { value: "uppercase", label: "Uppercase" },
  { value: "title_case", label: "Title Case" },
  { value: "remove_special_chars", label: "Remove Special Characters" },
  { value: "remove_numbers", label: "Remove Numbers" },
  { value: "remove_extra_spaces", label: "Remove Extra Spaces" },
  { value: "strip_html", label: "Strip HTML Tags" },
  { value: "normalize_phone", label: "Normalize Phone Number" },
  { value: "normalize_email", label: "Normalize Email" },
  { value: "remove_punctuation", label: "Remove Punctuation" },
  { value: "remove_accents", label: "Remove Accents" },
  { value: "snake_case", label: "Snake Case" },
  { value: "camel_case", label: "Camel Case" },
  { value: "pascal_case", label: "Pascal Case" },
  { value: "kebab_case", label: "Kebab Case" },
  { value: "capitalize_first", label: "Capitalize First Letter" },
  { value: "remove_leading_zeros", label: "Remove Leading Zeros" },
  { value: "pad_zeros", label: "Pad with Zeros" },
  { value: "clean_currency", label: "Clean Currency Format" },
];

export function NormalizationRuleBuilder({ 
  value, 
  onChange, 
  availableColumns = [],
  className 
}: NormalizationRuleBuilderProps) {
  const addRule = () => {
    const newRule: NormalizationRule = {
      id: Date.now().toString(),
      column_name: "",
      normalization_type: "",
    };
    onChange([...value, newRule]);
  };

  const removeRule = (id: string) => {
    onChange(value.filter(rule => rule.id !== id));
  };

  const updateRule = (id: string, field: keyof NormalizationRule, newValue: string) => {
    onChange(value.map(rule => 
      rule.id === id ? { ...rule, [field]: newValue } : rule
    ));
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <Label className="text-base font-semibold">Normalization Rules</Label>
        <Button onClick={addRule} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="space-y-4">
        {value.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground text-center">
                No normalization rules defined. Click "Add Rule" to create one.
              </p>
            </CardContent>
          </Card>
        )}

        {value.map((rule, index) => (
          <Card key={rule.id}>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">Rule #{index + 1}</CardTitle>
                <Button 
                  onClick={() => removeRule(rule.id)} 
                  variant="ghost" 
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`column-${rule.id}`}>
                  Column Name <span className="text-destructive">*</span>
                </Label>
                {availableColumns.length > 0 ? (
                  <Select
                    value={rule.column_name}
                    onValueChange={(value) => updateRule(rule.id, "column_name", value)}
                  >
                    <SelectTrigger id={`column-${rule.id}`}>
                      <SelectValue placeholder="Select column" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableColumns.map((col) => (
                        <SelectItem key={col} value={col}>
                          {col}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`column-${rule.id}`}
                    placeholder="e.g., full_name"
                    value={rule.column_name}
                    onChange={(e) => updateRule(rule.id, "column_name", e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label htmlFor={`type-${rule.id}`}>
                  Normalization Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={rule.normalization_type}
                  onValueChange={(value) => updateRule(rule.id, "normalization_type", value)}
                >
                  <SelectTrigger id={`type-${rule.id}`}>
                    <SelectValue placeholder="Select normalization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {NORMALIZATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {value.length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <Label className="text-sm font-semibold mb-2 block">Preview (JSON)</Label>
          <pre className="text-xs overflow-auto max-h-48">
            {JSON.stringify(convertRulesToArray(value), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Helper function to convert rules to API format
export function convertRulesToArray(rules: NormalizationRule[]): Array<{column_name: string; normalization_type: string}> {
  return rules
    .filter(rule => rule.column_name && rule.normalization_type)
    .map(({ id, ...rest }) => rest);
}
