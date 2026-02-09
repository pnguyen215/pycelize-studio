"use client";

import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/chat-utils";
import { NotificationManager } from "@/lib/services/notification-manager";

interface JsonViewerProps {
  data: Record<string, unknown>;
}

export function JsonViewer({ data }: JsonViewerProps) {
  const handleCopy = async () => {
    const success = await copyToClipboard(JSON.stringify(data, null, 2));
    if (success) {
      NotificationManager.success("JSON copied to clipboard");
    } else {
      NotificationManager.error("Failed to copy JSON");
    }
  };

  return (
    <div className="mt-2 relative">
      <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg overflow-x-auto text-xs border border-gray-200 dark:border-gray-800">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
      <Button 
        size="sm" 
        variant="ghost" 
        className="absolute top-2 right-2" 
        onClick={handleCopy}
      >
        <Copy className="h-3 w-3" />
      </Button>
    </div>
  );
}
