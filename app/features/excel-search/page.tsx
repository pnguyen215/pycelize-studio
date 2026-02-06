"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUpload } from "@/components/features/file-upload";
import { LoadingSpinner } from "@/components/features/loading-spinner";
import { MetricCard } from "@/components/features/metric-card";
import { SearchFilterDrawer } from "@/components/features/search-filter-drawer";
import { DownloadLink } from "@/components/features/download-link";
import { excelApi } from "@/lib/api/excel";
import { Search, FileText, CheckCircle2, Filter } from "lucide-react";
import type { StandardResponse, SearchResponse, SearchRequest } from "@/lib/api/types";

export default function ExcelSearchPage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StandardResponse<SearchResponse> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileColumns, setFileColumns] = useState<string[]>([]);
  const [loadingColumns, setLoadingColumns] = useState(false);

  // Fetch columns when file is uploaded
  const handleFileChange = async (file: File | null) => {
    setFile(file);
    setResult(null);
    setError(null);
    setFileColumns([]);

    if (file) {
      setLoadingColumns(true);
      try {
        const info = await excelApi.getInfo(file);
        setFileColumns(info.data.column_names);
      } catch (err) {
        console.error("Failed to fetch file columns:", err);
        setError("Failed to load file information. Please try again.");
      } finally {
        setLoadingColumns(false);
      }
    }
  };

  const handleSearch = async (searchRequest: Omit<SearchRequest, "file">) => {
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await excelApi.search({
        ...searchRequest,
        file,
      });
      setResult(response);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFetchOperators = async (file: File) => {
    const response = await excelApi.suggestOperators(file);
    return response.data;
  };

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Search className="h-8 w-8" />
          Excel Search & Filter
        </h1>
        <p className="text-muted-foreground mt-2">
          Search and filter Excel data with multiple conditions and export results
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload Excel File</CardTitle>
          <CardDescription>
            Upload an Excel file (.xlsx, .xls) to search and filter its data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUpload
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            value={file}
            label="Select Excel File"
            showQuickView={false}
          />
          
          {file && !loadingColumns && fileColumns.length > 0 && (
            <SearchFilterDrawer
              file={file}
              fileType="excel"
              columns={fileColumns}
              onSearch={handleSearch}
              onFetchOperators={handleFetchOperators}
            />
          )}

          {loadingColumns && (
            <div className="text-sm text-muted-foreground">
              Loading file information...
            </div>
          )}
        </CardContent>
      </Card>

      {loading && <LoadingSpinner text="Searching and filtering data..." />}

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result !== null && result.data && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard
              icon={FileText}
              title="Total Rows"
              value={result.data.total_rows.toLocaleString()}
              iconColor="text-blue-500"
            />
            <MetricCard
              icon={CheckCircle2}
              title="Filtered Rows"
              value={result.data.filtered_rows.toLocaleString()}
              iconColor="text-green-500"
            />
            <MetricCard
              icon={Filter}
              title="Conditions Applied"
              value={result.data.conditions_applied}
              iconColor="text-purple-500"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>{result.message}</CardDescription>
            </CardHeader>
            <CardContent>
              <DownloadLink
                downloadUrl={result.data.download_url}
                filename="search_results.xlsx"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
