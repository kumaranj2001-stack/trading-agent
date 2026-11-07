'use client';

import React from 'react';
import { 
  Bot, 
  Zap, 
  Globe, 
  Coins,
  Menu,
  Sun,
  Moon,
  PlayCircle,
  Activity,
  Layers
} from 'lucide-react';
import { CurrencyPair, ExecutionMode, MarketSegment, TimeFrame } from '@/lib/types';
import { PortfolioState } from '@/lib/store';
import { FOREX_PAIRS, INDIAN_MARKET_ASSETS, METALS_COMMODITIES } from '@/lib/marketData';

interface HeaderProps {
  onToggleSidebar: () => void;
  selectedPair: CurrencyPair;
  marketSegment: MarketSegment;
  onSelectMarketSegment: (seg: MarketSegment) => void;
  timeframe: TimeFrame;
  onSelectPair: (p: CurrencyPair) => void;
  onSelectTimeframe: (tf: TimeFrame) => void;
  portfolio: PortfolioState;
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
  activeSession: string;
  executionMode: ExecutionMode;
  onToggleExecutionMode: () => void;
  confluenceGrade?: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

const TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  selectedPair,
  marketSegment,
  onSelectMarketSegment,
  timeframe,
  onSelectPair,
  onSelectTimeframe,
  portfolio,
  isAnalyzing,
  onTriggerAnalysis,
  activeSession,
  executionMode,
  onToggleExecutionMode,
  confluenceGrade,
  theme,
  onToggleTheme,
}) => {
  const pairs = marketSegment === 'INDIAN_MARKET' 
    ? INDIAN_MARKET_ASSETS 
    : marketSegment === 'METALS_COMMODITIES'
    ? METALS_COMMODITIES
    : FOREX_PAIRS;

  return (
    <header className="border-b border-terminal-border bg-terminal-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-4">
          
          {/* Left: Collapsible Hamburger Button & Brand */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-terminal-800 hover:bg-terminal-700 text-slate-200 hover:text-white border border-terminal-border/80 transition-all shadow-sm hover:border-cyan-500/50 active:scale-95 flex items-center justify-center shrink-0"
              title="Open Navigation Menu (Terminal, Agents, Backtest, Journal, etc.)"
              aria-label="Open navigation sidebar"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            </button>

            {/* Brand Title */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="font-bold text-white tracking-wider text-xs sm:text-sm font-mono truncate">
                    APEX <span className="text-cyan-400">//</span> 6-AGENT SWARM
                  </span>
                  {confluenceGrade && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-bold border shrink-0 ${
                      confluenceGrade === 'A+' || confluenceGrade === 'A'
                        ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                        : confluenceGrade === 'B'
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    }`}>
                      {confluenceGrade}
                    </span>
                  )}
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="truncate">{activeSession}</span>
                  <span className="text-sky-400/90">• 18 WIRES</span>
                  <span className="text-rose-400/90">• MEMORY LOOP</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center: Streamlined Target Currency Pair & Timeframe Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Market Segment Selector Tabs */}
            <div className="flex items-center bg-terminal-950 p-0.5 rounded-lg border border-terminal-border font-mono text-xs">
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
                title="Forex Major & Cross Pairs"
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Forex</span>
                <span className="sm:hidden">FX</span>
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
                title="Gold, Silver, Platinum, Copper & Crude Oil"
              >
                <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">Metals & Oil</span>
                <span className="sm:hidden">Metals</span>
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
                title="NSE NIFTY 50, Bank Nifty, Reliance, etc."
              >
                <span>🇮🇳</span>
                <span className="hidden sm:inline">NSE India</span>
                <span className="sm:hidden">NSE</span>
              </button>
            </div>

            {/* Target Symbol Select Dropdown */}
            <div className="flex items-center gap-1 bg-terminal-950 px-2 sm:px-2.5 py-1 rounded-lg border border-terminal-border font-mono text-xs shadow-inner">
              <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">Pair:</span>
              <select
                value={selectedPair}
                onChange={(e) => onSelectPair(e.target.value as CurrencyPair)}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer font-bold"
              >
                {pairs.map(p => (
                  <option key={p} value={p} className="bg-terminal-900 text-white font-medium">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Timeframe Selector Pills */}
            <div className="hidden sm:flex items-center gap-0.5 bg-terminal-950 p-0.5 rounded-lg border border-terminal-border font-mono text-xs">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => onSelectTimeframe(tf)}
                  className={`px-2 py-0.5 rounded transition-colors text-[11px] ${
                    timeframe === tf
                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Dark/Light Mode Switch, Execution Mode & Run Swarm */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* ☀️ / 🌙 Dark Mode / Light Mode Changing Option */}
            <button
              onClick={onToggleTheme}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-terminal-950 hover:bg-terminal-800 border border-terminal-border/80 text-xs font-mono flex items-center gap-1.5 transition-all shadow-sm hover:border-amber-400/50"
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline text-slate-300 font-semibold">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-500" />
                  <span className="hidden sm:inline text-slate-700 font-semibold">Dark</span>
                </>
              )}
            </button>

            {/* Execution Mode Pill */}
            <button
              onClick={onToggleExecutionMode}
              className={`hidden md:flex px-2.5 py-1.5 rounded-lg font-mono text-[11px] font-bold border items-center gap-1.5 transition-all shadow-sm ${
                executionMode === 'FULL_AUTOPILOT'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 animate-pulse'
                  : executionMode === 'SEMI_AUTONOMOUS'
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                  : 'bg-terminal-950 text-slate-300 border-terminal-border'
              }`}
              title="Click to toggle execution mode (Manual / Co-Pilot / Autopilot)"
            >
              <PlayCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>{executionMode.replace('_', ' ')}</span>
            </button>

            {/* Run Swarm Synchronizer Button */}
            <button
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                isAnalyzing
                  ? 'bg-terminal-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isAnalyzing ? 'SYNCING...' : 'RUN SWARM'}</span>
              <span className="sm:hidden">{isAnalyzing ? '...' : 'RUN'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Timeframe Row (visible on small screens only) */}
        <div className="flex sm:hidden items-center justify-between mt-2 pt-2 border-t border-terminal-border/40 font-mono text-xs">
          <span className="text-[10px] text-slate-400 uppercase">TIMEFRAME:</span>
          <div className="flex items-center gap-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-2 py-0.5 rounded text-[11px] ${
                  timeframe === tf
                    ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};
