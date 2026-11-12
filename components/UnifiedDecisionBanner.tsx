'use client';

import React from 'react';
import { MarketSessionInfo, SwarmConsensusResult } from '@/lib/types';
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
  Snowflake,
  Lock,
  Zap,
  Anchor,
  Clock,
  RefreshCw
} from 'lucide-react';

interface UnifiedDecisionBannerProps {
  consensus: SwarmConsensusResult;
  onExecuteTrade?: () => void;
  onOpenNewsWire?: () => void;
  onOpenMonteCarlo?: () => void;
  onForceRecalibrate?: () => void;
  isMarketFrozen?: boolean;
  sessionInfo?: MarketSessionInfo | null;
  theme?: 'dark' | 'light';
}

export const UnifiedDecisionBanner: React.FC<UnifiedDecisionBannerProps> = ({
  consensus,
  onExecuteTrade,
  onOpenNewsWire,
  onOpenMonteCarlo,
  onForceRecalibrate,
  isMarketFrozen = false,
  sessionInfo = null,
  theme = 'dark',
}) => {
  const { unifiedDecision, agents, executionSignal, currentPrice, pair } = consensus;
  const isBuy = unifiedDecision.direction === 'BUY';
  const isSell = unifiedDecision.direction === 'SELL';
  const isHold = unifiedDecision.direction === 'HOLD';
  const isApproved = agents.risk.verdict === 'APPROVED';

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all p-4 sm:p-6 shadow-2xl ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-900 shadow-slate-200/50'
        : 'border-terminal-border bg-gradient-to-b from-terminal-900 via-terminal-950 to-terminal-950 text-slate-100'
    }`}>
      {/* Background glow accent */}
      <div className={`absolute top-0 right-1/4 w-96 h-44 rounded-full blur-3xl pointer-events-none opacity-20 ${
        isBuy ? 'bg-emerald-500' : isSell ? 'bg-rose-500' : 'bg-amber-500'
      }`} />

      {/* Top Row: Unified Direction, Confluence Grade & Execution Pill */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 ${
        theme === 'light' ? 'border-slate-200' : 'border-terminal-border/80'
      }`}>
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
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                : unifiedDecision.confluenceGrade === 'C'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                : unifiedDecision.confluenceGrade === 'D'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : unifiedDecision.confluenceGrade === 'E'
                ? 'bg-orange-500/20 text-orange-300 border-orange-500/50'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/50'
            }`}>
              GRADE {unifiedDecision.confluenceGrade} • {executionSignal.lots.toFixed(2)} LOTS
            </span>
            <span className={theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'}>
              Confidence: <strong className="text-cyan-500 font-bold">{unifiedDecision.confidence}%</strong>
            </span>
            <span className="text-slate-400 hidden sm:inline">•</span>
            <span className={`${theme === 'light' ? 'text-slate-600' : 'text-slate-400'} hidden sm:inline`}>
              Price: <strong className={`${theme === 'light' ? 'text-slate-900' : 'text-white'} font-bold`}>{currentPrice}</strong>
            </span>
          </div>

          {/* SSOT Live Stream Parity & State Freeze Guardrail Badge */}
          {isMarketFrozen ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-950/70 border border-sky-500/50 text-[11px] font-mono text-sky-300 shadow-sm">
              <Snowflake className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span className="font-bold tracking-tight">STATE FROZEN</span>
              <span className="text-slate-400 hidden md:inline">| Zero Drift • Market Closed</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-mono text-emerald-300 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-tight">SSOT LIVE FEED</span>
              <span className="text-slate-400 hidden md:inline">| &lt;500ms • ±0.05% Tol</span>
            </div>
          )}

          {/* 24/7 Autonomous Multi-Agent Swarm Loop Pill */}
          <div 
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-[11px] font-mono text-indigo-300 shadow-sm"
            title="24/7 Autonomous Multi-Agent Swarm continuously looping across 5 specialized desks"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span className="font-bold tracking-tight">24/7 SWARM LOOP</span>
            <span className="text-cyan-300 font-bold hidden xl:inline">
              | Loop #{consensus.autonomousLoopTelemetry?.cycleNumber || 1} • 0.0s Latency
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {executionSignal.authorized && onExecuteTrade && (
            isMarketFrozen ? (
              <div 
                className="w-full sm:w-auto px-3.5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 bg-sky-950/80 border border-sky-600/50 text-sky-300 cursor-not-allowed shadow-md"
                title={`Market Closed (${sessionInfo?.statusLabel || 'State Frozen'}). Trading resumes: ${sessionInfo?.nextOpenFormatted || 'next session'}`}
              >
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                <span>EXECUTION FROZEN ({sessionInfo?.statusLabel || 'MARKET CLOSED'})</span>
              </div>
            ) : (
              <button
                onClick={onExecuteTrade}
                className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 ${
                  isBuy
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                <span>
                  {isSell
                    ? `EXECUTE SELL MARKET (${executionSignal.lots} LOTS)`
                    : `EXECUTE BUY MARKET (${executionSignal.lots} LOTS)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )
          )}

          {onOpenNewsWire && (
            <button
              onClick={onOpenNewsWire}
              className="w-full sm:w-auto px-3 py-2 rounded-xl bg-sky-950/80 hover:bg-sky-900 border border-sky-700/60 text-sky-300 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>38 Sources Wire</span>
            </button>
          )}
        </div>
      </div>

      {/* Subheader Recommendation */}
      <div className={`py-2.5 text-xs sm:text-sm font-mono flex flex-wrap items-center justify-between gap-2 border-b ${
        theme === 'light' ? 'border-slate-200 text-slate-700' : 'border-terminal-border/40 text-slate-300'
      }`}>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500 shrink-0" />
          <span className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{unifiedDecision.recommendedAction}</span>
        </div>
        <div className={`text-[11px] flex items-center gap-3 ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          <span>Stop Loss: <strong className="text-rose-600 font-bold">{executionSignal.stopLoss}</strong> {isSell ? '(Above)' : '(Below)'}</span>
          <span>Target: <strong className="text-emerald-600 font-bold">{executionSignal.takeProfit}</strong> {isSell ? '(Below)' : '(Above)'}</span>
          <span>R:R: <strong className="text-cyan-600 font-bold">{executionSignal.riskReward}:1</strong></span>
        </div>
      </div>

      {/* ⚓ Deterministic State-Latch & 15-Second Recalibration Anchor Card */}
      {consensus.latchedState && (
        <div className={`mt-3 p-3 rounded-xl border font-mono text-xs shadow-md ${
          theme === 'light'
            ? 'border-cyan-300 bg-gradient-to-r from-cyan-50 via-slate-50 to-indigo-50 text-slate-900 shadow-slate-200/60'
            : 'border-cyan-500/40 bg-gradient-to-r from-cyan-950/40 via-terminal-950 to-indigo-950/40 text-white'
        }`}>
          <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-2 ${
            theme === 'light' ? 'border-cyan-200' : 'border-cyan-500/30'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`p-1 rounded flex items-center gap-1 font-bold text-[10px] border ${
                theme === 'light'
                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              }`}>
                <Anchor className="w-3.5 h-3.5 text-cyan-600" />
                <span>15s MULTI-DESK RECALIBRATION</span>
              </span>
              <span className={`font-bold text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {consensus.latchedState.anchoredDirection} Setup Active (5-Engine Live Synthesis)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] flex items-center gap-1 font-semibold ${
                theme === 'light' ? 'text-slate-700' : 'text-slate-400'
              }`}>
                <Clock className="w-3.5 h-3.5 text-cyan-600 animate-pulse" />
                <span>Recalibrates in {consensus.latchedState.timeRemainingSeconds}s</span>
              </span>
              {onForceRecalibrate && (
                <button
                  onClick={onForceRecalibrate}
                  className={`px-2 py-0.5 rounded text-[10px] flex items-center gap-1 border transition-colors font-bold ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                      : 'bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border-terminal-border'
                  }`}
                  title="Force immediate re-evaluation of 5-agent swarm consensus"
                >
                  <RefreshCw className="w-2.5 h-2.5" />
                  <span>Recalibrate Now</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] mb-2">
            <div className={`p-2 rounded border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900/80 border-terminal-border'
            }`}>
              <span className={`text-[9px] uppercase block font-semibold ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Anchored Entry</span>
              <strong className={`text-xs ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{consensus.latchedState.anchoredEntryPrice}</strong>
              <span className="text-[9px] text-emerald-600 block font-semibold">Fixed Level</span>
            </div>
            <div className={`p-2 rounded border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900/80 border-terminal-border'
            }`}>
              <span className={`text-[9px] uppercase block font-semibold ${theme === 'light' ? 'text-rose-700' : 'text-rose-400'}`}>Anchored Stop Loss</span>
              <strong className={`text-xs ${theme === 'light' ? 'text-rose-700' : 'text-rose-300'}`}>{consensus.latchedState.anchoredStopLoss}</strong>
              <span className={`text-[9px] block ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>Strict Protection</span>
            </div>
            <div className={`p-2 rounded border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900/80 border-terminal-border'
            }`}>
              <span className={`text-[9px] uppercase block font-semibold ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>Anchored Target</span>
              <strong className={`text-xs ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-300'}`}>{consensus.latchedState.anchoredTakeProfit}</strong>
              <span className={`text-[9px] block font-semibold ${theme === 'light' ? 'text-cyan-700' : 'text-cyan-400'}`}>{consensus.latchedState.anchoredRiskReward}:1 Target</span>
            </div>
            <div className={`p-2 rounded border ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900/80 border-terminal-border'
            }`}>
              <span className={`text-[9px] uppercase block font-semibold ${theme === 'light' ? 'text-amber-700' : 'text-amber-400'}`}>
                {consensus.latchedState.anchoredDirection === 'SELL' ? 'Resistance Ceiling' : 'S1 Support Floor'}
              </span>
              <strong className={`text-xs ${theme === 'light' ? 'text-amber-800' : 'text-amber-300'}`}>
                {consensus.latchedState.anchoredDirection === 'SELL' 
                  ? consensus.latchedState.resistanceCeiling 
                  : consensus.latchedState.s1Floor}
              </strong>
              <span className={`text-[9px] block font-semibold ${theme === 'light' ? 'text-rose-700' : 'text-rose-400'}`}>Invalidation Level</span>
            </div>
          </div>

          {/* Probability-First & Knowledge Base Confluence Footer */}
          <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-[10px] ${
            theme === 'light' ? 'border-cyan-200 text-slate-700' : 'border-cyan-500/20 text-slate-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded font-bold border ${
                consensus.latchedState.probabilityFirstBoost
                  ? theme === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : theme === 'light' ? 'bg-indigo-100 text-indigo-800 border-indigo-300' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              }`}>
                🎯 MONTE CARLO WIN PROB: {consensus.latchedState.winProbabilityPercent}%
              </span>
              {consensus.latchedState.probabilityFirstBoost && (
                <span className={`font-semibold hidden md:inline ${theme === 'light' ? 'text-emerald-700' : 'text-emerald-400'}`}>
                  (&gt;70% Win Prob Elevated to Grade {consensus.latchedState.anchoredGrade} — Counter-Momentum Prevented)
                </span>
              )}
            </div>

            <div className={`flex items-center gap-3 text-[10px] ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
              <span>POC Anchor: <strong className={theme === 'light' ? 'text-cyan-700 font-bold' : 'text-cyan-300 font-bold'}>{consensus.latchedState.synthesisSources.technicalPocLevel}</strong></span>
              <span>Wire Sentiment: <strong className={theme === 'light' ? 'text-amber-700 font-bold' : 'text-amber-300 font-bold'}>{consensus.latchedState.synthesisSources.newsSentimentScore > 0 ? '+' : ''}{consensus.latchedState.synthesisSources.newsSentimentScore}%</strong></span>
              <span>1,050+ KB Rules: <strong className={theme === 'light' ? 'text-emerald-700 font-bold' : 'text-emerald-300 font-bold'}>{consensus.latchedState.synthesisSources.matchedRulesCount} matched</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* ⚡ Dual-Confirmation: Technical Momentum & Fundamental Sentiment Confirmation Gate */}
      {consensus.dualConfirmation && (
        <div className={`mt-3 p-3 rounded-xl border font-mono text-xs shadow-md transition-all ${
          consensus.dualConfirmation.confirmationStatus === 'DUAL_CONFIRMED'
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            : consensus.dualConfirmation.confirmationStatus === 'DIVERGENCE_REJECTED'
            ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            : 'bg-amber-950/40 border-amber-500/50 text-amber-200'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/60 pb-2 mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className={`w-4 h-4 ${
                consensus.dualConfirmation.confirmationStatus === 'DUAL_CONFIRMED'
                  ? 'text-emerald-400'
                  : consensus.dualConfirmation.confirmationStatus === 'DIVERGENCE_REJECTED'
                  ? 'text-rose-400'
                  : 'text-amber-400'
              }`} />
              <span className="font-bold text-white uppercase text-xs tracking-wide">
                DUAL-CONFIRMATION ENTRY GATE: {consensus.dualConfirmation.confirmationStatus.replace(/_/g, ' ')}
              </span>
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
              consensus.dualConfirmation.entryAuthorized
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
            }`}>
              {consensus.dualConfirmation.entryAuthorized ? 'ENTRY AUTHORIZED' : 'EXECUTION WITHHELD'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            {/* Technical Momentum Weight (50%) */}
            <div className="p-2 rounded bg-terminal-950/80 border border-terminal-border/80">
              <div className="flex justify-between font-bold text-cyan-300 mb-1">
                <span>Technical Momentum (50% Weight):</span>
                <span>{consensus.dualConfirmation.technicalMomentum.score}% Score</span>
              </div>
              <p className="text-slate-300 text-[10px]">
                RSI: {consensus.dualConfirmation.technicalMomentum.rsiStatus} • Trend: {consensus.dualConfirmation.technicalMomentum.structureMomentum} • Direction: {consensus.dualConfirmation.technicalMomentum.direction}
              </p>
            </div>

            {/* Fundamental Sentiment Weight (50%) */}
            <div className="p-2 rounded bg-terminal-950/80 border border-terminal-border/80">
              <div className="flex justify-between font-bold text-purple-300 mb-1">
                <span>Fundamental Sentiment (50% Weight):</span>
                <span>{consensus.dualConfirmation.fundamentalSentiment.score}% Score</span>
              </div>
              <p className="text-slate-300 text-[10px]">
                Regime: {consensus.dualConfirmation.fundamentalSentiment.macroRegime} • Central Bank: {consensus.dualConfirmation.fundamentalSentiment.centralBankDivergence.replace(/_/g, ' ')} • Direction: {consensus.dualConfirmation.fundamentalSentiment.direction}
              </p>
            </div>
          </div>

          <div className="mt-2 text-[10px] text-slate-300 italic">
            • {consensus.dualConfirmation.confirmationRationale}
          </div>
        </div>
      )}

      {/* Core Fundamental & Technical Reasons Driving the Decision (5 Structured Pillars) */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Core Drivers Behind the {unifiedDecision.direction} Decision (5-Desk Synthesis)
          </h4>
          <span className="text-[10px] font-mono text-cyan-400">
            5/5 AGENTS SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
          {/* Pillar 1: Fundamental Macro Catalyst */}
          <div className="bg-terminal-950/80 border border-purple-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-purple-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2 text-purple-400 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4" />
                  1. Fundamental Drivers
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-purple-950/60 border border-purple-800">
                  {agents.fundamental.bias}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {unifiedDecision.coreReasons.fundamental}
              </p>
            </div>
          </div>

          {/* Pillar 2: Real-Time News Wire & Financial Websites Scraper */}
          <div className="bg-terminal-950/80 border border-sky-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-sky-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2 text-sky-400 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4" />
                  2. 38-Source News Wire
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-sky-950/60 border border-sky-800">
                  {agents.news.bias}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {unifiedDecision.coreReasons.newsSentiment}
              </p>
            </div>
            {agents.news.breakingAlert && (
              <div className="mt-2.5 pt-2 border-t border-sky-900/60 text-xs font-semibold text-amber-300 truncate">
                ⚡ {agents.news.breakingAlert}
              </div>
            )}
          </div>

          {/* Pillar 3: Technical Structure & Smart Money Concepts */}
          <div className="bg-terminal-950/80 border border-cyan-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-cyan-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2 text-cyan-400 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  3. Technical Structure
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-cyan-950/60 border border-cyan-800">
                  {agents.technical.bias}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {unifiedDecision.coreReasons.technicalSetup}
              </p>
            </div>
          </div>

          {/* Pillar 4: Market Mechanics & Intermarket Correlation */}
          <div className="bg-terminal-950/80 border border-amber-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-amber-600/60 transition-colors">
            <div>
              <div className="flex items-center justify-between mb-2 text-amber-400 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  4. Intermarket Flows
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-amber-950/60 border border-amber-800">
                  {agents.forex.bias}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {unifiedDecision.coreReasons.marketDynamics}
              </p>
            </div>
          </div>

          {/* Pillar 5: Risk Manager & Capital Preservation */}
          <div className="bg-terminal-950/80 border border-emerald-800/40 rounded-xl p-3.5 flex flex-col justify-between hover:border-emerald-600/60 transition-colors md:col-span-2 lg:col-span-2">
            <div>
              <div className="flex items-center justify-between mb-2 text-emerald-400 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  5. Risk Governance & Edge
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  isApproved 
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' 
                    : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                }`}>
                  {agents.risk.verdict}
                </span>
              </div>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {unifiedDecision.coreReasons.riskGovernance}
              </p>
            </div>
            {agents.risk.monteCarlo && (
              <div className="mt-2.5 pt-2 border-t border-emerald-900/60 flex flex-wrap items-center justify-between text-xs text-slate-300 font-medium">
                <span>Monte Carlo 1,000 Paths: Win Prob {agents.risk.monteCarlo.projectedProfitProbability}%</span>
                <span>95% VaR: ${agents.risk.monteCarlo.var95Usd}</span>
                <span>Sharpe: {agents.risk.monteCarlo.sharpeRatio}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
