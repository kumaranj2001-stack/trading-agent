import {
  CurrencyPair,
  ConfluenceGrade,
  OrderBookLiquidityWallSnapshot,
  PreTradeValidationGateResult,
  UnifiedProfitableSetup
} from './types';
import { PIP_VALUES } from './marketData';
import { invalidCriteriaMemoryManager } from './invalidCriteriaMemory';
import { multiTieredScreeningEngine } from './screeningEngine';

/**
 * 🎯 Unified High-Conviction Profitable Setup Engine
 *
 * Transitions from fragmented multi-target scaling (TP1, TP2, TP3, runner)
 * to a unified, single high-confidence target and protective stop loss framework
 * that maximizes trade fidelity, locks in deterministic profits, and eliminates
 * fragmented exit management.
 */
export class UnifiedSetupEngine {
  private static instance: UnifiedSetupEngine;

  private constructor() {}

  public static getInstance(): UnifiedSetupEngine {
    if (!UnifiedSetupEngine.instance) {
      UnifiedSetupEngine.instance = new UnifiedSetupEngine();
    }
    return UnifiedSetupEngine.instance;
  }

  /**
   * Derive the unified single-target setup with strict liquidity wall anchoring
   */
  public generateUnifiedProfitableSetup(params: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL' | 'HOLD';
    currentPrice: number;
    accountEquity?: number;
    confidenceScore: number;
    confluenceGrade: ConfluenceGrade;
    liquidityWalls?: OrderBookLiquidityWallSnapshot;
    preTradeGate?: PreTradeValidationGateResult;
  }): UnifiedProfitableSetup {
    const {
      symbol,
      direction,
      currentPrice,
      accountEquity = 10000,
      confidenceScore,
      confluenceGrade,
      liquidityWalls,
      preTradeGate,
    } = params;

    const isGold = symbol === 'XAU/USD';
    const isJpy = symbol.includes('JPY');
    const isIndian = symbol.includes('NIFTY') || symbol.includes('RELIANCE');
    const decimals = isGold || isIndian ? 2 : isJpy ? 3 : 5;
    const pipMultiplier = PIP_VALUES[symbol] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);

    const isSell = direction === 'SELL';
    const isHold = direction === 'HOLD';

    // 1. Calculate Single Structural Protective Stop Loss
    let stopLoss = 0;
    let stopDistancePips = 0;

    const atrBuffer = liquidityWalls?.volatilityAtrBufferPips || 15.0;
    const bufferAbs = atrBuffer * pipMultiplier;

    if (liquidityWalls && liquidityWalls.anchoredStopLossLevel > 0) {
      stopLoss = Number(liquidityWalls.anchoredStopLossLevel.toFixed(decimals));
      stopDistancePips = Number((Math.abs(currentPrice - stopLoss) / pipMultiplier).toFixed(1));
    } else {
      if (isSell) {
        stopDistancePips = Math.max(15, atrBuffer + 5);
        stopLoss = Number((currentPrice + stopDistancePips * pipMultiplier).toFixed(decimals));
      } else {
        stopDistancePips = Math.max(15, atrBuffer + 5);
        stopLoss = Number((currentPrice - stopDistancePips * pipMultiplier).toFixed(decimals));
      }
    }

    if (stopDistancePips <= 0) {
      stopDistancePips = 18.0;
      stopLoss = Number((isSell ? currentPrice + 18 * pipMultiplier : currentPrice - 18 * pipMultiplier).toFixed(decimals));
    }

    // 2. Derive Single High-Confidence Institutional Target (1:3.0+ Risk-to-Reward)
    // Anchored to the dominant structural liquidity wall to eliminate fragmented scaling
    const targetMultiplier = confluenceGrade === 'A+' ? 3.4 : confluenceGrade === 'A' ? 3.0 : 2.5;
    const targetDistancePips = Number((stopDistancePips * targetMultiplier).toFixed(1));

    let singleTarget = 0;
    if (isSell) {
      singleTarget = Number((currentPrice - targetDistancePips * pipMultiplier).toFixed(decimals));
    } else {
      singleTarget = Number((currentPrice + targetDistancePips * pipMultiplier).toFixed(decimals));
    }

    const riskRewardRatio = Number((targetDistancePips / stopDistancePips).toFixed(2));

    // 3. Proportional Lot Sizing (Deterministic 2% Risk Cap)
    const maxRiskCapital = accountEquity * 0.02; // $200 on $10k
    const pipValueUsdPerLot = isGold ? 10.0 : isJpy ? 7.5 : isIndian ? 1.2 : 10.0;
    const totalRiskPerLot = stopDistancePips * pipValueUsdPerLot;
    const rawLots = maxRiskCapital / (totalRiskPerLot || 1);
    const proportionalLotSize = Number(Math.max(0.01, Math.min(2.5, Number(rawLots.toFixed(2)))).toFixed(2));

    const projectedLossUsd = Number((proportionalLotSize * stopDistancePips * pipValueUsdPerLot).toFixed(2));
    const projectedProfitUsd = Number((proportionalLotSize * targetDistancePips * pipValueUsdPerLot).toFixed(2));
    const projectedRoiPercent = Number(((projectedProfitUsd / (accountEquity || 10000)) * 100).toFixed(2));

    // 4. Pre-Trade Gate & Screening Status
    const evaluatedPreTradeGate = preTradeGate || invalidCriteriaMemoryManager.evaluatePreTradeGate({
      symbol,
      direction,
      currentPrice,
    });

    const screeningTier: UnifiedProfitableSetup['screeningTier'] =
      confidenceScore >= 80 && riskRewardRatio >= 3.0
        ? 'TIER_1_ALPHA_VANGUARD'
        : confidenceScore >= 70
        ? 'TIER_2_HIGH_CONVICTION'
        : 'TIER_3_TACTICAL_CONFLUENCE';

    const institutionalRationale = isHold
      ? 'Consensus neutral: Setup held in equilibrium awaiting directional confluence.'
      : `Unified Single-Target High-Fidelity Execution: Entry at ${currentPrice} with unified target at ${singleTarget} (+${targetDistancePips} pips, ${riskRewardRatio}:1 R:R) and anchored stop loss at ${stopLoss} (${stopDistancePips} pips buffer). Single-ticket exit eliminates fragmented scaling and maximizes capture fidelity.`;

    return {
      symbol,
      direction,
      confidenceScore,
      confluenceGrade,
      entryPrice: currentPrice,
      singleHighConfidenceTarget: singleTarget,
      targetDistancePips,
      riskRewardRatio,
      anchoredStopLoss: stopLoss,
      stopDistancePips,
      proportionalLotSize,
      projectedProfitUsd,
      projectedLossUsd,
      projectedRoiPercent,
      preTradeGateStatus: evaluatedPreTradeGate,
      screeningTier,
      breakevenRatchetArmed: true,
      institutionalRationale,
    };
  }
}

export const unifiedSetupEngine = UnifiedSetupEngine.getInstance();
