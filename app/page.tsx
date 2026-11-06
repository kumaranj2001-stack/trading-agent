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
import { Header } from '@/components/Header';
import { TickerBar } from '@/components/TickerBar';
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
import { getMarketSegmentForSymbol, PIP_VALUES } from '@/lib/marketData';

export default function Home() {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>('EUR/USD');
  const [marketSegment, setMarketSegment] = useState<MarketSegment>('FOREX');
  const [timeframe, setTimeframe] = useState<TimeFrame>('1h');
  const [activeTab, setActiveTab] = useState<'terminal' | 'debate' | 'backtest' | 'architecture'>('terminal');
  
  // Market Data state
  const [candles, setCandles] = useState<Candle[]>([]);
  const [rates, setRates] = useState<any[]>([]);
  const [calendar, setCalendar] = useState<MacroIndicator[]>([]);
  const [activeSession, setActiveSession] = useState<string>('LONDON_NY_OVERLAP');

  // Swarm State
  const [consensus, setConsensus] = useState<SwarmConsensusResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isDebating, setIsDebating] = useState<boolean>(false);

  // Modals & Tools
  const [executionMode, setExecutionMode] = useState<ExecutionMode>('MANUAL');
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState<boolean>(false);
  const [isMonteCarloOpen, setIsMonteCarloOpen] = useState<boolean>(false);
  const [isKnowledgeOpen, setIsKnowledgeOpen] = useState<boolean>(false);
  const [opportunities, setOpportunities] = useState<MarketScannerOpportunity[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Portfolio State
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

  // Fetch market data & rates
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
              const pipVal = PIP_VALUES[pos.symbol] || (isJpy ? 0.01 : 0.0001);
              const pipDollar = 10;
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
            return {
              ...prev,
              positions: updatedPositions,
            };
          });
        }
      }
    } catch (e) {
      console.error('Market fetch error:', e);
    }
  }, []);

  // Fetch opportunity scanner results across both Forex and Indian markets
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

  // Trigger Multi-Agent Swarm with 1,000+ Knowledge Rules Matching
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
            setPortfolio(prev => ({
              ...prev,
              positions: [autoPos, ...prev.positions],
              marginUsed: prev.marginUsed + marginNeeded,
              freeMargin: Math.max(0, prev.balance - (prev.marginUsed + marginNeeded)),
            }));

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

  // Initial load and pair/timeframe change listener
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

  // Handle Pair Switch
  const handleSelectPair = (newPair: CurrencyPair) => {
    setSelectedPair(newPair);
    setMarketSegment(getMarketSegmentForSymbol(newPair));
  };

  // Handle Market Segment Switch (Forex vs Indian Market)
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
      if (prev === 'MANUAL') return 'SEMI_AUTONOMOUS';
      if (prev === 'SEMI_AUTONOMOUS') return 'FULL_AUTOPILOT';
      return 'MANUAL';
    });
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

  // Execute Approved Trade into Simulated Portfolio
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

    setPortfolio({
      ...portfolio,
      positions: updatedPositions,
      marginUsed: newMarginUsed,
      freeMargin: Math.max(0, portfolio.balance - newMarginUsed),
    });

    showNotification(`ORDER EXECUTED: ${newPosition.type} ${signal.lots} Lots on ${signal.symbol} @ ${signal.entry}`);
  };

  // Close Position
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

    setPortfolio({
      ...portfolio,
      balance: newBalance,
      equity: newBalance,
      positions: updatedPositions,
      marginUsed: newMarginUsed,
      freeMargin: Math.max(0, newBalance - newMarginUsed),
      tradeHistory: [historyItem, ...portfolio.tradeHistory],
    });

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

      {/* Main Header with Market Selector & Knowledge Tools */}
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
        isAnalyzing={isAnalyzing}
        onTriggerAnalysis={() => triggerSwarm(selectedPair, timeframe, candles)}
        activeSession={activeSession}
        executionMode={executionMode}
        onToggleExecutionMode={handleToggleExecutionMode}
        confluenceGrade={consensus?.confluenceGrade}
      />

      {/* Live Ticker Bar (Forex or Indian Markets) */}
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
            {/* Top row: Candlestick Chart (with OANDA / TradingView Live option) */}
            <ChartView
              candles={candles}
              pair={selectedPair}
              timeframe={timeframe}
              stopLoss={consensus?.agents.risk.parameters.stopLoss}
              takeProfit={consensus?.agents.risk.parameters.takeProfit1}
              entryPrice={consensus?.agents.risk.parameters.entryPrice}
              signalBias={consensus?.agents.technical.bias}
            />

            {/* Middle row: 4 Specialized Agent Cards */}
            {consensus && (
              <AgentSwarmPanel
                technical={consensus.agents.technical}
                fundamental={consensus.agents.fundamental}
                forex={consensus.agents.forex}
                risk={consensus.agents.risk}
                onExecuteTrade={handleExecuteTrade}
                onOpenMonteCarlo={() => setIsMonteCarloOpen(true)}
              />
            )}

            {/* Bottom row: Portfolio & Position Management */}
            <PortfolioPanel
              portfolio={portfolio}
              onClosePosition={handleClosePosition}
            />
          </div>
        )}

        {/* Tab 2: Autonomous Agent Debate Feed */}
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

        {/* Tab 4: Architecture & Roles */}
        {activeTab === 'architecture' && (
          <ArchitectureView />
        )}
      </main>

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

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={riskConfig}
        onSaveConfig={(newCfg) => {
          setRiskConfig(newCfg);
          setPortfolio(prev => ({ ...prev, balance: newCfg.accountBalance }));
          showNotification('Risk parameters & capital balance updated successfully.');
        }}
      />
    </div>
  );
}
