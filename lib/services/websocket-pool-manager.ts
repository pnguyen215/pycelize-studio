/**
 * WebSocket Connection Pool Manager
 *
 * Manages multiple WebSocket connections with automatic cleanup
 * and connection limits. Ensures proper resource management by
 * closing idle connections when the pool is full.
 *
 * @module lib/services/websocket-pool-manager
 */

import { WebSocketManager, WebSocketConfig } from "./websocket-manager";
import { EEnv } from "@/configs/env";

interface PooledConnection {
  id: string;
  manager: WebSocketManager;
  lastActivity: number;
  isActive: boolean;
}

/**
 * WebSocket Pool Manager Class
 *
 * Manages a pool of WebSocket connections with configurable limits
 */
export class WebSocketPoolManager {
  private static instance: WebSocketPoolManager;
  private connections: Map<string, PooledConnection> = new Map();
  private maxConnections: number;

  private constructor() {
    this.maxConnections = EEnv.NEXT_PUBLIC_MAX_WEBSOCKET_CONNECTIONS;
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): WebSocketPoolManager {
    if (!WebSocketPoolManager.instance) {
      WebSocketPoolManager.instance = new WebSocketPoolManager();
    }
    return WebSocketPoolManager.instance;
  }

  /**
   * Get or create a WebSocket connection
   */
  public getConnection(
    connectionId: string,
    url: string,
    config?: Omit<WebSocketConfig, 'url'>
  ): WebSocketManager {
    // Check if connection already exists
    const existing = this.connections.get(connectionId);
    if (existing) {
      existing.lastActivity = Date.now();
      existing.isActive = true;
      return existing.manager;
    }

    // Check if we need to close old connections
    if (this.connections.size >= this.maxConnections) {
      this.closeOldestIdleConnection();
    }

    // Create new connection
    const manager = new WebSocketManager({ url, ...config });
    const pooledConnection: PooledConnection = {
      id: connectionId,
      manager,
      lastActivity: Date.now(),
      isActive: true,
    };

    this.connections.set(connectionId, pooledConnection);

    // Setup disconnect handler to mark as inactive
    manager.on("close", () => {
      const conn = this.connections.get(connectionId);
      if (conn) {
        conn.isActive = false;
      }
    });

    return manager;
  }

  /**
   * Close a specific connection
   */
  public closeConnection(connectionId: string): void {
    const connection = this.connections.get(connectionId);
    if (connection) {
      connection.manager.disconnect();
      this.connections.delete(connectionId);
    }
  }

  /**
   * Close the oldest idle connection to make room for new ones
   */
  private closeOldestIdleConnection(): void {
    let oldestConnection: PooledConnection | null = null;
    let oldestTime = Date.now();

    // Find the oldest inactive connection first
    for (const connection of this.connections.values()) {
      if (!connection.isActive && connection.lastActivity < oldestTime) {
        oldestConnection = connection;
        oldestTime = connection.lastActivity;
      }
    }

    // If no inactive connections, find the oldest active one
    if (!oldestConnection) {
      for (const connection of this.connections.values()) {
        if (connection.lastActivity < oldestTime) {
          oldestConnection = connection;
          oldestTime = connection.lastActivity;
        }
      }
    }

    // Close the oldest connection
    if (oldestConnection) {
      console.log(`Closing oldest connection: ${oldestConnection.id} to make room for new connection`);
      this.closeConnection(oldestConnection.id);
    }
  }

  /**
   * Get current connection count
   */
  public getConnectionCount(): number {
    return this.connections.size;
  }

  /**
   * Get active connection count
   */
  public getActiveConnectionCount(): number {
    return Array.from(this.connections.values()).filter((c) => c.isActive).length;
  }

  /**
   * Close all connections
   */
  public closeAll(): void {
    for (const connection of this.connections.values()) {
      connection.manager.disconnect();
    }
    this.connections.clear();
  }
}

/**
 * Default pool manager instance
 */
export const defaultPoolManager = WebSocketPoolManager.getInstance();
