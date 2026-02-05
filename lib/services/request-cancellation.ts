/**
 * Request Cancellation Utilities
 *
 * This module provides utilities for cancelling HTTP requests using AbortController.
 *
 * @module lib/services/request-cancellation
 */

/**
 * Request cancellation manager
 */
export class RequestCancellation {
  private controllers = new Map<string, AbortController>();

  /**
   * Creates a new AbortController for a request
   *
   * @param key - Unique key for this request
   * @returns AbortSignal to attach to the request
   */
  public createSignal(key: string): AbortSignal {
    // Cancel any existing request with the same key
    this.cancel(key);

    const controller = new AbortController();
    this.controllers.set(key, controller);

    return controller.signal;
  }

  /**
   * Cancels a specific request
   *
   * @param key - Request key to cancel
   * @param reason - Optional cancellation reason
   */
  public cancel(key: string, reason?: string): void {
    const controller = this.controllers.get(key);

    if (controller) {
      controller.abort(reason);
      this.controllers.delete(key);
    }
  }

  /**
   * Cancels all pending requests
   *
   * @param reason - Optional cancellation reason
   */
  public cancelAll(reason?: string): void {
    this.controllers.forEach((controller) => {
      controller.abort(reason);
    });
    this.controllers.clear();
  }

  /**
   * Checks if a request is pending
   *
   * @param key - Request key to check
   * @returns True if request is pending
   */
  public isPending(key: string): boolean {
    return this.controllers.has(key);
  }

  /**
   * Gets count of pending requests
   *
   * @returns Number of pending requests
   */
  public pendingCount(): number {
    return this.controllers.size;
  }
}

/**
 * Global request cancellation manager
 */
export const requestCancellation = new RequestCancellation();
