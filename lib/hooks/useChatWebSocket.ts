"use client";

import { useEffect } from "react";
import { WebSocketManager } from "@/lib/services/websocket-manager";
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

    // Create WebSocket manager with chat-specific URL
    const wsManager = new WebSocketManager({
      url: wsUrl,
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      heartbeatMessage: "ping",
    });

    // Register message handler
    wsManager.on("message", (data: unknown) => {
      try {
        const message = data as WebSocketMessage;
        onMessage(message);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    // Register error handler
    wsManager.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Connect
    wsManager.connect();

    // Cleanup on unmount
    return () => {
      wsManager.disconnect();
    };
  }, [chatId, onMessage]);
}
