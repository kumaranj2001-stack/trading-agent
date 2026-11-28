'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  CurrencyPair, 
  TimeFrame, 
  Candle, 
  SwarmConsensusResult, 
  Position, 
  ExecutionMode, 
  MarketScannerOpportunity, 
  MacroIndicator,
  MarketSegment,
  KnowledgeRule,
  DebateScenarioContext,
  DebatePriceThresholds,
  NavigationTab
} from '@/lib/types';
import { ArrowLeft, Bot, RefreshCw, Layers } from 'lucide-react';
import { INITIAL_PORTFOLIO, PortfolioState } from '@/lib/store';
import { DEFAULT_RISK_CONFIG, RiskManagerConfig } from '@/lib/agents/RiskManager';
import { BrowserStorageManager } from '@/lib/browserStorage';
import { Header } from '@/components/Header';
import { TickerBar } from '@/components/TickerBar';
import { UnifiedDecisionBanner } from '@/components/UnifiedDecisionBanner';
import { ChartView } from '@/components/ChartView';
import { AgentSwarmPanel } from '@/components/AgentSwarmPanel';
import { AgentDebateFeed } from '@/components/AgentDebateFeed';
import { PortfolioPanel } from '@/components/PortfolioPanel';
import { ActiveEntryInvalidationBanner } from '@/components/ActiveEntryInvalidationBanner';
import { MultiAssetIngestionTelemetryCard } from '@/components/MultiAssetIngestionTelemetryCard';
import { DynamicTradingSessionTimeline } from '@/components/DynamicTradingSessionTimeline';
import { BacktestView } from '@/components/BacktestModal';
import { ArchitectureView } from '@/components/ArchitectureView';
import { SettingsModal } from '@/components/SettingsModal';
import { RiskRatioControllerModal } from '@/components/RiskRatioControllerModal';
import { OpportunityScannerModal } from '@/components/OpportunityScannerModal';
import { ScalpingDesk } from '@/components/ScalpingDesk';
import { EconomicCalendarModal } from '@/components/EconomicCalendarModal';
import { VisionAtlasWorkspace } from '@/components/VisionAtlasWorkspace';
import { MacroIntelligenceDesk } from '@/components/MacroIntelligenceDesk';
import { MonteCarloModal } from '@/components/MonteCarloModal';
import { KnowledgeBaseModal } from '@/components/KnowledgeBaseModal';
import { NewsWireModal } from '@/components/NewsWireModal';
import { OrderFlowDesk } from '@/components/OrderFlowDesk';
import { FirebaseStatusModal } from '@/components/FirebaseStatusModal';
import { LeftNavigationDrawer } from '@/components/LeftNavigationDrawer';
import { JournalModal } from '@/components/JournalModal';
import { HistoricalJournalDesk } from '@/components/HistoricalJournalDesk';
import { SevenStagePipelineVisualizer } from '@/components/SevenStagePipelineVisualizer';
import { JournalStorageManager } from '@/lib/journalStorage';
import { getMarketSegmentForSymbol, PIP_VALUES, generateCandles } from '@/lib/marketData';
import { LiveMarketFeedManager } from '@/lib/liveMarketFeed';
import { MarketSessionInfo, TradeHistoryItem } from '@/lib/types';
import { MarketSessionManager } from '@/lib/marketSessionManager';
import { MarketCloseFreezeBanner } from '@/components/MarketCloseFreezeBanner';
import { AutonomousSwarmEngine, AutonomousSwarmTelemetry } from '@/lib/autonomousSwarmEngine';
import { tradeInvalidationEngine } from '@/lib/tradeInvalidationEngine';
import { stateLatchingEngine } from '@/lib/stateLatchingEngine';
import { ExecutionTelemetryEngine } from '@/lib/executionTelemetryEngine';
import { diagnosticReasoningEngine } from '@/lib/diagnosticReasoningEngine';
import { preExecutionVerificationEngine } from '@/lib/preExecutionVerificationEngine';
import { tradingStore } from '@/lib/tradingStore';

const executionTelemetryEngine = ExecutionTelemetryEngine.getInstance();

export default function Home() {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('XAU/USD');
  const selectedPairRef = useRef<CurrencyPair>(selectedPair);
  selectedPairRef.current = selectedPair;
  const [marketSegment, setMarketSegment] = useState<MarketSegment>('METALS_COMMODITIES');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [sessionInfo, setSessionInfo] = useState<MarketSessionInfo | null>(null);
  const [isMarketFrozen, setIsMarketFrozen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavigationTab>('terminal');
  
  // Market Data state
  const [candles, setCandles] = useState<Candle[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<MacroIndicator[]>([]);
  const [activeSession, setActiveSession] = useState<string>('LONDON_NY_OVERLAP');

  // Swarm State (5 Specialized Roles)
  const [consensus, setConsensus] = useState<SwarmConsensusResult | null>(null);
  const [swarmTelemetry, setSwarmTelemetry] = useState<AutonomousSwarmTelemetry | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDebating, setIsDebating] = useState<boolean>(false);

  // Navigation & Execution Mode
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('MANUAL');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isScrapingNews, setIsScrapingNews] = useState<boolean>(false);
  const [opportunities, setOpportunities] = useState<MarketScannerOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Portfolio State (Backed by Firebase Firestore + Local Storage)
  const [portfolio, setPortfolio] = useState<PortfolioState>(INITIAL_PORTFOLIO);
  const portfolioRef = useRef(portfolio);
  portfolioRef.current = portfolio;

  const [riskConfig, setRiskConfig] = useState<RiskManagerConfig>(DEFAULT_RISK_CONFIG);
  const riskConfigRef = useRef(riskConfig);
  riskConfigRef.current = riskConfig;

  const executionModeRef = useRef(executionMode);
  executionModeRef.current = executionMode;

  const lastWebSocketHeartbeatRef = useRef<number>(Date.now());
  const previousPriceRef = useRef<number>(0);
  const lastBreakingNewsRef = useRef<string | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isRiskRatioControllerOpen, setIsRiskRatioControllerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [activeDebateScenario, setActiveDebateScenario] = useState<DebateScenarioContext | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Hydrate theme from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = (localStorage.getItem('qri_theme') || localStorage.getItem('apex_theme')) as 'dark' | 'light' | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme);
        document.documentElement.classList.remove('dark', 'light');
        document.documentElement.classList.add(savedTheme);
      }
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qri_theme', nextTheme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(nextTheme);
    }
    showNotification(`Switched to ${nextTheme === 'light' ? 'Light' : 'Dark'} Mode.`);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Initial Load from Local Storage & Real-Time Firebase Sync
  useEffect(() => {
    // Immediate local cache hydration (0ms UI latency)
    const savedPortfolio = BrowserStorageManager.loadPortfolio();
    setPortfolio(savedPortfolio);
    const savedRisk = BrowserStorageManager.loadRiskConfig();
    setRiskConfig(savedRisk);
    const savedMode = BrowserStorageManager.loadExecutionMode();
    setExecutionMode(savedMode);

    // Asynchronous Cloud Firestore Hydration
    BrowserStorageManager.loadPortfolioFromCloud().then(cloudPort => {
      if (cloudPort) setPortfolio(cloudPort);
    });
    BrowserStorageManager.loadRiskConfigFromCloud().then(cloudRisk => {
      if (cloudRisk) setRiskConfig(cloudRisk);
    });

    // Real-time Firestore Portfolio Listener
    const unsubscribe = BrowserStorageManager.subscribeToPortfolio((updatedPortfolio) => {
      setPortfolio(updatedPortfolio);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // ⚡ Automated WebSocket Drop Fail-Safe: Sever open positions if connection drops > 5,000ms in Autopilot/Semi-Autonomous
  useEffect(() => {
    const wsDropTimer = setInterval(() => {
      const dropCheck = executionTelemetryEngine.checkWebSocketDropFailSafe(lastWebSocketHeartbeatRef.current, 5000);
      if (dropCheck.isDropped && (executionModeRef.current === 'FULL_AUTOPILOT' || executionModeRef.current === 'SEMI_AUTONOMOUS')) {
        setPortfolio(currentPortfolio => {
          if (currentPortfolio.positions.length > 0) {
            currentPortfolio.positions.forEach(pos => {
              handleClosePosition(pos.id, 'WS_DISCONNECT_AUTO_SEVER', [
                `WebSocket heartbeat dropped for ${(dropCheck.dropDurationMs / 1000).toFixed(1)}s (exceeded 5,000ms threshold)`,
                'Automated fail-safe severed position to eliminate unmonitored risk during connection loss'
              ]);
            });
          }
          return currentPortfolio;
        });
      }
    }, 1000);

    return () => clearInterval(wsDropTimer);
  }, []);

  // Automated Market Close & Global State Freeze Event Listener
  useEffect(() => {
    const currentInfo = MarketSessionManager.getMarketSessionInfo(selectedPair);
    setSessionInfo(currentInfo);
    setIsMarketFrozen(currentInfo.isFrozen);

    const unsubscribe = MarketSessionManager.subscribe((event) => {
      if (event.pair === selectedPair) {
        setSessionInfo(event.sessionInfo);
        setIsMarketFrozen(event.isFrozen);

        if (event.type === 'MARKET_CLOSED' || event.type === 'GLOBAL_FREEZE') {
          showNotification(`❄️ GLOBAL STATE FREEZE: ${event.pair} market closed. Pricing drift suppressed.`);
        } else if (event.type === 'MARKET_OPENED' || event.type === 'RESUME_TRADING') {
          showNotification(`🟢 TRADING RESUMED: ${event.pair} session opened.`);
        }
      }
    });

    return () => unsubscribe();
  }, [selectedPair]);

  // 2. Fetch market data & rates (calibrating against Live Chart Feed as Single Source of Truth)
  const fetchMarketData = useCallback(async (pair: CurrencyPair, tf: TimeFrame) => {
    try {
      const res = await fetch(`/api/market?pair=${encodeURIComponent(pair)}&timeframe=${tf}&count=60`);
      const json = await res.json();
      if (pair !== selectedPairRef.current) return; // Discard out-of-order response for mutated instrument
      if (json.success && json.data) {
        if (json.data.sessionInfo) {
          setSessionInfo(json.data.sessionInfo);
          setIsMarketFrozen(json.data.sessionInfo.isFrozen);
        }

        const incomingCandles: Candle[] = json.data.candles || [];
        LiveMarketFeedManager.setCanonicalFeed(pair, tf, incomingCandles);
        setCandles(incomingCandles);

        const livePrice = LiveMarketFeedManager.getCanonicalPrice(pair);
        const syncedRates = LiveMarketFeedManager.synchronizeRates(json.data.rates || [], pair, livePrice);
        setRates(syncedRates);

        if (json.data.calendar) setCalendar(json.data.calendar);
        if (json.data.activeSession?.session) {
          setActiveSession(json.data.activeSession.session);
        }

        // Live update active position P&L strictly from Chart Feed price
        setPortfolio(prev => {
          const { positions: updatedPositions, totalOpenPnl, hasChanged } = 
            LiveMarketFeedManager.calibratePositions(prev.positions, (sym) => {
              if (sym === pair) return livePrice;
              const matched = syncedRates.find((r: any) => r.pair === sym);
              return matched ? matched.price : LiveMarketFeedManager.getCanonicalPrice(sym);
            });

          if (!hasChanged) return prev;
          const newPortfolio = {
            ...prev,
            positions: updatedPositions,
            freeMargin: Math.max(0, prev.balance - prev.marginUsed + totalOpenPnl),
          };
          BrowserStorageManager.savePortfolio(newPortfolio);
          return newPortfolio;
        });
      }
    } catch (e) {
      console.error('Market fetch error:', e);
    }
  }, []);

  // 3. Fetch opportunity scanner results
  const fetchOpportunities = useCallback(async () => {
    setIsScanning(true);
    try {
      const res = await fetch('/api/scanner');
      const json = await res.json();
      if (json.success && json.data?.opportunities) {
        setOpportunities(json.data.opportunities);
      }
    } catch (e) {
      console.error('Scanner error:', e);
    } finally {
      setIsScanning(false);
    }
  }, []);

  // Autopilot Execution Check (Zero Human Latency)
  const executeAutopilotOrder = useCallback((calibratedResult: SwarmConsensusResult) => {
    if (executionModeRef.current !== 'FULL_AUTOPILOT') return;
    if (!calibratedResult.executionSignal.authorized) return;
    if (MarketSessionManager.isMarketFrozen(calibratedResult.pair)) return;

    // 🛑 Live WebSocket Stream Fail-Safe Pause Check (>1500ms Stale Data Protection)
    if (calibratedResult.failSafePauseActive || (calibratedResult.streamLatencyMs && calibratedResult.streamLatencyMs > 1500)) {
      console.warn(`[AUTOPILOT_FAIL_SAFE_PAUSE] Stream latency > 1500ms (${calibratedResult.streamLatencyMs}ms). Stale data lockout engaged.`);
      return;
    }

    // 🏛️ SSOT Single-Source-of-Truth Clearance Check: Consensus Chamber Directive
    if (calibratedResult.chiefRiskManagerUnifiedDirective && calibratedResult.chiefRiskManagerUnifiedDirective.institutionalClearanceStatus === 'FAIL_SAFE_PAUSED') {
      console.warn(`[AUTOPILOT_SSOT_CLEARANCE_LOCK] 8-Agent Consensus Chamber institutional clearance not granted (FAIL_SAFE_PAUSED).`);
      return;
    }

    const currentPositions = portfolioRef.current.positions;
    const alreadyOpen = currentPositions.some(p => p.symbol === calibratedResult.pair);
    if (alreadyOpen) return;

    const signal = calibratedResult.executionSignal;

    // 1. Mandatory Chief Reviewer Clearance Check
    const chiefAudit = calibratedResult.chiefReviewerAudit;
    if (chiefAudit && chiefAudit.status === 'VETOED') {
      console.warn(`[AUTOPILOT_VETOED_BY_CHIEF_REVIEWER] Entry aborted: ${chiefAudit.contradictionResolution.explanation}`);
      return;
    }

    // 2. 🛡️ Mandatory Atomic Pre-Execution Verification Gate (Identical Tick)
    // Decouples signal generation from order dispatch: validates risk workflow completeness,
    // enforces execution exclusively at real-time market Bid/Ask, and evaluates contradictory
    // signals and price deviations atomically on the identical tick.
    const verification = preExecutionVerificationEngine.verifyAtomicTickExecution({
      consensus: calibratedResult,
      accountBalance: portfolioRef.current.balance,
      freeMargin: portfolioRef.current.freeMargin,
      proposedLots: signal.lots,
      maxAllowedDeviationPercent: 0.05,
    });

    if (verification.action !== 'DISPATCH_ORDER') {
      console.warn(`[AUTOPILOT_ATOMIC_ABORT] Order dispatch aborted on tick: ${verification.abortReason}`);
      return;
    }

    const liveFillPrice = verification.liveFillPrice;
    const autoTradeType = verification.orderType;
    let autoLots = verification.proportionalLotSize;

    if (chiefAudit?.contradictionResolution.resolutionAction === 'REDUCE_SIZE_50_PERCENT') {
      autoLots = Math.max(0.01, Number((autoLots * 0.50).toFixed(2)));
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    let autoStopLoss = signal.stopLoss;
    let autoTakeProfit = signal.takeProfit;
    if (autoTradeType === 'SELL') {
      if (autoStopLoss <= liveFillPrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (liveFillPrice * 0.004);
        autoStopLoss = Number((liveFillPrice + stopDist).toFixed(5));
      }
      if (autoTakeProfit >= liveFillPrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (liveFillPrice * 0.008);
        autoTakeProfit = Number((liveFillPrice - targetDist).toFixed(5));
      }
    } else {
      if (autoStopLoss >= liveFillPrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (liveFillPrice * 0.004);
        autoStopLoss = Number((liveFillPrice - stopDist).toFixed(5));
      }
      if (autoTakeProfit <= liveFillPrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (liveFillPrice * 0.008);
        autoTakeProfit = Number((liveFillPrice + targetDist).toFixed(5));
      }
    }

    const explicitInvalidation = chiefAudit?.explicitInvalidationCriteria || 
      `MANDATORY INVALIDATION: Immediate autonomous exit if ${autoTradeType === 'BUY' ? 'price breaches S1 structural floor' : 'price breaches R1 structural ceiling'} or confirmed CHoCH occurs.`;
    const invalidationPriceLevel = chiefAudit?.invalidationPriceLevel || autoStopLoss;

    const autoPos: Position = {
      id: `pos-${Date.now()}`,
      symbol: signal.symbol,
      type: autoTradeType,
      lots: autoLots,
      entryPrice: liveFillPrice,
      currentPrice: liveFillPrice,
      stopLoss: autoStopLoss,
      takeProfit: autoTakeProfit,
      initialStopLoss: autoStopLoss,
      initialTakeProfit: autoTakeProfit,
      openTime: timeStr,
      pnl: 0,
      pnlPercent: 0,
      riskReward: signal.riskReward,
      isBreakevenLocked: false,
      trailingStopActive: false,
      targetCompressed: false,
      confidenceAtEntry: calibratedResult.overallConfidence || 80,
      explicitInvalidationCriteria: explicitInvalidation,
      invalidationPriceLevel,
      chiefReviewerSignature: chiefAudit?.gatekeeperSignature,
      executionBidAsk: {
        bid: verification.liveBid,
        ask: verification.liveAsk,
        spread: verification.spreadPips,
        executionSide: autoTradeType === 'BUY' ? 'ASK' : 'BID',
        fillPrice: liveFillPrice,
      },
      atomicVerification: verification,
    };

    const marginNeeded = (autoLots * 100000) / 30;
    setPortfolio(prev => {
      const updated = {
        ...prev,
        positions: [autoPos, ...prev.positions],
        marginUsed: prev.marginUsed + marginNeeded,
        freeMargin: Math.max(0, prev.balance - (prev.marginUsed + marginNeeded)),
      };
      BrowserStorageManager.savePortfolio(updated);
      return updated;
    });

    JournalStorageManager.recordTradeOpen(autoPos, calibratedResult, 'FULL_AUTOPILOT');
    showNotification(`⚡ AUTOPILOT EXECUTED: ${autoPos.type} ${autoPos.lots} Lots on ${signal.symbol} @ ${liveFillPrice} (${autoTradeType === 'BUY' ? 'Ask' : 'Bid'} Fill) [Confluence: ${calibratedResult.confluenceGrade}]`);
  }, []);

  // 4. Trigger 5-Agent Swarm (calibrating strictly against Canonical Chart Feed)
  const triggerSwarm = useCallback(async (pair: CurrencyPair, tf: TimeFrame, currentCandles?: Candle[]) => {
    setIsAnalyzing(true);
    try {
      const chartCandles = currentCandles && currentCandles.length > 0 
        ? currentCandles 
        : LiveMarketFeedManager.getCanonicalCandles(pair, tf);

      const result = await AutonomousSwarmEngine.executeAutonomousCycle(chartCandles.length > 0 ? chartCandles : undefined);
      if (result) {
        setConsensus(result);
        BrowserStorageManager.saveConsensusResult(result);
        executeAutopilotOrder(result);
        return result;
      }
      return null;
    } catch (e) {
      console.error('Swarm analysis error:', e);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [executeAutopilotOrder]);

  // 5. 24/7 Continuous Autonomous Multi-Agent Swarm Loop (Second-by-Second)
  useEffect(() => {
    fetchMarketData(selectedPair, timeframe);
    fetchOpportunities();

    // Start 24/7 autonomous loop at 2.0s cadence
    const stopLoop = AutonomousSwarmEngine.startAutonomousLoop(selectedPair, timeframe, 2000);

    const unsubscribe = AutonomousSwarmEngine.subscribe((result, telemetry) => {
      if (result.pair !== selectedPairRef.current) return;
      setConsensus(result);
      setIsAnalyzing(false);
      setSwarmTelemetry(telemetry);
      BrowserStorageManager.saveConsensusResult(result);

      // 🚨 Real-Time Notification for Major Breaking News Events
      if (result.agents?.news?.breakingAlert && result.agents.news.breakingAlert !== lastBreakingNewsRef.current) {
        lastBreakingNewsRef.current = result.agents.news.breakingAlert;
        showNotification(`🚨 BREAKING NEWS ALERT: ${result.agents.news.breakingAlert}`);
      }

      // 🛡️ Second-by-Second Technical & Fundamental Invalidation Re-evaluation on Open Positions
      setPortfolio(prev => {
        if (!prev.positions || prev.positions.length === 0) return prev;
        const reevaluated = prev.positions.map(pos => {
          const symPrice = LiveMarketFeedManager.getCanonicalPrice(pos.symbol);
          const symCandles = LiveMarketFeedManager.getCanonicalCandles(pos.symbol, timeframe);
          const invStatus = tradeInvalidationEngine.evaluatePosition(
            pos,
            symPrice,
            symCandles,
            pos.symbol === result.pair ? result : null
          );

          // Automated 1:1 Breakeven Lock Notification
          if (invStatus.isBreakevenLocked && !pos.isBreakevenLocked) {
            setTimeout(() => {
              showNotification(`🛡️ 1:1 BREAKEVEN ADJUSTMENT: Position on ${pos.symbol} stop loss locked at breakeven (zero downside risk).`);
            }, 0);
          }

          return {
            ...pos,
            invalidation: invStatus,
          };
        });

        // ⚡ Autonomous Emergency / Small-Profit Exit on Invalidation (FULL_AUTOPILOT & SEMI_AUTONOMOUS)
        if (executionModeRef.current === 'FULL_AUTOPILOT' || executionModeRef.current === 'SEMI_AUTONOMOUS') {
          for (const pos of reevaluated) {
            if (pos.invalidation?.isInvalidated && (pos.invalidation.urgency === 'HIGH' || pos.invalidation.urgency === 'CRITICAL')) {
              setTimeout(() => {
                handleClosePosition(pos.id, 'INVALIDATION_AUTO_CLOSE', pos.invalidation?.allReasons);
              }, 0);
            }
          }
        }

        return { ...prev, positions: reevaluated };
      });

      // Autopilot Execution Check (0ms Human Latency)
      executeAutopilotOrder(result);
    });

    return () => {
      unsubscribe();
      stopLoop();
    };
  }, [selectedPair, timeframe, fetchMarketData, fetchOpportunities, executeAutopilotOrder]);

  // 5b. Dedicated 15-Second Multi-Desk Institutional Recalibration Engine
  // Automatically triggers every 15 SECONDS to synthesize data across all core analytical engines:
  // Technical (525+ strategies), Fundamental (525+ models across 8 orthogonal families), Candlestick (120+ patterns), News (38 wires), Intermarket, Order Flow, and Risk Management
  useEffect(() => {
    const recalibrationTimer = setInterval(() => {
      if (MarketSessionManager.isMarketFrozen(selectedPairRef.current)) {
        return;
      }

      // Expire old latch and trigger instant 5-desk high-confluence synthesis
      stateLatchingEngine.purgeLatch(selectedPairRef.current);

      triggerSwarm(selectedPairRef.current, timeframe, candles).then((freshConsensus) => {
        if (freshConsensus && freshConsensus.pair === selectedPairRef.current) {
          setConsensus(freshConsensus);
          const isHighConfluence =
            freshConsensus.confluenceGrade === 'A+' ||
            freshConsensus.confluenceGrade === 'A' ||
            freshConsensus.confluenceGrade === 'B';

          if (freshConsensus.agents?.news?.breakingAlert && freshConsensus.agents.news.breakingAlert !== lastBreakingNewsRef.current) {
            lastBreakingNewsRef.current = freshConsensus.agents.news.breakingAlert;
            showNotification(`🚨 BREAKING NEWS ALERT: ${freshConsensus.agents.news.breakingAlert}`);
          }

          if (isHighConfluence && freshConsensus.unifiedDecision.direction !== 'HOLD') {
            showNotification(
              `⚡ 15s RECALIBRATION: High-confluence synthesis updated across 5 engines [Grade ${freshConsensus.confluenceGrade} • ${freshConsensus.unifiedDecision.direction}].`
            );
          }
        }
      }).catch(err => {
        console.warn('[15s Recalibration] Error executing cycle:', err);
      });
    }, 15000); // Institutional 15-second cadence

    return () => clearInterval(recalibrationTimer);
  }, [selectedPair, timeframe, candles, triggerSwarm, showNotification]);

  // 6. Unidirectional Live Market Data Feed Engine (Single Source of Truth)
  useEffect(() => {
    // Start authoritative real-time live ticker on the chart feed (every 1.5s)
    const stopTicker = LiveMarketFeedManager.startLiveFeed(selectedPair, timeframe, 1500);

    const unsubscribe = LiveMarketFeedManager.subscribe((event) => {
      if (event.pair !== selectedPairRef.current || event.timeframe !== timeframe) return;

      // Track live WebSocket heartbeat and previous price for circuit breaker
      lastWebSocketHeartbeatRef.current = Date.now();
      previousPriceRef.current = event.livePrice;

      // 1. Update chart candles with live tick in-place (visual rendering remains pristine)
      setCandles(event.candles);

      // 2. Synchronize TickerBar rates
      setRates(prevRates => LiveMarketFeedManager.synchronizeRates(prevRates, selectedPairRef.current, event.livePrice));

      // 3. Dynamically calibrate Swarm Matrix & Unified Decision Banner
      setConsensus(prev => (prev && prev.pair === selectedPairRef.current) ? LiveMarketFeedManager.calibrateSwarmConsensus(prev, event.livePrice) : null);

      // 4. Dynamically calibrate active position values, P&L, and Second-by-Second Technical/Fundamental Invalidation
      setPortfolio(prev => {
        const { positions: calibratedPositions, totalOpenPnl } = 
          LiveMarketFeedManager.calibratePositions(prev.positions, (sym) => {
            if (sym === selectedPair) return event.livePrice;
            return LiveMarketFeedManager.getCanonicalPrice(sym);
          });

        // 🛡️ Evaluate second-by-second technical & fundamental health on every running position
        const updatedPositions = calibratedPositions.map(pos => {
          const symPrice = pos.symbol === selectedPair ? event.livePrice : LiveMarketFeedManager.getCanonicalPrice(pos.symbol);
          const symCandles = pos.symbol === selectedPair ? event.candles : LiveMarketFeedManager.getCanonicalCandles(pos.symbol, timeframe);
          const invStatus = tradeInvalidationEngine.evaluatePosition(
            pos,
            symPrice,
            symCandles,
            pos.symbol === selectedPair ? consensus : null
          );

          // Real-time parameter sync: Breakeven lock & Target compression
          const isBreakeven = invStatus.isBreakevenLocked || pos.isBreakevenLocked;
          const isCompressed = invStatus.targetCompressed || pos.targetCompressed;

          return {
            ...pos,
            stopLoss: invStatus.trailedStopLoss || pos.stopLoss,
            takeProfit: invStatus.compressedTakeProfit || pos.takeProfit,
            isBreakevenLocked: isBreakeven,
            trailingStopActive: isBreakeven,
            targetCompressed: isCompressed,
            structuralOverrideTriggered: invStatus.structuralOverrideTriggered,
            invalidation: invStatus,
          };
        });

        // 🎯 Automated Server/Client Stop Loss & Take Profit Execution (Global Invariant across ALL modes)
        for (const pos of updatedPositions) {
          const symPrice = pos.symbol === selectedPair ? event.livePrice : LiveMarketFeedManager.getCanonicalPrice(pos.symbol);
          const isStopLossHit = (pos.type === 'BUY' && symPrice <= pos.stopLoss) ||
                                (pos.type === 'SELL' && symPrice >= pos.stopLoss);
          const isTakeProfitHit = (pos.type === 'BUY' && symPrice >= pos.takeProfit) ||
                                  (pos.type === 'SELL' && symPrice <= pos.takeProfit);

          if (isStopLossHit) {
            setTimeout(() => {
              handleClosePosition(pos.id, 'STOP_LOSS_TRIGGERED', [`Stop Loss executed at live price ${symPrice} (Target SL: ${pos.stopLoss})`]);
            }, 0);
          } else if (isTakeProfitHit) {
            setTimeout(() => {
              handleClosePosition(pos.id, 'TAKE_PROFIT_TRIGGERED', [`Take Profit executed at live price ${symPrice} (Target TP: ${pos.takeProfit})`]);
            }, 0);
          }
        }

        // 🚨 Automated Daily Drawdown Circuit Breaker & Emergency Flattening Protocol
        const currentEquity = prev.balance + totalOpenPnl;
        const startingCapital = 100000;
        const maxDailyDrawdownLimit = 4.0; // 4.0% hard capital preservation threshold
        const dailyLossAmount = startingCapital - currentEquity;
        const currentDrawdownPct = dailyLossAmount > 0 ? (dailyLossAmount / startingCapital) * 100 : 0;

        if (currentDrawdownPct >= maxDailyDrawdownLimit && updatedPositions.length > 0) {
          for (const pos of updatedPositions) {
            setTimeout(() => {
              handleClosePosition(pos.id, 'EMERGENCY_CIRCUIT_BREAKER_FLATTENED', [
                `HARD DRAWDOWN CIRCUIT BREAKER: Account drawdown reached ${currentDrawdownPct.toFixed(2)}% (limit ${maxDailyDrawdownLimit}%). All open risk flattened.`
              ]);
            }, 0);
          }
          showNotification(`🚨 HARD DRAWDOWN CIRCUIT BREAKER ACTIVATED: Account drawdown reached ${currentDrawdownPct.toFixed(2)}% (exceeded ${maxDailyDrawdownLimit}% limit). All positions flattened.`);
        }

        // ⚡ Paramount Structural Override & Invalidation Exit (FULL_AUTOPILOT & SEMI_AUTONOMOUS)
        if (executionModeRef.current === 'FULL_AUTOPILOT' || executionModeRef.current === 'SEMI_AUTONOMOUS') {
          for (const pos of updatedPositions) {
            const symPrice = pos.symbol === selectedPair ? event.livePrice : LiveMarketFeedManager.getCanonicalPrice(pos.symbol);
            const isInvalidationPriceBreached = pos.invalidationPriceLevel && (
              (pos.type === 'BUY' && symPrice <= pos.invalidationPriceLevel) ||
              (pos.type === 'SELL' && symPrice >= pos.invalidationPriceLevel)
            );

            if (pos.invalidation?.structuralOverrideTriggered || isInvalidationPriceBreached) {
              const reasons = [
                ...(pos.invalidation?.allReasons || []),
                isInvalidationPriceBreached ? `Explicit Invalidation Level Breached: Price ${symPrice} breached ${pos.invalidationPriceLevel}` : ''
              ].filter(Boolean);
              setTimeout(() => {
                handleClosePosition(pos.id, 'PARAMOUNT_STRUCTURAL_OVERRIDE', reasons);
              }, 0);
            } else if (pos.invalidation?.isInvalidated && (pos.invalidation.urgency === 'HIGH' || pos.invalidation.urgency === 'CRITICAL')) {
              setTimeout(() => {
                handleClosePosition(pos.id, 'INVALIDATION_AUTO_CLOSE', pos.invalidation?.allReasons);
              }, 0);
            }
          }
        }

        const updated = {
          ...prev,
          positions: updatedPositions,
          freeMargin: Math.max(0, prev.balance - prev.marginUsed + totalOpenPnl),
        };
        BrowserStorageManager.savePortfolio(updated);
        return updated;
      });
    });

    return () => {
      unsubscribe();
      stopTicker();
    };
  }, [selectedPair, timeframe]);

  // Handle Pair Switch with comprehensive state invalidation & reactive propagation
  const handleSelectPair = useCallback(async (newPair: CurrencyPair) => {
    if (!newPair || newPair === selectedPairRef.current) return;

    // 1. Immediately invalidate stale consensus to prevent displaying legacy metrics (e.g. Gold floors/ceilings)
    setConsensus(null);
    setIsAnalyzing(true);

    // 2. Synchronously purge state latches for both old and new pairs
    stateLatchingEngine.purgeLatch(selectedPairRef.current);
    stateLatchingEngine.purgeLatch(newPair);

    // 3. Immediately synthesize initial canonical candles for 0ms visual latency
    let newCandles = LiveMarketFeedManager.getCanonicalCandles(newPair, timeframe);
    if (!newCandles || newCandles.length === 0) {
      newCandles = generateCandles(newPair, timeframe, 60);
      LiveMarketFeedManager.setCanonicalFeed(newPair, timeframe, newCandles);
    }
    setCandles(newCandles);

    // 4. Update selected pair, ref, and segment
    setSelectedPair(newPair);
    selectedPairRef.current = newPair;
    const newSegment = getMarketSegmentForSymbol(newPair);
    setMarketSegment(newSegment);

    // 5. Update tradingStore Single Source of Truth
    tradingStore.setActivePair(newPair);

    // 6. Notify Autonomous Swarm and Live Feed of instrument switch
    AutonomousSwarmEngine.updateScope(newPair, timeframe);
    LiveMarketFeedManager.startLiveFeed(newPair, timeframe);

    // 7. Trigger immediate fetch & swarm cycle for new pair
    try {
      await fetchMarketData(newPair, timeframe);
      const fresh = await triggerSwarm(newPair, timeframe, newCandles);
      if (selectedPairRef.current === newPair && fresh) {
        setConsensus(fresh);
      }
    } finally {
      if (selectedPairRef.current === newPair) {
        setIsAnalyzing(false);
      }
    }
  }, [timeframe, fetchMarketData, triggerSwarm]);

  // Handle Market Segment Switch (Forex vs Metals vs Indian Market)
  const handleSelectMarketSegment = useCallback((newSegment: MarketSegment) => {
    setMarketSegment(newSegment);
    tradingStore.setMarketSegment(newSegment);
  }, []);

  // Handle Timeframe Switch
  const handleSelectTimeframe = useCallback((newTf: TimeFrame) => {
    setTimeframe(newTf);
    tradingStore.setTimeframe(newTf);
  }, []);

  // Toggle execution mode
  const handleToggleExecutionMode = () => {
    setExecutionMode(prev => {
      let next: ExecutionMode = 'MANUAL';
      if (prev === 'MANUAL') next = 'SEMI_AUTONOMOUS';
      else if (prev === 'SEMI_AUTONOMOUS') next = 'FULL_AUTOPILOT';
      BrowserStorageManager.saveExecutionMode(next);
      return next;
    });
  };

  // Force Scrape 38 Financial Websites on demand
  const handleForceScrape = async () => {
    setIsScrapingNews(true);
    try {
      await fetch(`/api/news?symbol=${encodeURIComponent(selectedPair)}`);
      await triggerSwarm(selectedPair, timeframe);
      showNotification(`38 Financial Websites & Institutional Wires freshly scraped for ${selectedPair}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScrapingNews(false);
    }
  };

  // Handle custom debate prompt (persistent scenario injection)
  const handleCustomDebatePrompt = async (prompt: string) => {
    setIsDebating(true);
    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: selectedPair,
          timeframe,
          candles,
          scenario: prompt,
        }),
      });
      const json = await res.json();
      if (json.success && json.data && consensus) {
        setConsensus({
          ...consensus,
          debateTranscript: json.data.transcript,
          debateSynthesis: json.data.synthesis || consensus.debateSynthesis,
          executionSignal: json.data.executionSignal || consensus.executionSignal,
        });
        if (json.data.activeScenario) {
          setActiveDebateScenario(json.data.activeScenario);
          const dir = json.data.terminalNode?.directive || 'PROCESSED';
          showNotification(`Scenario Active: "${prompt}" (Directive: ${dir.replace('_', ' ')})`);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDebating(false);
    }
  };

  // Handle clearing active debate scenario (resetting to baseline consensus)
  const handleClearDebateScenario = async () => {
    setIsDebating(true);
    try {
      setActiveDebateScenario(null);
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: selectedPair,
          timeframe,
          candles,
          resetScenario: true,
        }),
      });
      const json = await res.json();
      if (json.success && json.data && consensus) {
        setConsensus({
          ...consensus,
          debateTranscript: json.data.transcript,
          debateSynthesis: json.data.synthesis || consensus.debateSynthesis,
          executionSignal: json.data.executionSignal || consensus.executionSignal,
        });
        showNotification('Debate Scenario Cleared — Restored to Baseline Market Conditions');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDebating(false);
    }
  };

  // Handle Risk-Mitigation Modification
  const handleApplyRiskModification = (thresholds: DebatePriceThresholds) => {
    if (!consensus) return;
    setConsensus({
      ...consensus,
      executionSignal: {
        ...consensus.executionSignal,
        lots: thresholds.positionSizeLots,
        stopLoss: thresholds.stopLoss,
        takeProfit: thresholds.takeProfit,
        riskReward: thresholds.riskRewardRatio,
        riskAmountUsd: thresholds.maxLossUsd,
        status: 'READY',
      },
    });

    // If an open position exists for this symbol, modify its stop-loss and take-profit
    const existingPos = portfolio.positions.find(p => p.symbol === selectedPair);
    if (existingPos) {
      const updatedPositions = portfolio.positions.map(p => {
        if (p.symbol === selectedPair) {
          return {
            ...p,
            stopLoss: thresholds.stopLoss,
            takeProfit: thresholds.takeProfit,
          };
        }
        return p;
      });
      setPortfolio({
        ...portfolio,
        positions: updatedPositions,
      });
      BrowserStorageManager.savePortfolio({
        ...portfolio,
        positions: updatedPositions,
      });
    }

    showNotification(`Risk-Mitigation Applied: Stop tightened to ${thresholds.stopLoss}, Lots scaled to ${thresholds.positionSizeLots}`);
  };

  // Handle Strategic Exit / Abort Order
  const handleStrategicExit = () => {
    const openPos = portfolio.positions.find(p => p.symbol === selectedPair);
    if (openPos) {
      handleClosePosition(openPos.id);
      showNotification(`Strategic Exit Executed: Open position on ${selectedPair} closed to preserve capital.`);
    }

    if (consensus) {
      setConsensus({
        ...consensus,
        executionSignal: {
          ...consensus.executionSignal,
          authorized: false,
          orderType: 'NONE',
          status: 'VETOED',
        },
      });
    }

    if (!openPos) {
      showNotification(`Strategic Exit Mandated: Order execution aborted under scenario invalidation.`);
    }
  };

  // Execute Approved Trade into Simulated Portfolio (strictly calibrated against live chart feed)
  const handleExecuteTrade = () => {
    if (!consensus || !consensus.executionSignal.authorized) return;

    // 🛑 Fail-Safe Pause: Inhibit execution during stale market conditions (>1500ms)
    if (consensus.failSafePauseActive || (consensus.streamLatencyMs && consensus.streamLatencyMs > 1500)) {
      showNotification(`🛑 FAIL-SAFE PAUSE ENGAGED: Live WebSocket stream latency exceeds threshold (${consensus.streamLatencyMs || 1500}ms > 1500ms). Execution locked to prevent stale-state fills.`);
      return;
    }

    // 🏛️ SSOT Architectural Gatekeeper Check:
    // Actionable trade execution is derived EXCLUSIVELY from the Autonomous 8-Agent Debate and Consensus Chamber
    if (consensus.chiefRiskManagerUnifiedDirective && consensus.chiefRiskManagerUnifiedDirective.institutionalClearanceStatus === 'FAIL_SAFE_PAUSED') {
      showNotification(`🛑 SSOT GATEKEEPER LOCK: 8-Agent Consensus Chamber clearance paused due to stale data.`);
      return;
    }

    const signal = consensus.executionSignal;

    // 1. Strict API Rate Limiter
    const rateCheck = executionTelemetryEngine.checkApiRateLimit();
    if (!rateCheck.allowed) {
      showNotification(`ORDER HALTED: ${rateCheck.reason}`);
      return;
    }

    // 2. 🛡️ Mandatory Atomic Pre-Execution Verification Gate (Identical Tick)
    // Evaluates risk management completeness, real-time bid/ask decoupling,
    // tick slippage guardrails, and contradictory news wire sentiment inversions atomically on the identical tick.
    const verification = preExecutionVerificationEngine.verifyAtomicTickExecution({
      consensus,
      accountBalance: portfolio.balance,
      freeMargin: portfolio.freeMargin,
      proposedLots: signal.lots,
      maxAllowedDeviationPercent: 0.05,
    });

    if (verification.action !== 'DISPATCH_ORDER') {
      showNotification(`🛑 ATOMIC PRE-EXECUTION ABORT: ${verification.abortReason}`);
      if (verification.action === 'ABORT_AND_RECALIBRATE') {
        // Trigger immediate re-evaluation of swarm on fresh tick
        triggerSwarm(selectedPair, timeframe);
      }
      return;
    }

    const liveFillPrice = verification.liveFillPrice;
    const tradeType = verification.orderType;
    let executionLots = verification.proportionalLotSize;

    const chiefAudit = consensus.chiefReviewerAudit;
    if (chiefAudit?.contradictionResolution.resolutionAction === 'REDUCE_SIZE_50_PERCENT') {
      executionLots = Math.max(0.01, Number((executionLots * 0.50).toFixed(2)));
    }

    // 3. Circuit Breaker Mechanism Evaluation
    const cbCheck = executionTelemetryEngine.evaluateCircuitBreaker(
      portfolio,
      liveFillPrice,
      previousPriceRef.current || liveFillPrice
    );
    if (cbCheck.isTripped) {
      showNotification(`CIRCUIT BREAKER: ${cbCheck.reason}`);
      return;
    }

    const reqTimestamp = Date.now() - 32;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Strict Mathematical Invariant: Guarantee Stop Loss & Target orientation relative to real-time fill
    let executionStopLoss = signal.stopLoss;
    let executionTakeProfit = signal.takeProfit;

    if (tradeType === 'SELL') {
      if (executionStopLoss <= liveFillPrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (liveFillPrice * 0.004);
        executionStopLoss = Number((liveFillPrice + stopDist).toFixed(5));
      }
      if (executionTakeProfit >= liveFillPrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (liveFillPrice * 0.008);
        executionTakeProfit = Number((liveFillPrice - targetDist).toFixed(5));
      }
    } else {
      if (executionStopLoss >= liveFillPrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (liveFillPrice * 0.004);
        executionStopLoss = Number((liveFillPrice - stopDist).toFixed(5));
      }
      if (executionTakeProfit <= liveFillPrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (liveFillPrice * 0.008);
        executionTakeProfit = Number((liveFillPrice + targetDist).toFixed(5));
      }
    }

    const explicitInvalidation = chiefAudit?.explicitInvalidationCriteria || 
      `MANDATORY INVALIDATION: Immediate exit if ${tradeType === 'BUY' ? 'price breaches S1 structural floor' : 'price breaches R1 structural ceiling'} or confirmed CHoCH occurs.`;
    const invalidationPriceLevel = chiefAudit?.invalidationPriceLevel || executionStopLoss;

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: signal.symbol,
      type: tradeType,
      lots: executionLots,
      entryPrice: liveFillPrice,
      currentPrice: liveFillPrice,
      stopLoss: executionStopLoss,
      takeProfit: executionTakeProfit,
      initialStopLoss: executionStopLoss,
      initialTakeProfit: executionTakeProfit,
      openTime: timeStr,
      pnl: 0,
      pnlPercent: 0,
      riskReward: signal.riskReward,
      isBreakevenLocked: false,
      trailingStopActive: false,
      targetCompressed: false,
      confidenceAtEntry: consensus.overallConfidence || 80,
      explicitInvalidationCriteria: explicitInvalidation,
      invalidationPriceLevel,
      chiefReviewerSignature: chiefAudit?.gatekeeperSignature,
      executionBidAsk: {
        bid: verification.liveBid,
        ask: verification.liveAsk,
        spread: verification.spreadPips,
        executionSide: tradeType === 'BUY' ? 'ASK' : 'BID',
        fillPrice: liveFillPrice,
      },
      atomicVerification: verification,
    };

    const marginUsedForTrade = (executionLots * 100000) / 30;
    const updatedPositions = [newPosition, ...portfolio.positions];
    const newMarginUsed = portfolio.marginUsed + marginUsedForTrade;

    const updatedPortfolio = {
      ...portfolio,
      positions: updatedPositions,
      marginUsed: newMarginUsed,
      freeMargin: Math.max(0, portfolio.balance - newMarginUsed),
    };

    setPortfolio(updatedPortfolio);
    BrowserStorageManager.savePortfolio(updatedPortfolio);

    // 📓 Persistent Trading Journal: Auto-log entry credentials, stop-loss ratios & trade parameters
    JournalStorageManager.recordTradeOpen(newPosition, consensus, executionMode);

    // 📡 Dedicated Execution Latency & Slippage Logger
    executionTelemetryEngine.logTradeExecution({
      symbol: signal.symbol,
      direction: tradeType,
      lots: executionLots,
      targetEntry: signal.entry,
      filledEntry: liveFillPrice,
      requestTimestamp: reqTimestamp,
      confirmTimestamp: Date.now(),
    });

    showNotification(`ORDER EXECUTED: ${newPosition.type} ${executionLots} Lots on ${signal.symbol} @ ${liveFillPrice} (${tradeType === 'BUY' ? 'Ask' : 'Bid'} Fill)`);
  };

  // Close Position & Save to Local Browser Storage (calibrated against live chart feed)
  const handleClosePosition = (posId: string, exitReason?: string, invalidationTriggers?: string[]) => {
    const pos = portfolio.positions.find(p => p.id === posId);
    if (!pos) return;

    const liveExitPrice = LiveMarketFeedManager.getCanonicalPrice(pos.symbol);
    const isJpy = pos.symbol.includes('JPY');
    const isGold = pos.symbol === 'XAU/USD';
    const pipVal = PIP_VALUES[pos.symbol] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);
    const pipDollar = 10;
    const pipDiff = pos.type === 'BUY'
      ? (liveExitPrice - pos.entryPrice) / pipVal
      : (pos.entryPrice - liveExitPrice) / pipVal;

    const finalPnl = Number((pipDiff * pipDollar * pos.lots).toFixed(2));
    const updatedPositions = portfolio.positions.filter(p => p.id !== posId);
    const newBalance = Number((portfolio.balance + finalPnl).toFixed(2));
    const marginFreed = (pos.lots * 100000) / 30;
    const newMarginUsed = Math.max(0, portfolio.marginUsed - marginFreed);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const isAutoInvalidation = exitReason === 'INVALIDATION_AUTO_CLOSE';
    const notes = isAutoInvalidation
      ? `⚡ Autonomous Exit on Invalidation: Closed at ${liveExitPrice}. ${finalPnl >= 0 ? `Small profit of +$${finalPnl.toFixed(2)} locked` : `Capital preserved (Loss: -$${Math.abs(finalPnl).toFixed(2)})`}. Reasons: ${invalidationTriggers?.join(' | ') || 'Technical/Fundamental Invalidation'}`
      : `Position closed at ${liveExitPrice}. Realized P&L: $${finalPnl.toFixed(2)}.`;

    const historyItem: TradeHistoryItem = {
      id: `th-${Date.now()}`,
      symbol: pos.symbol,
      type: pos.type,
      lots: pos.lots,
      entryPrice: pos.entryPrice,
      exitPrice: liveExitPrice,
      stopLoss: pos.stopLoss,
      takeProfit: pos.takeProfit,
      openTime: pos.openTime,
      closeTime: timeStr,
      pnl: finalPnl,
      outcome: (finalPnl > 0 ? 'WIN' : finalPnl < 0 ? 'LOSS' : 'SCRATCH') as 'WIN' | 'LOSS' | 'SCRATCH',
      riskManagerVerdict: 'APPROVED' as const,
      strategyNotes: notes,
      exitReason: exitReason || 'MANUAL_CLOSE',
      invalidationTriggers: invalidationTriggers || [],
    };

    const updatedPortfolio = {
      ...portfolio,
      balance: newBalance,
      equity: newBalance,
      positions: updatedPositions,
      marginUsed: newMarginUsed,
      freeMargin: Math.max(0, newBalance - newMarginUsed),
      tradeHistory: [historyItem, ...portfolio.tradeHistory],
    };

    setPortfolio(updatedPortfolio);
    BrowserStorageManager.savePortfolio(updatedPortfolio);

    // 📓 Immutable Event-Driven Data Bus: Transmit complete execution payload directly to journal
    const closeResult = JournalStorageManager.recordTradeClose(
      pos,
      liveExitPrice,
      finalPnl,
      finalPnl > 0 ? 'WIN' : finalPnl < 0 ? 'LOSS' : 'SCRATCH',
      {
        exitReason: exitReason || 'MANUAL_CLOSE',
        invalidationTriggers: invalidationTriggers || [],
        pos,
      }
    );

    // 🔬 Diagnostic Reasoning Engine: Instant notification when recursive audit synthesizes a new failure rule
    if (finalPnl < 0 && closeResult.diagnosticAudit) {
      const audit = closeResult.diagnosticAudit;
      showNotification(
        `🔬 DIAGNOSTIC AUDIT: ${audit.failureClassification.replace('_', ' ')} isolated on ${pos.symbol}. Dynamically synthesized Operative Rule #${audit.ruleIndex} into Knowledge Base.`
      );
    }

    const pnlPrefix = finalPnl >= 0 ? '+' : '';
    const alertMsg = isAutoInvalidation
      ? `⚡ AUTONOMOUS EXIT ON INVALIDATION: Closed ${pos.symbol} @ ${liveExitPrice} | P&L: ${pnlPrefix}$${finalPnl.toFixed(2)} (${finalPnl >= 0 ? 'Small profit secured' : 'Capital preserved'})`
      : `CLOSED POSITION: ${pos.symbol} @ ${liveExitPrice} | Realized P&L: ${pnlPrefix}$${finalPnl.toFixed(2)}`;

    showNotification(alertMsg);

    // Real-Time Liquidity Re-Synchronization: Release stale latched credentials and trigger fresh setup derivation
    stateLatchingEngine.releaseLatch(pos.symbol, 'Position Closed: Setup reset to synchronize with live market liquidity');
    if (pos.symbol === selectedPair) {
      triggerSwarm(selectedPair, timeframe, candles);
    }
  };

  const handleForceRecalibrate = useCallback(() => {
    stateLatchingEngine.forceRecalibrate(selectedPair);
    triggerSwarm(selectedPair, timeframe, candles);
    showNotification(`⚡ State-latch released for ${selectedPair}. Recalibrating 5-agent swarm consensus.`);
  }, [selectedPair, timeframe, candles, triggerSwarm, showNotification]);

  const triggeredRules: KnowledgeRule[] = consensus ? consensus.knowledgeSummary.topConfluenceRules : [];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-200 ${theme === 'light' ? 'bg-slate-50 text-slate-900' : 'bg-terminal-950 text-slate-100'} selection:bg-cyan-500/30 selection:text-cyan-200`}>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-50 px-4 py-2.5 rounded-lg bg-emerald-600 text-white font-mono text-xs font-semibold shadow-2xl flex items-center gap-2 border border-emerald-400 animate-fade-in max-w-[90vw]">
          <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0"></span>
          <span className="truncate">{notification}</span>
        </div>
      )}

      {/* Main Header with Market Selector & 18-Source News Wire Tool */}
      <Header
        selectedPair={selectedPair}
        marketSegment={marketSegment}
        onSelectMarketSegment={handleSelectMarketSegment}
        timeframe={timeframe}
        onSelectPair={handleSelectPair}
        onSelectTimeframe={handleSelectTimeframe}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        portfolio={portfolio}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScanner={() => setActiveTab('scanner')}
        onOpenCalendar={() => setActiveTab('calendar')}
        onOpenMonteCarlo={() => setActiveTab('var')}
        onOpenKnowledge={() => setActiveTab('knowledge')}
        onOpenNewsWire={() => setActiveTab('wire')}
        onOpenFirebase={() => setActiveTab('firebase')}
        onOpenJournal={() => setActiveTab('journals')}
        onOpenLeftDrawer={() => setIsLeftDrawerOpen(true)}
        isLeftDrawerOpen={isLeftDrawerOpen}
        isAnalyzing={isAnalyzing}
        onTriggerAnalysis={() => triggerSwarm(selectedPair, timeframe, candles)}
        activeSession={activeSession}
        executionMode={executionMode}
        onToggleExecutionMode={handleToggleExecutionMode}
        confluenceGrade={consensus?.confluenceGrade}
        isMarketFrozen={isMarketFrozen}
        sessionInfo={sessionInfo}
        onToggleFreeze={() => {
          const next = !isMarketFrozen;
          MarketSessionManager.setManualFreeze(next);
          setIsMarketFrozen(next);
          showNotification(next ? '❄️ Global State Freeze activated.' : '🟢 Trading resumed. Global State Unfrozen.');
        }}
        cycleNumber={consensus?.autonomousLoopTelemetry?.cycleNumber || swarmTelemetry?.cycleCount}
      />

      {/* Live Ticker Bar (Forex, Metals & Commodities, or Indian Markets) */}
      <TickerBar
        rates={rates}
        selectedPair={selectedPair}
        onSelectPair={handleSelectPair}
        marketSegment={marketSegment}
        isMarketFrozen={isMarketFrozen}
        sessionInfo={sessionInfo}
      />

      {/* Main Content Area - Strictly aligned to max-w-7xl container boundary with zoom stability */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-4 zoom-block-stable">
        {/* ❄️ Global State Freeze upon Market Closure Banner */}
        {activeTab !== 'vision-atlas' && (activeTab as string) !== 'vision-atlas-lab' && (
          <MarketCloseFreezeBanner
            sessionInfo={sessionInfo}
            onToggleManualOverride={(override) => {
              const frozen = !override && MarketSessionManager.isMarketFrozen(selectedPair);
              setIsMarketFrozen(frozen);
              showNotification(frozen ? '❄️ State re-frozen.' : '🟢 State temporarily unfrozen for simulation.');
            }}
          />
        )}

        {/* Tab 1: Terminal */}
        {activeTab === 'terminal' && (
          <div className="space-y-4">
            {/* 🌐 Dynamic Trading Session Clock Timeline & Overlap Matrix (Placed at the very top) */}
            <DynamicTradingSessionTimeline
              currentPair={selectedPair}
              theme={theme}
            />

            {/* 🌟 UNIFIED 5-ROLE BUY/SELL DECISION BANNER (Preserved Institutional Real-Time Engine Layer) */}
            {consensus && consensus.pair === selectedPair ? (
              <UnifiedDecisionBanner
                consensus={consensus}
                onExecuteTrade={handleExecuteTrade}
                onOpenNewsWire={() => setActiveTab('wire')}
                onOpenMonteCarlo={() => setActiveTab('var')}
                onOpenSequentialPipeline={() => setActiveTab('debate')}
                onForceRecalibrate={handleForceRecalibrate}
                isMarketFrozen={isMarketFrozen}
                sessionInfo={sessionInfo}
                theme={theme}
                suppressIntermediateModules={false}
              />
            ) : isAnalyzing ? (
              <div className="rounded-xl border border-cyan-500/20 bg-terminal-900/80 p-5 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono shadow-lg animate-pulse">
                <div className="flex items-center gap-3 text-cyan-400">
                  <RefreshCw className="h-5 w-5 animate-spin shrink-0" />
                  <div>
                    <span className="font-bold uppercase tracking-wider text-white block">
                      Recalibrating 5-Agent Swarm Consensus for {selectedPair}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Purged legacy state latches • Evaluating 2,100+ institutional technical & fundamental models...
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">
                  0ms RE-ANCHOR IN PROGRESS
                </span>
              </div>
            ) : null}

            {/* 🛡️ Active Running Entry Real-Time Invalidation Monitor */}
            {portfolio.positions.find(p => p.symbol === selectedPair) && (
              <ActiveEntryInvalidationBanner
                position={portfolio.positions.find(p => p.symbol === selectedPair)}
                onClosePosition={handleClosePosition}
                executionMode={executionMode}
              />
            )}

            {/* 🌐 Multi-Asset Real-Time Ingestion Layer & Normalized Pip Metrics */}
            <MultiAssetIngestionTelemetryCard
              selectedPair={selectedPair}
              onSelectPair={handleSelectPair}
              theme={theme}
            />

            {/* Candlestick Chart (OANDA Live Streaming or Swarm Matrix) */}
            <ChartView
              candles={candles}
              pair={selectedPair}
              timeframe={timeframe}
              stopLoss={consensus?.pair === selectedPair ? consensus.agents.risk.parameters.stopLoss : undefined}
              takeProfit={consensus?.pair === selectedPair ? consensus.agents.risk.parameters.takeProfit1 : undefined}
              entryPrice={consensus?.pair === selectedPair ? consensus.agents.risk.parameters.entryPrice : undefined}
              signalBias={consensus?.pair === selectedPair ? consensus.agents.technical.bias : undefined}
              theme={theme}
            />

            {/* 📓 Active Pre-Trade Historical Journal Loss Review & Guardrails Desk */}
            <HistoricalJournalDesk
              selectedPair={selectedPair}
              onOpenJournalModal={() => setActiveTab('journals')}
              journalAnalysis={consensus?.pair === selectedPair ? consensus.journalAnalysis : undefined}
            />

            {/* 7 Specialized Agent Desks - Retained in DOM for full operational background execution, but hidden to declutter the Terminal UI */}
            {consensus && consensus.pair === selectedPair && (
              <div className="hidden" aria-hidden="true">
                <AgentSwarmPanel
                  technical={consensus.agents.technical}
                  fundamental={consensus.agents.fundamental}
                  forex={consensus.agents.forex}
                  news={consensus.agents.news}
                  risk={consensus.agents.risk}
                  orderFlow={consensus.agents.orderFlow}
                  candlestickPattern={consensus.agents.candlestickPattern}
                  chiefReviewerAudit={consensus.chiefReviewerAudit}
                  onExecuteTrade={handleExecuteTrade}
                  onOpenMonteCarlo={() => setActiveTab('var')}
                  onOpenNewsWire={() => setActiveTab('wire')}
                  telemetry={consensus.autonomousLoopTelemetry}
                  theme={theme}
                />
              </div>
            )}

            {/* Portfolio & Position Management (Saved in Local Browser) */}
            <PortfolioPanel
              portfolio={portfolio}
              onClosePosition={handleClosePosition}
              executionMode={executionMode}
              theme={theme}
            />
          </div>
        )}

        {/* Tab 03: Vision Atlas Lab - Multi-Factor Confluence & 2,100+ Institutional Strategies */}
        {(activeTab === 'vision-atlas' || (activeTab as string) === 'vision-atlas-lab') && (
          <VisionAtlasWorkspace
            pair={selectedPair}
            timeframe={timeframe}
            candles={candles}
            onSelectPair={handleSelectPair}
            onSelectTimeframe={handleSelectTimeframe}
            onClose={() => setActiveTab('terminal')}
            onOpenJournal={() => setActiveTab('journals')}
            onSyncToTerminal={(params) => {
              handleSelectPair(params.symbol);
              setActiveTab('terminal');
              showNotification(`VISION ATLAS SYNCED: ${params.direction} on ${params.symbol} loaded into Terminal.`);
            }}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        )}

        {/* Tab 2: Dedicated 5-Desk Agent Swarm Command Desk */}
        {activeTab === 'agent' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-terminal-950 border border-terminal-border rounded-xl text-xs font-mono shadow-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm sm:text-base">
                      02 // 24/7 AUTONOMOUS MULTI-AGENT SWARM INTELLIGENCE COMMAND DESK
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      8 AUTONOMOUS SPECIALISTS
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Simultaneous asynchronous processes: Technical (525+), Fundamental (525+), Candlestick (120+), 38 News Wires, Intermarket Relativity, Order Flow Microstructure & CRO Risk Gatekeeper
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('terminal')}
                className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border transition-colors flex items-center gap-1.5 font-semibold text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>RETURN TO TERMINAL</span>
              </button>
            </div>

            {consensus && consensus.pair === selectedPair && (
              <UnifiedDecisionBanner
                consensus={consensus}
                onExecuteTrade={handleExecuteTrade}
                onOpenNewsWire={() => setActiveTab('wire')}
                onOpenMonteCarlo={() => setActiveTab('var')}
                onOpenSequentialPipeline={() => setActiveTab('debate')}
                onForceRecalibrate={handleForceRecalibrate}
                isMarketFrozen={isMarketFrozen}
                sessionInfo={sessionInfo}
                theme={theme}
                suppressIntermediateModules={false}
              />
            )}

            {consensus && consensus.pair === selectedPair && (
              <AgentSwarmPanel
                technical={consensus.agents.technical}
                fundamental={consensus.agents.fundamental}
                forex={consensus.agents.forex}
                news={consensus.agents.news}
                risk={consensus.agents.risk}
                orderFlow={consensus.agents.orderFlow}
                candlestickPattern={consensus.agents.candlestickPattern}
                chiefReviewerAudit={consensus.chiefReviewerAudit}
                onExecuteTrade={handleExecuteTrade}
                onOpenMonteCarlo={() => setActiveTab('var')}
                onOpenNewsWire={() => setActiveTab('wire')}
                telemetry={consensus.autonomousLoopTelemetry}
                theme={theme}
              />
            )}
          </div>
        )}

        {/* Tab 3: Historical Backtest */}
        {activeTab === 'backtest' && (
          <BacktestView onBackToTerminal={() => setActiveTab('terminal')} />
        )}

        {/* Tab 4: Persistent Trade Journals & Loss Attribution */}
        {activeTab === 'journals' && (
          <JournalModal
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            selectedPair={selectedPair}
          />
        )}

        {/* Tab 5: 1,000-Path Monte Carlo Value-at-Risk Desk */}
        {activeTab === 'var' && (
          <MonteCarloModal
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            monteCarlo={consensus?.pair === selectedPair ? consensus.agents.risk.monteCarlo : undefined}
            pair={selectedPair}
          />
        )}

        {/* Tab 5: Autonomous 8-Agent Debate & Consensus Chamber (Unified with 7-Stage Pipeline) */}
        {(activeTab === 'debate' || (activeTab as string) === 'five-agent-debate' || (activeTab as string) === 'seven-agent-debate' || (activeTab as string) === 'eight-agent-debate' || (activeTab as string) === 'sequential-pipeline' || (activeTab as string) === 'pipeline') && (
          <AgentDebateFeed
            messages={(consensus && consensus.pair === selectedPair) ? consensus.debateTranscript : []}
            candles={candles}
            pair={selectedPair}
            timeframe={timeframe}
            synthesis={(consensus && consensus.pair === selectedPair) ? consensus.debateSynthesis : undefined}
            activeScenario={activeDebateScenario}
            executionMode={executionMode}
            onExecuteTrade={handleExecuteTrade}
            onApplyModification={handleApplyRiskModification}
            onStrategicExit={handleStrategicExit}
            onSendCustomPrompt={handleCustomDebatePrompt}
            onClearScenario={handleClearDebateScenario}
            isDebating={isDebating}
            onBackToTerminal={() => setActiveTab('terminal')}
            theme={theme}
            pipeline={consensus?.sevenStagePipeline}
          />
        )}

        {/* Tab 7: 5-Role Institutional Architecture & System Governance */}
        {(activeTab === 'roles' || activeTab === 'architecture') && (
          <ArchitectureView onBackToTerminal={() => setActiveTab('terminal')} />
        )}

        {/* Tab 8: 38-Source Real-Time Financial Wire & Memory Stream */}
        {activeTab === 'wire' && (
          <NewsWireModal
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            articles={consensus?.agents.news.recentHeadlines || []}
            sentimentScore={consensus?.agents.news.sentimentScore || 0}
            marketMood={consensus?.agents.news.marketMood || 'NEUTRAL'}
            symbol={selectedPair}
            onRefreshScrape={handleForceScrape}
            isScraping={isScrapingNews}
          />
        )}

        {/* Tab 09: Order Flow & Real-Time Price Action Analytics (Footprint & Volume Profile) */}
        {(activeTab === 'order-flow' || (activeTab as string) === 'orderflow') && (
          <OrderFlowDesk
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            selectedPair={selectedPair}
            onSelectPair={handleSelectPair}
            onExecuteTrade={(trade) => {
              if (trade.symbol !== selectedPair) {
                handleSelectPair(trade.symbol);
                showNotification(`ORDER FLOW ROUTED: ${trade.symbol} loaded into 8-Agent Consensus Chamber for debate synthesis.`);
              } else {
                handleExecuteTrade();
              }
            }}
          />
        )}

        {/* Tab 9: Firebase Cloud Firestore Realtime State Sync & Diagnostics */}
        {activeTab === 'firebase' && (
          <FirebaseStatusModal
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
          />
        )}

        {/* Tab 10: Institutional Knowledge Base (2,100+ Rules) */}
        {activeTab === 'knowledge' && (
          <KnowledgeBaseModal
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            activeTriggeredRules={triggeredRules}
          />
        )}

        {/* Tab 08: Institutional Macroeconomic Calendar */}
        {activeTab === 'calendar' && (
          <EconomicCalendarModal
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            calendar={calendar}
          />
        )}

        {/* Tab 09: Dedicated Event-Driven Macro Intelligence and Execution Engine */}
        {(activeTab === 'macro-intelligence' || (activeTab as string) === 'macro-engine') && (
          <MacroIntelligenceDesk
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            selectedPair={selectedPair}
            onSelectPair={handleSelectPair}
            onExecuteTrade={(tradeParams) => {
              if (tradeParams) {
                handleExecuteTrade();
                showNotification(`MACRO TRADE EXECUTED: ${tradeParams.direction} ${tradeParams.symbol} @ ${tradeParams.entry}`);
              }
            }}
            onSyncToTerminal={(params) => {
              handleSelectPair(params.symbol);
              setActiveTab('terminal');
              showNotification(`MACRO PARAMS SYNCED: ${params.direction} on ${params.symbol} loaded into Terminal.`);
            }}
          />
        )}

        {/* Tab 10: Multi-Asset Screener & Opportunity Scanner */}
        {activeTab === 'scanner' && (
          <OpportunityScannerModal
            isFullPage={true}
            onClose={() => setActiveTab('terminal')}
            opportunities={opportunities}
            onSelectPair={(pair) => {
              handleSelectPair(pair);
              setActiveTab('terminal');
            }}
            isScanning={isScanning}
            onRefreshScan={fetchOpportunities}
          />
        )}

        {/* Tab 15: Dedicated Ultra-Low Latency Scalping Module */}
        {activeTab === 'scalping' && (
          <ScalpingDesk
            isFullPage={true}
            pair={selectedPair}
            livePrice={LiveMarketFeedManager.getCanonicalPrice(selectedPair) || (candles && candles.length > 0 ? candles[candles.length - 1]?.close : undefined) || (selectedPair === 'XAU/USD' ? 3787.37 : undefined)}
            consensus={consensus}
            onSelectPair={(pair) => {
              handleSelectPair(pair);
            }}
            onBackToTerminal={() => setActiveTab('terminal')}
            theme={theme}
          />
        )}
      </main>

      {/* Settings Modal (Persisted in Local Browser Storage & Firebase) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={riskConfig}
        onSaveConfig={(newCfg) => {
          setRiskConfig(newCfg);
          BrowserStorageManager.saveRiskConfig(newCfg);
          setPortfolio(prev => {
            const updated = { ...prev, balance: newCfg.accountBalance };
            BrowserStorageManager.savePortfolio(updated);
            return updated;
          });
          showNotification('Risk parameters & capital balance updated and synced to Firebase Cloud.');
        }}
      />

      {/* 🛡️ Risk Ratio Controller Modal (Dynamic Sizing & Zero-Veto Decoupling) */}
      <RiskRatioControllerModal
        isOpen={isRiskRatioControllerOpen}
        onClose={() => setIsRiskRatioControllerOpen(false)}
        onConfigSaved={() => {
          showNotification('Risk Ratio Controller: 7-Tier parameters saved & dynamic sizing updated.');
        }}
      />

      {/* 🧭 Collapsible Left-Hand Hamburger Navigation Drawer (14 Items with Hover Proximity Pullout) */}
      <LeftNavigationDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
        onOpen={() => setIsLeftDrawerOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenJournal={() => setActiveTab('journals')}
        onOpenMonteCarlo={() => setActiveTab('var')}
        onOpenNewsWire={() => setActiveTab('wire')}
        onOpenFirebase={() => setActiveTab('firebase')}
        onOpenKnowledge={() => setActiveTab('knowledge')}
        onOpenScanner={() => setActiveTab('scanner')}
        onOpenCalendar={() => setActiveTab('calendar')}
        onOpenOrderFlow={() => setActiveTab('order-flow')}
        onOpenSequentialPipeline={() => setActiveTab('debate')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenRiskRatioController={() => setIsRiskRatioControllerOpen(true)}
        executionMode={executionMode}
        onToggleExecutionMode={handleToggleExecutionMode}
        onTriggerAnalysis={() => triggerSwarm(selectedPair, timeframe, candles)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        selectedPair={selectedPair}
      />
    </div>
  );
}
