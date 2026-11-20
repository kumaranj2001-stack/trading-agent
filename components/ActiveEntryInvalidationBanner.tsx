'use client';

import React from 'react';
import { Position } from '@/lib/types';
import { 
  ShieldAlert, 
  CheckCircle2, 
  Zap, 
  AlertTriangle, 
  ArrowRight, 
  Radio, 
  Layers, 
  Lock,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Compass
} from 'lucide-react';

interface ActiveEntryInvalidationBannerProps {
  position?: Position | null;
  onClosePosition?: (posId: string) => void;
  executionMode?: string;
}

export const ActiveEntryInvalidationBanner: React.FC<ActiveEntryInvalidationBannerProps> = ({
  position,
  onClosePosition,
  executionMode = 'MANUAL',
}) => {
  if (!position) return null;

  // 🔒 1. Decoupled Presentation Layer: Read baselines exclusively from immutable locked state
  const lockedState = position.immutableState;
  const lockedAnchors = lockedState?.anchors;
  const lockedSnapshot = lockedState?.snapshot;

  const baselineEntry = lockedAnchors?.anchoredEntryPrice ?? position.entryPrice;
  const baselineStopLoss = lockedAnchors?.anchoredStopLoss ?? position.stopLoss;
  const baselineTakeProfit = lockedAnchors?.anchoredTakeProfit ?? position.takeProfit;
  const baselineInvalidationLevel = lockedAnchors?.anchoredInvalidationPriceLevel ?? position.invalidationPriceLevel ?? baselineStopLoss;

  const inv = position.invalidation;
  const isInvalid = inv?.isInvalidated && !inv?.isInvalidationFrozen;
  const isFrozen = inv?.isInvalidationFrozen;
  const isProfit = position.pnl > 0;
  const pnlFormatted = `${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(2)}`;
  const isBreakevenLocked = inv?.isBreakevenLocked || position.isBreakevenLocked;
  const isTargetCompressed = inv?.targetCompressed || position.targetCompressed;
  const isStructuralOverride = (inv?.structuralOverrideTriggered || position.structuralOverrideTriggered) && !isFrozen;

  const oandaDiscrepancy = inv?.oandaBenchmarkDiscrepancyPips ?? lockedSnapshot?.oandaBenchmarkDiscrepancyPips ?? 0.4;
  const oandaBenchmarkPrice = lockedSnapshot?.oandaBenchmarkPrice;

  return (
    <div className={`p-3.5 rounded-xl border font-mono text-xs shadow-xl transition-all duration-300 ${
      isFrozen
        ? 'bg-gradient-to-r from-cyan-950/60 via-slate-950 to-indigo-950/60 border-cyan-500/50 shadow-cyan-950/30'
        : isStructuralOverride
        ? 'bg-gradient-to-r from-rose-950/90 via-terminal-950 to-red-950/80 border-rose-500 shadow-rose-950/60 ring-2 ring-rose-500 animate-pulse'
        : isInvalid
        ? 'bg-gradient-to-r from-rose-950/70 via-terminal-950 to-amber-950/60 border-rose-500/60 shadow-rose-950/40 ring-1 ring-rose-500/40'
        : 'bg-gradient-to-r from-emerald-950/40 via-terminal-950 to-terminal-950 border-emerald-500/40 shadow-emerald-950/20'
    }`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-terminal-border/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2 min-w-0">
          {isFrozen ? (
            <div className="p-1 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shrink-0">
              <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          ) : isStructuralOverride ? (
            <div className="p-1 rounded bg-rose-600 text-white border border-rose-400 animate-bounce shrink-0 shadow-md">
              <ShieldAlert className="w-4 h-4" />
            </div>
          ) : isInvalid ? (
            <div className="p-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse shrink-0">
              <ShieldAlert className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="font-bold text-white text-xs sm:text-sm truncate flex items-center gap-1.5">
                <span>RUNNING ENTRY: {position.symbol} {position.type} ({position.lots} Lots @ {baselineEntry})</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 inline-flex items-center gap-1 font-bold">
                  <Lock className="w-2.5 h-2.5 text-cyan-400" />
                  STATE LOCKED
                </span>
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold shrink-0 ${
                isProfit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                FLOATING P&L: {pnlFormatted}
              </span>
              {isBreakevenLocked && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 inline-flex items-center gap-1 shadow-sm">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  1:1 BREAKEVEN LOCKED (ZERO RISK)
                </span>
              )}
              {isTargetCompressed && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50 inline-flex items-center gap-1 shadow-sm">
                  <Zap className="w-3 h-3 text-amber-400" />
                  TARGET COMPRESSED (PROFIT HARVEST)
                </span>
              )}
              {isFrozen && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 inline-flex items-center gap-1 shadow-sm">
                  <Compass className="w-3 h-3 text-cyan-400" />
                  OANDA PARITY PROTECTION (CORRIDOR ACTIVE)
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 flex-wrap">
          <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[10px] flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>OANDA PARITY: ±{oandaDiscrepancy}p</span>
          </span>
          <span className="px-2 py-0.5 rounded bg-terminal-900 border border-terminal-border text-slate-300 text-[10px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>DECOUPLED BASELINE</span>
          </span>
        </div>
      </div>

      {/* Parity Freeze Warning (Protected against synthetic spikes) */}
      {isFrozen && (
        <div className="mb-2.5 p-2 rounded bg-cyan-950/50 border border-cyan-500/30 text-cyan-200 text-[11px] flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400 shrink-0 animate-spin" />
          <span>
            <strong>FEED PARITY CORRIDOR ENGAGED:</strong> Cross-feed discrepancy (±{oandaDiscrepancy} pips) monitored relative to confirmed OANDA benchmark ({oandaBenchmarkPrice || baselineEntry}). Automated stop-out triggers frozen to eliminate synthetic price distortion until parity restores.
          </span>
        </div>
      )}

      {/* Invalidation Alert vs Healthy Verification */}
      {isInvalid ? (
        <div className="space-y-2">
          <div className="p-2.5 rounded bg-rose-950/60 border border-rose-700/60 text-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>CONFIRMED STRUCTURAL INVALIDATION DETECTED:</span>
              </span>
              <span className="text-[10px] text-slate-400">
                Evaluation: {inv?.lastCheckedTime || 'Active Live Loop'}
              </span>
            </div>

            {/* Granular Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] my-2">
              <div className="p-2 rounded bg-terminal-950 border border-rose-900/60 space-y-0.5">
                <span className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  <span>Technical Invalidation Reasons:</span>
                </span>
                {inv?.technicalReasons.map((tr, i) => (
                  <p key={i} className="text-slate-300">• {tr}</p>
                ))}
              </div>

              <div className="p-2 rounded bg-terminal-950 border border-rose-900/60 space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold uppercase flex items-center gap-1">
                  <Radio className="w-3 h-3" />
                  <span>Fundamental Invalidation Reasons:</span>
                </span>
                {inv?.fundamentalReasons.map((fr, i) => (
                  <p key={i} className="text-slate-300">• {fr}</p>
                ))}
              </div>
            </div>

            {/* Directive & Immediate Close Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-rose-800/40">
              <span className="text-slate-300 text-[11px]">
                {isStructuralOverride ? (
                  <span>
                    🚨 <strong className="text-rose-400 font-black">PARAMOUNT STRUCTURAL OVERRIDE:</strong> Confirmed breach of write-protected boundary ({baselineInvalidationLevel}). Natural trade resolution completed; capital preservation exit mandated.
                  </span>
                ) : isProfit ? (
                  <span>
                    ⚡ <strong className="text-emerald-300">Lock Profit:</strong> Recommend closing with <strong className="text-emerald-300">{pnlFormatted}</strong> profit before structure decays.
                  </span>
                ) : (
                  <span>
                    🛡️ <strong className="text-rose-300">Capital Preservation:</strong> Invalidation criteria confirmed against fixed anchor (<strong className="text-rose-300">{pnlFormatted}</strong>).
                  </span>
                )}
              </span>

              {onClosePosition && (
                <button
                  onClick={() => onClosePosition(position.id)}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg active:scale-95 shrink-0"
                >
                  <span>
                    {isStructuralOverride
                      ? `PARAMOUNT EXIT: CLOSE (${pnlFormatted})`
                      : isProfit
                      ? `CLOSE NOW & LOCK ${pnlFormatted}`
                      : `CLOSE ENTRY & PRESERVE CAPITAL`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300 text-[11px]">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>
                <strong className="text-emerald-300">Locked Baseline Synchronized:</strong> Position baselines write-protected. Real-time tick stream evaluates floating P&L strictly against static entry anchor.
              </span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 text-[10px] flex-wrap">
              <span>
                Anchored Entry: <strong className="text-white">{baselineEntry}</strong>
                {lockedSnapshot && (
                  <span className="ml-1 text-[9px] text-cyan-400 bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-800">
                    Snap Bid: {lockedSnapshot.bidPrice} • Ask: {lockedSnapshot.askPrice} (Spread: {lockedSnapshot.spreadPips}p)
                  </span>
                )}
              </span>
              <span>Live Tick: <strong className="text-cyan-300">{position.currentPrice}</strong></span>
              <span>
                Stop: <strong className="text-rose-400">{baselineStopLoss}</strong>
                {isBreakevenLocked && <span className="text-emerald-400 ml-1 font-bold">[BE LOCKED]</span>}
              </span>
              <span>
                Target: <strong className="text-emerald-400">{baselineTakeProfit}</strong>
                {isTargetCompressed && <span className="text-amber-400 ml-1 font-bold">[-50%]</span>}
              </span>
            </div>
          </div>

          {/* Mandatory Explicit Invalidation Criteria & Chief Reviewer Verification Bar */}
          <div className="p-2 rounded bg-terminal-950/90 border border-terminal-border/80 flex flex-wrap items-center justify-between gap-2 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-cyan-400 font-bold uppercase">Locked Invalidation Anchor:</span>
              <span>{position.explicitInvalidationCriteria || lockedAnchors?.explicitInvalidationCriteria || 'Active structural boundary enforcement'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-400 flex-wrap">
              <span>Invalidation Boundary: <strong className="text-rose-400 font-bold">{baselineInvalidationLevel}</strong></span>
              {lockedState?.integrityHash && (
                <span className="text-cyan-400 font-mono">Hash: {lockedState.integrityHash}</span>
              )}
              {position.chiefReviewerSignature && (
                <span className="text-emerald-400 font-mono">Audit: {position.chiefReviewerSignature}</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
