'use client';

import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Filter,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Trash2,
  Download,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { JournalEntry, JournalLossCategory, CurrencyPair, MarketSegment } from '@/lib/types';
import { JournalStorageManager } from '@/lib/journalStorage';

export interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPair?: CurrencyPair;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen,
  onClose,
  selectedPair,
}) => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS' | 'OPEN'>('ALL');
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<string>('Synced with Local & Cloud');

  // Form state for creating a new manual journal entry
  const [newSymbol, setNewSymbol] = useState<CurrencyPair>(selectedPair || 'EUR/USD');
  const [newOrderType, setNewOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [newLots, setNewLots] = useState<number>(0.5);
  const [newEntryPrice, setNewEntryPrice] = useState<number>(1.08500);
  const [newStopLoss, setNewStopLoss] = useState<number>(1.08200);
  const [newTakeProfit, setNewTakeProfit] = useState<number>(1.09200);
  const [newOutcome, setNewOutcome] = useState<'WIN' | 'LOSS' | 'OPEN'>('WIN');
  const [newRealizedPnl, setNewRealizedPnl] = useState<number>(150);
  const [newLossReason, setNewLossReason] = useState<JournalLossCategory>('NONE_DISCIPLINED_WIN');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newLesson, setNewLesson] = useState<string>('');
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  const loadData = async () => {
    setIsApiLoading(true);
    try {
      const symParam = filterSymbol !== 'ALL' ? `?symbol=${encodeURIComponent(filterSymbol)}` : '';
      const res = await fetch(`/api/journal${symParam}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.journals)) {
        setJournals(json.data.journals);
        setSyncStatus('Live REST API Synced • Central Cloud Database');
      } else {
        const list = JournalStorageManager.getJournals();
        setJournals(list);
      }
    } catch {
      const list = JournalStorageManager.getJournals();
      setJournals(list);
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, filterSymbol]);

  const handleDeleteEntry = async (id: string) => {
    JournalStorageManager.deleteJournal(id);
    try {
      await fetch(`/api/journal?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {
      console.error('Failed to delete via API:', e);
    }
    loadData();
  };

  if (!isOpen) return null;

  const analysis = JournalStorageManager.analyzeHistoricalJournals(filterSymbol !== 'ALL' ? (filterSymbol as CurrencyPair) : undefined);

  // Filter journals
  const filteredJournals = journals.filter((item) => {
    if (filterOutcome !== 'ALL' && item.outcome !== filterOutcome) return false;
    if (filterSymbol !== 'ALL' && item.symbol !== filterSymbol) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSymbol = item.symbol.toLowerCase().includes(q);
      const matchNotes = (item.notes || '').toLowerCase().includes(q);
      const matchReason = (item.lossReasonCategory || '').toLowerCase().includes(q);
      const matchKeyReasons = item.keyReasons.some((r) => r.toLowerCase().includes(q));
      if (!matchSymbol && !matchNotes && !matchReason && !matchKeyReasons) return false;
    }
    return true;
  });

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const pipDiff = Math.abs(newEntryPrice - newStopLoss);
    const targetDiff = Math.abs(newTakeProfit - newEntryPrice);
    const rr = pipDiff > 0 ? Number((targetDiff / pipDiff).toFixed(2)) : 2.0;

    const entryData: JournalEntry = {
      id: `jrn-${Date.now()}`,
      symbol: newSymbol,
      segment: newSymbol.includes('/') ? 'FOREX' : 'METALS_COMMODITIES',
      orderType: newOrderType,
      lots: Number(newLots),
      entryPrice: Number(newEntryPrice),
      exitPrice: newOutcome === 'OPEN' ? undefined : Number(newOutcome === 'WIN' ? newTakeProfit : newStopLoss),
      stopLoss: Number(newStopLoss),
      takeProfit: Number(newTakeProfit),
      riskRewardRatio: rr,
      dollarRisk: Number(Math.abs(newLots * pipDiff * 1000).toFixed(1)),
      potentialDollarGain: Number(Math.abs(newLots * targetDiff * 1000).toFixed(1)),
      executionMode: 'SEMI_AUTONOMOUS',
      entryTimestamp: Date.now() - 3600000 * 2,
      entryTimeStr: 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exitTimestamp: newOutcome === 'OPEN' ? undefined : Date.now(),
      exitTimeStr: newOutcome === 'OPEN' ? undefined : 'Today ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      realizedPnl: newOutcome === 'OPEN' ? undefined : Number(newRealizedPnl),
      pnlPercent: newOutcome === 'OPEN' ? undefined : Number((newRealizedPnl / 10000 * 100).toFixed(2)),
      outcome: newOutcome,
      confluenceGrade: 'A',
      confidenceScore: 78,
      swarmDirection: newOrderType,
      riskManagerVerdict: 'APPROVED',
      keyReasons: ['User logged journal record with confirmed setup'],
      lossReasonCategory: newOutcome === 'LOSS' ? newLossReason : 'NONE_DISCIPLINED_WIN',
      lessonLearned: newLesson || undefined,
      notes: newNotes || 'Manual journal entry logged from Qri Trader terminal.',
      tags: ['Manual', newSymbol, newOrderType],
    };

    // Save locally
    JournalStorageManager.saveJournal(entryData);

    // Save via backend REST API
    try {
      await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryData),
      });
      setSyncStatus('Entry recorded to REST API & LocalStorage!');
    } catch (e) {
      console.error('Failed to post journal entry to API:', e);
    }

    loadData();
    setIsCreating(false);
  };

  const handleExport = () => {
    const jsonStr = JournalStorageManager.exportJournalsAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qri-trader-journals-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-5xl bg-terminal-900 border border-terminal-border rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-terminal-border bg-terminal-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  QRI TRADING JOURNAL // AUDIT & HISTORICAL LOSS REVIEW
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PERSISTENT BACKEND
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Institutional trade credentials, stop-loss ratios, loss attribution, and pre-trade guardrails
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsCreating(!isCreating)}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-cyan-600/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isCreating ? 'CANCEL' : 'NEW ENTRY'}</span>
            </button>
            <button
              onClick={handleExport}
              className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border transition-colors"
              title="Export Journals as JSON"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white border border-terminal-border transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Aggregate Performance Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 bg-terminal-950/60 border-b border-terminal-border text-xs">
          <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Total Logged</span>
            <span className="text-base font-bold text-white font-mono">{analysis.totalTrades} Trades</span>
          </div>
          <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Win Rate</span>
            <span className={`text-base font-bold font-mono ${analysis.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {analysis.winRate}% ({analysis.winningTrades}W / {analysis.losingTrades}L)
            </span>
          </div>
          <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Net Realized P&L</span>
            <span className={`text-base font-bold font-mono ${analysis.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {analysis.netPnl >= 0 ? '+' : ''}${analysis.netPnl.toFixed(2)}
            </span>
          </div>
          <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Profit Factor</span>
            <span className="text-base font-bold text-cyan-400 font-mono">{analysis.profitFactor}x</span>
          </div>
          <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Avg Win / Loss</span>
            <span className="text-xs font-bold text-white font-mono block">
              +${analysis.avgWin.toFixed(0)} / <span className="text-rose-400">-${analysis.avgLoss.toFixed(0)}</span>
            </span>
          </div>
          <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
            <span className="text-slate-400 text-[10px] uppercase font-semibold block">Past Loss Factor</span>
            <span className="text-[11px] font-bold text-amber-400 truncate block">
              {analysis.primaryLossCauses[0]?.category.replace(/_/g, ' ') || 'None'}
            </span>
          </div>
        </div>

        {/* Active Pre-Trade Guardrail Notice (if recurring loss is found) */}
        {analysis.recurringMistakesWarning && (
          <div className="mx-3 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-amber-300">HISTORICAL JOURNAL GUARDRAIL ACTIVE: </span>
              <span className="text-slate-300">{analysis.recurringMistakesWarning}</span>
              <p className="text-[11px] text-amber-400/90 mt-0.5">
                Multi-agent swarm automatically adjusts position sizing and stop-loss buffer during trade evaluation.
              </p>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
          {/* Create New Form Modal Drawer */}
          {isCreating && (
            <form onSubmit={handleCreateSubmit} className="p-4 rounded-xl bg-terminal-950 border border-cyan-500/40 space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <span className="font-bold text-white font-mono flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-cyan-400" />
                  LOG TRADE ENTRY CREDENTIALS & OUTCOME
                </span>
                <span className="text-slate-400 text-[10px]">Dual Stored: LocalStorage + Firestore</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Symbol</label>
                  <input
                    type="text"
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value as CurrencyPair)}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Order Direction</label>
                  <select
                    value={newOrderType}
                    onChange={(e) => setNewOrderType(e.target.value as 'BUY' | 'SELL')}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white font-mono"
                  >
                    <option value="BUY">BUY (LONG)</option>
                    <option value="SELL">SELL (SHORT)</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Lots</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newLots}
                    onChange={(e) => setNewLots(parseFloat(e.target.value))}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Status / Outcome</label>
                  <select
                    value={newOutcome}
                    onChange={(e) => setNewOutcome(e.target.value as any)}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white font-mono"
                  >
                    <option value="WIN">WIN (Target Hit)</option>
                    <option value="LOSS">LOSS (Stop Hit)</option>
                    <option value="OPEN">OPEN (Running)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">Entry Price</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={newEntryPrice}
                    onChange={(e) => setNewEntryPrice(parseFloat(e.target.value))}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={newStopLoss}
                    onChange={(e) => setNewStopLoss(parseFloat(e.target.value))}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-rose-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Take Profit</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={newTakeProfit}
                    onChange={(e) => setNewTakeProfit(parseFloat(e.target.value))}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-emerald-300 font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Realized P&L ($)</label>
                  <input
                    type="number"
                    step="1"
                    value={newRealizedPnl}
                    onChange={(e) => setNewRealizedPnl(parseFloat(e.target.value))}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              {newOutcome === 'LOSS' && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-lg">
                  <label className="text-rose-300 font-bold block mb-1">Loss Reason Attribution (Active Analysis)</label>
                  <select
                    value={newLossReason}
                    onChange={(e) => setNewLossReason(e.target.value as JournalLossCategory)}
                    className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white font-mono"
                  >
                    <option value="SL_HIT_REGULAR_VOLATILITY">SL Hit Regular Volatility (Noise / tight stop)</option>
                    <option value="NEWS_SLIPPAGE">News Slippage / Unscheduled Speech</option>
                    <option value="PREMATURE_EXIT">Premature Exit / Panic Closure</option>
                    <option value="CHASED_MARKET">Chased Market (FOMO entry at high/low)</option>
                    <option value="OVERLEVERAGED">Overleveraged Position Size</option>
                    <option value="COUNTER_TREND">Counter-trend Without HTF Confirmation</option>
                    <option value="SESSION_LIQUIDITY_DROP">Session Liquidity Drop / Asian spread widen</option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-slate-400 block mb-1">Notes & Rationale</label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Clean 15m retest of 50-EMA with Bullish engulfing confluence"
                  className="w-full bg-terminal-900 border border-terminal-border rounded px-2.5 py-1.5 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold font-mono"
                >
                  SAVE & SYNC TO FIREBASE
                </button>
              </div>
            </form>
          )}

          {/* Search and Filters Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 bg-terminal-950 p-1 rounded-lg border border-terminal-border">
              {(['ALL', 'WIN', 'LOSS', 'OPEN'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilterOutcome(tab)}
                  className={`px-3 py-1 rounded text-xs font-mono font-semibold transition-colors ${
                    filterOutcome === tab
                      ? tab === 'WIN'
                        ? 'bg-emerald-600 text-white'
                        : tab === 'LOSS'
                        ? 'bg-rose-600 text-white'
                        : tab === 'OPEN'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-terminal-700 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter logs or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-terminal-950 border border-terminal-border rounded-lg text-xs text-white placeholder-slate-500 w-44 sm:w-56 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <select
                value={filterSymbol}
                onChange={(e) => setFilterSymbol(e.target.value)}
                className="bg-terminal-950 border border-terminal-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
              >
                <option value="ALL">All Symbols</option>
                {Object.keys(analysis.symbolStats).map((sym) => (
                  <option key={sym} value={sym}>
                    {sym} ({analysis.symbolStats[sym].trades} trades)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table of Journal Entries */}
          <div className="border border-terminal-border rounded-xl overflow-hidden bg-terminal-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-terminal-900 border-b border-terminal-border text-slate-400 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Symbol & Type</th>
                    <th className="py-2.5 px-3">Entry / Exit</th>
                    <th className="py-2.5 px-3">Stop / Target</th>
                    <th className="py-2.5 px-3">R:R & Lots</th>
                    <th className="py-2.5 px-3">Outcome & P&L</th>
                    <th className="py-2.5 px-3">Loss Attribution / Notes</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-terminal-border/60">
                  {filteredJournals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                        No trade journal entries match the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredJournals.map((item) => (
                      <tr key={item.id} className="hover:bg-terminal-900/50 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              item.orderType === 'BUY'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            }`}>
                              {item.orderType}
                            </span>
                            <span className="font-bold text-white">{item.symbol}</span>
                            <span className="text-[10px] text-slate-400 font-sans">({item.confluenceGrade})</span>
                          </div>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{item.entryTimeStr}</span>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-200">
                          <div>In: <strong className="text-white">{item.entryPrice}</strong></div>
                          {item.exitPrice && (
                            <div className="text-[10px] text-slate-400">Out: {item.exitPrice}</div>
                          )}
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-rose-400">SL: {item.stopLoss}</div>
                          <div className="text-emerald-400 text-[10px]">TP: {item.takeProfit}</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="text-cyan-400 font-bold">{item.riskRewardRatio}:1 R:R</div>
                          <div className="text-[10px] text-slate-400">{item.lots} lots (${item.dollarRisk} risk)</div>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.outcome === 'WIN'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : item.outcome === 'LOSS'
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              {item.outcome}
                            </span>
                            {item.realizedPnl !== undefined && (
                              <span className={`font-bold ${item.realizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.realizedPnl >= 0 ? '+' : ''}${item.realizedPnl.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-2.5 px-3">
                          {item.lossReasonCategory && item.lossReasonCategory !== 'NONE_DISCIPLINED_WIN' && (
                            <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-1">
                              {item.lossReasonCategory.replace(/_/g, ' ')}
                            </span>
                          )}
                          <p className="text-[11px] text-slate-300 font-sans line-clamp-1">
                            {item.notes || item.lessonLearned || item.keyReasons[0] || 'Logged trade'}
                          </p>
                        </td>

                        <td className="py-2.5 px-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleDeleteEntry(item.id)}
                            title="Delete entry from API & LocalStorage"
                            className="p-1 rounded bg-terminal-900 hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 border border-terminal-border hover:border-rose-500/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-terminal-border bg-terminal-950 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            {syncStatus}
          </span>
          <span>
            Qri Trader Journal Module • <strong className="text-white">{journals.length}</strong> Stored Entries
          </span>
        </div>
      </div>
    </div>
  );
};
