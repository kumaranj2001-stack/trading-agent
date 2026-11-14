'use client';

import React from 'react';
import { 
  Sliders, 
  Bot, 
  Zap, 
  Globe, 
  Coins, 
  Sun, 
  Moon, 
  ChevronDown, 
  Snowflake, 
  Compass,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Activity,
  Radio
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
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
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
  onToggleSidebar,
  isSidebarCollapsed = false,
  isAnalyzing,
  onTriggerAnalysis,
  activeSession,
  confluenceGrade = 'A+',
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
    ? 'Metals & Oil'
    : 'Spot Forex';

  const headerBg = theme === 'light'
    ? 'bg-white/95 border-b border-slate-200 text-slate-800 shadow-sm'
    : 'bg-terminal-950/95 border-b border-terminal-border/80 text-white backdrop-blur-md';

  const boxBg = theme === 'light'
    ? 'bg-slate-100 border-slate-300 text-slate-800'
    : 'bg-terminal-900 border-terminal-border text-white';

  const subBoxBg = theme === 'light'
    ? 'bg-slate-50 border-slate-200 text-slate-700'
    : 'bg-terminal-950/70 border-terminal-border/60 text-slate-300';

  return (
    <header className={`sticky top-0 z-40 w-full transition-colors duration-200 ${headerBg}`}>
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-2.5 space-y-2">
        {/* Row 1: Left (Sidebar toggle + Brand + Segment), Center (Direct Tech Analysis + Grade), Right (Actions) */}
        <div className="flex items-center justify-between gap-2.5 sm:gap-3 w-full min-w-0">
          {/* Left: Sidebar Toggle + Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Sidebar Toggle Button (Handles mobile drawer or desktop rail toggle) */}
            <button
              onClick={onToggleSidebar || onOpenLeftDrawer}
              className={`p-1.5 sm:p-2 rounded-xl border transition-all flex items-center justify-center shrink-0 active:scale-95 shadow-sm group ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                  : 'bg-terminal-800 hover:bg-terminal-700 border-terminal-border text-cyan-400'
              }`}
              title="Toggle Navigation Menu (Ctrl+B)"
              aria-label="Toggle Navigation Sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
            </button>

            {/* Brand Logo & Name */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className={`font-black tracking-wider text-xs sm:text-sm font-mono truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    QRI TRADER
                  </span>
                  {confluenceGrade && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-black font-mono border shrink-0 ${
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

                <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${isMarketFrozen ? 'bg-sky-400' : 'bg-emerald-400 animate-pulse'}`} />
                    <span className="truncate">{isMarketFrozen ? 'STATE FROZEN' : activeSession}</span>
                  </span>
                  <span>•</span>
                  <span>95 FEEDS</span>
                  <span>•</span>
                  <span>1,050+ RULES</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Middle: Market Segment Quick Switcher & Technical Analysis Direct CTA */}
          <div className="hidden md:flex items-center gap-2">
            <div className={`flex items-center p-1 rounded-xl border text-xs font-mono shrink-0 shadow-inner ${
              theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-terminal-900 border-terminal-border'
            }`}>
              <button
                onClick={() => {
                  onSelectMarketSegment('FOREX');
                  onSelectPair('EUR/USD');
                }}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  marketSegment === 'FOREX'
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
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
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  marketSegment === 'METALS_COMMODITIES'
                    ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                    : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
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
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                  marketSegment === 'INDIAN_MARKET'
                    ? 'bg-orange-600 text-white font-bold shadow-sm'
                    : theme === 'light' ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>🇮🇳</span>
                <span>NSE India</span>
              </button>
            </div>

            {/* Infinity Vision Technical Analysis Direct CTA */}
            {setActiveTab && (
              <button
                onClick={() => setActiveTab(activeTab === 'vision-atlas' ? 'terminal' : 'vision-atlas')}
                className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-sm shrink-0 ${
                  activeTab === 'vision-atlas' || (activeTab as string) === 'vision-atlas-lab'
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-md shadow-cyan-600/20'
                    : theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-cyan-800 border-slate-300'
                    : 'bg-terminal-800 hover:bg-terminal-700 text-cyan-300 border-terminal-border hover:text-white'
                }`}
                title="Launch Vision Atlas Multi-Factor Technical Workspace"
              >
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Vision Atlas</span>
              </button>
            )}
          </div>

          {/* Right: Swarm Recalibrate, Freeze Simulator, Settings & Theme Mode */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing}
              className={`px-2.5 sm:px-3 py-1.5 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95 ${
                isAnalyzing
                  ? 'bg-terminal-800 text-slate-500 cursor-not-allowed border border-terminal-border'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20'
              }`}
              title="Trigger 15s Multi-Agent Swarm Recalibration Cycle"
            >
              <Zap className={`w-3.5 h-3.5 text-cyan-300 ${isAnalyzing ? 'animate-spin' : 'animate-pulse'}`} />
              <span className="hidden sm:inline">
                {isAnalyzing ? 'RECALIBRATING...' : `SWARM${cycleNumber ? ` (#${cycleNumber})` : ' (15s)'}`}
              </span>
              <span className="sm:hidden text-[11px] font-bold">15s</span>
            </button>

            {onToggleFreeze && (
              <button
                onClick={onToggleFreeze}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors flex items-center gap-1 shadow-sm shrink-0 ${
                  isMarketFrozen 
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-300' 
                    : theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
                    : 'bg-terminal-800 hover:bg-terminal-700 border-terminal-border text-slate-300'
                }`}
                title={isMarketFrozen ? 'Market Closed - State Frozen' : 'Simulate Market Close State Freeze'}
                aria-label="Toggle Global State Freeze"
              >
                <Snowflake className={`w-4 h-4 ${isMarketFrozen ? 'text-sky-300 animate-pulse' : 'text-slate-400'}`} />
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors shadow-sm shrink-0 ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600'
                    : 'bg-terminal-800 hover:bg-terminal-700 border-terminal-border text-slate-300'
                }`}
                title="Configure Risk & Execution Settings"
                aria-label="Settings"
              >
                <Sliders className="w-4 h-4" />
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-1.5 sm:p-2 rounded-xl border transition-colors shadow-sm shrink-0 ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
                    : 'bg-terminal-800 hover:bg-terminal-700 border-terminal-border text-amber-400'
                }`}
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                aria-label="Toggle Theme Mode"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Mobile Market Switcher Sub-Row (Visible on <md screens) */}
        <div className="flex md:hidden items-center justify-between gap-2 w-full pt-1">
          <div className={`flex items-center p-0.5 rounded-xl border text-xs font-mono flex-1 justify-around ${
            theme === 'light' ? 'bg-slate-100 border-slate-300' : 'bg-terminal-900 border-terminal-border'
          }`}>
            <button
              onClick={() => {
                onSelectMarketSegment('FOREX');
                onSelectPair('EUR/USD');
              }}
              className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
                marketSegment === 'FOREX' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'
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
              className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
                marketSegment === 'METALS_COMMODITIES' ? 'bg-amber-500 text-black font-extrabold' : 'text-slate-400'
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
              className={`px-2 py-1 rounded-lg flex items-center gap-1 ${
                marketSegment === 'INDIAN_MARKET' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400'
              }`}
            >
              <span>🇮🇳</span>
              <span>NSE</span>
            </button>
          </div>

          {setActiveTab && (
            <button
              onClick={() => setActiveTab(activeTab === 'vision-atlas' ? 'terminal' : 'vision-atlas')}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1 ${
                activeTab === 'vision-atlas'
                  ? 'bg-cyan-600 text-white'
                  : theme === 'light' ? 'bg-slate-100 text-cyan-800 border-slate-300' : 'bg-terminal-800 text-cyan-300 border-terminal-border'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-cyan-400" />
              <span>Atlas</span>
            </button>
          )}
        </div>

        {/* Row 2: Standardized Target Pair Selector & Timeframe Switcher */}
        <div className={`p-2.5 rounded-xl border flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 sm:gap-4 font-mono text-xs shadow-sm ${subBoxBg}`}>
          {/* Target Asset Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-inner min-w-0 ${boxBg}`}>
              <span className="flex items-center gap-1 text-[11px] font-mono uppercase tracking-wider text-cyan-400 font-bold shrink-0">
                {segmentIcon}
                <span className="hidden xs:inline">TARGET PAIR:</span>
                <span className="xs:hidden">PAIR:</span>
              </span>

              <div className="relative flex items-center min-w-0">
                <select
                  value={selectedPair}
                  onChange={(e) => onSelectPair(e.target.value as CurrencyPair)}
                  className={`bg-transparent font-mono text-xs sm:text-sm font-black focus:outline-none cursor-pointer tracking-wide appearance-none pr-5 truncate ${
                    theme === 'light' ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {pairs.map((p) => (
                    <option key={p} value={p} className={theme === 'light' ? 'bg-white text-slate-900' : 'bg-terminal-900 text-white'}>
                      {p}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 pointer-events-none absolute right-0" />
              </div>

              {isMarketFrozen ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-950/90 text-sky-300 border border-sky-500/50 shrink-0 ml-1 flex items-center gap-1">
                  <Snowflake className="w-2.5 h-2.5 text-sky-400" />
                  FROZEN
                </span>
              ) : (
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0 ml-1" title="Real-Time Tick Stream Synced" />
              )}
            </div>

            <span className={`hidden md:inline-flex items-center text-[10px] font-mono px-2.5 py-1 rounded-lg border uppercase tracking-wider font-semibold shrink-0 ${boxBg}`}>
              {segmentLabel}
            </span>
          </div>

          {/* Timeframe Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto max-w-full">
            <span className="text-[10px] uppercase font-bold text-slate-400 hidden md:inline shrink-0">
              TIMEFRAME:
            </span>
            <div className={`flex items-center p-0.5 rounded-lg border shadow-inner overflow-x-auto scrollbar-none ${boxBg}`}>
              {TIMEFRAMES.map((tf) => (
                <button
                  key={tf}
                  onClick={() => onSelectTimeframe(tf)}
                  className={`px-2 sm:px-2.5 py-1 rounded-md text-[11px] sm:text-xs font-mono font-bold transition-all shrink-0 ${
                    timeframe === tf
                      ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-sm'
                      : theme === 'light'
                      ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
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
