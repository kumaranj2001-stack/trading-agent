'use client';

import React from 'react';
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
  TrendingUp
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
  knowledgeStats = { tech: 525, fund: 525 },
}) => {
  const pairs = marketSegment === 'INDIAN_MARKET' ? INDIAN_MARKET_ASSETS : FOREX_PAIRS;

  return (
    <header className="border-b border-terminal-border bg-terminal-900/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Status */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white tracking-wider text-base">APEX // TRADING SWARM</span>
              {confluenceGrade && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold border ${
                  confluenceGrade === 'A+' || confluenceGrade === 'A'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : confluenceGrade === 'B'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}>
                  {confluenceGrade} SETUP
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>SESSION: {activeSession}</span>
              <span>•</span>
              <span className="text-cyan-400">1,050+ RULES LOADED</span>
            </div>
          </div>
        </div>

        {/* Market Scope Selector: Forex vs Indian Market */}
        <div className="flex items-center bg-terminal-950 p-1 rounded-lg border border-terminal-border font-mono text-xs">
          <button
            onClick={() => {
              onSelectMarketSegment('FOREX');
              onSelectPair('EUR/USD');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              marketSegment === 'FOREX'
                ? 'bg-cyan-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Forex Market</span>
          </button>
          <button
            onClick={() => {
              onSelectMarketSegment('INDIAN_MARKET');
              onSelectPair('NIFTY 50');
            }}
            className={`px-2.5 py-1 rounded flex items-center gap-1.5 transition-colors ${
              marketSegment === 'INDIAN_MARKET'
                ? 'bg-amber-600 text-white font-bold shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇮🇳 Indian Market (NSE)</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-terminal-950/80 p-1 rounded-lg border border-terminal-border font-mono text-xs">
          <button
            onClick={() => setActiveTab('terminal')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'terminal' 
                ? 'bg-terminal-800 text-cyan-400 shadow-sm border border-cyan-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>
          <button
            onClick={() => setActiveTab('debate')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'debate' 
                ? 'bg-terminal-800 text-purple-400 shadow-sm border border-purple-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Agent Debate</span>
          </button>
          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'backtest' 
                ? 'bg-terminal-800 text-amber-400 shadow-sm border border-amber-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Backtest</span>
          </button>
          <button
            onClick={() => setActiveTab('architecture')}
            className={`px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors ${
              activeTab === 'architecture' 
                ? 'bg-terminal-800 text-emerald-400 shadow-sm border border-emerald-500/30' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Roles</span>
          </button>
        </div>

        {/* Quick Tools: Knowledge Base Explorer, Scanner, Calendar, VaR, Autopilot */}
        <div className="flex items-center gap-2">
          {/* 1,000+ Knowledge Base Button */}
          <button
            onClick={onOpenKnowledge}
            className="px-2.5 py-1 rounded bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-mono flex items-center gap-1.5 transition-colors shadow-sm"
            title="Open 1,000+ Rule Knowledge Base"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold">Knowledge (1,050+)</span>
          </button>

          {/* Autopilot Mode Pill */}
          <button
            onClick={onToggleExecutionMode}
            className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-bold border flex items-center gap-1.5 transition-all ${
              executionMode === 'FULL_AUTOPILOT'
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500 animate-pulse'
                : executionMode === 'SEMI_AUTONOMOUS'
                ? 'bg-amber-600/20 text-amber-300 border-amber-500/50'
                : 'bg-terminal-800 text-slate-300 border-terminal-border'
            }`}
            title="Click to toggle: Manual vs Semi-Autonomous vs Full Autopilot"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            <span>{executionMode.replace('_', ' ')}</span>
          </button>

          {/* Scanner */}
          <button
            onClick={onOpenScanner}
            className="p-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-cyan-400 border border-terminal-border text-xs flex items-center gap-1 font-mono transition-colors"
            title="Multi-Pair Market Scanner"
          >
            <Radar className="w-4 h-4" />
            <span className="hidden sm:inline">Scanner</span>
          </button>

          {/* Calendar */}
          <button
            onClick={onOpenCalendar}
            className="p-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-purple-400 border border-terminal-border text-xs flex items-center gap-1 font-mono transition-colors"
            title="Economic Calendar"
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>

          {/* VaR */}
          <button
            onClick={onOpenMonteCarlo}
            className="p-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-emerald-400 border border-terminal-border text-xs flex items-center gap-1 font-mono transition-colors"
            title="Monte Carlo VaR Simulation"
          >
            <LineChart className="w-4 h-4" />
            <span className="hidden sm:inline">VaR</span>
          </button>
        </div>

        {/* Currency & Timeframe Selectors + Trigger Action */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-terminal-950 px-2 py-1 rounded border border-terminal-border">
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

          <div className="flex items-center gap-0.5 bg-terminal-950 p-0.5 rounded border border-terminal-border font-mono text-xs">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-2 py-0.5 rounded transition-all ${
                  timeframe === tf 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className={`px-3 py-1.5 rounded font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md ${
              isAnalyzing
                ? 'bg-terminal-700 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'ANALYZING...' : 'RUN SWARM'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 rounded bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
            title="Configure Risk & Swarm Settings"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
