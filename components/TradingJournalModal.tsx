'use client';

import React, { useState } from 'react';
import { JournalMetrics, JournalTradeEntry, MarketSegment } from '@/lib/types';
import { 
  X, 
  BookOpen, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  ShieldAlert, 
  Sparkles, 
  Download, 
  RotateCcw, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Filter
} from 'lucide-react';

interface TradingJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalTradeEntry[];
  metrics: JournalMetrics;
  onResetJournal?: () => void;
}

export const TradingJournalModal: React.FC<TradingJournalModalProps> = ({
  isOpen,
  onClose,
  entries,
  metrics,
  onResetJournal,
}) => {
  const [filterTab, setFilterTab] = useState<'ALL' | 'WINS' | 'LOSSES' | 'METALS' | 'FOREX' | 'INDIAN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTradeId, setExpandedTradeId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter entries
  const filteredEntries = entries.filter(trade => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSymbol = trade.symbol.toLowerCase().includes(q);
      const matchNotes = trade.retrospectiveNotes?.toLowerCase().includes(q);
      const matchCat = trade.lossCategory?.toLowerCase().includes(q);
      if (!matchSymbol && !matchNotes && !matchCat) return false;
    }

    // Tab filter
    if (filterTab === 'WINS') return (trade.realizedPnlUsd || 0) > 0;
    if (filterTab === 'LOSSES') return (trade.realizedPnlUsd || 0) < 0;
    if (filterTab === 'METALS') return trade.marketSegment === 'METALS_COMMODITIES';
    if (filterTab === 'FOREX') return trade.marketSegment === 'FOREX';
    if (filterTab === 'INDIAN') return trade.marketSegment === 'INDIAN_MARKET';
    return true;
  });

  const toggleExpand = (id: string) => {
    setExpandedTradeId(prev => (prev === id ? null : id));
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(entries, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apex_trading_journal_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl border border-terminal-border bg-terminal-950 shadow-2xl overflow-hidden">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-terminal-border/80 bg-terminal-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white font-mono tracking-wide">
                  INSTITUTIONAL TRADING JOURNAL & LOSS AUDIT MODULE
                </h3>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  PERSISTENT LOCAL BROWSER STORAGE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automatic logging of entry credentials, stop ratios, and outcome retrospectives powering the swarm memory feedback loop.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              title="Export Journal (JSON)"
              className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span className="hidden md:inline">Export</span>
            </button>

            {onResetJournal && (
              <button
                onClick={() => {
                  if (confirm('Reset journal back to institutional seed history?')) {
                    onResetJournal();
                  }
                }}
                title="Reset to Default Seeds"
                className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4 text-amber-400" />
                <span className="hidden md:inline">Reset</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-terminal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Top KPIs Summary Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-4 bg-terminal-900/30 border-b border-terminal-border/60">
          <div className="p-2.5 rounded-xl bg-terminal-900/70 border border-terminal-border/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total Trades</span>
            <span className="font-mono text-lg font-bold text-white">{metrics.totalTrades}</span>
            <span className="text-[10px] font-mono text-slate-400 block">
              {metrics.closedTrades} closed / {metrics.openTrades} open
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-terminal-900/70 border border-terminal-border/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Win Rate</span>
            <span className={`font-mono text-lg font-bold ${
              metrics.winRatePercent >= 60 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {metrics.winRatePercent}%
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              {metrics.winningTrades}W - {metrics.losingTrades}L
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-terminal-900/70 border border-terminal-border/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Profit Factor</span>
            <span className="font-mono text-lg font-bold text-cyan-400">
              {metrics.profitFactor}x
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              Gross Edge Ratio
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-terminal-900/70 border border-terminal-border/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Net Realized P&L</span>
            <span className={`font-mono text-lg font-bold ${
              metrics.totalRealizedPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {metrics.totalRealizedPnlUsd >= 0 ? '+' : ''}${metrics.totalRealizedPnlUsd.toLocaleString()}
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              Avg W: +${metrics.avgWinUsd}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-terminal-900/70 border border-terminal-border/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Total R-Multiple</span>
            <span className={`font-mono text-lg font-bold ${
              metrics.totalRMultiple >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {metrics.totalRMultiple >= 0 ? '+' : ''}{metrics.totalRMultiple}R
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              Risk-adjusted return
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-terminal-900/70 border border-terminal-border/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Loss Prevention</span>
            <span className="font-mono text-lg font-bold text-purple-400 flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" />
              {metrics.lossPreventionSavesCount} Saves
            </span>
            <span className="text-[10px] font-mono text-slate-400 block">
              Feedback Vetoes & Cuts
            </span>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-3 border-b border-terminal-border/60 bg-terminal-950">
          <div className="flex flex-wrap items-center gap-1.5 font-mono text-xs">
            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterTab === 'ALL'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-terminal-900/80 text-slate-400 border-terminal-border hover:text-white'
              }`}
            >
              All Trades ({entries.length})
            </button>
            <button
              onClick={() => setFilterTab('WINS')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterTab === 'WINS'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-terminal-900/80 text-slate-400 border-terminal-border hover:text-white'
              }`}
            >
              Wins ({metrics.winningTrades})
            </button>
            <button
              onClick={() => setFilterTab('LOSSES')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterTab === 'LOSSES'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50'
                  : 'bg-terminal-900/80 text-slate-400 border-terminal-border hover:text-white'
              }`}
            >
              Losses ({metrics.losingTrades})
            </button>
            <button
              onClick={() => setFilterTab('METALS')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterTab === 'METALS'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-terminal-900/80 text-slate-400 border-terminal-border hover:text-white'
              }`}
            >
              Metals & Oil
            </button>
            <button
              onClick={() => setFilterTab('FOREX')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterTab === 'FOREX'
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                  : 'bg-terminal-900/80 text-slate-400 border-terminal-border hover:text-white'
              }`}
            >
              Forex
            </button>
            <button
              onClick={() => setFilterTab('INDIAN')}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filterTab === 'INDIAN'
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                  : 'bg-terminal-900/80 text-slate-400 border-terminal-border hover:text-white'
              }`}
            >
              NSE India
            </button>
          </div>

          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search symbol, note, loss..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-terminal-900/80 border border-terminal-border rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500/60 font-mono"
            />
          </div>
        </div>

        {/* Scrollable Trades Table */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-16 text-slate-400 font-mono text-sm">
              No journal records found matching current criteria.
            </div>
          ) : (
            filteredEntries.map(trade => {
              const isWin = (trade.realizedPnlUsd || 0) > 0;
              const isLoss = (trade.realizedPnlUsd || 0) < 0;
              const isOpen = trade.status === 'OPEN';
              const isExpanded = expandedTradeId === trade.id;

              return (
                <div
                  key={trade.id}
                  className={`rounded-xl border transition-all overflow-hidden ${
                    isExpanded
                      ? 'border-rose-500/50 bg-terminal-900/80 shadow-lg'
                      : 'border-terminal-border/70 bg-terminal-900/40 hover:bg-terminal-900/60'
                  }`}
                >
                  {/* Summary Row */}
                  <div
                    onClick={() => toggleExpand(trade.id)}
                    className="p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    {/* Left: Direction, Symbol, Timestamp, Grade */}
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold border flex items-center gap-1 ${
                        trade.direction === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                      }`}>
                        {trade.direction === 'BUY' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                        {trade.direction}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-white">{trade.symbol}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-terminal-800 text-slate-400 border border-terminal-border">
                            {trade.lots} Lots
                          </span>
                          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                            trade.confluenceGradeAtEntry === 'A+' || trade.confluenceGradeAtEntry === 'A'
                              ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          }`}>
                            Grade {trade.confluenceGradeAtEntry} ({trade.agentConfidenceAtEntry}%)
                          </span>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                          Entry: {trade.entryTime} @ <strong className="text-slate-200">{trade.entryPrice}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Middle: Planned Stop & Risk Ratio */}
                    <div className="hidden lg:flex items-center gap-4 text-xs font-mono text-slate-300">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Stop / Target:</span>
                        <span>SL: {trade.initialStopLoss} | TP: {trade.initialTakeProfit}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Planned R:R:</span>
                        <span className="text-cyan-400 font-bold">{trade.plannedRiskRewardRatio}:1</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Risk Buffer:</span>
                        <span>{trade.stopDistancePips} pips</span>
                      </div>
                    </div>

                    {/* Right: Outcome, P&L, Expand Chevron */}
                    <div className="flex items-center justify-between md:justify-end gap-3">
                      <div className="text-right font-mono">
                        {isOpen ? (
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold">
                            ACTIVE OPEN
                          </span>
                        ) : (
                          <>
                            <div className={`text-sm font-bold flex items-center justify-end gap-1 ${
                              isWin ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {isWin ? '+' : ''}${trade.realizedPnlUsd?.toFixed(2)}
                              <span className="text-xs font-normal">
                                ({trade.realizedRMultiple !== undefined && trade.realizedRMultiple > 0 ? '+' : ''}{trade.realizedRMultiple}R)
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400">
                              Exit: {trade.exitReason} @ {trade.exitPrice}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="p-1.5 rounded-lg bg-terminal-800 text-slate-400">
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail Panel (Setup Snapshot & Retrospective Audit) */}
                  {isExpanded && (
                    <div className="p-4 border-t border-terminal-border/80 bg-terminal-950/90 font-mono text-xs space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2.5 rounded-lg bg-terminal-900/60 border border-terminal-border/60">
                          <span className="text-slate-400 block text-[10px]">Setup Trigger:</span>
                          <span className="text-slate-200">{trade.setupSnapshot.candlestickPattern || 'Breakout Confluence'}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-terminal-900/60 border border-terminal-border/60">
                          <span className="text-slate-400 block text-[10px]">Market Regime / RSI:</span>
                          <span className="text-slate-200">{trade.setupSnapshot.marketRegime || 'Normal'} (RSI {trade.setupSnapshot.rsiAtEntry || 50})</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-terminal-900/60 border border-terminal-border/60">
                          <span className="text-slate-400 block text-[10px]">News Catalyst:</span>
                          <span className="text-slate-200 truncate block">{trade.setupSnapshot.primaryCatalyst || 'Wire Momentum'}</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-terminal-900/60 border border-terminal-border/60">
                          <span className="text-slate-400 block text-[10px]">Loss Classification:</span>
                          <span className={`font-bold ${
                            trade.lossCategory !== 'NONE' ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {trade.lossCategory?.replace(/_/g, ' ') || 'NONE'}
                          </span>
                        </div>
                      </div>

                      {/* Post-Trade Audit / Retrospective Note */}
                      <div className="p-3 rounded-lg bg-terminal-900/80 border border-terminal-border/80 space-y-2">
                        <div className="flex items-center gap-2 text-rose-300 font-bold">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Post-Execution Audit & Retrospective Notes:</span>
                        </div>
                        <p className="text-slate-300 text-[11px] leading-relaxed pl-5">
                          {trade.retrospectiveNotes || 'No specific retrospective notes logged.'}
                        </p>
                        {trade.preventativeTakeaway && (
                          <div className="pl-5 pt-1 text-[11px] text-amber-300 flex items-start gap-1.5 border-t border-terminal-border/50">
                            <strong className="text-amber-400 shrink-0">Memory Takeaway Encoded into Feedback Loop:</strong>
                            <span>{trade.preventativeTakeaway}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-terminal-border/80 bg-terminal-900/60 flex items-center justify-between text-xs font-mono text-slate-400">
          <span>
            Feedback loop enabled: {metrics.closedTrades} closed positions continuously monitored.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all shadow-md"
          >
            Close Journal
          </button>
        </div>
      </div>
    </div>
  );
};
