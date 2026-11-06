'use client';

import React from 'react';
import { JournalMemoryAnalysis } from '@/lib/types';
import { 
  History, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  AlertTriangle, 
  BookOpen, 
  ArrowRight, 
  CheckCircle2, 
  Activity,
  Layers,
  Scale
} from 'lucide-react';

interface JournalMemoryFeedProps {
  journalAnalysis: JournalMemoryAnalysis;
  onOpenJournalModal?: () => void;
}

export const JournalMemoryFeed: React.FC<JournalMemoryFeedProps> = ({
  journalAnalysis,
  onOpenJournalModal,
}) => {
  const {
    symbolAnalyzed,
    totalHistoricalTrades,
    symbolTradesCount,
    symbolWinRate,
    symbolProfitFactor,
    avgRMultiple,
    lossSimilarityScore,
    lossPreventionVerdict,
    activeMemoryRecall,
    strategicAdjustments,
    thesis,
    timestamp,
  } = journalAnalysis;

  const isHighRisk = lossPreventionVerdict === 'HIGH_RISK_LOSS_PATTERN_DETECTED';
  const isCaution = lossPreventionVerdict === 'CAUTION_SIMILAR_TO_PAST_LOSS';
  const isWinningMatch = lossPreventionVerdict === 'FAVORABLE_WINNING_PATTERN_MATCH';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-900/40 bg-gradient-to-b from-terminal-900/90 via-terminal-950 to-terminal-950 p-4 sm:p-5 shadow-xl transition-all">
      {/* Subtle Background Glow Accent */}
      <div className={`absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-15 ${
        isHighRisk ? 'bg-rose-500' : isCaution ? 'bg-amber-500' : 'bg-emerald-500'
      }`} />

      {/* Top Bar: Specialist Identity & Active Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-terminal-border/70 pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 shadow-inner">
            <History className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" />
                Active Memory & Trade Journal Feedback Layer
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                PRE-EXECUTION AUDIT
              </span>
            </div>
            <h4 className="text-sm font-semibold text-white tracking-wide flex items-center gap-2">
              Dr. Marcus Vance
              <span className="text-xs text-slate-400 font-normal hidden md:inline">
                • Quantitative Journal & Historical Memory Specialist
              </span>
            </h4>
          </div>
        </div>

        {onOpenJournalModal && (
          <button
            onClick={onOpenJournalModal}
            className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-terminal-800/80 hover:bg-terminal-700 text-slate-200 hover:text-white border border-terminal-border font-mono text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Open Full Journal ({totalHistoricalTrades} trades)</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </button>
        )}
      </div>

      {/* Middle Grid: Historical Baseline Metrics & Loss Prevention Radar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
        {/* Metric 1: Symbol Win Rate & Sample Size */}
        <div className="p-3 rounded-xl bg-terminal-900/60 border border-terminal-border/60">
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Historical Sample ({symbolAnalyzed})
          </span>
          <div className="flex items-baseline justify-between">
            <div className="font-mono text-xl font-bold text-white">
              {symbolWinRate}% <span className="text-xs font-normal text-slate-400">WR</span>
            </div>
            <div className="font-mono text-xs text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
              PF: {symbolProfitFactor}x
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            {symbolTradesCount} logged trades • Avg Expectancy: +{avgRMultiple}R
          </span>
        </div>

        {/* Metric 2: Loss Similarity Gauge */}
        <div className="p-3 rounded-xl bg-terminal-900/60 border border-terminal-border/60">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              Loss Similarity Check
            </span>
            <span className={`font-mono text-xs font-bold ${
              lossSimilarityScore >= 60 ? 'text-rose-400' : lossSimilarityScore >= 35 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {lossSimilarityScore}% MATCH
            </span>
          </div>
          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-terminal-950 overflow-hidden my-1.5 border border-terminal-border/50">
            <div 
              className={`h-full transition-all duration-500 ${
                lossSimilarityScore >= 60 
                  ? 'bg-gradient-to-r from-amber-500 to-rose-500' 
                  : lossSimilarityScore >= 35 
                  ? 'bg-amber-500' 
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${lossSimilarityScore}%` }}
            />
          </div>
          <span className="text-[11px] text-slate-400 font-mono block">
            {isHighRisk ? 'Recurring loss pattern detected' : isCaution ? 'Structural resemblance to choppy loss' : 'No recurring loss trap detected'}
          </span>
        </div>

        {/* Metric 3: Loss Prevention Verdict */}
        <div className="p-3 rounded-xl bg-terminal-900/60 border border-terminal-border/60 flex flex-col justify-between">
          <span className="text-[11px] font-mono text-slate-400 uppercase block mb-1">
            Loss Prevention Verdict
          </span>
          <div className="flex items-center gap-2">
            {isHighRisk ? (
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            ) : isCaution ? (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className={`font-mono text-xs font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${
              isHighRisk 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' 
                : isCaution 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
            }`}>
              {lossPreventionVerdict.replace(/_/g, ' ')}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            Feed updated @ {timestamp}
          </span>
        </div>
      </div>

      {/* Concrete Memory Recall Box */}
      <div className="p-3 rounded-xl bg-terminal-950/80 border border-terminal-border/70 mb-3 font-mono text-xs">
        <div className="flex items-center gap-2 text-rose-400 font-semibold mb-1">
          <Activity className="w-3.5 h-3.5" />
          <span>Active Memory Recall from Trade #{activeMemoryRecall.pastTradeId?.slice(-6) || 'ARCHIVE'} ({activeMemoryRecall.dateOrTimeAgo}):</span>
        </div>
        <p className="text-slate-300 pl-5 text-[11px] leading-relaxed">
          <strong className="text-slate-100">{activeMemoryRecall.setupSummary}</strong>: {activeMemoryRecall.outcomeDescription}.
        </p>
        <p className="text-amber-300/90 pl-5 text-[11px] mt-1 flex items-start gap-1.5">
          <span className="text-amber-400 font-bold shrink-0">Preventative Rule:</span>
          <span>{activeMemoryRecall.mistakeIdentified}</span>
        </p>
      </div>

      {/* Strategic Adjustments Enforced on Candidate Setup */}
      <div className="pt-2 border-t border-terminal-border/60">
        <span className="text-[11px] font-mono text-slate-400 uppercase flex items-center gap-1.5 mb-2">
          <Scale className="w-3.5 h-3.5 text-cyan-400" />
          Real-Time Strategic Adjustments Applied to Candidate Setup:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="p-2 rounded-lg bg-terminal-900/40 border border-terminal-border/50 text-[11px] font-mono">
            <span className="text-slate-400 block text-[10px]">MAE Stop-Loss Buffer:</span>
            <span className="text-cyan-300 font-bold">
              +{strategicAdjustments.stopLossBufferPips.toFixed(1)} pips cushion
            </span>
          </div>
          <div className="p-2 rounded-lg bg-terminal-900/40 border border-terminal-border/50 text-[11px] font-mono">
            <span className="text-slate-400 block text-[10px]">Position Sizing Modifier:</span>
            <span className={`font-bold ${
              strategicAdjustments.sizeModifierPercent < 100 ? 'text-amber-300' : 'text-emerald-300'
            }`}>
              {strategicAdjustments.sizeModifierPercent}% of max allocation
            </span>
          </div>
          <div className="p-2 rounded-lg bg-terminal-900/40 border border-terminal-border/50 text-[11px] font-mono">
            <span className="text-slate-400 block text-[10px]">Timing / Filter Constraint:</span>
            <span className="text-slate-200 truncate block" title={strategicAdjustments.entryFilterRule}>
              {strategicAdjustments.entryFilterRule}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 italic mt-2 font-mono">
          &quot;{strategicAdjustments.reasoning}&quot;
        </p>
      </div>
    </div>
  );
};
