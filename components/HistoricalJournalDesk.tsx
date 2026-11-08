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
} from 'lucide-react';
import { CurrencyPair, HistoricalJournalAnalysis } from '@/lib/types';
import { JournalStorageManager } from '@/lib/journalStorage';

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
}

export const HistoricalJournalDesk: React.FC<HistoricalJournalDeskProps> = ({
  selectedPair,
  onOpenJournalModal,
  journalAnalysis,
}) => {
  const [liveAnalysis, setLiveAnalysis] = React.useState<HistoricalJournalAnalysis | null>(null);

  React.useEffect(() => {
    fetch(`/api/journal?symbol=${encodeURIComponent(selectedPair)}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data?.analysis) {
          setLiveAnalysis(json.data.analysis);
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

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-3 sm:p-4 shadow-xl space-y-3">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border pb-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
                HISTORICAL JOURNAL LOSS REVIEW & GUARDRAILS
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                ACTIVE ANALYTICAL LAYER
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Pre-trade review of past outcomes and mistake attribution before capital deployment on {selectedPair}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenJournalModal}
          className="px-2.5 py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-cyan-400 hover:text-cyan-300 border border-terminal-border text-xs font-mono font-semibold flex items-center gap-1 transition-colors"
        >
          <span>VIEW FULL LOGS ({analysis.totalTrades})</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      {/* Grid of Key Pre-Trade Verification Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="bg-terminal-950 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase block font-sans">
            {selectedPair} Track Record
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className={`text-base font-bold ${symbolStats.winRate >= 50 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {symbolStats.winRate}%
            </span>
            <span className="text-slate-400 text-[11px]">
              ({symbolStats.wins}W / {symbolStats.losses}L)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
            Net P&L: <strong className={symbolStats.netPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
              {symbolStats.netPnl >= 0 ? '+' : ''}${symbolStats.netPnl.toFixed(2)}
            </strong>
          </span>
        </div>

        <div className="bg-terminal-950 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase block font-sans">
            Overall Swarm Win Rate
          </span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-white">
              {analysis.winRate}%
            </span>
            <span className="text-slate-400 text-[11px]">
              ({analysis.totalTrades} total)
            </span>
          </div>
          <span className="text-[10px] text-cyan-400 block font-sans mt-0.5">
            Profit Factor: <strong>{analysis.profitFactor}x</strong>
          </span>
        </div>

        <div className="bg-terminal-950 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase block font-sans">
            Past Loss Attribution Trap
          </span>
          <span className="text-xs font-bold text-rose-300 block truncate mt-1">
            {primaryLoss ? primaryLoss.category.replace(/_/g, ' ') : 'Zero Traps Detected'}
          </span>
          <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
            {primaryLoss ? `${primaryLoss.percentage}% of past losses` : 'Disciplined executions'}
          </span>
        </div>

        <div className="bg-terminal-950 p-2.5 rounded-lg border border-terminal-border">
          <span className="text-slate-400 text-[10px] uppercase block font-sans">
            Historical Safety Score
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base font-bold text-emerald-400">
              {journalAnalysis?.historicalSafetyScore || Math.min(95, Math.round(analysis.winRate * 1.1))}/100
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[10px] text-slate-400 block font-sans mt-0.5">
            Past max loss run: {analysis.maxConsecutiveLosses} in a row
          </span>
        </div>
      </div>

      {/* Pre-Trade Guardrail Enforcement Banner */}
      <div className={`p-2.5 sm:p-3 rounded-lg border flex items-start gap-2.5 text-xs ${
        recurringWarning
          ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        {recurringWarning ? (
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="space-y-0.5 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-bold text-white uppercase font-mono">
              {recurringWarning ? 'ACTIVE PRE-TRADE LOSS GUARDRAIL APPLIED' : 'HISTORICAL SAFETY CLEARANCE GRANTED'}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-terminal-950/80 border border-terminal-border text-slate-300">
              AUDITED
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            {recurringWarning || `No recurring loss patterns detected for ${selectedPair}. Position sizing and invalidation floor approved without historical penalty.`}
          </p>
          {guardrailAction && (
            <p className="text-[10px] font-mono text-cyan-300 pt-0.5">
              • SWARM ACTION: {guardrailAction}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
