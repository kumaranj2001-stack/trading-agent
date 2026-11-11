/**
 * Strict API Rate Limiter
 * 
 * Token-bucket algorithm enforcing strict rate limiting and debouncing on order execution
 * to prevent duplicate order bursts, rapid clicking, and broker reject cascades.
 */
export class ApiRateLimiter {
  private static instance: ApiRateLimiter;
  
  // Rate limit thresholds
  private readonly maxOrdersPerWindow: number = 3;
  private readonly windowMs: number = 2000; // 2 seconds
  private readonly minOrderDebounceMs: number = 400; // 400ms per pair
  
  private orderTimestamps: number[] = [];
  private lastOrderBySymbol: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ApiRateLimiter {
    if (!ApiRateLimiter.instance) {
      ApiRateLimiter.instance = new ApiRateLimiter();
    }
    return ApiRateLimiter.instance;
  }

  /**
   * Verify if an order execution is permitted under strict rate limiting rules
   */
  public canExecuteOrder(symbol: string): {
    allowed: boolean;
    reason?: string;
    retryAfterMs?: number;
  } {
    const now = Date.now();

    // 1. Debounce check per symbol
    const lastExecution = this.lastOrderBySymbol.get(symbol);
    if (lastExecution && (now - lastExecution) < this.minOrderDebounceMs) {
      const waitMs = this.minOrderDebounceMs - (now - lastExecution);
      return {
        allowed: false,
        reason: `Rate limit: Debounce active on ${symbol}. Please wait ${waitMs}ms.`,
        retryAfterMs: waitMs,
      };
    }

    // 2. Sliding window check
    this.orderTimestamps = this.orderTimestamps.filter(t => (now - t) < this.windowMs);
    if (this.orderTimestamps.length >= this.maxOrdersPerWindow) {
      const oldestInWindow = this.orderTimestamps[0];
      const waitMs = Math.max(50, this.windowMs - (now - oldestInWindow));
      return {
        allowed: false,
        reason: `API Rate limit exceeded: Max ${this.maxOrdersPerWindow} orders per ${this.windowMs / 1000}s reached. Try again in ${waitMs}ms.`,
        retryAfterMs: waitMs,
      };
    }

    return { allowed: true };
  }

  /**
   * Record that an order was dispatched
   */
  public recordOrderExecution(symbol: string): void {
    const now = Date.now();
    this.orderTimestamps.push(now);
    this.lastOrderBySymbol.set(symbol, now);
  }

  /**
   * Reset rate limiter state
   */
  public reset(): void {
    this.orderTimestamps = [];
    this.lastOrderBySymbol.clear();
  }
}

export const apiRateLimiter = ApiRateLimiter.getInstance();
