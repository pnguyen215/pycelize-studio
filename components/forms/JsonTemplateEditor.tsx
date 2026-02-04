"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Info } from "lucide-react";

interface JsonTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  showHelp?: boolean;
}

export function JsonTemplateEditor({ 
  value, 
  onChange, 
  className,
  placeholder = "Enter your JSON template here...",
  showHelp = true
}: JsonTemplateEditorProps) {
  const [error, setError] = useState<string | null>(null);

  const handleChange = (newValue: string) => {
    onChange(newValue);
    
    // Validate JSON
    if (newValue.trim()) {
      try {
        JSON.parse(newValue);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Invalid JSON");
      }
    } else {
      setError(null);
    }
  };

  return (
    <div className={className}>
      <Label className="text-base font-semibold mb-4 block">JSON Template Editor</Label>

      {showHelp && (
        <Tabs defaultValue="placeholders" className="mb-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="placeholders">Placeholders</TabsTrigger>
            <TabsTrigger value="examples">Examples</TabsTrigger>
          </TabsList>
          
          <TabsContent value="placeholders" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Available Placeholders
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-1">
                <div className="font-mono bg-muted p-2 rounded">
                  <code>{"{column}"}</code> - Replace with column value
                </div>
                <div className="font-mono bg-muted p-2 rounded">
                  <code>{"{auto_id}"}</code> - Auto-incrementing ID
                </div>
                <div className="font-mono bg-muted p-2 rounded">
                  <code>{"{current_timestamp}"}</code> - Current timestamp
                </div>
                <p className="text-muted-foreground pt-2">
                  Use these placeholders in your template. They will be replaced with actual values during generation.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Example Templates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-semibold mb-1">Simple Object:</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
{`{
  "name": "{first_name}",
  "email": "{email}",
  "created_at": "{current_timestamp}"
}`}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Nested Structure:</p>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
{`{
  "user": {
    "id": "{auto_id}",
    "profile": {
      "name": "{name}",
      "age": "{age}"
    }
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      <Textarea
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="font-mono text-sm min-h-[300px]"
      />

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>JSON Syntax Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {!error && value && (
        <Alert className="mt-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Valid JSON template
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
