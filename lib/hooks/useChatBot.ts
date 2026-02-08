"use client";

import { useState, useCallback } from "react";
import { chatBotAPI } from "@/lib/api/chatbot";
import type { ChatMessage, WorkflowStep } from "@/lib/api/types";
import { NotificationManager } from "@/lib/services/notification-manager";

export interface WorkflowProgress {
  operation: string;
  progress: number;
  status: string;
  message: string;
}

/**
 * Hook for managing chat bot interactions
 */
export function useChatBot() {
  const [chatId, setChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingWorkflow, setPendingWorkflow] = useState<{
    steps: WorkflowStep[];
  } | null>(null);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);

  /**
   * Initialize chat conversation
   */
  const initChat = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await chatBotAPI.createConversation();
      const conversation = response.data;
      setChatId(conversation.chat_id);
      
      // Add welcome message if available
      if (conversation.bot_message) {
        setMessages([
          {
            type: "system",
            content: conversation.bot_message,
            timestamp: new Date(conversation.created_at),
          },
        ]);
      }
      
      return conversation;
    } catch (error) {
      console.error("Error initializing chat:", error);
      NotificationManager.error("Failed to initialize chat");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load existing conversation history
   */
  const loadConversation = useCallback(async (existingChatId: string) => {
    try {
      setIsLoading(true);
      setChatId(existingChatId);
      
      const response = await chatBotAPI.getHistory(existingChatId, 500);
      const history = response.data;
      
      // Convert history items to chat messages
      const loadedMessages: ChatMessage[] = history.map((item) => ({
        type: item.participant === "user" ? "user" : "system",
        content: item.message,
        timestamp: new Date(item.timestamp),
        file_path: item.file_path,
        download_url: item.download_url,
      }));
      
      setMessages(loadedMessages);
      
      return loadedMessages;
    } catch (error) {
      console.error("Error loading conversation:", error);
      NotificationManager.error("Failed to load conversation");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Send a text message
   */
  const sendMessage = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim()) return;

      try {
        setIsLoading(true);

        // Add user message
        const userMessage: ChatMessage = {
          type: "user",
          content: text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, userMessage]);

        // Send to backend
        const apiResponse = await chatBotAPI.sendMessage(chatId, text);
        const response = apiResponse.data;

        // Add bot response
        const botMessage: ChatMessage = {
          type: "system",
          content: response.bot_response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Handle suggested workflow
        if (response.suggested_workflow?.requires_confirmation) {
          setPendingWorkflow(response.suggested_workflow);
        }
      } catch (error) {
        console.error("Error sending message:", error);
        NotificationManager.error("Failed to send message");
      } finally {
        setIsLoading(false);
      }
    },
    [chatId]
  );

  /**
   * Upload a file
   */
  const uploadFile = useCallback(
    async (file: File) => {
      if (!chatId) return;

      try {
        setIsLoading(true);

        // Add file message
        const fileMessage: ChatMessage = {
          type: "file",
          content: `Uploaded file: ${file.name}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, fileMessage]);

        // Upload file
        const apiResponse = await chatBotAPI.uploadFile(chatId, file);
        const response = apiResponse.data;

        // Add bot response
        const botMessage: ChatMessage = {
          type: "system",
          content: response.bot_response,
          timestamp: new Date(),
          file_path: response.file_path,
          download_url: response.download_url,
        };
        setMessages((prev) => [...prev, botMessage]);

        // Handle suggested workflow
        if (response.suggested_workflow?.requires_confirmation) {
          setPendingWorkflow(response.suggested_workflow);
        }
      } catch (error) {
        console.error("Error uploading file:", error);
        NotificationManager.error("Failed to upload file");
      } finally {
        setIsLoading(false);
      }
    },
    [chatId]
  );

  /**
   * Confirm or cancel workflow
   */
  const confirmWorkflow = useCallback(
    async (confirmed: boolean) => {
      if (!chatId) return;

      try {
        setIsLoading(true);

        const apiResponse = await chatBotAPI.confirmWorkflow(chatId, confirmed);
        const response = apiResponse.data;

        // Add confirmation message
        const confirmMessage: ChatMessage = {
          type: "user",
          content: confirmed ? "✓ Confirmed workflow" : "✗ Cancelled workflow",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, confirmMessage]);

        // Add bot response
        const botMessage: ChatMessage = {
          type: "system",
          content: response.bot_response,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);

        // Add download links if available
        if (response.output_files && response.output_files.length > 0) {
          const fileMessages = response.output_files.map((file) => ({
            type: "file" as const,
            content: `Download: ${file.file_path}`,
            timestamp: new Date(),
            file_path: file.file_path,
            download_url: file.download_url,
          }));
          setMessages((prev) => [...prev, ...fileMessages]);
        }

        // Clear pending workflow
        setPendingWorkflow(null);
      } catch (error) {
        console.error("Error confirming workflow:", error);
        NotificationManager.error("Failed to confirm workflow");
      } finally {
        setIsLoading(false);
      }
    },
    [chatId]
  );

  /**
   * Delete conversation
   */
  const deleteConversation = useCallback(async () => {
    if (!chatId) return;

    try {
      await chatBotAPI.deleteConversation(chatId);
      setChatId(null);
      setMessages([]);
      setPendingWorkflow(null);
      setWorkflowProgress(null);
      NotificationManager.success("Conversation deleted");
    } catch (error) {
      console.error("Error deleting conversation:", error);
      NotificationManager.error("Failed to delete conversation");
    }
  }, [chatId]);

  return {
    chatId,
    messages,
    isLoading,
    pendingWorkflow,
    workflowProgress,
    initChat,
    loadConversation,
    sendMessage,
    uploadFile,
    confirmWorkflow,
    deleteConversation,
    setWorkflowProgress,
  };
}
