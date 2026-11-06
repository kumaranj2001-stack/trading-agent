'use client';

import React, { useState } from 'react';
import { 
  Activity, 
  Shield, 
  Sliders, 
  Layers, 
  History, 
  Bot, 
  Zap, 
  Globe, 
  Radar, 
  Calendar, 
  LineChart, 
  PlayCircle,
  Database,
  Menu,
  X
} from 'lucide-react';
import { CurrencyPair, ExecutionMode, MarketSegment, TimeFrame } from '@/lib/types';
import { PortfolioState } from '@/lib/store';
import { FOREX_PAIRS, INDIAN_MARKET_ASSETS } from '@/lib/marketData';

interface HeaderProps {
  selectedPair: CurrencyPair;
  marketSegment: MarketSegment;
  onSelectMarketSegment: (seg: MarketSegment) => void;
  timeframe: TimeFrame;
  onSelectPair: (p: CurrencyPair) => void;
  onSelectTimeframe: (tf: TimeFrame) => void;
  activeTab: 'terminal' | 'debate' | 'backtest' | 'architecture';
  setActiveTab: (tab: 'terminal' | 'debate' | 'backtest' | 'architecture') => void;
  portfolio: PortfolioState;
  onOpenSettings: () => void;
  onOpenScanner: () => void;
  onOpenCalendar: () => void;
  onOpenMonteCarlo: () => void;
  onOpenKnowledge: () => void;
  isAnalyzing: boolean;
  onTriggerAnalysis: () => void;
  activeSession: string;
  executionMode: ExecutionMode;
  onToggleExecutionMode: () => void;
  confluenceGrade?: string;
  knowledgeStats?: { tech: number; fund: number };
}

const TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export const Header: React.FC<HeaderProps> = ({
  selectedPair,
  marketSegment,
  onSelectMarketSegment,
  timeframe,
  onSelectPair,
  onSelectTimeframe,
  activeTab,
  setActiveTab,
  portfolio,
  onOpenSettings,
  onOpenScanner,
  onOpenCalendar,
  onOpenMonteCarlo,
  onOpenKnowledge,
  isAnalyzing,
  onTriggerAnalysis,
  activeSession,
  executionMode,
  onToggleExecutionMode,
  confluenceGrade,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pairs = marketSegment === 'INDIAN_MARKET' ? INDIAN_MARKET_ASSETS : FOREX_PAIRS;

  return (
    <header className="border-b border-terminal-border bg-terminal-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        {/* Row 1: Brand, Mode, Market Scope & Mobile Menu Button */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Setup Grade */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-white tracking-wider text-xs sm:text-sm md:text-base truncate">
                  APEX <span className="text-cyan-400 font-mono">//</span> SWARM
                </span>
                {confluenceGrade && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border shrink-0 ${
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
              <div className="hidden xs:flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="truncate">{activeSession}</span>
                <span className="text-cyan-400/80">• 1,050+ RULES</span>
              </div>
            </div>
          </div>

          {/* Market Scope Selector: Forex vs Indian Market */}
          <div className="flex items-center bg-terminal-950 p-0.5 sm:p-1 rounded-lg border border-terminal-border font-mono text-[11px] sm:text-xs">
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
              <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Forex</span>
              <span className="sm:hidden">FX</span>
            </button>
            <button
              onClick={() => {
                onSelectMarketSegment('INDIAN_MARKET');
                onSelectPair('NIFTY 50');
              }}
              className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                marketSegment === 'INDIAN_MARKET'
                  ? 'bg-amber-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>🇮🇳</span>
              <span className="hidden sm:inline">NSE India</span>
              <span className="sm:hidden">NSE</span>
            </button>
          </div>

          {/* Action Trigger & Mobile Menu Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={onTriggerAnalysis}
              disabled={isAnalyzing}
              className={`px-2.5 sm:px-3 py-1.5 rounded font-mono text-xs font-semibold flex items-center gap-1 sm:gap-1.5 transition-all shadow-md ${
                isAnalyzing
                  ? 'bg-terminal-700 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isAnalyzing ? 'ANALYZING...' : 'RUN SWARM'}</span>
              <span className="xs:hidden">{isAnalyzing ? '...' : 'RUN'}</span>
            </button>

            <button
              onClick={onOpenSettings}
              className="p-1.5 sm:p-2 rounded bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
              title="Configure Risk & Settings"
              aria-label="Settings"
            >
              <Sliders className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 sm:p-2 rounded bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 text-cyan-400" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Row 2 (Desktop): Navigation Tabs, Quick Tools, Pair & Timeframe selector */}
        <div className="mt-2.5 pt-2 border-t border-terminal-border/50 hidden lg:flex items-center justify-between gap-3 text-xs font-mono">
          {/* Main Navigation Tabs */}
          <div className="flex items-center bg-terminal-950/80 p-0.5 rounded-lg border border-terminal-border">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTab === 'terminal' 
                  ? 'bg-terminal-800 text-cyan-400 font-bold border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Terminal</span>
            </button>
            <button
              onClick={() => setActiveTab('debate')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTab === 'debate' 
                  ? 'bg-terminal-800 text-purple-400 font-bold border border-purple-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Swarm Debate</span>
            </button>
            <button
              onClick={() => setActiveTab('backtest')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTab === 'backtest' 
                  ? 'bg-terminal-800 text-amber-400 font-bold border border-amber-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Backtest</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1 rounded flex items-center gap-1.5 transition-colors ${
                activeTab === 'architecture' 
                  ? 'bg-terminal-800 text-emerald-400 font-bold border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Roles</span>
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenKnowledge}
              className="px-2.5 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open 1,000+ Rule Knowledge Base"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-bold">Knowledge (1,050+)</span>
            </button>

            <button
              onClick={onToggleExecutionMode}
              className={`px-2.5 py-1 rounded font-bold border flex items-center gap-1.5 transition-all text-[11px] ${
                executionMode === 'FULL_AUTOPILOT'
                  ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 animate-pulse'
                  : executionMode === 'SEMI_AUTONOMOUS'
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                  : 'bg-terminal-800 text-slate-300 border-terminal-border'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>{executionMode.replace('_', ' ')}</span>
            </button>

            <button
              onClick={onOpenScanner}
              className="px-2 py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-cyan-400 border border-terminal-border flex items-center gap-1 transition-colors"
            >
              <Radar className="w-3.5 h-3.5" />
              <span>Scanner</span>
            </button>

            <button
              onClick={onOpenCalendar}
              className="px-2 py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-purple-400 border border-terminal-border flex items-center gap-1 transition-colors"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Calendar</span>
            </button>

            <button
              onClick={onOpenMonteCarlo}
              className="px-2 py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-emerald-400 border border-terminal-border flex items-center gap-1 transition-colors"
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>VaR</span>
            </button>
          </div>

          {/* Pair & Timeframe Selectors */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-terminal-950 px-2.5 py-1 rounded border border-terminal-border">
              <span className="text-[10px] text-slate-400">PAIR:</span>
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

            <div className="flex items-center gap-0.5 bg-terminal-950 p-0.5 rounded border border-terminal-border">
              {TIMEFRAMES.map(tf => (
                <button
                  key={tf}
                  onClick={() => onSelectTimeframe(tf)}
                  className={`px-1.5 py-0.5 rounded text-[11px] transition-all ${
                    timeframe === tf 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tf.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2 (Mobile / Tablet Controls): Scrollable Pair + Timeframes */}
        <div className="mt-2 pt-2 border-t border-terminal-border/40 flex lg:hidden items-center justify-between gap-2 overflow-x-auto scrollbar-none font-mono text-xs">
          <div className="flex items-center gap-1.5 shrink-0 bg-terminal-950 px-2 py-1 rounded border border-terminal-border">
            <span className="text-[10px] text-slate-400">PAIR:</span>
            <select
              value={selectedPair}
              onChange={(e) => onSelectPair(e.target.value as CurrencyPair)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              {pairs.map(p => (
                <option key={p} value={p} className="bg-terminal-900 text-white font-medium">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 shrink-0 bg-terminal-950 p-0.5 rounded border border-terminal-border">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-1.5 py-0.5 rounded text-[11px] transition-all ${
                  timeframe === tf 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Navigation & Quick Tools Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-3 pt-3 border-t border-terminal-border/70 flex flex-col gap-3 font-mono text-xs animate-fade-in">
            {/* Mobile Nav Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-terminal-950 p-1.5 rounded-lg border border-terminal-border">
              <button
                onClick={() => { setActiveTab('terminal'); setMobileMenuOpen(false); }}
                className={`py-2 px-2.5 rounded text-center flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'terminal' 
                    ? 'bg-terminal-800 text-cyan-400 font-bold border border-cyan-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Terminal</span>
              </button>
              <button
                onClick={() => { setActiveTab('debate'); setMobileMenuOpen(false); }}
                className={`py-2 px-2.5 rounded text-center flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'debate' 
                    ? 'bg-terminal-800 text-purple-400 font-bold border border-purple-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Debate</span>
              </button>
              <button
                onClick={() => { setActiveTab('backtest'); setMobileMenuOpen(false); }}
                className={`py-2 px-2.5 rounded text-center flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'backtest' 
                    ? 'bg-terminal-800 text-amber-400 font-bold border border-amber-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span>Backtest</span>
              </button>
              <button
                onClick={() => { setActiveTab('architecture'); setMobileMenuOpen(false); }}
                className={`py-2 px-2.5 rounded text-center flex items-center justify-center gap-1.5 transition-colors ${
                  activeTab === 'architecture' 
                    ? 'bg-terminal-800 text-emerald-400 font-bold border border-emerald-500/30' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Roles</span>
              </button>
            </div>

            {/* Mobile Quick Tools Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => { onOpenKnowledge(); setMobileMenuOpen(false); }}
                className="p-2 rounded bg-indigo-950/80 border border-indigo-700/60 text-indigo-300 font-bold flex items-center justify-center gap-1.5"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span>1,050+ Rules</span>
              </button>

              <button
                onClick={onToggleExecutionMode}
                className={`p-2 rounded font-bold border flex items-center justify-center gap-1.5 text-[11px] ${
                  executionMode === 'FULL_AUTOPILOT'
                    ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                    : executionMode === 'SEMI_AUTONOMOUS'
                    ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                    : 'bg-terminal-800 text-slate-300 border-terminal-border'
                }`}
              >
                <PlayCircle className="w-3.5 h-3.5" />
                <span>{executionMode.replace('_', ' ')}</span>
              </button>

              <button
                onClick={() => { onOpenScanner(); setMobileMenuOpen(false); }}
                className="p-2 rounded bg-terminal-800 text-cyan-400 border border-terminal-border flex items-center justify-center gap-1.5"
              >
                <Radar className="w-3.5 h-3.5" />
                <span>Scanner</span>
              </button>

              <button
                onClick={() => { onOpenCalendar(); setMobileMenuOpen(false); }}
                className="p-2 rounded bg-terminal-800 text-purple-400 border border-terminal-border flex items-center justify-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>

              <button
                onClick={() => { onOpenMonteCarlo(); setMobileMenuOpen(false); }}
                className="p-2 rounded bg-terminal-800 text-emerald-400 border border-terminal-border flex items-center justify-center gap-1.5 col-span-2 sm:col-span-4"
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Monte Carlo 1,000-Path VaR</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
