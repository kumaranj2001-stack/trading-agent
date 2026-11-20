import {
  CurrencyPair,
  TimeFrame,
  Candle,
  TechnicalAnalysis,
  FundamentalAnalysis,
  OrderFlowAnalysis,
  MultiTierScreeningConfig,
  MultiTierScreeningResult,
  QuantitativeStrategyModel,
} from './types';
import { quantitativeStrategyLibrary } from './quantitativeStrategyLibrary';

// ============================================================================
// 📊 MULTI-TIERED SCREENING & DYNAMIC QUANT RANKING ENGINE
// Filters 2,500+ models against strict Sharpe Ratio & Drawdown hurdles
// ============================================================================

export const DEFAULT_SCREENING_CONFIG: MultiTierScreeningConfig = {
  minWinRate: 65.0,        // Minimum 65% win probability
  minProfitFactor: 1.75,   // Minimum 1.75:1 profit factor
  minSharpeRatio: 2.20,    // Institutional hurdle: Sharpe >= 2.20
  minSortinoRatio: 2.50,   // Downside penalty: Sortino >= 2.50
  maxDrawdownPercent: 5.0, // Strict Max Drawdown limit: <= 5.0%
  minTradesCount: 25,      // Minimum statistical significance
};

export class MultiTierScreeningEngine {
  private static instance: MultiTierScreeningEngine;
  private lastScreeningResult: MultiTierScreeningResult | null = null;
  private lastScreenedEpochMs: number = 0;

  private constructor() {}

  public static getInstance(): MultiTierScreeningEngine {
    if (!MultiTierScreeningEngine.instance) {
      MultiTierScreeningEngine.instance = new MultiTierScreeningEngine();
    }
    return MultiTierScreeningEngine.instance;
  }

  /**
   * Executes the complete Multi-Tiered Screening & Dynamic Ranking Pipeline:
   * - Tier 1: Statistical Viability (Win Rate >= 65%, Profit Factor >= 1.75)
   * - Tier 2: Risk-Adjusted Quality (Sharpe Ratio >= 2.20, Sortino Ratio >= 2.50)
   * - Tier 3: Capital Preservation & Drawdown Bounds (Max Drawdown <= 5.0%)
   * - Tier 4: Dynamic Live Market Fit (Ranks top survivors for current symbol & volatility regime)
   */
  public screenAndRankStrategies(params: {
    symbol: CurrencyPair;
    timeframe: TimeFrame;
    currentPrice: number;
    candles?: Candle[];
    technical?: TechnicalAnalysis;
    fundamental?: FundamentalAnalysis;
    orderFlow?: OrderFlowAnalysis;
    config?: Partial<MultiTierScreeningConfig>;
  }): MultiTierScreeningResult {
    const config: MultiTierScreeningConfig = {
      ...DEFAULT_SCREENING_CONFIG,
      ...params.config,
    };

    const allModels = quantitativeStrategyLibrary.getAllStrategies();
    const totalPoolSize = allModels.length;

    let tier1PassedCount = 0;
    let tier2PassedCount = 0;
    let tier3PassedCount = 0;

    const tier3SurvivingModels: Array<{
      model: QuantitativeStrategyModel;
      alphaScore: number;
      directionalBias: 'BUY' | 'SELL' | 'NEUTRAL';
    }> = [];

    const isGold = params.symbol === 'XAU/USD';
    const isOil = params.symbol === 'WTI_CRUDE' || params.symbol === 'BRENT_CRUDE';
    const isIndian = params.symbol.includes('NIFTY') || params.symbol === 'RELIANCE' || params.symbol === 'TCS';

    // Extract current market dynamics for live regime scoring
    const techBias = params.technical?.bias || 'NEUTRAL';
    const fundBias = params.fundamental?.bias || 'NEUTRAL';
    const rsi = params.technical?.indicators?.rsi || 50;
    const realYield = params.fundamental?.realInterestRateSpread || 0;
    const cvdTrend = params.orderFlow?.cvdMetrics?.trend || 'NEUTRAL';

    for (const model of allModels) {
      // -------------------------------------------------------------
      // Tier 1: Statistical Viability Hurdle
      // -------------------------------------------------------------
      const passesTier1 =
        model.expectedWinRate >= config.minWinRate &&
        model.profitFactor >= config.minProfitFactor &&
        model.historicalTradesCount >= config.minTradesCount;

      if (!passesTier1) continue;
      tier1PassedCount++;

      // -------------------------------------------------------------
      // Tier 2: Risk-Adjusted Quality Hurdle (Sharpe & Sortino)
      // -------------------------------------------------------------
      const passesTier2 =
        model.sharpeRatio >= config.minSharpeRatio &&
        model.sortinoRatio >= config.minSortinoRatio;

      if (!passesTier2) continue;
      tier2PassedCount++;

      // -------------------------------------------------------------
      // Tier 3: Capital Preservation & Max Drawdown Hurdle
      // -------------------------------------------------------------
      const passesTier3 = model.maxDrawdownPercent <= config.maxDrawdownPercent;

      if (!passesTier3) continue;
      tier3PassedCount++;

      // -------------------------------------------------------------
      // Tier 4: Dynamic Live Market Regime Fit & Composite Alpha Scoring
      // -------------------------------------------------------------
      let marketFitMultiplier = 1.0;
      let modelBias: 'BUY' | 'SELL' | 'NEUTRAL' = 'NEUTRAL';

      // Category-specific live market context calibration
      if (model.category === 'TECHNICAL_SMC' || model.category === 'ORDER_BOOK_MICROSTRUCTURE') {
        if (techBias.includes('BUY')) {
          modelBias = 'BUY';
          marketFitMultiplier = rsi < 65 ? 1.15 : 0.95;
        } else if (techBias.includes('SELL')) {
          modelBias = 'SELL';
          marketFitMultiplier = rsi > 35 ? 1.15 : 0.95;
        }
      } else if (model.category === 'MACRO_YIELD_POLICY' || model.category === 'CROSS_ASSET_FLOW') {
        if (fundBias.includes('BUY')) {
          modelBias = 'BUY';
          marketFitMultiplier = realYield >= 0 ? 1.18 : 0.92;
        } else if (fundBias.includes('SELL')) {
          modelBias = 'SELL';
          marketFitMultiplier = realYield < 0 ? 1.18 : 0.92;
        }
      } else if (model.category === 'VOLUME_PROFILE_AMT') {
        if (cvdTrend.includes('BULLISH')) {
          modelBias = 'BUY';
          marketFitMultiplier = 1.12;
        } else if (cvdTrend.includes('BEARISH')) {
          modelBias = 'SELL';
          marketFitMultiplier = 1.12;
        }
      } else {
        // Volatility & Harmonics
        modelBias = techBias.includes('BUY') ? 'BUY' : techBias.includes('SELL') ? 'SELL' : 'NEUTRAL';
        marketFitMultiplier = 1.05;
      }

      // Asset affinity boost
      if ((isGold || isOil) && (model.category === 'MACRO_YIELD_POLICY' || model.category === 'TECHNICAL_SMC')) {
        marketFitMultiplier *= 1.08;
      } else if (isIndian && model.category === 'CROSS_ASSET_FLOW') {
        marketFitMultiplier *= 1.10;
      }

      // Formula: Composite Alpha Score = (WinRate * 0.35) + (Sharpe * 25 * 0.30) + ((10 - MaxDD * 1.5) * 10 * 0.20) * Fit
      const winComponent = model.expectedWinRate * 0.35;
      const sharpeComponent = model.sharpeRatio * 25 * 0.30;
      const ddComponent = Math.max(0, 10 - model.maxDrawdownPercent * 1.5) * 10 * 0.20;
      const rawAlpha = (winComponent + sharpeComponent + ddComponent) * marketFitMultiplier;
      const alphaScore = Number(rawAlpha.toFixed(1));

      tier3SurvivingModels.push({
        model: {
          ...model,
          compositeAlphaScore: alphaScore,
          directionalBias: modelBias,
          screeningStatus: 'ACTIVE_RANKED',
        },
        alphaScore,
        directionalBias: modelBias,
      });
    }

    // Sort descending by Composite Alpha Score
    tier3SurvivingModels.sort((a, b) => b.alphaScore - a.alphaScore);

    // Extract Top 25 Highest-Ranked Institutional Alpha Strategies
    const topRankedAlphaStrategies: QuantitativeStrategyModel[] = tier3SurvivingModels
      .slice(0, 25)
      .map(item => item.model);

    // Compute aggregate pool statistics
    const stats = quantitativeStrategyLibrary.getLibraryStats();
    const activeGrade: MultiTierScreeningResult['activeLeaderboardGrade'] =
      topRankedAlphaStrategies.length >= 10 && topRankedAlphaStrategies[0]?.expectedWinRate >= 82.0
        ? 'GRADE_A_PLUS_ALPHA'
        : topRankedAlphaStrategies.length >= 5
        ? 'GRADE_A_INSTITUTIONAL'
        : 'FILTERED';

    const result: MultiTierScreeningResult = {
      totalPoolSize,
      tier1ViabilityPassed: tier1PassedCount,
      tier2SharpePassed: tier2PassedCount,
      tier3MaxDrawdownPassed: tier3PassedCount,
      topRankedAlphaStrategies,
      averagePoolSharpe: stats.averageSharpeRatio,
      averagePoolDrawdown: stats.averageMaxDrawdown,
      poolWinRate: stats.averageWinRate,
      screenedTimestamp: Date.now(),
      activeLeaderboardGrade: activeGrade,
    };

    this.lastScreeningResult = result;
    this.lastScreenedEpochMs = Date.now();
    return result;
  }

  /**
   * Retrieves the most recent screening result.
   */
  public getLastScreeningResult(): MultiTierScreeningResult | null {
    return this.lastScreeningResult;
  }
}

export const multiTierScreeningEngine = MultiTierScreeningEngine.getInstance();
