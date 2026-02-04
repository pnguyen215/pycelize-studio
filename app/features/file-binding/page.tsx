"use client";

/**
 * FILE BINDING FEATURE - DEACTIVATED
 * 
 * This feature has been deactivated as per the comprehensive frontend enhancement specification.
 * DO NOT re-activate this feature without explicit approval from the Product Manager.
 * 
 * Reference: Comprehensive Frontend Enhancements Specification
 * Section: "9. Deactivate File Binding Feature"
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

export default function FileBindingPage() {
  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-amber-500" />
          File Binding with Mapping
        </h1>
        <p className="text-muted-foreground mt-2">
          This feature is currently deactivated
        </p>
      </div>

      <Alert variant="destructive" className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Feature Deactivated</strong>
          <br />
          The File Binding feature has been temporarily deactivated pending further review and updates.
          Please use the Excel Binding features (Single Key or Multi Key) for similar functionality.
        </AlertDescription>
      </Alert>

      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>Feature Not Available</CardTitle>
          <CardDescription>
            This feature is currently unavailable. Please contact your administrator for more information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Alternative features you can use:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-muted-foreground">
            <li>Excel Binding (Single Key) - Available in Excel Operations</li>
            <li>Excel Binding (Multi Key) - Available in Excel Operations</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
