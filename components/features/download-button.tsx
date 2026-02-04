import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  url: string;
  filename?: string;
  label?: string;
}

export function DownloadButton({ url, filename, label = "Download File" }: DownloadButtonProps) {
  const handleDownload = () => {
    // If it's a full URL, open in new tab
    if (url.startsWith('http://') || url.startsWith('https://')) {
      window.open(url, '_blank');
    } else {
      // Otherwise, create a download link
      const link = document.createElement('a');
      link.href = url;
      if (filename) {
        link.download = filename;
      }
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Button onClick={handleDownload} variant="default" className="gap-2">
      <Download className="h-4 w-4" />
      {label}
    </Button>
  );
}
