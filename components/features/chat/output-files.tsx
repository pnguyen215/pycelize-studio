"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Copy, FileText } from "lucide-react";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { NotificationManager } from "@/lib/services/notification-manager";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface OutputFile {
  file_path: string;
  download_url: string;
}

interface OutputFilesProps {
  files: OutputFile[];
}

export function OutputFiles({ files }: OutputFilesProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();

  if (!files || files.length === 0) {
    return null;
  }

  const handleCopyPath = async (path: string) => {
    const success = await copyToClipboard(path);
    if (success) {
      NotificationManager.success("File path copied!");
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold">Output Files</h3>
        <span className="text-sm text-gray-500">({files.length})</span>
      </div>

      <div className="space-y-3">
        {files.map((file, index) => {
          const fileName = file.file_path.split("/").pop() || file.file_path;
          
          return (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <FileText className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="text-sm font-medium truncate" title={fileName}>
                  {fileName}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a
                          href={file.download_url}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPath(file.file_path)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isCopied ? "Copied!" : "Copy Path"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
