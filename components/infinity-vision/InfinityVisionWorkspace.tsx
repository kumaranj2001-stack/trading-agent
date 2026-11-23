'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CurrencyPair, TimeFrame, Candle } from '@/lib/types';
import { InfinityVisionToolbar, ChartViewMode } from './InfinityVisionToolbar';
import { InfinityVisionOhlcBar } from './InfinityVisionOhlcBar';
import { InfinityVisionChart } from './InfinityVisionChart';
import { QuantumVisionDrawer } from './QuantumVisionDrawer';
import { LiquidityHeatmapModal } from './LiquidityHeatmapModal';
import { IndicatorsModal } from './IndicatorsModal';
import { ScenariosAndZonesSidebar } from './ScenariosAndZonesSidebar';
import { MarketDnaSidebar } from './MarketDnaSidebar';
import { VisionAtlasLabSidebar } from './VisionAtlasLabSidebar';
import { StructureTimelineBottom } from './StructureTimelineBottom';
import { BASE_PRICES } from '@/lib/marketData';
import { LiveMarketFeedManager } from '@/lib/liveMarketFeed';
import { MarketSessionManager } from '@/lib/marketSessionManager';
import { visionSystemLogger } from '@/lib/visionSystemLogger';

export interface InfinityVisionWorkspaceProps {
  pair: CurrencyPair;
  timeframe: TimeFrame;
  candles?: Candle[];
  onSelectPair?: (p: CurrencyPair) => void;
  onSelectTimeframe?: (tf: TimeFrame) => void;
  onClose?: () => void;
  onSyncToTerminal?: (params: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
  }) => void;
  onOpenJournal?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
}

export const InfinityVisionWorkspace: React.FC<InfinityVisionWorkspaceProps> = ({
  pair: initialPair = 'XAU/USD',
  timeframe: initialTf = '15m',
  candles: initialCandles = [],
  onSelectPair,
  onSelectTimeframe,
  onClose,
  onSyncToTerminal,
  onOpenJournal,
  theme: propTheme,
  onToggleTheme,
}) => {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(initialPair);
  const [selectedTf, setSelectedTf] = useState<TimeFrame>(initialTf);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (propTheme) return propTheme;
    if (typeof window !== 'undefined') {
      const saved = (localStorage.getItem('qri_theme') || localStorage.getItem('apex_theme')) as 'dark' | 'light' | null;
      if (saved === 'dark' || saved === 'light') return saved;
    }
    return 'dark';
  });

  useEffect(() => {
    if (propTheme && (propTheme === 'light' || propTheme === 'dark')) {
      setTheme(propTheme);
    }
  }, [propTheme]);
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('Advanced');
  const [chartType, setChartType] = useState<'Candles' | 'Line'>('Candles');
  const [showPatternOnChart, setShowPatternOnChart] = useState<boolean>(true);
  const [isMobileRightSidebarOpen, setIsMobileRightSidebarOpen] = useState<boolean>(false);

  // 🌐 Live WebSocket Feed State (Directly synced with Terminal Engine)
  const [liveCandles, setLiveCandles] = useState<Candle[]>(() => {
    if (initialCandles && initialCandles.length > 0) return initialCandles;
    return LiveMarketFeedManager.getCanonicalCandles(initialPair, initialTf);
  });
  const [livePrice, setLivePrice] = useState<number>(() => {
    return LiveMarketFeedManager.getCanonicalPrice(initialPair) || BASE_PRICES[initialPair] || 4074.90;
  });
  const [liveChangePercent, setLiveChangePercent] = useState<number>(-0.06);
  const [liveTimestamp, setLiveTimestamp] = useState<number>(Date.now());
  const [liveLatencyMs, setLiveLatencyMs] = useState<number>(12);
  const [isInterrupted, setIsInterrupted] = useState<boolean>(false);

  // Interactive panels visibility states
  const [isQuantumVisionOpen, setIsQuantumVisionOpen] = useState<boolean>(false);
  const [isMarketDnaOpen, setIsMarketDnaOpen] = useState<boolean>(false);
  const [isVisionAtlasLabOpen, setIsVisionAtlasLabOpen] = useState<boolean>(false);
  const [isLiquidityOpen, setIsLiquidityOpen] = useState<boolean>(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState<boolean>(false);
  const [activeRightSidebarMode, setActiveRightSidebarMode] = useState<'scenarios' | 'market_dna' | 'vision_atlas'>('scenarios');
  const [horizonCandles, setHorizonCandles] = useState<number>(5);

  // Sync pair changes from external props
  useEffect(() => {
    setSelectedPair(initialPair);
    const cp = LiveMarketFeedManager.getCanonicalPrice(initialPair);
    if (cp && Number.isFinite(cp)) setLivePrice(cp);
  }, [initialPair]);

  // Sync timeframe changes from external props
  useEffect(() => {
    setSelectedTf(initialTf);
  }, [initialTf]);

  // Sync candles from external props (Terminal parent state)
  useEffect(() => {
    if (initialCandles && initialCandles.length > 0) {
      setLiveCandles(initialCandles);
      const latest = initialCandles[initialCandles.length - 1];
      if (latest && Number.isFinite(latest.close)) {
        setLivePrice(latest.close);
      }
    }
  }, [initialCandles]);

  // 🌐 WebSocket Streaming Subscription & Interruption Telemetry
  useEffect(() => {
    // 1. Subscribe to canonical tick broadcasts for the selected pair
    const unsubscribe = LiveMarketFeedManager.subscribe((event) => {
      if (event.pair === selectedPair) {
        setLiveCandles(event.candles);
        setLivePrice(event.livePrice);
        setLiveChangePercent(event.change24h);
        setLiveTimestamp(event.timestamp);
        if (event.latencyMs) {
          setLiveLatencyMs(event.latencyMs);
        }
      }
    });

    // 2. Subscribe to WebSocket telemetry for drop / latency interruption handling
    const unsubTel = LiveMarketFeedManager.subscribeWebSocketTelemetry((tel) => {
      const session = MarketSessionManager.getMarketSessionInfo(selectedPair);
      const isStale = !session.isFrozen && ((Date.now() - tel.lastTickTimestamp) > 20000);
      setIsInterrupted(!tel.isConnected || isStale);
      if (tel.latencyMs) setLiveLatencyMs(tel.latencyMs);
    });

    const staleTimer = setInterval(() => {
      const tel = LiveMarketFeedManager.getWebSocketTelemetry();
      const session = MarketSessionManager.getMarketSessionInfo(selectedPair);
      const isStale = !session.isFrozen && ((Date.now() - tel.lastTickTimestamp) > 20000);
      setIsInterrupted(!tel.isConnected || isStale);
    }, 2000);

    return () => {
      unsubscribe();
      unsubTel();
      clearInterval(staleTimer);
    };
  }, [selectedPair, selectedTf]);

  const handleReconnect = () => {
    LiveMarketFeedManager.startLiveFeed(selectedPair, selectedTf, 1500);
    setIsInterrupted(false);
  };

  // Derived price metrics & spreads calculated with exact decimal parity
  const isIndianIndex = selectedPair === 'NIFTY 50' || selectedPair === 'BANK NIFTY';
  const isIndianStock = selectedPair === 'RELIANCE' || selectedPair === 'TCS' || selectedPair === 'HDFC BANK' || selectedPair === 'INFY';
  const isGold = selectedPair === 'XAU/USD';
  const isSilver = selectedPair === 'XAG/USD';
  const isPlatinum = selectedPair === 'XPT/USD';
  const isCopper = selectedPair === 'COPPER';
  const isOil = selectedPair === 'WTI_CRUDE' || selectedPair === 'BRENT_CRUDE';
  const isJpy = selectedPair.includes('JPY');
  const isRupee = selectedPair.includes('/INR');

  let decimalCount = 5;
  if (isIndianIndex || isIndianStock || isGold || isPlatinum || isOil) decimalCount = 2;
  else if (isSilver || isJpy || isRupee) decimalCount = 3;
  else if (isCopper) decimalCount = 4;

  const spreadPts = isGold ? 17 : isIndianIndex ? 5 : isJpy ? 8 : isSilver ? 3 : 2;
  const spreadValue = spreadPts * (isGold ? 0.05 : isIndianIndex ? 0.05 : isJpy ? 0.001 : 0.0001);
  const bidPrice = Number((livePrice - spreadValue).toFixed(decimalCount));
  const askPrice = Number((livePrice + spreadValue).toFixed(decimalCount));

  const lastCandle = useMemo(() => {
    if (liveCandles && liveCandles.length > 0) {
      return liveCandles[liveCandles.length - 1];
    }
    return {
      open: livePrice,
      high: livePrice,
      low: livePrice,
      close: livePrice,
      time: new Date().toISOString(),
      timestamp: Date.now(),
      volume: 1000,
    };
  }, [liveCandles, livePrice]);

  // 🛰️ Systematized Snapshot Logging: Log active Quantum Vision bias, Market DNA prints, and Vision Atlas configurations
  useEffect(() => {
    if (!liveCandles || liveCandles.length === 0) return;
    const atr = Math.max(...liveCandles.slice(-14).map(c => c.high - c.low)) || (livePrice * 0.003);
    
    // Dynamic zones calculated from live price
    const isSellBias = activeRightSidebarMode === 'scenarios';
    const safeZone = {
      min: Number((isSellBias ? livePrice - atr * 0.4 : livePrice + atr * 0.2).toFixed(4)),
      max: Number((isSellBias ? livePrice + atr * 0.2 : livePrice + atr * 0.6).toFixed(4)),
    };
    const entryZone = {
      min: Number((isSellBias ? livePrice + atr * 0.5 : livePrice - atr * 0.8).toFixed(4)),
      max: Number((isSellBias ? livePrice + atr * 0.8 : livePrice - atr * 0.5).toFixed(4)),
    };
    const cautionZone = {
      min: Number((isSellBias ? livePrice + atr * 0.8 : livePrice - atr * 1.5).toFixed(4)),
      max: Number((isSellBias ? livePrice + atr * 1.5 : livePrice - atr * 0.8).toFixed(4)),
    };
    const dangerZone = {
      min: Number((isSellBias ? livePrice + atr * 1.5 : livePrice - atr * 2.2).toFixed(4)),
      max: Number((isSellBias ? livePrice + atr * 2.2 : livePrice - atr * 1.5).toFixed(4)),
    };

    visionSystemLogger.logSnapshot({
      pair: selectedPair,
      timeframe: selectedTf,
      livePrice,
      quantumVisionBias: isSellBias ? 'BEARISH' : 'BULLISH',
      bullishProbability: isSellBias ? 47 : 53,
      bearishProbability: isSellBias ? 53 : 47,
      marketDnaSimilarity: 67.3,
      liquiditySweepEvent: `Sell-side swept at ${(livePrice - atr * 0.5).toFixed(2)} - 3 candles ago`,
      structureShift: 'MSS (CHoCH) developing',
      marketRegime: 'Structural transition - quiet volatility',
      language: 'en',
      voiceActive: true,
      safeZone,
      entryZone,
      cautionZone,
      dangerZone,
    });
  }, [selectedPair, selectedTf, Math.floor(livePrice * 10), activeRightSidebarMode]);

  // Switching Pair & Timeframe handlers that trigger global sync
  const handleSelectPair = (p: CurrencyPair) => {
    setSelectedPair(p);
    LiveMarketFeedManager.startLiveFeed(p, selectedTf, 1500);
    const pCandles = LiveMarketFeedManager.getCanonicalCandles(p, selectedTf);
    if (pCandles && pCandles.length > 0) setLiveCandles(pCandles);
    const pPrice = LiveMarketFeedManager.getCanonicalPrice(p);
    if (pPrice) setLivePrice(pPrice);

    if (onSelectPair) onSelectPair(p);
  };

  const handleSelectTimeframe = (tf: any) => {
    const validTf = tf as TimeFrame;
    setSelectedTf(validTf);
    LiveMarketFeedManager.startLiveFeed(selectedPair, validTf, 1500);
    const tfCandles = LiveMarketFeedManager.getCanonicalCandles(selectedPair, validTf);
    if (tfCandles && tfCandles.length > 0) setLiveCandles(tfCandles);

    if (onSelectTimeframe) onSelectTimeframe(validTf);
  };

  // Toggle handlers for mutually exclusive or combinable panels
  const handleToggleQuantumVision = () => {
    setIsQuantumVisionOpen(prev => !prev);
  };

  const handleToggleMarketDna = () => {
    if (activeRightSidebarMode === 'market_dna' && isMarketDnaOpen) {
      setIsMarketDnaOpen(false);
      setActiveRightSidebarMode('scenarios');
    } else {
      setIsMarketDnaOpen(true);
      setIsVisionAtlasLabOpen(false);
      setActiveRightSidebarMode('market_dna');
      setIsMobileRightSidebarOpen(true);
    }
  };

  const handleToggleVisionAtlasLab = () => {
    if (activeRightSidebarMode === 'vision_atlas' && isVisionAtlasLabOpen) {
      setIsVisionAtlasLabOpen(false);
      setActiveRightSidebarMode('scenarios');
    } else {
      setIsVisionAtlasLabOpen(true);
      setIsMarketDnaOpen(false);
      setActiveRightSidebarMode('vision_atlas');
      setIsMobileRightSidebarOpen(true);
    }
  };

  const handleToggleLiquidity = () => {
    setIsLiquidityOpen(prev => !prev);
  };

  const handleToggleIndicators = () => {
    setIsIndicatorsOpen(prev => !prev);
  };

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('qri_theme', nextTheme);
      document.documentElement.classList.remove('dark', 'light');
      document.documentElement.classList.add(nextTheme);
    }
    if (onToggleTheme) {
      onToggleTheme();
    }
  };

  return (
    <div className={`w-full flex flex-col font-sans select-none overflow-hidden ${
      theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-terminal-950 text-slate-100'
    }`}>
      {/* 🚀 PRIMARY CONTROL ROW (Begins directly with VISION pair selector & timeframe chips) */}
      <InfinityVisionToolbar
        selectedPair={selectedPair}
        onSelectPair={handleSelectPair}
        selectedTimeframe={selectedTf}
        onSelectTimeframe={handleSelectTimeframe}
        chartViewMode={chartViewMode}
        onChangeChartViewMode={setChartViewMode}
        isQuantumVisionOpen={isQuantumVisionOpen}
        onToggleQuantumVision={handleToggleQuantumVision}
        isMarketDnaOpen={isMarketDnaOpen}
        onToggleMarketDna={handleToggleMarketDna}
        isVisionAtlasLabOpen={isVisionAtlasLabOpen}
        onToggleVisionAtlasLab={handleToggleVisionAtlasLab}
        isLiquidityOpen={isLiquidityOpen}
        onToggleLiquidity={handleToggleLiquidity}
        isIndicatorsOpen={isIndicatorsOpen}
        onToggleIndicators={handleToggleIndicators}
        isMobileSidebarOpen={isMobileRightSidebarOpen}
        onToggleMobileSidebar={() => setIsMobileRightSidebarOpen(!isMobileRightSidebarOpen)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* 📊 REAL-TIME LIVE OHLC & LIQUIDITY TICKER STRIP */}
      <InfinityVisionOhlcBar
        pair={selectedPair}
        timeframe={selectedTf}
        open={lastCandle.open}
        high={Math.max(lastCandle.high, livePrice)}
        low={Math.min(lastCandle.low, livePrice)}
        close={livePrice}
        changePercent={liveChangePercent}
        bidPrice={bidPrice}
        askPrice={askPrice}
        spreadPts={spreadPts}
        dateStr={new Date(liveTimestamp).toLocaleString('en-US', {
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' UTC'}
        isLive={!isInterrupted}
        latencyMs={liveLatencyMs}
        isInterrupted={isInterrupted}
        theme={theme}
      />

      {/* 🧭 MAIN BODY: Real-Time Streaming Chart + Fluid Dynamic Drawers */}
      <div className="flex-1 flex min-h-[500px] relative overflow-hidden">
        {/* Left Floating Quantum Vision Drawer */}
        <QuantumVisionDrawer
          isOpen={isQuantumVisionOpen}
          onClose={() => setIsQuantumVisionOpen(false)}
          horizonCandles={horizonCandles}
          onChangeHorizon={setHorizonCandles}
          theme={theme}
        />

        {/* Center Floating Liquidity Heatmap Window */}
        <LiquidityHeatmapModal
          isOpen={isLiquidityOpen}
          onClose={() => setIsLiquidityOpen(false)}
          pair={selectedPair}
          timeframe={selectedTf}
          theme={theme}
        />

        {/* 📈 Central Real-Time Streaming Chart Container (Direct TradingView & Confluence Encapsulation) */}
        <div className="flex-1 p-2 sm:p-3 relative flex flex-col min-w-0 min-h-0 bg-slate-100 dark:bg-terminal-950/60 overflow-hidden">
          <InfinityVisionChart
            candles={liveCandles}
            pair={selectedPair}
            timeframe={selectedTf}
            theme={theme}
            showIndicatorsOverlay={chartViewMode === 'Advanced' || chartViewMode === 'Standard' || isIndicatorsOpen}
            showQuantumSimulation={isQuantumVisionOpen}
            showMarketDna={isMarketDnaOpen}
            chartType={chartType}
            showPatternOnChart={showPatternOnChart}
            horizonCandles={horizonCandles}
            latencyMs={liveLatencyMs}
            isInterrupted={isInterrupted}
            onReconnect={handleReconnect}
          />
        </div>

        {/* Right Sidebar: Dynamic Mode (Scenarios & Zones vs Market DNA vs Vision Atlas Lab) */}
        <div className={`
          ${isMobileRightSidebarOpen ? 'fixed inset-y-0 right-0 z-50 w-[320px] sm:w-[350px] shadow-2xl flex' : 'hidden lg:flex'}
          lg:static w-[320px] lg:w-[350px] shrink-0 border-l flex flex-col transition-all ${
          theme === 'light' 
            ? 'bg-white border-slate-200 shadow-sm' 
            : 'bg-terminal-950 border-terminal-border'
        }`}>
          {/* Mobile Close Button */}
          <div className="lg:hidden p-2 flex justify-between items-center bg-slate-50 dark:bg-terminal-900 border-b border-slate-200 dark:border-terminal-border">
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Analytical Desk
            </span>
            <button
              onClick={() => setIsMobileRightSidebarOpen(false)}
              className="px-2.5 py-1 text-xs font-bold rounded bg-slate-200 dark:bg-terminal-800 text-slate-800 dark:text-white"
            >
              ✕ Close
            </button>
          </div>

          {activeRightSidebarMode === 'scenarios' && (
            <ScenariosAndZonesSidebar
              pair={selectedPair}
              timeframe={selectedTf}
              theme={theme}
              currentPrice={livePrice}
              candles={liveCandles}
              onSyncToTerminal={onSyncToTerminal}
            />
          )}

          {activeRightSidebarMode === 'market_dna' && (
            <MarketDnaSidebar
              pair={selectedPair}
              timeframe={selectedTf}
              theme={theme}
              onTogglePatternOnChart={setShowPatternOnChart}
              onToggleChartMode={setChartType}
            />
          )}

          {activeRightSidebarMode === 'vision_atlas' && (
            <VisionAtlasLabSidebar
              pair={selectedPair}
              timeframe={selectedTf}
              theme={theme}
              onSimulate={() => setIsQuantumVisionOpen(true)}
            />
          )}
        </div>
      </div>

      {/* 📋 BOTTOM PANEL: Structure Timeline & Sessions & Vision Telemetry Logs */}
      <StructureTimelineBottom
        pair={selectedPair}
        timeframe={selectedTf}
        theme={theme}
      />

      {/* ⚙️ Comprehensive Indicators Drawer */}
      <IndicatorsModal
        isOpen={isIndicatorsOpen}
        onClose={() => setIsIndicatorsOpen(false)}
        theme={theme}
      />
    </div>
  );
};
