"use client";

import { useRef, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DataTypeBadge } from "./data-type-badge";
import { CopyButton } from "./copy-button";
import { Camera, Check } from "lucide-react";
import * as htmlToImage from 'html-to-image';

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
      const blob = await htmlToImage.toBlob(tableRef.current, {
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        skipFonts: true, // Skip font embedding to avoid font undefined errors
        cacheBust: true, // Ensure fresh capture
      });
      
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
          const dataUrl = await htmlToImage.toPng(tableRef.current, {
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            skipFonts: true,
            cacheBust: true,
          });
          const link = document.createElement("a");
          link.download = "table-screenshot.png";
          link.href = dataUrl;
          link.click();
        }
      }
      setCapturing(false);
    } catch (err) {
      console.error("Failed to capture:", err);
      alert("Failed to capture screenshot. Please try again.");
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
        <div ref={tableRef} className="border rounded-md">
          {/* Fixed Header */}
          <div className="border-b bg-muted">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Column Name</TableHead>
                  {dataTypes && <TableHead>Data Type</TableHead>}
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          {/* Scrollable Body */}
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
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
        </div>
      </CardContent>
    </Card>
  );
}
