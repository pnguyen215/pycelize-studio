"use client";

import { useEffect, useRef } from "react";
import { WebSocketManager } from "@/lib/services/websocket-manager";

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
  const wsManager = useRef<WebSocketManager | null>(null);

  useEffect(() => {
    if (!chatId) return;

    // Get the WebSocket URL based on the API URL
    const apiUrl = process.env.NEXT_PUBLIC_PYCELIZE_API_URL || "http://localhost:5050/api/v1";
    const wsUrl = apiUrl
      .replace(/^http/, "ws")
      .replace("/api/v1", "")
      + `/chat/${chatId}`;

    // Create WebSocket manager with chat-specific URL
    wsManager.current = new WebSocketManager({
      url: wsUrl,
      autoReconnect: true,
      maxReconnectAttempts: 5,
      reconnectDelay: 1000,
      heartbeatInterval: 30000,
      heartbeatMessage: "ping",
    });

    // Register message handler
    wsManager.current.on("message", (data: unknown) => {
      try {
        const message = data as WebSocketMessage;
        onMessage(message);
      } catch (error) {
        console.error("Error handling WebSocket message:", error);
      }
    });

    // Register error handler
    wsManager.current.on("error", (error) => {
      console.error("WebSocket error:", error);
    });

    // Connect
    wsManager.current.connect();

    // Cleanup on unmount
    return () => {
      wsManager.current?.disconnect();
      wsManager.current = null;
    };
  }, [chatId, onMessage]);

  return wsManager.current;
}
