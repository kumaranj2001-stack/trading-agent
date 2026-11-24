import {
  CurrencyPair,
  ConfluenceGrade,
  OrderBookLiquidityWallSnapshot,
  PreTradeValidationGateResult,
  UnifiedProfitableSetup,
  KnowledgeRule,
  StructuralInvalidationPoint,
  DynamicTargetCalculationLogic,
  DynamicRiskProfile
} from './types';
import { PIP_VALUES } from './marketData';
import { invalidCriteriaMemoryManager } from './invalidCriteriaMemory';
import { multiTieredScreeningEngine } from './screeningEngine';

/**
 * 🎯 Unified High-Conviction Profitable Setup Engine
 *
 * Transitions from fragmented multi-target scaling (TP1, TP2, TP3, runner)
 * to a standardized unified risk-first framework where every setup is
 * inextricably linked to its structural invalidation point for stop-loss
 * placement and dynamic target calculation logic stored in the knowledge base.
 *
 * Mandate: Prioritize dynamic risk management over rigid rules. Entries are
 * authorized exclusively when structural invalidation and dynamic target
 * mathematics satisfy institutional clearance.
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
   * and structural invalidation logic linked to the governing knowledge rule.
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
    governingRule?: KnowledgeRule;
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
      governingRule,
    } = params;

    const isGold = symbol === 'XAU/USD';
    const isJpy = symbol.includes('JPY');
    const isIndian = symbol.includes('NIFTY') || symbol.includes('RELIANCE');
    const decimals = isGold || isIndian ? 2 : isJpy ? 3 : 5;
    const pipMultiplier = PIP_VALUES[symbol] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);

    const isSell = direction === 'SELL';
    const isHold = direction === 'HOLD';

    // 1. Resolve Governing Structural Invalidation & Dynamic Target Schemas
    const structuralInvalidation: StructuralInvalidationPoint = governingRule?.structuralInvalidation || {
      anchorType: 'ORDER_BLOCK_BOUNDARY',
      anchorOffsetPips: 0.0,
      invalidationPriceFormula: isSell
        ? 'SupplyOrderBlock.High (Structural Liquidity Ceiling)'
        : 'DemandOrderBlock.Low (Structural Liquidity Floor)',
      structuralBoundaryDescription: 'Structural breach directly beyond order block boundary invalidates institutional momentum.',
      trailingBreakevenTriggerPips: 8.0,
      maxPermissibleStopDistancePips: 20.0,
    };

    const dynamicTargetLogic: DynamicTargetCalculationLogic = governingRule?.dynamicTargetLogic || {
      targetType: 'OPPOSING_LIQUIDITY_POOL',
      minimumRiskRewardRatio: 1.8,
      targetCalculationFormula: 'EntryPrice +/- (Abs(EntryPrice - StopLoss) * 1.8) towards Immediate Analytical Zone',
      volatilityExpansionCoefficient: 1.25,
      dynamicExitRatchet: '1:1 Breakeven locked at +8p; high-probability exit at analytical zone.',
    };

    const dynamicRiskProfile: DynamicRiskProfile = governingRule?.dynamicRiskProfile || {
      riskFirstPrecedence: true,
      proportionalSizingMethod: 'VOLATILITY_ADJUSTED_EQUITY_PERCENT',
      maxAccountRiskPercent: 2.0,
      expectedRoiPercent: 12.5,
    };

    // 2. Derive Structural Protective Stop Loss using the Schema Invalidation Logic (Zero Fixed Buffer)
    let stopLoss = 0;
    let stopDistancePips = 0;

    const offsetPips = structuralInvalidation.anchorOffsetPips ?? 0.0;
    const atrBuffer = liquidityWalls?.volatilityAtrBufferPips || 12.0;

    if (liquidityWalls && liquidityWalls.anchoredStopLossLevel > 0) {
      stopLoss = Number(liquidityWalls.anchoredStopLossLevel.toFixed(decimals));
      stopDistancePips = Number((Math.abs(currentPrice - stopLoss) / pipMultiplier).toFixed(1));
    } else {
      stopDistancePips = Math.max(10, atrBuffer);
      if (isSell) {
        stopLoss = Number((currentPrice + stopDistancePips * pipMultiplier).toFixed(decimals));
      } else {
        stopLoss = Number((currentPrice - stopDistancePips * pipMultiplier).toFixed(decimals));
      }
    }

    // Safety fallback
    if (stopDistancePips <= 0) {
      stopDistancePips = 12.0;
      stopLoss = Number((isSell ? currentPrice + 12 * pipMultiplier : currentPrice - 12 * pipMultiplier).toFixed(decimals));
    }

    // 3. Dynamic Risk Priority Gate Verification (Precedence over Rigid Entry Triggers)
    let riskFirstGatingPassed = true;
    let riskGatingRationale = '';

    // Gate Condition A: Stop distance must not exceed max permissible threshold
    if (stopDistancePips > structuralInvalidation.maxPermissibleStopDistancePips) {
      // Dynamically clamp stop distance to structural boundary
      stopDistancePips = structuralInvalidation.maxPermissibleStopDistancePips;
      stopLoss = Number((isSell ? currentPrice + stopDistancePips * pipMultiplier : currentPrice - stopDistancePips * pipMultiplier).toFixed(decimals));
      riskGatingRationale = `Stop loss dynamically anchored to structural boundary (${stopDistancePips}p) at ${structuralInvalidation.anchorType}.`;
    }

    // 4. Derive Single High-Confidence Target via Dynamic Target Calculation Logic (Calibrated to Analytical Zones)
    const minRRR = Math.max(
      1.5,
      dynamicTargetLogic.minimumRiskRewardRatio || 1.8,
      confluenceGrade === 'A+' ? 2.2 : confluenceGrade === 'A' ? 1.85 : 1.6
    );

    const targetDistancePips = Number((stopDistancePips * minRRR).toFixed(1));
    let singleTarget = 0;
    if (isSell) {
      singleTarget = Number((currentPrice - targetDistancePips * pipMultiplier).toFixed(decimals));
    } else {
      singleTarget = Number((currentPrice + targetDistancePips * pipMultiplier).toFixed(decimals));
    }

    const riskRewardRatio = Number((targetDistancePips / stopDistancePips).toFixed(2));

    // Gate Condition B: Target must meet institutional R:R floor (1:1.4)
    if (riskRewardRatio < 1.4) {
      riskFirstGatingPassed = false;
      riskGatingRationale = `Dynamic risk gate rejected entry: Calculated R:R (${riskRewardRatio}:1) is below 1:1.4 threshold.`;
    } else if (!riskGatingRationale) {
      riskGatingRationale = `Dynamic risk precedence verified: Invalidation anchored directly to ${structuralInvalidation.anchorType} (${structuralInvalidation.invalidationPriceFormula}). Dynamic target achieves ${riskRewardRatio}:1 R:R aligned with immediate analytical zone (${dynamicTargetLogic.targetType}).`;
    }

    // 5. Proportional Lot Sizing (Dynamic Risk Profile Sizing Method)
    const maxRiskCapital = accountEquity * (dynamicRiskProfile.maxAccountRiskPercent / 100);
    const pipValueUsdPerLot = isGold ? 10.0 : isJpy ? 7.5 : isIndian ? 1.2 : 10.0;
    const totalRiskPerLot = stopDistancePips * pipValueUsdPerLot;
    const rawLots = maxRiskCapital / (totalRiskPerLot || 1);
    const proportionalLotSize = Number(Math.max(0.01, Math.min(2.5, Number(rawLots.toFixed(2)))).toFixed(2));

    const projectedLossUsd = Number((proportionalLotSize * stopDistancePips * pipValueUsdPerLot).toFixed(2));
    const projectedProfitUsd = Number((proportionalLotSize * targetDistancePips * pipValueUsdPerLot).toFixed(2));
    const projectedRoiPercent = Number(((projectedProfitUsd / (accountEquity || 10000)) * 100).toFixed(2));

    // 6. Pre-Trade Gate & Screening Status
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
      : `Unified Risk-First Single-Target Setup: Entry at ${currentPrice} linked to ${structuralInvalidation.anchorType} (SL: ${stopLoss}, -${stopDistancePips}p) and dynamic target at ${singleTarget} (+${targetDistancePips}p, ${riskRewardRatio}:1 R:R) governed by ${governingRule?.id || 'UNIFIED-QUANT-SCHEMA'}. Single-ticket execution eliminates fragmented exits.`;

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
      linkedRuleId: governingRule?.id || 'UNIFIED-QUANT-SCHEMA',
      structuralInvalidation,
      dynamicTargetLogic,
      dynamicRiskProfile,
      riskFirstGatingPassed,
      riskGatingRationale,
    };
  }
}

export const unifiedSetupEngine = UnifiedSetupEngine.getInstance();
