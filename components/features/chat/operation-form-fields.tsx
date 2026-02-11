"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OperationField } from "@/lib/config/operations-metadata";

interface OperationFormFieldsProps {
  fields: OperationField[];
  values: Record<string, any>;
  onChange: (name: string, value: any) => void;
  errors: Record<string, string>;
}

export function OperationFormFields({
  fields,
  values,
  onChange,
  errors,
}: OperationFormFieldsProps) {
  const renderField = (field: OperationField) => {
    const value = values[field.name] ?? field.defaultValue ?? '';
    const error = errors[field.name];

    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              type={field.type}
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              className={error ? 'border-red-500' : ''}
            />
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'textarea':
      case 'json':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              value={value}
              onChange={(e) => onChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              rows={field.type === 'json' ? 4 : 3}
              className={`font-mono text-sm ${error ? 'border-red-500' : ''}`}
            />
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name}>
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select value={value} onValueChange={(val) => onChange(field.name, val)}>
              <SelectTrigger className={error ? 'border-red-500' : ''}>
                <SelectValue placeholder={field.placeholder || 'Select...'} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {field.description && (
              <p className="text-xs text-gray-500">{field.description}</p>
            )}
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.name} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => onChange(field.name, checked)}
            />
            <Label
              htmlFor={field.name}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
            </Label>
            {field.description && (
              <p className="text-xs text-gray-500 ml-6">{field.description}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {fields.map((field) => renderField(field))}
    </div>
  );
}
