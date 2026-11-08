'use client';

import React, { useState } from 'react';
import { 
  Snowflake, 
  Lock, 
  Unlock, 
  Clock, 
  ShieldCheck, 
  AlertTriangle,
  Play, 
  Pause,
  RefreshCw
} from 'lucide-react';
import { MarketSessionInfo } from '@/lib/types';
import { MarketSessionManager } from '@/lib/marketSessionManager';

interface MarketCloseFreezeBannerProps {
  sessionInfo: MarketSessionInfo | null;
  onToggleManualOverride?: (isManualOverride: boolean) => void;
}

export const MarketCloseFreezeBanner: React.FC<MarketCloseFreezeBannerProps> = ({
  sessionInfo,
  onToggleManualOverride,
}) => {
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (!sessionInfo || (!sessionInfo.isFrozen && !isManualOverride) || isDismissed) {
    return null;
  }

  const handleToggleOverride = () => {
    const next = !isManualOverride;
    setIsManualOverride(next);
    MarketSessionManager.setManualFreeze(!next && sessionInfo.isFrozen);
    if (onToggleManualOverride) {
      onToggleManualOverride(next);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-950/80 via-slate-900/95 to-indigo-950/80 p-3 sm:p-4 text-xs font-mono shadow-xl transition-all mb-3">
      {/* Background soft icy glow */}
      <div className="absolute -top-10 -right-10 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
        {/* Left column: Lock Status & Description */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className="p-2 sm:p-2.5 rounded-lg bg-sky-500/20 border border-sky-400/50 text-sky-300 shrink-0 shadow-sm shadow-sky-500/20">
            <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-sky-300" />
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sky-200 tracking-wider text-xs sm:text-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-sky-400" />
                GLOBAL STATE FREEZE ACTIVE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-900/60 border border-sky-600/60 text-sky-300">
                {sessionInfo.statusLabel}
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                ZERO DRIFT ENFORCED
              </span>
            </div>

            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed max-w-2xl">
              Market closure detected. Asynchronous background workers and synthetic micro-tickers are locked.
              Displayed values for <strong className="text-white">{sessionInfo.pair}</strong> are frozen at{' '}
              <strong className="text-cyan-300">${sessionInfo.lastClosePrice}</strong>.
            </p>
          </div>
        </div>

        {/* Right column: Countdown & Simulation Override Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-sky-800/40">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-sky-500/30 text-sky-300 text-[11px]">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Resumes:</span>
            <span className="font-bold text-amber-300">{sessionInfo.nextOpenFormatted}</span>
          </div>

          <button
            onClick={handleToggleOverride}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95 ${
              isManualOverride
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 hover:bg-amber-500/30'
                : 'bg-sky-500/20 text-sky-300 border border-sky-500/50 hover:bg-sky-500/30'
            }`}
            title="Toggle between frozen state and simulated active stream"
          >
            {isManualOverride ? (
              <>
                <Pause className="w-3 h-3 text-amber-400" />
                <span>Re-freeze State</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-sky-400" />
                <span>Simulate Open</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
