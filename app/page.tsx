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
  DebatePriceThresholds 
} from '@/lib/types';
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
import { BacktestView } from '@/components/BacktestModal';
import { ArchitectureView } from '@/components/ArchitectureView';
import { SettingsModal } from '@/components/SettingsModal';
import { OpportunityScannerModal } from '@/components/OpportunityScannerModal';
import { EconomicCalendarModal } from '@/components/EconomicCalendarModal';
import { MonteCarloModal } from '@/components/MonteCarloModal';
import { KnowledgeBaseModal } from '@/components/KnowledgeBaseModal';
import { NewsWireModal } from '@/components/NewsWireModal';
import { FirebaseStatusModal } from '@/components/FirebaseStatusModal';
import { LeftNavigationDrawer } from '@/components/LeftNavigationDrawer';
import { JournalModal } from '@/components/JournalModal';
import { HistoricalJournalDesk } from '@/components/HistoricalJournalDesk';
import { JournalStorageManager } from '@/lib/journalStorage';
import { getMarketSegmentForSymbol, PIP_VALUES } from '@/lib/marketData';
import { LiveMarketFeedManager } from '@/lib/liveMarketFeed';
import { MarketSessionInfo } from '@/lib/types';
import { MarketSessionManager } from '@/lib/marketSessionManager';
import { MarketCloseFreezeBanner } from '@/components/MarketCloseFreezeBanner';

export default function Home() {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('XAU/USD');
  const [marketSegment, setMarketSegment] = useState<MarketSegment>('METALS_COMMODITIES');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [sessionInfo, setSessionInfo] = useState<MarketSessionInfo | null>(null);
  const [isMarketFrozen, setIsMarketFrozen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'terminal' | 'debate' | 'backtest' | 'architecture'>('terminal');
  
  // Market Data state
  const [candles, setCandles] = useState<Candle[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<MacroIndicator[]>([]);
  const [activeSession, setActiveSession] = useState<string>('LONDON_NY_OVERLAP');

  // Swarm State (5 Specialized Roles)
  const [consensus, setConsensus] = useState<SwarmConsensusResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDebating, setIsDebating] = useState<boolean>(false);

  // Modals & Tools
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('MANUAL');
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = useState<boolean>(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState<boolean>(false);
  const [isNewsWireOpen, setIsNewsWireOpen] = useState<boolean>(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
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

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
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

  // 4. Trigger 5-Agent Swarm (calibrating strictly against Canonical Chart Feed)
  const triggerSwarm = useCallback(async (pair: CurrencyPair, tf: TimeFrame, currentCandles?: Candle[]) => {
    setIsAnalyzing(true);
    try {
      const chartCandles = currentCandles && currentCandles.length > 0 
        ? currentCandles 
        : LiveMarketFeedManager.getCanonicalCandles(pair, tf);

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair,
          timeframe: tf,
          riskConfig: riskConfigRef.current,
          candles: chartCandles.length > 0 ? chartCandles : undefined,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const livePrice = LiveMarketFeedManager.getCanonicalPrice(pair);
        const calibratedResult = LiveMarketFeedManager.calibrateSwarmConsensus(json.data, livePrice);
        setConsensus(calibratedResult);
        BrowserStorageManager.saveConsensusResult(calibratedResult);

        // Autopilot Execution Check
        if (executionModeRef.current === 'FULL_AUTOPILOT' && calibratedResult.executionSignal.authorized) {
          const currentPositions = portfolioRef.current.positions;
          const alreadyOpen = currentPositions.some(p => p.symbol === calibratedResult.pair);
          
          if (!alreadyOpen) {
            const signal = calibratedResult.executionSignal;
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            // Strict Single Source of Truth for Auto-Execution
            const isSellTrade = signal.orderType === 'SELL_MARKET' || calibratedResult.unifiedDecision.direction === 'SELL';
            const autoTradeType: 'BUY' | 'SELL' = isSellTrade ? 'SELL' : 'BUY';

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
              lots: signal.lots,
              entryPrice: livePrice,
              currentPrice: livePrice,
              stopLoss: autoStopLoss,
              takeProfit: autoTakeProfit,
              openTime: timeStr,
              pnl: 0,
              pnlPercent: 0,
              riskReward: signal.riskReward,
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

            showNotification(`AUTOPILOT TRIGGERED: ${autoPos.type} ${signal.lots} Lots on ${signal.symbol} @ ${livePrice} (Confluence: ${calibratedResult.confluenceGrade})`);
          }
        }
      }
    } catch (e) {
      console.error('Swarm analysis error:', e);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // 5. Initial load and target symbol switch listener
  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      await fetchMarketData(selectedPair, timeframe);
      if (!isCancelled) {
        await triggerSwarm(selectedPair, timeframe);
      }
    };
    load();
    fetchOpportunities();
    return () => {
      isCancelled = true;
    };
  }, [selectedPair, timeframe, fetchMarketData, triggerSwarm, fetchOpportunities]);

  // 6. Unidirectional Live Market Data Feed Engine (Single Source of Truth)
  useEffect(() => {
    // Start authoritative real-time live ticker on the chart feed (every 1.5s)
    const stopTicker = LiveMarketFeedManager.startLiveFeed(selectedPair, timeframe, 1500);

    const unsubscribe = LiveMarketFeedManager.subscribe((event) => {
      if (event.pair !== selectedPair || event.timeframe !== timeframe) return;

      // 1. Update chart candles with live tick in-place (visual rendering remains pristine)
      setCandles(event.candles);

      // 2. Synchronize TickerBar rates
      setRates(prevRates => LiveMarketFeedManager.synchronizeRates(prevRates, selectedPair, event.livePrice));

      // 3. Dynamically calibrate Swarm Matrix & Unified Decision Banner
      setConsensus(prev => prev ? LiveMarketFeedManager.calibrateSwarmConsensus(prev, event.livePrice) : null);

      // 4. Dynamically calibrate active position values and P&L
      setPortfolio(prev => {
        const { positions: updatedPositions, totalOpenPnl, hasChanged } = 
          LiveMarketFeedManager.calibratePositions(prev.positions, (sym) => {
            if (sym === selectedPair) return event.livePrice;
            return LiveMarketFeedManager.getCanonicalPrice(sym);
          });
        if (!hasChanged) return prev;
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

    // Strict Pre-Execution Guardrail: 500ms freshness and 0.05% price deviation tolerance
    const guardrail = LiveMarketFeedManager.verifyPreExecutionGuardrail(signal.symbol, signal.entry, 0.05, 500);
    if (!guardrail.valid) {
      showNotification(`PRE-EXECUTION HALTED: ${guardrail.error || 'Live price deviation exceeded 0.05%'}`);
      return;
    }

    const liveEntryPrice = LiveMarketFeedManager.getCanonicalPrice(signal.symbol);

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Immutable Single Source of Truth for Trade Execution: Bound strictly to consensus direction
    const isSell = signal.orderType === 'SELL_MARKET' || consensus.unifiedDecision.direction === 'SELL';
    const tradeType: 'BUY' | 'SELL' = isSell ? 'SELL' : 'BUY';

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
      lots: signal.lots,
      entryPrice: liveEntryPrice,
      currentPrice: liveEntryPrice,
      stopLoss: executionStopLoss,
      takeProfit: executionTakeProfit,
      openTime: timeStr,
      pnl: 0,
      pnlPercent: 0,
      riskReward: signal.riskReward,
    };

    const marginUsedForTrade = (signal.lots * 100000) / 30;
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

    showNotification(`ORDER EXECUTED: ${newPosition.type} ${signal.lots} Lots on ${signal.symbol} @ ${liveEntryPrice}`);
  };

  // Close Position & Save to Local Browser Storage (calibrated against live chart feed)
  const handleClosePosition = (posId: string) => {
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

    const historyItem = {
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
      strategyNotes: `Position closed at ${liveExitPrice}. Realized P&L: $${finalPnl.toFixed(2)}.`,
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

    // 📓 Persistent Trading Journal: Auto-log trade outcome, exit price & realized P&L
    JournalStorageManager.recordTradeClose(pos.id, liveExitPrice, finalPnl);

    showNotification(`CLOSED POSITION: ${pos.symbol} @ ${liveExitPrice} | Realized P&L: ${finalPnl >= 0 ? '+' : ''}$${finalPnl.toFixed(2)}`);
  };

  const triggeredRules: KnowledgeRule[] = consensus ? consensus.knowledgeSummary.topConfluenceRules : [];

  return (
    <div className="min-h-screen flex flex-col bg-terminal-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
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
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenNewsWire={() => setIsNewsWireOpen(true)}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* ❄️ Global State Freeze upon Market Closure Banner */}
        <MarketCloseFreezeBanner
          sessionInfo={sessionInfo}
          onToggleManualOverride={(override) => {
            const frozen = !override && MarketSessionManager.isMarketFrozen(selectedPair);
            setIsMarketFrozen(frozen);
            showNotification(frozen ? '❄️ State re-frozen.' : '🟢 State temporarily unfrozen for simulation.');
          }}
        />

        {/* Tab 1: Terminal */}
        {activeTab === 'terminal' && (
          <div className="space-y-4">
            {/* 🌟 UNIFIED 5-ROLE BUY/SELL DECISION BANNER (Directly on Dashboard) */}
            {consensus && (
              <UnifiedDecisionBanner
                consensus={consensus}
                onExecuteTrade={handleExecuteTrade}
                onOpenNewsWire={() => setIsNewsWireOpen(true)}
                onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
                isMarketFrozen={isMarketFrozen}
                sessionInfo={sessionInfo}
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
            />

            {/* 📓 Active Pre-Trade Historical Journal Loss Review & Guardrails Desk */}
            <HistoricalJournalDesk
              selectedPair={selectedPair}
              onOpenJournalModal={() => setIsJournalOpen(true)}
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
                onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
                onOpenNewsWire={() => setIsNewsWireOpen(true)}
              />
            )}

            {/* Portfolio & Position Management (Saved in Local Browser) */}
            <PortfolioPanel
              portfolio={portfolio}
              onClosePosition={handleClosePosition}
            />
          </div>
        )}

        {/* Tab 2: Autonomous 5-Agent Debate Feed */}
        {activeTab === 'debate' && (
          <AgentDebateFeed
            messages={consensus?.debateTranscript || []}
            candles={candles}
            pair={selectedPair}
            timeframe={timeframe}
            synthesis={consensus?.debateSynthesis}
            activeScenario={activeDebateScenario}
            onExecuteTrade={handleExecuteTrade}
            onApplyModification={handleApplyRiskModification}
            onStrategicExit={handleStrategicExit}
            onSendCustomPrompt={handleCustomDebatePrompt}
            onClearScenario={handleClearDebateScenario}
            isDebating={isDebating}
          />
        )}

        {/* Tab 3: Historical Backtest */}
        {activeTab === 'backtest' && (
          <BacktestView />
        )}

        {/* Tab 4: 5-Role Architecture & Local Storage */}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

      {/* Real-Time Financial Scraper & News Wire Modal (38 Sources) */}
      <NewsWireModal
        isOpen={isNewsWireOpen}
        onClose={() => setIsNewsWireOpen(false)}
        articles={consensus?.agents.news.recentHeadlines || []}
        sentimentScore={consensus?.agents.news.sentimentScore || 0}
        marketMood={consensus?.agents.news.marketMood || 'NEUTRAL'}
        symbol={selectedPair}
        onRefreshScrape={handleForceScrape}
        isScraping={isScrapingNews}
      />

      {/* Institutional Knowledge Base Explorer Modal */}
      <KnowledgeBaseModal
        isOpen={isKnowledgeOpen}
        onClose={() => setIsKnowledgeOpen(false)}
        activeTriggeredRules={triggeredRules}
      />

      {/* Opportunity Scanner Modal */}
      <OpportunityScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        opportunities={opportunities}
        onSelectPair={handleSelectPair}
        isScanning={isScanning}
        onRefreshScan={fetchOpportunities}
      />

      {/* High-Impact Economic Calendar Modal */}
      <EconomicCalendarModal
        isOpen={isCalendarOpen}
        onClose={() => setIsCalendarOpen(false)}
        calendar={calendar}
      />

      {/* Monte Carlo VaR Simulation Modal */}
      <MonteCarloModal
        isOpen={isMonteCarloOpen}
        onClose={() => setIsMonteCarloOpen(false)}
        monteCarlo={consensus?.agents.risk.monteCarlo}
        pair={selectedPair}
      />

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

      {/* Firebase Cloud Firestore Diagnostic Modal */}
      <FirebaseStatusModal
        isOpen={isFirebaseModalOpen}
        onClose={() => setIsFirebaseModalOpen(false)}
      />

      {/* 🧭 Collapsible Left-Hand Hamburger Navigation Drawer (12 Items) */}
      <LeftNavigationDrawer
        isOpen={isLeftDrawerOpen}
        onClose={() => setIsLeftDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenJournal={() => setIsJournalOpen(true)}
        onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
        onOpenNewsWire={() => setIsNewsWireOpen(true)}
        onOpenFirebase={() => setIsFirebaseModalOpen(true)}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        executionMode={executionMode}
        onToggleExecutionMode={handleToggleExecutionMode}
        onTriggerAnalysis={() => triggerSwarm(selectedPair, timeframe, candles)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        selectedPair={selectedPair}
      />

      {/* 📓 Persistent Trading Journal & Loss Attribution Modal */}
      <JournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        selectedPair={selectedPair}
      />
    </div>
  );
}
