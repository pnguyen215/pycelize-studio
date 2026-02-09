"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, Loader2, Grid2x2 } from "lucide-react";
import { NotificationManager } from "@/lib/services/notification-manager";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { OperationsSelector } from "./operations-selector";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onUploadFile: (file: File) => void;
  disabled?: boolean;
}

export function ChatInput({
  onSendMessage,
  onUploadFile,
  disabled = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [operationsOpen, setOperationsOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    onSendMessage(message);
    setMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      NotificationManager.error("File size must be less than 10MB");
      return;
    }

    // Validate file type (Excel, CSV)
    const validTypes = [
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx?|csv)$/i)) {
      NotificationManager.error("Please upload an Excel (.xlsx, .xls) or CSV file");
      return;
    }

    setIsUploading(true);
    try {
      await onUploadFile(file);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-4">
      <div className="flex gap-2 items-end">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv"
          className="hidden"
          onChange={handleFileSelect}
          disabled={disabled || isUploading}
        />

        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Paperclip className="h-4 w-4" />
          )}
        </Button>

        <Popover open={operationsOpen} onOpenChange={setOperationsOpen}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              disabled={disabled}
            >
              <Grid2x2 className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 max-h-[500px] overflow-auto" align="start">
            <OperationsSelector
              onSelectOperation={(operation, endpoint) => {
                console.log("Selected:", operation, endpoint);
                setOperationsOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        <div className="flex-1">
          <Input
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
        Upload Excel (.xlsx, .xls) or CSV files up to 10MB
      </p>
    </div>
  );
}
