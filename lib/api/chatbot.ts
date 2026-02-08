/**
 * Chat Bot API Client
 * 
 * Provides all API endpoints for chat bot conversations and workflows
 */

import { axiosInstance } from "./axios-instance";
import type {
  ChatConversation,
  MessageResponse,
  FileUploadResponse,
  WorkflowConfirmResponse,
  ChatHistoryItem,
  SupportedOperation,
} from "./types";

/**
 * Chat Bot API Client
 */
export const chatBotAPI = {
  /**
   * Create a new chat conversation
   */
  async createConversation(): Promise<ChatConversation> {
    const response = await axiosInstance.post("/chat/bot/conversations", {});
    return response.data;
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
    return response.data;
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
    return response.data;
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
    return response.data;
  },

  /**
   * Get conversation history
   */
  async getHistory(chatId: string): Promise<ChatHistoryItem[]> {
    const response = await axiosInstance.get(
      `/chat/bot/conversations/${chatId}/history`
    );
    return response.data;
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
    return response.data;
  },
};
