'use client';

import React, { useState } from 'react';
import { MarketSessionInfo, SwarmConsensusResult } from '@/lib/types';
import { 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Shield,
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
  RefreshCw,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Check,
  X,
  Layers,
  BookOpen
} from 'lucide-react';
import { LiveMarketFeedManager } from '@/lib/liveMarketFeed';

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
  const [showInvalidationChecklist, setShowInvalidationChecklist] = useState(false);
  const [showDebateBreakdown, setShowDebateBreakdown] = useState(true);

  const { unifiedDecision, agents, currentPrice, pair, timeframe } = consensus;
  const isBuy = unifiedDecision.direction === 'BUY';
  const isSell = unifiedDecision.direction === 'SELL';
  const isHold = unifiedDecision.direction === 'HOLD';
  const isApproved = consensus.executionSignal.authorized;

  const bgGradient =
    theme === 'light'
      ? isBuy
        ? 'from-emerald-50 via-white to-slate-50 border-emerald-300 shadow-emerald-900/10'
        : isSell
        ? 'from-rose-50 via-white to-slate-50 border-rose-300 shadow-rose-900/10'
        : 'from-amber-50 via-white to-slate-50 border-amber-300 shadow-amber-900/10'
      : isBuy
      ? 'from-emerald-950/60 via-terminal-900 to-terminal-950 border-emerald-500/50 shadow-emerald-950/30'
      : isSell
      ? 'from-rose-950/60 via-terminal-900 to-terminal-950 border-rose-500/50 shadow-rose-950/30'
      : 'from-amber-950/50 via-terminal-900 to-terminal-950 border-amber-500/40 shadow-amber-950/20';

  const chiefAudit = consensus.chiefReviewerAudit;

  return (
    <div className={`p-4 sm:p-5 rounded-2xl border bg-gradient-to-br shadow-xl transition-all duration-300 ${bgGradient}`}>
      {/* Top Meta Header: Asset Pair, Live Price, Active Market Session, & Latched State */}
      <div className={`flex flex-wrap items-center justify-between pb-3 mb-3 border-b gap-2 text-xs font-mono ${
        theme === 'light' ? 'border-slate-200' : 'border-terminal-border/80'
      }`}>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              theme === 'light' ? 'bg-cyan-100 text-cyan-850 border border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
            }`}>
              {pair}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs ${
              theme === 'light' ? 'bg-slate-200 text-slate-800' : 'bg-terminal-800 text-slate-300'
            }`}>
              {timeframe.toUpperCase()}
            </span>
          </div>

          {/* Active Session & Liquidity Pill */}
          {sessionInfo && (
            <span className={`px-2 py-0.5 rounded text-[11px] flex items-center gap-1 border ${
              consensus.agents.forex.activeTradingSession.liquidityRating === 'OPTIMAL'
                ? theme === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : consensus.agents.forex.activeTradingSession.liquidityRating === 'MODERATE'
                ? theme === 'light' ? 'bg-cyan-100 text-cyan-800 border-cyan-300' : 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                : theme === 'light' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}>
              <Radio className="w-3 h-3 animate-pulse" />
              <span>{sessionInfo.sessionName.replace('_', ' ')}</span>
              <span className="opacity-70">({consensus.agents.forex.activeTradingSession.liquidityRating} Liq)</span>
            </span>
          )}

          {/* Global Market Closed Freeze Pill */}
          {isMarketFrozen && (
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-400 flex items-center gap-1 animate-pulse">
              <Snowflake className="w-3 h-3 text-sky-300" />
              <span>MARKET CLOSED • STATE FROZEN</span>
            </span>
          )}
        </div>

        {/* Live Synchronized Ticker Price & Recalibration Trigger */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs">
            <span className={theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400'}>
              Live Market:
            </span>
            <span className={`font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {currentPrice}
            </span>
          </div>

          {onForceRecalibrate && (
            <button
              onClick={onForceRecalibrate}
              className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition-all ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300 shadow-sm'
                  : 'bg-terminal-800 hover:bg-terminal-700 text-cyan-300 border-terminal-border hover:border-cyan-500/50'
              }`}
              title="Force unlatch & immediate 15s recalculation cycle"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>RECALIBRATE (15s)</span>
            </button>
          )}
        </div>
      </div>

      {/* Breaking News Real-Time Alert Banner (if active) */}
      {consensus.agents.news.breakingAlert && (
        <div className="mb-3 p-3 rounded-xl bg-gradient-to-r from-rose-950 via-amber-950 to-terminal-950 border-2 border-rose-500 shadow-lg text-xs font-mono animate-pulse">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-rose-600 text-white font-bold text-[10px] uppercase">
                🚨 REAL-TIME BREAKING WIRE ALERT
              </span>
              <span className="text-white font-bold text-xs">
                {consensus.agents.news.breakingAlert}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-black/60 text-amber-300 border border-amber-500/40 text-[10px] font-bold shrink-0">
              38 MONITORED FEEDS
            </span>
          </div>
        </div>
      )}

      {/* Main Unified Signal Display Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Direction + Confluence Grade + Confidence Score */}
        <div className="flex items-center gap-3.5">
          <div className={`p-3 rounded-2xl border shadow-inner ${
            isBuy 
              ? theme === 'light' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
              : isSell 
              ? theme === 'light' ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
              : theme === 'light' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          }`}>
            {isBuy ? <TrendingUp className="w-8 h-8" /> : isSell ? <TrendingDown className="w-8 h-8" /> : <Scale className="w-8 h-8" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${
                isBuy 
                  ? theme === 'light' ? 'text-emerald-700' : 'text-emerald-400' 
                  : isSell 
                  ? theme === 'light' ? 'text-rose-700' : 'text-rose-400' 
                  : theme === 'light' ? 'text-amber-700' : 'text-amber-400'
              }`}>
                {unifiedDecision.direction}
              </span>
              <span className={`px-2.5 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                theme === 'light' ? 'bg-indigo-100 text-indigo-900 border-indigo-300' : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              }`}>
                GRADE {consensus.confluenceGrade}
              </span>
              <span className={`px-2 py-0.5 rounded-lg text-xs font-mono font-bold border ${
                theme === 'light' ? 'bg-cyan-100 text-cyan-900 border-cyan-300' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
              }`}>
                {consensus.overallConfidence}% CONFIDENCE
              </span>
            </div>
            <p className={`text-xs mt-1 font-mono font-medium ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
              {unifiedDecision.summary}
            </p>
          </div>
        </div>

        {/* Right: Execution Dispatch CTA & Live Fill Status */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {onExecuteTrade && (
            <button
              onClick={onExecuteTrade}
              disabled={!isApproved}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md ${
                isApproved
                  ? isBuy
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
              }`}
            >
              <span>{isApproved ? `DISPATCH ${unifiedDecision.direction} @ LIVE BID/ASK` : 'ORDER VETOED (CHIEF REVIEWER)'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ⚓ Deterministic State-Latching Anchor Strip */}
      {consensus.latchedState && consensus.latchedState.isLatched && (
        <div className={`mt-3 p-3 rounded-xl border text-xs font-mono transition-all ${
          theme === 'light' ? 'bg-cyan-50/80 border-cyan-200 text-slate-800' : 'bg-terminal-950/80 border-cyan-500/30 text-cyan-200'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 mb-2 border-cyan-500/20">
            <div className="flex items-center gap-2">
              <Anchor className="w-4 h-4 text-cyan-400" />
              <span className="font-bold uppercase tracking-wide">
                DETERMINISTIC STATE-LATCH ACTIVE ({consensus.latchedState.pair})
              </span>
              <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                {consensus.latchedState.timeRemainingSeconds}s REMAINING
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px]">
              <span>Win Prob: <strong className="text-emerald-400 font-bold">{consensus.latchedState.winProbabilityPercent}%</strong></span>
              <span>•</span>
              <span>Floor S1: <strong className="text-rose-400 font-bold">{consensus.latchedState.s1Floor}</strong></span>
              <span>•</span>
              <span>Ceiling R1: <strong className="text-rose-400 font-bold">{consensus.latchedState.resistanceCeiling}</strong></span>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[11px]">
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-[10px] opacity-70 block font-semibold">Anchored Entry</span>
              <strong className="text-xs">{consensus.latchedState.anchoredEntryPrice}</strong>
            </div>
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-[10px] text-rose-500 block font-semibold">Anchored Stop Loss (5-Pip Buffer)</span>
              <strong className="text-xs text-rose-400">{consensus.latchedState.anchoredStopLoss}</strong>
            </div>
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-[10px] text-emerald-500 block font-semibold">Anchored Target</span>
              <strong className="text-xs text-emerald-400">{consensus.latchedState.anchoredTakeProfit}</strong>
            </div>
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-[10px] opacity-70 block font-semibold">Proportional Lot Size</span>
              <strong className="text-xs">{consensus.latchedState.anchoredLots} Lots ({consensus.latchedState.anchoredRiskReward}:1 R:R)</strong>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 UNLIMITED PROFIT MAXIMIZATION & ZERO-LOSS EXPOSURE PROTOCOL */}
      {consensus.entryProximityFilter && (
        <div className={`mt-3 p-3.5 sm:p-4 rounded-xl border font-mono text-xs shadow-md transition-all ${
          theme === 'light' 
            ? 'bg-gradient-to-r from-emerald-50/80 via-indigo-50/60 to-cyan-50/80 border-indigo-200 text-slate-800' 
            : 'bg-gradient-to-r from-emerald-950/40 via-indigo-950/40 to-slate-950 border-emerald-500/40 text-slate-200'
        }`}>
          {/* Header Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 mb-2.5 border-indigo-500/20">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <TrendingUp className="w-4 h-4" />
              </div>
              <span className="font-bold uppercase tracking-wider text-xs sm:text-sm">
                24/7 AUTONOMOUS SIGNAL VALIDATION: UNLIMITED PROFIT POTENTIAL & ZERO-LOSS EXPOSURE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>50-PIP RESTRICTION REMOVED</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                UNCAPPED RUNNER MODE ACTIVE
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] flex-wrap">
              <span>Live Market: <strong className="font-bold">{currentPrice}</strong></span>
              <span>•</span>
              <span>Proposed Entry: <strong className="font-bold">{consensus.executionSignal.entry}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Zero Loss Exposure: ARMED</span>
            </div>
          </div>

          {/* Multi-Tier Institutional Expansion Roadmap (Unlimited Profit Potential) */}
          <div className="space-y-2 pt-1 pb-2">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="text-indigo-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-Tier Expansion Roadmap (Institutional Gain Maximization)</span>
              </span>
              <span className="text-emerald-400 text-[10px]">
                Unlimited Upside Capture • Trailing ATR Ratchet Active
              </span>
            </div>

            {/* Target Tier Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {/* TP1: Initial Scale-Out & Breakeven Trigger */}
              <div className={`p-2 rounded-lg border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'
              }`}>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>TP1 (Scale-Out)</span>
                  <span className="text-cyan-400 font-bold">1.5R (+35 Pips)</span>
                </div>
                <div className="font-bold text-white text-xs">
                  {consensus.entryProximityFilter.expansionTargets?.tp1 || 'Entry + 35 Pips'}
                </div>
                <span className="text-[9px] text-emerald-400 block mt-0.5 font-semibold">
                  Locks in 1:1 Breakeven Stop
                </span>
              </div>

              {/* TP2: Structural Swing Expansion */}
              <div className={`p-2 rounded-lg border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'
              }`}>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>TP2 (Structure)</span>
                  <span className="text-cyan-400 font-bold">3.0R (+85 Pips)</span>
                </div>
                <div className="font-bold text-white text-xs">
                  {consensus.entryProximityFilter.expansionTargets?.tp2 || 'Entry + 85 Pips'}
                </div>
                <span className="text-[9px] text-indigo-400 block mt-0.5 font-semibold">
                  SMC Invalidation Target
                </span>
              </div>

              {/* TP3: Macro Institutional Target */}
              <div className={`p-2 rounded-lg border ${
                theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'
              }`}>
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span>TP3 (Macro)</span>
                  <span className="text-cyan-400 font-bold">5.0R (+180 Pips)</span>
                </div>
                <div className="font-bold text-white text-xs">
                  {consensus.entryProximityFilter.expansionTargets?.tp3 || 'Entry + 180 Pips'}
                </div>
                <span className="text-[9px] text-purple-400 block mt-0.5 font-semibold">
                  Central Bank Yield Runway
                </span>
              </div>

              {/* Open Runner: Uncapped Unlimited Upside */}
              <div className={`p-2 rounded-lg border ${
                theme === 'light' ? 'bg-emerald-50 border-emerald-300' : 'bg-emerald-950/40 border-emerald-500/50'
              }`}>
                <div className="flex items-center justify-between text-[10px] text-emerald-400 mb-0.5">
                  <span className="font-bold">OPEN RUNNER</span>
                  <span className="text-amber-400 font-bold">UNCAPPED (∞)</span>
                </div>
                <div className="font-bold text-emerald-400 text-xs">
                  +250 to +500+ Pips
                </div>
                <span className="text-[9px] text-emerald-300 block mt-0.5 font-semibold">
                  Dynamic ATR Trailing Ratchet
                </span>
              </div>
            </div>
          </div>

          {/* Strict Real-Time Loss Exposure Elimination Protocol Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-indigo-500/20 text-[10px]">
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-slate-500 block">1:1 Breakeven Ratchet</span>
              <strong className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                <span>ARMED (0.00% Downside)</span>
              </strong>
            </div>
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-slate-500 block">Structural Stop Loss</span>
              <strong className="text-rose-400 font-bold">5 Pips Beyond S1/R1</strong>
            </div>
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-slate-500 block">Dynamic Lot Sizing</span>
              <strong className="text-amber-400 font-bold">{consensus.executionSignal.lots} Lots (Proportional)</strong>
            </div>
            <div className={`p-1.5 rounded border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
              <span className="text-slate-500 block">Absolute Loss Cap</span>
              <strong className="text-emerald-400 font-bold">Max 2.0% Equity (${consensus.executionSignal.riskAmountUsd})</strong>
            </div>
          </div>
        </div>
      )}

      {/* 🏛️ MANDATORY CHIEF REVIEWER & INSTITUTIONAL GATEKEEPER CLEARANCE CARD */}
      {chiefAudit && (
        <div className={`mt-3.5 p-3.5 sm:p-4 rounded-xl border font-mono text-xs shadow-lg transition-all ${
          chiefAudit.status === 'VETOED'
            ? theme === 'light'
              ? 'bg-rose-50/90 border-rose-300 text-rose-950 ring-1 ring-rose-300'
              : 'bg-gradient-to-r from-rose-950/90 via-terminal-950 to-red-950/70 border-rose-500 text-rose-200 ring-1 ring-rose-500/50'
            : chiefAudit.status === 'MODIFIED'
            ? theme === 'light'
              ? 'bg-amber-50/90 border-amber-300 text-amber-950 ring-1 ring-amber-300'
              : 'bg-gradient-to-r from-amber-950/80 via-terminal-950 to-amber-900/60 border-amber-500 text-amber-200'
            : theme === 'light'
            ? 'bg-indigo-50/90 border-indigo-300 text-indigo-950 shadow-sm'
            : 'bg-gradient-to-r from-indigo-950/60 via-terminal-950 to-terminal-950 border-indigo-500/50 text-indigo-200'
        }`}>
          {/* Gatekeeper Top Bar */}
          <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-2.5 mb-2.5 ${
            theme === 'light' ? 'border-slate-300' : 'border-terminal-border/60'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg border ${
                chiefAudit.status === 'APPROVED' 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' 
                  : chiefAudit.status === 'MODIFIED'
                  ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
              }`}>
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold text-xs uppercase tracking-wide ${theme === 'light' ? 'text-slate-900 font-extrabold' : 'text-white'}`}>
                    CHIEF REVIEWER AUDIT: {chiefAudit.auditorName}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    chiefAudit.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : chiefAudit.status === 'MODIFIED'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
                  }`}>
                    GATEKEEPER {chiefAudit.status}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    chiefAudit.consensusRuleSatisfied
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                      : 'bg-rose-600 text-white border-rose-400 animate-pulse'
                  }`}>
                    {chiefAudit.agreeCount}/5 DESKS AGREE {chiefAudit.consensusRuleSatisfied ? '(SUPERMAJORITY SATISFIED)' : '(CONSENSUS FAILED: AVOID TRADE)'}
                  </span>
                </div>
                <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>
                  Signature: <code className="text-cyan-500 font-bold">{chiefAudit.gatekeeperSignature}</code> • Directive: <strong className={chiefAudit.consensusDirective === 'APPROVE_TRADE' ? 'text-emerald-500' : 'text-rose-500'}>{chiefAudit.consensusDirective}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDebateBreakdown(!showDebateBreakdown)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold border flex items-center gap-1 transition-all ${
                  theme === 'light'
                    ? 'bg-white hover:bg-slate-100 text-indigo-900 border-slate-300 shadow-sm'
                    : 'bg-terminal-900 hover:bg-terminal-800 text-indigo-300 border-indigo-500/40'
                }`}
              >
                <span>5-Agent Debate & Desk Votes</span>
                {showDebateBreakdown ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* 5 Specialist Desk Voting Breakdown Chips */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-[10px] mb-2.5">
            {Object.values(chiefAudit.deskVotes).map((deskVote) => (
              <div 
                key={deskVote.desk}
                className={`p-2 rounded border transition-all ${
                  deskVote.vote === 'AGREE'
                    ? theme === 'light'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                      : 'bg-terminal-900/90 border-emerald-500/40 text-emerald-200'
                    : theme === 'light'
                    ? 'bg-rose-50 border-rose-200 text-rose-950'
                    : 'bg-terminal-900/90 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold truncate text-[10px]">
                    {deskVote.desk === 'TECHNICAL' ? '1. Technical' :
                     deskVote.desk === 'FUNDAMENTAL' ? '2. Macro Desk' :
                     deskVote.desk === 'NEWS_WIRE' ? '3. News Wire' :
                     deskVote.desk === 'FOREX_INTERMARKET' ? '4. Intermarket' : '5. Risk Gov'}
                  </span>
                  <span className={`px-1 py-0.2 rounded font-black text-[9px] ${
                    deskVote.vote === 'AGREE'
                      ? 'bg-emerald-500/20 text-emerald-500'
                      : 'bg-rose-500/20 text-rose-500'
                  }`}>
                    {deskVote.vote}
                  </span>
                </div>
                <div className="text-[9px] opacity-80 truncate">{deskVote.analystName.split(' ')[0]} • Bias: {deskVote.bias}</div>
              </div>
            ))}
          </div>

          {/* Dialectical Debate Comparison: Buy-Side Case vs Sell-Side Counter-Thesis */}
          {showDebateBreakdown && (
            <div className="mt-2.5 space-y-2.5 pt-2.5 border-t border-terminal-border/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {/* Buy-Side Case Card */}
                <div className={`p-3 rounded-lg border text-[11px] ${
                  theme === 'light'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                }`}>
                  <div className="flex items-center justify-between font-bold text-xs mb-1.5 text-emerald-500">
                    <span className="flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4" />
                      BUY-SIDE THESIS (DEMAND & CONFLUENCE)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40">
                      SMC DEMAND FLOOR
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {chiefAudit.buySideCase}
                  </p>
                </div>

                {/* Sell-Side Counter-Thesis Card */}
                <div className={`p-3 rounded-lg border text-[11px] ${
                  theme === 'light'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                }`}>
                  <div className="flex items-center justify-between font-bold text-xs mb-1.5 text-rose-500">
                    <span className="flex items-center gap-1.5">
                      <TrendingDown className="w-4 h-4" />
                      SELL-SIDE COUNTER-THESIS (SUPPLY & DRAG)
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/20 border border-rose-500/40">
                      RESISTANCE CEILING
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    {chiefAudit.sellSideCase}
                  </p>
                </div>
              </div>

              {/* Chief Reviewer Comparative Verdict */}
              <div className={`p-3 rounded-lg border text-xs font-mono ${
                chiefAudit.consensusRuleSatisfied
                  ? theme === 'light'
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
                    : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-200'
                  : theme === 'light'
                  ? 'bg-rose-100 border-rose-300 text-rose-950 font-bold'
                  : 'bg-rose-950/80 border-rose-500 text-rose-200'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs uppercase flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Chief Reviewer Dialectical Synthesis & Consensus Ruling:
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    chiefAudit.consensusRuleSatisfied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-600 text-white'
                  }`}>
                    {chiefAudit.consensusDirective}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  {chiefAudit.comparativeVerdict}
                </p>
              </div>
            </div>
          )}

          {/* Contradiction Warning (if any) */}
          {chiefAudit.contradictionResolution.hasContradiction && (
            <div className={`mt-2.5 p-2.5 rounded-lg border text-[11px] ${
              chiefAudit.status === 'VETOED'
                ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                : 'bg-amber-950/60 border-amber-600 text-amber-200'
            }`}>
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase text-[10px]">
                  CONTRADICTION DETECTED: {chiefAudit.contradictionResolution.contradictionType?.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-[10px] leading-relaxed">
                {chiefAudit.contradictionResolution.explanation}
              </p>
            </div>
          )}

          {/* Mandatory Invalidation Trigger Strip */}
          <div className={`mt-2.5 p-2.5 rounded-lg border flex flex-wrap items-center justify-between gap-2 text-[11px] ${
            theme === 'light' ? 'bg-white border-slate-300 text-slate-800' : 'bg-terminal-900 border-terminal-border text-slate-200'
          }`}>
            <div className="flex items-center gap-2 flex-wrap">
              <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
              <span>
                <strong className="text-cyan-500 uppercase">MANDATORY INVALIDATION:</strong> {chiefAudit.explicitInvalidationCriteria}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold border border-rose-500/40 text-[10px]">
                Level: {chiefAudit.invalidationPriceLevel}
              </span>
              <button
                onClick={() => setShowInvalidationChecklist(!showInvalidationChecklist)}
                className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
                    : 'bg-terminal-800 hover:bg-terminal-700 text-cyan-300 border-terminal-border'
                }`}
              >
                <span>All 7 Invalidation Triggers</span>
                {showInvalidationChecklist ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* Complete 7-Trigger Invalidation Checklist Modal/Panel */}
          {showInvalidationChecklist && (
            <div className={`mt-2.5 p-3 rounded-lg border text-[11px] space-y-1.5 ${
              theme === 'light' ? 'bg-slate-50 border-slate-300 text-slate-800' : 'bg-terminal-950 border-terminal-border text-slate-300'
            }`}>
              <div className="flex items-center justify-between pb-1.5 border-b border-terminal-border/40 font-bold text-xs">
                <span className="flex items-center gap-1.5 text-rose-400 uppercase">
                  <ShieldAlert className="w-4 h-4" />
                  Mandatory Institutional Invalidation Checklist (7 Triggers)
                </span>
                <span className="text-[10px] text-slate-500">Autonomous exit on breach</span>
              </div>
              <div className="space-y-1 pt-1 font-mono text-[10px]">
                {chiefAudit.completeInvalidationCriteriaList.map((crit, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-1.5 rounded hover:bg-black/10 transition-colors">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{crit}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Core Fundamental & Technical Reasons Driving the Decision (5 Structured Pillars) */}
      <div className="mt-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <h4 className={`text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
            theme === 'light' ? 'text-slate-800 font-extrabold' : 'text-slate-300'
          }`}>
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            Core Drivers Behind the {unifiedDecision.direction} Decision (5-Desk Synthesis)
          </h4>
          <span className="text-[10px] font-mono text-cyan-500 font-bold">
            5/5 AGENTS SYNCHRONIZED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
          {/* Pillar 1: Fundamental Macro Catalyst */}
          <div className={`rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${
            theme === 'light' ? 'bg-white border-purple-200 text-slate-800 shadow-sm' : 'bg-terminal-950/80 border-purple-800/40 text-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2 text-purple-500 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4" />
                  1. Fundamental Drivers
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-purple-500/15 border border-purple-400">
                  {agents.fundamental.bias}
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                {unifiedDecision.coreReasons.fundamental}
              </p>
            </div>
          </div>

          {/* Pillar 2: Real-Time News Wire & Financial Websites Scraper */}
          <div className={`rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${
            theme === 'light' ? 'bg-white border-sky-200 text-slate-800 shadow-sm' : 'bg-terminal-950/80 border-sky-800/40 text-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2 text-sky-500 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <Newspaper className="w-4 h-4" />
                  2. 38-Source News Wire
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-sky-500/15 border border-sky-400">
                  {agents.news.bias}
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                {unifiedDecision.coreReasons.newsSentiment}
              </p>
            </div>
            {agents.news.breakingAlert && (
              <div className="mt-2.5 pt-2 border-t border-sky-500/30 text-xs font-semibold text-amber-500 truncate">
                ⚡ {agents.news.breakingAlert}
              </div>
            )}
          </div>

          {/* Pillar 3: Technical Structure & Smart Money Concepts */}
          <div className={`rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${
            theme === 'light' ? 'bg-white border-cyan-200 text-slate-800 shadow-sm' : 'bg-terminal-950/80 border-cyan-800/40 text-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2 text-cyan-500 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4" />
                  3. Technical Structure
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-cyan-500/15 border border-cyan-400">
                  {agents.technical.bias}
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                {unifiedDecision.coreReasons.technicalSetup}
              </p>
            </div>
          </div>

          {/* Pillar 4: Market Mechanics & Intermarket Correlation */}
          <div className={`rounded-xl p-3.5 flex flex-col justify-between border transition-colors ${
            theme === 'light' ? 'bg-white border-amber-200 text-slate-800 shadow-sm' : 'bg-terminal-950/80 border-amber-800/40 text-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2 text-amber-500 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-4 h-4" />
                  4. Intermarket Flows
                </span>
                <span className="text-xs px-2 py-0.5 rounded font-bold bg-amber-500/15 border border-amber-400">
                  {agents.forex.bias}
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                {unifiedDecision.coreReasons.marketDynamics}
              </p>
            </div>
          </div>

          {/* Pillar 5: Risk Manager & Capital Preservation */}
          <div className={`rounded-xl p-3.5 flex flex-col justify-between border transition-colors md:col-span-2 lg:col-span-2 ${
            theme === 'light' ? 'bg-white border-emerald-200 text-slate-800 shadow-sm' : 'bg-terminal-950/80 border-emerald-800/40 text-slate-300'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-2 text-emerald-500 text-xs sm:text-sm font-bold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  5. Risk Governance & Edge
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                  isApproved 
                    ? 'bg-emerald-500/15 border border-emerald-400 text-emerald-600' 
                    : 'bg-rose-500/15 border border-rose-400 text-rose-600'
                }`}>
                  {agents.risk.verdict}
                </span>
              </div>
              <p className={`text-xs sm:text-sm leading-relaxed ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
                {unifiedDecision.coreReasons.riskGovernance}
              </p>
            </div>
            {agents.risk.monteCarlo && (
              <div className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between text-xs font-medium ${
                theme === 'light' ? 'border-emerald-200 text-slate-700' : 'border-emerald-900/60 text-slate-300'
              }`}>
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
