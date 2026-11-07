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
  X,
  Radio,
  Coins,
  Cloud,
  Sun,
  Moon
} from 'lucide-react';
import { CurrencyPair, ExecutionMode, MarketSegment, TimeFrame } from '@/lib/types';
import { PortfolioState } from '@/lib/store';
import { FOREX_PAIRS, INDIAN_MARKET_ASSETS, METALS_COMMODITIES } from '@/lib/marketData';

interface HeaderProps {
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
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
  onOpenNewsWire?: () => void;
  onOpenFirebase?: () => void;
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
  portfolio,
  onOpenSettings,
  onOpenScanner,
  onOpenCalendar,
  onOpenMonteCarlo,
  onOpenKnowledge,
  onOpenNewsWire,
  onOpenFirebase,
  isAnalyzing,
  onTriggerAnalysis,
  activeSession,
  executionMode,
  onToggleExecutionMode,
  confluenceGrade,
}) => {
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);

  // Close left drawer on Escape key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLeftDrawerOpen(false);
      }
    };
    if (leftDrawerOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [leftDrawerOpen]);
  
  const pairs = marketSegment === 'INDIAN_MARKET' 
    ? INDIAN_MARKET_ASSETS 
    : marketSegment === 'METALS_COMMODITIES'
    ? METALS_COMMODITIES
    : FOREX_PAIRS;

  return (
    <header className="border-b border-terminal-border bg-terminal-900/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5">
        {/* Row 1: Brand, Mode, Market Scope & Navigation Drawer Toggle */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Setup Grade */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            {/* Left Hamburger Menu Button */}
            <button
              onClick={() => setLeftDrawerOpen(true)}
              className="p-1.5 sm:p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-cyan-400 hover:text-white transition-all flex items-center justify-center shrink-0 shadow-sm"
              title="Open Navigation Menu"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
              <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-white tracking-wider text-xs sm:text-sm md:text-base truncate">
                  QRI TRADER <span className="text-cyan-400 font-mono">//</span> 5-AGENT SWARM
                </span>
                {confluenceGrade && (
                  <span className={`text-xs px-2 py-0.5 rounded font-bold border shrink-0 ${
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
              <div className="hidden xs:flex items-center gap-2 text-xs text-slate-400">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="truncate font-semibold">{activeSession}</span>
                <span className="text-sky-400/90 font-medium">• 18 NEWS WIRES</span>
                <span className="text-cyan-400/80 hidden md:inline font-medium">• 1,050+ RULES</span>
              </div>
            </div>
          </div>

          {/* Market Scope Selector: Forex vs Metals/Commodities vs Indian Market */}
          <div className="flex items-center bg-terminal-950 p-1 rounded-lg border border-terminal-border text-xs sm:text-sm">
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
                onSelectMarketSegment('METALS_COMMODITIES');
                onSelectPair('XAU/USD');
              }}
              className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                marketSegment === 'METALS_COMMODITIES'
                  ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Metals & Oil</span>
              <span className="sm:hidden">Gold/Oil</span>
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
              <span className="hidden xs:inline">{isAnalyzing ? 'SYNCHRONIZING...' : 'RUN SWARM'}</span>
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

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-1.5 sm:p-2 rounded bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
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

            <button
              onClick={() => setLeftDrawerOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Row 2 (Desktop): Navigation Tabs, Quick Tools, Pair & Timeframe selector */}
        <div className="mt-2.5 pt-2 border-t border-terminal-border/50 hidden lg:flex items-center justify-between gap-3 text-sm">
          {/* Main Navigation Tabs */}
          <div className="flex items-center bg-terminal-950/80 p-1 rounded-lg border border-terminal-border">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'terminal' 
                  ? 'bg-terminal-800 text-cyan-400 font-bold border border-cyan-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Terminal</span>
            </button>
            <button
              onClick={() => setActiveTab('debate')}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'debate' 
                  ? 'bg-terminal-800 text-purple-400 font-bold border border-purple-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>5-Agent Debate</span>
            </button>
            <button
              onClick={() => setActiveTab('backtest')}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'backtest' 
                  ? 'bg-terminal-800 text-amber-400 font-bold border border-amber-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Backtest</span>
            </button>
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3.5 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                activeTab === 'architecture' 
                  ? 'bg-terminal-800 text-emerald-400 font-bold border border-emerald-500/30' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>5 Roles</span>
            </button>
          </div>

          {/* Quick Tools */}
          <div className="flex items-center gap-2">
            {/* Live Wire Scraper Pill */}
            {onOpenNewsWire && (
              <button
                onClick={onOpenNewsWire}
                className="px-3 py-1.5 rounded-lg bg-sky-950/70 hover:bg-sky-900 border border-sky-700/60 text-sky-300 flex items-center gap-1.5 transition-colors shadow-sm text-xs font-semibold"
                title="View 18 Financial Websites Real-Time Wire"
              >
                <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
                <span>News Wire (18)</span>
              </button>
            )}

            {/* Firebase Cloud Sync Status */}
            {onOpenFirebase && (
              <button
                onClick={onOpenFirebase}
                className="px-3 py-1.5 rounded-lg bg-amber-950/70 hover:bg-amber-900 border border-amber-600/60 text-amber-300 flex items-center gap-1.5 transition-colors shadow-sm text-xs font-semibold"
                title="Firebase Firestore Cloud Database"
              >
                <Cloud className="w-3.5 h-3.5 text-amber-400" />
                <span>Firebase</span>
              </button>
            )}

            <button
              onClick={onOpenKnowledge}
              className="px-3 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 flex items-center gap-1.5 transition-colors shadow-sm text-xs font-semibold"
              title="Open 1,000+ Rule Knowledge Base"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Knowledge (1,050+)</span>
            </button>

            <button
              onClick={onToggleExecutionMode}
              className={`px-3 py-1.5 rounded-lg font-bold border flex items-center gap-1.5 transition-all text-xs ${
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
              <span className="text-[10px] text-slate-400">TARGET:</span>
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
            <span className="text-[10px] text-slate-400">TARGET:</span>
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

        {/* Left-Attached Drawer Overlay & Menu (Attached completely to the left side) */}
        {leftDrawerOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
              onClick={() => setLeftDrawerOpen(false)}
              aria-hidden="true"
            />

            {/* Slide-out Drawer pinned to the left */}
            <aside 
              className="relative w-84 sm:w-96 max-w-[88vw] h-full bg-terminal-950 border-r border-terminal-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200"
              role="dialog"
              aria-label="Navigation Menu"
            >
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-terminal-border flex items-center justify-between bg-terminal-900/90 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm tracking-wider flex items-center gap-1.5">
                      QRI TRADER
                      {confluenceGrade && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {confluenceGrade}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-cyan-400 font-semibold tracking-wide">
                      5-AGENT AUTONOMOUS SWARM
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setLeftDrawerOpen(false)}
                  className="p-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5 text-cyan-400" />
                </button>
              </div>

              {/* Drawer Scrollable Content: Listed One by One */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
                {/* Section: Navigation Views */}
                <div className="px-2 pt-1 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Main Views
                </div>

                {/* 1. Terminal */}
                <button
                  onClick={() => { setActiveTab('terminal'); setLeftDrawerOpen(false); }}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between border transition-all text-left ${
                    activeTab === 'terminal'
                      ? 'bg-terminal-800 text-cyan-400 border-cyan-500/50 shadow-sm'
                      : 'bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 border-terminal-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                      <Activity className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Terminal</div>
                      <div className="text-xs text-slate-400">Live charts, swarm consensus & positions</div>
                    </div>
                  </div>
                  {activeTab === 'terminal' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      ACTIVE
                    </span>
                  )}
                </button>

                {/* 2. 5-Agent Debate */}
                <button
                  onClick={() => { setActiveTab('debate'); setLeftDrawerOpen(false); }}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between border transition-all text-left ${
                    activeTab === 'debate'
                      ? 'bg-terminal-800 text-purple-400 border-purple-500/50 shadow-sm'
                      : 'bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 border-terminal-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-purple-950/80 border border-purple-800/60 text-purple-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">5-Agent Debate</div>
                      <div className="text-xs text-slate-400">Multi-agent adversarial consensus room</div>
                    </div>
                  </div>
                  {activeTab === 'debate' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      ACTIVE
                    </span>
                  )}
                </button>

                {/* 3. Backtest */}
                <button
                  onClick={() => { setActiveTab('backtest'); setLeftDrawerOpen(false); }}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between border transition-all text-left ${
                    activeTab === 'backtest'
                      ? 'bg-terminal-800 text-amber-400 border-amber-500/50 shadow-sm'
                      : 'bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 border-terminal-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-amber-950/80 border border-amber-800/60 text-amber-400">
                      <History className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Backtest</div>
                      <div className="text-xs text-slate-400">Historical simulation & performance metrics</div>
                    </div>
                  </div>
                  {activeTab === 'backtest' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ACTIVE
                    </span>
                  )}
                </button>

                {/* 4. 5 Roles */}
                <button
                  onClick={() => { setActiveTab('architecture'); setLeftDrawerOpen(false); }}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between border transition-all text-left ${
                    activeTab === 'architecture'
                      ? 'bg-terminal-800 text-emerald-400 border-emerald-500/50 shadow-sm'
                      : 'bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 border-terminal-border hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">5 Roles</div>
                      <div className="text-xs text-slate-400">Swarm architecture, agent roles & weights</div>
                    </div>
                  </div>
                  {activeTab === 'architecture' && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  )}
                </button>

                {/* Section: Live Intelligence & Cloud */}
                <div className="px-2 pt-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Intelligence & Backend
                </div>

                {/* 5. 18 News Wires */}
                {onOpenNewsWire && (
                  <button
                    onClick={() => { onOpenNewsWire(); setLeftDrawerOpen(false); }}
                    className="w-full p-2.5 rounded-lg flex items-center justify-between border border-sky-800/60 bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-sky-900/80 border border-sky-700/60 text-sky-300">
                        <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-sky-200">18 News Wires</div>
                        <div className="text-xs text-sky-300/70">18 financial sources & scrapers live</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                      LIVE
                    </span>
                  </button>
                )}

                {/* 6. Firebase Cloud */}
                {onOpenFirebase && (
                  <button
                    onClick={() => { onOpenFirebase(); setLeftDrawerOpen(false); }}
                    className="w-full p-2.5 rounded-lg flex items-center justify-between border border-amber-800/60 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-amber-900/80 border border-amber-700/60 text-amber-300">
                        <Cloud className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-amber-200">Firebase Cloud</div>
                        <div className="text-xs text-amber-300/70">Firestore cloud backend & state sync</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      SYNC
                    </span>
                  </button>
                )}

                {/* 7. 1,050+ Rules */}
                <button
                  onClick={() => { onOpenKnowledge(); setLeftDrawerOpen(false); }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-between border border-indigo-800/60 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-indigo-900/80 border border-indigo-700/60 text-indigo-300">
                      <Database className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-indigo-200">1,050+ Rules</div>
                      <div className="text-xs text-indigo-300/70">Institutional knowledge base & checklist</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    KNOWLEDGE
                  </span>
                </button>

                {/* 8. Execution Mode (MANUAL / SEMI / AUTO) */}
                <button
                  onClick={onToggleExecutionMode}
                  className={`w-full p-2.5 rounded-lg flex items-center justify-between border transition-all text-left ${
                    executionMode === 'FULL_AUTOPILOT'
                      ? 'bg-emerald-950/50 border-emerald-600/70 text-emerald-200'
                      : executionMode === 'SEMI_AUTONOMOUS'
                      ? 'bg-amber-950/50 border-amber-600/70 text-amber-200'
                      : 'bg-terminal-900/70 border-terminal-border text-slate-200 hover:bg-terminal-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md border ${
                      executionMode === 'FULL_AUTOPILOT'
                        ? 'bg-emerald-900/80 border-emerald-700/60 text-emerald-300'
                        : executionMode === 'SEMI_AUTONOMOUS'
                        ? 'bg-amber-900/80 border-amber-700/60 text-amber-300'
                        : 'bg-terminal-800 border-terminal-border text-slate-300'
                    }`}>
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                        <span>Execution Mode</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300">CLICK TO CYCLE</span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono font-semibold">
                        {executionMode.replace('_', ' ')}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                    executionMode === 'FULL_AUTOPILOT'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : executionMode === 'SEMI_AUTONOMOUS'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-slate-700 text-slate-300 border-slate-600'
                  }`}>
                    {executionMode.replace('_', ' ')}
                  </span>
                </button>

                {/* Section: Market Tools & Analytics */}
                <div className="px-2 pt-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Market Tools
                </div>

                {/* 9. Scanner */}
                <button
                  onClick={() => { onOpenScanner(); setLeftDrawerOpen(false); }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-between border border-cyan-800/50 bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                      <Radar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Scanner</div>
                      <div className="text-xs text-slate-400">Multi-asset opportunity scanner</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    SCANNER
                  </span>
                </button>

                {/* 10. Calendar */}
                <button
                  onClick={() => { onOpenCalendar(); setLeftDrawerOpen(false); }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-between border border-purple-800/50 bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-purple-950/80 border border-purple-800/60 text-purple-400">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Calendar</div>
                      <div className="text-xs text-slate-400">High-impact economic & central bank events</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    MACRO
                  </span>
                </button>

                {/* 11. Monte Carlo 1,000-Path VaR */}
                <button
                  onClick={() => { onOpenMonteCarlo(); setLeftDrawerOpen(false); }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-between border border-emerald-800/50 bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                      <LineChart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Monte Carlo 1,000-Path VaR</div>
                      <div className="text-xs text-slate-400">Parametric & stochastic risk simulation</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    VaR
                  </span>
                </button>

                {/* Section: Preferences & Settings */}
                <div className="px-2 pt-3 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Preferences & Settings
                </div>

                {/* 12. Switch to Light Mode / Dark Mode */}
                {onToggleTheme && (
                  <button
                    onClick={onToggleTheme}
                    className="w-full p-2.5 rounded-lg flex items-center justify-between border border-terminal-border bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-terminal-800 border border-terminal-border">
                        {theme === 'dark' ? (
                          <Sun className="w-4 h-4 text-amber-400" />
                        ) : (
                          <Moon className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-100">
                          {theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                        </div>
                        <div className="text-xs text-slate-400">
                          Active: <span className="font-bold capitalize">{theme} Mode</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terminal-800 text-slate-300 border border-terminal-border">
                      THEME
                    </span>
                  </button>
                )}

                {/* 13. Settings / Risk Controls */}
                <button
                  onClick={() => { onOpenSettings(); setLeftDrawerOpen(false); }}
                  className="w-full p-2.5 rounded-lg flex items-center justify-between border border-terminal-border bg-terminal-900/60 hover:bg-terminal-800 text-slate-200 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-md bg-terminal-800 border border-terminal-border text-slate-300">
                      <Sliders className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-100">Risk & Swarm Settings</div>
                      <div className="text-xs text-slate-400">Leverage, max drawdown & parameters</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-terminal-800 text-slate-300 border border-terminal-border">
                    CONFIG
                  </span>
                </button>
              </div>

              {/* Drawer Bottom Footer */}
              <div className="p-3 border-t border-terminal-border bg-terminal-900/90 shrink-0 space-y-2">
                <button
                  onClick={() => { onTriggerAnalysis(); setLeftDrawerOpen(false); }}
                  disabled={isAnalyzing}
                  className={`w-full py-2.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all ${
                    isAnalyzing
                      ? 'bg-terminal-700 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/20 active:scale-95'
                  }`}
                >
                  <Zap className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'SYNCHRONIZING SWARM...' : 'RUN 5-AGENT SWARM'}</span>
                </button>
                <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
                  <span className="truncate">{activeSession}</span>
                  <span className="text-emerald-400 font-semibold font-mono">QRI v1.0.0</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </header>
  );
};
