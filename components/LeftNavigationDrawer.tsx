'use client';

import React, { useEffect } from 'react';
import {
  Activity,
  Bot,
  History,
  BookOpen,
  Shield,
  MessageSquare,
  Layers,
  Radio,
  Cloud,
  Database,
  Radar,
  Calendar,
  Compass,
  X,
  Sun,
  Moon,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  PlayCircle,
  Sliders,
  Zap,
  BarChart2,
} from 'lucide-react';
import { CurrencyPair, ExecutionMode, MarketSegment, NavigationTab } from '@/lib/types';

export interface LeftNavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: NavigationTab | string;
  setActiveTab: (tab: any) => void;
  onOpenJournal?: () => void;
  onOpenMonteCarlo?: () => void;
  onOpenNewsWire?: () => void;
  onOpenOrderFlow?: () => void;
  onOpenFirebase?: () => void;
  onOpenKnowledge?: () => void;
  onOpenVisionAtlas?: () => void;
  onOpenScanner?: () => void;
  onOpenCalendar?: () => void;
  onOpenMacroIntelligence?: () => void;
  onOpenSettings?: () => void;
  executionMode?: ExecutionMode;
  onToggleExecutionMode?: () => void;
  onTriggerAnalysis?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  selectedPair?: CurrencyPair;
  journalCount?: number;
}

export const LeftNavigationDrawer: React.FC<LeftNavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenJournal,
  onOpenMonteCarlo,
  onOpenNewsWire,
  onOpenOrderFlow,
  onOpenFirebase,
  onOpenKnowledge,
  onOpenScanner,
  onOpenCalendar,
  onOpenSettings,
  executionMode,
  onToggleExecutionMode,
  onTriggerAnalysis,
  theme = 'dark',
  onToggleTheme,
  selectedPair = 'EUR/USD',
  journalCount = 14,
}) => {
  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // The 12 sidebar navigation modules strictly in required top-to-bottom sequence:
  // 1. Terminal, 2. Knowledge, 3. Agent, 4. Five-Agent Debate, 5. Role, 6. Journals, 
  // 7. Wire with the thirty-eight feeds, 8. Macro Calendar, 9. Scanner, 10. VAR, 11. Journals, 12. Firebase
  const navItems = [
    {
      id: 'terminal',
      number: '01',
      label: 'Terminal',
      description: 'Live Chart, Orders & Swarm Signal',
      icon: Activity,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold',
      isActive: activeTab === 'terminal',
      badge: 'LIVE',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      action: () => {
        setActiveTab('terminal');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'knowledge',
      number: '02',
      label: 'Knowledge',
      description: '1,050+ Quant Rules & Institutional Heuristics',
      icon: Database,
      color: 'text-teal-400',
      activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-300 font-semibold',
      isActive: activeTab === 'knowledge',
      badge: '1,050+',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      action: () => {
        setActiveTab('knowledge');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'vision-atlas',
      number: '03',
      label: 'Vision Atlas Lab',
      description: 'Advanced SMC Analysis & Live Simulator',
      icon: Compass,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold',
      isActive: activeTab === 'vision-atlas' || activeTab === 'vision-atlas-lab',
      badge: 'SMC SIM',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      action: () => {
        setActiveTab('vision-atlas');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'agent',
      number: '04',
      label: 'Agent',
      description: '5-Role Multi-Agent Swarm Intelligence',
      icon: Bot,
      color: 'text-indigo-400',
      activeBg: 'bg-indigo-500/15 border-indigo-500/40 text-indigo-300 font-semibold',
      isActive: activeTab === 'agent',
      badge: '5 DESKS',
      badgeColor: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      action: () => {
        setActiveTab('agent');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'five-agent-debate',
      number: '05',
      label: 'Five-Agent Debate',
      description: 'Interactive Multi-Role Consensus Stream',
      icon: MessageSquare,
      color: 'text-sky-400',
      activeBg: 'bg-sky-500/15 border-sky-500/40 text-sky-300 font-semibold',
      isActive: activeTab === 'debate' || activeTab === 'five-agent-debate',
      badge: 'ACTIVE',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      action: () => {
        setActiveTab('debate');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'roles',
      number: '06',
      label: 'Role',
      description: '5-Role Governance & Architecture',
      icon: Layers,
      color: 'text-rose-400',
      activeBg: 'bg-rose-500/15 border-rose-500/40 text-rose-300 font-semibold',
      isActive: activeTab === 'roles' || activeTab === 'architecture',
      badge: '5 AGENTS',
      badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      action: () => {
        setActiveTab('roles');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'journals',
      number: '07',
      label: 'Journals',
      description: 'Persistent Trade Journal & Loss Review',
      icon: BookOpen,
      color: 'text-emerald-400',
      activeBg: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-semibold',
      isActive: activeTab === 'journals',
      badge: `${journalCount} LOGS`,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      action: () => {
        setActiveTab('journals');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'wire',
      number: '08',
      label: 'Wire',
      description: 'Wire with 38 Live Financial Outlets & Institutional Feeds',
      icon: Radio,
      color: 'text-red-400',
      activeBg: 'bg-red-500/15 border-red-500/40 text-red-300 font-semibold',
      isActive: activeTab === 'wire',
      badge: '38 FEEDS',
      badgeColor: 'bg-red-500/20 text-red-400 border-red-500/30',
      action: () => {
        setActiveTab('wire');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'order-flow',
      number: '09',
      label: 'Order Flow',
      description: 'Footprint, Volume Profile & Dual-Weighting Engine',
      icon: BarChart2,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold',
      isActive: activeTab === 'order-flow' || activeTab === 'orderflow',
      badge: '0ms WS',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      action: () => {
        setActiveTab('order-flow');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'calendar',
      number: '10',
      label: 'Macro Calendar',
      description: 'Institutional Macro Economic Release Pulse',
      icon: Calendar,
      color: 'text-orange-400',
      activeBg: 'bg-orange-500/15 border-orange-500/40 text-orange-300 font-semibold',
      isActive: activeTab === 'calendar',
      badge: 'MACRO',
      badgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      action: () => {
        setActiveTab('calendar');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'macro-intelligence',
      number: '11',
      label: 'Macro Intelligence',
      description: 'Event-Driven Macro Intelligence & Execution Engine',
      icon: Zap,
      color: 'text-cyan-400',
      activeBg: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-300 font-semibold',
      isActive: activeTab === 'macro-intelligence' || activeTab === 'macro-engine',
      badge: '95% CONVERGENCE',
      badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      action: () => {
        setActiveTab('macro-intelligence');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'scanner',
      number: '12',
      label: 'Scanner',
      description: 'Multi-Asset Screener & Confluence Hunter',
      icon: Radar,
      color: 'text-blue-400',
      activeBg: 'bg-blue-500/15 border-blue-500/40 text-blue-300 font-semibold',
      isActive: activeTab === 'scanner',
      badge: 'SCAN',
      badgeColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      action: () => {
        setActiveTab('scanner');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'var',
      number: '13',
      label: 'VAR',
      description: '1,000-Path Monte Carlo Value-at-Risk',
      icon: Shield,
      color: 'text-amber-400',
      activeBg: 'bg-amber-500/15 border-amber-500/40 text-amber-300 font-semibold',
      isActive: activeTab === 'var',
      badge: '95% / 99%',
      badgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      action: () => {
        setActiveTab('var');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'journals-history',
      number: '14',
      label: 'Journals',
      description: 'Historical Execution Logs & Loss Attribution',
      icon: BookOpen,
      color: 'text-teal-400',
      activeBg: 'bg-teal-500/15 border-teal-500/40 text-teal-300 font-semibold',
      isActive: activeTab === 'journals',
      badge: 'LOGS',
      badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
      action: () => {
        setActiveTab('journals');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
    {
      id: 'firebase',
      number: '15',
      label: 'Firebase',
      description: 'Firestore Cloud Realtime State Sync',
      icon: Cloud,
      color: 'text-yellow-400',
      activeBg: 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 font-semibold',
      isActive: activeTab === 'firebase',
      badge: 'ONLINE',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      action: () => {
        setActiveTab('firebase');
        onClose();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Navigation Menu">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity duration-300 ease-out"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sliding Drawer completely attached to the left */}
      <div className="fixed inset-y-0 left-0 max-w-[85vw] w-72 sm:w-80 bg-terminal-900 border-r border-terminal-border shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-out animate-slide-right select-none">
        {/* Drawer Header */}
        <div className="p-4 border-b border-terminal-border flex items-center justify-between bg-terminal-950/70">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-white tracking-wide truncate">
                QRI TRADER
              </h2>
              <p className="text-[10px] text-cyan-400 font-mono tracking-wider">
                NAVIGATION DESK
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white border border-terminal-border transition-colors"
            aria-label="Close navigation drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Pair & Mode Mini Info */}
        <div className="px-4 py-2 bg-terminal-950/40 border-b border-terminal-border/60 flex items-center justify-between text-xs font-mono">
          <span className="text-slate-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ACTIVE: <strong className="text-white">{selectedPair}</strong>
          </span>
          <span className="text-[10px] text-slate-400 uppercase">14 MODULES</span>
        </div>

        {/* Scrollable Navigation Items List (Vertically 1 by 1 without clipping) */}
        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={item.action}
                className={`w-full text-left px-3 py-2.5 rounded-lg border transition-all flex items-center gap-3 group ${
                  item.isActive
                    ? item.activeBg
                    : 'bg-terminal-900/60 border-transparent hover:bg-terminal-800/80 hover:border-terminal-border/80 text-slate-300 hover:text-white'
                }`}
              >
                {/* Number Prefix & Icon */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-400 transition-colors w-4">
                    {item.number}
                  </span>
                  <div className={`p-1.5 rounded-md bg-terminal-950 border border-terminal-border/60 ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                {/* Label and Subtitle */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-xs sm:text-sm font-semibold truncate tracking-tight text-white group-hover:text-cyan-300 transition-colors">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold border shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 truncate group-hover:text-slate-300">
                    {item.description}
                  </p>
                </div>

                <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </nav>

        {/* Drawer Footer with Execution Mode, Settings, Theme Toggle & Status */}
        <div className="p-3 border-t border-terminal-border bg-terminal-950/80 space-y-2 shrink-0">
          {/* Quick Execution Mode Controller */}
          {onToggleExecutionMode && executionMode && (
            <button
              onClick={onToggleExecutionMode}
              className={`w-full py-2 px-3 rounded-lg border flex items-center justify-between text-xs font-semibold transition-all shadow-sm ${
                executionMode === 'FULL_AUTOPILOT'
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                  : executionMode === 'SEMI_AUTONOMOUS'
                  ? 'bg-amber-600/20 text-amber-300 border-amber-500/50 hover:bg-amber-600/30'
                  : 'bg-terminal-800 text-slate-300 border-terminal-border hover:bg-terminal-700'
              }`}
              title="Toggle Autopilot / Semi-Autonomous Execution"
            >
              <div className="flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-cyan-400" />
                <span>Execution Mode</span>
              </div>
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-terminal-900 border border-terminal-border text-white">
                {executionMode.replace('_', ' ')}
              </span>
            </button>
          )}

          {/* Quick Risk Parameters & Settings */}
          {onOpenSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full py-2 px-3 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-200 hover:text-white flex items-center justify-between text-xs font-semibold transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <span>Risk & Account Settings</span>
              </div>
              <span className="font-mono text-[10px] text-slate-400">CONFIG</span>
            </button>
          )}

          {/* Quick Backtest Walk-Forward Engine Access */}
          <button
            onClick={() => {
              setActiveTab('backtest');
              onClose();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full py-2 px-3 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-200 hover:text-white flex items-center justify-between text-xs font-semibold transition-colors shadow-sm"
            title="Launch Walk-Forward Algorithmic Backtester"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Backtest Engine</span>
            </div>
            <span className="font-mono text-[10px] text-purple-300 px-1.5 py-0.5 rounded bg-purple-500/20 border border-purple-500/30">RUN</span>
          </button>

          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="w-full py-2 px-3 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-200 hover:text-white flex items-center justify-between text-xs font-semibold transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span>Theme Mode</span>
              </div>
              <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-terminal-900 border border-terminal-border text-cyan-400">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
            </button>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              Qri Trader Swarm
            </span>
            <span className="text-slate-400">v1.0.0 Institutional</span>
          </div>
        </div>
      </div>
    </div>
  );
};
