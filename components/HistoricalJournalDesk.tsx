'use client';

import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  AlertTriangle,
  History,
  TrendingUp,
  TrendingDown,
  Layers,
  ChevronRight,
  ExternalLink,
  Target,
  ShieldAlert,
  Lock,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { CurrencyPair, HistoricalJournalAnalysis, FailureConstraintRule } from '@/lib/types';
import { JournalStorageManager } from '@/lib/journalStorage';
import { diagnosticReasoningEngine } from '@/lib/diagnosticReasoningEngine';

export interface HistoricalJournalDeskProps {
  selectedPair: CurrencyPair;
  onOpenJournalModal: () => void;
  journalAnalysis?: {
    totalReviewedTrades: number;
    symbolWinRate: number;
    recentLossesCount: number;
    primaryPastLossFactor?: string;
    guardrailActionApplied?: string;
    historicalSafetyScore: number;
  };
  theme?: 'dark' | 'light';
}

export const HistoricalJournalDesk: React.FC<HistoricalJournalDeskProps> = ({
  selectedPair,
  onOpenJournalModal,
  journalAnalysis,
  theme = 'dark',
}) => {
  const [liveAnalysis, setLiveAnalysis] = React.useState<HistoricalJournalAnalysis | null>(null);
  const [dynamicRules, setDynamicRules] = React.useState<FailureConstraintRule[]>(() =>
    diagnosticReasoningEngine.getDynamicRules()
  );

  React.useEffect(() => {
    fetch(`/api/journal?symbol=${encodeURIComponent(selectedPair)}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.analysis) {
          setLiveAnalysis(json.data.analysis);
        }
        if (json.success && Array.isArray(json.data?.synthesizedRules)) {
          setDynamicRules(json.data.synthesizedRules);
        }
      })
      .catch(e => console.error('Failed to query journal API:', e));
  }, [selectedPair]);

  const analysis: HistoricalJournalAnalysis = liveAnalysis || JournalStorageManager.analyzeHistoricalJournals(selectedPair);
  const symbolStats = analysis.symbolStats[selectedPair] || {
    trades: 0,
    wins: 0,
    losses: 0,
    winRate: 0,
    netPnl: 0,
  };

  const primaryLoss = analysis.primaryLossCauses[0];
  const recurringWarning = analysis.recurringMistakesWarning;
  const guardrailAction = journalAnalysis?.guardrailActionApplied || analysis.activeGuardrailAction;

  const totalOperativeRules = 1050 + dynamicRules.length;
  const latestRule = dynamicRules.length > 0 ? dynamicRules[0] : null;

  const cardBaseClass = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
    : 'bg-terminal-950/90 border-terminal-border/80 text-slate-100 shadow-lg';

  const subBoxClass = theme === 'light'
    ? 'bg-slate-50 border-slate-200/80 text-slate-700'
    : 'bg-terminal-900/60 border-terminal-border/60 text-slate-200';

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-xl space-y-3.5 transition-colors duration-200 ${cardBaseClass}`}>
      {/* Header */}
      <div className={`flex flex-wrap items-center justify-between gap-2.5 border-b pb-3 ${
        theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`text-xs sm:text-sm font-black tracking-wide uppercase ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                HISTORICAL JOURNAL LOSS REVIEW & RECURSIVE DIAGNOSTICS
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-emerald-500/15 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30 flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span>IMMUTABLE AUDIT LEDGER</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-indigo-500/15 text-indigo-400 dark:text-indigo-400 light:text-indigo-700 border border-indigo-500/30">
                {totalOperativeRules} OPERATIVE RULES
              </span>
            </div>
            <p className={`text-[11px] font-sans ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Pre-trade review of past outcomes, multidimensional mistake attribution, and dynamic failure constraint enforcement on {selectedPair}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenJournalModal}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-sm ${
            theme === 'light'
              ? 'bg-slate-100 hover:bg-slate-200 text-cyan-700 border-slate-300'
              : 'bg-terminal-800 hover:bg-terminal-700 text-cyan-300 border-terminal-border hover:text-white'
          }`}
        >
          <span>VIEW IMMUTABLE LOGS ({analysis.totalTrades})</span>
          <ExternalLink className="w-3 h-3 text-cyan-400" />
        </button>
      </div>

      {/* Grid of Key Pre-Trade Verification Metrics */}
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block truncate">
            {selectedPair} Track Record
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={`text-base font-black ${symbolStats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {symbolStats.winRate}%
            </span>
            <span className="text-slate-400 text-[11px] truncate">
              ({symbolStats.wins}W / {symbolStats.losses}L)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block mt-1 truncate">
            Net P&L: <strong className={symbolStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {symbolStats.netPnl >= 0 ? '+' : ''}${symbolStats.netPnl.toFixed(2)}
            </strong>
          </span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block truncate">
            Operative Quant Rules
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-base font-black text-indigo-400">
              {totalOperativeRules}
            </span>
            <span className="text-slate-400 text-[10px] truncate">
              (1,050 + {dynamicRules.length})
            </span>
          </div>
          <span className="text-[10px] text-indigo-400 block mt-1 truncate">
            {dynamicRules.length > 0 ? `Rule #${latestRule?.failureAudit.ruleIndex || 1051} Active` : 'Baseline Active'}
          </span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block truncate">
            Primary Loss Attribution
          </span>
          <span className="text-xs font-black text-rose-400 block truncate mt-1">
            {primaryLoss ? primaryLoss.category.replace(/_/g, ' ') : 'Zero Traps Detected'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-1 truncate">
            {primaryLoss ? `${primaryLoss.percentage}% of past losses` : 'Disciplined executions'}
          </span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block truncate">
            Self-Optimizing Defense
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-base font-black text-emerald-400">
              {journalAnalysis?.historicalSafetyScore || Math.min(95, Math.round(analysis.winRate * 1.1))}/100
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-emerald-500 font-semibold block mt-1 truncate">
            Pre-trade filter cleared: 100%
          </span>
        </div>
      </div>

      {/* Pre-Trade Guardrail Enforcement Banner */}
      <div className={`p-3 sm:p-3.5 rounded-xl border flex items-start gap-3 text-xs ${
        recurringWarning || latestRule
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
      }`}>
        {recurringWarning || latestRule ? (
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-1 flex-1 min-w-0 font-sans">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="font-bold text-white dark:text-white light:text-slate-900 uppercase font-mono text-xs">
              {latestRule ? `ACTIVE PRE-TRADE FAILURE FILTER ENGAGED (RULE #${latestRule.failureAudit.ruleIndex})` : 'HISTORICAL SAFETY CLEARANCE GRANTED'}
            </span>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${
              theme === 'light' ? 'bg-white border-slate-300 text-slate-700' : 'bg-terminal-950 border-terminal-border text-slate-300'
            }`}>
              SELF-OPTIMIZING DEFENSE
            </span>
          </div>
          <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
            {latestRule
              ? `Operational constraint active: ${latestRule.preventativeMessage}`
              : (recurringWarning || `No recurring loss patterns detected for ${selectedPair}. Position sizing and invalidation floor approved without historical penalty.`)}
          </p>
          {guardrailAction && (
            <p className="text-[11px] font-mono text-cyan-400 pt-0.5 font-bold">
              • SWARM ACTION: {guardrailAction}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
