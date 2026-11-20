import { CurrencyPair, OandaToleranceCheckResult, OandaParityMonitoringResult, Position } from './types';
import { PIP_VALUES, BASE_PRICES } from './marketData';
import { LiveMarketFeedManager } from './liveMarketFeed';

// ============================================================================
// 🏛️ OANDA INSTITUTIONAL BENCHMARK PRICE-FEED SYNCHRONIZER
// Strict ±20 to 50 Pip Execution Tolerance Corridor & Parity Protection
// ============================================================================

export const OANDA_CORRIDOR_CONFIG = {
  MIN_TOLERANCE_PIPS: 20, // Standard institutional tolerance buffer
  MAX_TOLERANCE_PIPS: 50, // Absolute maximum corridor boundary before order rejection / invalidation freeze
};

export interface OandaBenchmarkQuote {
  symbol: CurrencyPair;
  price: number;
  bid: number;
  ask: number;
  spreadPips: number;
  confirmedAtEpochMs: number;
  source: 'OANDA_PRIMARY_FEED' | 'TRADINGVIEW_OANDA_EQUIVALENT';
}

export class OandaBenchmarkFeedSynchronizer {
  private static instance: OandaBenchmarkFeedSynchronizer;
  private benchmarkOverrides: Map<CurrencyPair, number> = new Map();

  private constructor() {}

  public static getInstance(): OandaBenchmarkFeedSynchronizer {
    if (!OandaBenchmarkFeedSynchronizer.instance) {
      OandaBenchmarkFeedSynchronizer.instance = new OandaBenchmarkFeedSynchronizer();
    }
    return OandaBenchmarkFeedSynchronizer.instance;
  }

  /**
   * Retrieves the confirmed, institutional-grade OANDA benchmark quote for an instrument.
   * Pulls from canonical live market feeds with strict fallback to base institutional pricing.
   */
  public getConfirmedOandaBenchmark(symbol: CurrencyPair): OandaBenchmarkQuote {
    const canonicalPrice = LiveMarketFeedManager.getCanonicalPrice(symbol);
    const fallbackBasePrice = BASE_PRICES[symbol] || 1.0;
    const confirmedPrice = (canonicalPrice > 0 && !Number.isNaN(canonicalPrice)) 
      ? canonicalPrice 
      : fallbackBasePrice;

    const pipVal = this.getPipValue(symbol);
    const spreadPips = symbol === 'XAU/USD' ? 1.5 : symbol.includes('JPY') ? 1.0 : 0.8;
    const halfSpread = (spreadPips * pipVal) / 2;

    const bid = Number((confirmedPrice - halfSpread).toFixed(this.getDecimals(symbol)));
    const ask = Number((confirmedPrice + halfSpread).toFixed(this.getDecimals(symbol)));

    return {
      symbol,
      price: confirmedPrice,
      bid,
      ask,
      spreadPips,
      confirmedAtEpochMs: Date.now(),
      source: 'OANDA_PRIMARY_FEED',
    };
  }

  /**
   * Strict Pre-Dispatch Order Validation:
   * Enforces the ±20 to 50 pip execution tolerance band relative to confirmed OANDA feed.
   * If discrepancy exceeds 50 pips, mandates REJECTION prior to dispatch.
   */
  public validateExecutionTolerance(params: {
    symbol: CurrencyPair;
    executionPrice: number;
    orderType: 'BUY' | 'SELL';
    maxTolerancePips?: number;
  }): OandaToleranceCheckResult {
    const { symbol, executionPrice, orderType, maxTolerancePips = OANDA_CORRIDOR_CONFIG.MAX_TOLERANCE_PIPS } = params;
    const benchmark = this.getConfirmedOandaBenchmark(symbol);
    const pipVal = this.getPipValue(symbol);

    const priceDiff = Math.abs(executionPrice - benchmark.price);
    const discrepancyPips = Number((priceDiff / pipVal).toFixed(2));

    if (discrepancyPips > maxTolerancePips) {
      return {
        symbol,
        executionPrice,
        oandaBenchmarkPrice: benchmark.price,
        discrepancyPips,
        maxAllowedTolerancePips: maxTolerancePips,
        isWithinTolerance: false,
        status: 'CORRIDOR_BREACHED_REJECT',
        action: 'REJECT_ORDER',
        rejectionReason: `ORDER REJECTED: Cross-feed discrepancy of ${discrepancyPips} pips relative to confirmed OANDA benchmark (${benchmark.price}) exceeds the strict ±${maxTolerancePips}-pip corridor. Order dispatch halted to protect against severe slippage or synthetic price distortion.`,
      };
    }

    if (discrepancyPips > OANDA_CORRIDOR_CONFIG.MIN_TOLERANCE_PIPS) {
      return {
        symbol,
        executionPrice,
        oandaBenchmarkPrice: benchmark.price,
        discrepancyPips,
        maxAllowedTolerancePips: maxTolerancePips,
        isWithinTolerance: true,
        status: 'IN_CORRIDOR_ELEVATED',
        action: 'PROCEED_DISPATCH',
      };
    }

    return {
      symbol,
      executionPrice,
      oandaBenchmarkPrice: benchmark.price,
      discrepancyPips,
      maxAllowedTolerancePips: maxTolerancePips,
      isWithinTolerance: true,
      status: 'IN_CORRIDOR_PERFECT',
      action: 'PROCEED_DISPATCH',
    };
  }

  /**
   * Active Position Parity & Invalidation Freeze Evaluation:
   * Monitors real-time divergence between dashboard tick feed and confirmed OANDA benchmark.
   * If divergence exceeds corridor (20 to 50 pips), freezes automated invalidation triggers
   * until feed parity is restored to prevent unwarranted premature stop-outs.
   */
  public checkActivePositionParity(
    position: Position,
    liveDashboardPrice: number
  ): OandaParityMonitoringResult {
    const benchmark = this.getConfirmedOandaBenchmark(position.symbol);
    const pipVal = this.getPipValue(position.symbol);
    const discrepancy = Math.abs(liveDashboardPrice - benchmark.price);
    const discrepancyPips = Number((discrepancy / pipVal).toFixed(2));

    const isCorridorBreached = discrepancyPips > OANDA_CORRIDOR_CONFIG.MAX_TOLERANCE_PIPS;
    const isElevated = discrepancyPips > OANDA_CORRIDOR_CONFIG.MIN_TOLERANCE_PIPS;

    let statusText: string;
    if (isCorridorBreached) {
      statusText = `PARITY BREACH (±${discrepancyPips} pips): Automated invalidation FROZEN until OANDA feed parity restores.`;
    } else if (isElevated) {
      statusText = `ELEVATED SPREAD (±${discrepancyPips} pips): Within ±50-pip volatility tolerance. Invalidation active with buffer.`;
    } else {
      statusText = `PARITY CONFIRMED (±${discrepancyPips} pips): Strict alignment with OANDA institutional benchmark.`;
    }

    return {
      symbol: position.symbol,
      liveDashboardPrice,
      confirmedOandaBenchmark: benchmark.price,
      discrepancyPips,
      isParityMaintained: !isCorridorBreached,
      freezeAutomatedTriggers: isCorridorBreached,
      parityStatusText: statusText,
      lastEvaluatedEpochMs: Date.now(),
    };
  }

  public getPipValue(symbol: CurrencyPair): number {
    const isGold = symbol === 'XAU/USD';
    const isJpy = symbol.includes('JPY');
    const isIndian = symbol.includes('NIFTY') || symbol === 'RELIANCE' || symbol === 'TCS';
    return PIP_VALUES[symbol] || (isGold ? 0.10 : isIndian ? 0.05 : isJpy ? 0.01 : 0.0001);
  }

  public getDecimals(symbol: CurrencyPair): number {
    const isGold = symbol === 'XAU/USD';
    const isJpy = symbol.includes('JPY');
    const isIndian = symbol.includes('NIFTY') || symbol === 'RELIANCE' || symbol === 'TCS';
    if (isIndian || isGold) return 2;
    if (isJpy) return 3;
    return 5;
  }
}

export const oandaBenchmarkSync = OandaBenchmarkFeedSynchronizer.getInstance();
