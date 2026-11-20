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
import { oandaBenchmarkSync } from './oandaBenchmarkSync';

// ============================================================================
// 🛡️ TRADE INVALIDATION & CAPITAL PRESERVATION ENGINE
// Decoupled Baseline Monitoring, OANDA Parity Protection & Natural Resolution
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
   * Reads exclusively from write-protected immutable anchors and enforces
   * the OANDA ±20 to 50 pip parity corridor to eliminate premature invalidation.
   */
  public evaluatePosition(
    position: Position,
    livePrice: number,
    candles: Candle[] = [],
    consensus?: SwarmConsensusResult | null
  ): PositionInvalidationStatus {
    const isBuy = position.type === 'BUY';
    const isSell = position.type === 'SELL';

    // 🔒 1. Read baselines EXCLUSIVELY from immutable locked state anchors
    const lockedAnchors = position.immutableState?.anchors;
    const anchoredEntryPrice = lockedAnchors?.anchoredEntryPrice ?? position.entryPrice;
    const anchoredStopLoss = lockedAnchors?.anchoredStopLoss ?? position.stopLoss;
    const anchoredTakeProfit = lockedAnchors?.anchoredTakeProfit ?? position.takeProfit;
    const anchoredInvalidationLevel = lockedAnchors?.anchoredInvalidationPriceLevel ?? position.invalidationPriceLevel ?? anchoredStopLoss;

    // 🏛️ 2. Institutional OANDA Feed Benchmark Parity Verification
    const parityCheck = oandaBenchmarkSync.checkActivePositionParity(position, livePrice);
    const isCorridorBreached = parityCheck.freezeAutomatedTriggers;

    // ⏳ 3. Position Age & Resolution Grace Period Window (20 seconds)
    // Prevents micro-tick wicks immediately upon dispatch from prematurely terminating positions
    const lockedEpoch = position.immutableState?.lockedAtEpochMs || 0;
    const positionAgeMs = lockedEpoch > 0 ? (Date.now() - lockedEpoch) : 60000;
    const isWithinResolutionGracePeriod = positionAgeMs < 20000; // 20s natural resolution window

    const technicalReasons: string[] = [];
    const fundamentalReasons: string[] = [];
    let structuralOverrideTriggered = false;
    let chochBreakdownDetected = false;

    const isGold = position.symbol === 'XAU/USD';
    const isJpy = position.symbol.includes('JPY');
    const isIndian = position.symbol.includes('NIFTY') || position.symbol === 'RELIANCE' || position.symbol === 'TCS';
    const pipVal = oandaBenchmarkSync.getPipValue(position.symbol);

    let decimals = 5;
    if (isIndian || isGold) decimals = 2;
    else if (isJpy) decimals = 3;

    // ------------------------------------------------------------------------
    // 4. Technical Analysis Invalidation Checks (Evaluated Against Locked Anchors)
    // ------------------------------------------------------------------------
    if (candles && candles.length >= 14 && !isCorridorBreached) {
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

      // Confirmed structural breach against write-protected invalidation boundary
      const isBoundaryBreached = isSell 
        ? livePrice >= anchoredInvalidationLevel
        : livePrice <= anchoredInvalidationLevel;

      // Beyond grace period: check for confirmed structural invalidation
      if (!isWithinResolutionGracePeriod && isBoundaryBreached) {
        structuralOverrideTriggered = true;
        chochBreakdownDetected = true;
        technicalReasons.unshift(
          `⚡ CONFIRMED STRUCTURAL INVALIDATION: Live price ${livePrice} breached write-protected ${isSell ? 'ceiling' : 'floor'} (${anchoredInvalidationLevel}). Position natural resolution completed; exit mandated.`
        );
      }

      // Momentum Deterioration (only past grace period)
      if (!isWithinResolutionGracePeriod) {
        if (isBuy && currentRsi < 35) {
          technicalReasons.push(`Momentum Deterioration: RSI collapsed to ${currentRsi.toFixed(1)} below key threshold.`);
        } else if (isSell && currentRsi > 65) {
          technicalReasons.push(`Momentum Deterioration: RSI surged to ${currentRsi.toFixed(1)} above bear threshold.`);
        }

        if (isBuy && currentEma9 < currentEma21 && livePrice < currentEma9) {
          technicalReasons.push(`Trend Transition: Fast EMA 9 crossed below EMA 21.`);
        } else if (isSell && currentEma9 > currentEma21 && livePrice > currentEma9) {
          technicalReasons.push(`Trend Transition: Fast EMA 9 crossed above EMA 21.`);
        }
      }
    }

    // (E) Automated Breakeven Trailing Stop Supervision (1:1 R:R Threshold)
    const initialRiskDistance = Math.abs(anchoredEntryPrice - (position.initialStopLoss || anchoredStopLoss));
    const unrealizedGainDistance = isBuy
      ? livePrice - anchoredEntryPrice
      : anchoredEntryPrice - livePrice;

    const initialRiskPips = Number((initialRiskDistance / pipVal).toFixed(1));
    const unrealizedGainPips = Number((unrealizedGainDistance / pipVal).toFixed(1));

    let isBreakevenLocked = position.isBreakevenLocked || false;
    let trailedStopLoss = position.stopLoss;

    // Once unrealized gains reach or exceed 1:1 threshold, compute Breakeven Stop
    if (unrealizedGainDistance >= initialRiskDistance && initialRiskDistance > 0 && !isBreakevenLocked && !isCorridorBreached) {
      isBreakevenLocked = true;
      const breakevenBuffer = 1 * pipVal; // 1 pip beyond entry to guarantee commission/spread coverage
      const newStop = isBuy
        ? Number((anchoredEntryPrice + breakevenBuffer).toFixed(decimals))
        : Number((anchoredEntryPrice - breakevenBuffer).toFixed(decimals));
      
      trailedStopLoss = newStop;
      technicalReasons.push(
        `🛡️ TELEMETRY SUPERVISION: 1:1 Risk-to-Reward threshold achieved (+${unrealizedGainPips} pips). Stop Loss trailed to Breakeven (${newStop}) to eliminate downside risk and lock equity.`
      );
    }

    // (F) Real-Time Target Compression during Confidence Decay (Outside grace period)
    let targetCompressed = position.targetCompressed || false;
    let compressedTakeProfit = position.takeProfit;

    if (consensus && !targetCompressed && !isWithinResolutionGracePeriod && !isCorridorBreached) {
      const entryConf = position.confidenceAtEntry || 78;
      const liveConf = consensus.overallConfidence;
      const confidenceDecay = entryConf - liveConf;

      if (confidenceDecay >= 12) {
        targetCompressed = true;
        const remainingDistance = Math.abs(anchoredTakeProfit - livePrice);
        compressedTakeProfit = isBuy
          ? Number((livePrice + remainingDistance * 0.50).toFixed(decimals))
          : Number((livePrice - remainingDistance * 0.50).toFixed(decimals));

        technicalReasons.push(
          `⚡ TARGET COMPRESSION: Confidence decayed by ${confidenceDecay}% pts. Take profit dynamically compressed to ${compressedTakeProfit} to harvest equity before reversal.`
        );
      }
    }

    // ------------------------------------------------------------------------
    // 5. Fundamental Analysis Invalidation Checks
    // ------------------------------------------------------------------------
    if (!isWithinResolutionGracePeriod && !isCorridorBreached) {
      try {
        const newsArticles = realTimeNewsEngine.scrapeNewsForSymbol(position.symbol, 'HIGH_TO_LOW', 'ALL');
        const newsSynthesis = realTimeNewsEngine.synthesizeSentiment(newsArticles);
        const wireScore = Number((newsSynthesis.sentimentScore * 100).toFixed(1));

        if (isBuy && wireScore < -35) {
          fundamentalReasons.push(`Live News Sentiment Inversion: Financial Wire feeds shifted strongly Bearish (${wireScore}%).`);
        } else if (isSell && wireScore > 35) {
          fundamentalReasons.push(`Live News Sentiment Inversion: Financial Wire feeds shifted strongly Bullish (+${wireScore}%).`);
        }

        if (consensus) {
          const swarmDirection = consensus.consensusDirection;
          if (isBuy && swarmDirection === 'SELL' && consensus.overallConfidence > 85) {
            fundamentalReasons.push(`Swarm Consensus Inversion: Multi-desk consensus flipped to UNIFIED SELL with high confidence.`);
          } else if (isSell && swarmDirection === 'BUY' && consensus.overallConfidence > 85) {
            fundamentalReasons.push(`Swarm Consensus Inversion: Multi-desk consensus flipped to UNIFIED BUY with high confidence.`);
          }
        }
      } catch (e) {
        // Non-blocking
      }
    }

    // ------------------------------------------------------------------------
    // 6. Synthesis, Urgency Classification & Freeze Enforcement
    // ------------------------------------------------------------------------
    const allReasons = [...technicalReasons, ...fundamentalReasons];
    const totalReasons = allReasons.length;

    // Strict Invalidation Gating:
    // If corridor is breached or in grace period, invalidation is SUPPRESSED
    let isInvalidated = false;
    let urgency: PositionInvalidationStatus['urgency'] = 'NONE';
    let actionRecommended: PositionInvalidationStatus['actionRecommended'] = 'HOLD_POSITION';

    if (isCorridorBreached) {
      // FREEZE: OANDA feed discrepancy prevents false triggers
      isInvalidated = false;
      urgency = 'NONE';
      actionRecommended = 'HOLD_POSITION';
    } else if (isWithinResolutionGracePeriod) {
      // GRACE: Allow trade to breathe and resolve naturally
      isInvalidated = false;
      urgency = 'NONE';
      actionRecommended = 'HOLD_POSITION';
    } else {
      isInvalidated = structuralOverrideTriggered || totalReasons >= 2;
      if (structuralOverrideTriggered) {
        urgency = 'CRITICAL';
        actionRecommended = 'CLOSE_IMMEDIATELY';
      } else if (isInvalidated) {
        urgency = 'HIGH';
        actionRecommended = position.pnl > 0 ? 'TAKE_SMALL_PROFIT' : 'CLOSE_IMMEDIATELY';
      } else if (totalReasons === 1) {
        urgency = 'LOW';
        actionRecommended = 'HOLD_POSITION';
      }
    }

    const technicalStatus: PositionInvalidationStatus['technicalStatus'] =
      structuralOverrideTriggered ? 'INVALIDATED' : technicalReasons.length > 0 ? 'WARNING' : 'HEALTHY';

    const fundamentalStatus: PositionInvalidationStatus['fundamentalStatus'] =
      fundamentalReasons.length > 0 ? 'WARNING' : 'HEALTHY';

    const pnlStatus: PositionInvalidationStatus['pnlStatus'] =
      position.pnl > 0.5 ? 'IN_PROFIT' : position.pnl < -0.5 ? 'IN_LOSS' : 'BREAKEVEN';

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
      structuralOverrideTriggered,
      chochBreakdownDetected,
      isBreakevenLocked,
      trailedStopLoss,
      targetCompressed,
      compressedTakeProfit,
      unrealizedGainPips,
      initialRiskPips,
      isOandaCorridorBreached: isCorridorBreached,
      isInvalidationFrozen: isCorridorBreached,
      freezeReason: isCorridorBreached ? parityCheck.parityStatusText : undefined,
      oandaBenchmarkDiscrepancyPips: parityCheck.discrepancyPips,
    };
  }
}

export const tradeInvalidationEngine = TradeInvalidationEngine.getInstance();
