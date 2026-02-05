/**
 * WebSocket Manager Service
 *
 * This module provides WebSocket connectivity with:
 * - Automatic reconnection
 * - Event handling
 * - Connection state management
 * - Heartbeat/ping-pong support
 *
 * @module lib/services/websocket-manager
 */

import { EEnv } from "@/configs/env";

/**
 * WebSocket connection state
 */
export enum WebSocketState {
  CONNECTING = "CONNECTING",
  CONNECTED = "CONNECTED",
  DISCONNECTING = "DISCONNECTING",
  DISCONNECTED = "DISCONNECTED",
  RECONNECTING = "RECONNECTING",
  ERROR = "ERROR",
}

/**
 * WebSocket event types
 */
export type WebSocketEventType =
  | "open"
  | "close"
  | "error"
  | "message"
  | "reconnect"
  | "stateChange";

/**
 * WebSocket event handler
 */
export type WebSocketEventHandler<T = unknown> = (data: T) => void;

/**
 * WebSocket configuration
 */
export interface WebSocketConfig {
  /**
   * WebSocket server URL
   */
  url?: string;

  /**
   * Whether to automatically reconnect on disconnect
   * @default true
   */
  autoReconnect?: boolean;

  /**
   * Maximum reconnection attempts
   * @default 5
   */
  maxReconnectAttempts?: number;

  /**
   * Initial reconnection delay in milliseconds
   * @default 1000
   */
  reconnectDelay?: number;

  /**
   * Maximum reconnection delay in milliseconds
   * @default 30000
   */
  maxReconnectDelay?: number;

  /**
   * Heartbeat interval in milliseconds (0 to disable)
   * @default 30000
   */
  heartbeatInterval?: number;

  /**
   * Heartbeat message
   * @default 'ping'
   */
  heartbeatMessage?: string;

  /**
   * Protocols to use
   */
  protocols?: string | string[];
}

/**
 * WebSocket Manager Class
 *
 * Manages WebSocket connections with automatic reconnection,
 * event handling, and heartbeat support.
 */
export class WebSocketManager {
  private socket: WebSocket | null = null;
  private state: WebSocketState = WebSocketState.DISCONNECTED;
  private config: Required<Omit<WebSocketConfig, "protocols">> &
    Pick<WebSocketConfig, "protocols">;
  private eventHandlers = new Map<
    WebSocketEventType,
    Set<WebSocketEventHandler>
  >();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private heartbeatTimer: NodeJS.Timeout | null = null;

  constructor(config: WebSocketConfig = {}) {
    this.config = {
      url: config.url || this.getDefaultWebSocketUrl(),
      autoReconnect: config.autoReconnect !== false,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 1000,
      maxReconnectDelay: config.maxReconnectDelay || 30000,
      heartbeatInterval: config.heartbeatInterval ?? 30000,
      heartbeatMessage: config.heartbeatMessage || "ping",
      protocols: config.protocols,
    };
  }

  /**
   * Gets default WebSocket URL from API URL
   */
  private getDefaultWebSocketUrl(): string {
    const apiUrl = EEnv.NEXT_PUBLIC_PYCELIZE_API_URL;
    return apiUrl.replace(/^http/, "ws").replace("/api/v1", "/ws");
  }

  /**
   * Updates connection state and notifies handlers
   */
  private setState(newState: WebSocketState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.emit("stateChange", { state: newState });
    }
  }

  /**
   * Starts heartbeat timer
   */
  private startHeartbeat(): void {
    if (this.config.heartbeatInterval <= 0) return;

    this.heartbeatTimer = setInterval(() => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN) {
        this.send(this.config.heartbeatMessage);
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stops heartbeat timer
   */
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  /**
   * Attempts to reconnect
   */
  private attemptReconnect(): void {
    if (!this.config.autoReconnect) return;
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.setState(WebSocketState.ERROR);
      return;
    }

    this.setState(WebSocketState.RECONNECTING);
    this.reconnectAttempts++;

    // Calculate exponential backoff delay
    const delay = Math.min(
      this.config.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.config.maxReconnectDelay
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect();
      this.emit("reconnect", { attempt: this.reconnectAttempts });
    }, delay);
  }

  /**
   * Connects to WebSocket server
   */
  public connect(): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    this.setState(WebSocketState.CONNECTING);

    try {
      this.socket = new WebSocket(this.config.url, this.config.protocols);

      this.socket.onopen = () => {
        this.setState(WebSocketState.CONNECTED);
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit("open", {});
      };

      this.socket.onclose = (event) => {
        this.setState(WebSocketState.DISCONNECTED);
        this.stopHeartbeat();
        this.emit("close", { code: event.code, reason: event.reason });

        if (!event.wasClean && this.config.autoReconnect) {
          this.attemptReconnect();
        }
      };

      this.socket.onerror = (event) => {
        this.setState(WebSocketState.ERROR);
        this.emit("error", { error: event });
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.emit("message", data);
        } catch {
          // Handle non-JSON messages
          this.emit("message", event.data);
        }
      };
    } catch (error) {
      this.setState(WebSocketState.ERROR);
      this.emit("error", { error });
    }
  }

  /**
   * Disconnects from WebSocket server
   *
   * @param code - Close code
   * @param reason - Close reason
   */
  public disconnect(code?: number, reason?: string): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.socket) {
      this.setState(WebSocketState.DISCONNECTING);
      this.socket.close(code, reason);
      this.socket = null;
    }

    this.setState(WebSocketState.DISCONNECTED);
  }

  /**
   * Sends data through WebSocket
   *
   * @param data - Data to send (will be JSON stringified if object)
   */
  public send(data: unknown): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    const message = typeof data === "string" ? data : JSON.stringify(data);
    this.socket.send(message);
  }

  /**
   * Registers an event handler
   *
   * @param event - Event type
   * @param handler - Event handler function
   */
  public on<T = unknown>(
    event: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler as WebSocketEventHandler);
  }

  /**
   * Unregister an event handler
   *
   * @param event - Event type
   * @param handler - Event handler function
   */
  public off<T = unknown>(
    event: WebSocketEventType,
    handler: WebSocketEventHandler<T>
  ): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler as WebSocketEventHandler);
    }
  }

  /**
   * Emits an event to all registered handlers
   *
   * @param event - Event type
   * @param data - Event data
   */
  private emit<T = unknown>(event: WebSocketEventType, data: T): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }

  /**
   * Gets current connection state
   */
  public getState(): WebSocketState {
    return this.state;
  }

  /**
   * Checks if connected
   */
  public isConnected(): boolean {
    return this.state === WebSocketState.CONNECTED;
  }
}

/**
 * Default WebSocket manager instance
 */
export const defaultWebSocketManager = new WebSocketManager();
