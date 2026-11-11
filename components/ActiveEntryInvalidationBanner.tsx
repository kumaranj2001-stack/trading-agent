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
  TrendingDown
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

  const inv = position.invalidation;
  const isInvalid = inv?.isInvalidated;
  const isProfit = position.pnl > 0;
  const pnlFormatted = `${position.pnl >= 0 ? '+' : ''}$${position.pnl.toFixed(2)}`;

  return (
    <div className={`p-3.5 rounded-xl border font-mono text-xs shadow-xl transition-all duration-300 ${
      isInvalid
        ? 'bg-gradient-to-r from-rose-950/70 via-terminal-950 to-amber-950/60 border-rose-500/60 shadow-rose-950/40 ring-1 ring-rose-500/40'
        : 'bg-gradient-to-r from-emerald-950/40 via-terminal-950 to-terminal-950 border-emerald-500/40 shadow-emerald-950/20'
    }`}>
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/80 pb-2.5 mb-2.5">
        <div className="flex items-center gap-2">
          {isInvalid ? (
            <div className="p-1 rounded bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse">
              <ShieldAlert className="w-4 h-4" />
            </div>
          ) : (
            <div className="p-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/50">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-xs sm:text-sm">
                RUNNING ENTRY: {position.symbol} {position.type} ({position.lots} Lots @ {position.entryPrice})
              </span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                isProfit ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}>
                P&L: {pnlFormatted}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-[10px] flex items-center gap-1">
            <Zap className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>24/7 DUAL MONITOR (1s TICK)</span>
          </span>
          {executionMode === 'FULL_AUTOPILOT' && (
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold">
              AUTONOMOUS EXIT READY
            </span>
          )}
        </div>
      </div>

      {/* Invalidation Alert vs Healthy Verification */}
      {isInvalid ? (
        <div className="space-y-2">
          <div className="p-2.5 rounded bg-rose-950/60 border border-rose-700/60 text-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-rose-300 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>INVALID CRITERIA FORMED (RECOMMEND IMMEDIATE CLOSE):</span>
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
                {isProfit ? (
                  <span>
                    ⚡ <strong className="text-emerald-300">Lock Small Profit:</strong> Invalidation criteria detected. Recommend closing immediately with <strong className="text-emerald-300">{pnlFormatted}</strong> profit before reversal into drawdown.
                  </span>
                ) : (
                  <span>
                    🛡️ <strong className="text-rose-300">Capital Preservation:</strong> Invalidation criteria detected. Recommend closing immediately (<strong className="text-rose-300">{pnlFormatted}</strong>) to avoid further loss.
                  </span>
                )}
              </span>

              {onClosePosition && (
                <button
                  onClick={() => onClosePosition(position.id)}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg active:scale-95 shrink-0"
                >
                  <span>
                    {isProfit ? `CLOSE NOW & LOCK ${pnlFormatted}` : `CLOSE ENTRY & PRESERVE CAPITAL`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-300 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>
              <strong className="text-emerald-300">Dual Analysis Aligned:</strong> Technical momentum (RSI/EMAs/Structure) and fundamental wire sentiment confirm trade thesis is healthy.
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[10px]">
            <span>Entry: <strong className="text-white">{position.entryPrice}</strong></span>
            <span>Current: <strong className="text-cyan-300">{position.currentPrice}</strong></span>
            <span>Stop: <strong className="text-rose-400">{position.stopLoss}</strong></span>
            <span>Target: <strong className="text-emerald-400">{position.takeProfit}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};
