"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/api/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User, Download, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/lib/hooks/useCopyToClipboard";
import { NotificationManager } from "@/lib/services/notification-manager";

interface ChatMessageProps {
  message: ChatMessageType;
  uploadedFiles?: Array<{ file_path: string; download_url: string }>;
}

export function ChatMessage({ message, uploadedFiles }: ChatMessageProps) {
  const { copyToClipboard, isCopied } = useCopyToClipboard();
  const isUser = message.type === "user";
  const isFile = message.type === "file";
  const participantName = message.participant_name || (isUser ? "You" : "Assistant");

  // Check if this message has an uploaded file with a download URL
  const hasUploadedFile = message.metadata?.file_path && uploadedFiles;
  const matchingFile = hasUploadedFile
    ? uploadedFiles.find((f) => f.file_path === message.metadata?.file_path)
    : null;

  const handleCopyMessageId = async () => {
    if (message.message_id) {
      const success = await copyToClipboard(message.message_id);
      if (success) {
        NotificationManager.success("Message ID copied!");
      }
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 group",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarFallback className={cn(
            isUser ? "bg-blue-500 text-white" : "bg-green-500 text-white"
          )}>
            {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-gray-600 dark:text-gray-400 text-center">
          {participantName}
        </span>
      </div>

      <div className={cn("flex flex-col gap-1 flex-1 min-w-0", isUser ? "items-end" : "items-start")}>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Card
                className={cn(
                  "px-4 py-3 max-w-full relative",
                  isUser
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                )}
              >
                <div className="text-sm break-words overflow-wrap-anywhere prose prose-sm max-w-none dark:prose-invert">
                  {isUser ? (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>

                {/* Show download button for matching uploaded files */}
                {matchingFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    asChild
                  >
                    <a
                      href={matchingFile.download_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </a>
                  </Button>
                )}

                {/* Legacy: Show download button if message has direct download_url */}
                {!matchingFile && isFile && message.download_url && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2 w-full"
                    asChild
                  >
                    <a
                      href={message.download_url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                )}
              </Card>
            </TooltipTrigger>
            {message.message_id && (
              <TooltipContent side="top" className="max-w-xs">
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium">Message ID:</span>
                  <code className="text-xs font-mono bg-gray-800 px-2 py-1 rounded">
                    {message.message_id}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 h-6 text-xs"
                    onClick={handleCopyMessageId}
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        <span className="text-xs text-gray-500 dark:text-gray-400 px-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
    </div>
  );
}
