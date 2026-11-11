import { 
  CurrencyPair, 
  IndianMarketAsset, 
  KnowledgeMatchResult, 
  KnowledgeRule, 
  MarketSegment, 
  SignalDirection, 
  TechnicalIndicators,
  FailureConstraintRule
} from '../types';
import { TECHNICAL_KNOWLEDGE_BASE } from './technicalKnowledge';
import { FUNDAMENTAL_KNOWLEDGE_BASE } from './fundamentalKnowledge';
import { diagnosticReasoningEngine } from '../diagnosticReasoningEngine';

export class KnowledgeEngine {
  private technicalRules: KnowledgeRule[];
  private fundamentalRules: KnowledgeRule[];

  constructor() {
    this.technicalRules = TECHNICAL_KNOWLEDGE_BASE;
    this.fundamentalRules = FUNDAMENTAL_KNOWLEDGE_BASE;
  }

  public getTotalStats(): { 
    technicalCount: number; 
    fundamentalCount: number; 
    dynamicConstraintCount: number; 
    totalCount: number;
    baselineRules: number;
    synthesizedRules: number;
  } {
    const dynamicRules = diagnosticReasoningEngine.getDynamicRules();
    return {
      technicalCount: this.technicalRules.length,
      fundamentalCount: this.fundamentalRules.length,
      dynamicConstraintCount: dynamicRules.length,
      totalCount: this.technicalRules.length + this.fundamentalRules.length + dynamicRules.length,
      baselineRules: this.technicalRules.length + this.fundamentalRules.length,
      synthesizedRules: dynamicRules.length,
    };
  }

  public getTechnicalRules(): KnowledgeRule[] {
    return this.technicalRules;
  }

  public getFundamentalRules(): KnowledgeRule[] {
    return this.fundamentalRules;
  }

  public getDynamicRules(): FailureConstraintRule[] {
    return diagnosticReasoningEngine.getDynamicRules();
  }

  public getAllRules(): KnowledgeRule[] {
    return [
      ...this.technicalRules,
      ...this.fundamentalRules,
      ...diagnosticReasoningEngine.getDynamicRules(),
    ];
  }

  public getOpposingRules(segment: MarketSegment, dominantSide: 'BUY' | 'SELL'): {
    supportingTech: KnowledgeRule[];
    opposingTech: KnowledgeRule[];
    supportingFund: KnowledgeRule[];
    opposingFund: KnowledgeRule[];
  } {
    const oppSide = dominantSide === 'BUY' ? 'SELL' : 'BUY';
    const filterRules = (rules: KnowledgeRule[], side: 'BUY' | 'SELL') => {
      return rules
        .filter(r => {
          if (segment === 'INDIAN_MARKET' && r.marketScope === 'FOREX') return false;
          if (segment === 'FOREX' && r.marketScope === 'INDIAN_MARKET') return false;
          return r.signalAction.includes(side);
        })
        .sort((a, b) => b.expectedWinRate - a.expectedWinRate);
    };

    return {
      supportingTech: filterRules(this.technicalRules, dominantSide),
      opposingTech: filterRules(this.technicalRules, oppSide),
      supportingFund: filterRules(this.fundamentalRules, dominantSide),
      opposingFund: filterRules(this.fundamentalRules, oppSide),
    };
  }

  // High-accuracy matcher across 500+ Technical Rules
  public matchTechnicalKnowledge(
    pair: CurrencyPair,
    segment: MarketSegment,
    indicators: TechnicalIndicators,
    bias: SignalDirection,
    pattern: string,
    smcStructure?: string
  ): {
    matchedCount: number;
    matchedRules: KnowledgeRule[];
    highConfidenceScore: number;
    topRules: KnowledgeRule[];
  } {
    const matched: KnowledgeRule[] = [];
    const isBull = bias.includes('BUY');
    const isBear = bias.includes('SELL');

    for (const rule of this.technicalRules) {
      // Scope check: If Indian Market, prioritize INDIAN_MARKET & GLOBAL rules
      if (segment === 'INDIAN_MARKET' && rule.marketScope === 'FOREX') continue;
      if (segment === 'FOREX' && rule.marketScope === 'INDIAN_MARKET') continue;

      let doesMatch = false;

      // Match criteria
      if (rule.subcategory.includes('SMC') && smcStructure) {
        if (isBull && (rule.signalAction.includes('BUY') && smcStructure.includes('BULLISH'))) doesMatch = true;
        if (isBear && (rule.signalAction.includes('SELL') && smcStructure.includes('BEARISH'))) doesMatch = true;
      } else if (rule.subcategory.includes('Candlestick')) {
        if (isBull && pattern.includes('Bullish') && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && pattern.includes('Bearish') && rule.signalAction.includes('SELL')) doesMatch = true;
      } else if (rule.subcategory.includes('Moving Averages')) {
        if (isBull && indicators.ema20 > indicators.ema50 && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && indicators.ema20 < indicators.ema50 && rule.signalAction.includes('SELL')) doesMatch = true;
      } else if (rule.subcategory.includes('Momentum')) {
        if (isBull && indicators.rsi >= 50 && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && indicators.rsi <= 50 && rule.signalAction.includes('SELL')) doesMatch = true;
      } else if (rule.subcategory.includes('Volatility')) {
        if (indicators.bollingerBands.bandwidth < 1.0) doesMatch = true;
      } else if (segment === 'INDIAN_MARKET' && rule.subcategory.includes('NSE/BSE')) {
        if (isBull && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && rule.signalAction.includes('SELL')) doesMatch = true;
      } else if (rule.subcategory.includes('MTF Confluence')) {
        if (isBull && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && rule.signalAction.includes('SELL')) doesMatch = true;
      }

      if (doesMatch) {
        matched.push(rule);
      }
    }

    // Sort by confidence weight & win rate
    matched.sort((a, b) => (b.confidenceWeight * b.expectedWinRate) - (a.confidenceWeight * a.expectedWinRate));

    const topRules = matched.slice(0, 5);
    const avgWinRate = topRules.length > 0
      ? topRules.reduce((sum, r) => sum + r.expectedWinRate, 0) / topRules.length
      : 70.0;

    const highConfidenceScore = Math.min(98, Math.round(avgWinRate + Math.min(topRules.length * 2, 10)));

    return {
      matchedCount: matched.length,
      matchedRules: matched,
      highConfidenceScore,
      topRules,
    };
  }

  // High-accuracy matcher across 500+ Fundamental Rules
  public matchFundamentalKnowledge(
    pair: CurrencyPair,
    segment: MarketSegment,
    bias: SignalDirection,
    rateDiff: number,
    fiiFlowCr?: number,
    indiaVix?: number
  ): {
    matchedCount: number;
    matchedRules: KnowledgeRule[];
    highConfidenceScore: number;
    topRules: KnowledgeRule[];
  } {
    const matched: KnowledgeRule[] = [];
    const isBull = bias.includes('BUY');
    const isBear = bias.includes('SELL');

    for (const rule of this.fundamentalRules) {
      if (segment === 'INDIAN_MARKET' && rule.marketScope === 'FOREX') continue;
      if (segment === 'FOREX' && rule.marketScope === 'INDIAN_MARKET') continue;

      let doesMatch = false;

      if (rule.subcategory.includes('Central Banks')) {
        if (isBull && rateDiff >= 0 && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && rateDiff < 0 && rule.signalAction.includes('SELL')) doesMatch = true;
      } else if (rule.subcategory.includes('Yields')) {
        if (isBull && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && rule.signalAction.includes('SELL')) doesMatch = true;
      } else if (segment === 'INDIAN_MARKET') {
        if (rule.subcategory.includes('Institutional Flows') && fiiFlowCr !== undefined) {
          if (fiiFlowCr > 0 && isBull && rule.signalAction.includes('BUY')) doesMatch = true;
          if (fiiFlowCr < 0 && isBear && rule.signalAction.includes('SELL')) doesMatch = true;
        } else if (rule.subcategory.includes('RBI Policy')) {
          if (isBull && rule.signalAction.includes('BUY')) doesMatch = true;
          if (isBear && rule.signalAction.includes('SELL')) doesMatch = true;
        } else if (rule.subcategory.includes('Earnings')) {
          if (isBull && rule.signalAction.includes('BUY')) doesMatch = true;
        }
      } else if (rule.subcategory.includes('Global Macro')) {
        if (isBull && rule.signalAction.includes('BUY')) doesMatch = true;
        if (isBear && rule.signalAction.includes('SELL')) doesMatch = true;
      }

      if (doesMatch) {
        matched.push(rule);
      }
    }

    matched.sort((a, b) => (b.confidenceWeight * b.expectedWinRate) - (a.confidenceWeight * a.expectedWinRate));

    const topRules = matched.slice(0, 5);
    const avgWinRate = topRules.length > 0
      ? topRules.reduce((sum, r) => sum + r.expectedWinRate, 0) / topRules.length
      : 72.0;

    const highConfidenceScore = Math.min(98, Math.round(avgWinRate + Math.min(topRules.length * 2, 10)));

    return {
      matchedCount: matched.length,
      matchedRules: matched,
      highConfidenceScore,
      topRules,
    };
  }
}

export const knowledgeEngine = new KnowledgeEngine();
