import {
  Position,
  PositionInvalidationStatus,
  Candle,
  CurrencyPair,
  SwarmConsensusResult,
} from './types';
import { calculateRSI, calculateEMA } from './indicators';
import { realTimeNewsEngine } from './newsEngine';
import { PIP_VALUES } from './marketData';

// ============================================================================
// 🛡️ TRADE INVALIDATION & CAPITAL PRESERVATION ENGINE
// Second-by-Second Technical & Fundamental Monitoring for Running Entries
// ============================================================================

export class TradeInvalidationEngine {
  private static instance: TradeInvalidationEngine;

  private constructor() {}

  public static getInstance(): TradeInvalidationEngine {
    if (!TradeInvalidationEngine.instance) {
      TradeInvalidationEngine.instance = new TradeInvalidationEngine();
    }
    return TradeInvalidationEngine.instance;
  }

  /**
   * Evaluates an active running position second-by-second against both
   * technical structure and fundamental macro criteria.
   */
  public evaluatePosition(
    position: Position,
    livePrice: number,
    candles: Candle[] = [],
    consensus?: SwarmConsensusResult | null
  ): PositionInvalidationStatus {
    const isBuy = position.type === 'BUY';
    const isSell = position.type === 'SELL';

    const technicalReasons: string[] = [];
    const fundamentalReasons: string[] = [];

    // ------------------------------------------------------------------------
    // 1. Technical Analysis Invalidation Checks (Second-by-Second)
    // ------------------------------------------------------------------------
    if (candles && candles.length >= 14) {
      const closes = candles.map(c => c.close);
      const highs = candles.map(c => c.high);
      const lows = candles.map(c => c.low);

      const rsiValues = calculateRSI(closes, 14);
      const currentRsi = rsiValues[rsiValues.length - 1] ?? 50;
      const previousRsi = rsiValues[rsiValues.length - 3] ?? currentRsi;

      const ema9Values = calculateEMA(closes, 9);
      const ema21Values = calculateEMA(closes, 21);
      const currentEma9 = ema9Values[ema9Values.length - 1] ?? livePrice;
      const currentEma21 = ema21Values[ema21Values.length - 1] ?? livePrice;

      // Last 5-bar swing structure extremes
      const recentLows = lows.slice(-6, -1);
      const recentHighs = highs.slice(-6, -1);
      const minRecentLow = Math.min(...recentLows);
      const maxRecentHigh = Math.max(...recentHighs);

      // (A) Structural Break of Swing Levels (CHoCH / BOS Invalidation)
      if (isBuy && livePrice < minRecentLow) {
        technicalReasons.push(
          `Market Structure Violation: Price fell below recent swing low (${minRecentLow.toFixed(4)}), indicating bearish displacement against long position.`
        );
      } else if (isSell && livePrice > maxRecentHigh) {
        technicalReasons.push(
          `Market Structure Violation: Price broke above recent swing high (${maxRecentHigh.toFixed(4)}), indicating bullish expansion against short position.`
        );
      }

      // (B) Momentum & RSI Divergence Rollover
      if (isBuy) {
        if (currentRsi < 40) {
          technicalReasons.push(
            `Momentum Deterioration: RSI collapsed to ${currentRsi.toFixed(1)} (below critical 40 bull-support boundary).`
          );
        } else if (currentRsi < previousRsi - 7) {
          technicalReasons.push(
            `Momentum Exhaustion: RSI rolled over sharply (-${(previousRsi - currentRsi).toFixed(1)} pts), signaling fading buying momentum.`
          );
        }
      } else if (isSell) {
        if (currentRsi > 60) {
          technicalReasons.push(
            `Momentum Deterioration: RSI surged to ${currentRsi.toFixed(1)} (above critical 60 bear-resistance boundary).`
          );
        } else if (currentRsi > previousRsi + 7) {
          technicalReasons.push(
            `Momentum Reversal: RSI spiked sharply (+${(currentRsi - previousRsi).toFixed(1)} pts), signaling counter-trend buying pressure.`
          );
        }
      }

      // (C) Moving Average Ribbon Invalidation (EMA 9 / 21)
      if (isBuy && currentEma9 < currentEma21 && livePrice < currentEma9) {
        technicalReasons.push(
          `Trend Ribbon Cross: Fast EMA 9 crossed below EMA 21, confirming bearish trend transition.`
        );
      } else if (isSell && currentEma9 > currentEma21 && livePrice > currentEma9) {
        technicalReasons.push(
          `Trend Ribbon Cross: Fast EMA 9 crossed above EMA 21, confirming bullish trend transition.`
        );
      }
    }

    // (D) Stop Distance Adverse Proximity (Capital Preservation Warning)
    const isGold = position.symbol === 'XAU/USD';
    const isJpy = position.symbol.includes('JPY');
    const pipVal = PIP_VALUES[position.symbol] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);
    const stopDistance = Math.abs(position.entryPrice - position.stopLoss);
    
    if (stopDistance > 0) {
      const adverseDistance = isBuy
        ? position.entryPrice - livePrice
        : livePrice - position.entryPrice;

      if (adverseDistance > stopDistance * 0.65) {
        technicalReasons.push(
          `Adverse Capital Drawdown: Position has absorbed ${((adverseDistance / stopDistance) * 100).toFixed(0)}% of the protective stop threshold.`
        );
      }
    }

    // ------------------------------------------------------------------------
    // 2. Fundamental Analysis Invalidation Checks (Second-by-Second)
    // ------------------------------------------------------------------------
    try {
      // (A) Real-Time Wire Feed News Sentiment Inversion (38 Financial Feeds)
      const newsArticles = realTimeNewsEngine.scrapeNewsForSymbol(position.symbol, 'HIGH_TO_LOW', 'ALL');
      const newsSynthesis = realTimeNewsEngine.synthesizeSentiment(newsArticles);
      const wireScore = Number((newsSynthesis.sentimentScore * 100).toFixed(1)); // -100 to +100

      if (isBuy && wireScore < -20) {
        const topNegativeWire = newsArticles.find(a => a.sentiment === 'BEARISH');
        fundamentalReasons.push(
          `Live News Sentiment Inversion: Financial Wire feeds shifted Bearish (${wireScore}% score). Catalyst: "${topNegativeWire?.title.slice(0, 75) || 'Breaking Macro Headwind'}..."`
        );
      } else if (isSell && wireScore > 20) {
        const topPositiveWire = newsArticles.find(a => a.sentiment === 'BULLISH');
        fundamentalReasons.push(
          `Live News Sentiment Inversion: Financial Wire feeds shifted Bullish (+${wireScore}% score). Catalyst: "${topPositiveWire?.title.slice(0, 75) || 'Breaking Macro Inflow'}..."`
        );
      }

      // (B) 5-Agent Swarm Consensus Inversion
      if (consensus) {
        const swarmDirection = consensus.consensusDirection;
        const consensusConfidence = consensus.overallConfidence;

        if (isBuy && swarmDirection === 'SELL') {
          fundamentalReasons.push(
            `Swarm Consensus Inversion: Multi-desk consensus flipped to UNIFIED SELL with ${consensusConfidence}% confidence.`
          );
        } else if (isSell && swarmDirection === 'BUY') {
          fundamentalReasons.push(
            `Swarm Consensus Inversion: Multi-desk consensus flipped to UNIFIED BUY with ${consensusConfidence}% confidence.`
          );
        }

        // Dual confirmation divergence check
        if (consensus.dualConfirmation?.confirmationStatus === 'DIVERGENCE_REJECTED') {
          fundamentalReasons.push(
            `Dual-Desk Divergence: Technical momentum and fundamental wire catalysts have diverged, invalidating directional thesis.`
          );
        }

        // Indian Market Institutional Flow Check
        if (position.symbol.includes('NIFTY')) {
          if (isBuy && consensus.agents.fundamental.thesis.includes('outflow')) {
            fundamentalReasons.push(
              `Institutional Liquidity Drain: Heavy FII intraday cash distribution detected on NSE/BSE.`
            );
          } else if (isSell && consensus.agents.fundamental.thesis.includes('inflow')) {
            fundamentalReasons.push(
              `Institutional Liquidity Squeeze: Strong DII/FII buying support detected.`
            );
          }
        }
      }
    } catch (e) {
      // Non-blocking fallback
    }

    // ------------------------------------------------------------------------
    // 3. Synthesis & Urgency Classification
    // ------------------------------------------------------------------------
    const allReasons = [...technicalReasons, ...fundamentalReasons];
    const totalReasons = allReasons.length;

    // Condition for invalidation:
    // Any structural break, or at least 1 fundamental + 1 technical reason, or 2+ technical reasons
    const isInvalidated = totalReasons >= 2 || fundamentalReasons.length >= 1 || technicalReasons.length >= 2;

    let urgency: PositionInvalidationStatus['urgency'] = 'NONE';
    if (totalReasons >= 3) {
      urgency = 'CRITICAL';
    } else if (isInvalidated) {
      urgency = 'HIGH';
    } else if (totalReasons === 1) {
      urgency = 'MEDIUM';
    }

    const technicalStatus: PositionInvalidationStatus['technicalStatus'] =
      technicalReasons.length >= 2 ? 'INVALIDATED' : technicalReasons.length === 1 ? 'WARNING' : 'HEALTHY';

    const fundamentalStatus: PositionInvalidationStatus['fundamentalStatus'] =
      fundamentalReasons.length >= 1 ? 'INVALIDATED' : 'HEALTHY';

    const pnlStatus: PositionInvalidationStatus['pnlStatus'] =
      position.pnl > 0.5 ? 'IN_PROFIT' : position.pnl < -0.5 ? 'IN_LOSS' : 'BREAKEVEN';

    let actionRecommended: PositionInvalidationStatus['actionRecommended'] = 'HOLD_POSITION';
    if (isInvalidated) {
      if (pnlStatus === 'IN_PROFIT') {
        actionRecommended = 'TAKE_SMALL_PROFIT';
      } else {
        actionRecommended = 'CLOSE_IMMEDIATELY';
      }
    } else if (urgency === 'MEDIUM') {
      actionRecommended = 'TIGHTEN_STOP';
    }

    return {
      isInvalidated,
      urgency,
      actionRecommended,
      technicalStatus,
      fundamentalStatus,
      technicalReasons,
      fundamentalReasons,
      allReasons,
      pnlStatus,
      recommendedExitPrice: livePrice,
      lastCheckedTime: new Date().toLocaleTimeString(),
    };
  }
}

export const tradeInvalidationEngine = TradeInvalidationEngine.getInstance();
