import { useState, useEffect } from "react";
import { excelApi } from "@/lib/api/excel";
import { csvApi } from "@/lib/api/csv";

interface UseFileColumnsResult {
  columns: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Custom hook to fetch column names from Excel or CSV files
 * @param file - The file to extract columns from
 * @param fileType - Either "excel" or "csv"
 * @returns Object containing columns array, loading state, and error message
 */
export function useFileColumns(
  file: File | null,
  fileType: "excel" | "csv"
): UseFileColumnsResult {
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setColumns([]);
      setError(null);
      return;
    }

    const fetchColumns = async () => {
      setLoading(true);
      setError(null);

      try {
        let columnNames: string[] = [];

        if (fileType === "excel") {
          const response = await excelApi.getInfo(file);
          columnNames = response.data.column_names || [];
        } else if (fileType === "csv") {
          const response = await csvApi.getInfo(file);
          columnNames = response.data.column_names || [];
        }

        setColumns(columnNames);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch file columns";
        setError(errorMessage);
        setColumns([]);
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [file, fileType]);

  return { columns, loading, error };
}
