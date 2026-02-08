"use client";

import type { ChatMessage as ChatMessageType } from "@/lib/api/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";
  const isFile = message.type === "file";
  const participantName = message.participant_name || (isUser ? "You" : "Assistant");

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
