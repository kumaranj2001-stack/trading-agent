export type MarketSegment = 'FOREX' | 'METALS_COMMODITIES' | 'INDIAN_MARKET';

export type ForexPair = 
  | 'EUR/USD' 
  | 'GBP/USD' 
  | 'USD/JPY' 
  | 'AUD/USD' 
  | 'USD/CAD' 
  | 'USD/CHF' 
  | 'NZD/USD' 
  | 'EUR/GBP';

export type MetalCommodityAsset =
  | 'XAU/USD' // Gold (Spot Gold / USD)
  | 'XAG/USD' // Silver (Spot Silver / USD)
  | 'XPT/USD' // Platinum / USD
  | 'COPPER'  // High Grade Copper
  | 'WTI_CRUDE' // US Light Sweet Crude Oil
  | 'BRENT_CRUDE'; // Brent Crude Oil

export type IndianMarketAsset = 
  | 'NIFTY 50' 
  | 'BANK NIFTY' 
  | 'USD/INR' 
  | 'EUR/INR' 
  | 'GBP/INR' 
  | 'RELIANCE' 
  | 'TCS' 
  | 'HDFC BANK' 
  | 'INFY';

export type TradableSymbol = ForexPair | MetalCommodityAsset | IndianMarketAsset;

export type CurrencyPair = TradableSymbol;

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export type SignalDirection = 
  | 'STRONG_BUY' 
  | 'BUY' 
  | 'NEUTRAL' 
  | 'SELL' 
  | 'STRONG_SELL';

export type RiskVerdict = 'APPROVED' | 'MODIFIED' | 'VETOED';

export type AgentRole = 
  | 'technical_analyst'
  | 'fundamental_analyst'
  | 'forex_analyst'
  | 'news_analyst'
  | 'journal_analyst'
  | 'risk_manager';

export type ExecutionMode = 'MANUAL' | 'SEMI_AUTONOMOUS' | 'FULL_AUTOPILOT';

export interface Candle {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  ema20: number;
  ema50: number;
  ema200: number;
  macd: {
    macdLine: number;
    signalLine: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
  };
  atr: number;
  supportLevels: number[];
  resistanceLevels: number[];
}

export interface MacroIndicator {
  name: string;
  region: string;
  actual: string | number;
  forecast: string | number;
  previous: string | number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  date: string;
  timeRemainingMinutes?: number;
  surpriseDeviation?: number;
}

export interface CurrencyStrength {
  currency: string;
  score: number; // 0 to 10
  trend: 'STRENGTHENING' | 'WEAKENING' | 'STABLE';
}

export interface IndianMarketMetrics {
  fiiNetFlowCr: number; // in INR Crores
  diiNetFlowCr: number;
  indiaVix: number;
  niftyPcr: number; // Put-Call Ratio
  giftNiftyDelta: number;
  rbiRepoRate: number;
  inrUsdRate: number;
  tradingSession: 'PRE_OPEN' | 'REGULAR_NSE' | 'POST_CLOSE' | 'CLOSED';
}

export interface KnowledgeRule {
  id: string;
  category: 'TECHNICAL' | 'FUNDAMENTAL';
  subcategory: string;
  marketScope: 'FOREX' | 'INDIAN_MARKET' | 'GLOBAL';
  ruleName: string;
  conditionDescription: string;
  confidenceWeight: number; // 1 to 10
  expectedWinRate: number; // percentage, e.g. 78.5%
  signalAction: SignalDirection;
  invalidationCriteria: string;
}

export interface KnowledgeMatchResult {
  rule: KnowledgeRule;
  matched: boolean;
  matchScore: number;
  rationale: string;
}

export interface MultiTimeframeAnalysis {
  tf15m: SignalDirection;
  tf1h: SignalDirection;
  tf4h: SignalDirection;
  tf1d: SignalDirection;
  confluenceScore: number;
  alignment: 'PERFECT_BULLISH' | 'BULLISH_BIAS' | 'MIXED_CHOP' | 'BEARISH_BIAS' | 'PERFECT_BEARISH';
}

export interface TechnicalAnalysis {
  role: 'technical_analyst';
  agentName: string;
  bias: SignalDirection;
  confidenceScore: number;
  keySupport: number;
  keyResistance: number;
  trend: 'STRONG_UPTREND' | 'UPTREND' | 'SIDEWAYS' | 'DOWNTREND' | 'STRONG_DOWNTREND';
  candlestickPattern: string;
  indicatorSummary: {
    rsiStatus: string;
    maTrend: string;
    macdStatus: string;
    volatilityState: string;
  };
  smartMoneyConcepts?: {
    structure: string;
    orderBlock: string;
    fvgStatus: string;
    liquiditySweep: string;
  };
  multiTimeframe?: MultiTimeframeAnalysis;
  matchedRulesCount: number;
  topMatchedRules: KnowledgeRule[];
  thesis: string;
  suggestedEntry: number;
  suggestedStopLoss: number;
  suggestedTakeProfit: number;
  timestamp: string;
}

export interface FundamentalAnalysis {
  role: 'fundamental_analyst';
  agentName: string;
  bias: SignalDirection;
  confidenceScore: number;
  macroRegime: string;
  yieldSpread2Y10Y: number;
  realInterestRateSpread: number;
  baseCurrencyOutlook: {
    currency: string;
    centralBankStance: 'HAWKISH' | 'NEUTRAL' | 'DOVISH';
    interestRate: number;
    inflationRate: number;
    sentiment: string;
  };
  quoteCurrencyOutlook: {
    currency: string;
    centralBankStance: 'HAWKISH' | 'NEUTRAL' | 'DOVISH';
    interestRate: number;
    inflationRate: number;
    sentiment: string;
  };
  indianMarketDrivers?: IndianMarketMetrics;
  highImpactEvents: MacroIndicator[];
  matchedRulesCount: number;
  topMatchedRules: KnowledgeRule[];
  thesis: string;
  geopoliticalRiskLevel: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH';
  timestamp: string;
}

export interface ForexAnalysis {
  role: 'forex_analyst';
  agentName: string;
  bias: SignalDirection;
  confidenceScore: number;
  dxyTrend: 'BULLISH' | 'BEARISH' | 'RANGING';
  relativeStrengthComparison: {
    baseStrength: number;
    quoteStrength: number;
    advantage: string;
  };
  carryTradeYieldSpread: number;
  intermarketCorrelation: {
    asset: string;
    correlation: number;
    interpretation: string;
  }[];
  activeTradingSession: {
    session: 'TOKYO' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP' | 'NSE_INDIA' | 'OFF_HOURS';
    liquidityRating: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'THIN';
    volatilityExpected: 'HIGH' | 'NORMAL' | 'SUBDUED';
  };
  thesis: string;
  timestamp: string;
}

// ==========================================
// 📰 NEWS ANALYST INTERFACES (NEW 5th AGENT)
// ==========================================
export interface NewsArticle {
  id: string;
  title: string;
  source: string;
  sourceDomain: string;
  url: string;
  publishedTime: string;
  timestamp: number;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore: number; // -1.0 to 1.0
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  relatedSymbols: string[];
  summary: string;
  category: 'CENTRAL_BANK' | 'GEOPOLITICAL' | 'MACRO_DATA' | 'COMMODITIES_METALS' | 'FOREX' | 'INDIAN_MARKET' | 'BREAKING';
}

export interface NewsAnalysis {
  role: 'news_analyst';
  agentName: string;
  bias: SignalDirection;
  confidenceScore: number;
  sentimentScore: number; // -1.0 to +1.0
  sourcesMonitoredCount: number; // e.g. 18 financial websites
  breakingAlert?: string;
  recentHeadlines: NewsArticle[];
  topCatalysts: string[];
  marketMood: 'EXTREME_GREED' | 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF' | 'EXTREME_FEAR';
  thesis: string;
  timestamp: string;
}

// ==========================================
// 📓 PERSISTENT TRADING JOURNAL INTERFACES
// ==========================================
export interface JournalMetrics {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRatePercent: number;
  profitFactor: number;
  totalRealizedPnlUsd: number;
  totalRMultiple: number;
  avgWinUsd: number;
  avgLossUsd: number;
  lossPreventionSavesCount: number;
}

export interface JournalTradeEntry {
  id: string;
  positionId?: string;
  symbol: CurrencyPair;
  marketSegment: MarketSegment;
  direction: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice?: number;
  lots: number;
  units: number;
  initialStopLoss: number;
  initialTakeProfit: number;
  plannedRiskRewardRatio: number;
  plannedRiskAmountUsd: number;
  stopDistancePips: number;
  entryTime: string;
  entryTimestamp: number;
  exitTime?: string;
  exitTimestamp?: number;
  status: 'OPEN' | 'CLOSED';
  exitReason?: 'STOP_LOSS' | 'TAKE_PROFIT' | 'TRAILING_STOP' | 'MANUAL_CLOSE' | 'VETO_TRIGGERED';
  realizedPnlUsd?: number;
  realizedRMultiple?: number; // e.g. -1.0, +2.4
  confluenceGradeAtEntry: 'A+' | 'A' | 'B' | 'C' | 'F';
  agentConfidenceAtEntry: number;
  setupSnapshot: {
    timeframe: TimeFrame;
    candlestickPattern?: string;
    rsiAtEntry?: number;
    marketRegime?: string;
    newsSentimentScore?: number;
    primaryCatalyst?: string;
  };
  lossCategory?: 'PREMATURE_BREAKOUT' | 'COUNTER_TREND_CHOP' | 'SPREAD_EXPANSION_NEWS' | 'STOP_TOO_TIGHT' | 'TARGET_UNREACHED_REVERSAL' | 'NONE';
  retrospectiveNotes?: string;
  preventativeTakeaway?: string;
}

export interface JournalMemoryAnalysis {
  role: 'journal_analyst';
  agentName: string;
  symbolAnalyzed: CurrencyPair;
  totalHistoricalTrades: number;
  symbolTradesCount: number;
  symbolWinRate: number; // percentage, e.g. 71.4%
  symbolProfitFactor: number;
  avgRMultiple: number;
  similarPastLossesCount: number;
  lossSimilarityScore: number; // 0 to 100%
  lossPreventionVerdict: 'SAFE_TO_EXECUTE' | 'CAUTION_SIMILAR_TO_PAST_LOSS' | 'HIGH_RISK_LOSS_PATTERN_DETECTED' | 'FAVORABLE_WINNING_PATTERN_MATCH';
  activeMemoryRecall: {
    pastTradeId?: string;
    dateOrTimeAgo: string;
    setupSummary: string;
    outcomeDescription: string;
    mistakeIdentified: string;
  };
  strategicAdjustments: {
    stopLossBufferPips: number; // e.g. +5.5 pips added to protect against historical adverse excursion
    sizeModifierPercent: number; // e.g. 100% for full size, 75% or 50% if cautious
    entryFilterRule: string; // e.g. "Wait for H1 candle close to avoid false wick breakout seen in Trade #14"
    reasoning: string;
  };
  thesis: string;
  timestamp: string;
}

// ==========================================
// 🎯 UNIFIED MULTI-ROLE DECISION INTERFACE
// ==========================================
export interface UnifiedDecision {
  direction: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  confluenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  recommendedAction: string;
  summary: string;
  coreReasons: {
    fundamental: string;
    newsSentiment: string;
    technicalSetup: string;
    marketDynamics: string;
    journalMemory: string;
    riskGovernance: string;
  };
  keyDriversList: string[];
}

export interface MonteCarloProjection {
  simulationsCount: number;
  projectedProfitProbability: number;
  var95Usd: number;
  var99Usd: number;
  expectedDrawdownPercent: number;
  sharpeRatio: number;
}

export interface RiskAssessment {
  role: 'risk_manager';
  agentName: string;
  verdict: RiskVerdict;
  action: 'BUY' | 'SELL' | 'NO_TRADE';
  reasoning: string;
  vetoReasons?: string[];
  adjustmentsMade?: string[];
  parameters: {
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    riskRewardRatio: number;
    positionSizeLots: number;
    positionUnits: number;
    maxLossUsd: number;
    projectedGainUsd: number;
    accountRiskPercent: number;
    leverageUsed: number;
  };
  monteCarlo?: MonteCarloProjection;
  accountHealth: {
    startingBalance: number;
    currentBalance: number;
    equity: number;
    freeMargin: number;
    marginUsed: number;
    dailyDrawdownPercent: number;
    maxAllowedDrawdown: number;
  };
  timestamp: string;
}

export interface AgentDebateMessage {
  id: string;
  round: number;
  role: AgentRole;
  agentName: string;
  avatarColor: string;
  content: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' | 'CAUTION';
  timestamp: string;
}

export interface SwarmConsensusResult {
  pair: CurrencyPair;
  marketSegment: MarketSegment;
  timeframe: TimeFrame;
  currentPrice: number;
  timestamp: string;
  consensusDirection: 'BUY' | 'SELL' | 'HOLD';
  overallConfidence: number;
  confluenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  unifiedDecision: UnifiedDecision;
  knowledgeSummary: {
    totalTechnicalRulesLoaded: number;
    totalFundamentalRulesLoaded: number;
    matchedTechnicalRules: number;
    matchedFundamentalRules: number;
    topConfluenceRules: KnowledgeRule[];
  };
  agents: {
    technical: TechnicalAnalysis;
    fundamental: FundamentalAnalysis;
    forex: ForexAnalysis;
    news: NewsAnalysis;
    journal: JournalMemoryAnalysis;
    risk: RiskAssessment;
  };
  debateTranscript: AgentDebateMessage[];
  executionSignal: {
    authorized: boolean;
    orderType: 'BUY_MARKET' | 'SELL_MARKET' | 'NONE';
    symbol: CurrencyPair;
    lots: number;
    entry: number;
    stopLoss: number;
    takeProfit: number;
    riskReward: number;
    riskAmountUsd: number;
    status: 'READY' | 'EXECUTED' | 'VETOED';
  };
}

export interface MarketScannerOpportunity {
  pair: CurrencyPair;
  segment: MarketSegment;
  price: number;
  bias: SignalDirection;
  technicalScore: number;
  fundamentalScore: number;
  forexScore: number;
  riskVerdict: RiskVerdict;
  grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  potentialLots: number;
  riskReward: number;
  status: 'PRIME_SETUP' | 'MODERATE_SETUP' | 'AVOID_NO_EDGE' | 'VETOED';
}

export interface Position {
  id: string;
  symbol: CurrencyPair;
  type: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
  pnl: number;
  pnlPercent: number;
  riskReward: number;
}

export interface TradeHistoryItem {
  id: string;
  symbol: CurrencyPair;
  type: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  stopLoss: number;
  takeProfit: number;
  openTime: string;
  closeTime: string;
  pnl: number;
  outcome: 'WIN' | 'LOSS' | 'SCRATCH';
  riskManagerVerdict: RiskVerdict;
  strategyNotes: string;
}
