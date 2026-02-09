"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/api/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bot, User, Download, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/chat-utils";
import { NotificationManager } from "@/lib/services/notification-manager";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";
  const isFile = message.type === "file";
  const participantName = message.participant_name || (isUser ? "You" : "Assistant");

  const handleCopyMessageId = async () => {
    if (message.message_id) {
      const success = await copyToClipboard(message.message_id);
      if (success) {
        NotificationManager.success("Message ID copied");
      } else {
        NotificationManager.error("Failed to copy message ID");
      }
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
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
        <Card
          className={cn(
            "px-4 py-3 max-w-full",
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

          {isFile && message.download_url && (
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

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.message_id && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0"
                    onClick={handleCopyMessageId}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Message ID: {message.message_id.slice(0, 8)}...</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
