import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadButtonProps {
  url: string;
  filename: string;
}

export function DownloadButton({ url, filename }: DownloadButtonProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button onClick={handleDownload} variant="outline">
      <Download className="mr-2 h-4 w-4" />
      Download {filename}
    </Button>
  );
}
