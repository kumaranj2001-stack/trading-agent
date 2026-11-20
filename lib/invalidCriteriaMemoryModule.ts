import {
  CurrencyPair,
  TimeFrame,
  Position,
  SwarmConsensusResult,
  InvalidCriterionPattern,
  PreTradeValidationGateResult,
  TechnicalAnalysis,
  FundamentalAnalysis,
  OrderFlowAnalysis,
  NewsAnalysis,
} from './types';
import { PIP_VALUES } from './marketData';

// ============================================================================
// 🧠 PERSISTENT MEMORY MODULE & AUTOMATED LEARNING LOOP
// Captures specific variable states of losing trades as 'Invalid Criteria'
// and enforces mandatory pre-trade validation to prevent repeating past setups.
// ============================================================================

const STORAGE_KEY = 'qri_invalid_criteria_memory_v1';
const isBrowser = typeof window !== 'undefined';

/**
 * Baseline Seed Institutional Failure Patterns (Armed on Boot)
 */
const SEED_FAILURE_PATTERNS: InvalidCriterionPattern[] = [
  {
    id: 'INV-CRIT-SEED-01-MOMENTUM-FAKEOUT',
    tradeId: 'trade-seed-sl-01',
    symbol: 'EUR/USD',
    direction: 'BUY',
    timeframe: '1h',
    lossAmountUsd: -180.0,
    lossPips: 24.0,
    exitReason: 'PARAMOUNT_STRUCTURAL_OVERRIDE',
    timestampEpochMs: Date.now() - 86400000 * 3,
    timestampIso: new Date(Date.now() - 86400000 * 3).toISOString(),
    technicalState: {
      rsi: 74.5,
      macdHistogram: -0.0004,
      emaSpreadPercent: 0.12,
      bbBandwidth: 1.85,
      atrPips: 16.5,
      candlestickPattern: 'Bearish Exhaustion Wick',
      smcStructure: 'BEARISH_MSS',
      orderBlockMitigation: 'MITIGATED_SUPPLY',
      fvgStatus: 'INVERTED_FVG',
      liquiditySweep: 'BUY_SIDE_LIQUIDITY_PURGED',
    },
    fundamentalState: {
      macroRegime: 'Tightening & Real Yield Expansion',
      realYieldSpread: -1.45,
      centralBankStance: 'HAWKISH_HOLD',
      newsSentimentScore: -35,
      sentimentBias: 'BEARISH',
    },
    orderFlowState: {
      cvdTrend: 'BEARISH_EXHAUSTION',
      imbalanceRatio: '3.8:1_SELL',
      wallThickness: 2.4,
    },
    session: 'LONDON_NY_OVERLAP',
    normalizedVector: [0.745, 0.48, 0.12, 1.85, 0.165, 0.355, 0.325, 0.2, 3.8, 0.48, 1.0, 0.8],
    matchedFailureArchetype: 'Over-Extended Momentum Chasing at Resistance Ceiling',
    failureExplanation: 'Entering long with RSI > 70 directly into overhead mitigated supply order block while CVD shows heavy institutional delta distribution.',
    preventativeAction: 'BLOCK_EXECUTION',
  },
  {
    id: 'INV-CRIT-SEED-02-YIELD-INVERSION-SQUEEZE',
    tradeId: 'trade-seed-sl-02',
    symbol: 'XAU/USD',
    direction: 'BUY',
    timeframe: '1h',
    lossAmountUsd: -245.0,
    lossPips: 42.0,
    exitReason: 'INVALIDATION_AUTO_CLOSE',
    timestampEpochMs: Date.now() - 86400000 * 2,
    timestampIso: new Date(Date.now() - 86400000 * 2).toISOString(),
    technicalState: {
      rsi: 61.2,
      macdHistogram: 0.0002,
      emaSpreadPercent: 0.08,
      bbBandwidth: 1.15,
      atrPips: 22.0,
      candlestickPattern: 'Bearish Impulse Candle',
      smcStructure: 'BEARISH_CHoCH',
      orderBlockMitigation: 'UNMITIGATED_SUPPLY',
      fvgStatus: 'OPEN_BEARISH_GAP',
      liquiditySweep: 'BUY_SIDE_LIQUIDITY_PURGED',
    },
    fundamentalState: {
      macroRegime: 'Sovereign Real Yield Surge',
      realYieldSpread: -2.15,
      centralBankStance: 'HAWKISH_PIVOT',
      newsSentimentScore: -55,
      sentimentBias: 'STRONG_BEARISH',
    },
    orderFlowState: {
      cvdTrend: 'AGGRESSIVE_SELLING',
      imbalanceRatio: '4.2:1_SELL',
      wallThickness: 3.1,
    },
    session: 'NEW_YORK',
    normalizedVector: [0.612, 0.51, 0.08, 1.15, 0.22, 0.285, 0.225, 0.1, 4.2, 0.62, 2.0, 0.7],
    matchedFailureArchetype: 'Contrarian Sovereign Yield Spike Inversion',
    failureExplanation: 'Gold long setup caught in violent sovereign real yield breakout (+16 bps 2Y yield expansion), overwhelming technical support.',
    preventativeAction: 'BLOCK_EXECUTION',
  },
  {
    id: 'INV-CRIT-SEED-03-ASIAN-LOW-LIQUIDITY-TRAP',
    tradeId: 'trade-seed-sl-03',
    symbol: 'USD/JPY',
    direction: 'BUY',
    timeframe: '15m',
    lossAmountUsd: -165.0,
    lossPips: 18.5,
    exitReason: 'STOP_LOSS_HIT',
    timestampEpochMs: Date.now() - 86400000 * 1,
    timestampIso: new Date(Date.now() - 86400000 * 1).toISOString(),
    technicalState: {
      rsi: 68.0,
      macdHistogram: 0.0001,
      emaSpreadPercent: 0.05,
      bbBandwidth: 0.65,
      atrPips: 11.0,
      candlestickPattern: 'Doji False Breakout',
      smcStructure: 'INTERNAL_RANGE_CONSOLIDATION',
      orderBlockMitigation: 'NONE',
      fvgStatus: 'NONE',
      liquiditySweep: 'LIQUIDITY_VACUUM',
    },
    fundamentalState: {
      macroRegime: 'BOJ Intervention Jawboning',
      realYieldSpread: 1.10,
      centralBankStance: 'INTERVENTION_RISK',
      newsSentimentScore: -20,
      sentimentBias: 'NEUTRAL_BEARISH',
    },
    orderFlowState: {
      cvdTrend: 'FLAT_VOLUME_VACUUM',
      imbalanceRatio: '1.2:1',
      wallThickness: 0.7,
    },
    session: 'ASIAN_TOKYO',
    normalizedVector: [0.68, 0.505, 0.05, 0.65, 0.11, 0.61, 0.40, 0.5, 1.2, 0.14, 3.0, 0.3],
    matchedFailureArchetype: 'Asian Low-Liquidity Range Squeeze & Rollover Trap',
    failureExplanation: 'Entering breakout in thin Tokyo session without volume support; market makers swept thin book causing instant slippage.',
    preventativeAction: 'BLOCK_EXECUTION',
  },
  {
    id: 'INV-CRIT-SEED-04-SUPPLY-WALL-ABSORPTION-REJECTION',
    tradeId: 'trade-seed-sl-04',
    symbol: 'GBP/USD',
    direction: 'BUY',
    timeframe: '1h',
    lossAmountUsd: -195.0,
    lossPips: 26.0,
    exitReason: 'PARAMOUNT_STRUCTURAL_OVERRIDE',
    timestampEpochMs: Date.now() - 86400000 * 4,
    timestampIso: new Date(Date.now() - 86400000 * 4).toISOString(),
    technicalState: {
      rsi: 71.0,
      macdHistogram: -0.0002,
      emaSpreadPercent: 0.09,
      bbBandwidth: 1.45,
      atrPips: 17.5,
      candlestickPattern: 'Shooting Star Reversal',
      smcStructure: 'BEARISH_REJECTION',
      orderBlockMitigation: 'VIRGIN_SUPPLY_WALL',
      fvgStatus: 'FILLED_FVG',
      liquiditySweep: 'BUY_SIDE_LIQUIDITY_PURGED',
    },
    fundamentalState: {
      macroRegime: 'BOE Stagflation Drag',
      realYieldSpread: -0.85,
      centralBankStance: 'DOVISH_HOLD',
      newsSentimentScore: -30,
      sentimentBias: 'BEARISH',
    },
    orderFlowState: {
      cvdTrend: 'HEAVY_SELLING_DELTA',
      imbalanceRatio: '3.6:1_SELL',
      wallThickness: 2.8,
    },
    session: 'LONDON',
    normalizedVector: [0.71, 0.49, 0.09, 1.45, 0.175, 0.415, 0.35, 0.25, 3.6, 0.56, 1.5, 0.6],
    matchedFailureArchetype: 'Aggressive Overhead Supply Wall Exhaustion',
    failureExplanation: 'Heavy institutional ask wall absorbing passive buyers and driving down with aggressive selling footprint.',
    preventativeAction: 'BLOCK_EXECUTION',
  },
];

export class InvalidCriteriaMemoryModule {
  private static instance: InvalidCriteriaMemoryModule;
  private storedPatterns: Map<string, InvalidCriterionPattern> = new Map();
  private isLoadedFromStorage: boolean = false;

  private constructor() {
    this.loadPatterns();
  }

  public static getInstance(): InvalidCriteriaMemoryModule {
    if (!InvalidCriteriaMemoryModule.instance) {
      InvalidCriteriaMemoryModule.instance = new InvalidCriteriaMemoryModule();
    }
    return InvalidCriteriaMemoryModule.instance;
  }

  /**
   * Loads patterns from browser persistent storage with fallback to seeds.
   */
  private loadPatterns(): void {
    if (this.isLoadedFromStorage) return;

    // Seed defaults first
    SEED_FAILURE_PATTERNS.forEach(p => {
      this.storedPatterns.set(p.id, p);
    });

    if (isBrowser) {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: InvalidCriterionPattern[] = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            parsed.forEach(p => {
              if (p && p.id) {
                this.storedPatterns.set(p.id, p);
              }
            });
          }
        }
      } catch (e) {
        console.warn('InvalidCriteriaMemoryModule: failed to read localStorage', e);
      }
    }

    this.isLoadedFromStorage = true;
  }

  /**
   * Persists the current pattern registry to browser localStorage.
   */
  private persistPatterns(): void {
    if (!isBrowser) return;
    try {
      const list = Array.from(this.storedPatterns.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('InvalidCriteriaMemoryModule: failed to write localStorage', e);
    }
  }

  /**
   * Generates a 12-dimensional normalized feature vector from market state.
   */
  private createFeatureVector(params: {
    rsi: number;
    macdHistogram: number;
    emaSpreadPercent: number;
    bbBandwidth: number;
    atrPips: number;
    realYieldSpread: number;
    newsSentimentScore: number;
    cvdCode: number; // 0.1 to 0.9
    imbalanceRatio: number;
    wallThickness: number;
    smcCode: number;
    sessionCode: number;
  }): number[] {
    return [
      Number((params.rsi / 100).toFixed(4)),
      Number(((params.macdHistogram + 0.01) / 0.02).toFixed(4)),
      Number((params.emaSpreadPercent).toFixed(4)),
      Number((params.bbBandwidth / 3.0).toFixed(4)),
      Number((params.atrPips / 50.0).toFixed(4)),
      Number(((params.realYieldSpread + 5.0) / 10.0).toFixed(4)),
      Number(((params.newsSentimentScore + 100.0) / 200.0).toFixed(4)),
      Number(params.cvdCode.toFixed(4)),
      Number((params.imbalanceRatio / 5.0).toFixed(4)),
      Number((params.wallThickness / 5.0).toFixed(4)),
      Number((params.smcCode / 5.0).toFixed(4)),
      Number((params.sessionCode).toFixed(4)),
    ];
  }

  /**
   * Automated Learning Loop:
   * Captures the precise variable states of a losing trade as an 'Invalid Criterion' pattern.
   * Feeds the persistent memory module to eliminate repeating past setups.
   */
  public captureLossPattern(params: {
    position: Position;
    exitPrice: number;
    lossPnlUsd: number;
    exitReason?: string;
    consensus?: SwarmConsensusResult | null;
  }): InvalidCriterionPattern {
    const { position, exitPrice, lossPnlUsd, exitReason = 'STOP_LOSS_TERMINATION', consensus } = params;
    const now = Date.now();
    const symbol = position.symbol;
    const pipVal = PIP_VALUES[symbol] || (symbol.includes('JPY') ? 0.01 : symbol === 'XAU/USD' ? 0.10 : 0.0001);
    const lossPips = Number((Math.abs(position.entryPrice - exitPrice) / pipVal).toFixed(1));

    const technical = consensus?.agents.technical;
    const fundamental = consensus?.agents.fundamental;
    const orderFlow = consensus?.agents.orderFlow;
    const news = consensus?.agents.news;

    const rsi = technical?.indicators?.rsi || 50;
    const macdHist = technical?.indicators?.macd?.histogram || 0;
    const emaSpread = technical?.indicators ? ((technical.indicators.ema20 - technical.indicators.ema50) / position.entryPrice) : 0;
    const bbWidth = technical?.indicators?.bollingerBands?.bandwidth || 1.0;
    const atr = technical?.indicators?.atr || 15.0;
    const pattern = technical?.candlestickPattern || 'Structural Rejection';
    const smc = technical?.smartMoneyConcepts?.structure || 'CHoCH_DISPLACEMENT';
    const obStatus = technical?.smartMoneyConcepts?.orderBlock || 'MITIGATED_ZONE';
    const fvg = technical?.smartMoneyConcepts?.fvgStatus || 'OPEN_GAP';
    const sweep = technical?.smartMoneyConcepts?.liquiditySweep || 'SWEEP_COMPLETED';

    const macroRegime = fundamental?.macroRegime || 'Monetary Shift';
    const realYield = fundamental?.realInterestRateSpread || 0;
    const stance = fundamental?.baseCurrencyOutlook?.centralBankStance || 'NEUTRAL';
    const newsScore = news?.sentimentScore || 0;
    const sentimentBias = news?.bias || 'NEUTRAL';

    const cvdTrend = orderFlow?.cvdMetrics?.trend || 'BEARISH_DIVERGENCE';
    const imbalance = orderFlow?.diagonalImbalances?.stackedImbalanceSide || '3:1_IMBALANCE';
    const wallThickness = (orderFlow as any)?.orderBookDepth?.wallThicknessMultiplier || 1.8;

    const session = 'ACTIVE_TRADING_SESSION';

    const cvdCode = cvdTrend.includes('BEARISH') ? 0.2 : cvdTrend.includes('BULLISH') ? 0.8 : 0.5;
    const smcCode = smc.includes('BEARISH') ? 1.0 : smc.includes('BULLISH') ? 2.0 : 3.0;
    const sessionCode = 0.75;

    const normalizedVector = this.createFeatureVector({
      rsi,
      macdHistogram: macdHist,
      emaSpreadPercent: emaSpread,
      bbBandwidth: bbWidth,
      atrPips: atr,
      realYieldSpread: realYield,
      newsSentimentScore: newsScore,
      cvdCode,
      imbalanceRatio: 3.5,
      wallThickness,
      smcCode,
      sessionCode,
    });

    const archetype = `${position.type} Loss via ${exitReason.replace(/_/g, ' ')}`;
    const explanation = `Captured loss of $${Math.abs(lossPnlUsd).toFixed(2)} (${lossPips} pips) on ${position.type} ${symbol}. Stored invalid criteria variables: RSI ${rsi.toFixed(1)}, Yield Spread ${realYield}%, SMC: ${smc}.`;

    const id = `INV-CRIT-${now}-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`;

    const failurePattern: InvalidCriterionPattern = {
      id,
      tradeId: position.id,
      symbol,
      direction: position.type,
      timeframe: '1h',
      lossAmountUsd: lossPnlUsd,
      lossPips,
      exitReason,
      timestampEpochMs: now,
      timestampIso: new Date(now).toISOString(),
      technicalState: {
        rsi,
        macdHistogram: macdHist,
        emaSpreadPercent: emaSpread,
        bbBandwidth: bbWidth,
        atrPips: atr,
        candlestickPattern: pattern,
        smcStructure: smc,
        orderBlockMitigation: obStatus,
        fvgStatus: fvg,
        liquiditySweep: sweep,
      },
      fundamentalState: {
        macroRegime,
        realYieldSpread: realYield,
        centralBankStance: stance,
        newsSentimentScore: newsScore,
        sentimentBias,
      },
      orderFlowState: {
        cvdTrend,
        imbalanceRatio: imbalance,
        wallThickness,
      },
      session,
      normalizedVector,
      matchedFailureArchetype: archetype,
      failureExplanation: explanation,
      preventativeAction: 'BLOCK_EXECUTION',
    };

    this.storedPatterns.set(id, failurePattern);
    this.persistPatterns();
    return failurePattern;
  }

  /**
   * Mandatory Pre-Trade Validation Gate:
   * Cross-references candidate signal against ALL stored failure patterns.
   * If similarity >= 80%, BLOCKS execution to systematically prevent repeating past losses.
   */
  public validateCandidateSignal(params: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL';
    timeframe: TimeFrame;
    currentPrice: number;
    technical?: TechnicalAnalysis;
    fundamental?: FundamentalAnalysis;
    orderFlow?: OrderFlowAnalysis;
    news?: NewsAnalysis;
    similarityThresholdPercent?: number;
  }): PreTradeValidationGateResult {
    const {
      symbol,
      direction,
      technical,
      fundamental,
      orderFlow,
      news,
      similarityThresholdPercent = 80.0,
    } = params;

    this.loadPatterns();
    const storedList = Array.from(this.storedPatterns.values());

    if (storedList.length === 0) {
      return {
        allowed: true,
        action: 'PROCEED',
        highestSimilarityPercent: 0,
        similarityThresholdPercent,
        crossReferencedCount: 0,
        evaluatedAtEpochMs: Date.now(),
        isLearningLoopActive: true,
      };
    }

    // Construct candidate feature vector
    const rsi = technical?.indicators?.rsi || 50;
    const macdHist = technical?.indicators?.macd?.histogram || 0;
    const emaSpread = technical?.indicators ? ((technical.indicators.ema20 - technical.indicators.ema50) / params.currentPrice) : 0;
    const bbWidth = technical?.indicators?.bollingerBands?.bandwidth || 1.0;
    const atr = technical?.indicators?.atr || 15.0;
    const realYield = fundamental?.realInterestRateSpread || 0;
    const newsScore = news?.sentimentScore || 0;
    const cvdTrend = orderFlow?.cvdMetrics?.trend || 'NEUTRAL';
    const cvdCode = cvdTrend.includes('BEARISH') ? 0.2 : cvdTrend.includes('BULLISH') ? 0.8 : 0.5;
    const smc = technical?.smartMoneyConcepts?.structure || 'CHoCH_DISPLACEMENT';
    const smcCode = smc.includes('BEARISH') ? 1.0 : smc.includes('BULLISH') ? 2.0 : 3.0;

    const candidateVector = this.createFeatureVector({
      rsi,
      macdHistogram: macdHist,
      emaSpreadPercent: emaSpread,
      bbBandwidth: bbWidth,
      atrPips: atr,
      realYieldSpread: realYield,
      newsSentimentScore: newsScore,
      cvdCode,
      imbalanceRatio: 3.0,
      wallThickness: 2.0,
      smcCode,
      sessionCode: 0.75,
    });

    let highestSimilarity = 0;
    let worstMatchPattern: InvalidCriterionPattern | undefined;

    for (const pattern of storedList) {
      // Must match direction or be an identical symbol structural trap
      const directionMatches = pattern.direction === direction;
      const symbolMatches = pattern.symbol === symbol;

      // Calculate Euclidean distance across normalized vector
      let distanceSum = 0;
      const targetVec = pattern.normalizedVector;
      const len = Math.min(candidateVector.length, targetVec.length);

      for (let i = 0; i < len; i++) {
        const diff = candidateVector[i] - targetVec[i];
        distanceSum += diff * diff;
      }

      const euclideanDist = Math.sqrt(distanceSum);
      const maxPossibleDist = Math.sqrt(len); // Normalization bound
      let similarityScore = Math.max(0, (1 - euclideanDist / maxPossibleDist)) * 100;

      // Direction & asset affinity calibration
      if (directionMatches) similarityScore += 5;
      else similarityScore -= 20;

      if (symbolMatches) similarityScore += 5;

      const finalSimilarity = Number(Math.max(0, Math.min(99.0, similarityScore)).toFixed(1));

      if (finalSimilarity > highestSimilarity) {
        highestSimilarity = finalSimilarity;
        worstMatchPattern = pattern;
      }
    }

    const isBlocked = highestSimilarity >= similarityThresholdPercent;

    if (isBlocked && worstMatchPattern) {
      const blockReason = `🛑 PRE-TRADE GATE VETO: Candidate ${direction} on ${symbol} matches historical loss pattern [${worstMatchPattern.id}] with ${highestSimilarity}% similarity (${worstMatchPattern.matchedFailureArchetype}). Execution blocked to systematically prevent repeating past failure setup.`;
      return {
        allowed: false,
        action: 'BLOCK_EXECUTION',
        matchedPattern: worstMatchPattern,
        highestSimilarityPercent: highestSimilarity,
        similarityThresholdPercent,
        blockReason,
        crossReferencedCount: storedList.length,
        evaluatedAtEpochMs: Date.now(),
        isLearningLoopActive: true,
      };
    }

    return {
      allowed: true,
      action: 'PROCEED',
      matchedPattern: worstMatchPattern,
      highestSimilarityPercent: highestSimilarity,
      similarityThresholdPercent,
      crossReferencedCount: storedList.length,
      evaluatedAtEpochMs: Date.now(),
      isLearningLoopActive: true,
    };
  }

  /**
   * Returns all stored failure patterns.
   */
  public getStoredPatterns(): InvalidCriterionPattern[] {
    this.loadPatterns();
    return Array.from(this.storedPatterns.values());
  }

  /**
   * Returns memory module telemetry stats.
   */
  public getMemoryStats(): {
    totalStoredPatterns: number;
    activeLearningLoop: boolean;
    seedPatternsCount: number;
    liveLearnedPatternsCount: number;
    preTradeGateStatus: 'ARMED_AND_ENFORCING' | 'BYPASS_DISABLED';
  } {
    this.loadPatterns();
    const all = Array.from(this.storedPatterns.values());
    const seeds = all.filter(p => p.id.includes('SEED')).length;
    return {
      totalStoredPatterns: all.length,
      activeLearningLoop: true,
      seedPatternsCount: seeds,
      liveLearnedPatternsCount: all.length - seeds,
      preTradeGateStatus: 'ARMED_AND_ENFORCING',
    };
  }
}

export const invalidCriteriaMemoryModule = InvalidCriteriaMemoryModule.getInstance();
