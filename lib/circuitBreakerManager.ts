import { CurrencyPair } from './types';

export interface CircuitBreakerState {
  isTripped: boolean;
  status: 'NORMAL' | 'WARNING' | 'TRIPPED';
  tripReason?: string;
  tripTimestamp?: number;
  anomalousMovePercent?: number;
  anomalousSpreadMultiple?: number;
  drawdownPercent?: number;
  affectedPair?: CurrencyPair;
}

export type CircuitBreakerListener = (state: CircuitBreakerState) => void;

/**
 * Institutional Circuit Breaker Engine
 * 
 * Automatically halts new order entries and autopilot operations when:
 * 1. Extreme price flash crash / pump occurs (> 3.0% move within 60 seconds)
 * 2. Abnormal bid-ask spread expansion occurs (> 5x baseline spread)
 * 3. Daily portfolio drawdown exceeds maximum risk tolerance limit (>= 4.0%)
 */
export class CircuitBreakerManager {
  private static instance: CircuitBreakerManager;

  private state: CircuitBreakerState = {
    isTripped: false,
    status: 'NORMAL',
  };

  private listeners: Set<CircuitBreakerListener> = new Set();
  private priceHistory: Map<string, Array<{ price: number; timestamp: number }>> = new Map();

  // Thresholds
  private readonly max1MinMovePercent = 3.0; // 3% in 60s
  private readonly maxSpreadMultiplier = 5.0; // 5x average
  private readonly maxDailyDrawdownPercent = 4.0; // 4% equity drawdown

  private constructor() {}

  public static getInstance(): CircuitBreakerManager {
    if (!CircuitBreakerManager.instance) {
      CircuitBreakerManager.instance = new CircuitBreakerManager();
    }
    return CircuitBreakerManager.instance;
  }

  public getState(): CircuitBreakerState {
    return { ...this.state };
  }

  public subscribe(listener: CircuitBreakerListener): () => void {
    this.listeners.add(listener);
    listener({ ...this.state });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    const s = { ...this.state };
    this.listeners.forEach(fn => fn(s));
  }

  /**
   * Monitor live price ticks for flash crash/pump anomalies (1-minute window)
   */
  public evaluatePriceTick(pair: CurrencyPair, livePrice: number): boolean {
    if (this.state.isTripped) return false;

    const now = Date.now();
    let history = this.priceHistory.get(pair) || [];
    // Keep 60 seconds history
    history = history.filter(h => (now - h.timestamp) <= 60000);
    history.push({ price: livePrice, timestamp: now });
    this.priceHistory.set(pair, history);

    if (history.length >= 2) {
      const oldestPrice = history[0].price;
      const movePercent = Math.abs((livePrice - oldestPrice) / oldestPrice) * 100;

      if (movePercent >= this.max1MinMovePercent) {
        this.tripBreaker({
          reason: `FLASH ANOMALY: ${pair} moved ${movePercent.toFixed(2)}% in under 60 seconds (Limit: ${this.max1MinMovePercent}%). Trading automatically halted to preserve capital.`,
          movePercent,
          pair,
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate live bid-ask spread
   */
  public evaluateSpread(pair: CurrencyPair, currentSpreadPips: number, baselineSpreadPips: number): boolean {
    if (this.state.isTripped) return false;

    if (baselineSpreadPips > 0) {
      const multiple = currentSpreadPips / baselineSpreadPips;
      if (multiple >= this.maxSpreadMultiplier) {
        this.tripBreaker({
          reason: `LIQUIDITY WITHDRAWAL ANOMALY: Bid/Ask spread expanded to ${multiple.toFixed(1)}x normal baseline on ${pair} (${currentSpreadPips.toFixed(1)} pips). Trading halted.`,
          spreadMultiple: multiple,
          pair,
        });
        return true;
      }
    }

    return false;
  }

  /**
   * Evaluate portfolio drawdown
   */
  public evaluateDrawdown(currentDailyDrawdownPercent: number): boolean {
    if (this.state.isTripped) return false;

    if (currentDailyDrawdownPercent >= this.maxDailyDrawdownPercent) {
      this.tripBreaker({
        reason: `DAILY DRAWDOWN CEILING BREACHED: Account drawdown reached ${currentDailyDrawdownPercent.toFixed(2)}% (Max Limit: ${this.maxDailyDrawdownPercent}%). Circuit breaker engaged.`,
        drawdownPercent: currentDailyDrawdownPercent,
      });
      return true;
    }

    return false;
  }

  /**
   * Manually or automatically trip the circuit breaker
   */
  public tripBreaker(params: {
    reason: string;
    movePercent?: number;
    spreadMultiple?: number;
    drawdownPercent?: number;
    pair?: CurrencyPair;
  }): void {
    this.state = {
      isTripped: true,
      status: 'TRIPPED',
      tripReason: params.reason,
      tripTimestamp: Date.now(),
      anomalousMovePercent: params.movePercent,
      anomalousSpreadMultiple: params.spreadMultiple,
      drawdownPercent: params.drawdownPercent,
      affectedPair: params.pair,
    };
    this.notify();
  }

  /**
   * Check whether new trade execution is authorized
   */
  public canExecuteTrade(): { allowed: boolean; reason?: string } {
    if (this.state.isTripped) {
      return {
        allowed: false,
        reason: `CIRCUIT BREAKER ACTIVE: ${this.state.tripReason || 'Trading halted due to extreme market anomaly.'}`,
      };
    }
    return { allowed: true };
  }

  /**
   * Reset the circuit breaker to NORMAL after market stabilization
   */
  public resetCircuitBreaker(): void {
    this.state = {
      isTripped: false,
      status: 'NORMAL',
    };
    this.priceHistory.clear();
    this.notify();
  }

  public reset(): void {
    this.resetCircuitBreaker();
  }
}

export const circuitBreakerManager = CircuitBreakerManager.getInstance();
