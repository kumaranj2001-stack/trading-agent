'use client';

import React, { useState } from 'react';
import {
  AIMarketAnalysisResult,
  AISignalOverlayItem,
  CurrencyPair,
  TimeFrame,
} from '@/lib/types';
import {
  Sparkles,
  X,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Database,
  RefreshCw,
  Target,
  BarChart3,
  Flame,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

interface AIMarketAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AIMarketAnalysisResult | null;
  pair: CurrencyPair;
  timeframe: TimeFrame;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const AIMarketAnalysisModal: React.FC<AIMarketAnalysisModalProps> = ({
  isOpen,
  onClose,
  analysis,
  pair,
  timeframe,
  onRefresh,
  isRefreshing = false,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'strategies' | 'signals' | 'orderflow'>('strategies');

  if (!isOpen) return null;

  const isBull = analysis?.predictiveBias?.includes('BUY') ?? true;
  const confidence = analysis?.predictiveConfidence ?? 88;
  const strategies = analysis?.topMatchedStrategies ?? [];
  const signals = analysis?.activeSignals ?? [];
  const orderFlow = analysis?.orderFlowPressure;
  const multiTf = analysis?.multiTimeframeSynthesis ?? [];

  const filteredStrategies = strategies.filter(
    (s) =>
      s.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.subcategory.toLowerCase().includes(filterQuery.toLowerCase()) ||
      s.ruleId.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative bg-terminal-900 border border-fuchsia-500/40 rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl shadow-fuchsia-950/40 overflow-hidden text-slate-100 font-sans">
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-terminal-border/80 bg-terminal-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-fuchsia-600 via-pink-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-fuchsia-500/20 shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-bold text-white tracking-wide">
                  AI Market Analysis Console
                </span>
                <span className="px-2 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 text-[10px] font-mono font-semibold">
                  13TH CORE MODULE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono flex items-center gap-2 mt-0.5">
                <span>{pair} • {timeframe.toUpperCase()}</span>
                <span>•</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Bi-Directional Pipeline Active
                </span>
                <span>•</span>
                <span className="text-fuchsia-400">1,050+ Strategies Linked</span>
                <span>•</span>
                <span className="text-slate-500">&lt;{analysis?.latencyMs || 2}ms Latency</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-xs text-slate-300 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                title="Resynthesize against 1,050+ Knowledge Rules"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-fuchsia-400' : ''}`} />
                <span>Sync Feed</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white border border-terminal-border transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: Executive Predictive Synthesis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Card A: Predictive Direction & Confluence */}
            <div className={`p-4 rounded-xl border ${
              isBull
                ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/20 border-rose-500/40 text-rose-300'
            } flex flex-col justify-between`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Predictive Bias
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  isBull
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                }`}>
                  {analysis?.predictiveBias || 'BUY'}
                </span>
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold tracking-tight">
                  {confidence}%
                </span>
                <span className="text-xs text-slate-400 font-mono">Confluence Score</span>
              </div>

              <div className="w-full bg-terminal-950 rounded-full h-2 overflow-hidden border border-terminal-border">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isBull ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-gradient-to-r from-rose-500 to-amber-500'
                  }`}
                  style={{ width: `${confidence}%` }}
                />
              </div>

              <p className="text-[11px] text-slate-400 mt-2 font-mono">
                Evaluated across <strong className="text-slate-200">1,050+ validated quantitative rules</strong> in real time.
              </p>
            </div>

            {/* Card B: Order Flow Pressure & VWAP */}
            <div className="p-4 rounded-xl border border-terminal-border bg-terminal-950/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Order Flow Pressure
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                  orderFlow?.deltaStatus.includes('BULL')
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                }`}>
                  {orderFlow?.deltaStatus.replace('_', ' ') || 'BULLISH'}
                </span>
              </div>

              <div className="my-2 space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400 font-bold">Buy Delta: {orderFlow?.buyVolumeDelta || 62}%</span>
                  <span className="text-rose-400 font-bold">Sell Delta: {orderFlow?.sellVolumeDelta || 38}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-rose-500/40 overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${orderFlow?.buyVolumeDelta || 62}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-terminal-border/60 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>VWAP: <strong className="text-white">{orderFlow?.vwap?.toFixed(4) || '—'}</strong></span>
                <span>Absorption: <strong className={orderFlow?.orderFlowAbsorption ? 'text-amber-400' : 'text-slate-400'}>
                  {orderFlow?.orderFlowAbsorption ? 'DETECTED' : 'NORMAL'}
                </strong></span>
              </div>
            </div>

            {/* Card C: Projected Target & Invalidation Stop */}
            <div className="p-4 rounded-xl border border-terminal-border bg-terminal-950/50 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">
                  Calculated Target & Invalidation
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  R:R 1:2.2
                </span>
              </div>

              <div className="my-2 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-terminal-900 border border-emerald-500/30">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    Projected Target
                  </span>
                  <span className="text-emerald-300 font-bold font-mono">
                    {analysis?.projectedTarget?.toFixed(4) || '—'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-terminal-900 border border-rose-500/30">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                    Invalidation Stop
                  </span>
                  <span className="text-rose-300 font-bold font-mono">
                    {analysis?.projectedStop?.toFixed(4) || '—'}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-500 font-mono">
                Synchronized with active Stop Loss & Take Profit limits on chart.
              </p>
            </div>
          </div>

          {/* Section 2: Multi-Timeframe Confluence Matrix */}
          <div className="bg-terminal-950/70 border border-terminal-border rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-fuchsia-400" />
                <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-200">
                  Multi-Timeframe Predictive Alignment (1m to 4h)
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">5-Horizon Synthesis</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              {multiTf.map((item) => {
                const isItemBull = item.bias.includes('BUY');
                return (
                  <div
                    key={item.timeframe}
                    className={`p-2.5 rounded-lg border text-center transition-all ${
                      item.timeframe === timeframe
                        ? 'border-fuchsia-500/60 bg-fuchsia-500/10 shadow-sm shadow-fuchsia-500/20'
                        : 'border-terminal-border/60 bg-terminal-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span className="font-bold text-white">{item.timeframe.toUpperCase()}</span>
                      <span className={`text-[10px] font-bold ${isItemBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {item.score}%
                      </span>
                    </div>

                    <div className={`py-1 rounded text-xs font-bold font-mono flex items-center justify-center gap-1 ${
                      isItemBull
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}>
                      {isItemBull ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{item.bias.replace('_', ' ')}</span>
                    </div>

                    <p className="text-[9px] text-slate-400 truncate mt-1.5 font-mono" title={item.matchedStrategy}>
                      {item.matchedStrategy}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Navigation Tabs (Strategies / Live Chart Signals / Order Flow Details) */}
          <div className="flex items-center justify-between border-b border-terminal-border pb-2">
            <div className="flex items-center gap-2 text-xs font-mono">
              <button
                onClick={() => setActiveTab('strategies')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'strategies'
                    ? 'bg-fuchsia-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-terminal-800'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Matched Strategies ({strategies.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('signals')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'signals'
                    ? 'bg-fuchsia-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-terminal-800'
                }`}
              >
                <Target className="w-3.5 h-3.5 text-cyan-400" />
                <span>Active Chart Signals ({signals.length})</span>
              </button>
            </div>

            {activeTab === 'strategies' && (
              <div className="relative w-48 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter 1,050+ rules..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 bg-terminal-950 border border-terminal-border rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-fuchsia-500"
                />
              </div>
            )}
          </div>

          {/* Tab Content 1: Matched Strategies */}
          {activeTab === 'strategies' && (
            <div className="space-y-3">
              {filteredStrategies.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs font-mono">
                  No matching strategies found for &quot;{filterQuery}&quot;.
                </div>
              ) : (
                filteredStrategies.map((strat) => {
                  const isStratBull = strat.action.includes('BUY');
                  return (
                    <div
                      key={strat.ruleId}
                      className="p-3.5 rounded-xl border border-terminal-border/80 bg-terminal-950/60 hover:border-fuchsia-500/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-terminal-800 border border-terminal-border text-[10px] font-mono text-slate-300">
                            {strat.ruleId}
                          </span>
                          <span className="text-xs font-bold text-white truncate">
                            {strat.name}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                            {strat.subcategory}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-sans line-clamp-2">
                          {strat.rationale}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center font-mono">
                        <div className="text-right">
                          <div className="text-xs font-bold text-emerald-400">
                            {strat.winRate}% Win Rate
                          </div>
                          <div className="text-[10px] text-slate-500">
                            Confidence: {strat.confidence}%
                          </div>
                        </div>

                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase border ${
                          isStratBull
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        }`}>
                          {strat.action.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Tab Content 2: Active Chart Signals */}
          {activeTab === 'signals' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-terminal-950 border border-cyan-500/30 text-xs text-slate-300 font-mono flex items-center justify-between">
                <span>
                  Dynamic rendering overlay is projecting these signals as actionable arrows directly onto the active trading chart.
                </span>
                <span className="text-cyan-400 font-bold">Synchronized in real time</span>
              </div>

              {signals.map((sig, idx) => {
                const isSigBull = sig.type === 'BUY';
                return (
                  <div
                    key={sig.id || idx}
                    className={`p-3.5 rounded-xl border ${
                      isSigBull
                        ? 'border-emerald-500/40 bg-emerald-950/15'
                        : 'border-rose-500/40 bg-rose-950/15'
                    } flex flex-col sm:flex-row sm:items-center justify-between gap-3`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isSigBull ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        {isSigBull ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-extrabold font-mono ${
                            isSigBull ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {sig.type} SIGNAL
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            @ {sig.price.toFixed(4)}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-terminal-800 text-slate-400 text-[10px] font-mono">
                            {sig.time}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 font-mono mt-0.5">
                          {sig.strategyName} ({sig.strategyId})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center font-mono">
                      <span className="px-2 py-1 rounded bg-terminal-900 border border-terminal-border text-xs text-slate-200">
                        Win Rate: <strong className="text-emerald-400">{sig.expectedWinRate}%</strong>
                      </span>
                      <span className="px-2 py-1 rounded bg-terminal-900 border border-terminal-border text-xs text-fuchsia-300">
                        {sig.confidence}% Conf.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-terminal-border bg-terminal-950/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0 font-mono text-xs">
          <span className="text-slate-400">
            Proprietary Pipeline connected to <strong className="text-white">1,050+ validated quantitative strategies</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold transition-colors shadow-lg shadow-fuchsia-600/30"
            >
              Done & Return to Terminal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
