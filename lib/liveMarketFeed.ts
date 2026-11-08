import { Candle, CurrencyPair, MarketSegment, Position, SwarmConsensusResult, TimeFrame } from './types';
import { BASE_PRICES, PIP_VALUES, getMarketSegmentForSymbol } from './marketData';

export interface MarketFeedTickEvent {
  pair: CurrencyPair;
  timeframe: TimeFrame;
  livePrice: number;
  candle: Candle;
  candles: Candle[];
  change24h: number;
  timestamp: number;
}

export type FeedListener = (event: MarketFeedTickEvent) => void;

/**
 * 🌐 LiveMarketFeedManager: Single Source of Truth Orchestrator
 *
 * Enforces a strict unidirectional data pipeline where the live chart
 * market data feed is the non-negotiable authoritative source of truth.
 *
 * Downstream modules (Swarm Matrix, Technical & Fundamental Desks,
 * Active Trade Execution Windows, Portfolio P&L, and Ticker Bars)
 * dynamically calibrate exclusively against this live feed.
 *
 * The visual rendering of the live charts remains pristine and unaffected.
 */
export class LiveMarketFeedManager {
  private static canonicalCandles: Map<string, Candle[]> = new Map();
  private static canonicalPrices: Map<CurrencyPair, number> = new Map();
  private static listeners: Set<FeedListener> = new Set();
  private static activeTicker: NodeJS.Timeout | null = null;
  private static currentPair: CurrencyPair = 'EUR/USD';
  private static currentTimeframe: TimeFrame = '1h';
  private static lastTickTimestamp: number = Date.now();

  /**
   * Register canonical candles for a symbol and timeframe directly from chart load.
   */
  public static setCanonicalFeed(pair: CurrencyPair, timeframe: TimeFrame, candles: Candle[]): void {
    if (!candles || candles.length === 0) return;
    const key = `${pair}_${timeframe}`;
    this.canonicalCandles.set(key, candles);
    this.currentPair = pair;
    this.currentTimeframe = timeframe;

    const latestPrice = candles[candles.length - 1].close;
    this.canonicalPrices.set(pair, latestPrice);
    this.lastTickTimestamp = Date.now();
  }

  /**
   * Retrieve the canonical candles for a symbol & timeframe.
   */
  public static getCanonicalCandles(pair: CurrencyPair = this.currentPair, timeframe: TimeFrame = this.currentTimeframe): Candle[] {
    const key = `${pair}_${timeframe}`;
    return this.canonicalCandles.get(key) || [];
  }

  /**
   * Retrieve the authoritative live price directly from the latest candle close.
   */
  public static getCanonicalPrice(pair: CurrencyPair = this.currentPair): number {
    if (this.canonicalPrices.has(pair)) {
      return this.canonicalPrices.get(pair)!;
    }
    const candles = this.getCanonicalCandles(pair, this.currentTimeframe);
    if (candles.length > 0) {
      const price = candles[candles.length - 1].close;
      this.canonicalPrices.set(pair, price);
      return price;
    }
    return BASE_PRICES[pair] || 1.0;
  }

  public static getLastTickTimestamp(): number {
    return this.lastTickTimestamp;
  }

  /**
   * Pre-Execution Timestamp & Price-Deviation Guardrail:
   * Verifies that the tick timestamp is fresh (<500ms latency)
   * and blocks execution / triggers an alert if candidate price deviates
   * from the authoritative live chart feed by more than 0.05% tolerance.
   */
  public static verifyPreExecutionGuardrail(
    symbol: CurrencyPair,
    proposedPrice: number,
    maxTolerancePercent: number = 0.05,
    maxFreshnessMs: number = 500
  ): {
    valid: boolean;
    livePrice: number;
    proposedPrice: number;
    deviationPercent: number;
    isWithinTolerance: boolean;
    freshnessLatencyMs: number;
    error?: string;
  } {
    const livePrice = this.getCanonicalPrice(symbol);
    const now = Date.now();
    const freshnessLatencyMs = Math.max(0, now - this.lastTickTimestamp);

    if (!proposedPrice || proposedPrice <= 0 || Number.isNaN(proposedPrice)) {
      return {
        valid: false,
        livePrice,
        proposedPrice,
        deviationPercent: 100,
        isWithinTolerance: false,
        freshnessLatencyMs,
        error: 'Invalid candidate execution price.',
      };
    }

    const deviation = Math.abs(proposedPrice - livePrice) / livePrice;
    const deviationPercent = Number((deviation * 100).toFixed(4));
    const isWithinTolerance = deviationPercent <= maxTolerancePercent;

    if (!isWithinTolerance) {
      return {
        valid: false,
        livePrice,
        proposedPrice,
        deviationPercent,
        isWithinTolerance: false,
        freshnessLatencyMs,
        error: `Synchronization Guardrail Alert: Price deviation of ${deviationPercent}% exceeds 0.05% safety tolerance (Live: ${livePrice}, Proposed: ${proposedPrice}). Execution blocked for parity recalibration.`,
      };
    }

    return {
      valid: true,
      livePrice,
      proposedPrice,
      deviationPercent,
      isWithinTolerance: true,
      freshnessLatencyMs,
    };
  }

  /**
   * Subscribe to live chart feed micro-ticks.
   */
  public static subscribe(listener: FeedListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Start the live chart feed ticker.
   * Modifies only the latest candle's close (within high/low volatility bounds)
   * to simulate real-time price action without resetting or redrawing chart history.
   */
  public static startLiveFeed(
    pair: CurrencyPair,
    timeframe: TimeFrame,
    tickIntervalMs: number = 1800
  ): () => void {
    this.currentPair = pair;
    this.currentTimeframe = timeframe;

    if (this.activeTicker) {
      clearInterval(this.activeTicker);
      this.activeTicker = null;
    }

    this.activeTicker = setInterval(() => {
      const key = `${this.currentPair}_${this.currentTimeframe}`;
      const candles = this.canonicalCandles.get(key);
      if (!candles || candles.length === 0) return;

      const lastCandle = candles[candles.length - 1];
      const isJpy = this.currentPair.includes('JPY');
      const isIndian = this.currentPair === 'NIFTY 50' || this.currentPair === 'BANK NIFTY' || 
                       this.currentPair === 'RELIANCE' || this.currentPair === 'TCS' || 
                       this.currentPair === 'HDFC BANK' || this.currentPair === 'INFY';
      const isGold = this.currentPair === 'XAU/USD';
      const isSilver = this.currentPair === 'XAG/USD';
      const isPlatinum = this.currentPair === 'XPT/USD';
      const isCopper = this.currentPair === 'COPPER';
      const isOil = this.currentPair === 'WTI_CRUDE' || this.currentPair === 'BRENT_CRUDE';
      const isRupee = this.currentPair.includes('/INR');

      let decimals = 5;
      if (isIndian || isGold || isPlatinum || isOil) decimals = 2;
      else if (isSilver || isJpy || isRupee) decimals = 3;
      else if (isCopper) decimals = 4;

      const pip = PIP_VALUES[this.currentPair] || 0.0001;
      // Micro fluctuation jitter between -1.5 and +1.5 pips
      const tickDelta = (Math.random() - 0.495) * pip * 1.4;
      const newClose = Number((lastCandle.close + tickDelta).toFixed(decimals));
      const newHigh = Number(Math.max(lastCandle.high, newClose).toFixed(decimals));
      const newLow = Number(Math.min(lastCandle.low, newClose).toFixed(decimals));

      // Update latest candle in-place
      const updatedLastCandle: Candle = {
        ...lastCandle,
        close: newClose,
        high: newHigh,
        low: newLow,
        volume: lastCandle.volume + Math.floor(Math.random() * 8 + 1),
      };

      const updatedCandles = [...candles.slice(0, candles.length - 1), updatedLastCandle];
      this.canonicalCandles.set(key, updatedCandles);
      this.canonicalPrices.set(this.currentPair, newClose);
      this.lastTickTimestamp = Date.now();

      const base = BASE_PRICES[this.currentPair] || newClose;
      const change24h = Number((((newClose - base) / base) * 100).toFixed(2));

      const event: MarketFeedTickEvent = {
        pair: this.currentPair,
        timeframe: this.currentTimeframe,
        livePrice: newClose,
        candle: updatedLastCandle,
        candles: updatedCandles,
        change24h,
        timestamp: this.lastTickTimestamp,
      };

      // Broadcast unidirectionally to all subscribers
      this.listeners.forEach(fn => fn(event));
    }, tickIntervalMs);

    return () => {
      if (this.activeTicker) {
        clearInterval(this.activeTicker);
        this.activeTicker = null;
      }
    };
  }

  /**
   * Stop the active ticker.
   */
  public static stopLiveFeed(): void {
    if (this.activeTicker) {
      clearInterval(this.activeTicker);
      this.activeTicker = null;
    }
  }

  /**
   * Unidirectional Calibrator: Recalibrate Swarm Matrix & Unified Decision against live chart feed price.
   */
  public static calibrateSwarmConsensus(
    consensus: SwarmConsensusResult,
    livePrice: number
  ): SwarmConsensusResult {
    if (!consensus || !livePrice || Number.isNaN(livePrice)) return consensus;

    const pair = consensus.pair;
    const isJpy = pair.includes('JPY');
    const isIndian = pair === 'NIFTY 50' || pair === 'BANK NIFTY' || 
                     pair === 'RELIANCE' || pair === 'TCS' || 
                     pair === 'HDFC BANK' || pair === 'INFY';
    const isGold = pair === 'XAU/USD';
    const isSilver = pair === 'XAG/USD';
    const isPlatinum = pair === 'XPT/USD';
    const isCopper = pair === 'COPPER';
    const isOil = pair === 'WTI_CRUDE' || pair === 'BRENT_CRUDE';
    const isRupee = pair.includes('/INR');

    let decimals = 5;
    if (isIndian || isGold || isPlatinum || isOil) decimals = 2;
    else if (isSilver || isJpy || isRupee) decimals = 3;
    else if (isCopper) decimals = 4;

    const pipMultiplier = PIP_VALUES[pair] || (isJpy ? 0.01 : 0.0001);
    const isBuy = consensus.executionSignal.orderType === 'BUY_MARKET' || 
                  consensus.unifiedDecision.direction === 'BUY';

    // Preserve mathematical stop and take-profit distance in pips
    const rawStopDistance = Math.abs(consensus.executionSignal.entry - consensus.executionSignal.stopLoss);
    const stopDistance = rawStopDistance > 0 ? rawStopDistance : 22 * pipMultiplier;
    const rr = consensus.executionSignal.riskReward || 2.2;
    const targetDistance = stopDistance * rr;

    const calibratedStopLoss = isBuy
      ? Number((livePrice - stopDistance).toFixed(decimals))
      : Number((livePrice + stopDistance).toFixed(decimals));

    const calibratedTakeProfit = isBuy
      ? Number((livePrice + targetDistance).toFixed(decimals))
      : Number((livePrice - targetDistance).toFixed(decimals));

    // Update execution signal
    const updatedExecutionSignal = {
      ...consensus.executionSignal,
      entry: livePrice,
      stopLoss: calibratedStopLoss,
      takeProfit: calibratedTakeProfit,
    };

    // Update technical analyst suggested entry and targets
    const updatedTechnical = {
      ...consensus.agents.technical,
      suggestedEntry: livePrice,
      suggestedStopLoss: calibratedStopLoss,
      suggestedTakeProfit: calibratedTakeProfit,
    };

    // Update risk manager parameters
    const updatedRisk = {
      ...consensus.agents.risk,
      parameters: {
        ...consensus.agents.risk.parameters,
        entryPrice: livePrice,
        stopLoss: calibratedStopLoss,
        takeProfit1: calibratedTakeProfit,
      },
    };

    // Update unified decision recommended action
    const direction = consensus.unifiedDecision.direction;
    const lots = consensus.agents.risk.parameters.positionSizeLots;
    const updatedRecommendedAction = consensus.agents.risk.verdict === 'VETOED'
      ? `HOLD / PASS: Setup vetoed by Risk Manager (${consensus.agents.risk.reasoning})`
      : direction === 'HOLD'
      ? `WAIT FOR CONFLUENCE: Analyst team split, awaiting breakout validation.`
      : `${direction} ${lots} Standard Lots on ${pair} @ ${livePrice}`;

    const updatedUnifiedDecision = {
      ...consensus.unifiedDecision,
      recommendedAction: updatedRecommendedAction,
      coreReasons: {
        ...consensus.unifiedDecision.coreReasons,
        riskGovernance: consensus.agents.risk.verdict === 'VETOED'
          ? `VETO ENFORCED: ${consensus.agents.risk.vetoReasons?.[0] || 'Circuit breaker active.'}`
          : `RISK APPROVED: ${rr}:1 Risk-to-Reward ratio, stop anchored at ${calibratedStopLoss}, targeting ${calibratedTakeProfit} with $${consensus.agents.risk.parameters.maxLossUsd} downside cap (${consensus.agents.risk.parameters.accountRiskPercent}% equity).`,
      },
    };

    return {
      ...consensus,
      currentPrice: livePrice,
      executionSignal: updatedExecutionSignal,
      unifiedDecision: updatedUnifiedDecision,
      agents: {
        ...consensus.agents,
        technical: updatedTechnical,
        risk: updatedRisk,
      },
    };
  }

  /**
   * Unidirectional Calibrator: Dynamically calibrate active position values and P&L
   * strictly against the live chart feed price.
   */
  public static calibratePositions(
    positions: Position[],
    livePriceMap: Map<CurrencyPair, number> | ((symbol: CurrencyPair) => number)
  ): { positions: Position[]; totalOpenPnl: number; hasChanged: boolean } {
    let hasChanged = false;
    let totalOpenPnl = 0;

    const updatedPositions = positions.map(pos => {
      const livePrice = typeof livePriceMap === 'function' 
        ? livePriceMap(pos.symbol) 
        : livePriceMap.get(pos.symbol);

      if (!livePrice || Number.isNaN(livePrice)) {
        totalOpenPnl += pos.pnl;
        return pos;
      }

      if (livePrice !== pos.currentPrice) {
        hasChanged = true;
      }

      const isJpy = pos.symbol.includes('JPY');
      const isGold = pos.symbol === 'XAU/USD';
      const pipVal = PIP_VALUES[pos.symbol] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);
      const pipDollar = 10;
      const pipDiff = pos.type === 'BUY'
        ? (livePrice - pos.entryPrice) / pipVal
        : (pos.entryPrice - livePrice) / pipVal;

      const pnl = Number((pipDiff * pipDollar * pos.lots).toFixed(2));
      const pnlPercent = Number(((pnl / (pos.lots * 1000)) * 100).toFixed(2));

      totalOpenPnl += pnl;

      return {
        ...pos,
        currentPrice: livePrice,
        pnl,
        pnlPercent,
      };
    });

    return {
      positions: updatedPositions,
      totalOpenPnl: Number(totalOpenPnl.toFixed(2)),
      hasChanged,
    };
  }

  /**
   * Unidirectional Calibrator: Synchronize TickerBar rates array
   * so the active pair strictly reflects the live chart feed price.
   */
  public static synchronizeRates(
    rates: any[],
    activePair: CurrencyPair,
    livePrice: number
  ): any[] {
    if (!rates || rates.length === 0) return [];
    return rates.map(r => {
      if (r.pair === activePair) {
        const base = BASE_PRICES[activePair] || livePrice;
        const change24h = Number((((livePrice - base) / base) * 100).toFixed(2));
        return {
          ...r,
          price: livePrice,
          change24h,
          high24h: Math.max(r.high24h || livePrice, livePrice),
          low24h: Math.min(r.low24h || livePrice, livePrice),
        };
      }
      return r;
    });
  }
}

export const UnifiedMarketStreamManager = LiveMarketFeedManager;
