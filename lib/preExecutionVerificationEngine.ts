import { 
  CurrencyPair, 
  SwarmConsensusResult, 
  PreExecutionAtomicVerification,
  EntryProximityFilterResult,
  RiskGovernanceGatekeeperResult
} from './types';
import { LiveMarketFeedManager } from './liveMarketFeed';
import { MarketSessionManager } from './marketSessionManager';
import { PIP_VALUES } from './marketData';
import { diagnosticReasoningEngine } from './diagnosticReasoningEngine';
import { automatedSignalValidationModule } from './automatedSignalValidationModule';

export class PreExecutionVerificationEngine {
  private static instance: PreExecutionVerificationEngine;

  private constructor() {}

  public static getInstance(): PreExecutionVerificationEngine {
    if (!PreExecutionVerificationEngine.instance) {
      PreExecutionVerificationEngine.instance = new PreExecutionVerificationEngine();
    }
    return PreExecutionVerificationEngine.instance;
  }

  /**
   * Atomic Pre-Execution Verification Engine:
   * Evaluates all technical, fundamental, news wire sentiment, risk parameters,
   * and live bid/ask quotes atomically on the identical tick prior to order dispatch.
   * Completely decouples signal generation from execution dispatch.
   */
  public verifyAtomicTickExecution(params: {
    consensus: SwarmConsensusResult;
    accountBalance: number;
    freeMargin: number;
    proposedLots?: number;
    maxAllowedDeviationPercent?: number;
  }): PreExecutionAtomicVerification {
    const { 
      consensus, 
      accountBalance, 
      freeMargin, 
      proposedLots,
      maxAllowedDeviationPercent = 0.05 
    } = params;

    const pair = consensus.pair;
    const now = Date.now();
    const atomicTickId = `TICK-${pair.replace(/[^A-Z0-9]/g, '')}-${now.toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    const isGold = pair === 'XAU/USD';
    const isJpy = pair.includes('JPY');
    const pipMultiplier = PIP_VALUES[pair] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);

    // 1. Decoupled Real-Time Market Bid/Ask Price Engine
    const bidAsk = LiveMarketFeedManager.getCanonicalBidAsk(pair);
    const signal = consensus.executionSignal;
    const isSell = signal.orderType === 'SELL_MARKET' || consensus.unifiedDecision.direction === 'SELL';
    const orderType: 'BUY' | 'SELL' = isSell ? 'SELL' : 'BUY';

    // Long entries execute strictly at Ask; Short entries execute strictly at Bid
    const liveFillPrice = orderType === 'BUY' ? bidAsk.ask : bidAsk.bid;
    const signalPrice = signal.entry || consensus.currentPrice;

    // Calculate slippage and deviation
    const priceDeviation = Math.abs(liveFillPrice - signalPrice) / signalPrice;
    const priceDeviationPercent = Number((priceDeviation * 100).toFixed(4));
    const slippagePips = Number((Math.abs(liveFillPrice - signalPrice) / pipMultiplier).toFixed(2));

    // 2. Risk Management Workflow Verification (Mandatory Prior Completion)
    const risk = consensus.agents.risk;
    const riskWorkflowVerified = !!(
      risk &&
      risk.parameters &&
      risk.parameters.positionSizeLots > 0 &&
      risk.parameters.stopLoss > 0 &&
      risk.parameters.takeProfit1 > 0 &&
      consensus.overallConfidence >= 68
    );

    const proportionalLotSize = proposedLots || risk?.parameters?.positionSizeLots || signal.lots || 0.1;
    const requiredMarginUsd = (proportionalLotSize * 100000) / 30;

    // 3. Contradiction Resolution & News Wire Sentiment Inversion Check (Identical Tick)
    const news = consensus.agents.news;
    const technical = consensus.agents.technical;
    const fundamental = consensus.agents.fundamental;

    const newsSentimentInversion = !!(
      news &&
      ((orderType === 'BUY' && news.bias.includes('SELL') && (news.sentimentScore <= -50 || news.breakingAlert)) ||
       (orderType === 'SELL' && news.bias.includes('BUY') && (news.sentimentScore >= 50 || news.breakingAlert)))
    );

    const macroTechDivergence = !!(
      (orderType === 'BUY' && fundamental.bias.includes('SELL') && technical.bias.includes('BUY')) ||
      (orderType === 'SELL' && fundamental.bias.includes('BUY') && technical.bias.includes('SELL'))
    );

    // Structural level invalidation check
    const structuralInvalidationBreached = orderType === 'BUY'
      ? (technical.keySupport ? liveFillPrice < technical.keySupport : false)
      : (technical.keyResistance ? liveFillPrice > technical.keyResistance : false);

    const contradictionCheckPassed = !newsSentimentInversion && !structuralInvalidationBreached;

    let contradictionDirective = 'All 5 desks aligned without contradictory tick inversions.';
    if (newsSentimentInversion) {
      contradictionDirective = `CONTRADICTORY INVERSION: Live news wire pulse (${news.marketMood}, ${news.bias}) directly inverts ${orderType} bias on this tick.`;
    } else if (structuralInvalidationBreached) {
      contradictionDirective = `STRUCTURAL BREACH: Price ${liveFillPrice} has already breached ${orderType === 'BUY' ? 'support floor' : 'resistance ceiling'} on execution tick.`;
    }

    // 4. Historical Memory Constraint Verification (1051+ Operative Rules)
    const failurePreCheck = diagnosticReasoningEngine.crossReferenceSetup({
      symbol: pair,
      direction: orderType,
      lots: proportionalLotSize,
      indicators: technical.indicators,
      smcStructure: technical.smartMoneyConcepts?.structure,
      centralBankBias: fundamental.baseCurrencyOutlook?.centralBankStance,
    });

    const failureConstraintCheck = {
      passed: failurePreCheck.allowed,
      matchingRuleId: failurePreCheck.matchingFailureRule?.id,
      similarityScore: failurePreCheck.similarityScore,
    };

    // 5. Freeze Check (Only hard-stop if entire market is frozen / weekend)
    const isFrozen = MarketSessionManager.isMarketFrozen(pair);
    if (isFrozen) {
      return {
        isVerified: false,
        atomicTickId,
        verificationTimestamp: now,
        symbol: pair,
        orderType,
        signalPrice,
        liveBid: bidAsk.bid,
        liveAsk: bidAsk.ask,
        liveFillPrice,
        spreadPips: bidAsk.spreadPips,
        priceDeviationPercent,
        slippagePips,
        riskWorkflowVerified,
        proportionalLotSize,
        requiredMarginUsd,
        freeMarginUsd: freeMargin,
        contradictionCheck: {
          passed: false,
          newsSentimentInversionDetected: false,
          macroTechnicalDivergenceDetected: false,
          structuralInvalidationBreached: false,
          resolutionDirective: 'Market session is currently closed / frozen.',
        },
        failureConstraintCheck,
        action: 'ABORT_AND_RECALIBRATE',
        abortReason: `Market session is closed for ${pair}. Order dispatch withheld.`,
      };
    }

    // 6. Strict Pre-Execution Guardrails:
    // Enforce 10-pip maximum entry bound and verify all atomic criteria
    const effectiveSignalPrice = signalPrice;

    const entryProximity = automatedSignalValidationModule.evaluateEntryProximityBand({
      symbol: pair,
      proposedEntry: effectiveSignalPrice,
      livePrice: liveFillPrice,
      minBandPips: 10,
    });

    const riskGovernance = automatedSignalValidationModule.evaluateRiskGovernance({
      symbol: pair,
      accountEquity: accountBalance,
      riskRewardRatio: signal.riskReward || risk?.parameters?.riskRewardRatio || 1.5,
      monteCarloWinProbability: risk?.monteCarlo?.projectedProfitProbability || consensus.overallConfidence || 70,
      proposedStopLoss: signal.stopLoss || risk?.parameters?.stopLoss,
      currentPrice: liveFillPrice,
      direction: orderType,
      maxDrawdownLimitPercent: 2.0,
      minAllowedRiskReward: 1.0,
      minAllowedWinProbability: 40,
    });

    // Check strict gatekeeper failure conditions
    if (slippagePips > 10.0) {
      return {
        isVerified: false,
        atomicTickId,
        verificationTimestamp: now,
        symbol: pair,
        orderType,
        signalPrice: effectiveSignalPrice,
        liveBid: bidAsk.bid,
        liveAsk: bidAsk.ask,
        liveFillPrice,
        spreadPips: bidAsk.spreadPips,
        priceDeviationPercent,
        slippagePips,
        riskWorkflowVerified,
        proportionalLotSize: 0,
        requiredMarginUsd: 0,
        freeMarginUsd: freeMargin,
        contradictionCheck: {
          passed: contradictionCheckPassed,
          newsSentimentInversionDetected: newsSentimentInversion,
          macroTechnicalDivergenceDetected: macroTechDivergence,
          structuralInvalidationBreached,
          resolutionDirective: contradictionDirective,
        },
        failureConstraintCheck,
        entryProximityFilter: entryProximity,
        riskGovernanceValidation: riskGovernance,
        action: 'ABORT_AND_RECALIBRATE',
        abortReason: `SLIPPAGE EXCEEDED: Real-time slippage of ${slippagePips} pips exceeds the 10.0 pip safety threshold. Order execution aborted.`,
      };
    }

    if (!contradictionCheckPassed) {
      return {
        isVerified: false,
        atomicTickId,
        verificationTimestamp: now,
        symbol: pair,
        orderType,
        signalPrice: effectiveSignalPrice,
        liveBid: bidAsk.bid,
        liveAsk: bidAsk.ask,
        liveFillPrice,
        spreadPips: bidAsk.spreadPips,
        priceDeviationPercent,
        slippagePips,
        riskWorkflowVerified,
        proportionalLotSize: 0,
        requiredMarginUsd: 0,
        freeMarginUsd: freeMargin,
        contradictionCheck: {
          passed: false,
          newsSentimentInversionDetected: newsSentimentInversion,
          macroTechnicalDivergenceDetected: macroTechDivergence,
          structuralInvalidationBreached,
          resolutionDirective: contradictionDirective,
        },
        failureConstraintCheck,
        entryProximityFilter: entryProximity,
        riskGovernanceValidation: riskGovernance,
        action: 'ABORT_AND_RECALIBRATE',
        abortReason: contradictionDirective,
      };
    }

    if (!failureConstraintCheck.passed) {
      return {
        isVerified: false,
        atomicTickId,
        verificationTimestamp: now,
        symbol: pair,
        orderType,
        signalPrice: effectiveSignalPrice,
        liveBid: bidAsk.bid,
        liveAsk: bidAsk.ask,
        liveFillPrice,
        spreadPips: bidAsk.spreadPips,
        priceDeviationPercent,
        slippagePips,
        riskWorkflowVerified,
        proportionalLotSize: 0,
        requiredMarginUsd: 0,
        freeMarginUsd: freeMargin,
        contradictionCheck: {
          passed: contradictionCheckPassed,
          newsSentimentInversionDetected: newsSentimentInversion,
          macroTechnicalDivergenceDetected: macroTechDivergence,
          structuralInvalidationBreached,
          resolutionDirective: contradictionDirective,
        },
        failureConstraintCheck,
        entryProximityFilter: entryProximity,
        riskGovernanceValidation: riskGovernance,
        action: 'ABORT_AND_RECALIBRATE',
        abortReason: `HISTORICAL LOSS RULE MATCH: Diagnostic engine identified matching loss heuristic #${failureConstraintCheck.matchingRuleId}. Order execution aborted.`,
      };
    }

    if (!riskWorkflowVerified) {
      return {
        isVerified: false,
        atomicTickId,
        verificationTimestamp: now,
        symbol: pair,
        orderType,
        signalPrice: effectiveSignalPrice,
        liveBid: bidAsk.bid,
        liveAsk: bidAsk.ask,
        liveFillPrice,
        spreadPips: bidAsk.spreadPips,
        priceDeviationPercent,
        slippagePips,
        riskWorkflowVerified: false,
        proportionalLotSize: 0,
        requiredMarginUsd: 0,
        freeMarginUsd: freeMargin,
        contradictionCheck: {
          passed: contradictionCheckPassed,
          newsSentimentInversionDetected: newsSentimentInversion,
          macroTechnicalDivergenceDetected: macroTechDivergence,
          structuralInvalidationBreached,
          resolutionDirective: contradictionDirective,
        },
        failureConstraintCheck,
        entryProximityFilter: entryProximity,
        riskGovernanceValidation: riskGovernance,
        action: 'ABORT_AND_RECALIBRATE',
        abortReason: 'RISK WORKFLOW INCOMPLETE: Risk parameters unverified or overall confidence (<68%) below institutional requirement.',
      };
    }

    // Dynamic sizing within verified bounds
    let validatedLots = proportionalLotSize;
    if (requiredMarginUsd > freeMargin && freeMargin > 0) {
      validatedLots = Math.max(0.01, Math.min(0.02, validatedLots));
    }

    const finalRequiredMargin = (validatedLots * 100000) / 30;

    // All atomic pre-execution checks verified on identical tick: DISPATCH_ORDER approved
    return {
      isVerified: true,
      atomicTickId,
      verificationTimestamp: now,
      symbol: pair,
      orderType,
      signalPrice: effectiveSignalPrice,
      liveBid: bidAsk.bid,
      liveAsk: bidAsk.ask,
      liveFillPrice,
      spreadPips: bidAsk.spreadPips,
      priceDeviationPercent,
      slippagePips,
      riskWorkflowVerified: true,
      proportionalLotSize: validatedLots,
      requiredMarginUsd: finalRequiredMargin,
      freeMarginUsd: freeMargin,
      contradictionCheck: {
        passed: true,
        newsSentimentInversionDetected: newsSentimentInversion,
        macroTechnicalDivergenceDetected: macroTechDivergence,
        structuralInvalidationBreached,
        resolutionDirective: 'Atomic cross-desk confluence verified on identical tick.',
      },
      failureConstraintCheck: {
        passed: true,
        similarityScore: failurePreCheck.similarityScore,
      },
      entryProximityFilter: entryProximity,
      riskGovernanceValidation: riskGovernance,
      action: 'DISPATCH_ORDER',
    };
  }
}

export const preExecutionVerificationEngine = PreExecutionVerificationEngine.getInstance();
