"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage as ChatMessageType } from "@/lib/api/types";
import { ChatMessage } from "./chat-message";
import { WorkflowProgress } from "./workflow-progress";
import type { WorkflowProgress as WorkflowProgressType } from "@/lib/hooks/useChatBot";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  workflowProgress?: WorkflowProgressType | null;
}

export function ChatMessages({ messages, workflowProgress }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages, workflowProgress]);

  return (
    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
      <div ref={scrollRef} className="space-y-4">
        {messages.map((message, index) => (
          <ChatMessage key={index} message={message} />
        ))}

        {workflowProgress && (
          <WorkflowProgress progress={workflowProgress} />
        )}

        {messages.length === 0 && !workflowProgress && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">Welcome to Pycelize Chat Bot</p>
              <p className="text-sm mt-2">
                Upload a file or send a message to get started
              </p>
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}
