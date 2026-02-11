"use client";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { FileText, Download, Copy, X } from "lucide-react";
import { extractFileName, copyToClipboard } from "@/lib/utils/chat-utils";
import { NotificationManager } from "@/lib/services/notification-manager";

interface OutputFile {
  file_path: string;
  download_url: string;
}

interface OutputFilesDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  outputFiles: OutputFile[];
}

export function OutputFilesDrawer({ open, onOpenChange, outputFiles }: OutputFilesDrawerProps) {
  const handleCopyPath = async (path: string) => {
    const success = await copyToClipboard(path);
    if (success) {
      NotificationManager.success("Path copied to clipboard");
    } else {
      NotificationManager.error("Failed to copy path");
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[80vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Output Files ({outputFiles?.length || 0})
          </DrawerTitle>
          <DrawerDescription>
            Download or copy paths of generated output files
          </DrawerDescription>
        </DrawerHeader>
        
        <div className="overflow-y-auto px-4 pb-4">
          <div className="space-y-3">
            {outputFiles && outputFiles.length > 0 ? (
              outputFiles.map((file, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-4 border rounded-lg bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-blue-500 shrink-0" />
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
                      title="Copy path"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No output files available
              </div>
            )}
          </div>
        </div>
        
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
