/**
 * Chat Bot API Client
 * 
 * Provides all API endpoints for chat bot conversations and workflows
 */

import { EEnv } from "@/configs/env";
import axiosInstance from "./axios-instance";

const API_BASE = EEnv.NEXT_PUBLIC_PYCELIZE_API_URL;

/**
 * Chat message type
 */
export interface ChatMessage {
  type: "user" | "system" | "file";
  content: string;
  timestamp: Date;
  file_path?: string;
  download_url?: string;
}

/**
 * Workflow step
 */
export interface WorkflowStep {
  operation: string;
  arguments: Record<string, unknown>;
  description?: string;
}

/**
 * Chat conversation response
 */
export interface ChatConversation {
  chat_id: string;
  participant_name: string;
  bot_message: string;
  created_at: string;
}

/**
 * Message response
 */
export interface MessageResponse {
  bot_response: string;
  suggested_workflow?: {
    steps: WorkflowStep[];
    requires_confirmation: boolean;
  };
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  file_path: string;
  download_url: string;
  bot_response: string;
  suggested_workflow?: {
    steps: WorkflowStep[];
    requires_confirmation: boolean;
  };
}

/**
 * Workflow confirmation response
 */
export interface WorkflowConfirmResponse {
  bot_response: string;
  output_files?: Array<{
    file_path: string;
    download_url: string;
  }>;
}

/**
 * Chat history item
 */
export interface ChatHistoryItem {
  message_id: string;
  participant: string;
  message: string;
  timestamp: string;
  file_path?: string;
  download_url?: string;
}

/**
 * Supported operation
 */
export interface SupportedOperation {
  operation: string;
  description: string;
  parameters: Record<string, unknown>;
}

/**
 * Chat Bot API Client
 */
export const chatBotAPI = {
  /**
   * Create a new chat conversation
   */
  async createConversation(): Promise<ChatConversation> {
    const response = await axiosInstance.post("/chat/bot/conversations", {});
    return response.data.data;
  },

  /**
   * Send a message to the chat bot
   */
  async sendMessage(
    chatId: string,
    message: string
  ): Promise<MessageResponse> {
    const response = await axiosInstance.post(
      `/chat/bot/conversations/${chatId}/message`,
      { message }
    );
    return response.data.data;
  },

  /**
   * Upload a file to the chat
   */
  async uploadFile(
    chatId: string,
    file: File
  ): Promise<FileUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post(
      `/chat/bot/conversations/${chatId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data.data;
  },

  /**
   * Confirm or cancel a workflow
   */
  async confirmWorkflow(
    chatId: string,
    confirmed: boolean
  ): Promise<WorkflowConfirmResponse> {
    const response = await axiosInstance.post(
      `/chat/bot/conversations/${chatId}/confirm`,
      { confirmed }
    );
    return response.data.data;
  },

  /**
   * Get conversation history
   */
  async getHistory(chatId: string): Promise<ChatHistoryItem[]> {
    const response = await axiosInstance.get(
      `/chat/bot/conversations/${chatId}/history`
    );
    return response.data.data;
  },

  /**
   * Delete a conversation
   */
  async deleteConversation(chatId: string): Promise<void> {
    await axiosInstance.delete(`/chat/bot/conversations/${chatId}`);
  },

  /**
   * Get supported operations
   */
  async getSupportedOperations(): Promise<SupportedOperation[]> {
    const response = await axiosInstance.get("/chat/bot/operations");
    return response.data.data;
  },
};
