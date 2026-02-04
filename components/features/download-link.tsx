import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadLinkProps {
  downloadUrl: string;
  title?: string;
  description?: string;
  filename?: string;
}

export function DownloadLink({ 
  downloadUrl, 
  title = "Download Ready", 
  description = "Your file has been generated and is ready to download",
  filename = "download"
}: DownloadLinkProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-green-200 bg-green-50/50">
      <CardHeader>
        <CardTitle className="text-green-700">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleDownload}
          className="w-full sm:w-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Download File
        </Button>
      </CardContent>
    </Card>
  );
}
