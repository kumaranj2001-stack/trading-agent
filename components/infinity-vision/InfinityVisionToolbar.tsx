'use client';

import React from 'react';
import { 
  SlidersHorizontal, 
  Atom, 
  Dna, 
  Compass, 
  Droplets, 
  Maximize2, 
  Camera, 
  Settings, 
  Sun, 
  Moon,
  ChevronDown,
  Layers
} from 'lucide-react';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { FOREX_PAIRS, METALS_COMMODITIES, INDIAN_MARKET_ASSETS } from '@/lib/marketData';

export type ChartViewMode = 'Clean' | 'Standard' | 'Advanced';

export interface InfinityVisionToolbarProps {
  selectedPair: CurrencyPair;
  onSelectPair: (p: CurrencyPair) => void;
  selectedTimeframe: TimeFrame | '30m' | '1W';
  onSelectTimeframe: (tf: any) => void;
  chartViewMode: ChartViewMode;
  onChangeChartViewMode: (mode: ChartViewMode) => void;
  isQuantumVisionOpen: boolean;
  onToggleQuantumVision: () => void;
  isMarketDnaOpen: boolean;
  onToggleMarketDna: () => void;
  isVisionAtlasLabOpen: boolean;
  onToggleVisionAtlasLab: () => void;
  isLiquidityOpen: boolean;
  onToggleLiquidity: () => void;
  isIndicatorsOpen: boolean;
  onToggleIndicators: () => void;
  isMobileSidebarOpen?: boolean;
  onToggleMobileSidebar?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onTakeScreenshot?: () => void;
}

const TIMEFRAMES: Array<TimeFrame | '30m' | '1W'> = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1W'];

export const InfinityVisionToolbar: React.FC<InfinityVisionToolbarProps> = ({
  selectedPair,
  onSelectPair,
  selectedTimeframe,
  onSelectTimeframe,
  chartViewMode,
  onChangeChartViewMode,
  isQuantumVisionOpen,
  onToggleQuantumVision,
  isMarketDnaOpen,
  onToggleMarketDna,
  isVisionAtlasLabOpen,
  onToggleVisionAtlasLab,
  isLiquidityOpen,
  onToggleLiquidity,
  isIndicatorsOpen,
  onToggleIndicators,
  isMobileSidebarOpen = false,
  onToggleMobileSidebar,
  theme = 'light',
  onToggleTheme,
  onTakeScreenshot,
}) => {
  const isLight = theme === 'light';

  // Format pair label without slash for Infinity Vision aesthetic (e.g. XAUUSD)
  const formatPairLabel = (p: string) => p.replace('/', '');

  return (
    <div className={`w-full px-3 py-2 border-b select-none flex flex-wrap items-center justify-between gap-2.5 transition-colors ${
      isLight 
        ? 'bg-slate-50/90 border-slate-200 text-slate-800' 
        : 'bg-terminal-900/90 border-terminal-border text-slate-200'
    }`}>
      {/* Left: VISION label, Pair Dropdown & Timeframe Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* VISION Label & Pair Select */}
        <div className="flex items-center gap-1.5">
          <span className={`text-[11px] font-black uppercase tracking-wider ${
            isLight ? 'text-slate-500' : 'text-slate-400'
          }`}>
            VISION
          </span>

          <div className="relative">
            <select
              value={selectedPair}
              onChange={(e) => onSelectPair(e.target.value as CurrencyPair)}
              className={`appearance-none pl-2.5 pr-6 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'
                  : 'bg-terminal-950 border-terminal-border text-white hover:border-cyan-500/50'
              }`}
            >
              <optgroup label="Metals & Commodities">
                {METALS_COMMODITIES.map((p) => (
                  <option key={p} value={p}>{formatPairLabel(p)}</option>
                ))}
              </optgroup>
              <optgroup label="Forex">
                {FOREX_PAIRS.map((p) => (
                  <option key={p} value={p}>{formatPairLabel(p)}</option>
                ))}
              </optgroup>
              <optgroup label="Indian Market">
                {INDIAN_MARKET_ASSETS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Timeframe Pills */}
        <div className={`flex items-center p-0.5 rounded-lg border text-[11px] font-semibold ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          {TIMEFRAMES.map((tf) => {
            const isActive = selectedTimeframe.toLowerCase() === tf.toLowerCase();
            return (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition-all ${
                  isActive
                    ? isLight
                      ? 'bg-slate-200 text-slate-900 font-bold shadow-xs'
                      : 'bg-cyan-600 text-white font-bold'
                    : isLight
                    ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    : 'text-slate-400 hover:text-white hover:bg-terminal-800'
                }`}
              >
                {tf}
              </button>
            );
          })}
        </div>

        {/* Chart View Modes: Clean | Standard | Advanced */}
        <div className={`hidden sm:flex items-center p-0.5 rounded-lg border text-[11px] font-semibold ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          {(['Clean', 'Standard', 'Advanced'] as ChartViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => onChangeChartViewMode(mode)}
              className={`px-2 py-0.5 rounded transition-all ${
                chartViewMode === mode
                  ? isLight
                    ? 'bg-slate-200 text-slate-900 font-bold shadow-xs'
                    : 'bg-terminal-800 text-cyan-300 font-bold border border-cyan-500/30'
                  : isLight
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-terminal-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Center/Right Action Buttons */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* Indicators Button */}
        <button
          onClick={onToggleIndicators}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
            isIndicatorsOpen
              ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
              : isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-terminal-800 border-terminal-border text-slate-300 hover:text-white hover:bg-terminal-700'
          }`}
          title="Toggle Comprehensive Indicators Drawer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Indicators</span>
        </button>

        {/* QUANTUM VISION (Blue Pill Button) */}
        <button
          onClick={onToggleQuantumVision}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-xs ${
            isQuantumVisionOpen
              ? 'bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-blue-400/50'
              : 'bg-blue-500/15 text-blue-600 border border-blue-500/40 hover:bg-blue-500/25'
          }`}
          title="Toggle Quantum Vision Simulation Panel"
        >
          <Atom className="w-3.5 h-3.5" />
          <span>QUANTUM VISION</span>
        </button>

        {/* MARKET DNA (Golden/Amber Pill Button) */}
        <button
          onClick={onToggleMarketDna}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-xs ${
            isMarketDnaOpen
              ? 'bg-amber-600 text-white hover:bg-amber-700 ring-2 ring-amber-400/50'
              : 'bg-amber-500/15 text-amber-700 border border-amber-500/40 hover:bg-amber-500/25'
          }`}
          title="Toggle Infinity Fusion DNA Analysis Panel"
        >
          <Dna className="w-3.5 h-3.5" />
          <span>MARKET DNA</span>
        </button>

        {/* VISION ATLAS LAB (Dark Slate Pill Button) */}
        <button
          onClick={onToggleVisionAtlasLab}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all shadow-xs ${
            isVisionAtlasLabOpen
              ? 'bg-slate-800 text-white hover:bg-slate-900 ring-2 ring-slate-400/50'
              : isLight
              ? 'bg-slate-200 text-slate-800 border border-slate-300 hover:bg-slate-300'
              : 'bg-terminal-800 text-slate-200 border border-terminal-border hover:bg-terminal-700'
          }`}
          title="Toggle Vision Atlas Lab Multi-Factor & Audio Desk"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>VISION ATLAS LAB</span>
        </button>

        {/* LIQUIDITY (Outline Pill Button) */}
        <button
          onClick={onToggleLiquidity}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition-all ${
            isLiquidityOpen
              ? isLight
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-cyan-600 text-white border-cyan-500'
              : isLight
              ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              : 'bg-terminal-800 border-terminal-border text-slate-300 hover:text-white'
          }`}
          title="Toggle Liquidity Heatmap Float Window"
        >
          <Droplets className="w-3.5 h-3.5 text-blue-500" />
          <span>LIQUIDITY</span>
        </button>

        {/* Mobile Right Sidebar Toggle (Zones & DNA) */}
        {onToggleMobileSidebar && (
          <button
            onClick={onToggleMobileSidebar}
            className={`lg:hidden flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors ${
              isMobileSidebarOpen
                ? 'bg-slate-900 text-white border-slate-900'
                : isLight
                ? 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
                : 'bg-terminal-800 border-terminal-border text-slate-200'
            }`}
            title="Toggle Right Side Panel"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-500" />
            <span>Zones</span>
          </button>
        )}

        {/* Quick Tools: Theme Toggle, Screenshot */}
        <div className="flex items-center gap-1 pl-1 border-l border-slate-300 dark:border-terminal-border">
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className={`p-1.5 rounded-md border transition-colors ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                  : 'bg-terminal-800 border-terminal-border text-slate-300 hover:text-white'
              }`}
              title={isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {isLight ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            </button>
          )}

          {onTakeScreenshot && (
            <button
              onClick={onTakeScreenshot}
              className={`p-1.5 rounded-md border transition-colors ${
                isLight 
                  ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100' 
                  : 'bg-terminal-800 border-terminal-border text-slate-300 hover:text-white'
              }`}
              title="Screenshot Chart"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
