"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toast } from "sonner";

interface DownloadButtonProps {
  downloadUrl: string;
  filename?: string;
  label?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
}

export function DownloadButton({ 
  downloadUrl, 
  filename,
  label = "Download File",
  className,
  variant = "default"
}: DownloadButtonProps) {
  const handleDownload = () => {
    try {
      // Open in new tab or trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      if (filename) {
        link.download = filename;
      }
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Download started!");
    } catch (error) {
      toast.error("Failed to initiate download");
      console.error("Download error:", error);
    }
  };

  return (
    <Button 
      onClick={handleDownload} 
      variant={variant}
      className={className}
    >
      <Download className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

