"use client";

import { useEffect } from "react";
import { WebSocketPoolManager } from "@/lib/services/websocket-pool-manager";
import { EEnv } from "@/configs/env";

/**
 * WebSocket message handler
 */
export interface WebSocketMessage {
  type: "connected" | "workflow_started" | "progress" | "workflow_completed" | "workflow_failed";
  message?: string;
  progress?: number;
  operation?: string;
  status?: string;
  error?: string;
}

/**
 * Hook for managing chat WebSocket connection
 */
export function useChatWebSocket(
  chatId: string | null,
  onMessage: (message: WebSocketMessage) => void
) {
  useEffect(() => {
    if (!chatId) return;

    // Get the WebSocket URL from centralized config
    const wsUrl = `${EEnv.NEXT_PUBLIC_PYCELIZE_WS_URL}/chat/${chatId}`;

    // Get or create WebSocket connection from pool
    const poolManager = WebSocketPoolManager.getInstance();
    const wsManager = poolManager.getConnection(chatId, wsUrl, {
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      heartbeatMessage: "ping",
    });

    // Register message handler
    const messageHandler = (data: unknown) => {
      try {
        const message = data as WebSocketMessage;
        onMessage(message);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    };

    // Register error handler
    const errorHandler = (error: unknown) => {
      console.error("WebSocket error:", error);
    };

    wsManager.on("message", messageHandler);
    wsManager.on("error", errorHandler);

    // Connect if not already connected
    if (!wsManager.isConnected()) {
      wsManager.connect();
    }

    // Cleanup on unmount - close the connection
    return () => {
      wsManager.off("message", messageHandler);
      wsManager.off("error", errorHandler);
      poolManager.closeConnection(chatId);
    };
  }, [chatId, onMessage]);
}
