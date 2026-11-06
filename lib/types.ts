export type MarketSegment = 'FOREX' | 'INDIAN_MARKET';

export type ForexPair = 
  | 'EUR/USD' 
  | 'GBP/USD' 
  | 'USD/JPY' 
  | 'AUD/USD' 
  | 'USD/CAD' 
  | 'USD/CHF' 
  | 'NZD/USD' 
  | 'EUR/GBP';

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

export type TradableSymbol = ForexPair | IndianMarketAsset;

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
