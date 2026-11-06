'use client';

import React from 'react';
import { SwarmConsensusResult } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Sparkles, 
  Globe2, 
  Newspaper, 
  BarChart3, 
  Scale, 
  ArrowRight,
  ShieldAlert,
  Flame,
  Radio,
  History,
  BookOpen
} from 'lucide-react';

interface UnifiedDecisionBannerProps {
  consensus: SwarmConsensusResult;
  onExecuteTrade?: () => void;
  onOpenNewsWire?: () => void;
  onOpenJournal?: () => void;
  onOpenMonteCarlo?: () => void;
}

export const UnifiedDecisionBanner: React.FC<UnifiedDecisionBannerProps> = ({
  consensus,
  onExecuteTrade,
  onOpenNewsWire,
  onOpenJournal,
  onOpenMonteCarlo,
}) => {
  const { unifiedDecision, agents, executionSignal, currentPrice, pair } = consensus;
  const isBuy = unifiedDecision.direction === 'BUY';
  const isSell = unifiedDecision.direction === 'SELL';
  const isHold = unifiedDecision.direction === 'HOLD';
  const isApproved = agents.risk.verdict === 'APPROVED';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-terminal-border bg-gradient-to-b from-terminal-900 via-terminal-950 to-terminal-950 shadow-2xl p-4 sm:p-6 transition-all">
      {/* Background glow accent */}
      <div className={`absolute top-0 right-1/4 w-96 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isBuy ? 'bg-emerald-500' : isSell ? 'bg-rose-500' : 'bg-amber-500'
      }`} />

      {/* Top Row: Unified Direction, Confluence Grade & Execution Pill */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-terminal-border/80 pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Pulsing Direction Badge */}
          <div className={`px-4 py-2 rounded-xl font-mono text-base sm:text-lg font-black tracking-wider flex items-center gap-2 border shadow-lg ${
            isBuy 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20' 
              : isSell 
              ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-rose-500/20' 
              : 'bg-amber-500/20 text-amber-400 border-amber-500/50 shadow-amber-500/20'
          }`}>
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isBuy ? 'bg-emerald-400' : isSell ? 'bg-rose-400' : 'bg-amber-400'
              }`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${
                isBuy ? 'bg-emerald-500' : isSell ? 'bg-rose-500' : 'bg-amber-500'
              }`}></span>
            </span>
            {isBuy ? <TrendingUp className="w-5 h-5" /> : isSell ? <TrendingDown className="w-5 h-5" /> : null}
            <span>UNIFIED {unifiedDecision.direction}</span>
          </div>

          {/* Confluence Grade Pill */}
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className={`px-3 py-1.5 rounded-lg font-bold border ${
              unifiedDecision.confluenceGrade === 'A+' || unifiedDecision.confluenceGrade === 'A'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : unifiedDecision.confluenceGrade === 'B'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
            }`}>
              GRADE {unifiedDecision.confluenceGrade}
            </span>
            <span className="text-slate-400">
              Confidence: <strong className="text-cyan-400 font-bold">{unifiedDecision.confidence}%</strong>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className="text-slate-400 hidden sm:inline">
              Price: <strong className="text-white font-bold">{currentPrice}</strong>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {executionSignal.authorized && onExecuteTrade && (
            <button
              onClick={onExecuteTrade}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${
                isBuy
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              <span>EXECUTE {executionSignal.orderType.replace('_', ' ')} ({executionSignal.lots} LOTS)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          {onOpenNewsWire && (
            <button
              onClick={onOpenNewsWire}
              className="px-3 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>18 Sources Wire</span>
            </button>
          )}

          {onOpenJournal && (
            <button
              onClick={onOpenJournal}
              className="px-3 py-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-300 font-mono text-xs flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5 text-rose-400" />
              <span>Journal & Memory</span>
            </button>
          )}
        </div>
      </div>

      {/* Subheader Recommendation */}
      <div className="py-2.5 text-xs sm:text-sm font-mono text-slate-300 flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/40">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="font-semibold text-white">{unifiedDecision.recommendedAction}</span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center gap-3">
          <span>Stop Loss: <strong className="text-rose-400">{executionSignal.stopLoss}</strong></span>
          <span>Target: <strong className="text-emerald-400">{executionSignal.takeProfit}</strong></span>
          <span>R:R: <strong className="text-cyan-400">{executionSignal.riskReward}:1</strong></span>
        </div>
      </div>

      {/* Core Fundamental & Technical Reasons Driving the Decision (6 Structured Pillars) */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Core Drivers Behind the {unifiedDecision.direction} Decision (6-Desk Institutional Synthesis)
          </h4>
          <span className="text-[10px] font-mono text-cyan-400">
            6/6 AGENTS SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
          {/* Pillar 1: Fundamental Macro Catalyst */}
          <div className="bg-terminal-950/80 border border-purple-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-purple-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-purple-400 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" />
                  1. Fundamental & Central Bank Drivers
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-950/60 border border-purple-800">
                  {agents.fundamental.bias}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {unifiedDecision.coreReasons.fundamental}
              </p>
            </div>
          </div>

          {/* Pillar 2: Real-Time News Wire & Financial Websites Scraper */}
          <div className="bg-terminal-950/80 border border-sky-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-sky-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-sky-400 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5" />
                  2. Live Wire & News Scraper (18 Outlets)
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-sky-950/60 border border-sky-800">
                  {agents.news.bias}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {unifiedDecision.coreReasons.newsSentiment}
              </p>
            </div>
            {agents.news.breakingAlert && (
              <div className="mt-2 pt-1.5 border-t border-sky-900/60 text-[10px] text-amber-300 truncate">
                ⚡ {agents.news.breakingAlert}
              </div>
            )}
          </div>

          {/* Pillar 3: Technical Structure & Smart Money Concepts */}
          <div className="bg-terminal-950/80 border border-cyan-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-cyan-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-cyan-400 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5" />
                  3. Technical Structure & SMC Setup
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800">
                  {agents.technical.bias}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {unifiedDecision.coreReasons.technicalSetup}
              </p>
            </div>
          </div>

          {/* Pillar 4: Market Mechanics & Intermarket Correlation */}
          <div className="bg-terminal-950/80 border border-amber-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-amber-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-amber-400 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5" />
                  4. Intermarket Flows & Liquidity Dynamics
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-800">
                  {agents.forex.bias}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {unifiedDecision.coreReasons.marketDynamics}
              </p>
            </div>
          </div>

          {/* Pillar 5: Historical Memory & Loss Prevention Feedback */}
          <div className="bg-terminal-950/80 border border-rose-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-rose-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-rose-400 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5" />
                  5. Historical Memory & Loss Prevention
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded border ${
                  agents.journal?.lossPreventionVerdict === 'HIGH_RISK_LOSS_PATTERN_DETECTED'
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                    : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                }`}>
                  {agents.journal?.lossPreventionVerdict ? agents.journal.lossPreventionVerdict.replace(/_/g, ' ') : 'MEMORY ACTIVE'}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {unifiedDecision.coreReasons.journalMemory || 'Historical loss prevention feedback active.'}
              </p>
            </div>
            {agents.journal?.strategicAdjustments && (
              <div className="mt-2 pt-1.5 border-t border-rose-900/60 text-[10px] text-slate-400 truncate">
                Stop Buffer: +{agents.journal.strategicAdjustments.stopLossBufferPips.toFixed(1)} pips • Size: {agents.journal.strategicAdjustments.sizeModifierPercent}%
              </div>
            )}
          </div>

          {/* Pillar 6: Risk Manager & Capital Preservation */}
          <div className="bg-terminal-950/80 border border-emerald-800/40 rounded-xl p-3 flex flex-col justify-between hover:border-emerald-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-emerald-400 text-[11px] font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  6. Risk Governance & Monte Carlo Edge
                </span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded ${
                  isApproved 
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                }`}>
                  {agents.risk.verdict}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                {unifiedDecision.coreReasons.riskGovernance}
              </p>
            </div>
            {agents.risk.monteCarlo && (
              <div className="mt-2 pt-1.5 border-t border-emerald-900/60 flex flex-wrap items-center justify-between text-[10px] text-slate-400">
                <span>Win Prob: {agents.risk.monteCarlo.projectedProfitProbability}%</span>
                <span>VaR95: ${agents.risk.monteCarlo.var95Usd}</span>
                <span>Sharpe: {agents.risk.monteCarlo.sharpeRatio}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
