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

export type NavigationTab = 
  | 'terminal'             // 01. Terminal (Live SSOT Chart, Orders & 5-Agent Swarm Signal)
  | 'knowledge'            // 02. Knowledge (1,050+ Strategies & Institutional Heuristics)
  | 'vision-atlas'         // 03. Vision Atlas Lab (Advanced Market Analysis & Interactive Simulation Module)
  | 'vision-atlas-lab'     // 03. Vision Atlas Lab alias
  | 'agent'                // 04. Agent (5-Role Multi-Agent Swarm Intelligence Command Desk)
  | 'debate'               // 05. Five-Agent Debate (Interactive Multi-Role Consensus Stream)
  | 'five-agent-debate'    // 05. Debate alias
  | 'roles'                // 06. Roles (5-Role Architecture & System Governance)
  | 'architecture'         // 06. Roles alias
  | 'journals'             // 07. Journals (Persistent Trade Journal & Historical Loss Review)
  | 'wire'                 // 08. Wire (38 Monitored Financial Outlets & Institutional Wires)
  | 'calendar'             // 09. Macro Calendar (Institutional Macroeconomic Release Pulse)
  | 'macro-intelligence'   // 10. Event-Driven Macro Intelligence & Execution Engine
  | 'macro-engine'         // 10. Alias
  | 'scanner'              // 11. Scanner (Multi-Asset Screener & Confluence Hunter)
  | 'var'                  // 12. VAR (1,000-Path Monte Carlo Value-at-Risk Simulation Desk)
  | 'backtest'             // Backtest (Monte Carlo Walk-Forward Backtester)
  | 'firebase';            // 14. Firebase (Firestore Cloud Realtime State Sync)

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d';

export type MarketSessionStatus = 
  | 'OPEN'
  | 'CLOSED_WEEKEND'
  | 'CLOSED_AFTER_HOURS'
  | 'CLOSED_DAILY_MAINTENANCE'
  | 'MANUAL_FREEZE';

export interface MarketSessionInfo {
  pair: CurrencyPair;
  segment: MarketSegment;
  isOpen: boolean;
  isFrozen: boolean;
  status: MarketSessionStatus;
  statusLabel: string;
  sessionName: string;
  nextOpenDate?: string;
  nextOpenFormatted: string;
  secondsUntilOpen: number;
  reason: string;
  lastClosePrice: number;
}

export type MarketCloseEventType = 'MARKET_CLOSED' | 'MARKET_OPENED' | 'GLOBAL_FREEZE' | 'RESUME_TRADING';

export interface MarketCloseEvent {
  type: MarketCloseEventType;
  pair: CurrencyPair;
  segment: MarketSegment;
  isFrozen: boolean;
  frozenPrice: number;
  sessionInfo: MarketSessionInfo;
  timestamp: number;
}

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
  | 'risk_manager'
  | 'terminal_node';

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
  framework?: 'SMC' | 'ICT' | 'CLASSICAL_QUANT' | 'MACRO_REGIME' | 'CENTRAL_BANK' | 'COT_FLOW';
  timeframeScope?: 'MICRO' | 'INTRADAY' | 'SWING' | 'MACRO';
  spatialZoneTarget?: 'DEMAND_OB' | 'SUPPLY_OB' | 'FVG' | 'OTE_POCKET' | 'BSL' | 'SSL' | 'EQUILIBRIUM';
  quantParameters?: Record<string, any>;
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
    session: 'TOKYO' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP' | 'NSE_INDIA' | 'OFF_HOURS' | 'WEEKEND_FREEZE';
    liquidityRating: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'THIN';
    volatilityExpected: 'HIGH' | 'NORMAL' | 'SUBDUED';
    isMarketClosed?: boolean;
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
  category: 'CENTRAL_BANK' | 'GEOPOLITICAL' | 'MACRO_DATA' | 'COMMODITIES_METALS' | 'FOREX' | 'INDIAN_MARKET' | 'REGULATORY_INSTITUTIONAL' | 'GLOBAL_WIRE' | 'BREAKING';
  isStreamingFlash?: boolean;
}

export interface NewsAnalysis {
  role: 'news_analyst';
  agentName: string;
  bias: SignalDirection;
  confidenceScore: number;
  sentimentScore: number; // -1.0 to +1.0
  sourcesMonitoredCount: number; // e.g. 38 financial websites & wires
  breakingAlert?: string;
  recentHeadlines: NewsArticle[];
  topCatalysts: string[];
  marketMood: 'EXTREME_GREED' | 'RISK_ON' | 'NEUTRAL' | 'RISK_OFF' | 'EXTREME_FEAR';
  thesis: string;
  timestamp: string;
}

// ==========================================
// 🧠 PERSISTENT DAILY NEWS MEMORIES & NARRATIVES
// ==========================================
export interface NewsMemoryEntry {
  id: string;
  title: string;
  source: string;
  sourceDomain: string;
  url: string;
  publishedTime: string;
  timestamp: number;
  timeFormatted: string; // e.g. "17:54:12"
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  sentimentScore: number;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  relatedSymbols: string[];
  summary: string;
  category: 'CENTRAL_BANK' | 'GEOPOLITICAL' | 'MACRO_DATA' | 'COMMODITIES_METALS' | 'FOREX' | 'INDIAN_MARKET' | 'REGULATORY_INSTITUTIONAL' | 'GLOBAL_WIRE' | 'BREAKING';
  narrativeThreadId: string;
  narrativeThreadTitle: string;
  isFlashWire?: boolean;
}

export interface ChronologicalStoryEvent {
  id: string;
  timeStr: string;
  timestamp: number;
  headline: string;
  source: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  sentimentScore: number;
  linkageNote: string;
}

export interface NarrativeStoryThread {
  id: string;
  title: string;
  category: string;
  primarySymbols: string[];
  status: 'ACTIVE' | 'DEVELOPING' | 'RESOLVED';
  startTime: string;
  lastUpdatedTime: string;
  events: ChronologicalStoryEvent[];
  synthesizedEvolution: string; // Chronological evolution of the narrative
  macroReflection: string;       // Structural market reflection
  executionInsight: string;      // Actionable trade execution directive
  sentimentBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}

export interface DailyNewsMemorySummary {
  date: string;
  totalMemories: number;
  activeThreadsCount: number;
  criticalAlertsCount: number;
  dominantSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  synthesizedKeyTakeaway: string;
  executionDirectives: string[];
}

export interface StoryEventStep {
  step: number;
  timeStr: string;
  source: string;
  headline: string;
  marketReaction: string;
}

export interface ChronologicalStoryThread {
  id: string;
  title: string;
  theme: string;
  articlesCount: number;
  synthesizedMacroBias: string;
  eventChain: StoryEventStep[];
  causeAndEffectSummary: string;
}

export interface AffectedAssetReflection {
  symbol: string;
  direction: 'FAVOR_LONGS' | 'FAVOR_SHORTS' | 'DEFENSIVE_HOLD';
  rationale: string;
}

export interface DailyNewsReflection {
  dateStr: string;
  overallMacroNarrative: string;
  synthesizedExecutionInsights: string[];
  affectedAssets: AffectedAssetReflection[];
  riskWarnings: string[];
}

// ==========================================
// 🎯 UNIFIED 5-ROLE DECISION INTERFACE
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
  citedRuleId?: string;
  citedRuleName?: string;
  strategyCategory?: string;
  winRate?: number;
  side?: 'BUY' | 'SELL' | 'NEUTRAL';
  isTerminalNode?: boolean;
  terminalData?: DebateTerminalNode;
}

export type DebateActionableDirective = 'MAINTAIN_POSITION' | 'MODIFY_POSITION' | 'STRATEGIC_EXIT';

export interface DebateScenarioContext {
  id: string;
  prompt: string;
  category: 'REVERSAL' | 'VOLATILITY_EXPANSION' | 'MACRO_SHOCK' | 'LIQUIDITY_RUN' | 'BLACK_SWAN' | 'CUSTOM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  injectedAt: string;
  isActive: boolean;
  flowControlAction: 'RE_EVALUATE_SWARM' | 'STRESS_TEST' | 'VERIFY_INVALIDATION';
}

export interface DebateDivergenceMetrics {
  baselineBias: SignalDirection;
  debatedBias: SignalDirection;
  baselineConfidence: number;
  debatedConfidence: number;
  confidenceDelta: number;
  baselineRiskReward: number;
  debatedRiskReward: number;
  riskRewardDelta: number;
  baselineStopLoss: number;
  debatedStopLoss: number;
  baselineTakeProfit: number;
  debatedTakeProfit: number;
  stopLossAdjustmentPips: number;
  positionSizeAdjustmentPercent: number;
  divergenceSeverity: 'NONE' | 'LOW' | 'MODERATE' | 'SEVERE' | 'CRITICAL';
  divergenceSummary: string;
  structuralInvalidationTriggered: boolean;
}

export interface DebateTerminalNode {
  nodeId: string;
  timestamp: string;
  activeScenario?: DebateScenarioContext;
  directive: DebateActionableDirective;
  directiveConfidence: number;
  directiveTitle: string;
  actionableSummary: string;
  divergence: DebateDivergenceMetrics;
  updatedThresholds: DebatePriceThresholds;
  executionGuidance: {
    action: 'MAINTAIN' | 'SCALE_DOWN' | 'TIGHTEN_STOPS' | 'CLOSE_NOW' | 'HEDGE';
    suggestedLotSize: number;
    suggestedStopLoss: number;
    suggestedTakeProfit: number;
    maxRiskDollars: number;
    urgency: 'IMMEDIATE' | 'NEXT_BAR' | 'MONITOR';
    rationale: string;
  };
  swarmSignOff: {
    technicalAnalyst: string;
    fundamentalAnalyst: string;
    newsAnalyst: string;
    forexAnalyst: string;
    chiefRiskOfficer: string;
  };
}

export interface DebatePriceThresholds {
  entryPrice: number;
  takeProfit: number;
  stopLoss: number;
  riskRewardRatio: number;
  positionSizeLots: number;
  maxLossUsd: number;
  projectedGainUsd: number;
  invalidationCriteria: string;
  trajectoryHorizonBars: number;
  projectedPriceMove: number;
}

export interface DebateCitedRule {
  ruleId: string;
  ruleName: string;
  category: 'TECHNICAL' | 'FUNDAMENTAL' | 'RISK' | 'NEWS';
  winRate: number;
  side: 'BUY' | 'SELL';
  rationale: string;
}

export interface DebateSynthesisResult {
  pair: CurrencyPair;
  timeframe: TimeFrame;
  definitiveBias: SignalDirection;
  confluenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  confidenceScore: number;
  priceThresholds: DebatePriceThresholds;
  citedRules: DebateCitedRule[];
  summary: string;
  consensusVerdict: string;
  timestamp: string;
  activeScenario?: DebateScenarioContext;
  terminalNode?: DebateTerminalNode;
  divergence?: DebateDivergenceMetrics;
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
    risk: RiskAssessment;
  };
  journalAnalysis?: {
    totalReviewedTrades: number;
    symbolWinRate: number;
    recentLossesCount: number;
    primaryPastLossFactor?: string;
    guardrailActionApplied?: string;
    historicalSafetyScore: number;
  };
  debateTranscript: AgentDebateMessage[];
  debateSynthesis?: DebateSynthesisResult;
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
  autonomousLoopTelemetry?: {
    cycleNumber: number;
    timestamp: string;
    latencyMs: number;
    activeDesksCount: number;
    autonomousCadenceSeconds: number;
    executionReadiness: boolean;
    isAutonomousLooping: boolean;
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
  newsScore?: number;
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

// ==========================================
// 📓 PERSISTENT TRADING JOURNAL INTERFACES
// ==========================================
export type JournalLossCategory =
  | 'SL_HIT_REGULAR_VOLATILITY'
  | 'NEWS_SLIPPAGE'
  | 'PREMATURE_EXIT'
  | 'CHASED_MARKET'
  | 'OVERLEVERAGED'
  | 'COUNTER_TREND'
  | 'SESSION_LIQUIDITY_DROP'
  | 'NONE_DISCIPLINED_WIN';

export interface JournalEntry {
  id: string;
  tradeId?: string;
  symbol: CurrencyPair;
  segment: MarketSegment;
  orderType: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  exitPrice?: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  dollarRisk: number;
  potentialDollarGain: number;
  executionMode: ExecutionMode;
  entryTimestamp: number;
  entryTimeStr: string;
  exitTimestamp?: number;
  exitTimeStr?: string;
  realizedPnl?: number;
  pnlPercent?: number;
  outcome: 'OPEN' | 'WIN' | 'LOSS' | 'SCRATCH';
  confluenceGrade: 'A+' | 'A' | 'B' | 'C' | 'F';
  confidenceScore: number;
  swarmDirection: 'BUY' | 'SELL' | 'HOLD';
  riskManagerVerdict: RiskVerdict;
  keyReasons: string[];
  lossReasonCategory?: JournalLossCategory;
  lessonLearned?: string;
  notes?: string;
  tags?: string[];
}

export interface HistoricalJournalAnalysis {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  netPnl: number;
  avgWin: number;
  avgLoss: number;
  maxConsecutiveLosses: number;
  symbolStats: Record<string, { trades: number; wins: number; losses: number; winRate: number; netPnl: number }>;
  primaryLossCauses: Array<{ category: JournalLossCategory; count: number; percentage: number }>;
  recurringMistakesWarning?: string;
  activeGuardrailAction?: string;
}

// ============================================================================
// 09 // EVENT-DRIVEN MACRO INTELLIGENCE AND EXECUTION ENGINE
// ============================================================================

export type MacroCatalystCategory = 
  | 'CENTRAL_BANK' 
  | 'INFLATION' 
  | 'EMPLOYMENT' 
  | 'GROWTH_GDP' 
  | 'MANUFACTURING_PMI' 
  | 'ENERGY_COMMODITIES' 
  | 'BULLION_RESERVES';

export interface MacroCatalystEvent {
  id: string;
  title: string;
  category: MacroCatalystCategory;
  country: string;
  currency: string;
  date: string;
  timeUtc: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  previous: string;
  previousNumeric: number;
  forecast: string;
  forecastNumeric: number;
  actual?: string;
  actualNumeric?: number;
  unit: string;
  source: string;
  primarySourceUrl?: string;
  fallbackSources: string[];
  correlatedPairs: CurrencyPair[];
  description: string;
  isLiveNow?: boolean;
  secondsUntilRelease?: number;
}

export type MacroSignalType = 'BUY' | 'SELL' | 'UNCONFIRMED';
export type ConvergenceStatus = 'CONVERGED' | 'AWAITING_CONVERGENCE' | 'DISCREPANCY_FLAGGED';

export interface PreFlightGateResult {
  passed: boolean;
  status: 'GATE_PASSED' | 'GATE_ABORTED_NO_CATALYST';
  symbol: CurrencyPair;
  matchedEvent: MacroCatalystEvent | null;
  activeOrImminentCatalysts: MacroCatalystEvent[];
  catalystCount: number;
  abortReason: string | null;
  recommendedActivePairs: CurrencyPair[];
  timestamp: number;
}

export interface MacroIntelligenceReport {
  id: string;
  timestamp: number;
  timestampFormatted: string;
  catalystEvent: MacroCatalystEvent;
  selectedPair: CurrencyPair;
  signal: MacroSignalType;
  confidenceScore: number; // 85% to 97% target validation threshold
  validationStatus: ConvergenceStatus;
  statusDescription: string;
  
  // Strict Pre-Flight Verification Gate
  preFlightVerification: {
    status: 'PASSED' | 'ABORTED_NO_CATALYST';
    gateVerifiedAt: string;
    scheduledEventsFound: number;
    matchedCatalystId: string | null;
    isImminentOrActive: boolean;
    abortAlertMessage?: string;
  };

  // Mandatory Dual-Stage Validation Mechanism
  dualStageValidation: {
    // Stage 1: Curated 38-Source Wire Stream Ingestion & Evaluation
    stage1WireStream: {
      status: 'CONFIRMED' | 'INSUFFICIENT_DETAIL' | 'AMBIGUOUS' | 'NEWS_GAP_DETECTED';
      monitoredOutletsCount: number; // 38
      primaryWireConfidence: number; // e.g. 78% or 91%
      articleCount: number;
      detailDepth: 'INSTITUTIONAL_HIGH' | 'MODERATE' | 'SPARSE';
      ambiguityScore: number; // 0.00 to 1.00
      newsGapsDetected: string[];
      primarySourcesProcessed: string[];
    };
    // Stage 2: Autonomous Web-Search Fallback Agent
    stage2WebSearchFallback: {
      status: 'TRIGGERED_AND_CONVERGED' | 'STANDBY_NOT_REQUIRED';
      triggered: boolean;
      triggerReason: string | null;
      externalSourcesQueried: string[];
      realTimeIndicesCrossReferenced: string[];
      verifiedFactsSynthesized: string[];
      rumorsQuarantined: string[];
      secondaryValidationConfidence: number;
      dataIntegrityScore: number;
    };
  };

  // Connected Sources Manifest
  connectedSourceManifest: {
    totalSourcesSynthesized: number;
    primaryWireOutletsCount: number;
    externalFallbackPortalsCount: number;
    allSourceNames: string[];
    verificationIntegrityLevel: '100%_VERIFIED_FACTS' | 'QUARANTINED';
    unifiedFactSummary: string[];
  };

  // Real-Time Data Convergence & Fail-Safe Verification
  dataConvergence: {
    isConverged: boolean;
    confidenceThresholdMet: boolean;
    timeoutExceeded: boolean;
    latencyMs: number;
    primarySourceData: {
      source: string;
      actual: string | null;
      timestamp: number;
    };
    fallbackScrapedData: {
      source: string;
      actual: string | null;
      timestamp: number;
    };
    discrepancyDeltaPercent: number;
    auditLog: string[];
  };

  // Quantitative Deviation Analysis
  catalystAnalysis: {
    previous: string;
    forecast: string;
    actual: string;
    surpriseDelta: number; // Actual - Forecast
    surprisePercent: number;
    surpriseDirection: 'HAWKISH_BEAT' | 'DOVISH_MISS' | 'IN_LINE';
    historicalVolatilityImpactPips: number;
  };

  // Qualitative Sentiment & Central Bank Tone Analysis
  sentimentAnalysis: {
    wireSentimentScore: number; // -1.0 to +1.0
    monitoredOutletsCount: number;
    centralBankTone: 'HAWKISH' | 'DOVISH' | 'NEUTRAL' | 'AGGRESSIVELY_HAWKISH' | 'DEEPLY_DOVISH';
    policyDivergenceScore: number; // 1 to 10
    relevantHeadlines: Array<{
      title: string;
      source: string;
      sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      timeAgo: string;
      url?: string;
    }>;
  };

  // Institutional Order Flow & Technical Price Action Structure
  orderFlowStructure: {
    flowBias: 'INSTITUTIONAL_ACCUMULATION' | 'INSTITUTIONAL_DISTRIBUTION' | 'NEUTRAL_CHOP';
    orderBookImbalanceRatio: number; // e.g. 1.82 (Bids / Asks)
    keyLiquidityPools: {
      buySideLiquidity: number;
      sellSideLiquidity: number;
    };
    technicalStructureTrend: 'BULLISH_EXPANSION' | 'BEARISH_BREAKDOWN' | 'RANGE_COMPRESSION';
    currentPrice: number;
  };

  // Mathematical Execution Parameters (Strict SL/TP rules applied)
  executionParameters: {
    entryZone: {
      min: number;
      max: number;
      recommendedEntry: number;
    };
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    takeProfit3: number;
    riskRewardRatio: number; // e.g. 2.6
    recommendedLotSize: number;
    maxRiskDollars: number;
    executionValidityMinutes: number;
  };

  // Swarm Synthesis & Strategic Rationale
  strategicSummary: string;
}

// ============================================================================
// 03 // VISION ATLAS LAB: ADVANCED MARKET ANALYSIS & SIMULATION WORKSPACE
// ============================================================================

export type VisionAtlasTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export interface VisionAtlasTimeframeTrend {
  timeframe: VisionAtlasTimeframe;
  trend: 'BULLISH' | 'BEARISH' | 'RANGING';
  emaAlignment: string;
  rsiValue: number;
  structure: 'BOS_EXPANSION' | 'CHOCH_REVERSAL' | 'INTERNAL_CONSOLIDATION';
  confidence: number;
}

export interface SMCZone {
  high: number;
  low: number;
  equilibrium: number;
  currentZone: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
  discountPercent: number; // 0% (extreme low / deep discount) to 100% (extreme high / expensive premium)
}

export interface SMCOrderBlock {
  id: string;
  type: 'DEMAND' | 'SUPPLY';
  proximal: number; // near boundary
  distal: number;   // far boundary
  mitigated: boolean;
  timeframe: string;
  volumeScore: number;
  candleIndex?: number;
  spatialScore?: number;
  conformingRules?: string[];
  rationale?: string;
}

export interface ConfidenceParam {
  id: string;
  name: string;
  score: number; // 0.0 to 1.0 point
  maxScore: number; // 1.0 point
  status: 'CONFIRMED' | 'PARTIAL' | 'UNCONFIRMED';
  details: string;
}

export interface NarrationStep {
  stepNumber: number; // 1 to 7
  title: string;
  subtitle: string;
  spokenText: string;
  visualFocus: 
    | 'MARKET_STRUCTURE' 
    | 'MTF_ALIGNMENT' 
    | 'PREMIUM_DISCOUNT' 
    | 'ORDER_BLOCKS' 
    | 'CONFLUENCE_METRICS' 
    | 'INSTITUTIONAL_ENGINES' 
    | 'ACTIONABLE_EXECUTION';
}

export type SimulationScenarioId = 
  | 'bullish_breakout'
  | 'bearish_breakdown'
  | 'liquidity_sweep_reversal'
  | 'supply_ob_rejection'
  | 'premium_discount_mean_reversion'
  | 'volatility_compression_breakout'
  | 'choppy_consolidation';

export interface ScenarioSimulationSetup {
  id: SimulationScenarioId;
  name: string;
  description: string;
  directionalBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  isActionable: boolean;
  stopLoss?: number;
  takeProfit?: number;
  projectedCandles: Candle[];
}

export interface InstitutionalPattern {
  id: string;
  type: 
    | 'FVG_BULLISH' 
    | 'FVG_BEARISH' 
    | 'BSL_SWEEP' 
    | 'SSL_SWEEP' 
    | 'DEMAND_OB_UNMITIGATED' 
    | 'SUPPLY_OB_UNMITIGATED' 
    | 'DISCOUNT_RELOAD' 
    | 'PREMIUM_REJECTION' 
    | 'CHOCH_REVERSAL';
  name: string;
  category: 'ORDER_BLOCK' | 'LIQUIDITY_SWEEP' | 'IMBALANCE_GAP' | 'MARKET_STRUCTURE';
  timeframe: string;
  levelMin: number;
  levelMax: number;
  confidenceImpact: number;
  institutionalCriteriaMet: string[];
  grade: 'A+' | 'A' | 'B';
  timestamp: number;
  status: 'ACTIVE_PRIME' | 'MITIGATED' | 'FORMING';
}

export interface ParallelEngineTelemetry {
  technicalPipeline: {
    totalIndicators: number;
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    executionTimeMs: number;
    activeCategoryPassing: Record<string, number>;
  };
  fundamentalPipeline: {
    totalModels: number;
    supportiveCount: number;
    restrictiveCount: number;
    neutralCount: number;
    executionTimeMs: number;
    dominantCatalyst: string;
  };
  parallelWorkers: number;
  totalThroughputPerSec: number;
  latencyMs: number;
  liveStreamConnected: boolean;
}

export interface InstitutionalOptimalEntry {
  direction: 'BUY' | 'SELL';
  grade: 'A+' | 'A' | 'FILTERED_OUT';
  optimalPrice: number;
  zoneMin: number;
  zoneMax: number;
  riskReward: number;
  confluenceFactors: string[];
  invalidationLevel: number;
  institutionalScore: number;
}

export interface VisionAtlasPayload {
  symbol: CurrencyPair;
  timeframe: TimeFrame;
  timestamp: number;
  timestampFormatted: string;

  // Real-Time Telemetry Grid
  telemetry: {
    currentPrice: number;
    directionalBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    trendStrengthPercent: number;
    smcStructure: 'BOS_BULLISH' | 'BOS_BEARISH' | 'CHOCH_REVERSAL' | 'RANGE_CONSOLIDATION';
    rsiMomentum: number;
    atrVolatility: number;
    rangePositioning: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
    rangePercent: number;
  };

  // Multi-Timeframe Alignment Matrix (7 Timeframes)
  multiTimeframeMatrix: VisionAtlasTimeframeTrend[];

  // Smart Money Concepts & Structure
  smcAnalysis: {
    fractalSwings: {
      swingHighs: Array<{ price: number; index: number }>;
      swingLows: Array<{ price: number; index: number }>;
    };
    premiumDiscount: SMCZone;
    orderBlocks: SMCOrderBlock[];
    supportResistance: {
      support1: number;
      support2: number;
      resistance1: number;
      resistance2: number;
    };
  };

  // 6-Point Confidence Score Breakdown
  confidenceBreakdown: {
    parameters: ConfidenceParam[];
    totalScore: number; // 0.0 to 6.0 points
    maxScore: number;   // 6.0 points
    percentage: number; // e.g. 93.3%
    grade: 'A+' | 'A' | 'B' | 'C' | 'F';
  };

  // 7-Step Choreographed Narration Queue
  narrationQueue: NarrationStep[];

  // 7 Distinct Interactive Scenario Setups
  scenarioSimulations: ScenarioSimulationSetup[];

  // Four Specialized Processing Engines
  strategyEngines: {
    technical: {
      totalEvaluated: number; // 525 distinct indicator combinations
      activeBullishSetups: number;
      activeBearishSetups: number;
      topValidatedSetups: Array<{ name: string; score: number; timeframe: string }>;
    };
    fundamental: {
      totalEvaluated: number; // 525 fundamental models
      regime: string;
      interestRateDifferential: string;
      monetaryPolicyShift: string;
      topModels: Array<{ name: string; impact: string }>;
    };
    newsAnalyst: {
      monitoredFeeds: number; // 38 institutional feeds
      geopoliticalRiskIndex: number; // 0 to 100
      sentimentScore: number; // -1.0 to 1.0
      breakingAlert?: string;
    };
    riskManager: {
      var95: number;
      var99: number;
      recommendedLotSize: number;
      maxDrawdownRiskDollars: number;
      riskRewardRatio: number;
    };
  };

  // Actionable Execution Blueprint
  executionBlueprint: {
    entryZoneMin: number;
    entryZoneMax: number;
    recommendedEntry: number;
    hardStopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    takeProfit3: number;
    riskRewardRatio: number;
  };

  // Market Report Summary Card
  marketReport: {
    id: string;
    title: string;
    executiveSummary: string;
    fullNarrative: string;
    generatedAt: string;
    citedTechnicalRuleIds?: string[];
    citedFundamentalModelIds?: string[];
    synthesisGrade?: 'A+' | 'A' | 'B';
  };

  // Automated Pattern Recognition & Institutional Filter
  patternRecognition: {
    patterns: InstitutionalPattern[];
    activeGrade: 'A+' | 'A' | 'FILTERED_OUT';
    highProbabilityCriteriaMet: string[];
    isolatedOptimalEntry: InstitutionalOptimalEntry;
  };

  // Multi-Threaded Parallel Engine Telemetry
  parallelTelemetry: ParallelEngineTelemetry;

  // Institutional Multi-Timeframe Quant Synthesis
  multiTimeframeSynthesis?: {
    synthesisGrade: 'A+' | 'A' | 'B';
    confidenceScore: number;
    microTriggerConfirmed: boolean;
    macroBiasAligned: boolean;
    citedTechnicalRuleIds: string[];
    citedFundamentalModelIds: string[];
    executiveNarrative: string;
  };
}
