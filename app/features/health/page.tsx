"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MetricCard } from "@/components/features/metric-card";
import { healthApi } from "@/lib/api/health";
import { Activity, CheckCircle2, Server, GitBranch } from "lucide-react";
import type { StandardResponse, HealthCheckData } from "@/lib/api/types";

export default function HealthCheckPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StandardResponse<HealthCheckData> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const response = await healthApi.check();
      setResult(response);
      
      // Debug logging
      if (process.env.NEXT_PUBLIC_PYCELIZE_DEBUGGING === 'true') {
        console.debug('Health Check Response:', JSON.stringify(response, null, 2));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Health Check
        </h1>
        <p className="text-muted-foreground mt-2">
          Monitor the API service status and health
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Check API Status</CardTitle>
          <CardDescription>
            Verify that the Pycelize API backend is running and accessible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleCheck} 
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            {loading ? "Checking..." : "Check Health"}
          </Button>
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Checking API health..." />}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result !== null && result.data && (
        <div className="grid gap-4 md:grid-cols-3">
          <MetricCard
            icon={Server}
            title="Service"
            value={result.data.service}
            iconColor="text-blue-500"
          />
          <MetricCard
            icon={CheckCircle2}
            title="Status"
            value={result.data.status}
            iconColor="text-green-500"
          />
          <MetricCard
            icon={GitBranch}
            title="Version"
            value={result.data.version}
            iconColor="text-purple-500"
          />
        </div>
      )}
    </div>
  );
}
