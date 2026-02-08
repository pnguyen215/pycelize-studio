"use client";

import { useRef, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage as ChatMessageType } from "@/lib/api/chatbot";
import { ChatMessage } from "./chat-message";
import { WorkflowProgress } from "./workflow-progress";
import { WorkflowProgress as WorkflowProgressType } from "@/lib/hooks/useChatBot";

interface ChatMessagesProps {
  messages: ChatMessageType[];
  workflowProgress?: WorkflowProgressType | null;
}

export function ChatMessages({ messages, workflowProgress }: ChatMessagesProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, workflowProgress]);

  return (
    <ScrollArea className="flex-1 p-4">
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
