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
  | 'knowledge'            // 02. Knowledge (2,500+ Strategies & Institutional Heuristics)
  | 'vision-atlas'         // 03. Vision Atlas Lab (Advanced Market Analysis & Interactive Simulation Module)
  | 'vision-atlas-lab'     // 03. Vision Atlas Lab alias
  | 'agent'                // 04. Agent (5-Role Multi-Agent Swarm Intelligence Command Desk)
  | 'debate'               // 05. Five-Agent Debate (Interactive Multi-Role Consensus Stream)
  | 'five-agent-debate'    // 05. Debate alias
  | 'roles'                // 06. Roles (5-Role Architecture & System Governance)
  | 'architecture'         // 06. Roles alias
  | 'journals'             // 07. Journals (Persistent Trade Journal & Historical Loss Review)
  | 'wire'                 // 08. Wire (38 Monitored Financial Outlets & Institutional Wires)
  | 'order-flow'           // 09. Order Flow & Liquidity Profiler (Footprint Charts & Volume Profile)
  | 'orderflow'            // 09. Alias
  | 'calendar'             // 10. Macro Calendar (Institutional Macroeconomic Release Pulse)
  | 'macro-intelligence'   // 11. Event-Driven Macro Intelligence & Execution Engine
  | 'macro-engine'         // 11. Alias
  | 'scanner'              // 12. Scanner (Multi-Asset Screener & Confluence Hunter)
  | 'var'                  // 13. VAR (1,000-Path Monte Carlo Value-at-Risk Simulation Desk)
  | 'backtest'             // Backtest (Monte Carlo Walk-Forward Backtester)
  | 'firebase'             // 15. Firebase (Firestore Cloud Realtime State Sync)
  | 'sequential-pipeline'  // 16. Seven-Stage Deterministic Sequential Pipeline
  | 'pipeline';            // 16. Pipeline alias

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

export type RiskVerdict = 'APPROVED' | 'MODIFIED' | 'DYNAMIC_TIER_APPROVED' | 'VETOED';

export type ConfluenceGrade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E' | 'F';

export interface TierRiskParameter {
  grade: ConfluenceGrade;
  name: string;
  minConfidence: number;
  defaultLots: number;
  minLots: number;
  maxLots: number;
  accountRiskPercent: number;
  targetRRRatio: number;
  executionPolicy: string;
}

export interface RiskRatioControllerConfig {
  zeroVetoEnforced: boolean;
  dynamicSizingEnabled: boolean;
  minConservativeLots: number;
  maxInstitutionalLots: number;
  tiers: Record<ConfluenceGrade, TierRiskParameter>;
  lastUpdated?: string;
}

export type AgentRole = 
  | 'technical_analyst'
  | 'fundamental_analyst'
  | 'forex_analyst'
  | 'news_analyst'
  | 'order_flow_analyst'
  | 'risk_manager'
  | 'chief_reviewer'
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
  time?: string; // e.g. "14:00 EST / 00:30 IST"
  timestamp?: string | number; // Exact ISO-8601 UTC timestamp or epoch ms
  timeIST?: string;   // 12-hour formatted IST time, e.g. "07:00 PM IST"
  timeUTC?: string;   // 24-hour UTC, e.g. "13:30 UTC"
  timestampEpochMs?: number; // Unix timestamp in milliseconds
  dateTimeIST?: string; // Formatted combined string for responsive display
  id?: string;
  canonicalId?: string;
  source?: 'FOREX_FACTORY' | 'MACRO_FEED' | 'DUAL_MERGED' | string;
  fastestSourceUpdated?: string;
  deviationDelta?: number;
  secondsUntilRelease?: number;
  releaseStatus?: 'UPCOMING' | 'ACTIVE_RELEASE_WINDOW' | 'RELEASED';
  rawActual?: number;
  rawForecast?: number;
  rawPrevious?: number;
  actualNumeric?: number;
  forecastNumeric?: number;
  previousNumeric?: number;
  isLiveNow?: boolean;
  releaseWindowActive?: boolean;
  country?: string;
  credibilityScore?: number;
  reportingPortals?: string[];
  verifiedSourcesCount?: number;
  discrepancyFlag?: boolean;
  consensusStatus?: 'FULL_CONSENSUS' | 'HIGH_CONFIDENCE' | 'SINGLE_SOURCE';
  dstRegime?: string;
  timeEST?: string;
  timeCET?: string;
}

export interface FinancialPortalInfo {
  id: string;
  name: string;
  domain: string;
  category: 'CALENDAR_AGGREGATOR' | 'CENTRAL_BANK' | 'SPEED_WIRE' | 'COMMODITY_CONSORTIUM';
  status: 'ONLINE' | 'STREAMING' | 'AUTHORITATIVE' | 'MIRROR_FALLBACK';
  latencyMs: number;
  healthScore: number;
  eventsParsedCount: number;
  lastIngestionTimestamp: number;
}

export interface MultiPortalAggregationTelemetry {
  totalPortalsOnline: number;
  totalPortalsConfigured: number;
  portals: FinancialPortalInfo[];
  totalUniqueEvents: number;
  crossValidatedEventsCount: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
  todayReleasesCount: number;
  currentTradingDate: string;
  dstStatus: {
    usDstActive: boolean;
    euDstActive: boolean;
    timeZoneLabel: string;
  };
  cacheState: 'LIVE_STREAMING' | 'TTL_VALIDATED' | 'REDUNDANT_MIRROR_FALLBACK';
  lastSyncTimestamp: number;
  averageAggregationLatencyMs: number;
}

// ==========================================
// ORDER FLOW, FOOTPRINT & VOLUME PROFILE INTERFACES
// ==========================================

export interface FootprintPriceLevel {
  price: number;
  bidVolume: number;
  askVolume: number;
  totalVolume: number;
  delta: number;
  isPointOfControl?: boolean;
  bidImbalance?: boolean;
  askImbalance?: boolean;
  imbalanceType?: 'BUY_IMBALANCE' | 'SELL_IMBALANCE' | 'NONE';
  isImbalanceBuy?: boolean;  // Ask vol >= Bid vol * threshold (e.g. 300%)
  isImbalanceSell?: boolean; // Bid vol >= Ask vol * threshold
}

export interface VolumeProfileAnalysis {
  pointOfControl: number;
  valueAreaHigh: number;
  valueAreaLow: number;
  totalVolume: number;
  buyingVolume: number;
  sellingVolume: number;
  buyingPressurePercent: number;
  sellingPressurePercent: number;
  cumulativeVolumeDelta: number;
  highVolumeNodes: number[];
  lowVolumeNodes: number[];
}

export interface TechnicalMomentumMetrics {
  score: number; // 0 to 100
  weight: number; // 0.50 default
  bias: 'BULLISH_MOMENTUM' | 'BEARISH_MOMENTUM' | 'NEUTRAL';
  rsi: number;
  rsiSlope: 'RISING' | 'FALLING' | 'FLAT';
  orderFlowCvdDelta: number;
  vwapDistancePercent: number;
  emaRibbonAlignment: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  momentumDrivers: string[];
}

export interface FundamentalSentimentMetrics {
  score: number; // 0 to 100
  weight: number; // 0.50 default
  bias: 'RISK_ON_EXPANSION' | 'RISK_OFF_CONTRACTION' | 'NEUTRAL';
  wireSentimentScore: number;
  monitoredFeedsCount: number;
  centralBankStance: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
  macroRegime: string;
  catalystAlignment: 'ALIGNED' | 'DIVERGENT';
  sentimentDrivers: string[];
}

export interface DualConfirmationEntryMatrix {
  compositeScore: number;
  technicalWeight: number;
  fundamentalWeight: number;
  entryConfirmationStatus: 'CONFIRMED_BUY' | 'CONFIRMED_SELL' | 'MOMENTUM_FUNDAMENTAL_DIVERGENCE' | 'CONSOLIDATION_NEUTRAL';
  isEntryAuthorized: boolean;
  verdictDescription: string;
  recommendedEntryPrice: number;
  orderFlowAnchorStopLoss: number;
  orderFlowTarget1: number;
  orderFlowTarget2: number;
  riskRewardRatio: number;
}

export interface OrderFlowAnalysisReport {
  id: string;
  symbol: CurrencyPair;
  timestamp: string;
  responseTimeMs: number;
  liveWebSocketTelemetry: {
    status: 'STREAMING' | 'DISCONNECTED';
    protocol: string;
    latencyMs: number;
    bidPrice: number;
    askPrice: number;
    spread: number;
    tickVelocityPerSec: number;
    lastTickDirection: 'UP_TICK' | 'DOWN_TICK';
  };
  footprintLevels: FootprintPriceLevel[];
  volumeProfile: VolumeProfileAnalysis;
  technicalMomentum: TechnicalMomentumMetrics;
  fundamentalSentiment: FundamentalSentimentMetrics;
  dualConfirmation: DualConfirmationEntryMatrix;
}

export interface OrderFlowSessionAnalysis {
  sessionVolume: number;
  cumulativeVolumeDelta: number;
  cumulativeDelta?: number;
  cvdTrend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
  pocPrice: number;
  valueAreaLow: number;
  valueAreaHigh: number;
  currentPrice: number;
  buyVolumeRatioPercent: number;
  sellVolumeRatioPercent: number;
  totalBuyVolume: number;
  totalSellVolume: number;
  footprints: Array<{
    timestamp: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    totalCandleVolume: number;
    delta: number;
    candleDelta: number;
    poc: number;
    pocPrice: number;
    stackedBuyImbalances: number[];
    stackedSellImbalances: number[];
    levels: FootprintPriceLevel[];
  }>;
  volumeProfile: Array<{
    price: number;
    priceLevel: number;
    volume: number;
    totalVolume: number;
    volumePercent: number;
    buyVol: number;
    sellVol: number;
    delta: number;
    isPoc: boolean;
    isValueArea: boolean;
    isVah: boolean;
    isVal: boolean;
  }>;
  institutionalOrderBlocks: Array<{
    price: number;
    priceRange: string;
    type: 'DEMAND' | 'SUPPLY';
    volume: number;
    volumeStacked: number;
    mitigated: boolean;
    isMitigated: boolean;
  }>;
}

export interface FootprintBar {
  id: string;
  timestamp: number;
  timeFormatted: string;
  open: number;
  high: number;
  low: number;
  close: number;
  totalVolume: number;
  barDelta: number;
  cumulativeDelta: number;
  pocPrice: number;
  vahPrice: number;
  valPrice: number;
  priceLevels: FootprintPriceLevel[];
  direction: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
}

export interface VolumeProfileBin {
  price: number;
  buyVolume: number;
  sellVolume: number;
  totalVolume: number;
  percentage: number;
  isPoc: boolean;
  isHvn: boolean;
  isLvn: boolean;
  isValueArea: boolean;
}

export interface OrderFlowTapePrint {
  id: string;
  timestamp: number;
  timeFormatted: string;
  price: number;
  size: number;
  side: 'BUY' | 'SELL';
  isBlock: boolean;
  aggressor: 'BUYER' | 'SELLER';
}

export interface TriFactorExecutionSignal {
  symbol: CurrencyPair;
  timestamp: string;
  technicalMomentum: {
    score: number; // 0 to 100
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    emaTrendAlignment: 'BULLISH_STACK' | 'BEARISH_STACK' | 'CHOP';
    rsi14: number;
    marketStructure: 'BULLISH_EXPANSION' | 'BEARISH_EXPANSION' | 'RANGE';
    weightedContribution: number; // weight: 35%
  };
  fundamentalSentiment: {
    score: number; // 0 to 100
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    wireSentimentScore: number; // -1 to +1 from 38 feeds
    macroeconomicCatalystSurprise: 'HAWKISH_BEAT' | 'DOVISH_MISS' | 'IN_LINE';
    centralBankPolicyStance: string;
    weightedContribution: number; // weight: 35%
  };
  orderFlowConfluence: {
    score: number; // 0 to 100
    bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    footprintDeltaBias: 'STRONG_BUY_IMBALANCE' | 'STRONG_SELL_IMBALANCE' | 'BALANCED';
    volumeProfileLocation: 'ABOVE_POC' | 'BELOW_POC' | 'AT_POC';
    cumulativeDeltaTrend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
    buyingPressurePercent: number;
    sellingPressurePercent: number;
    weightedContribution: number; // weight: 30%
  };
  compositeScore: number; // 0 to 100
  minimumThresholdMet: boolean;
  confirmedSignal: 'BUY' | 'SELL' | 'UNCONFIRMED_FILTERED';
  confirmationReason: string;
  executionParameters: {
    entryPrice: number;
    stopLoss: number;
    takeProfit1: number;
    takeProfit2: number;
    riskRewardRatio: number;
    lotSize: number;
    maxRiskDollars: number;
  };
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

export interface ExhaustiveCategoryBreakdown {
  categoryName: string;
  type: 'TECHNICAL' | 'FUNDAMENTAL';
  totalRules: number;
  concordantRulesCount: number;
  opposingRulesCount: number;
  categoryWinRate: number;
  alignmentStatus: 'ALIGNED' | 'OPPOSED' | 'MIXED';
}

export type InstitutionalStrategyCategory =
  | 'SMART_MONEY_CONCEPTS'
  | 'VOLUME_PROFILE_AUCTION_MARKET_THEORY'
  | 'HARMONIC_FIBONACCI_CONFLUENCE'
  | 'CROSS_ASSET_MACRO_MODELS'
  | 'SECONDARY_CONFIRMATION_FILTER';

export type StrategyTier = 'INSTITUTIONAL_CORE' | 'SECONDARY_CONFIRMATION' | 'DEPRECATED_STANDALONE';
export type StrategyPruneStatus = 'ACTIVE' | 'PRUNED_UNDERPERFORMING' | 'SECONDARY_ONLY';

export interface InstitutionalStrategyDefinition {
  id: string;
  name: string;
  category: InstitutionalStrategyCategory;
  tier: StrategyTier;
  isPrimaryCatalyst: boolean;
  weight: number;
  expectedWinRate: number;
  historicalWinRate: number;
  historicalTradesCount: number;
  pruneStatus: StrategyPruneStatus;
  invalidationCriteria: string;
  pruneReason?: string;
  description: string;
}

export interface StrictInstitutionalGradingResult {
  grade: ConfluenceGrade; // 'A+' | 'A' | 'B' | 'C' | 'FILTERED_OUT'
  isGradeAPlus: boolean;
  isGradeA: boolean;
  isRetailFiltered: boolean;
  metaConsensusProbability: number; // e.g. >= 80% for A+, 70-79% for A
  dialecticalFriction: number;      // < 10% for A+, < 15% for A
  deskAgreementRatio: number;      // e.g. 5/5 or 4/5
  agreeDeskCount: number;
  liquidityWallVerified: boolean;  // Order book depth wall backing
  htfStructuralAlignment: boolean; // Higher-timeframe clean alignment
  hasConflictingNewsCatalyst: boolean; // No high-impact news shock/lockout
  structuralFloorCeilingHeld: boolean; // S1 floor or R1 ceiling hold
  riskRewardRatio: number;          // Min 1:3 for Grade A
  primaryInstitutionalCatalysts: string[];
  secondaryConfirmationFilters: string[];
  deprecatedTriggersPenalized: string[];
  gradingRationale: string;
}

export interface InstitutionalOrderFlowMetrics {
  marketStructureShift: {
    detected: boolean;
    timeframe: string;
    type: 'BULLISH_CHoCH' | 'BEARISH_CHoCH' | 'NONE';
    displacementPips: number;
  };
  orderBlock: {
    detected: boolean;
    zoneType: 'BULLISH_DEMAND' | 'BEARISH_SUPPLY' | 'NONE';
    priceLevel: number;
    mitigated: boolean;
    volumeMultiplier: number;
  };
  fairValueGap: {
    detected: boolean;
    type: 'BULLISH_FVG' | 'BEARISH_FVG' | 'NONE';
    top: number;
    bottom: number;
    filledPercent: number;
  };
  liquiditySweep: {
    detected: boolean;
    side: 'BUY_SIDE' | 'SELL_SIDE' | 'NONE';
    sweepPrice: number;
    fakeoutReversal: boolean;
  };
  vwapBands: {
    vwap: number;
    upper1Sigma: number;
    lower1Sigma: number;
    upper2Sigma: number;
    lower2Sigma: number;
    upper3Sigma: number;
    lower3Sigma: number;
    currentBand: string;
  };
  pointOfControl: {
    pocPrice: number;
    vahPrice: number;
    valPrice: number;
    acceptanceStatus: 'IN_VALUE' | 'ABOVE_VAH' | 'BELOW_VAL';
  };
  cumulativeVolumeDelta: {
    cvdValue: number;
    divergenceDetected: boolean;
    divergenceType: 'BULLISH_ABSORPTION' | 'BEARISH_EXHAUSTION' | 'NONE';
  };
  depthImbalance: {
    bidAskDepthRatio: number;
    heavyQueueSide: 'BIDS' | 'ASKS' | 'BALANCED';
    imbalanceTriggered: boolean;
  };
  harmonicPattern: {
    patternName: 'Gartley' | 'Bat' | 'Butterfly' | 'Crab' | 'None';
    completionLevel: number;
    fibonacciConfluence: number;
    validated: boolean;
  };
  atrVolatilityFilter: {
    atr14: number;
    volatilityState: 'EXPANSION' | 'CONTRACTION' | 'NORMAL';
    gatingPassed: boolean;
  };
  crossAssetMacro: {
    realYieldDifferentialBps: number;
    cotInstitutionalPositioning: {
      commercialNetLongPct: number;
      extremeDetected: boolean;
      stance: 'BULLISH_EXTREME' | 'BEARISH_EXTREME' | 'NEUTRAL';
    };
    centralBankRateProbabilityShift: {
      hikeProbPct: number;
      cutProbPct: number;
      impliedShiftBps: number;
    };
  };
}

export interface ExhaustiveStrategyCorpusEvaluation {
  totalEvaluatedStrategies: number; // 2,500+
  technicalEvaluatedCount: number;  // 1,250
  fundamentalEvaluatedCount: number; // 1,250
  dynamicFailureConstraintsCount: number; // 1+

  technicalConcordance: {
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    concordanceRatio: number; // percentage
    dominantBias: 'BUY' | 'SELL' | 'NEUTRAL';
  };

  fundamentalConcordance: {
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    concordanceRatio: number; // percentage
    dominantBias: 'BUY' | 'SELL' | 'NEUTRAL';
  };

  metaConsensusScore: number; // 0 to 100
  metaConsensusDirection: 'BUY' | 'SELL' | 'HOLD';
  debateFrictionIndex: number; // 0 to 100% dialectical friction
  zeroPruningCertified: boolean; // strictly true (heuristic pruning deprecated)
  synchronousExecutionVerified: boolean; // strictly true (synchronous integration)
  evaluationTimestamp: number;

  categoryPerformanceBreakdown: ExhaustiveCategoryBreakdown[];
  institutionalGrading?: StrictInstitutionalGradingResult;
  institutionalOrderFlow?: InstitutionalOrderFlowMetrics;
  activeStrategyPermutations?: string[];
  prunedStrategyPermutationsCount?: number;
}

export interface OrderBookLiquidityWallSnapshot {
  bidWallPrice: number;
  bidWallVolume: number;
  askWallPrice: number;
  askWallVolume: number;
  wallThicknessMultiplier: number;
  anchoredStopLossLevel: number;
  anchoredTakeProfitLevel: number;
  volatilityAtrBufferPips: number;
  liquidityWallDistancePips: number;
}

export interface AbsoluteCapitalPreservationGateResult {
  passed: boolean;
  status: 'ARMED_AND_VERIFIED' | 'LOCKED_PRINCIPAL_AT_RISK' | 'HOLD_AWAITING_CONFLUENCE';
  zeroLossAssuranceRating: 'AAA_ABSOLUTE_ZERO_LOSS' | 'AA_PROTECTED' | 'FAIL_EXPOSURE_RISK';
  
  gatingChecklist: {
    probabilityThresholdSatisfied: boolean; // metaConsensusScore >= 78%
    structuralIntegrityVerified: boolean;  // S1/R1 unbroken, no opposite CHoCH
    liquidityWallAnchored: boolean;        // SL safely placed behind verified depth wall
    zeroUnhedgedRiskCertified: boolean;     // 1:1 Breakeven ratchet & proportional sizing
  };

  orderBookLiquidityWalls: OrderBookLiquidityWallSnapshot;
  invalidationAndExitDirective: string;
  gatekeeperAuditStamp: string;
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
  indicators?: TechnicalIndicators;
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
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
// 🌊 ORDER FLOW ANALYST INTERFACES (7th AGENT ROSTER)
// ==========================================
export interface OrderFlowAnalysis {
  role: 'order_flow_analyst';
  agentName: string;
  bias: SignalDirection;
  confidenceScore: number;
  thesis: string;
  cvdMetrics: {
    cvdValue: number;
    trend: 'ACCUMULATING' | 'DISTRIBUTING' | 'NEUTRAL';
    divergenceType: 'BULLISH_ABSORPTION' | 'BEARISH_EXHAUSTION' | 'NONE';
    interpretation: string;
  };
  diagonalImbalances: {
    ratio: number; // e.g. 3.4:1
    stackedImbalanceSide: 'BUY_STACK' | 'SELL_STACK' | 'BALANCED';
    dominantPressure: 'AGGRESSIVE_BUYING' | 'AGGRESSIVE_SELLING' | 'NEUTRAL';
    levelsDetectedCount: number;
  };
  volumeProfile: {
    pocPrice: number;
    vahPrice: number;
    valPrice: number;
    valueAreaAcceptance: 'ACCEPTANCE_ABOVE_VAH' | 'ACCEPTANCE_BELOW_VAL' | 'ROTATING_IN_VALUE';
    deltaAtPoc: number;
  };
  vwapBands: {
    vwap: number;
    upper1Sigma: number;
    lower1Sigma: number;
    upper2Sigma: number;
    lower2Sigma: number;
    currentSigmaBand: string;
    meanReversionProbability: number;
  };
  restingLiquidityWalls: {
    bidWallPrice: number;
    bidWallVolume: number;
    askWallPrice: number;
    askWallVolume: number;
    wallDominance: 'BID_DOMINANT' | 'ASK_DOMINANT' | 'BALANCED';
  };
  trappedParticipants: {
    detected: boolean;
    trappedSide: 'TRAPPED_BUYERS' | 'TRAPPED_SELLERS' | 'NONE';
    squeezePotential: 'HIGH' | 'MODERATE' | 'LOW';
  };
  topMatchedRules: KnowledgeRule[];
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
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
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

// ==============================================================
// 🏛️ 30-DAY HISTORICAL MACROECONOMIC ARCHIVE & BASELINE METRICS
// ==============================================================
export interface MacroHistoricalEvent {
  id: string;
  name: string;
  region: string;
  category: 'INFLATION' | 'CENTRAL_BANK' | 'EMPLOYMENT' | 'GROWTH' | 'COMMODITIES_RESERVES' | 'TRADE_BALANCE' | 'SURVEY';
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  actual: string | number;
  forecast: string | number;
  previous: string | number;
  surpriseDeviation?: number;
  volatilityImpactPips?: number;
  timestampIso: string;
  timestampEpochMs: number;
  date: string;
  timeUTC: string;
  timeIST: string;
  correlationAssets: string[];
  marketReactionSummary?: string;
}

export interface HistoricalMacroBaselineMetrics {
  eventName: string;
  eventCount30Days: number;
  avgVolatilityImpactPips: number;
  maxVolatilityImpactPips: number;
  lastSurpriseDeviation: number;
  historicalZScore: number;
  primaryCorrelatedAssets: string[];
  riskRegime: 'HIGH_VOLATILITY' | 'MODERATE_VOLATILITY' | 'LOW_VOLATILITY';
  lastUpdated: number;
}

// ==============================================================
// ⏳ 24-HOUR ROLLING MEMORY BUFFER (ZERO LOSS ON REFRESH)
// ==============================================================
export interface News24HourBufferState {
  articles: NewsArticle[];
  lastHydrated: number;
  totalArticlesCount: number;
  impactBreakdown: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  symbolBreakdown: Record<string, number>;
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
  confluenceGrade: ConfluenceGrade;
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
  institutionalGrading?: StrictInstitutionalGradingResult;
  institutionalOrderFlow?: InstitutionalOrderFlowMetrics;
  activeStrategyPermutations?: string[];
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
    dynamicLimitBound?: number;
    slippageCapPips?: number;
    stopLossBufferPips?: number;
    liquidityVacuumDefenseActive?: boolean;
    orderBookLiquidityWalls?: OrderBookLiquidityWallSnapshot;
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
    orderFlowAnalyst?: string;
    chiefReviewer?: string;
  };
}

export interface DebatePriceThresholds {
  entryPrice: number;
  takeProfit: number;
  takeProfit2?: number;
  stopLoss: number;
  riskRewardRatio: number;
  positionSizeLots: number;
  volatilityScaledLots?: number;
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
  confluenceGrade: ConfluenceGrade;
  confidenceScore: number;
  priceThresholds: DebatePriceThresholds;
  citedRules: DebateCitedRule[];
  summary: string;
  consensusVerdict: string;
  timestamp: string;
  activeScenario?: DebateScenarioContext;
  terminalNode?: DebateTerminalNode;
  divergence?: DebateDivergenceMetrics;
  buySideChannelWeight?: number;
  sellSideChannelWeight?: number;
  streamLatencyMs?: number;
  failSafePauseActive?: boolean;
  chiefRiskManagerUnifiedDirective?: {
    directive: DebateActionableDirective;
    directiveTitle: string;
    actionableSummary: string;
    institutionalClearanceStatus: 'CLEARED_FOR_EXECUTION' | 'DYNAMIC_TIER_APPROVED' | 'FAIL_SAFE_PAUSED';
    zeroVetoAllocationLots: number;
    hardcodedStopLoss: number;
    hardcodedTakeProfit: number;
    riskRewardRatio: number;
    latencyGuaranteed: boolean;
    streamLatencyMs: number;
  };
}

export interface SwarmConsensusResult {
  pair: CurrencyPair;
  marketSegment: MarketSegment;
  timeframe: TimeFrame;
  currentPrice: number;
  timestamp: string;
  consensusDirection: 'BUY' | 'SELL' | 'HOLD';
  overallConfidence: number;
  confluenceGrade: ConfluenceGrade;
  unifiedDecision: UnifiedDecision;
  knowledgeSummary: {
    totalTechnicalRulesLoaded: number;
    totalFundamentalRulesLoaded: number;
    totalDynamicRulesLoaded?: number;
    totalOperativeRules?: number;
    matchedTechnicalRules: number;
    matchedFundamentalRules: number;
    topConfluenceRules: KnowledgeRule[];
    activeFailureConstraint?: FailureConstraintRule;
  };
  preExecutionFilter?: PreExecutionFilterResult;
  agents: {
    technical: TechnicalAnalysis;
    fundamental: FundamentalAnalysis;
    forex: ForexAnalysis;
    news: NewsAnalysis;
    orderFlow?: OrderFlowAnalysis;
    risk: RiskAssessment;
  };
  buySideChannelWeight?: number;
  sellSideChannelWeight?: number;
  streamLatencyMs?: number;
  failSafePauseActive?: boolean;
  chiefRiskManagerUnifiedDirective?: {
    directive: DebateActionableDirective;
    directiveTitle: string;
    actionableSummary: string;
    institutionalClearanceStatus: 'CLEARED_FOR_EXECUTION' | 'DYNAMIC_TIER_APPROVED' | 'FAIL_SAFE_PAUSED';
    zeroVetoAllocationLots: number;
    hardcodedStopLoss: number;
    hardcodedTakeProfit: number;
    riskRewardRatio: number;
    latencyGuaranteed: boolean;
    streamLatencyMs: number;
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
    gradingTier?: ConfluenceGrade;
    tierDescription?: string;
  };
  dualConfirmation?: {
    confirmationStatus: 'DUAL_CONFIRMED' | 'DIVERGENCE_REJECTED' | 'CONSOLIDATION_NEUTRAL';
    entryAuthorized: boolean;
    technicalMomentum: {
      score: number;
      rsiStatus: string;
      structureMomentum: string;
      direction: string;
    };
    fundamentalSentiment: {
      score: number;
      macroRegime: string;
      centralBankDivergence: string;
      direction: string;
    };
    confirmationRationale: string;
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
  latchedState?: LatchedTradeState;
  chiefReviewerAudit?: ChiefReviewerAuditResult;
  entryProximityFilter?: EntryProximityFilterResult;
  riskGovernanceGatekeeper?: RiskGovernanceGatekeeperResult;
  multiAssetTickTelemetry?: MultiAssetNormalizedTick;
  trendGate?: TrendGateStatus;
  exhaustiveStrategyCorpus?: ExhaustiveStrategyCorpusEvaluation;
  capitalPreservationGate?: AbsoluteCapitalPreservationGateResult;
  sevenStagePipeline?: SevenStagePipelineResult;
  multiTierScreening?: MultiTierScreeningResult;
  invalidCriteriaGate?: PreTradeValidationGateResult;
  singleInstitutionalTarget?: SingleInstitutionalTarget;
  volatilityStopLoss?: DynamicVolatilityStopLoss;
  telemetryBridgeOverride?: TelemetryBridgeOverrideStatus;
  technicalCorpusValidation?: TechnicalCorpusCrossReferenceValidation;
  bindingConsensusValidation?: BindingConsensusValidation;
  gradeExclusivityFilter?: InstitutionalGradeExclusivityFilter;
}

// ============================================================================
// ⚡ SEVEN-STAGE DETERMINISTIC SEQUENTIAL PIPELINE ARCHITECTURE
// Strict sequential pipeline where each downstream module consumes ONLY
// the validated output of the preceding stage for the currently selected instrument.
// ============================================================================

export interface Stage1StrategiesAnalysis {
  stage: 1;
  stageName: '2,500+ Execution Strategies Analysis (Multi-Tier Screened)';
  timestamp: number;
  symbol: CurrencyPair;
  timeframe: TimeFrame;
  totalStrategiesEvaluated: number; // 2,500+ (1,250+ Technical + 1,250+ Fundamental)
  technicalStrategiesEvaluated: number;
  fundamentalStrategiesEvaluated: number;
  rawTechnicalScore: number;
  rawFundamentalScore: number;
  rawDirectionalScores: {
    buyScore: number;
    sellScore: number;
    netScore: number;
    rawBias: 'BUY' | 'SELL' | 'NEUTRAL';
  };
  patternDetections: {
    smartMoneyConcepts: {
      structure: string;
      orderBlock: string;
      fvgStatus: string;
      liquiditySweep: string;
    };
    ictFrameworks: string[];
    liquidityZones: string[];
    marketDna: string;
    quantumVisionOverlay: string;
  };
  topRuleMatches: KnowledgeRule[];
  status: 'COMPLETED';
  latencyMs: number;
}

export interface Stage2CongressOrderFlowGovernance {
  stage: 2;
  stageName: 'Institutional Strategies Congress and Order Flow Governance';
  timestamp: number;
  symbol: CurrencyPair;
  inputStage1: Stage1StrategiesAnalysis;
  multiTimeframeAlignment: {
    htfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    mtfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    ltfBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    isAligned: boolean;
    alignmentScore: number;
  };
  liquiditySweepValidation: {
    sweepDetected: boolean;
    sweptSide: 'BUY_SIDE_LIQUIDITY' | 'SELL_SIDE_LIQUIDITY' | 'NONE';
    sweepPriceLevel: number;
    institutionalAbsorptionConfirmed: boolean;
  };
  institutionalVolumeProfile: {
    pointOfControl: number;
    valueAreaHigh: number;
    valueAreaLow: number;
    cumulativeVolumeDelta: number;
    buyingPressurePercent: number;
    sellingPressurePercent: number;
    stackedImbalanceDetected: boolean;
    imbalanceRatio: number;
  };
  orderFlowGovernance: {
    retailNoiseFiltered: boolean;
    governanceVerdict: 'APPROVED_INSTITUTIONAL' | 'REJECTED_RETAIL_NOISE' | 'BORDERLINE_NEUTRAL';
    selectedSetupGrade: ConfluenceGrade;
    isInstitutionalGrade: boolean; // Grade A or Grade A+
    congressVotingTally: {
      institutionalYes: number;
      institutionalNo: number;
      abstain: number;
      rationale: string;
    };
  };
  status: 'COMPLETED';
  latencyMs: number;
}

export interface Stage3RealTimeMarketDataIntegration {
  stage: 3;
  stageName: 'Real-Time Market Data Integration';
  timestamp: number;
  symbol: CurrencyPair;
  inputStage2: Stage2CongressOrderFlowGovernance;
  exactLiveQuotes: {
    bidPrice: number;
    askPrice: number;
    midPrice: number;
    spreadPips: number;
    spreadCostUsd: number;
  };
  liveStreamIntegrations: {
    webSocketStream: {
      endpoint: string;
      protocol: 'WSS (Secure WebSocket)' | 'Direct Real-Time Streaming';
      isConnected: boolean;
      latencyMs: number;
      ticksIngested: number;
    };
    mt5RestApi: {
      endpoint: string;
      terminalStatus: 'CONNECTED' | 'SYNCHRONIZED';
      executionBridgeActive: boolean;
      pingMs: number;
      serverTime: string;
    };
  };
  tickVolatility: {
    instantaneousAtr: number;
    tickVelocityPerSec: number;
    volatilityRegime: 'NORMAL' | 'EXPANDING' | 'EXTREME_SPIKE' | 'COMPRESSED';
  };
  orderBookDepth: {
    bidDepthVolume: number;
    askDepthVolume: number;
    depthImbalanceRatio: number;
    nearestBidWall: number;
    nearestAskWall: number;
  };
  sessionLiquidityState: {
    activeSession: string;
    liquidityRating: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
    isMarketFrozen: boolean;
  };
  lastCandleMomentum: {
    open: number;
    high: number;
    low: number;
    close: number;
    delta: number;
    isExpansionBar: boolean;
  };
  evaluatedAgainstExactLivePricing: boolean;
  status: 'COMPLETED';
  latencyMs: number;
}

export interface Stage4IntermarketNewsCorrelations {
  stage: 4;
  stageName: 'Intermarket and Forex Market News and Correlations';
  timestamp: number;
  symbol: CurrencyPair;
  inputStage3: Stage3RealTimeMarketDataIntegration;
  crossAssetCorrelationTelemetry: {
    dxyIndex: { value: number; trend: string; correlationToSymbol: number };
    us10YRealYield: { value: number; trend: string; yieldSpread2Y10Y: number };
    equityIndices: { spxTrend: string; spxCorrelation: number };
    commodityTelemetry: { crudeOilTrend: string; goldTrend: string; copperTrend: string };
    correlatedPairs: Array<{ pair: string; correlationPercent: number; trend: string }>;
  };
  wireFeedsAndCalendar: {
    activeWireSourcesCount: number;
    breakingNewsBullets: Array<{
      source: string;
      title: string;
      sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
      impact: 'CRITICAL' | 'HIGH' | 'MEDIUM';
      timestamp: string;
    }>;
    macroEconomicSurprises: Array<{
      event: string;
      country: string;
      actual: number;
      forecast: number;
      variancePercent: number;
      deviationAlertTriggered: boolean;
    }>;
  };
  nlpSentimentScoring: {
    sentimentScore: number; // -100 to +100
    centralBankStance: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
    macroRegime: string;
    catalystRelationship: 'CONFIRMS_THESIS' | 'AMPLIFIES_THESIS' | 'CONTRADICTS_THESIS' | 'NEUTRAL';
    divergenceDetected: boolean;
    sentimentAnalysisRationale: string;
  };
  status: 'COMPLETED';
  latencyMs: number;
}

export interface Stage5ChiefGatekeeperCompilation {
  stage: 5;
  stageName: 'Chief Gatekeeper / Risk Manager Compilation';
  timestamp: number;
  symbol: CurrencyPair;
  inputStages1Through4: {
    stage1Summary: string;
    stage2Summary: string;
    stage3Summary: string;
    stage4Summary: string;
  };
  unifiedIntelligenceDossier: {
    dossierId: string;
    compiledAt: string;
    chiefGatekeeper: string;
    strategicConfluence: {
      confluenceGrade: ConfluenceGrade;
      compositeConfidenceScore: number;
      institutionalDirectionalBias: 'BUY' | 'SELL' | 'HOLD';
    };
    accountConstraints: {
      accountEquity: number;
      freeMargin: number;
      maxAllowedDrawdownPercent: number;
      maxDailyLossCapUsd: number;
      currentOpenRiskUsd: number;
    };
    riskRatioControllerParams: {
      enforcedMinRiskRewardRatio: number; // >= 2.0:1
      volatilityAdaptedLotSize: number;
      absoluteDownsideLossCapUsd: number;
      capitalPreservationDirective: string;
    };
    preExecutionComplianceAudit: {
      liquidityWallProtectionConfirmed: boolean;
      slippageToleranceVerified: boolean;
      calendarLockoutCleared: boolean;
      noCriticalContextDropped: boolean;
    };
  };
  gatekeeperVerdict: 'APPROVED_FOR_DEBATE' | 'GATEKEEPER_CAUTION' | 'GATEKEEPER_VETO';
  gatekeeperRationale: string;
  status: 'COMPLETED';
  latencyMs: number;
}

export interface Stage6ChiefReviewerDebate {
  stage: 6;
  stageName: 'Chief Reviewer and Buy-Side vs. Sell-Side Debate';
  timestamp: number;
  symbol: CurrencyPair;
  inputStage5: Stage5ChiefGatekeeperCompilation;
  chiefReviewer: string;
  adversarialDebateArena: {
    debateRounds: number;
    buySideThesis: {
      leadAdvocate: string;
      convictionScore: number;
      coreArguments: string[];
      competingLiquidityTargets: number[];
      structuralSupportPoints: number[];
      liveMomentumEvidences: string[];
    };
    sellSideThesis: {
      leadAdvocate: string;
      convictionScore: number;
      coreArguments: string[];
      competingLiquidityTargets: number[];
      structuralResistancePoints: number[];
      macroIntermarketRisks: string[];
    };
    crossExaminations: Array<{
      round: number;
      questioner: string;
      respondent: string;
      argumentTopic: string;
      resolutionVerdict: string;
    }>;
  };
  adjudicatedConsensus: {
    consensusRuling: 'DEFINITIVE_BUY' | 'DEFINITIVE_SELL' | 'NO_CONSENSUS_HOLD';
    adjudicatedDirection: 'BUY' | 'SELL' | 'HOLD';
    directionalBiasEliminated: boolean;
    adjudicatedConfidence: number;
    gatekeeperClearanceSignature: string;
    adjudicationSummary: string;
  };
  status: 'COMPLETED';
  latencyMs: number;
}

export interface StageAuditTrailItem {
  stageNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  stageName: string;
  status: 'PASSED' | 'VERIFIED' | 'COMPLETED' | 'MODIFIED' | 'VETOED';
  timestamp: number;
  timeFormatted: string;
  latencyMs: number;
  summary: string;
  keyMetric: string;
}

export interface Stage7FinalTradeOutput {
  stage: 7;
  stageName: 'Final Trade Output Generation';
  timestamp: number;
  symbol: CurrencyPair;
  inputStage6: Stage6ChiefReviewerDebate;
  actionableTradeDirective: {
    action: 'BUY' | 'SELL' | 'HOLD';
    orderType: 'BUY_MARKET' | 'SELL_MARKET' | 'NONE';
    symbol: CurrencyPair;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
    riskRewardRatio: number;
    confidenceGradedLots: number;
    maxLossUsd: number;
    executionAuthorized: boolean;
    executionStatus: 'READY' | 'EXECUTED' | 'VETOED';
    rationale: string;
  };
  structuralInvalidationAnchors: {
    invalidationPriceLevel: number;
    invalidationDistancePips: number;
    resistanceCeiling: number;
    s1Floor: number;
    anchoredLiquidityWall: string;
  };
  confidenceGradedSizingBreakdown: {
    baseAccountRiskPercent: number;
    gradeMultiplier: number;
    volatilityAtrMultiplier: number;
    calculatedLots: number;
  };
  stageByStageAuditTrail: StageAuditTrailItem[];
  terminalPayloadReady: boolean;
  status: 'COMPLETED';
  latencyMs: number;
}

export interface SevenStagePipelineResult {
  pipelineId: string;
  symbol: CurrencyPair;
  timeframe: TimeFrame;
  executedAt: string;
  totalPipelineLatencyMs: number;
  stage1: Stage1StrategiesAnalysis;
  stage2: Stage2CongressOrderFlowGovernance;
  stage3: Stage3RealTimeMarketDataIntegration;
  stage4: Stage4IntermarketNewsCorrelations;
  stage5: Stage5ChiefGatekeeperCompilation;
  stage6: Stage6ChiefReviewerDebate;
  stage7: Stage7FinalTradeOutput;
  isSuccess: boolean;
  pipelineCompleted: boolean;
  stagesCompletedCount: number;
}

export interface DeskAuditVerdict {
  desk: 'TECHNICAL' | 'FUNDAMENTAL' | 'NEWS_WIRE' | 'FOREX_INTERMARKET' | 'ORDER_FLOW' | 'RISK_GOVERNANCE';
  analystName: string;
  verdict: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  finding: string;
  score: number;
}

export interface DeskVoteDetail {
  desk: 'TECHNICAL' | 'FUNDAMENTAL' | 'NEWS_WIRE' | 'FOREX_INTERMARKET' | 'ORDER_FLOW' | 'RISK_GOVERNANCE';
  analystName: string;
  bias: string;
  vote: 'AGREE' | 'DISAGREE';
  confidence: number;
  buySideArgument: string;
  sellSideArgument: string;
  verdict: 'COMPLIANT' | 'WARNING' | 'NON_COMPLIANT';
  finding: string;
}

export interface ChiefReviewerAuditResult {
  auditorName: string;
  status: 'APPROVED' | 'MODIFIED' | 'VETOED';
  overallConfluenceScore: number;
  agreeCount: number;
  disagreeCount: number;
  consensusRuleSatisfied: boolean;
  consensusDirective: 'APPROVE_TRADE' | 'AVOID_TRADE' | 'MODIFY_PARAMETERS';
  buySideCase: string;
  sellSideCase: string;
  comparativeVerdict: string;
  deskAudits: {
    technical: DeskAuditVerdict;
    fundamental: DeskAuditVerdict;
    newsWire: DeskAuditVerdict;
    forexIntermarket: DeskAuditVerdict;
    orderFlow?: DeskAuditVerdict;
    riskGovernance: DeskAuditVerdict;
  };
  deskVotes: Partial<Record<'TECHNICAL' | 'FUNDAMENTAL' | 'NEWS_WIRE' | 'FOREX_INTERMARKET' | 'ORDER_FLOW' | 'RISK_GOVERNANCE', DeskVoteDetail>>;
  completeInvalidationCriteriaList: string[];
  contradictionResolution: {
    hasContradiction: boolean;
    contradictionType?: 'NEWS_TECHNICAL_INVERSION' | 'MACRO_PRICE_DIVERGENCE' | 'SPECIALIST_CONSENSUS_FAILURE' | 'CAPITAL_PRESERVATION_TRIGGERED' | 'NONE';
    resolutionAction: 'NONE' | 'REDUCE_SIZE_50_PERCENT' | 'WIDEN_BUFFER' | 'FORCE_VETO';
    explanation: string;
  };
  riskWorkflowVerified: boolean;
  proportionalSizingEnforced: boolean;
  explicitInvalidationCriteria: string;
  invalidationPriceLevel: number;
  gatekeeperSignature: string;
  auditTimestamp: string;
  crossExaminationNotes: string;
  exhaustiveCorpusAudit?: {
    totalStrategiesAudited: number;
    metaConsensusScore: number;
    zeroPruningCertified: boolean;
    capitalPreservationStatus: string;
  };
}

export interface LatchedTradeState {
  pair: CurrencyPair;
  isLatched: boolean;
  latchStatus: 'LATCHED_ACTIVE' | 'UNLATCHED_INVALIDATED' | 'UNLATCHED_EXPIRED' | 'UNLATCHED_EXECUTED';
  latchedAtEpochMs: number;
  timeWindowExpiryEpochMs: number;
  timeWindowMinutes: number;
  timeRemainingSeconds: number;
  anchoredDirection: 'BUY' | 'SELL';
  anchoredGrade: ConfluenceGrade;
  anchoredEntryPrice: number;
  anchoredStopLoss: number;
  anchoredTakeProfit: number;
  anchoredRiskReward: number;
  anchoredLots: number;
  resistanceCeiling: number; // For Sell setup: upper structural invalidation ceiling
  s1Floor: number;           // For Buy setup: lower structural invalidation floor
  winProbabilityPercent: number; // Monte Carlo win probability (e.g. 74.5%)
  probabilityFirstBoost: boolean; // Elevated to Grade A or B because win probability > 70%
  invalidationLevel: number;
  invalidationDistancePips: number;
  invalidationTriggerReason?: string;
  synthesisSources: {
    fundamentalRegime: string;
    newsSentimentScore: number;
    technicalPocLevel: number;
    valueAreaHigh: number;
    valueAreaLow: number;
    intermarketBullionYield: string;
    monteCarloVar95Usd: number;
    matchedRulesCount: number;
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
  grade: ConfluenceGrade;
  potentialLots: number;
  riskReward: number;
  status: 'PRIME_SETUP' | 'MODERATE_SETUP' | 'DYNAMIC_CONSERVATIVE' | 'AVOID_NO_EDGE' | 'VETOED';
}

export interface PositionInvalidationStatus {
  isInvalidated: boolean;
  urgency: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  actionRecommended: 'HOLD_POSITION' | 'CLOSE_IMMEDIATELY' | 'TIGHTEN_STOP' | 'TAKE_SMALL_PROFIT';
  technicalStatus: 'HEALTHY' | 'WARNING' | 'INVALIDATED';
  fundamentalStatus: 'HEALTHY' | 'WARNING' | 'INVALIDATED';
  technicalReasons: string[];
  fundamentalReasons: string[];
  allReasons: string[];
  pnlStatus: 'IN_PROFIT' | 'BREAKEVEN' | 'IN_LOSS';
  recommendedExitPrice: number;
  lastCheckedTime: string;
  structuralOverrideTriggered?: boolean;
  chochBreakdownDetected?: boolean;
  isBreakevenLocked?: boolean;
  trailedStopLoss?: number;
  targetCompressed?: boolean;
  compressedTakeProfit?: number;
  unrealizedGainPips?: number;
  initialRiskPips?: number;
  isOandaCorridorBreached?: boolean;
  isInvalidationFrozen?: boolean;
  freezeReason?: string;
  oandaBenchmarkDiscrepancyPips?: number;
}

// ============================================================================
// 🔒 IMMUTABLE TRADE STATE & OANDA BENCHMARK SYNCHRONIZATION TYPES
// ============================================================================

export interface ImmutableTradeSnapshot {
  readonly bidPrice: number;
  readonly askPrice: number;
  readonly spreadPips: number;
  readonly orderLots: number;
  readonly executionFillPrice: number;
  readonly executionSide: 'BID' | 'ASK';
  readonly oandaBenchmarkPrice: number;
  readonly oandaBenchmarkDiscrepancyPips: number;
  readonly isWithinOandaCorridor: boolean;
}

export interface ImmutableTradeAnchors {
  readonly anchoredEntryPrice: number;
  readonly anchoredStopLoss: number;
  readonly anchoredTakeProfit: number;
  readonly anchoredInvalidationPriceLevel: number;
  readonly anchoredRiskRewardRatio: number;
  readonly anchoredInitialRiskAmountUsd: number;
  readonly explicitInvalidationCriteria: string;
  readonly chiefReviewerSignature: string;
}

export interface ImmutableTradeState {
  readonly orderId: string;
  readonly positionId: string;
  readonly symbol: CurrencyPair;
  readonly orderType: 'BUY' | 'SELL';
  readonly lockedAtEpochMs: number;
  readonly lockedAtIso: string;
  readonly snapshot: ImmutableTradeSnapshot;
  readonly anchors: ImmutableTradeAnchors;
  readonly integrityHash: string;
  readonly isWriteProtected: boolean;
}

export interface OandaToleranceCheckResult {
  readonly symbol: CurrencyPair;
  readonly executionPrice: number;
  readonly oandaBenchmarkPrice: number;
  readonly discrepancyPips: number;
  readonly maxAllowedTolerancePips: number; // 20 to 50 pips corridor
  readonly isWithinTolerance: boolean;
  readonly status: 'IN_CORRIDOR_PERFECT' | 'IN_CORRIDOR_ELEVATED' | 'CORRIDOR_BREACHED_REJECT';
  readonly action: 'PROCEED_DISPATCH' | 'REJECT_ORDER' | 'FREEZE_INVALIDATION';
  readonly rejectionReason?: string;
}

export interface OandaParityMonitoringResult {
  readonly symbol: CurrencyPair;
  readonly liveDashboardPrice: number;
  readonly confirmedOandaBenchmark: number;
  readonly discrepancyPips: number;
  readonly isParityMaintained: boolean;
  readonly freezeAutomatedTriggers: boolean;
  readonly parityStatusText: string;
  readonly lastEvaluatedEpochMs: number;
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
  invalidation?: PositionInvalidationStatus;
  initialStopLoss?: number;
  initialTakeProfit?: number;
  isBreakevenLocked?: boolean;
  trailingStopActive?: boolean;
  targetCompressed?: boolean;
  compressionReason?: string;
  structuralOverrideTriggered?: boolean;
  confidenceAtEntry?: number;
  explicitInvalidationCriteria?: string;
  invalidationPriceLevel?: number;
  chiefReviewerSignature?: string;
  executionBidAsk?: {
    bid: number;
    ask: number;
    spread: number;
    executionSide: 'BID' | 'ASK';
    fillPrice: number;
  };
  atomicVerification?: PreExecutionAtomicVerification;
  immutableState?: ImmutableTradeState;
  oandaParityMonitoring?: OandaParityMonitoringResult;
  invalidCriteriaValidation?: PreTradeValidationGateResult;
}

export interface EntryProximityFilterResult {
  passed: boolean;
  symbol: CurrencyPair;
  proposedEntry: number;
  livePrice: number;
  pipDistance: number;
  minBandPips: number; // 10 pips minimum buffer against noise
  maxBandPips?: number; // Removed artificial 50-pip cap to allow unlimited profit potential
  status: 'APPROVED_WITHIN_BAND' | 'APPROVED_UNLIMITED_PROFIT' | 'REJECTED_BELOW_MIN_10_PIPS' | 'REJECTED_ABOVE_MAX_50_PIPS';
  rejectionReason?: string;
  toleranceBandDescription: string;
  unlimitedProfitPotential: boolean; // True: allows uncapped upside (+100, +250, +500+ pips)
  profitCapEnforced: boolean; // False: 50-pip restriction permanently removed
  zeroLossExposureEliminated: boolean; // True: 1:1 breakeven ratchet + 5-pip structural stop
  breakevenStopArmed: boolean; // Automated breakeven trigger armed
  dynamicTrailingRunnerActive: boolean; // Dynamic ATR/structural trailing stop active
  singleInstitutionalTarget?: SingleInstitutionalTarget; // Deterministic single high-credibility institutional target
  volatilityStopLoss?: DynamicVolatilityStopLoss; // Volatility-paired dynamic ATR stop loss
  expansionTargets?: {
    tp1: number;
    tp2: number;
    tp3: number;
    openRunnerPips: string;
  }; // DEPRECATED: Retained strictly for backward compatibility
}

// ============================================================================
// 🏛️ INSTITUTIONAL CAPITAL PRESERVATION & DETERMINISTIC TARGET ARCHITECTURE
// ============================================================================

export interface SingleInstitutionalTarget {
  targetPrice: number;
  pipDistance: number;
  riskRewardRatio: number;
  liquidityZoneType: 'POC_HIGH_VOLUME_NODE' | 'ORDER_BLOCK_UNMITIGATED_BOUNDARY' | 'VALUE_AREA_EXTENDED' | 'STRUCTURAL_SWING_PIVOT';
  liquidityZoneDescription: string;
  executionCertaintyPercent: number; // e.g. 84.5%
  isDeterministicSingleTarget: true;
}

export interface DynamicVolatilityStopLoss {
  stopLossPrice: number;
  pipDistance: number;
  atrValue: number;
  volatilityMultiplier: number; // e.g. 1.5x ATR
  invalidationAnchor: string; // e.g. '5 Pips Beyond S1 Floor + 1.5x ATR Buffer'
  maxLossCapitalCapUsd: number;
  accountRiskPercent: number;
}

export interface TelemetryBridgeOverrideStatus {
  isTriggered: boolean;
  divergenceType: 'SENTIMENT_STRUCTURE_DIVERGENCE' | 'NONE';
  newsSentimentPolarity: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  newsSentimentScore: number;
  technicalStructurePolarity: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  technicalStructureType: string;
  action: 'BLOCK_EXECUTION' | 'CLEARED';
  explanation: string;
}

export interface TechnicalCorpusCrossReferenceValidation {
  totalStrategiesCrossReferenced: number; // 1,250
  maxHistoricalFailureRateThreshold: number; // 30.0%
  minimumRequiredWinRate: number; // 70.0%
  concordantStrategiesCount: number;
  averageHistoricalWinRate: number; // e.g. 78.4%
  averageHistoricalFailureRate: number; // e.g. 21.6%
  historicalFailureRatePassed: boolean; // failureRate <= 30%
  multiTimeframeAlignment: {
    dailyTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    fourHourTrend: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    oneHourStructure: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    fifteenMinStructure: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
    isAligned: boolean;
    alignmentStatus: 'STRONG_MTF_ALIGNMENT' | 'WEAK_MTF_ALIGNMENT_DISCARD';
  };
  overallCrossReferenceStatus: 'PASSED' | 'DISCARDED_HIGH_FAILURE_RATE' | 'DISCARDED_WEAK_MTF';
}

export interface BindingConsensusValidation {
  isBinding: true;
  supermajorityRequiredRatio: number; // 5/6 (83.3%)
  actualAgreeCount: number;
  actualDisagreeCount: number;
  isSupermajorityAchieved: boolean;
  criticalDesksStatus: {
    newsWire: { analyst: string; vote: 'AGREE' | 'DISAGREE'; dissentBlocked: boolean; details: string };
    technical: { analyst: string; vote: 'AGREE' | 'DISAGREE'; dissentBlocked: boolean; details: string };
    riskGovernance: { analyst: string; vote: 'AGREE' | 'DISAGREE'; dissentBlocked: boolean; details: string };
  };
  hasCriticalDeskDissent: boolean;
  dissentingCriticalDesks: string[];
  finalBindingVerdict: 'CONSENSUS_AUTHORIZED' | 'BLOCKED_BY_CRITICAL_DESK_DISSENT' | 'BLOCKED_BY_LACK_OF_SUPERMAJORITY';
  contradictoryConsensusCutOffArmed: boolean;
}

export interface InstitutionalGradeExclusivityFilter {
  isGradeAorAPlus: boolean;
  assignedGrade: ConfluenceGrade;
  confidenceScore: number;
  minimumRequiredConfidence: number; // 75.0%
  isDispatchUnlocked: boolean;
  lockoutReason?: string;
  subOptimalSuppressed: boolean; // Grades B to F suppressed
}

export interface RiskGovernanceGatekeeperResult {
  passed: boolean;
  symbol: CurrencyPair;
  accountEquity: number;
  dynamicLots: number;
  riskRewardRatio: number;
  minAllowedRiskReward: number; // 2.0
  monteCarloWinProbability: number;
  minAllowedWinProbability: number; // 68%
  structuralStopLossLevel: number;
  structuralBufferPips: number; // 5 pips
  absoluteLossCapUsd: number;
  maxDrawdownLimitPercent: number; // 2.0%
  status: 'APPROVED' | 'VETOED';
  rationale: string;
  unlimitedProfitPotential: boolean;
  zeroLossExposureProtocol: {
    breakevenTriggerDistancePips: number;
    breakevenLockArmed: boolean;
    structuralStopPips: number;
    trailingRatchetActive: boolean;
    status: 'ZERO_LOSS_EXPOSURE_ARMED';
  };
}

export interface MultiAssetNormalizedTick {
  symbol: CurrencyPair;
  assetClass: 'FOREX' | 'METALS_COMMODITIES' | 'EQUITIES' | 'INDICES';
  liveBid: number;
  liveAsk: number;
  midPrice: number;
  spreadPips: number;
  pipMultiplier: number;
  decimals: number;
  timestamp: number;
  protocol: 'FIX_5_0_SP2' | 'WSS_DIRECT';
  ingestionLatencyMs: number;
  volume24h: number;
  vwap: number;
}

export interface IngestionEngineTelemetry {
  status: 'ACTIVE_INGESTING' | 'RECONNECTING' | 'STANDBY';
  totalInstrumentsMonitored: number;
  activeProtocols: ('WSS_SECURE' | 'FIX_5_0_SP2')[];
  ticksPerSecond: number;
  averageIngestionLatencyMs: number;
  inMemoryTimeSeriesRecords: number;
  normalizedInstruments: Record<string, {
    symbol: CurrencyPair;
    assetClass: string;
    pipMultiplier: number;
    decimals: number;
    currentBid: number;
    currentAsk: number;
    spreadPips: number;
    lastLatencyMs: number;
  }>;
}

export interface PreExecutionAtomicVerification {
  isVerified: boolean;
  atomicTickId: string;
  verificationTimestamp: number;
  symbol: CurrencyPair;
  orderType: 'BUY' | 'SELL';
  signalPrice: number;
  liveBid: number;
  liveAsk: number;
  liveFillPrice: number;
  spreadPips: number;
  priceDeviationPercent: number;
  slippagePips: number;
  riskWorkflowVerified: boolean;
  proportionalLotSize: number;
  requiredMarginUsd: number;
  freeMarginUsd: number;
  contradictionCheck: {
    passed: boolean;
    newsSentimentInversionDetected: boolean;
    macroTechnicalDivergenceDetected: boolean;
    structuralInvalidationBreached: boolean;
    resolutionDirective: string;
  };
  failureConstraintCheck: {
    passed: boolean;
    matchingRuleId?: string;
    similarityScore: number;
  };
  entryProximityFilter?: EntryProximityFilterResult;
  riskGovernanceValidation?: RiskGovernanceGatekeeperResult;
  action: 'DISPATCH_ORDER' | 'ABORT_AND_RECALIBRATE' | 'ABORT_INSUFFICIENT_MARGIN' | 'ABORT_OUTSIDE_PROXIMITY_BAND' | 'ABORT_RISK_GOVERNANCE_BREACH';
  abortReason?: string;
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
  exitReason?: string;
  invalidationTriggers?: string[];
  atomicVerification?: PreExecutionAtomicVerification;
  executionBidAsk?: Position['executionBidAsk'];
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
  | 'TECHNICAL_BREAKDOWN'
  | 'FUNDAMENTAL_MISALIGNMENT'
  | 'HYBRID_CONFLUENCE_FAILURE'
  | 'SUPPORT_VIOLATION'
  | 'RESISTANCE_BREACH'
  | 'CENTRAL_BANK_HAWKISH_SHOCK'
  | 'INTEREST_RATE_DIVERGENCE'
  | 'NONE_DISCIPLINED_WIN';

export type FailureClassification = 
  | 'TECHNICAL_BREAKDOWN' 
  | 'FUNDAMENTAL_MISALIGNMENT' 
  | 'HYBRID_CONFLUENCE_FAILURE';

export interface TechnicalConfluenceSnapshot {
  emaStack: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  ema20: number;
  ema50: number;
  ema200: number;
  rsi: number;
  rsiState: 'OVERSOLD' | 'OVERBOUGHT' | 'BULLISH_MOMENTUM' | 'BEARISH_MOMENTUM' | 'NEUTRAL';
  macdStatus: string;
  bollingerBandwidth: number;
  smcStructure: string;
  orderBlockLevel?: number;
  candlestickPattern: string;
  atr: number;
}

export interface FundamentalPulseSnapshot {
  centralBankBias: string;
  monetaryDivergence: string;
  interestRateSpreadBps: number;
  geopoliticalRiskIndex: 'LOW' | 'ELEVATED' | 'HIGH' | 'CRITICAL';
  macroSentimentScore: number;
  activeHighImpactCatalyst?: string;
  fiiFlowDiiRatio?: number;
  inflationSurpriseDeviation?: number;
}

export interface EntryConfluenceSnapshot {
  timestamp: number;
  symbol: CurrencyPair;
  orderType: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  lots: number;
  technical: TechnicalConfluenceSnapshot;
  fundamental: FundamentalPulseSnapshot;
  confluenceGrade: ConfluenceGrade;
  confidenceScore: number;
  citedRuleIds: string[];
}

export interface DiagnosticFailureAudit {
  tradeId: string;
  auditTimestamp: number;
  symbol: CurrencyPair;
  orderType: 'BUY' | 'SELL';
  entryPrice: number;
  exitPrice: number;
  realizedLossUsd: number;
  lossPips: number;
  failureClassification: FailureClassification;
  pointOfFailure: string;
  primaryFailureMetric: string;
  technicalViolationDetails: string;
  fundamentalMisalignmentDetails: string;
  mitigationRuleDirective: string;
  synthesizedRuleId: string;
  synthesizedRuleName: string;
  ruleIndex: number;
}

export interface FailureConstraintRule extends KnowledgeRule {
  isSynthesizedFromLoss: true;
  originatingTradeId: string;
  createdTimestamp: number;
  failureAudit: DiagnosticFailureAudit;
  triggerConditions: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL';
    rsiMin?: number;
    rsiMax?: number;
    emaStack?: 'BULLISH' | 'BEARISH';
    centralBankBias?: string;
    interestRateSpreadThresholdBps?: number;
    smcStructureInvalid?: string;
  };
  enforcementAction: 'DECLINE_ENTRY' | 'SCALE_DOWN_SIZE' | 'REQUIRE_WIDER_BUFFER';
  enforcementLotSize?: number;
  preventativeMessage: string;
}

export interface PreExecutionFilterResult {
  allowed: boolean;
  action: 'PROCEED' | 'ADJUST_SIZING' | 'DECLINE_ENTRY';
  adjustedLots?: number;
  matchingFailureRule?: FailureConstraintRule;
  similarityScore: number;
  reason: string;
}

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
  confluenceGrade: ConfluenceGrade;
  confidenceScore: number;
  swarmDirection: 'BUY' | 'SELL' | 'HOLD';
  riskManagerVerdict: RiskVerdict;
  keyReasons: string[];
  lossReasonCategory?: JournalLossCategory;
  lessonLearned?: string;
  notes?: string;
  tags?: string[];
  isImmutableLedgerRecord?: boolean;
  entrySnapshot?: EntryConfluenceSnapshot;
  diagnosticAudit?: DiagnosticFailureAudit;
  synthesizedRuleId?: string;
  exitReason?: string;
  invalidationTriggers?: string[];
  atomicVerification?: PreExecutionAtomicVerification;
  executionBidAsk?: Position['executionBidAsk'];
  confluenceScore?: number;
  strategyPermutations?: string[];
  smcOrderFlowMetrics?: Partial<InstitutionalOrderFlowMetrics>;
  isInstitutionalGrade?: boolean;
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
  strategyPermutationStats?: Record<string, {
    strategyId: string;
    strategyName: string;
    category: string;
    trades: number;
    wins: number;
    losses: number;
    winRate: number;
    avgPnl: number;
    isPruned: boolean;
    pruneReason?: string;
  }>;
  prunedStrategiesList?: Array<{
    strategyId: string;
    name: string;
    winRate: number;
    tradesCount: number;
    reason: string;
  }>;
  confluenceGradeWinRates?: Record<string, { count: number; wins: number; losses: number; winRate: number }>;
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
  preFlightVerification?: {
    status: 'PASSED' | 'ABORTED_NO_CATALYST';
    gateVerifiedAt: string;
    scheduledEventsFound: number;
    matchedCatalystId: string | null;
    isImminentOrActive: boolean;
    abortAlertMessage?: string;
  };

  // Mandatory Dual-Stage Validation Mechanism
  dualStageValidation?: {
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
  connectedSourceManifest?: {
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

  // Real-Time Telemetry Bridge & Strict Trend Gate
  trendGate?: TrendGateStatus;
  telemetryBridge?: MacroTelemetryBridgeState;

  // Dynamic Tiered Source Directory (90+ Sources replacing static 38 wires)
  tieredSourceDirectory?: TieredSourceDirectory;
  deepScrapeTriggerResult?: DeepScrapeTriggerResult;

  // High-Impact News Event Strict Risk Governance Protocols
  riskProtocols?: HighImpactEventRiskProtocols;

  // Deterministic Macro Telemetry & Historical Tick Data Performance
  macroTelemetry?: import('./eventDrivenMacroTelemetryEngine').RiskGovernancePipedTelemetry;
  entityExtraction?: import('./deterministicEntityExtractor').EntityExtractionResult;

  // Swarm Synthesis & Strategic Rationale
  strategicSummary: string;
}

// ============================================================================
// EVENT-DRIVEN MACRO INTELLIGENCE & TELEMETRY BRIDGE TYPES
// ============================================================================

export interface MultiTimeframeMomentumVector {
  m1: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  m5: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  m15: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  h1: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  h4: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  alignmentScore: number; // 0 to 100
  rsi14: number;
  emaTrend: 'STRONG_UPTREND' | 'STRONG_DOWNTREND' | 'CONSOLIDATION';
  smcStructure: 'BOS_EXPANSION' | 'CHOCH_REVERSAL' | 'RANGE_BOUND';
}

export interface TrendGateStatus {
  passed: boolean;
  status: 'CONFIRMED_ALIGNED' | 'DOWNGRADED_WARNING' | 'FLIPPED_TO_SELL' | 'FLIPPED_TO_BUY' | 'VETOED_BREACH';
  originalSignal: MacroSignalType;
  effectiveSignal: MacroSignalType;
  supportPrice: number;
  resistancePrice: number;
  currentPrice: number;
  supportBreached: boolean;
  resistanceBreached: boolean;
  macroSentimentDivergenceDetected: boolean;
  multiTimeframeMomentum: MultiTimeframeMomentumVector;
  rationale: string;
  downgradeOrFlipAction: 'MAINTAIN' | 'DOWNGRADE_CONVICTION' | 'FLIP_BIAS' | 'QUARANTINE_TRADE';
  lastEvaluatedAt: number;
}

export interface MacroTelemetryBridgeState {
  bridgeActive: boolean;
  latencyMs: number;
  lastSyncTimestamp: number;
  activeTerminalSymbol: CurrencyPair;
  trendGate: TrendGateStatus;
  realTimePrice: number;
  syncStatus: 'SYNCED_REALTIME' | 'RECONNECTING' | 'STALE';
}

export type TieredSourceCategory = 
  | 'TIER1_PRIME_INSTITUTIONAL' 
  | 'TIER2_REGIONAL_DESKS' 
  | 'TIER3_SPECIALIZED_COMMODITY' 
  | 'TIER4_SPEED_WIRES_SCRAPERS';

export interface TieredFinancialSource {
  id: string;
  name: string;
  domain: string;
  tier: TieredSourceCategory;
  specialization: 'MACRO_CENTRAL_BANK' | 'FOREX' | 'METALS_COMMODITIES' | 'GLOBAL_WIRE' | 'REGULATORY_INSTITUTIONAL' | 'INDIAN_MARKET';
  refreshRateSeconds: number;
  status: 'ACTIVE' | 'STREAMING' | 'STANDBY_SCRAPER';
  healthScore: number;
  latencyMs: number;
}

export interface TieredSourceDirectory {
  tier1PrimeCount: number;
  tier2RegionalCount: number;
  tier3SpecializedCount: number;
  tier4SpeedWireCount: number;
  totalDynamicSourcesCount: number; // 90+ verified global sources
  activeScrapedArticlesCount: number;
  onDemandDeepScrapingActive: boolean;
  lastDeepScrapeTimestamp?: number;
}

export interface DeepScrapeTriggerResult {
  triggered: boolean;
  symbol: CurrencyPair;
  triggerReason: 'STATISTICAL_VALIDATION_DROP' | 'DIVERGENCE_DETECTED' | 'VOLATILITY_ANOMALY' | 'ON_DEMAND_MANUAL';
  validationScoreBefore: number;
  validationScoreAfter: number;
  sourcesScrapedCount: number;
  newCatalystsIngested: number;
  crossSourceConsensus: 'STRONG_CONVERGENCE' | 'DIVERGENT' | 'HIGH_VOLATILITY_ALERT';
  auditTrail: string[];
}

export interface HighImpactEventRiskProtocols {
  calendarLockout: {
    isLockoutActive: boolean;
    lockoutWindowMinutes: number; // 15 mins before & 5 mins after
    nextEventId?: string;
    nextEventTitle?: string;
    secondsToLockout: number;
    liquidityVacuumMitigation: boolean;
    tradingAllowed: boolean;
  };
  volatilityAdaptedSizing: {
    baselineAtr14Pips: number;
    currentAtrPips: number;
    atrExpansionRatio: number; // Current ATR / Baseline ATR
    standardLots: number;
    adaptedLots: number;
    constantDollarRiskUsd: number;
    maxEquityRiskPercent: number; // <= 2.0%
  };
  entryExecutionMode: {
    orderType: 'LIMIT_BOUND_ENTRY' | 'MARKET_ORDER_PROHIBITED';
    maxSlippagePips: number; // Strict 1.5 - 2.5 pip bound
    boundLimitPrice: number;
    rawMarketOrdersBlocked: boolean;
  };
  antiLiquiditySweepProtection: {
    releaseDayAtrMultiple: number; // 2.5x to 3.5x ATR
    widenedStopLossPrice: number;
    widenedStopPips: number;
    proportionalLotScaleDownFactor: number;
    sweepAbsorptionCapacity: string;
  };
  multiTierTakeProfitScaling: {
    tp1: { price: number; pips: number; riskMultiplier: 1.5; scaleOutPercent: 50; breakevenArmed: boolean };
    tp2: { price: number; pips: number; riskMultiplier: 3.0; scaleOutPercent: 30 };
    tp3: { price: number; pips: number; riskMultiplier: 5.0; scaleOutPercent: 20; runnerMode: boolean };
    breakevenStopLockedAtTp1: boolean;
  };
  reflectionTimeTracker: {
    currentPhase: 'PRE_RELEASE_LOCKOUT' | 'IMMEDIATE_IMPULSE' | 'INSTITUTIONAL_PRICE_DISCOVERY' | 'MACRO_TREND_REFLECTION' | 'SECONDARY_CONTINUATION' | 'POST_ABSORPTION_STABLE';
    phaseProgressPercent: number;
    timeToNextPhaseSeconds: number;
    expectedPhases: {
      immediateImpulseWindow: string; // 0 - 45s
      priceDiscoveryWindow: string; // 1 - 5m
      macroTrendReflectionWindow: string; // 15 - 45m
      secondaryContinuationWindow: string; // 1 - 4h
    };
    exactReleaseTimeUtc: string;
    exactReleaseTimeIst: string;
  };
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

export interface ConfluenceFactorItem {
  id: string;
  factor: string;
  category: 'TECHNICAL' | 'FUNDAMENTAL' | 'FLOW' | 'CENTRAL_BANK';
  status: 'ALIGNED_BULLISH' | 'ALIGNED_BEARISH' | 'NEUTRAL' | 'DIVERGENT';
  weightPercent: number;
  impactScore: number;
  description: string;
}

export interface MultiFactorConfluenceReport {
  compositeScore: number; // 0.0 to 100.0%
  grade: ConfluenceGrade;
  directionalBias: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  activeSetupName: string;
  dynamicWeights: {
    technicalWeight: number; // e.g. 52
    fundamentalWeight: number; // e.g. 48
    flowWeight: number; // e.g. 25
    centralBankWeight: number; // e.g. 25
    rationale: string;
  };
  technicalStream: {
    totalRulesEvaluated: number; // 1,250
    passingRulesCount: number;
    bullishCount: number;
    bearishCount: number;
    neutralCount: number;
    streamConfidence: number; // 0-100%
    dominantPattern: string;
    subcategories: Record<string, { count: number; score: number; bias: 'BULLISH' | 'BEARISH' | 'NEUTRAL' }>;
    topMatchedRules: KnowledgeRule[];
  };
  fundamentalStream: {
    totalRulesEvaluated: number; // 1,250
    passingRulesCount: number;
    supportiveCount: number;
    restrictiveCount: number;
    neutralCount: number;
    streamConfidence: number; // 0-100%
    regimeBias: string;
    centralBankPolicyStance: {
      usFed: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
      rbi: 'HAWKISH' | 'DOVISH' | 'ACCOMMODATIVE' | 'NEUTRAL';
      ecb: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
      boj: 'HAWKISH' | 'DOVISH' | 'NEUTRAL';
      rateDifferentialBps: number;
      rateSpreadDirection: string;
    };
    indianMarketDynamics: {
      fiiFpiNetCashFlowCr: number;
      diiNetCashFlowCr: number;
      fiiIndexLongShortRatio: number;
      indiaVix: number;
      rbiRepoStance: string;
      currentAccountDeficitStatus: string;
      corporateEarningsImpact: string;
    };
    macroCommodityTransmission: {
      crudeOilImpact: string;
      goldReserveInflow: string;
      dxyDollarStrengthIndex: number;
      inflationTrajectory: string;
    };
    topMatchedRules: KnowledgeRule[];
  };
  confluenceMatrix: ConfluenceFactorItem[];
  institutionalRationale: string;
}

export interface VisionAtlasPayload {
  symbol: CurrencyPair;
  timeframe: TimeFrame;
  timestamp: number;
  timestampFormatted: string;

  // Unified Multi-Factor Confluence Engine (Synthesizing 2,500+ Institutional Strategies)
  multiFactorConfluence: MultiFactorConfluenceReport;

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
      totalEvaluated: number; // 1,250 distinct indicator combinations
      activeBullishSetups: number;
      activeBearishSetups: number;
      topValidatedSetups: Array<{ name: string; score: number; timeframe: string }>;
    };
    fundamental: {
      totalEvaluated: number; // 1,250 fundamental models
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
    recommendedLotSize?: number;
    gradingTier?: ConfluenceGrade;
    tierRiskPercent?: number;
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
    synthesisGrade?: ConfluenceGrade;
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
    synthesisGrade: ConfluenceGrade;
    confidenceScore: number;
    microTriggerConfirmed: boolean;
    macroBiasAligned: boolean;
    citedTechnicalRuleIds: string[];
    citedFundamentalModelIds: string[];
    executiveNarrative: string;
  };
}

// ============================================================================
// 🔬 EXPANDED QUANTITATIVE LIBRARY, MULTI-TIER SCREENING & INVALID CRITERIA MEMORY
// ============================================================================

export type QuantitativeCategory =
  | 'TECHNICAL_SMC'
  | 'VOLUME_PROFILE_AMT'
  | 'HARMONIC_GEOMETRIC'
  | 'VOLATILITY_STAT_ARB'
  | 'MACRO_YIELD_POLICY'
  | 'CROSS_ASSET_FLOW'
  | 'NEWS_CATALYST_REGIME'
  | 'ORDER_BOOK_MICROSTRUCTURE';

export type QuantitativeTier =
  | 'TIER_1_INSTITUTIONAL_ALPHA'
  | 'TIER_2_STATISTICAL_EDGE'
  | 'TIER_3_MACRO_CONVICTION'
  | 'TIER_4_CONFIRMATION_FILTER';

export interface QuantitativeStrategyModel {
  readonly id: string;
  readonly name: string;
  readonly category: QuantitativeCategory;
  readonly subcategory: string;
  readonly expectedWinRate: number; // e.g. 68.5% - 88.0%
  readonly sharpeRatio: number;     // e.g. 1.85 - 3.40
  readonly sortinoRatio: number;    // e.g. 2.10 - 4.10
  readonly calmarRatio: number;     // e.g. 2.00 - 3.80
  readonly maxDrawdownPercent: number; // e.g. 1.8% - 5.8%
  readonly profitFactor: number;    // e.g. 1.75 - 3.20
  readonly historicalTradesCount: number;
  readonly confidenceWeight: number; // 1 to 15
  readonly invalidationCriteria: string;
  readonly tier: QuantitativeTier;
  readonly screeningStatus: 'ACTIVE_RANKED' | 'SCREENED_OUT' | 'PENDING';
  readonly screeningFailureReason?: string;
  readonly compositeAlphaScore?: number;
  readonly directionalBias?: 'BUY' | 'SELL' | 'NEUTRAL';
}

export interface MultiTierScreeningConfig {
  readonly minWinRate: number;           // Default: 65.0%
  readonly minProfitFactor: number;      // Default: 1.75
  readonly minSharpeRatio: number;       // Default: 2.20
  readonly minSortinoRatio: number;      // Default: 2.50
  readonly maxDrawdownPercent: number;   // Default: 5.0%
  readonly minTradesCount: number;       // Default: 25
}

export interface MultiTierScreeningResult {
  readonly totalPoolSize: number;                // 2,500+ (1,250 Tech + 1,250 Fund)
  readonly tier1ViabilityPassed: number;        // Met WinRate & ProfitFactor hurdle
  readonly tier2SharpePassed: number;           // Met Sharpe >= 2.20 & Sortino >= 2.50
  readonly tier3MaxDrawdownPassed: number;      // Met MaxDD <= 5.0%
  readonly topRankedAlphaStrategies: QuantitativeStrategyModel[]; // Top filtered & ranked
  readonly averagePoolSharpe: number;
  readonly averagePoolDrawdown: number;
  readonly poolWinRate: number;
  readonly screenedTimestamp: number;
  readonly activeLeaderboardGrade: 'GRADE_A_PLUS_ALPHA' | 'GRADE_A_INSTITUTIONAL' | 'FILTERED';
}

export interface InvalidCriterionPattern {
  readonly id: string; // e.g. 'INV-CRIT-1795000000-XAUUSD'
  readonly tradeId: string;
  readonly symbol: CurrencyPair;
  readonly direction: 'BUY' | 'SELL';
  readonly timeframe: TimeFrame;
  readonly lossAmountUsd: number;
  readonly lossPips: number;
  readonly exitReason: string;
  readonly timestampEpochMs: number;
  readonly timestampIso: string;
  readonly technicalState: {
    readonly rsi: number;
    readonly macdHistogram: number;
    readonly emaSpreadPercent: number;
    readonly bbBandwidth: number;
    readonly atrPips: number;
    readonly candlestickPattern: string;
    readonly smcStructure: string;
    readonly orderBlockMitigation: string;
    readonly fvgStatus: string;
    readonly liquiditySweep: string;
  };
  readonly fundamentalState: {
    readonly macroRegime: string;
    readonly realYieldSpread: number;
    readonly centralBankStance: string;
    readonly newsSentimentScore: number;
    readonly sentimentBias: string;
  };
  readonly orderFlowState: {
    readonly cvdTrend: string;
    readonly imbalanceRatio: string;
    readonly wallThickness: number;
  };
  readonly session: string;
  readonly normalizedVector: number[]; // 12-dimensional feature vector for similarity calculation
  readonly matchedFailureArchetype: string;
  readonly failureExplanation: string;
  readonly preventativeAction: 'BLOCK_EXECUTION';
}

export interface PreTradeValidationGateResult {
  readonly allowed: boolean;
  readonly action: 'PROCEED' | 'BLOCK_EXECUTION';
  readonly matchedPattern?: InvalidCriterionPattern;
  readonly highestSimilarityPercent: number;
  readonly similarityThresholdPercent: number; // e.g. 80.0%
  readonly blockReason?: string;
  readonly crossReferencedCount: number;
  readonly evaluatedAtEpochMs: number;
  readonly isLearningLoopActive: boolean;
}

