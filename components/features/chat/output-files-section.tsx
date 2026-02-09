"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Copy } from "lucide-react";
import { extractFileName, copyToClipboard } from "@/lib/utils/chat-utils";
import { NotificationManager } from "@/lib/services/notification-manager";

interface OutputFile {
  file_path: string;
  download_url: string;
}

interface OutputFilesSectionProps {
  outputFiles: OutputFile[];
}

export function OutputFilesSection({ outputFiles }: OutputFilesSectionProps) {
  const handleCopyPath = async (path: string) => {
    const success = await copyToClipboard(path);
    if (success) {
      NotificationManager.success("Path copied to clipboard");
    } else {
      NotificationManager.error("Failed to copy path");
    }
  };

  if (!outputFiles || outputFiles.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Output Files ({outputFiles.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {outputFiles.map((file, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <FileText className="h-4 w-4 text-gray-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {extractFileName(file.file_path)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {file.file_path}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" asChild>
                  <a href={file.download_url} download target="_blank" rel="noopener noreferrer">
                    <Download className="h-4 w-4 mr-1" />
                    Download
                  </a>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => handleCopyPath(file.file_path)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
