/**
 * Chat Bot API Client
 *
 * Provides all API endpoints for chat bot conversations and workflows
 */

import { api } from "./client";
import type {
  StandardResponse,
  ChatConversation,
  MessageResponse,
  FileUploadResponse,
  WorkflowConfirmResponse,
  ChatHistoryItem,
  ChatHistoryResponse,
  SupportedOperationsResponse,
  WorkflowsListResponse,
  WorkflowStep,
} from "./types";

/**
 * Chat Bot API Client
 */
export const chatBotAPI = {
  /**
   * Create a new conversation
   * @returns New conversation
   */
  async createConversation(): Promise<StandardResponse<ChatConversation>> {
    return await api.post(
      "/chat/bot/conversations",
      {},
      {
        notification: { enabled: false },
        retry: { retries: 2 },
        rateLimit: { maxRequests: 10, timeWindow: 1000 },
      }
    );
  },

  /**
   * Send a message to the chat bot
   * @param chatId - The ID of the conversation
   * @param message - The message to send
   * @returns Message response
   */
  async sendMessage(
    chatId: string,
    message: string
  ): Promise<StandardResponse<MessageResponse>> {
    return await api.post(
      `/chat/bot/conversations/${chatId}/message`,
      { message },
      {
        notification: { enabled: false },
        retry: { retries: 2 },
        rateLimit: { maxRequests: 10, timeWindow: 1000 },
      }
    );
  },

  /**
   * Upload a file to the chat
   * @param chatId - The ID of the conversation
   * @param file - The file to upload
   * @returns File upload response
   */
  async uploadFile(
    chatId: string,
    file: File
  ): Promise<StandardResponse<FileUploadResponse>> {
    const form = new FormData();
    form.append("file", file);

    return await api.post(`/chat/bot/conversations/${chatId}/upload`, form, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Confirm or cancel a workflow
   * @param chatId - The ID of the conversation
   * @param confirmed - Whether to confirm or cancel the workflow
   * @param modifiedWorkflow - Optional modified workflow steps
   * @returns Workflow confirm response
   */
  async confirmWorkflow(
    chatId: string,
    confirmed: boolean,
    modifiedWorkflow?: WorkflowStep[]
  ): Promise<StandardResponse<WorkflowConfirmResponse>> {
    const requestBody: {
      confirmed: boolean;
      modified_workflow?: WorkflowStep[];
    } = { confirmed };

    if (modifiedWorkflow && modifiedWorkflow.length > 0) {
      requestBody.modified_workflow = modifiedWorkflow;
    }

    return await api.post(
      `/chat/bot/conversations/${chatId}/confirm`,
      requestBody,
      {
        notification: { enabled: true },
        retry: { retries: 2 },
        rateLimit: { maxRequests: 10, timeWindow: 1000 },
      }
    );
  },

  /**
   * Get conversation history
   * @param chatId - The ID of the conversation
   * @param limit - Maximum number of messages to retrieve (default: 500)
   * @returns Conversation history
   */
  async getHistory(
    chatId: string,
    limit: number = 500
  ): Promise<StandardResponse<ChatHistoryResponse>> {
    return await api.get(
      `/chat/bot/conversations/${chatId}/history?limit=${limit}`,
      {
        notification: { enabled: false },
        retry: { retries: 2 },
        rateLimit: { maxRequests: 10, timeWindow: 1000 },
      }
    );
  },

  /**
   * Delete a conversation
   * @param chatId - The ID of the conversation
   * @returns Void response
   */
  async deleteConversation(chatId: string): Promise<StandardResponse<void>> {
    return await api.delete(`/chat/bot/conversations/${chatId}`, {
      notification: { enabled: true },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * Get supported operations
   * @returns Supported operations
   */
  async getSupportedOperations(): Promise<
    StandardResponse<SupportedOperationsResponse>
  > {
    return await api.get("/chat/bot/operations", {
      notification: { enabled: false },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },

  /**
   * List all conversations
   * @returns List of conversations
   */
  async listConversations(): Promise<StandardResponse<WorkflowsListResponse>> {
    return await api.get("/chat/workflows", {
      notification: { enabled: false },
      retry: { retries: 2 },
      rateLimit: { maxRequests: 10, timeWindow: 1000 },
    });
  },
};
