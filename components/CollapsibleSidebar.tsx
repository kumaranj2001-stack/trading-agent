'use client';

import React, { useState, useEffect } from 'react';
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
  Zap,
  TrendingUp,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ExternalLink,
  ShieldAlert,
  Lock
} from 'lucide-react';
import { CurrencyPair, ExecutionMode, NavigationTab } from '@/lib/types';

export interface CollapsibleSidebarProps {
  activeTab: NavigationTab | string;
  setActiveTab: (tab: any) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  executionMode?: ExecutionMode;
  onToggleExecutionMode?: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  onOpenSettings?: () => void;
  onOpenRiskRatioController?: () => void;
  onTriggerAnalysis?: () => void;
  isAnalyzing?: boolean;
  selectedPair?: CurrencyPair;
  confluenceGrade?: string;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  activeTab,
  setActiveTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  executionMode = 'MANUAL',
  onToggleExecutionMode,
  theme = 'dark',
  onToggleTheme,
  onOpenSettings,
  onOpenRiskRatioController,
  onTriggerAnalysis,
  isAnalyzing = false,
  selectedPair = 'XAU/USD',
  confluenceGrade = 'A+',
}) => {
  // Navigation categories & items
  const navSections = [
    {
      group: 'PRIMARY TRADING DESK',
      items: [
        {
          id: 'terminal',
          number: '01',
          label: 'Trading Terminal',
          shortLabel: 'Terminal',
          icon: Activity,
          badge: 'LIVE',
          badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          description: 'Live Chart, Orders & Unified Consensus',
        },
        {
          id: 'vision-atlas',
          number: '02',
          label: 'Vision Atlas Lab',
          shortLabel: 'Vision Atlas',
          icon: Compass,
          badge: '1,050+',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          description: 'Multi-Factor Confluence & Quant Engine',
        },
        {
          id: 'agent',
          number: '03',
          label: '5-Desk Swarm Chamber',
          shortLabel: 'Swarm Desk',
          icon: Bot,
          badge: '24/7',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          description: 'Technical, Macro, News, Forex & CRO Desks',
        },
        {
          id: 'debate',
          number: '04',
          label: '5-Agent Consensus Chamber',
          shortLabel: 'Debate Feed',
          icon: MessageSquare,
          badge: 'SWARM',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          description: 'Continuous Cross-Examination & Thesis Log',
        },
      ],
    },
    {
      group: 'INTELLIGENCE & ORDER FLOW',
      items: [
        {
          id: 'order-flow',
          number: '05',
          label: 'Order Flow & Footprint',
          shortLabel: 'Order Flow',
          icon: Layers,
          badge: 'DEPTH',
          badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          description: 'Footprint, Volume Profile & CVD Telemetry',
        },
        {
          id: 'macro-intelligence',
          number: '06',
          label: 'Event-Driven Macro Engine',
          shortLabel: 'Macro Engine',
          icon: Zap,
          badge: '95 FEEDS',
          badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
          description: 'Telemetry Bridge, Trend Gate & News Sizing',
        },
        {
          id: 'calendar',
          number: '07',
          label: 'Economic Calendar',
          shortLabel: 'Calendar',
          icon: Calendar,
          badge: 'IST / UTC',
          badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
          description: 'High-Impact Releases & Lockout Windows',
        },
        {
          id: 'wire',
          number: '08',
          label: 'Real-Time News Stream',
          shortLabel: 'News Wire',
          icon: Radio,
          badge: 'STREAM',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          description: '38 Institutional Direct Ports & Flash Sentiment',
        },
      ],
    },
    {
      group: 'RISK GOVERNANCE & QUANT ENGINES',
      items: [
        {
          id: 'scanner',
          number: '09',
          label: 'Multi-Asset Screener',
          shortLabel: 'Scanner',
          icon: Radar,
          badge: 'PROXIMITY',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          description: 'Cross-Asset Confluence Scanner (10-50 Pip Band)',
        },
        {
          id: 'var',
          number: '10',
          label: 'Monte Carlo VaR Model',
          shortLabel: 'VaR 1,000',
          icon: Shield,
          badge: '1K RUNS',
          badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
          description: '1,000-Path Probabilistic Drawdown Simulator',
        },
        {
          id: 'journals',
          number: '11',
          label: 'Trade Journals & Guardrails',
          shortLabel: 'Journals',
          icon: BookOpen,
          badge: 'RULES',
          badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
          description: 'Loss Attribution & 1,051st Failure Constraints',
        },
        {
          id: 'knowledge',
          number: '12',
          label: 'Institutional Knowledge Base',
          shortLabel: 'Knowledge',
          icon: Database,
          badge: '1,050+',
          badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
          description: '1,050 Hardcoded Technical & Fundamental Rules',
        },
        {
          id: 'architecture',
          number: '13',
          label: 'System Architecture',
          shortLabel: 'Architecture',
          icon: TrendingUp,
          badge: 'ROLES',
          badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
          description: '5-Agent Consensus & Chief Reviewer Hierarchy',
        },
        {
          id: 'firebase',
          number: '14',
          label: 'Cloud State Diagnostics',
          shortLabel: 'Diagnostics',
          icon: Cloud,
          badge: 'SYNCED',
          badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
          description: 'Firebase Cloud Firestore Real-Time State',
        },
      ],
    },
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileOpen) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className={`flex flex-col h-full select-none transition-colors duration-200 ${
      theme === 'light'
        ? 'bg-slate-50 border-r border-slate-200 text-slate-800'
        : 'bg-terminal-950 border-r border-terminal-border/80 text-slate-200'
    }`}>
      {/* Brand Header */}
      <div className={`p-3.5 flex items-center justify-between border-b ${
        theme === 'light' ? 'border-slate-200 bg-white' : 'border-terminal-border/70 bg-terminal-900/60'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
            <Bot className="w-4 h-4 text-white" />
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-wide font-mono truncate">
                  QRI TRADER
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded font-mono font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
                  v2.4
                </span>
              </div>
              <span className={`text-[10px] block font-mono truncate ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                5-Agent Swarm Terminal
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse/Expand Button */}
        <button
          onClick={onToggleCollapse}
          className={`hidden lg:flex p-1.5 rounded-lg border transition-all ${
            theme === 'light'
              ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-600 hover:text-slate-900'
              : 'bg-terminal-800/80 hover:bg-terminal-700 border-terminal-border text-slate-400 hover:text-white'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar to Rail'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <PanelLeftOpen className="w-4 h-4 text-cyan-400" />
          ) : (
            <PanelLeftClose className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 rounded-lg bg-terminal-800 text-slate-400 hover:text-white border border-terminal-border"
          aria-label="Close Mobile Menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Hero Live Telemetry Pill (When Expanded) */}
      {!isCollapsed && (
        <div className={`p-3 border-b ${theme === 'light' ? 'border-slate-200/80 bg-slate-100/60' : 'border-terminal-border/50 bg-terminal-900/40'}`}>
          <div className="flex items-center justify-between text-[11px] font-mono mb-1.5">
            <span className="text-slate-400 uppercase font-semibold">Active Telemetry</span>
            <span className="px-1.5 py-0.2 rounded font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px]">
              GRADE {confluenceGrade}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className={`font-black text-xs font-mono ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {selectedPair}
              </span>
            </div>
            <span className={`text-[10px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              24/7 Swarm Online
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links Scroll Container */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 scrollbar-thin">
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            {!isCollapsed && (
              <span className="px-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
                {sec.group}
              </span>
            )}

            <div className="space-y-0.5">
              {sec.items.map(item => {
                const isActive = activeTab === item.id || 
                  (item.id === 'vision-atlas' && activeTab === 'vision-atlas-lab') ||
                  (item.id === 'debate' && activeTab === 'five-agent-debate') ||
                  (item.id === 'architecture' && activeTab === 'roles');
                const IconComponent = item.icon;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    title={isCollapsed ? `${item.number} // ${item.label} (${item.badge})` : item.description}
                    className={`w-full text-left rounded-xl transition-all duration-150 flex items-center gap-2.5 ${
                      isCollapsed ? 'p-2.5 justify-center' : 'px-3 py-2 justify-between'
                    } ${
                      isActive
                        ? theme === 'light'
                          ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/20 font-bold'
                          : 'bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 border border-cyan-500/50 text-cyan-200 shadow-md shadow-cyan-950/40 font-bold'
                        : theme === 'light'
                        ? 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900 font-medium'
                        : 'text-slate-400 hover:bg-terminal-900 hover:text-slate-100 font-medium'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg shrink-0 ${
                        isActive 
                          ? theme === 'light' ? 'bg-white/20 text-white' : 'bg-cyan-500/20 text-cyan-300' 
                          : theme === 'light' ? 'bg-slate-200/80 text-slate-600' : 'bg-terminal-900 text-slate-400'
                      }`}>
                        <IconComponent className="w-4 h-4 shrink-0" />
                      </div>

                      {!isCollapsed && (
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs truncate font-mono">
                              {item.shortLabel}
                            </span>
                          </div>
                          <span className={`text-[10px] block truncate font-sans font-normal leading-tight ${
                            isActive 
                              ? theme === 'light' ? 'text-white/80' : 'text-cyan-300/80' 
                              : theme === 'light' ? 'text-slate-400' : 'text-slate-400'
                          }`}>
                            {item.description}
                          </span>
                        </div>
                      )}
                    </div>

                    {!isCollapsed && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold shrink-0 ${
                        isActive
                          ? theme === 'light'
                            ? 'bg-white/25 text-white border-white/40'
                            : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : item.badgeColor
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Controls & System Status */}
      <div className={`p-2.5 border-t space-y-2 ${
        theme === 'light' ? 'border-slate-200 bg-white' : 'border-terminal-border/70 bg-terminal-900/50'
      }`}>
        {/* Swarm Recalibrate CTA */}
        {onTriggerAnalysis && (
          <button
            onClick={onTriggerAnalysis}
            disabled={isAnalyzing}
            className={`w-full py-2 px-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
              isAnalyzing
                ? 'bg-terminal-800 text-slate-500 cursor-not-allowed border border-terminal-border'
                : 'bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-600/20 active:scale-98'
            }`}
            title="Execute 15s Continuous Swarm Consensus Recalibration"
          >
            <Zap className={`w-3.5 h-3.5 text-cyan-300 ${isAnalyzing ? 'animate-spin' : 'animate-pulse'}`} />
            {!isCollapsed && <span>{isAnalyzing ? 'RECALIBRATING...' : 'PULSE SWARM (15s)'}</span>}
          </button>
        )}

        {/* Execution Mode & Settings Row */}
        <div className={`flex items-center gap-1.5 ${isCollapsed ? 'flex-col' : 'justify-between'}`}>
          {onToggleExecutionMode && (
            <button
              onClick={onToggleExecutionMode}
              className={`py-1.5 px-2 rounded-lg font-mono text-[10px] font-bold border transition-colors flex items-center gap-1.5 ${
                executionMode === 'FULL_AUTOPILOT'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}
              title={`Switch Mode: Currently ${executionMode}`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${executionMode === 'FULL_AUTOPILOT' ? 'bg-emerald-400 animate-ping' : 'bg-cyan-400'}`} />
              {!isCollapsed && <span>MODE: {executionMode}</span>}
            </button>
          )}

          <div className="flex items-center gap-1">
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={`p-1.5 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-terminal-800 hover:bg-terminal-700 border-terminal-border text-slate-300'
                }`}
                title="Configure Risk Governance Parameters"
                aria-label="Settings"
              >
                <Sliders className="w-3.5 h-3.5" />
              </button>
            )}

            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className={`p-1.5 rounded-lg border transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-amber-600'
                    : 'bg-terminal-800 hover:bg-terminal-700 border-terminal-border text-amber-400'
                }`}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar (Docked) */}
      <aside
        className={`hidden lg:block h-screen sticky top-0 shrink-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-[68px]' : 'w-[250px]'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop Blur */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
          />
          {/* Drawer Panel */}
          <div className="relative w-[280px] max-w-[85vw] h-full z-10 shadow-2xl animate-slide-right">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
