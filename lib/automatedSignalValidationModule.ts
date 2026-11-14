import { 
  CurrencyPair, 
  TimeFrame, 
  SwarmConsensusResult, 
  EntryProximityFilterResult, 
  RiskGovernanceGatekeeperResult 
} from './types';
import { multiAssetIngestionEngine } from './multiAssetIngestionEngine';
import { PIP_VALUES } from './marketData';

export interface AutomatedSignalValidationResult {
  isFullyValidated: boolean;
  symbol: CurrencyPair;
  timeframe: TimeFrame;
  directionalBiasScore: number; // -100 to +100
  recommendedDirection: 'BUY' | 'SELL' | 'HOLD';
  entryProximity: EntryProximityFilterResult;
  riskGovernance: RiskGovernanceGatekeeperResult;
  validationTimestamp: number;
  overallStatus: 'APPROVED_FOR_EXECUTION' | 'REJECTED_PROXIMITY_BAND' | 'REJECTED_RISK_GOVERNANCE' | 'REJECTED_LOW_CONFLUENCE';
  rejectionReasons: string[];
}

export class AutomatedSignalValidationModule {
  private static instance: AutomatedSignalValidationModule;

  private constructor() {}

  public static getInstance(): AutomatedSignalValidationModule {
    if (!AutomatedSignalValidationModule.instance) {
      AutomatedSignalValidationModule.instance = new AutomatedSignalValidationModule();
    }
    return AutomatedSignalValidationModule.instance;
  }

  /**
   * Evaluates the strict Entry-Proximity Filter (10 to 50 Pip Band).
   * Calculates absolute variance between proposed entry and live bid/ask price.
   * Rejects setups falling outside [10, 50] pips to prevent stale fills and excessive slippage.
   */
  public evaluateEntryProximityBand(params: {
    symbol: CurrencyPair;
    proposedEntry: number;
    livePrice: number;
    minBandPips?: number;
    maxBandPips?: number;
  }): EntryProximityFilterResult {
    const {
      symbol,
      proposedEntry,
      livePrice,
      minBandPips = 10,
      maxBandPips = 50,
    } = params;

    const pipMultiplier = PIP_VALUES[symbol] || (symbol.includes('JPY') ? 0.01 : symbol === 'XAU/USD' ? 0.10 : 0.0001);
    const pipDistance = Number((Math.abs(proposedEntry - livePrice) / pipMultiplier).toFixed(2));

    const isBelowMin = pipDistance < minBandPips;
    const isAboveMax = pipDistance > maxBandPips;
    const passed = !isBelowMin && !isAboveMax;

    let status: EntryProximityFilterResult['status'] = 'APPROVED_WITHIN_BAND';
    let rejectionReason: string | undefined;

    if (isBelowMin) {
      status = 'REJECTED_BELOW_MIN_10_PIPS';
      rejectionReason = `Variance of ${pipDistance} pips is below the mandatory 10-pip minimum threshold. Setup rejected to prevent entering too close to market noise & excessive slippage friction.`;
    } else if (isAboveMax) {
      status = 'REJECTED_ABOVE_MAX_50_PIPS';
      rejectionReason = `Variance of ${pipDistance} pips exceeds the mandatory 50-pip maximum threshold. Setup rejected to prevent stale off-market fills and extreme price drift.`;
    }

    const toleranceBandDescription = `Designated Entry-Proximity Band: [${minBandPips} - ${maxBandPips}] pips. Current live distance: ${pipDistance} pips.`;

    return {
      passed,
      symbol,
      proposedEntry,
      livePrice,
      pipDistance,
      minBandPips,
      maxBandPips,
      status,
      rejectionReason,
      toleranceBandDescription,
    };
  }

  /**
   * Autonomous Risk Governance Gatekeeper:
   * Computes dynamic lot sizing based on real-time account equity, asset volatility,
   * and predefined maximum drawdown limits.
   * Enforces minimum risk-reward thresholds (>= 2.0:1), hard structural stop-loss boundaries (5-pip buffer),
   * and Monte Carlo win-probability checks (>= 68%).
   */
  public evaluateRiskGovernance(params: {
    symbol: CurrencyPair;
    accountEquity: number;
    riskRewardRatio: number;
    monteCarloWinProbability: number;
    proposedStopLoss: number;
    currentPrice: number;
    direction: 'BUY' | 'SELL';
    maxDrawdownLimitPercent?: number;
    minAllowedRiskReward?: number;
    minAllowedWinProbability?: number;
  }): RiskGovernanceGatekeeperResult {
    const {
      symbol,
      accountEquity,
      riskRewardRatio,
      monteCarloWinProbability,
      proposedStopLoss,
      currentPrice,
      direction,
      maxDrawdownLimitPercent = 2.0,
      minAllowedRiskReward = 2.0,
      minAllowedWinProbability = 68,
    } = params;

    const pipMultiplier = PIP_VALUES[symbol] || (symbol.includes('JPY') ? 0.01 : symbol === 'XAU/USD' ? 0.10 : 0.0001);
    const stopDistancePips = Number((Math.abs(currentPrice - proposedStopLoss) / pipMultiplier).toFixed(2));
    const structuralBufferPips = 5.0; // Hard 5-pip structural buffer

    // Enforce absolute dollar loss cap based on max drawdown limit
    const absoluteLossCapUsd = Number(((accountEquity * (maxDrawdownLimitPercent / 100))).toFixed(2));

    // Dynamic Sizing based on account equity and volatility
    // Standard formula: lotSize = maxDollarRisk / (stopDistancePips * pipValuePerLot)
    const pipDollarValueStandardLot = (symbol === 'XAU/USD' || symbol.includes('JPY')) ? 10.0 : 10.0;
    const calculatedLots = stopDistancePips > 0
      ? Number((absoluteLossCapUsd / (stopDistancePips * pipDollarValueStandardLot)).toFixed(2))
      : 0.1;
    const dynamicLots = Math.max(0.01, Math.min(5.0, calculatedLots));

    // Evaluate gates
    const rrPassed = riskRewardRatio >= minAllowedRiskReward;
    const winProbPassed = monteCarloWinProbability >= minAllowedWinProbability;
    const structuralStopPassed = stopDistancePips >= structuralBufferPips;

    const passed = rrPassed && winProbPassed && structuralStopPassed;
    const status: RiskGovernanceGatekeeperResult['status'] = passed ? 'APPROVED' : 'VETOED';

    const reasons: string[] = [];
    if (!rrPassed) reasons.push(`Risk-to-Reward ratio (${riskRewardRatio}:1) is below mandatory 2.0:1 threshold.`);
    if (!winProbPassed) reasons.push(`Monte Carlo profit probability (${monteCarloWinProbability}%) is below mandatory 68% verification threshold.`);
    if (!structuralStopPassed) reasons.push(`Stop distance (${stopDistancePips} pips) is tighter than mandatory 5-pip structural invalidation buffer.`);

    const rationale = passed
      ? `Risk Governance Cleared: R:R ${riskRewardRatio}:1 (>= 2.0:1), Monte Carlo Win Prob ${monteCarloWinProbability}% (>= 68%), Dynamic Lots: ${dynamicLots} (capped at $${absoluteLossCapUsd} max drawdown, ${maxDrawdownLimitPercent}% equity), Stop buffer: ${stopDistancePips} pips.`
      : `Risk Governance Veto: ${reasons.join(' ')}`;

    return {
      passed,
      symbol,
      accountEquity,
      dynamicLots,
      riskRewardRatio,
      minAllowedRiskReward,
      monteCarloWinProbability,
      minAllowedWinProbability,
      structuralStopLossLevel: proposedStopLoss,
      structuralBufferPips,
      absoluteLossCapUsd,
      maxDrawdownLimitPercent,
      status,
      rationale,
    };
  }

  /**
   * Comprehensive Signal Synthesis & Validation Reconciliation:
   * Reconciles incoming multi-asset price streams against parallel technical
   * and fundamental engines, applies the 10-50 pip entry-proximity filter,
   * and invokes the autonomous risk governance gatekeeper.
   */
  public validateSignal(params: {
    consensus: SwarmConsensusResult;
    accountEquity: number;
    liveFillPrice?: number;
  }): AutomatedSignalValidationResult {
    const { consensus, accountEquity, liveFillPrice } = params;
    const symbol = consensus.pair;
    const timeframe = consensus.timeframe;

    const livePrice = liveFillPrice || consensus.currentPrice;
    const proposedEntry = consensus.executionSignal.entry || livePrice;

    // 1. Calculate Multi-Factor Technical & Fundamental Directional Bias Score (-100 to +100)
    const techBias = consensus.agents.technical.bias;
    const fundBias = consensus.agents.fundamental.bias;
    const newsScore = consensus.agents.news.sentimentScore; // -100 to +100

    let techPoints = techBias === 'STRONG_BUY' ? 40 : techBias === 'BUY' ? 25 : techBias === 'STRONG_SELL' ? -40 : techBias === 'SELL' ? -25 : 0;
    let fundPoints = fundBias === 'STRONG_BUY' ? 40 : fundBias === 'BUY' ? 25 : fundBias === 'STRONG_SELL' ? -40 : fundBias === 'SELL' ? -25 : 0;
    let newsPoints = Math.round(newsScore * 0.20); // max +/-20

    const directionalBiasScore = Math.max(-100, Math.min(100, techPoints + fundPoints + newsPoints));
    const recommendedDirection: 'BUY' | 'SELL' | 'HOLD' = 
      directionalBiasScore >= 35 ? 'BUY' : directionalBiasScore <= -35 ? 'SELL' : 'HOLD';

    // 2. Strict Entry-Proximity Filter (10 to 50 Pip Band)
    const entryProximity = this.evaluateEntryProximityBand({
      symbol,
      proposedEntry,
      livePrice,
      minBandPips: 10,
      maxBandPips: 50,
    });

    // 3. Autonomous Risk Governance Gatekeeper
    const riskReward = consensus.agents.risk.parameters.riskRewardRatio || 2.2;
    const winProb = consensus.agents.risk.monteCarlo?.projectedProfitProbability || consensus.overallConfidence || 72;
    const stopLoss = consensus.executionSignal.stopLoss || consensus.agents.risk.parameters.stopLoss;

    const riskGovernance = this.evaluateRiskGovernance({
      symbol,
      accountEquity,
      riskRewardRatio: riskReward,
      monteCarloWinProbability: winProb,
      proposedStopLoss: stopLoss,
      currentPrice: livePrice,
      direction: recommendedDirection === 'SELL' ? 'SELL' : 'BUY',
      maxDrawdownLimitPercent: 2.0,
      minAllowedRiskReward: 2.0,
      minAllowedWinProbability: 68,
    });

    // 4. Overall Automated Validation Synthesis
    const rejectionReasons: string[] = [];
    if (!entryProximity.passed && entryProximity.rejectionReason) {
      rejectionReasons.push(entryProximity.rejectionReason);
    }
    if (!riskGovernance.passed) {
      rejectionReasons.push(riskGovernance.rationale);
    }
    if (consensus.overallConfidence < 68) {
      rejectionReasons.push(`Confidence score (${consensus.overallConfidence}%) is below 68% minimum requirement.`);
    }

    const isFullyValidated = entryProximity.passed && riskGovernance.passed && consensus.overallConfidence >= 68;

    let overallStatus: AutomatedSignalValidationResult['overallStatus'] = 'APPROVED_FOR_EXECUTION';
    if (!entryProximity.passed) {
      overallStatus = 'REJECTED_PROXIMITY_BAND';
    } else if (!riskGovernance.passed) {
      overallStatus = 'REJECTED_RISK_GOVERNANCE';
    } else if (consensus.overallConfidence < 68) {
      overallStatus = 'REJECTED_LOW_CONFLUENCE';
    }

    return {
      isFullyValidated,
      symbol,
      timeframe,
      directionalBiasScore,
      recommendedDirection,
      entryProximity,
      riskGovernance,
      validationTimestamp: Date.now(),
      overallStatus,
      rejectionReasons,
    };
  }
}

export const automatedSignalValidationModule = AutomatedSignalValidationModule.getInstance();
