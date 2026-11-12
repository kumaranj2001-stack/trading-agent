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
}) => {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(initialPair);
  const [selectedTf, setSelectedTf] = useState<TimeFrame>(initialTf);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
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
    return LiveMarketFeedManager.getCanonicalPrice(initialPair) || BASE_PRICES[initialPair] || 4005.88;
  });
  const [liveChangePercent, setLiveChangePercent] = useState<number>(-0.06);
  const [liveTimestamp, setLiveTimestamp] = useState<number>(Date.now());
  const [liveLatencyMs, setLiveLatencyMs] = useState<number>(12);

  // Interactive panels visibility states
  const [isQuantumVisionOpen, setIsQuantumVisionOpen] = useState<boolean>(true);
  const [isMarketDnaOpen, setIsMarketDnaOpen] = useState<boolean>(false);
  const [isVisionAtlasLabOpen, setIsVisionAtlasLabOpen] = useState<boolean>(false);
  const [isLiquidityOpen, setIsLiquidityOpen] = useState<boolean>(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState<boolean>(false);
  const [activeRightSidebarMode, setActiveRightSidebarMode] = useState<'scenarios' | 'market_dna' | 'vision_atlas'>('scenarios');
  const [horizonCandles, setHorizonCandles] = useState<number>(5);

  // Sync pair changes from external props
  useEffect(() => {
    setSelectedPair(initialPair);
  }, [initialPair]);

  // Sync timeframe changes from external props
  useEffect(() => {
    setSelectedTf(initialTf);
  }, [initialTf]);

  // 🌐 WebSocket Streaming Subscription: Pipe real-time tick data & synchronized server timestamps
  useEffect(() => {
    // 1. Kick off canonical feed for selected symbol & timeframe
    LiveMarketFeedManager.startLiveFeed(selectedPair, selectedTf, 1500);

    const canonical = LiveMarketFeedManager.getCanonicalCandles(selectedPair, selectedTf);
    if (canonical && canonical.length > 0) {
      setLiveCandles(canonical);
    }
    const currentCanonicalPrice = LiveMarketFeedManager.getCanonicalPrice(selectedPair);
    if (currentCanonicalPrice && Number.isFinite(currentCanonicalPrice)) {
      setLivePrice(currentCanonicalPrice);
    }

    // 2. Subscribe to real-time tick broadcasts
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

    return () => {
      unsubscribe();
    };
  }, [selectedPair, selectedTf]);

  // Derived price metrics & spreads
  const isXau = selectedPair.includes('XAU');
  const isJpy = selectedPair.includes('JPY');
  const spreadPts = isXau ? 17 : isJpy ? 8 : 2;
  const spreadValue = spreadPts * (isXau ? 0.01 : isJpy ? 0.001 : 0.0001);
  const bidPrice = livePrice - spreadValue;
  const askPrice = livePrice + spreadValue;

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
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`w-full min-h-[calc(100vh-100px)] flex flex-col font-sans transition-colors overflow-x-hidden ${
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
          hour12: false,
        }) + ' UTC'}
        isLive={true}
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

        {/* 📈 Central Real-Time Streaming Candlestick Canvas (Direct from Terminal feed) */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-white dark:bg-terminal-950 overflow-hidden">
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
