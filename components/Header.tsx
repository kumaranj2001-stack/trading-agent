'use client';

import React from 'react';
import { 
  Sliders, 
  Bot, 
  Zap, 
  Globe, 
  MoreVertical,
  Coins,
  Sun,
  Moon,
  ChevronDown,
  Snowflake,
  Lock,
  Compass
} from 'lucide-react';
import { CurrencyPair, ExecutionMode, MarketSegment, MarketSessionInfo, TimeFrame, NavigationTab } from '@/lib/types';
import { PortfolioState } from '@/lib/store';
import { FOREX_PAIRS, INDIAN_MARKET_ASSETS, METALS_COMMODITIES } from '@/lib/marketData';

export interface HeaderProps {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  selectedPair: CurrencyPair;
  marketSegment: MarketSegment;
  onSelectMarketSegment: (seg: MarketSegment) => void;
  timeframe: TimeFrame;
  onSelectPair: (p: CurrencyPair) => void;
  onSelectTimeframe: (tf: TimeFrame) => void;
  activeTab?: NavigationTab | string;
  setActiveTab?: (tab: any) => void;
  portfolio?: PortfolioState;
  onOpenSettings?: () => void;
  onOpenScanner?: () => void;
  onOpenCalendar?: () => void;
  onOpenMonteCarlo?: () => void;
  onOpenKnowledge?: () => void;
  onOpenNewsWire?: () => void;
  onOpenFirebase?: () => void;
  onOpenJournal?: () => void;
  onOpenLeftDrawer?: () => void;
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
  activeSession: string;
  executionMode?: ExecutionMode;
  onToggleExecutionMode?: () => void;
  confluenceGrade?: string;
  knowledgeStats?: { tech: number; fund: number };
  isMarketFrozen?: boolean;
  sessionInfo?: MarketSessionInfo | null;
  onToggleFreeze?: () => void;
  cycleNumber?: number;
}

const TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const Header: React.FC<HeaderProps> = ({
  theme = 'dark',
  onToggleTheme,
  selectedPair,
  marketSegment,
  onSelectMarketSegment,
  timeframe,
  onSelectPair,
  onSelectTimeframe,
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenLeftDrawer,
  isAnalyzing,
  onTriggerAnalysis,
  activeSession,
  confluenceGrade,
  isMarketFrozen = false,
  sessionInfo = null,
  onToggleFreeze,
  cycleNumber,
}) => {
  const pairs = marketSegment === 'INDIAN_MARKET' 
    ? INDIAN_MARKET_ASSETS 
    : marketSegment === 'METALS_COMMODITIES'
    ? METALS_COMMODITIES
    : FOREX_PAIRS;

  const segmentIcon = marketSegment === 'INDIAN_MARKET'
    ? '🇮🇳'
    : marketSegment === 'METALS_COMMODITIES'
    ? <Coins className="w-3.5 h-3.5 text-amber-400" />
    : <Globe className="w-3.5 h-3.5 text-cyan-400" />;

  const segmentLabel = marketSegment === 'INDIAN_MARKET'
    ? 'NSE India'
    : marketSegment === 'METALS_COMMODITIES'
    ? 'Metals & Commodities'
    : 'Spot Forex';

  return (
    <header className="border-b border-terminal-border bg-terminal-900/95 backdrop-blur-md sticky top-0 z-40 w-full transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 space-y-2">
        {/* Row 1: Brand & Nav Controls (Responsive Split across Mobile & Desktop) */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
          {/* Left: Attached completely to the left - Three-dot drawer button + Brand */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Hamburger / Navigation Desk Three-Dot Trigger */}
            <button
              onClick={onOpenLeftDrawer}
              className="p-1.5 sm:p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border transition-colors flex items-center justify-center shrink-0 active:scale-95 shadow-sm group"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <MoreVertical className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </button>

            {/* Brand Logo & Title */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-white tracking-wider text-xs sm:text-sm md:text-base truncate">
                  QRI TRADER <span className="text-cyan-400 font-mono">//</span> <span className="hidden xs:inline">5-AGENT SWARM</span>
                </span>
                {confluenceGrade && (
                  <span className={`text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded font-bold border shrink-0 ${
                    confluenceGrade === 'A+' || confluenceGrade === 'A'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : confluenceGrade === 'B'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}>
                    GRADE {confluenceGrade}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex items-center gap-2 text-[11px]">
                <span className={`inline-block w-2 h-2 rounded-full ${
                  isMarketFrozen ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'
                }`}></span>
                <span className={`truncate font-semibold ${
                  isMarketFrozen ? 'text-sky-300 font-bold' : 'text-slate-400'
                }`}>
                  {isMarketFrozen ? `❄️ STATE FROZEN (${sessionInfo?.statusLabel || activeSession})` : activeSession}
                </span>
                <span className="text-sky-400/90 font-medium hidden md:inline">• 38 NEWS WIRES</span>
                <span className="text-cyan-400/80 hidden lg:inline font-medium">• 1,050+ RULES</span>
                <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-cyan-300 border border-indigo-500/40 text-[10px] font-mono font-bold hidden xl:flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-cyan-400 animate-pulse" />
                  <span>24/7 AUTONOMOUS SWARM</span>
                </span>
              </div>
            </div>
          </div>

          {/* Desktop Middle: Market Scope Selector & Technical Analysis */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center bg-terminal-950 p-1 rounded-lg border border-terminal-border text-xs sm:text-sm shrink-0">
              <button
                onClick={() => {
                  onSelectMarketSegment('FOREX');
                  onSelectPair('EUR/USD');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  marketSegment === 'FOREX'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Forex</span>
              </button>

              <button
                onClick={() => {
                  onSelectMarketSegment('METALS_COMMODITIES');
                  onSelectPair('XAU/USD');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  marketSegment === 'METALS_COMMODITIES'
                    ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                <span>Metals & Oil</span>
              </button>

              <button
                onClick={() => {
                  onSelectMarketSegment('INDIAN_MARKET');
                  onSelectPair('NIFTY 50');
                }}
                className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                  marketSegment === 'INDIAN_MARKET'
                    ? 'bg-orange-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇮🇳</span>
                <span>NSE India</span>
              </button>
            </div>

            {/* Infinity Vision Technical Analysis Direct Trigger Button */}
            {setActiveTab && (
              <button
                onClick={() => setActiveTab(activeTab === 'vision-atlas' ? 'terminal' : 'vision-atlas')}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                  activeTab === 'vision-atlas' || (activeTab as string) === 'vision-atlas-lab'
                    ? 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold shadow-sm'
                    : 'bg-terminal-800 hover:bg-terminal-700 text-cyan-300 border-terminal-border hover:text-white'
                }`}
                title="Open Infinity Vision Technical Analysis Terminal"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Technical Analysis</span>
              </button>
            )}
          </div>

          {/* Right: Swarm Synchronizer, Risk Settings, and Dark/Light Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing}
              className={`px-2.5 sm:px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shadow-md shrink-0 ${
                isAnalyzing
                  ? 'bg-terminal-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95'
              }`}
              title="24/7 Autonomous Multi-Agent Swarm continuously looping across 5 desks"
            >
              <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : 'text-cyan-300 animate-pulse'}`} />
              <span className="hidden sm:inline">
                {isAnalyzing ? 'PULSING SWARM...' : `24/7 SWARM ACTIVE${cycleNumber ? ` (#${cycleNumber})` : ''}`}
              </span>
              <span className="sm:hidden text-[11px] font-bold">
                {isAnalyzing ? '...' : 'PULSE'}
              </span>
            </button>

            {onToggleFreeze && (
              <button
                onClick={onToggleFreeze}
                className={`p-1.5 sm:p-2 rounded-lg border transition-colors flex items-center gap-1 shadow-sm shrink-0 ${
                  isMarketFrozen 
                    ? 'bg-sky-950/80 border-sky-500/60 text-sky-300 hover:bg-sky-900' 
                    : 'bg-terminal-800 hover:bg-terminal-700 border-terminal-border text-slate-300'
                }`}
                title={isMarketFrozen ? 'Global State Frozen upon Market Close' : 'Simulate Market Close State Freeze'}
                aria-label="Toggle Global State Freeze"
              >
                <Snowflake className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isMarketFrozen ? 'text-sky-300 animate-pulse' : 'text-slate-400'}`} />
                <span className="hidden xl:inline text-[10px] font-bold uppercase tracking-wider">
                  {isMarketFrozen ? 'Frozen' : 'Live'}
                </span>
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-1.5 sm:p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors shadow-sm shrink-0"
                title="Configure Risk & Settings"
                aria-label="Settings"
              >
                <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 sm:p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 shadow-sm shrink-0"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme Mode"
              >
                {theme === 'dark' ? (
                  <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-indigo-500" />
                )}
                <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider">
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Row: Market Scope Selector & Technical Analysis (Visible on <md screens) */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full pt-1 border-t border-terminal-border/40">
          <div className="flex items-center bg-terminal-950 p-1 rounded-lg border border-terminal-border text-xs flex-1 justify-around">
            <button
              onClick={() => {
                onSelectMarketSegment('FOREX');
                onSelectPair('EUR/USD');
              }}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                marketSegment === 'FOREX'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>Forex</span>
            </button>

            <button
              onClick={() => {
                onSelectMarketSegment('METALS_COMMODITIES');
                onSelectPair('XAU/USD');
              }}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                marketSegment === 'METALS_COMMODITIES'
                  ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3 h-3" />
              <span>Metals</span>
            </button>

            <button
              onClick={() => {
                onSelectMarketSegment('INDIAN_MARKET');
                onSelectPair('NIFTY 50');
              }}
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                marketSegment === 'INDIAN_MARKET'
                  ? 'bg-orange-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳</span>
              <span>NSE</span>
            </button>
          </div>

          {setActiveTab && (
            <button
              onClick={() => setActiveTab(activeTab === 'vision-atlas' ? 'terminal' : 'vision-atlas')}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all shadow-sm shrink-0 ${
                activeTab === 'vision-atlas' || (activeTab as string) === 'vision-atlas-lab'
                  ? 'bg-slate-100 text-slate-900 border-slate-300 font-extrabold shadow-sm'
                  : 'bg-terminal-800 hover:bg-terminal-700 text-cyan-300 border-terminal-border hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Analysis</span>
            </button>
          )}
        </div>

        {/* Row 2: REDESIGNED STREAMLINED AREA
            (Navigation tabs from Terminal through VaR are removed and housed in the 3-dot menu).
            This area now exclusively showcases the Target & Currency Pair alongside Timeframes in a
            fully responsive, perfectly aligned layout with zero empty corner gaps and zoom stability. */}
        <div className="pt-2 border-t border-terminal-border/50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4 bg-terminal-950/70 rounded-xl px-3 sm:px-4 py-2 border border-terminal-border/60 shadow-sm min-w-0">
          {/* Target Asset & Currency Pair Selector in New Layout */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="flex items-center gap-2 bg-terminal-900 px-3 py-1.5 rounded-lg border border-terminal-border shadow-inner min-w-0">
              <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold shrink-0">
                {segmentIcon}
                <span className="hidden xs:inline">TARGET PAIR:</span>
                <span className="xs:hidden">PAIR:</span>
              </span>

              <div className="relative flex items-center min-w-0">
                <select
                  value={selectedPair}
                  onChange={(e) => onSelectPair(e.target.value as CurrencyPair)}
                  className="bg-transparent text-white font-mono text-xs sm:text-sm font-extrabold focus:outline-none cursor-pointer tracking-wide appearance-none pr-5 truncate"
                >
                  {pairs.map((p) => (
                    <option key={p} value={p} className="bg-terminal-900 text-white font-medium">
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-0" />
              </div>

              {isMarketFrozen ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-sky-950/90 text-sky-300 border border-sky-500/50 shrink-0 ml-1 flex items-center gap-1" title="Market Closed - Global State Frozen">
                  <Snowflake className="w-2.5 h-2.5 text-sky-400" />
                  FROZEN
                </span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" title="Live Market Stream Active" />
              )}
            </div>

            {/* Dynamic Market Segment Badge */}
            <span className="hidden md:inline-flex items-center text-[10px] font-mono px-2.5 py-1 rounded-md bg-terminal-900 border border-terminal-border text-slate-400 uppercase tracking-wider font-semibold shrink-0">
              {segmentLabel}
            </span>
          </div>

          {/* Timeframe Selector in New Layout */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto max-w-full">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold hidden md:inline shrink-0">
              TIMEFRAME:
            </span>
            <div className="flex items-center bg-terminal-900 p-0.5 rounded-lg border border-terminal-border shadow-inner overflow-x-auto scrollbar-none touch-pan-x">
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => onSelectTimeframe(tf)}
                  className={`px-1.5 xs:px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-bold transition-all shrink-0 ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm shadow-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-terminal-800'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
