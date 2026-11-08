'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { 
  Snowflake, 
  Lock, 
  Unlock, 
  Clock, 
  ShieldCheck, 
  Play, 
  Pause,
  CheckCircle2,
  Radio
} from 'lucide-react';
import { MarketSessionInfo } from '@/lib/types';
import { MarketSessionManager } from '@/lib/marketSessionManager';
import { useMarketCountdown } from '@/lib/useMarketCountdown';

interface MarketCloseFreezeBannerProps {
  sessionInfo: MarketSessionInfo | null;
  onToggleManualOverride?: (isManualOverride: boolean) => void;
  onMarketResume?: () => void;
}

export const MarketCloseFreezeBanner: React.FC<MarketCloseFreezeBannerProps> = ({
  sessionInfo,
  onToggleManualOverride,
  onMarketResume,
}) => {
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Smooth automatic market resume handler
  const handleAutoResume = useCallback(() => {
    setIsTransitioning(true);
    if (onMarketResume) {
      onMarketResume();
    }

    // Allow 2.5 seconds of celebratory transition feedback before dismissing
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onMarketResume]);

  // Dynamic Real-Time Countdown Hook
  const countdown = useMarketCountdown({
    sessionInfo,
    onMarketResume: handleAutoResume,
    enabled: !isManualOverride,
  });

  // Reset override state when sessionInfo changes from outside
  useEffect(() => {
    if (sessionInfo && !sessionInfo.isFrozen) {
      setIsManualOverride(false);
    }
  }, [sessionInfo?.isFrozen]);

  if (!sessionInfo || (!sessionInfo.isFrozen && !isManualOverride && !isTransitioning) || isDismissed) {
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

  const isResumedState = isTransitioning || countdown.isResuming || countdown.hasResumed;

  return (
    <div className={`relative overflow-hidden rounded-xl border p-3 sm:p-4 text-xs font-mono shadow-xl transition-all duration-500 mb-3 ${
      isResumedState
        ? 'border-emerald-500/50 bg-gradient-to-r from-emerald-950/90 via-slate-900/95 to-teal-950/90 shadow-emerald-500/10'
        : 'border-sky-500/40 bg-gradient-to-r from-sky-950/80 via-slate-900/95 to-indigo-950/80'
    }`}>
      {/* Background soft glow */}
      <div className={`absolute -top-10 -right-10 w-48 h-48 rounded-full blur-2xl pointer-events-none transition-colors duration-700 ${
        isResumedState ? 'bg-emerald-500/15' : 'bg-sky-500/10'
      }`} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 relative z-10">
        {/* Left column: Lock Status & Description */}
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`p-2 sm:p-2.5 rounded-lg border shrink-0 shadow-sm transition-colors duration-500 ${
            isResumedState
              ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300 shadow-emerald-500/20'
              : 'bg-sky-500/20 border-sky-400/50 text-sky-300 shadow-sky-500/20'
          }`}>
            {isResumedState ? (
              <Unlock className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300 animate-bounce" />
            ) : (
              <Snowflake className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse text-sky-300" />
            )}
          </div>

          <div className="min-w-0 space-y-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`font-extrabold tracking-wider text-xs sm:text-sm flex items-center gap-1.5 transition-colors ${
                isResumedState ? 'text-emerald-200' : 'text-sky-200'
              }`}>
                {isResumedState ? (
                  <>
                    <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                    MARKET SESSION RESUMED
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5 text-sky-400" />
                    GLOBAL STATE FREEZE ACTIVE
                  </>
                )}
              </span>

              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                isResumedState 
                  ? 'bg-emerald-900/60 border-emerald-600/60 text-emerald-300' 
                  : 'bg-sky-900/60 border-sky-600/60 text-sky-300'
              }`}>
                {isResumedState ? 'SESSION OPEN' : sessionInfo.statusLabel}
              </span>

              <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded border transition-colors ${
                isResumedState
                  ? 'bg-teal-950/60 border-teal-500/30 text-teal-300'
                  : 'bg-emerald-950/50 border-emerald-500/30 text-emerald-400'
              }`}>
                {isResumedState ? (
                  <>
                    <Radio className="w-3 h-3 text-teal-400 animate-pulse" />
                    STREAM SYNCHRONIZED
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3" />
                    ZERO DRIFT ENFORCED
                  </>
                )}
              </span>
            </div>

            <p className="text-slate-300 text-[11px] sm:text-xs leading-relaxed max-w-2xl">
              {isResumedState ? (
                <span>
                  Market session has automatically reopened. Synchronous WebSocket streaming resumed for{' '}
                  <strong className="text-white">{sessionInfo.pair}</strong>.
                </span>
              ) : (
                <span>
                  Market closure detected. Asynchronous background workers and synthetic micro-tickers are locked.
                  Displayed values for <strong className="text-white">{sessionInfo.pair}</strong> are frozen at{' '}
                  <strong className="text-cyan-300">${sessionInfo.lastClosePrice}</strong>.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right column: Dynamic Real-Time Countdown & Simulation Override Button */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-sky-800/40">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] transition-colors ${
            isResumedState
              ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
              : 'bg-slate-950/80 border-sky-500/30 text-sky-300'
          }`}>
            {isResumedState ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="font-bold text-emerald-300">TRADING ACTIVE</span>
              </>
            ) : (
              <>
                <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span className="text-slate-400">Resumes:</span>
                <span className="font-bold text-amber-300 tabular-nums">
                  {countdown.formattedCountdown}
                </span>
              </>
            )}
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
