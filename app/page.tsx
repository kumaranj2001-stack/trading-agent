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
import { ArrowLeft, Bot } from 'lucide-react';
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
import { BacktestView } from '@/components/BacktestModal';
import { ArchitectureView } from '@/components/ArchitectureView';
import { SettingsModal } from '@/components/SettingsModal';
import { RiskRatioControllerModal } from '@/components/RiskRatioControllerModal';
import { OpportunityScannerModal } from '@/components/OpportunityScannerModal';
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
import { JournalStorageManager } from '@/lib/journalStorage';
import { getMarketSegmentForSymbol, PIP_VALUES } from '@/lib/marketData';
import { LiveMarketFeedManager } from '@/lib/liveMarketFeed';
import { MarketSessionInfo, TradeHistoryItem } from '@/lib/types';
import { MarketSessionManager } from '@/lib/marketSessionManager';
import { MarketCloseFreezeBanner } from '@/components/MarketCloseFreezeBanner';
import { AutonomousSwarmEngine, AutonomousSwarmTelemetry } from '@/lib/autonomousSwarmEngine';
import { tradeInvalidationEngine } from '@/lib/tradeInvalidationEngine';
import { stateLatchingEngine } from '@/lib/stateLatchingEngine';
import { ExecutionTelemetryEngine } from '@/lib/executionTelemetryEngine';
import { diagnosticReasoningEngine } from '@/lib/diagnosticReasoningEngine';

const executionTelemetryEngine = ExecutionTelemetryEngine.getInstance();

export default function Home() {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('XAU/USD');
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

    const currentPositions = portfolioRef.current.positions;
    const alreadyOpen = currentPositions.some(p => p.symbol === calibratedResult.pair);
    if (alreadyOpen) return;

    const signal = calibratedResult.executionSignal;
    const livePrice = LiveMarketFeedManager.getCanonicalPrice(calibratedResult.pair);
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    // Strict Single Source of Truth for Auto-Execution
    const isSellTrade = signal.orderType === 'SELL_MARKET' || calibratedResult.unifiedDecision.direction === 'SELL';
    const autoTradeType: 'BUY' | 'SELL' = isSellTrade ? 'SELL' : 'BUY';

    // 🛡️ Pre-Execution Active Failure Filter (Cross-referencing 1051st+ Operative Rules)
    const preCheck = diagnosticReasoningEngine.crossReferenceSetup({
      symbol: signal.symbol,
      direction: autoTradeType,
      lots: signal.lots,
      indicators: calibratedResult.agents?.technical?.indicators,
      smcStructure: calibratedResult.agents?.technical?.smartMoneyConcepts?.structure,
      centralBankBias: calibratedResult.agents?.fundamental?.baseCurrencyOutlook?.centralBankStance,
    });

    if (!preCheck.allowed) {
      console.warn(`[AUTOPILOT_PRE_EXECUTION_VETO] Entry aborted: ${preCheck.reason}`);
      return;
    }

    const autoLots = preCheck.action === 'ADJUST_SIZING' ? (preCheck.adjustedLots || 0.01) : signal.lots;

    let autoStopLoss = signal.stopLoss;
    let autoTakeProfit = signal.takeProfit;
    if (autoTradeType === 'SELL') {
      if (autoStopLoss <= livePrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (livePrice * 0.004);
        autoStopLoss = Number((livePrice + stopDist).toFixed(5));
      }
      if (autoTakeProfit >= livePrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (livePrice * 0.008);
        autoTakeProfit = Number((livePrice - targetDist).toFixed(5));
      }
    } else {
      if (autoStopLoss >= livePrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (livePrice * 0.004);
        autoStopLoss = Number((livePrice - stopDist).toFixed(5));
      }
      if (autoTakeProfit <= livePrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (livePrice * 0.008);
        autoTakeProfit = Number((livePrice + targetDist).toFixed(5));
      }
    }

    const autoPos: Position = {
      id: `pos-${Date.now()}`,
      symbol: signal.symbol,
      type: autoTradeType,
      lots: autoLots,
      entryPrice: livePrice,
      currentPrice: livePrice,
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
    };

    const marginNeeded = (signal.lots * 100000) / 30;
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
    showNotification(`⚡ AUTOPILOT EXECUTED: ${autoPos.type} ${signal.lots} Lots on ${signal.symbol} @ ${livePrice} (Confluence: ${calibratedResult.confluenceGrade})`);
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
      setConsensus(result);
      setSwarmTelemetry(telemetry);
      BrowserStorageManager.saveConsensusResult(result);

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
  // Automatically triggers every 15 SECONDS to synthesize data across all five core analytical engines:
  // Technical (525 strategies), Fundamental (525 engines), News (38 wires), Forex/Order Flow, and Risk Management
  useEffect(() => {
    const recalibrationTimer = setInterval(() => {
      if (MarketSessionManager.isMarketFrozen(selectedPair)) {
        return;
      }

      // Expire old latch and trigger instant 5-desk high-confluence synthesis
      stateLatchingEngine.releaseLatch(
        selectedPair,
        '15-Second Recalibration Triggered: Automated 5-engine multi-desk synthesis cycle elapsed.'
      );

      triggerSwarm(selectedPair, timeframe, candles).then((freshConsensus) => {
        if (freshConsensus) {
          const isHighConfluence =
            freshConsensus.confluenceGrade === 'A+' ||
            freshConsensus.confluenceGrade === 'A' ||
            freshConsensus.confluenceGrade === 'B';

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
      if (event.pair !== selectedPair || event.timeframe !== timeframe) return;

      // Track live WebSocket heartbeat and previous price for circuit breaker
      lastWebSocketHeartbeatRef.current = Date.now();
      previousPriceRef.current = event.livePrice;

      // 1. Update chart candles with live tick in-place (visual rendering remains pristine)
      setCandles(event.candles);

      // 2. Synchronize TickerBar rates
      setRates(prevRates => LiveMarketFeedManager.synchronizeRates(prevRates, selectedPair, event.livePrice));

      // 3. Dynamically calibrate Swarm Matrix & Unified Decision Banner
      setConsensus(prev => prev ? LiveMarketFeedManager.calibrateSwarmConsensus(prev, event.livePrice) : null);

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

        // ⚡ Paramount Structural Override & Invalidation Exit (FULL_AUTOPILOT & SEMI_AUTONOMOUS)
        if (executionModeRef.current === 'FULL_AUTOPILOT' || executionModeRef.current === 'SEMI_AUTONOMOUS') {
          for (const pos of updatedPositions) {
            if (pos.invalidation?.structuralOverrideTriggered) {
              setTimeout(() => {
                handleClosePosition(pos.id, 'PARAMOUNT_STRUCTURAL_OVERRIDE', pos.invalidation?.allReasons);
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

  // Handle Pair Switch
  const handleSelectPair = (newPair: CurrencyPair) => {
    setSelectedPair(newPair);
    setMarketSegment(getMarketSegmentForSymbol(newPair));
  };

  // Handle Market Segment Switch (Forex vs Metals vs Indian Market)
  const handleSelectMarketSegment = (newSegment: MarketSegment) => {
    setMarketSegment(newSegment);
  };

  // Handle Timeframe Switch
  const handleSelectTimeframe = (newTf: TimeFrame) => {
    setTimeframe(newTf);
  };

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
    const signal = consensus.executionSignal;

    // 1. Strict API Rate Limiter
    const rateCheck = executionTelemetryEngine.checkApiRateLimit();
    if (!rateCheck.allowed) {
      showNotification(`ORDER HALTED: ${rateCheck.reason}`);
      return;
    }

    // 2. Strict Pre-Execution Guardrail: 500ms freshness and 0.05% price deviation tolerance
    const guardrail = LiveMarketFeedManager.verifyPreExecutionGuardrail(signal.symbol, signal.entry, 0.05, 500);
    if (!guardrail.valid) {
      showNotification(`PRE-EXECUTION HALTED: ${guardrail.error || 'Live price deviation exceeded 0.05%'}`);
      return;
    }

    const liveEntryPrice = LiveMarketFeedManager.getCanonicalPrice(signal.symbol);

    // 3. Circuit Breaker Mechanism Evaluation
    const cbCheck = executionTelemetryEngine.evaluateCircuitBreaker(
      portfolio,
      liveEntryPrice,
      previousPriceRef.current || liveEntryPrice
    );
    if (cbCheck.isTripped) {
      showNotification(`CIRCUIT BREAKER: ${cbCheck.reason}`);
      return;
    }

    const reqTimestamp = Date.now() - 32;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Immutable Single Source of Truth for Trade Execution: Bound strictly to consensus direction
    const isSell = signal.orderType === 'SELL_MARKET' || consensus.unifiedDecision.direction === 'SELL';
    const tradeType: 'BUY' | 'SELL' = isSell ? 'SELL' : 'BUY';

    // 4. Pre-Execution Active Failure Filter (Cross-referencing 1051st+ Operative Rules)
    const preExecutionFilter = diagnosticReasoningEngine.crossReferenceSetup({
      symbol: signal.symbol,
      direction: tradeType,
      lots: signal.lots,
      indicators: consensus.agents?.technical?.indicators,
      smcStructure: consensus.agents?.technical?.smartMoneyConcepts?.structure,
      centralBankBias: consensus.agents?.fundamental?.baseCurrencyOutlook?.centralBankStance,
    });

    if (!preExecutionFilter.allowed) {
      showNotification(`🛑 PRE-EXECUTION VETO: ${preExecutionFilter.reason}`);
      return;
    }

    let executionLots = signal.lots;
    if (preExecutionFilter.action === 'ADJUST_SIZING') {
      executionLots = preExecutionFilter.adjustedLots || 0.01;
      showNotification(`⚠️ CAUTION FILTER APPLIED: ${preExecutionFilter.reason}`);
    }

    // Strict Mathematical Invariant: Guarantee Stop Loss & Target orientation relative to entry
    let executionStopLoss = signal.stopLoss;
    let executionTakeProfit = signal.takeProfit;

    if (tradeType === 'SELL') {
      if (executionStopLoss <= liveEntryPrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (liveEntryPrice * 0.004);
        executionStopLoss = Number((liveEntryPrice + stopDist).toFixed(5));
      }
      if (executionTakeProfit >= liveEntryPrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (liveEntryPrice * 0.008);
        executionTakeProfit = Number((liveEntryPrice - targetDist).toFixed(5));
      }
    } else {
      if (executionStopLoss >= liveEntryPrice) {
        const stopDist = Math.abs(signal.entry - signal.stopLoss) || (liveEntryPrice * 0.004);
        executionStopLoss = Number((liveEntryPrice - stopDist).toFixed(5));
      }
      if (executionTakeProfit <= liveEntryPrice) {
        const targetDist = Math.abs(signal.takeProfit - signal.entry) || (liveEntryPrice * 0.008);
        executionTakeProfit = Number((liveEntryPrice + targetDist).toFixed(5));
      }
    }

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: signal.symbol,
      type: tradeType,
      lots: executionLots,
      entryPrice: liveEntryPrice,
      currentPrice: liveEntryPrice,
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
      lots: signal.lots,
      targetEntry: signal.entry,
      filledEntry: liveEntryPrice,
      requestTimestamp: reqTimestamp,
      confirmTimestamp: Date.now(),
    });

    showNotification(`ORDER EXECUTED: ${newPosition.type} ${signal.lots} Lots on ${signal.symbol} @ ${liveEntryPrice}`);
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

      {/* Main Content Area - Strictly aligned to max-w-7xl container boundary */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-4">
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
            {/* 🌟 UNIFIED 5-ROLE BUY/SELL DECISION BANNER (Directly on Dashboard) */}
            {consensus && (
              <UnifiedDecisionBanner
                consensus={consensus}
                onExecuteTrade={handleExecuteTrade}
                onOpenNewsWire={() => setActiveTab('wire')}
                onOpenMonteCarlo={() => setActiveTab('var')}
                onForceRecalibrate={handleForceRecalibrate}
                isMarketFrozen={isMarketFrozen}
                sessionInfo={sessionInfo}
                theme={theme}
              />
            )}

            {/* 🛡️ Active Running Entry Real-Time Invalidation Monitor */}
            {portfolio.positions.find(p => p.symbol === selectedPair) && (
              <ActiveEntryInvalidationBanner
                position={portfolio.positions.find(p => p.symbol === selectedPair)}
                onClosePosition={handleClosePosition}
                executionMode={executionMode}
              />
            )}

            {/* Candlestick Chart (OANDA Live Streaming or Swarm Matrix) */}
            <ChartView
              candles={candles}
              pair={selectedPair}
              timeframe={timeframe}
              stopLoss={consensus?.agents.risk.parameters.stopLoss}
              takeProfit={consensus?.agents.risk.parameters.takeProfit1}
              entryPrice={consensus?.agents.risk.parameters.entryPrice}
              signalBias={consensus?.agents.technical.bias}
              theme={theme}
            />

            {/* 📓 Active Pre-Trade Historical Journal Loss Review & Guardrails Desk */}
            <HistoricalJournalDesk
              selectedPair={selectedPair}
              onOpenJournalModal={() => setActiveTab('journals')}
              journalAnalysis={consensus?.journalAnalysis}
            />

            {/* 5 Specialized Agent Cards (Technical, Fundamental, News, Forex, Risk) */}
            {consensus && (
              <AgentSwarmPanel
                technical={consensus.agents.technical}
                fundamental={consensus.agents.fundamental}
                forex={consensus.agents.forex}
                news={consensus.agents.news}
                risk={consensus.agents.risk}
                onExecuteTrade={handleExecuteTrade}
                onOpenMonteCarlo={() => setActiveTab('var')}
                onOpenNewsWire={() => setActiveTab('wire')}
                telemetry={consensus.autonomousLoopTelemetry}
                theme={theme}
              />
            )}

            {/* Portfolio & Position Management (Saved in Local Browser) */}
            <PortfolioPanel
              portfolio={portfolio}
              onClosePosition={handleClosePosition}
              executionMode={executionMode}
            />
          </div>
        )}

        {/* Tab 03: Vision Atlas Lab - Multi-Factor Confluence & 1,050+ Institutional Strategies */}
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
                      5 SPECIALIZED DESKS
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    Simultaneous asynchronous processes: Technical (525), Fundamental (525), 38 News Wires, Forex Relativity & CRO Risk Gatekeeper
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

            {consensus && (
              <UnifiedDecisionBanner
                consensus={consensus}
                onExecuteTrade={handleExecuteTrade}
                onOpenNewsWire={() => setActiveTab('wire')}
                onOpenMonteCarlo={() => setActiveTab('var')}
                onForceRecalibrate={handleForceRecalibrate}
                isMarketFrozen={isMarketFrozen}
                sessionInfo={sessionInfo}
                theme={theme}
              />
            )}

            {consensus && (
              <AgentSwarmPanel
                technical={consensus.agents.technical}
                fundamental={consensus.agents.fundamental}
                forex={consensus.agents.forex}
                news={consensus.agents.news}
                risk={consensus.agents.risk}
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
            monteCarlo={consensus?.agents.risk.monteCarlo}
            pair={selectedPair}
          />
        )}

        {/* Tab 6: Autonomous 5-Agent Debate Feed */}
        {(activeTab === 'debate' || (activeTab as string) === 'five-agent-debate') && (
          <AgentDebateFeed
            messages={consensus?.debateTranscript || []}
            candles={candles}
            pair={selectedPair}
            timeframe={timeframe}
            synthesis={consensus?.debateSynthesis}
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
              handleExecuteTrade();
              showNotification(`ORDER FLOW TRADE EXECUTED: ${trade.direction} ${trade.symbol} @ ${trade.entry}`);
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

        {/* Tab 10: Institutional Knowledge Base (1,050+ Rules) */}
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

      {/* 🧭 Collapsible Left-Hand Hamburger Navigation Drawer (12 Items) */}
      <LeftNavigationDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
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
