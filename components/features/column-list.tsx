"use client";

import { useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTypeBadge } from "./data-type-badge";
import { CopyButton } from "./copy-button";
import { Camera, Check } from "lucide-react";
import html2canvas from "html2canvas";

interface ColumnListProps {
  columns: string[];
  dataTypes?: Record<string, string>;
  title?: string;
}

export function ColumnList({ columns, dataTypes, title = "Columns" }: ColumnListProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [capturing, setCapturing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCapture = async () => {
    if (!tableRef.current) return;
    
    setCapturing(true);
    try {
      const canvas = await html2canvas(tableRef.current, {
        background: "#ffffff",
        logging: false,
        useCORS: true,
      });
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({ "image/png": blob })
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          } catch (err) {
            console.error("Failed to copy image to clipboard, downloading instead:", err);
            // Fallback: download the image
            const url = canvas.toDataURL("image/png");
            const link = document.createElement("a");
            link.download = "table-screenshot.png";
            link.href = url;
            link.click();
          }
        }
        setCapturing(false);
      });
    } catch (err) {
      console.error("Failed to capture:", err);
      setCapturing(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>{title}</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleCapture}
          disabled={capturing}
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              {capturing ? "Capturing..." : "Capture as Image"}
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div ref={tableRef} className="max-h-[500px] overflow-auto border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-muted z-10">
              <TableRow>
                <TableHead>Column Name</TableHead>
                {dataTypes && <TableHead>Data Type</TableHead>}
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {columns.map((column, index) => (
                <TableRow key={index}>
                  <TableCell className="font-mono text-sm">{column}</TableCell>
                  {dataTypes && (
                    <TableCell>
                      <DataTypeBadge dataType={dataTypes[column] || "unknown"} />
                    </TableCell>
                  )}
                  <TableCell>
                    <CopyButton text={column} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
