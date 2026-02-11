"use client";

import { useState } from "react";
import type { ChatMessage as ChatMessageType } from "@/lib/api/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Bot, User, Download, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { copyToClipboard } from "@/lib/utils/chat-utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";
  const isFile = message.type === "file";
  const participantName = message.participant_name || (isUser ? "You" : "Assistant");
  const [copiedMessageId, setCopiedMessageId] = useState(false);

  const handleCopyMessageId = async () => {
    if (message.message_id) {
      const success = await copyToClipboard(message.message_id);
      if (success) {
        setCopiedMessageId(true);
        setTimeout(() => setCopiedMessageId(false), 2000);
      }
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 mb-4 px-2",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div className="flex flex-col items-center gap-1 shrink-0">
        <Avatar className="h-10 w-10 shadow-md">
          <AvatarFallback className={cn(
            "font-semibold",
            isUser 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
              : "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white"
          )}>
            {isUser ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
          {participantName}
        </span>
      </div>

      <div className={cn("flex flex-col gap-1 flex-1 min-w-0 max-w-[75%]", isUser ? "items-end" : "items-start")}>
        <Card
          className={cn(
            "px-4 py-3 max-w-full shadow-sm",
            isUser
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white border-none shadow-blue-200 dark:shadow-blue-900/30"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-gray-200 dark:shadow-gray-900/30"
          )}
        >
          <div className={cn(
            "text-sm break-words overflow-wrap-anywhere prose prose-sm max-w-none",
            isUser ? "prose-invert" : "dark:prose-invert"
          )}>
            {isUser ? (
              <div className="whitespace-pre-wrap text-white">{message.content}</div>
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
              className={cn(
                "mt-2 w-full",
                isUser 
                  ? "bg-white/20 hover:bg-white/30 text-white border-white/30" 
                  : "bg-gray-100 dark:bg-gray-700"
              )}
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
          <span className={cn(
            "text-xs font-medium",
            isUser 
              ? "text-blue-600 dark:text-blue-400" 
              : "text-gray-500 dark:text-gray-400"
          )}>
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {message.message_id && (
            <TooltipProvider>
              <Tooltip open={copiedMessageId}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-5 w-5 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={handleCopyMessageId}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copied!</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </div>
  );
}
