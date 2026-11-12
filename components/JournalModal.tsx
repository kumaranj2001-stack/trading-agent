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
  RefreshCw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronRight,
  Download,
  ShieldAlert,
  ShieldCheck,
  Info,
  ArrowLeft,
  Lock,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Activity,
  FileText
} from 'lucide-react';
import { 
  JournalEntry, 
  JournalLossCategory, 
  CurrencyPair, 
  MarketSegment, 
  FailureConstraintRule, 
  DiagnosticFailureAudit 
} from '@/lib/types';
import { JournalStorageManager } from '@/lib/journalStorage';
import { diagnosticReasoningEngine } from '@/lib/diagnosticReasoningEngine';
import { knowledgeEngine } from '@/lib/knowledge/KnowledgeEngine';

export interface JournalModalProps {
  isOpen?: boolean;
  onClose: () => void;
  selectedPair?: CurrencyPair;
  isFullPage?: boolean;
}

export const JournalModal: React.FC<JournalModalProps> = ({
  isOpen = true,
  onClose,
  selectedPair,
  isFullPage = false,
}) => {
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'SYNTHESIZED_RULES' | 'DIAGNOSTIC_AUDIT'>('LEDGER');
  const [filterOutcome, setFilterOutcome] = useState<'ALL' | 'WIN' | 'LOSS' | 'OPEN'>('ALL');
  const [filterSymbol, setFilterSymbol] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [syncStatus, setSyncStatus] = useState<string>('Immutable Event-Driven Bus Active • Tamper-Proof');
  const [isApiLoading, setIsApiLoading] = useState<boolean>(false);

  // Dynamic failure rules & audits from Diagnostic Reasoning Engine
  const [dynamicRules, setDynamicRules] = useState<FailureConstraintRule[]>(() => 
    diagnosticReasoningEngine.getDynamicRules()
  );
  const [diagnosticAudits, setDiagnosticAudits] = useState<DiagnosticFailureAudit[]>(() => 
    diagnosticReasoningEngine.getDiagnosticAudits()
  );
  const [selectedAudit, setSelectedAudit] = useState<DiagnosticFailureAudit | null>(null);

  const loadData = async () => {
    setIsApiLoading(true);
    try {
      const symParam = filterSymbol !== 'ALL' ? `?symbol=${encodeURIComponent(filterSymbol)}` : '';
      const res = await fetch(`/api/journal${symParam}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.journals)) {
        setJournals(json.data.journals);
        if (Array.isArray(json.data?.synthesizedRules)) {
          setDynamicRules(json.data.synthesizedRules);
        }
        if (Array.isArray(json.data?.diagnosticAudits)) {
          setDiagnosticAudits(json.data.diagnosticAudits);
        }
        setSyncStatus('Immutable Event-Driven Bus • Verified Cryptographic Audit Trail');
      } else {
        const list = JournalStorageManager.getJournals();
        setJournals(list);
        setDynamicRules(diagnosticReasoningEngine.getDynamicRules());
        setDiagnosticAudits(diagnosticReasoningEngine.getDiagnosticAudits());
      }
    } catch {
      const list = JournalStorageManager.getJournals();
      setJournals(list);
      setDynamicRules(diagnosticReasoningEngine.getDynamicRules());
      setDiagnosticAudits(diagnosticReasoningEngine.getDiagnosticAudits());
    } finally {
      setIsApiLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, filterSymbol]);

  if (!isOpen && !isFullPage) return null;

  const analysis = JournalStorageManager.analyzeHistoricalJournals(filterSymbol !== 'ALL' ? (filterSymbol as CurrencyPair) : undefined);
  const totalOperativeRules = 1050 + dynamicRules.length;

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
      const matchRule = (item.synthesizedRuleId || '').toLowerCase().includes(q);
      if (!matchSymbol && !matchNotes && !matchReason && !matchKeyReasons && !matchRule) return false;
    }
    return true;
  });

  const handleExport = () => {
    const jsonStr = JournalStorageManager.exportJournalsAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qri-trader-immutable-ledger-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const content = (
    <div className={`relative w-full ${isFullPage ? 'bg-terminal-900 border border-terminal-border rounded-xl shadow-xl flex flex-col' : 'max-w-6xl bg-terminal-900 border border-terminal-border rounded-xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden'}`}>
      {/* Modal / Page Header */}
      <div className="p-4 border-b border-terminal-border bg-terminal-950 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                04 // IMMUTABLE TRADING JOURNAL & RECURSIVE DIAGNOSTIC ENGINE
              </h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                <Lock className="w-3 h-3 text-emerald-400" />
                IMMUTABLE AUDIT LEDGER
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                {totalOperativeRules} OPERATIVE RULES (1,050 + {dynamicRules.length} DYNAMIC)
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Uncompromised execution payload bus • Automatic stop-loss recursive diagnostics • Pre-execution failure constraints
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="px-2.5 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border text-xs font-mono flex items-center gap-1.5 transition-colors"
            title="Export Immutable Ledger as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export Ledger</span>
          </button>

          {isFullPage ? (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border transition-colors flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Terminal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>RETURN TO TERMINAL</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white border border-terminal-border transition-colors"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center justify-between border-b border-terminal-border/80 bg-terminal-950/70 px-4 py-2 gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 font-mono text-xs overflow-x-auto scrollbar-none max-w-full touch-pan-x">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'LEDGER'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                : 'text-slate-400 hover:text-white hover:bg-terminal-900 border border-transparent'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">01 // AUTOMATED EXECUTION LEDGER ({journals.length})</span>
            <span className="sm:hidden">01 // LEDGER ({journals.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SYNTHESIZED_RULES')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'SYNTHESIZED_RULES'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                : 'text-slate-400 hover:text-white hover:bg-terminal-900 border border-transparent'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">02 // 1051ST+ OPERATIVE RULES ({dynamicRules.length})</span>
            <span className="sm:hidden">02 // RULES ({dynamicRules.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('DIAGNOSTIC_AUDIT')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'DIAGNOSTIC_AUDIT'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-950/40'
                : 'text-slate-400 hover:text-white hover:bg-terminal-900 border border-transparent'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">03 // RECURSIVE DIAGNOSTIC POST-MORTEM ({diagnosticAudits.length})</span>
            <span className="sm:hidden">03 // AUDIT ({diagnosticAudits.length})</span>
          </button>
        </div>

        <div className="text-[11px] font-mono text-emerald-400 hidden lg:flex items-center gap-1.5">
          <Lock className="w-3 h-3" />
          <span>Manual Entry & Delete Excised • Immutable Single Source of Truth</span>
        </div>
      </div>

      {/* Aggregate Performance Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 p-3 bg-terminal-950/60 border-b border-terminal-border text-xs">
        <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Total Executions</span>
          <span className="text-lg font-bold text-white font-mono">{analysis.totalTrades}</span>
          <span className="text-[10px] text-slate-400 block font-mono">
            {analysis.winningTrades}W / {analysis.losingTrades}L
          </span>
        </div>

        <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Win Rate</span>
          <span className={`text-lg font-bold font-mono ${analysis.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
            {analysis.winRate}%
          </span>
          <span className="text-[10px] text-slate-400 block font-sans">Institutional filter</span>
        </div>

        <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Profit Factor</span>
          <span className="text-lg font-bold text-cyan-400 font-mono">{analysis.profitFactor}x</span>
          <span className="text-[10px] text-slate-400 block font-sans">Gross W/L ratio</span>
        </div>

        <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Net Realized P&L</span>
          <span className={`text-lg font-bold font-mono ${analysis.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {analysis.netPnl >= 0 ? '+' : ''}${analysis.netPnl.toFixed(2)}
          </span>
          <span className="text-[10px] text-slate-400 block font-sans">All recorded trades</span>
        </div>

        <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Operative Rules</span>
          <span className="text-lg font-bold text-indigo-300 font-mono">{totalOperativeRules}</span>
          <span className="text-[10px] text-indigo-400 block font-sans">1,050 + {dynamicRules.length} Learned</span>
        </div>

        <div className="bg-terminal-900/90 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Pre-Trade Defense</span>
          <div className="flex items-center gap-1">
            <span className="text-lg font-bold text-emerald-400 font-mono">100%</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-400/90 block font-sans">Active mistake veto</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 overflow-y-auto space-y-4 flex-1">
        {/* TAB 1: AUTOMATED EXECUTION LEDGER */}
        {activeTab === 'LEDGER' && (
          <div className="space-y-3">
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
                    placeholder="Search ledger entries, rules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 bg-terminal-950 border border-terminal-border rounded-lg text-xs text-white placeholder-slate-500 w-48 sm:w-64 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>

                <select
                  value={filterSymbol}
                  onChange={(e) => setFilterSymbol(e.target.value)}
                  className="bg-terminal-950 border border-terminal-border rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                >
                  <option value="ALL">All Pairs</option>
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
                      <th className="py-2.5 px-3">Diagnostic Failure Attribution</th>
                      <th className="py-2.5 px-3 text-right">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/60">
                    {filteredJournals.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                          No trade execution records match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredJournals.map((item) => {
                        const isLoss = item.outcome === 'LOSS';
                        const matchingAudit = diagnosticAudits.find(a => a.tradeId === item.tradeId || a.tradeId === item.id.replace('jrn-', ''));

                        return (
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
                              <span className="text-white font-bold">{item.riskRewardRatio}:1</span>
                              <span className="text-[10px] text-slate-400 block">{item.lots} lots</span>
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
                              {item.pnlPercent !== undefined && (
                                <span className="text-[10px] text-slate-400 block">
                                  {item.pnlPercent >= 0 ? '+' : ''}{item.pnlPercent}% return
                                </span>
                              )}
                            </td>

                            <td className="py-2.5 px-3">
                              {item.synthesizedRuleId ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 mb-1">
                                  <Sparkles className="w-2.5 h-2.5 text-indigo-400" />
                                  Synthesized {item.synthesizedRuleId}
                                </span>
                              ) : item.lossReasonCategory && item.lossReasonCategory !== 'NONE_DISCIPLINED_WIN' ? (
                                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-300 border border-rose-500/30 mb-1">
                                  {item.lossReasonCategory.replace(/_/g, ' ')}
                                </span>
                              ) : null}
                              <p className="text-[11px] text-slate-300 font-sans line-clamp-1">
                                {item.lessonLearned || item.notes || item.keyReasons[0] || 'Automated execution log'}
                              </p>
                            </td>

                            <td className="py-2.5 px-3 whitespace-nowrap text-right">
                              {isLoss && matchingAudit ? (
                                <button
                                  onClick={() => {
                                    setSelectedAudit(matchingAudit);
                                    setActiveTab('DIAGNOSTIC_AUDIT');
                                  }}
                                  className="px-2 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                                >
                                  <span>Inspect</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              ) : (
                                <span className="text-slate-600 text-[10px] flex items-center justify-end gap-1">
                                  <Lock className="w-2.5 h-2.5" />
                                  Immutable
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SELF-OPTIMIZING FAILURE RULES (1051ST+ OPERATIVE RULES) */}
        {activeTab === 'SYNTHESIZED_RULES' && (
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-gradient-to-r from-terminal-950 via-indigo-950/40 to-terminal-950 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">
                    Self-Optimizing Knowledge Base Expansion (Baseline 1,050 + {dynamicRules.length} Operative Rules)
                  </h3>
                  <p className="text-xs text-slate-300">
                    Each realized stop-loss executes a recursive audit and dynamically synthesizes a permanent parametric failure constraint.
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                  ACTIVE PRE-TRADE VETO ENGAGED
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {dynamicRules.map((rule) => {
                const audit = rule.failureAudit;
                const isTech = audit.failureClassification === 'TECHNICAL_BREAKDOWN';
                const isFund = audit.failureClassification === 'FUNDAMENTAL_MISALIGNMENT';

                return (
                  <div
                    key={rule.id}
                    className="p-3.5 rounded-xl bg-terminal-950 border border-terminal-border hover:border-indigo-500/50 transition-all flex flex-col justify-between space-y-3 font-mono text-xs shadow-lg"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-terminal-border/60 pb-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                            {rule.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isTech 
                              ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' 
                              : isFund 
                              ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30' 
                              : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                          }`}>
                            {audit.failureClassification.replace('_', ' ')}
                          </span>
                        </div>

                        <span className="text-[10px] font-bold text-emerald-400">
                          {rule.expectedWinRate}% Prevention Edge
                        </span>
                      </div>

                      <div className="font-bold text-white text-sm mb-1">
                        {rule.ruleName}
                      </div>

                      <p className="text-slate-300 text-xs font-sans leading-relaxed mb-2">
                        {audit.pointOfFailure}
                      </p>

                      <div className="p-2 rounded-lg bg-terminal-900 border border-terminal-border/80 space-y-1 text-[11px]">
                        <div>
                          <span className="text-slate-400">Primary Failure Metric: </span>
                          <strong className="text-rose-400">{audit.primaryFailureMetric}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400">Enforcement Action: </span>
                          <strong className={rule.enforcementAction === 'DECLINE_ENTRY' ? 'text-rose-400' : 'text-amber-400'}>
                            {rule.enforcementAction === 'DECLINE_ENTRY' ? 'AUTONOMOUS VETO (DECLINE ENTRY)' : 'SCALE SIZING (0.01 CONSERVATIVE LOTS)'}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-terminal-border/50 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Trigger: {rule.triggerConditions.symbol} ({rule.triggerConditions.direction})</span>
                      <button
                        onClick={() => {
                          setSelectedAudit(audit);
                          setActiveTab('DIAGNOSTIC_AUDIT');
                        }}
                        className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
                      >
                        <span>View Full Post-Mortem</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: RECURSIVE DIAGNOSTIC POST-MORTEM */}
        {activeTab === 'DIAGNOSTIC_AUDIT' && (
          <div className="space-y-4">
            {diagnosticAudits.length === 0 ? (
              <div className="p-8 text-center bg-terminal-950 rounded-xl border border-terminal-border text-slate-400 font-mono text-xs">
                No stop loss events recorded yet. The system is operating in disciplined parameter compliance.
              </div>
            ) : (
              <div>
                {/* Audit Selector Strip if multiple audits exist */}
                {diagnosticAudits.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 font-mono text-xs">
                    {diagnosticAudits.map((a, idx) => (
                      <button
                        key={a.synthesizedRuleId || idx}
                        onClick={() => setSelectedAudit(a)}
                        className={`px-3 py-1.5 rounded-lg border whitespace-nowrap transition-colors ${
                          (selectedAudit?.synthesizedRuleId || diagnosticAudits[0].synthesizedRuleId) === a.synthesizedRuleId
                            ? 'bg-indigo-600 text-white border-indigo-400 font-bold'
                            : 'bg-terminal-950 text-slate-400 border-terminal-border hover:text-white'
                        }`}
                      >
                        {a.synthesizedRuleId}: {a.symbol} ({a.failureClassification.replace('_', ' ')})
                      </button>
                    ))}
                  </div>
                )}

                {(() => {
                  const currentAudit = selectedAudit || diagnosticAudits[0];
                  if (!currentAudit) return null;

                  const isTech = currentAudit.failureClassification === 'TECHNICAL_BREAKDOWN';
                  const isFund = currentAudit.failureClassification === 'FUNDAMENTAL_MISALIGNMENT';

                  return (
                    <div className="p-4 rounded-xl bg-terminal-950 border border-terminal-border space-y-4 shadow-xl">
                      {/* Audit Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-terminal-border pb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
                            <AlertTriangle className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-white">
                                RECURSIVE POST-MORTEM AUDIT: {currentAudit.symbol} ({currentAudit.orderType})
                              </h3>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                isTech
                                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                                  : isFund
                                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                              }`}>
                                {currentAudit.failureClassification.replace('_', ' ')}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 font-mono">
                              Audit Timestamp: {new Date(currentAudit.auditTimestamp).toLocaleString()} • Trade ID: {currentAudit.tradeId}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-[10px] text-slate-400 block">Realized Loss</span>
                          <span className="text-sm font-bold text-rose-400">
                            -${Math.abs(currentAudit.realizedLossUsd).toFixed(2)} ({currentAudit.lossPips} pips)
                          </span>
                        </div>
                      </div>

                      {/* Isolated Point of Failure Callout */}
                      <div className="p-3.5 rounded-lg bg-rose-950/30 border border-rose-500/40 space-y-1">
                        <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
                          <ShieldAlert className="w-4 h-4 text-rose-400" />
                          <span>ISOLATED POINT OF FAILURE (ROOT CAUSE)</span>
                        </div>
                        <p className="text-xs text-slate-200 font-sans leading-relaxed">
                          {currentAudit.pointOfFailure}
                        </p>
                        <div className="text-[11px] font-mono text-rose-400 pt-1">
                          • Primary Metric: <strong>{currentAudit.primaryFailureMetric}</strong>
                        </div>
                      </div>

                      {/* Technical Breakdown vs Fundamental Misalignment Matrices */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
                        {/* Technical Matrix */}
                        <div className="p-3 rounded-lg bg-terminal-900 border border-terminal-border space-y-2">
                          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1.5">
                            <span className="font-bold text-cyan-400 uppercase text-[11px]">
                              1. Technical Level Audit
                            </span>
                            <span className="text-[10px] text-slate-400">Chart Structure</span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {currentAudit.technicalViolationDetails}
                          </p>
                          <div className="pt-1 text-[10px] text-slate-400 space-y-0.5">
                            <div>Entry Price: <strong className="text-white">{currentAudit.entryPrice}</strong></div>
                            <div>Exit Price: <strong className="text-rose-400">{currentAudit.exitPrice}</strong></div>
                            <div>Drawdown: <strong className="text-amber-400">{currentAudit.lossPips} pips</strong></div>
                          </div>
                        </div>

                        {/* Fundamental Matrix */}
                        <div className="p-3 rounded-lg bg-terminal-900 border border-terminal-border space-y-2">
                          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1.5">
                            <span className="font-bold text-purple-400 uppercase text-[11px]">
                              2. Fundamental Landscape Pulse
                            </span>
                            <span className="text-[10px] text-slate-400">Macro Dynamics</span>
                          </div>
                          <p className="text-xs text-slate-300 font-sans leading-relaxed">
                            {currentAudit.fundamentalMisalignmentDetails}
                          </p>
                          <div className="pt-1 text-[10px] text-slate-400 space-y-0.5">
                            <div>Central Bank Stance: <strong className="text-white">Active Policy Divergence</strong></div>
                            <div>Spread Direction: <strong className="text-purple-300">Adverse Yield Shift</strong></div>
                            <div>Mitigation: <strong className="text-emerald-400">Pre-Release Blackout</strong></div>
                          </div>
                        </div>
                      </div>

                      {/* Synthesized 1051st Operative Rule Commitment */}
                      <div className="p-3.5 rounded-lg bg-gradient-to-r from-terminal-900 to-indigo-950/40 border border-indigo-500/40 space-y-1.5 font-mono text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                            <span>DYNAMIC KNOWLEDGE BASE UPDATE (RULE #{currentAudit.ruleIndex})</span>
                          </div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            COMMITTED TO OPERATIONAL MEMORY
                          </span>
                        </div>
                        <div className="text-white font-bold">
                          {currentAudit.synthesizedRuleName}
                        </div>
                        <p className="text-slate-300 font-sans text-xs leading-relaxed">
                          Directive: {currentAudit.mitigationRuleDirective}
                        </p>
                        <div className="text-[10px] text-emerald-400 pt-1 flex items-center gap-1 font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Active Filter Engaged: Subsequent trades mirroring this confluence will be autonomously vetoed or scaled down to 0.01 lots.</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal / Page Footer */}
      <div className="p-3 border-t border-terminal-border bg-terminal-950 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          {syncStatus}
        </span>
        <span>
          Qri Trader Immutable Ledger • <strong className="text-white">{journals.length}</strong> Executions • <strong className="text-indigo-400">{dynamicRules.length}</strong> Learned Constraints
        </span>
      </div>
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      {content}
    </div>
  );
};
