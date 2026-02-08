"use client";

import { ChatMessage as ChatMessageType } from "@/lib/api/chatbot";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Bot, User, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.type === "user";
  const isFile = message.type === "file";

  return (
    <div
      className={cn(
        "flex gap-3 mb-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarFallback className={cn(
          isUser ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
        )}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn("flex flex-col gap-1", isUser ? "items-end" : "items-start")}>
        <Card
          className={cn(
            "px-4 py-2 max-w-[70%]",
            isUser
              ? "bg-blue-500 text-white border-blue-500"
              : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          )}
        >
          <div className="text-sm whitespace-pre-wrap break-words">
            {message.content}
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
