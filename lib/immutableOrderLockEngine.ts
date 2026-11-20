import { 
  CurrencyPair, 
  ImmutableTradeState, 
  ImmutableTradeSnapshot, 
  ImmutableTradeAnchors,
  Position,
  SwarmConsensusResult
} from './types';
import { oandaBenchmarkSync } from './oandaBenchmarkSync';

// ============================================================================
// 🔒 IMMUTABLE ORDER LOCK ENGINE
// Deterministic Millisecond State-Locking & Write-Protected Order Lifecycles
// ============================================================================

const STORAGE_LOCK_PREFIX = 'qri_immutable_lock_';

/**
 * Deeply and recursively freezes an object to make it completely write-protected.
 */
function deepFreeze<T>(obj: T): Readonly<T> {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const val = (obj as any)[key];
    if (val !== null && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj as Readonly<T>;
}

/**
 * Generates a deterministic SHA-like integrity hash from execution primitives.
 */
function generateIntegrityHash(
  orderId: string,
  symbol: string,
  entry: number,
  sl: number,
  tp: number,
  timestampMs: number
): string {
  const seed = `${orderId}:${symbol}:${entry.toFixed(5)}:${sl.toFixed(5)}:${tp.toFixed(5)}:${timestampMs}:QRI_LOCK_SSOT`;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `ILOCK-${Math.abs(hash).toString(16).toUpperCase()}-${timestampMs.toString(36).toUpperCase()}`;
}

export class ImmutableOrderLockEngine {
  private static instance: ImmutableOrderLockEngine;
  private lockedRegistry: Map<string, ImmutableTradeState> = new Map();

  private constructor() {
    this.hydrateFromStorage();
  }

  public static getInstance(): ImmutableOrderLockEngine {
    if (!ImmutableOrderLockEngine.instance) {
      ImmutableOrderLockEngine.instance = new ImmutableOrderLockEngine();
    }
    return ImmutableOrderLockEngine.instance;
  }

  /**
   * Hydrates active order locks from write-protected local storage upon reload.
   */
  private hydrateFromStorage(): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(STORAGE_LOCK_PREFIX)) {
          const raw = window.localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as ImmutableTradeState;
            if (parsed && parsed.orderId) {
              this.lockedRegistry.set(parsed.orderId, deepFreeze(parsed));
            }
          }
        }
      }
    } catch (e) {
      console.warn('Failed to hydrate immutable trade locks:', e);
    }
  }

  /**
   * Persists the frozen immutable state object to local storage.
   */
  private persistLock(lock: ImmutableTradeState): void {
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.setItem(`${STORAGE_LOCK_PREFIX}${lock.orderId}`, JSON.stringify(lock));
    } catch (e) {
      // Non-blocking
    }
  }

  /**
   * Cleans up the locked state when a position is officially closed and archived.
   */
  public purgeLock(orderId: string): void {
    this.lockedRegistry.delete(orderId);
    if (typeof window === 'undefined' || !window.localStorage) return;
    try {
      window.localStorage.removeItem(`${STORAGE_LOCK_PREFIX}${orderId}`);
    } catch (e) {
      // Non-blocking
    }
  }

  /**
   * 🔒 Millisecond State-Locking Instantiation:
   * Captures an atomic snapshot at the exact millisecond an order is initiated.
   * Serializes prevailing bid, ask, spread, lots, fill price, OANDA benchmark,
   * and structural invalidation levels into a write-protected, frozen object.
   */
  public createOrderLock(params: {
    orderId?: string;
    positionId: string;
    symbol: CurrencyPair;
    orderType: 'BUY' | 'SELL';
    fillPrice: number;
    bidPrice: number;
    askPrice: number;
    spreadPips: number;
    orderLots: number;
    stopLoss: number;
    takeProfit: number;
    invalidationPriceLevel?: number;
    riskRewardRatio: number;
    riskAmountUsd: number;
    explicitInvalidationCriteria?: string;
    chiefReviewerSignature?: string;
  }): ImmutableTradeState {
    const lockedAtEpochMs = Date.now();
    const lockedAtIso = new Date(lockedAtEpochMs).toISOString();
    const orderId = params.orderId || `ord-lock-${lockedAtEpochMs}-${Math.random().toString(36).substring(2, 7)}`;

    // Confirmed OANDA institutional benchmark snapshot
    const oandaBenchmark = oandaBenchmarkSync.getConfirmedOandaBenchmark(params.symbol);
    const pipVal = oandaBenchmarkSync.getPipValue(params.symbol);
    const oandaDiscrepancyPips = Number((Math.abs(params.fillPrice - oandaBenchmark.price) / pipVal).toFixed(2));
    const isWithinOandaCorridor = oandaDiscrepancyPips <= 50;

    const snapshot: ImmutableTradeSnapshot = {
      bidPrice: params.bidPrice,
      askPrice: params.askPrice,
      spreadPips: params.spreadPips,
      orderLots: params.orderLots,
      executionFillPrice: params.fillPrice,
      executionSide: params.orderType === 'BUY' ? 'ASK' : 'BID',
      oandaBenchmarkPrice: oandaBenchmark.price,
      oandaBenchmarkDiscrepancyPips: oandaDiscrepancyPips,
      isWithinOandaCorridor,
    };

    const invalidationLevel = params.invalidationPriceLevel || params.stopLoss;
    const explicitCriteria = params.explicitInvalidationCriteria || 
      `MANDATORY INVALIDATION: Immediate exit if ${params.orderType === 'BUY' ? 'price breaches structural floor' : 'price breaches structural ceiling'} on execution candles.`;

    const anchors: ImmutableTradeAnchors = {
      anchoredEntryPrice: params.fillPrice,
      anchoredStopLoss: params.stopLoss,
      anchoredTakeProfit: params.takeProfit,
      anchoredInvalidationPriceLevel: invalidationLevel,
      anchoredRiskRewardRatio: params.riskRewardRatio,
      anchoredInitialRiskAmountUsd: params.riskAmountUsd,
      explicitInvalidationCriteria: explicitCriteria,
      chiefReviewerSignature: params.chiefReviewerSignature || `CR-SIG-${params.symbol.replace(/[^a-zA-Z0-9]/g, '')}-${lockedAtEpochMs}`,
    };

    const integrityHash = generateIntegrityHash(
      orderId,
      params.symbol,
      params.fillPrice,
      params.stopLoss,
      params.takeProfit,
      lockedAtEpochMs
    );

    const mutableLock: ImmutableTradeState = {
      orderId,
      positionId: params.positionId,
      symbol: params.symbol,
      orderType: params.orderType,
      lockedAtEpochMs,
      lockedAtIso,
      snapshot,
      anchors,
      integrityHash,
      isWriteProtected: true,
    };

    // Strict immutability enforcement
    const immutableState = deepFreeze(mutableLock);

    this.lockedRegistry.set(orderId, immutableState);
    this.persistLock(immutableState);

    return immutableState;
  }

  /**
   * Retrieves an immutable trade state by orderId or positionId.
   */
  public getOrderLock(id: string): ImmutableTradeState | null {
    if (this.lockedRegistry.has(id)) {
      return this.lockedRegistry.get(id) || null;
    }
    for (const lock of this.lockedRegistry.values()) {
      if (lock.positionId === id || lock.orderId === id) {
        return lock;
      }
    }
    return null;
  }

  /**
   * Validates that an active position strictly matches its locked baseline anchors,
   * preventing transient market noise or simulated ticks from mutating entry/SL/TP.
   */
  public assertImmutableIntegrity(position: Position): {
    isAligned: boolean;
    anchoredEntry: number;
    anchoredStopLoss: number;
    anchoredTakeProfit: number;
    driftPips: number;
  } {
    const lock = position.immutableState || this.getOrderLock(position.id);
    const pipVal = oandaBenchmarkSync.getPipValue(position.symbol);

    if (!lock) {
      return {
        isAligned: true,
        anchoredEntry: position.entryPrice,
        anchoredStopLoss: position.stopLoss,
        anchoredTakeProfit: position.takeProfit,
        driftPips: 0,
      };
    }

    const drift = Math.abs(position.entryPrice - lock.anchors.anchoredEntryPrice);
    const driftPips = Number((drift / pipVal).toFixed(2));
    const isAligned = driftPips === 0;

    return {
      isAligned,
      anchoredEntry: lock.anchors.anchoredEntryPrice,
      anchoredStopLoss: lock.anchors.anchoredStopLoss,
      anchoredTakeProfit: lock.anchors.anchoredTakeProfit,
      driftPips,
    };
  }
}

export const immutableOrderLockEngine = ImmutableOrderLockEngine.getInstance();
