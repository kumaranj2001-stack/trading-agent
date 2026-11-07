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
  KnowledgeRule 
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
import { JournalMemoryFeed } from '@/components/JournalMemoryFeed';
import { TradingJournalModal } from '@/components/TradingJournalModal';
import { PersistentTradingJournal } from '@/lib/journalStorage';
import { JournalMetrics, JournalTradeEntry } from '@/lib/types';
import { getMarketSegmentForSymbol, PIP_VALUES } from '@/lib/marketData';

export default function Home() {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('XAU/USD');
  const [marketSegment, setMarketSegment] = useState<MarketSegment>('METALS_COMMODITIES');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
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
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = useState<boolean>(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState<boolean>(false);
  const [isNewsWireOpen, setIsNewsWireOpen] = useState<boolean>(false);
  const [isScrapingNews, setIsScrapingNews] = useState<boolean>(false);
  const [opportunities, setOpportunities] = useState<MarketScannerOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isJournalOpen, setIsJournalOpen] = useState<boolean>(false);
  const [journalEntries, setJournalEntries] = useState<JournalTradeEntry[]>([]);
  const [journalMetrics, setJournalMetrics] = useState<JournalMetrics>(PersistentTradingJournal.getMetrics());

  // Portfolio State (Backed by Local Browser Storage)
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

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4500);
  };

  // 1. Initial Load from Local Browser Storage
  useEffect(() => {
    const savedPortfolio = BrowserStorageManager.loadPortfolio();
    setPortfolio(savedPortfolio);
    const savedRisk = BrowserStorageManager.loadRiskConfig();
    setRiskConfig(savedRisk);
    const savedMode = BrowserStorageManager.loadExecutionMode();
    setExecutionMode(savedMode);
    const savedJournal = PersistentTradingJournal.loadEntries();
    setJournalEntries(savedJournal);
    setJournalMetrics(PersistentTradingJournal.getMetrics());
  }, []);

  // 2. Fetch market data & rates
  const fetchMarketData = useCallback(async (pair: CurrencyPair, tf: TimeFrame) => {
    try {
      const res = await fetch(`/api/market?pair=${encodeURIComponent(pair)}&timeframe=${tf}&count=60`);
      const json = await res.json();
      if (json.success && json.data) {
        setCandles(json.data.candles || []);
        setRates(json.data.rates || []);
        setCalendar(json.data.calendar || []);
        if (json.data.activeSession?.session) {
          setActiveSession(json.data.activeSession.session);
        }

        // Live update active position P&L from latest rates
        if (json.data.rates && Array.isArray(json.data.rates)) {
          const rateMap = new Map<string, number>();
          json.data.rates.forEach((r: any) => rateMap.set(r.pair, r.price));

          setPortfolio(prev => {
            let hasChanged = false;
            const updatedPositions = prev.positions.map(pos => {
              const currentLivePrice = rateMap.get(pos.symbol);
              if (!currentLivePrice || currentLivePrice === pos.currentPrice) return pos;

              hasChanged = true;
              const isJpy = pos.symbol.includes('JPY');
              const isGold = pos.symbol === 'XAU/USD';
              const pipVal = PIP_VALUES[pos.symbol] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);
              const pipDollar = isGold ? 10 : 10;
              const pipDiff = pos.type === 'BUY' 
                ? (currentLivePrice - pos.entryPrice) / pipVal
                : (pos.entryPrice - currentLivePrice) / pipVal;

              const pnl = Number((pipDiff * pipDollar * pos.lots).toFixed(2));
              const pnlPercent = Number(((pnl / (pos.lots * 1000)) * 100).toFixed(2));

              return {
                ...pos,
                currentPrice: currentLivePrice,
                pnl,
                pnlPercent,
              };
            });

            if (!hasChanged) return prev;
            const newPortfolio = {
              ...prev,
              positions: updatedPositions,
            };
            BrowserStorageManager.savePortfolio(newPortfolio);
            return newPortfolio;
          });
        }
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

  // 4. Trigger 5-Agent Swarm (Technical + Fundamental + Forex + News + Risk)
  const triggerSwarm = useCallback(async (pair: CurrencyPair, tf: TimeFrame, currentCandles?: Candle[]) => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair,
          timeframe: tf,
          riskConfig: riskConfigRef.current,
          candles: currentCandles,
        }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        const result: SwarmConsensusResult = json.data;
        setConsensus(result);
        BrowserStorageManager.saveConsensusResult(result);

        // Autopilot Execution Check
        if (executionModeRef.current === 'FULL_AUTOPILOT' && result.executionSignal.authorized) {
          const currentPositions = portfolioRef.current.positions;
          const alreadyOpen = currentPositions.some(p => p.symbol === result.pair);
          
          if (!alreadyOpen) {
            const signal = result.executionSignal;
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const autoPos: Position = {
              id: `pos-${Date.now()}`,
              symbol: signal.symbol,
              type: signal.orderType === 'BUY_MARKET' ? 'BUY' : 'SELL',
              lots: signal.lots,
              entryPrice: signal.entry,
              currentPrice: signal.entry,
              stopLoss: signal.stopLoss,
              takeProfit: signal.takeProfit,
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

            // Automatically log entry to Persistent Trading Journal
            PersistentTradingJournal.logTradeEntry({
              positionId: autoPos.id,
              symbol: signal.symbol,
              marketSegment: result.marketSegment,
              direction: autoPos.type,
              entryPrice: signal.entry,
              lots: signal.lots,
              units: Math.round(signal.lots * 100000),
              initialStopLoss: signal.stopLoss,
              initialTakeProfit: signal.takeProfit,
              plannedRiskRewardRatio: signal.riskReward,
              plannedRiskAmountUsd: signal.riskAmountUsd,
              stopDistancePips: Math.round(Math.abs(signal.entry - signal.stopLoss) / (PIP_VALUES[signal.symbol] || 0.0001)),
              entryTime: `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${timeStr}`,
              confluenceGradeAtEntry: result.confluenceGrade,
              agentConfidenceAtEntry: result.overallConfidence,
              setupSnapshot: {
                timeframe: result.timeframe,
                candlestickPattern: result.agents.technical.candlestickPattern,
                rsiAtEntry: Number(result.agents.technical.indicatorSummary.rsiStatus.split(' ')[0]) || 50,
                marketRegime: result.agents.fundamental.macroRegime,
                newsSentimentScore: result.agents.news.sentimentScore,
                primaryCatalyst: result.agents.news.topCatalysts[0] || 'Swarm Confluence',
              },
            });
            setJournalEntries(PersistentTradingJournal.loadEntries());
            setJournalMetrics(PersistentTradingJournal.getMetrics());

            showNotification(`AUTOPILOT TRIGGERED: ${autoPos.type} ${signal.lots} Lots on ${signal.symbol} (Confluence: ${result.confluenceGrade})`);
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

  // 6. Real-time background scraper polling timer (every 25 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      fetchMarketData(selectedPair, timeframe);
    }, 25000);
    return () => clearInterval(timer);
  }, [selectedPair, timeframe, fetchMarketData]);

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

  // Force Scrape 18 Financial Websites on demand
  const handleForceScrape = async () => {
    setIsScrapingNews(true);
    try {
      await fetch(`/api/news?symbol=${encodeURIComponent(selectedPair)}`);
      await triggerSwarm(selectedPair, timeframe);
      showNotification(`18 Financial Websites & Wires freshly scraped for ${selectedPair}`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsScrapingNews(false);
    }
  };

  // Handle custom debate prompt
  const handleCustomDebatePrompt = async (prompt: string) => {
    setIsDebating(true);
    try {
      const res = await fetch('/api/debate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: selectedPair,
          timeframe,
          userPrompt: prompt,
        }),
      });
      const json = await res.json();
      if (json.success && json.data && consensus) {
        setConsensus({
          ...consensus,
          debateTranscript: json.data.transcript,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDebating(false);
    }
  };

  // Execute Approved Trade into Simulated Portfolio (stored in local browser)
  const handleExecuteTrade = () => {
    if (!consensus || !consensus.executionSignal.authorized) return;
    const signal = consensus.executionSignal;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newPosition: Position = {
      id: `pos-${Date.now()}`,
      symbol: signal.symbol,
      type: signal.orderType === 'BUY_MARKET' ? 'BUY' : 'SELL',
      lots: signal.lots,
      entryPrice: signal.entry,
      currentPrice: signal.entry,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit,
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

    // Automatically log entry to Persistent Trading Journal
    PersistentTradingJournal.logTradeEntry({
      positionId: newPosition.id,
      symbol: signal.symbol,
      marketSegment: consensus.marketSegment,
      direction: newPosition.type,
      entryPrice: signal.entry,
      lots: signal.lots,
      units: Math.round(signal.lots * 100000),
      initialStopLoss: signal.stopLoss,
      initialTakeProfit: signal.takeProfit,
      plannedRiskRewardRatio: signal.riskReward,
      plannedRiskAmountUsd: signal.riskAmountUsd,
      stopDistancePips: Math.round(Math.abs(signal.entry - signal.stopLoss) / (PIP_VALUES[signal.symbol] || 0.0001)),
      entryTime: `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${timeStr}`,
      confluenceGradeAtEntry: consensus.confluenceGrade,
      agentConfidenceAtEntry: consensus.overallConfidence,
      setupSnapshot: {
        timeframe: consensus.timeframe,
        candlestickPattern: consensus.agents.technical.candlestickPattern,
        rsiAtEntry: Number(consensus.agents.technical.indicatorSummary.rsiStatus.split(' ')[0]) || 50,
        marketRegime: consensus.agents.fundamental.macroRegime,
        newsSentimentScore: consensus.agents.news.sentimentScore,
        primaryCatalyst: consensus.agents.news.topCatalysts[0] || 'Swarm Confluence',
      },
    });
    setJournalEntries(PersistentTradingJournal.loadEntries());
    setJournalMetrics(PersistentTradingJournal.getMetrics());

    showNotification(`ORDER EXECUTED: ${newPosition.type} ${signal.lots} Lots on ${signal.symbol} @ ${signal.entry}`);
  };

  // Close Position & Save to Local Browser Storage
  const handleClosePosition = (posId: string) => {
    const pos = portfolio.positions.find(p => p.id === posId);
    if (!pos) return;

    const updatedPositions = portfolio.positions.filter(p => p.id !== posId);
    const newBalance = Number((portfolio.balance + pos.pnl).toFixed(2));
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
      exitPrice: pos.currentPrice,
      stopLoss: pos.stopLoss,
      takeProfit: pos.takeProfit,
      openTime: pos.openTime,
      closeTime: timeStr,
      pnl: pos.pnl,
      outcome: (pos.pnl > 0 ? 'WIN' : pos.pnl < 0 ? 'LOSS' : 'SCRATCH') as 'WIN' | 'LOSS' | 'SCRATCH',
      riskManagerVerdict: 'APPROVED' as const,
      strategyNotes: `Position closed at ${pos.currentPrice}. Realized P&L: $${pos.pnl.toFixed(2)}.`,
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

    // Automatically log outcome & retrospective to Persistent Trading Journal
    PersistentTradingJournal.logTradeOutcome(
      pos.id,
      pos.currentPrice,
      pos.pnl > 0 ? 'TAKE_PROFIT' : 'STOP_LOSS',
      pos.pnl
    );
    setJournalEntries(PersistentTradingJournal.loadEntries());
    setJournalMetrics(PersistentTradingJournal.getMetrics());

    showNotification(`CLOSED POSITION: ${pos.symbol} | Realized P&L: ${pos.pnl >= 0 ? '+' : ''}$${pos.pnl.toFixed(2)}`);
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
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCalendar={() => setIsCalendarOpen(true)}
        onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
        onOpenKnowledge={() => setIsKnowledgeOpen(true)}
        onOpenNewsWire={() => setIsNewsWireOpen(true)}
        onOpenJournal={() => setIsJournalOpen(true)}
        journalTradeCount={journalEntries.length}
        isAnalyzing={isAnalyzing}
        onTriggerAnalysis={() => triggerSwarm(selectedPair, timeframe, candles)}
        activeSession={activeSession}
        executionMode={executionMode}
        onToggleExecutionMode={handleToggleExecutionMode}
        confluenceGrade={consensus?.confluenceGrade}
      />

      {/* Live Ticker Bar (Forex, Metals & Commodities, or Indian Markets) */}
      <TickerBar
        rates={rates}
        selectedPair={selectedPair}
        onSelectPair={handleSelectPair}
        marketSegment={marketSegment}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 space-y-4">
        {/* Tab 1: Terminal */}
        {activeTab === 'terminal' && (
          <div className="space-y-4">
            {/* 🌟 UNIFIED BUY/SELL DECISION BANNER (Directly on Dashboard) */}
            {consensus && (
              <UnifiedDecisionBanner
                consensus={consensus}
                onExecuteTrade={handleExecuteTrade}
                onOpenNewsWire={() => setIsNewsWireOpen(true)}
                onOpenJournal={() => setIsJournalOpen(true)}
                onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
              />
            )}

            {/* 🧠 PERSISTENT TRADING JOURNAL & ACTIVE MEMORY FEED (Embedded in Main Terminal) */}
            {consensus?.agents.journal && (
              <JournalMemoryFeed
                journalAnalysis={consensus.agents.journal}
                onOpenJournalModal={() => setIsJournalOpen(true)}
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

            {/* 6 Specialized Agent Cards (Technical, Fundamental, News, Forex, Memory Journal, Risk) */}
            {consensus && (
              <AgentSwarmPanel
                technical={consensus.agents.technical}
                fundamental={consensus.agents.fundamental}
                forex={consensus.agents.forex}
                news={consensus.agents.news}
                journal={consensus.agents.journal}
                risk={consensus.agents.risk}
                onExecuteTrade={handleExecuteTrade}
                onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
                onOpenNewsWire={() => setIsNewsWireOpen(true)}
                onOpenJournal={() => setIsJournalOpen(true)}
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
            onSendCustomPrompt={handleCustomDebatePrompt}
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

      {/* Real-Time Financial Scraper & News Wire Modal (18 Sources) */}
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

      {/* Persistent Trading Journal & Loss Audit Modal */}
      <TradingJournalModal
        isOpen={isJournalOpen}
        onClose={() => setIsJournalOpen(false)}
        entries={journalEntries}
        metrics={journalMetrics}
        onResetJournal={() => {
          PersistentTradingJournal.resetJournal();
          const refreshed = PersistentTradingJournal.loadEntries();
          setJournalEntries(refreshed);
          setJournalMetrics(PersistentTradingJournal.getMetrics());
          showNotification('Trading journal reset to institutional baseline seed history.');
        }}
      />

      {/* Settings Modal (Persisted in Local Browser Storage) */}
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
          showNotification('Risk parameters & capital balance updated and stored in local browser.');
        }}
      />
    </div>
  );
}
