'use client';

import React, { useState, useEffect } from 'react';
import { CurrencyPair, TimeFrame, Candle } from '@/lib/types';
import { InfinityVisionHeader } from './InfinityVisionHeader';
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
  const [selectedTf, setSelectedTf] = useState<any>(initialTf);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [chartViewMode, setChartViewMode] = useState<ChartViewMode>('Advanced');
  const [chartType, setChartType] = useState<'Candles' | 'Line'>('Candles');
  const [showPatternOnChart, setShowPatternOnChart] = useState<boolean>(true);
  const [isMobileRightSidebarOpen, setIsMobileRightSidebarOpen] = useState<boolean>(false);

  // Interactive panels visibility states
  const [isQuantumVisionOpen, setIsQuantumVisionOpen] = useState<boolean>(true);
  const [isMarketDnaOpen, setIsMarketDnaOpen] = useState<boolean>(false);
  const [isVisionAtlasLabOpen, setIsVisionAtlasLabOpen] = useState<boolean>(false);
  const [isLiquidityOpen, setIsLiquidityOpen] = useState<boolean>(false);
  const [isIndicatorsOpen, setIsIndicatorsOpen] = useState<boolean>(false);
  const [activeRightSidebarMode, setActiveRightSidebarMode] = useState<'scenarios' | 'market_dna' | 'vision_atlas'>('scenarios');
  const [horizonCandles, setHorizonCandles] = useState<number>(5);

  // Sync pair changes
  useEffect(() => {
    setSelectedPair(initialPair);
  }, [initialPair]);

  // Derived price metrics
  const currentBasePrice = BASE_PRICES[selectedPair] || 4005.88;
  const spreadPts = selectedPair.includes('XAU') ? 17 : 2;
  const bidPrice = currentBasePrice - (spreadPts * 0.01);
  const askPrice = currentBasePrice + (spreadPts * 0.01);

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
    <div className={`w-full min-h-screen flex flex-col font-sans transition-colors ${
      theme === 'light' ? 'bg-slate-100 text-slate-900' : 'bg-terminal-950 text-slate-100'
    }`}>
      {/* 1. Top Navigation Bar */}
      <InfinityVisionHeader
        activeTab="technical-analysis"
        onSelectNavTab={(tabId) => {
          if (tabId === 'home' && onClose) {
            onClose();
          }
        }}
        onOpenJournal={onOpenJournal}
        userName="kumaran"
        theme={theme}
      />

      {/* 2. Chart Control Subheader Toolbar */}
      <InfinityVisionToolbar
        selectedPair={selectedPair}
        onSelectPair={(p) => {
          setSelectedPair(p);
          if (onSelectPair) onSelectPair(p);
        }}
        selectedTimeframe={selectedTf}
        onSelectTimeframe={(tf) => {
          setSelectedTf(tf);
          if (onSelectTimeframe) onSelectTimeframe(tf);
        }}
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

      {/* 3. OHLC & Real-Time Market Ticker Strip */}
      <InfinityVisionOhlcBar
        pair={selectedPair}
        timeframe={selectedTf}
        open={currentBasePrice - 2.0}
        high={currentBasePrice + 1.77}
        low={currentBasePrice - 6.96}
        close={currentBasePrice}
        changePercent={-0.06}
        bidPrice={bidPrice}
        askPrice={askPrice}
        spreadPts={spreadPts}
        isLive={true}
        theme={theme}
      />

      {/* 4. Main Body: Central Candlestick Canvas + Right Sidebar */}
      <div className="flex-1 flex min-h-[520px] relative overflow-hidden">
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

        {/* Central Interactive Chart Canvas */}
        <div className="flex-1 relative flex flex-col min-w-0 bg-white dark:bg-terminal-950 overflow-hidden">
          <InfinityVisionChart
            candles={initialCandles}
            pair={selectedPair}
            timeframe={selectedTf}
            theme={theme}
            showQuantumSimulation={isQuantumVisionOpen}
            showMarketDna={isMarketDnaOpen}
            chartType={chartType}
            showPatternOnChart={showPatternOnChart}
            horizonCandles={horizonCandles}
          />
        </div>

        {/* Right Sidebar: Desktop (inline) or Mobile Drawer */}
        <div className={`
          ${isMobileRightSidebarOpen ? 'fixed inset-y-0 right-0 z-40 w-[320px] sm:w-[350px] shadow-2xl flex' : 'hidden lg:flex'}
          lg:static w-[320px] lg:w-[350px] shrink-0 border-l flex flex-col transition-all ${
          theme === 'light' 
            ? 'bg-white border-slate-200 shadow-sm' 
            : 'bg-terminal-950 border-terminal-border'
        }`}>
          {/* Mobile Close Button */}
          <div className="lg:hidden p-2 flex justify-end border-b border-slate-200 dark:border-terminal-border">
            <button
              onClick={() => setIsMobileRightSidebarOpen(false)}
              className="px-2.5 py-1 text-xs font-bold rounded bg-slate-100 dark:bg-terminal-900 border border-slate-300 dark:border-terminal-border"
            >
              Close Panel ✕
            </button>
          </div>

          {activeRightSidebarMode === 'scenarios' && (
            <ScenariosAndZonesSidebar
              pair={selectedPair}
              timeframe={selectedTf}
              theme={theme}
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

      {/* 5. Bottom Panel: Structure Timeline & Sessions */}
      <StructureTimelineBottom
        pair={selectedPair}
        timeframe={selectedTf}
        theme={theme}
      />

      {/* 6. Indicators Settings Drawer */}
      <IndicatorsModal
        isOpen={isIndicatorsOpen}
        onClose={() => setIsIndicatorsOpen(false)}
        theme={theme}
      />
    </div>
  );
};
