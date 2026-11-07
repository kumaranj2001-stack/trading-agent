'use client';

import React from 'react';
import { 
  BarChart3, 
  Layers, 
  History, 
  Shield, 
  BookOpen, 
  Radio, 
  Database, 
  Radar, 
  Calendar, 
  LineChart, 
  Sliders, 
  X, 
  Bot, 
  Zap, 
  CheckCircle2, 
  ChevronRight, 
  Sun, 
  Moon, 
  ArrowUpRight,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ExecutionMode } from '@/lib/types';

interface NavigationSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: 'terminal' | 'debate' | 'backtest' | 'architecture';
  setActiveTab: (tab: 'terminal' | 'debate' | 'backtest' | 'architecture') => void;
  onOpenJournal: () => void;
  onOpenNewsWire: () => void;
  onOpenKnowledge: () => void;
  onOpenScanner: () => void;
  onOpenCalendar: () => void;
  onOpenMonteCarlo: () => void;
  onOpenSettings: () => void;
  journalTradeCount: number;
  journalWinRate: number;
  executionMode: ExecutionMode;
  onToggleExecutionMode: () => void;
  portfolioBalance: number;
  portfolioEquity: number;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenJournal,
  onOpenNewsWire,
  onOpenKnowledge,
  onOpenScanner,
  onOpenCalendar,
  onOpenMonteCarlo,
  onOpenSettings,
  journalTradeCount,
  journalWinRate,
  executionMode,
  onToggleExecutionMode,
  portfolioBalance,
  portfolioEquity,
  theme,
  onToggleTheme,
}) => {
  if (!isOpen) return null;

  const handleSelectTab = (tab: 'terminal' | 'debate' | 'backtest' | 'architecture') => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Slide-out Sidebar Drawer */}
      <aside 
        className="relative w-80 sm:w-88 max-w-[85vw] h-full bg-terminal-950 border-r border-terminal-border/80 shadow-2xl flex flex-col z-10 animate-fade-in"
      >
        {/* Top Header of Sidebar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-terminal-border/80 bg-terminal-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm tracking-wide font-mono flex items-center gap-1.5">
                APEX AGENT
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  v2.5
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                6-Role Swarm Intelligence OS
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-terminal-800 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
          
          {/* Section 1: Main Platform Views */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
              Platform Views
            </span>

            <button
              onClick={() => handleSelectTab('terminal')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'terminal'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-terminal-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <BarChart3 className={`w-4 h-4 ${activeTab === 'terminal' ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>Live Trading Terminal</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'terminal' ? 'text-cyan-400' : 'text-slate-600'}`} />
            </button>

            <button
              onClick={() => handleSelectTab('debate')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'debate'
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/40 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-terminal-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className={`w-4 h-4 ${activeTab === 'debate' ? 'text-purple-400' : 'text-slate-400'}`} />
                <span>6-Agent Swarm Debate</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                Round 1-3
              </span>
            </button>

            <button
              onClick={() => handleSelectTab('backtest')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'backtest'
                  ? 'bg-amber-500/15 text-amber-300 border border-amber-500/40 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-terminal-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <History className={`w-4 h-4 ${activeTab === 'backtest' ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>Strategy Backtesting</span>
              </div>
              <ChevronRight className={`w-3.5 h-3.5 ${activeTab === 'backtest' ? 'text-amber-400' : 'text-slate-600'}`} />
            </button>

            <button
              onClick={() => handleSelectTab('architecture')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-mono text-xs transition-all ${
                activeTab === 'architecture'
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-terminal-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Cpu className={`w-4 h-4 ${activeTab === 'architecture' ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>System Architecture</span>
              </div>
              <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                6 Roles
              </span>
            </button>
          </div>

          {/* Section 2: Memory & Intelligence Desks */}
          <div className="space-y-1">
            <span className="px-2 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
              Intelligence Desks & Memory
            </span>

            {/* Trading Journal */}
            <button
              onClick={() => { onOpenJournal(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-terminal-900/80 border border-terminal-border/60 hover:border-rose-500/40 font-mono text-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Trading Journal & Audit</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                {journalTradeCount} ({journalWinRate}%)
              </span>
            </button>

            {/* 18-Source News Wire */}
            <button
              onClick={() => { onOpenNewsWire(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-terminal-900/80 border border-terminal-border/60 hover:border-sky-500/40 font-mono text-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                <span>18-Source Real-Time Wire</span>
              </div>
              <span className="flex items-center gap-1 text-[10px] text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800/60 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                LIVE
              </span>
            </button>

            {/* Knowledge Base */}
            <button
              onClick={() => { onOpenKnowledge(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-terminal-900/80 border border-terminal-border/60 hover:border-indigo-500/40 font-mono text-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span>Institutional Rules</span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                1,050+ Rules
              </span>
            </button>

            {/* Scanner */}
            <button
              onClick={() => { onOpenScanner(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-terminal-900/80 border border-terminal-border/60 hover:border-cyan-500/40 font-mono text-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Radar className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>Opportunity Scanner</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400" />
            </button>

            {/* Economic Calendar */}
            <button
              onClick={() => { onOpenCalendar(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-terminal-900/80 border border-terminal-border/60 hover:border-amber-500/40 font-mono text-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span>Economic Calendar</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400" />
            </button>

            {/* Monte Carlo VaR */}
            <button
              onClick={() => { onOpenMonteCarlo(); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-slate-200 hover:text-white hover:bg-terminal-900/80 border border-terminal-border/60 hover:border-emerald-500/40 font-mono text-xs transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <LineChart className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span>Monte Carlo 1,000 Paths</span>
              </div>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-emerald-400" />
            </button>
          </div>

          {/* Section 3: Risk Controls & Portfolio Summary */}
          <div className="space-y-2 pt-2 border-t border-terminal-border/60">
            <span className="px-2 text-[10px] font-mono font-bold tracking-wider uppercase text-slate-400">
              Risk & Execution Mode
            </span>

            {/* Execution Mode Card */}
            <div className="p-3 rounded-xl bg-terminal-900/70 border border-terminal-border/70 space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Execution Mode:</span>
                <button
                  onClick={onToggleExecutionMode}
                  className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-all ${
                    executionMode === 'FULL_AUTOPILOT'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 animate-pulse'
                      : executionMode === 'SEMI_AUTONOMOUS'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-terminal-800 text-slate-300 border-terminal-border'
                  }`}
                >
                  {executionMode.replace('_', ' ')}
                </button>
              </div>

              {/* Portfolio Mini Metrics */}
              <div className="pt-2 border-t border-terminal-border/40 grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">Balance:</span>
                  <span className="font-bold text-white">${portfolioBalance.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Equity:</span>
                  <span className={`font-bold ${portfolioEquity >= portfolioBalance ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${portfolioEquity.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Settings Trigger */}
              <button
                onClick={() => { onOpenSettings(); onClose(); }}
                className="w-full mt-1 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Configure Risk Parameters</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Sidebar Footer (Theme Switcher & Status) */}
        <div className="p-4 border-t border-terminal-border/80 bg-terminal-900/60 flex items-center justify-between font-mono text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-slate-400">Swarm Active</span>
          </div>

          {/* Theme Switcher Button */}
          <button
            onClick={onToggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border text-xs transition-colors shadow-sm"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span>Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-cyan-400" />
                <span>Dark</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </div>
  );
};
