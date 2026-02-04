"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

export interface MappingRule {
  id: string;
  newColumnName: string;
  sourceColumn: string;
  defaultValue: string;
}

interface ColumnMappingBuilderProps {
  value: MappingRule[];
  onChange: (rules: MappingRule[]) => void;
  availableColumns?: string[];
  className?: string;
}

export function ColumnMappingBuilder({ 
  value, 
  onChange, 
  availableColumns = [],
  className 
}: ColumnMappingBuilderProps) {
  const addRule = () => {
    const newRule: MappingRule = {
      id: Date.now().toString(),
      newColumnName: "",
      sourceColumn: "",
      defaultValue: "",
    };
    onChange([...value, newRule]);
  };

  const removeRule = (id: string) => {
    onChange(value.filter(rule => rule.id !== id));
  };

  const updateRule = (id: string, field: keyof MappingRule, newValue: string) => {
    onChange(value.map(rule => 
      rule.id === id ? { ...rule, [field]: newValue } : rule
    ));
  };

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <Label className="text-base font-semibold">Column Mapping Rules</Label>
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
                No mapping rules defined. Click "Add Rule" to create one.
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
                <Label htmlFor={`new-col-${rule.id}`}>
                  New Column Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id={`new-col-${rule.id}`}
                  placeholder="e.g., user_id"
                  value={rule.newColumnName}
                  onChange={(e) => updateRule(rule.id, "newColumnName", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor={`source-col-${rule.id}`}>
                  Source Column (optional)
                </Label>
                {availableColumns.length > 0 ? (
                  <select
                    id={`source-col-${rule.id}`}
                    value={rule.sourceColumn}
                    onChange={(e) => updateRule(rule.id, "sourceColumn", e.target.value)}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">-- Select Column --</option>
                    {availableColumns.map((col) => (
                      <option key={col} value={col}>{col}</option>
                    ))}
                  </select>
                ) : (
                  <Input
                    id={`source-col-${rule.id}`}
                    placeholder="e.g., id"
                    value={rule.sourceColumn}
                    onChange={(e) => updateRule(rule.id, "sourceColumn", e.target.value)}
                  />
                )}
              </div>

              <div>
                <Label htmlFor={`default-${rule.id}`}>
                  Default Value (optional)
                </Label>
                <Input
                  id={`default-${rule.id}`}
                  placeholder="e.g., N/A or 0"
                  value={rule.defaultValue}
                  onChange={(e) => updateRule(rule.id, "defaultValue", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {value.length > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <Label className="text-sm font-semibold mb-2 block">Preview (JSON)</Label>
          <pre className="text-xs overflow-auto max-h-48">
            {JSON.stringify(convertRulesToMapping(value), null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// Helper function to convert rules to API format
export function convertRulesToMapping(rules: MappingRule[]): Record<string, any> {
  const mapping: Record<string, any> = {};
  
  rules.forEach(rule => {
    if (!rule.newColumnName) return;
    
    if (rule.sourceColumn && rule.defaultValue) {
      mapping[rule.newColumnName] = {
        source: rule.sourceColumn,
        default: rule.defaultValue,
      };
    } else if (rule.sourceColumn) {
      mapping[rule.newColumnName] = rule.sourceColumn;
    } else if (rule.defaultValue) {
      mapping[rule.newColumnName] = {
        default: rule.defaultValue,
      };
    }
  });
  
  return mapping;
}
