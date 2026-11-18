'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Globe, 
  Activity, 
  TrendingUp, 
  Sparkles, 
  Radio, 
  Zap, 
  ChevronDown, 
  ChevronUp, 
  Sun, 
  Moon, 
  Flame,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Compass
} from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

export interface MarketSessionConfig {
  id: 'london' | 'new_york' | 'tokyo' | 'sydney';
  city: string;
  country: string;
  financialCenter: string;
  benchmarkIndex: string;
  primaryCurrencies: string[];
  volumeSharePercent: number;
  utcOpenHour: number;
  utcOpenMinute: number;
  utcCloseHour: number;
  utcCloseMinute: number;
  timezone: string;
  flag: string;
  themeColor: {
    darkBorder: string;
    darkBg: string;
    lightBorder: string;
    lightBg: string;
    accentText: string;
    badgeBg: string;
    badgeBorder: string;
    badgeText: string;
    progressGradient: string;
  };
}

export const GLOBAL_SESSIONS: MarketSessionConfig[] = [
  {
    id: 'sydney',
    city: 'Sydney',
    country: 'Australia',
    financialCenter: 'ASX / Reserve Bank of Australia',
    benchmarkIndex: 'ASX 200',
    primaryCurrencies: ['AUD', 'NZD'],
    volumeSharePercent: 4,
    utcOpenHour: 22,
    utcOpenMinute: 0,
    utcCloseHour: 7,
    utcCloseMinute: 0,
    timezone: 'Australia/Sydney',
    flag: '🇦🇺',
    themeColor: {
      darkBorder: 'border-purple-500/40',
      darkBg: 'bg-purple-950/20',
      lightBorder: 'border-purple-300',
      lightBg: 'bg-purple-50/60',
      accentText: 'text-purple-400',
      badgeBg: 'bg-purple-500/15',
      badgeBorder: 'border-purple-500/30',
      badgeText: 'text-purple-300',
      progressGradient: 'from-purple-600 to-indigo-500',
    },
  },
  {
    id: 'tokyo',
    city: 'Tokyo',
    country: 'Japan',
    financialCenter: 'Tokyo Stock Exchange / Bank of Japan',
    benchmarkIndex: 'Nikkei 225',
    primaryCurrencies: ['JPY', 'Asian Crosses'],
    volumeSharePercent: 6,
    utcOpenHour: 0,
    utcOpenMinute: 0,
    utcCloseHour: 9,
    utcCloseMinute: 0,
    timezone: 'Asia/Tokyo',
    flag: '🇯🇵',
    themeColor: {
      darkBorder: 'border-amber-500/40',
      darkBg: 'bg-amber-950/20',
      lightBorder: 'border-amber-300',
      lightBg: 'bg-amber-50/60',
      accentText: 'text-amber-400',
      badgeBg: 'bg-amber-500/15',
      badgeBorder: 'border-amber-500/30',
      badgeText: 'text-amber-300',
      progressGradient: 'from-amber-600 to-orange-500',
    },
  },
  {
    id: 'london',
    city: 'London',
    country: 'United Kingdom',
    financialCenter: 'London Stock Exchange / Bank of England',
    benchmarkIndex: 'FTSE 100',
    primaryCurrencies: ['GBP', 'EUR', 'CHF'],
    volumeSharePercent: 38,
    utcOpenHour: 8,
    utcOpenMinute: 0,
    utcCloseHour: 16,
    utcCloseMinute: 30,
    timezone: 'Europe/London',
    flag: '🇬🇧',
    themeColor: {
      darkBorder: 'border-cyan-500/40',
      darkBg: 'bg-cyan-950/20',
      lightBorder: 'border-cyan-300',
      lightBg: 'bg-cyan-50/60',
      accentText: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/15',
      badgeBorder: 'border-cyan-500/30',
      badgeText: 'text-cyan-300',
      progressGradient: 'from-cyan-600 to-teal-500',
    },
  },
  {
    id: 'new_york',
    city: 'New York',
    country: 'United States',
    financialCenter: 'NYSE / NASDAQ / Federal Reserve',
    benchmarkIndex: 'S&P 500 / DXY',
    primaryCurrencies: ['USD', 'CAD'],
    volumeSharePercent: 19,
    utcOpenHour: 13,
    utcOpenMinute: 0,
    utcCloseHour: 22,
    utcCloseMinute: 0,
    timezone: 'America/New_York',
    flag: '🇺🇸',
    themeColor: {
      darkBorder: 'border-emerald-500/40',
      darkBg: 'bg-emerald-950/20',
      lightBorder: 'border-emerald-300',
      lightBg: 'bg-emerald-50/60',
      accentText: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/15',
      badgeBorder: 'border-emerald-500/30',
      badgeText: 'text-emerald-300',
      progressGradient: 'from-emerald-600 to-teal-500',
    },
  },
];

export interface TradingSessionClockTimelineProps {
  theme?: 'dark' | 'light';
  selectedPair?: CurrencyPair;
  isMarketFrozen?: boolean;
}

export const TradingSessionClockTimeline: React.FC<TradingSessionClockTimelineProps> = ({
  theme = 'dark',
  selectedPair = 'EUR/USD',
  isMarketFrozen = false,
}) => {
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(true);

  // Update clock second by second with 0 drift
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isLight = theme === 'light';

  // Current UTC minutes & day
  const { currentUtcMinutes, utcDay, utcHour, utcMinute, utcSecond } = useMemo(() => {
    const h = currentTime.getUTCHours();
    const m = currentTime.getUTCMinutes();
    const s = currentTime.getUTCSeconds();
    return {
      currentUtcMinutes: h * 60 + m + s / 60,
      utcDay: currentTime.getUTCDay(), // 0 = Sun, 1 = Mon, ..., 5 = Fri, 6 = Sat
      utcHour: h,
      utcMinute: m,
      utcSecond: s,
    };
  }, [currentTime]);

  // Global Weekend check for FX: Friday 22:00 UTC to Sunday 22:00 UTC
  const isGlobalWeekend = useMemo(() => {
    if (utcDay === 5 && currentUtcMinutes >= 22 * 60) return true; // Friday after 22:00 UTC
    if (utcDay === 6) return true; // Saturday all day
    if (utcDay === 0 && currentUtcMinutes < 22 * 60) return true; // Sunday before 22:00 UTC
    return false;
  }, [utcDay, currentUtcMinutes]);

  // Calculate live session metrics for each major global market
  const sessionStates = useMemo(() => {
    return GLOBAL_SESSIONS.map((session) => {
      const openMinutes = session.utcOpenHour * 60 + session.utcOpenMinute;
      const closeMinutes = session.utcCloseHour * 60 + session.utcCloseMinute;
      const crossesMidnight = openMinutes > closeMinutes;

      let isOpen = false;
      let remainingMinutes = 0;
      let minutesUntilOpen = 0;
      let totalDurationMinutes = 0;
      let elapsedMinutes = 0;

      if (crossesMidnight) {
        // e.g. Sydney 22:00 to 07:00 (1320 to 420 mins)
        totalDurationMinutes = (1440 - openMinutes) + closeMinutes;
        isOpen = currentUtcMinutes >= openMinutes || currentUtcMinutes < closeMinutes;

        if (isOpen) {
          if (currentUtcMinutes >= openMinutes) {
            elapsedMinutes = currentUtcMinutes - openMinutes;
            remainingMinutes = totalDurationMinutes - elapsedMinutes;
          } else {
            elapsedMinutes = (1440 - openMinutes) + currentUtcMinutes;
            remainingMinutes = closeMinutes - currentUtcMinutes;
          }
        } else {
          minutesUntilOpen = openMinutes - currentUtcMinutes;
        }
      } else {
        // e.g. Tokyo 00:00 - 09:00, London 08:00 - 16:30, NY 13:00 - 22:00
        totalDurationMinutes = closeMinutes - openMinutes;
        isOpen = currentUtcMinutes >= openMinutes && currentUtcMinutes < closeMinutes;

        if (isOpen) {
          elapsedMinutes = currentUtcMinutes - openMinutes;
          remainingMinutes = closeMinutes - currentUtcMinutes;
        } else {
          if (currentUtcMinutes < openMinutes) {
            minutesUntilOpen = openMinutes - currentUtcMinutes;
          } else {
            minutesUntilOpen = (1440 - currentUtcMinutes) + openMinutes;
          }
        }
      }

      // Progress percentage
      const progressPercent = isOpen 
        ? Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalDurationMinutes) * 100))) 
        : 0;

      // Status classification
      let status: 'OPEN' | 'CLOSED' | 'OVERLAP' | 'CLOSING_SOON' | 'PRE_MARKET' = 'CLOSED';
      let statusLabel = 'CLOSED';

      if (isGlobalWeekend || isMarketFrozen) {
        status = 'CLOSED';
        statusLabel = isGlobalWeekend ? 'WEEKEND CLOSE' : 'STATE FROZEN';
      } else if (isOpen) {
        // Check if in London / NY overlap (13:00 to 16:30 UTC)
        const isLondonNyOverlap = currentUtcMinutes >= 13 * 60 && currentUtcMinutes <= 16 * 60 + 30;
        if ((session.id === 'london' || session.id === 'new_york') && isLondonNyOverlap) {
          status = 'OVERLAP';
          statusLabel = 'PEAK OVERLAP';
        } else if (remainingMinutes <= 45) {
          status = 'CLOSING_SOON';
          statusLabel = 'CLOSING SOON';
        } else {
          status = 'OPEN';
          statusLabel = 'ACTIVE SESSION';
        }
      } else {
        if (minutesUntilOpen <= 60 && !isGlobalWeekend) {
          status = 'PRE_MARKET';
          statusLabel = 'PRE-MARKET';
        } else {
          status = 'CLOSED';
          statusLabel = 'CLOSED';
        }
      }

      // Format timers
      const formatTimeDelta = (mins: number) => {
        const totalSecs = Math.max(0, Math.floor(mins * 60));
        const h = Math.floor(totalSecs / 3600);
        const m = Math.floor((totalSecs % 3600) / 60);
        const s = totalSecs % 60;
        return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
      };

      const timerText = isOpen 
        ? `Closes in ${formatTimeDelta(remainingMinutes)}` 
        : isGlobalWeekend
        ? 'Re-opens Sun 22:00 UTC'
        : `Opens in ${formatTimeDelta(minutesUntilOpen)}`;

      // Format city local time using Intl
      let localTimeFormatted = '';
      try {
        localTimeFormatted = new Intl.DateTimeFormat('en-US', {
          timeZone: session.timezone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(currentTime);
      } catch {
        localTimeFormatted = '--:--:--';
      }

      return {
        ...session,
        isOpen,
        status,
        statusLabel,
        progressPercent,
        timerText,
        localTimeFormatted,
        remainingMinutes,
        minutesUntilOpen,
        openUtcFormatted: `${String(session.utcOpenHour).padStart(2, '0')}:${String(session.utcOpenMinute).padStart(2, '0')}`,
        closeUtcFormatted: `${String(session.utcCloseHour).padStart(2, '0')}:${String(session.utcCloseMinute).padStart(2, '0')}`,
      };
    });
  }, [currentUtcMinutes, currentTime, isGlobalWeekend, isMarketFrozen]);

  // Active Overlap Identification
  const activeOverlapInfo = useMemo(() => {
    if (isGlobalWeekend || isMarketFrozen) {
      return {
        hasOverlap: false,
        title: 'INTERBANK WEEKEND FREEZE',
        description: 'Global interbank forex desks closed until Sunday 22:00 UTC (Sydney Open). State locked.',
        badgeClass: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
        liquidityLevel: 'ZERO LIQUIDITY (FROZEN)',
      };
    }

    const isLondonNy = currentUtcMinutes >= 13 * 60 && currentUtcMinutes <= 16 * 60 + 30;
    const isTokyoLondon = currentUtcMinutes >= 8 * 60 && currentUtcMinutes <= 9 * 60;
    const isSydneyTokyo = currentUtcMinutes >= 0 && currentUtcMinutes <= 7 * 60;

    if (isLondonNy) {
      return {
        hasOverlap: true,
        title: '🔥 LONDON & NEW YORK DUAL OVERLAP ACTIVE',
        description: 'Peak global liquidity window: ~70% of worldwide daily FX transaction volume occurs during this corridor.',
        badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse',
        liquidityLevel: 'MAXIMUM INSTITUTIONAL LIQUIDITY',
      };
    }
    if (isTokyoLondon) {
      return {
        hasOverlap: true,
        title: '⚡ TOKYO & LONDON TRANSITION CORRIDOR',
        description: 'European market open capturing Asian session breakout momentum and currency rebalancing.',
        badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        liquidityLevel: 'HIGH TRANSITIONAL LIQUIDITY',
      };
    }
    if (isSydneyTokyo) {
      return {
        hasOverlap: true,
        title: '🌏 SYDNEY & TOKYO PACIFIC CORRIDOR',
        description: 'Asian-Pacific session: primary depth concentrated in JPY, AUD, and NZD crosses.',
        badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        liquidityLevel: 'MODERATE REGIONAL LIQUIDITY',
      };
    }

    return {
      hasOverlap: false,
      title: 'SINGLE SESSION ACTIVE',
      description: 'Standard institutional liquidity flowing through primary active regional exchanges.',
      badgeClass: 'bg-slate-500/10 text-slate-300 border-slate-500/30',
      liquidityLevel: 'STANDARD SESSION LIQUIDITY',
    };
  }, [currentUtcMinutes, isGlobalWeekend, isMarketFrozen]);

  // Current UTC time formatted
  const utcFormatted = `${String(utcHour).padStart(2, '0')}:${String(utcMinute).padStart(2, '0')}:${String(utcSecond).padStart(2, '0')} UTC`;

  // Cursor position percentage on 24h timeline (0% to 100%)
  const cursorPercent = Math.min(100, Math.max(0, (currentUtcMinutes / 1440) * 100));

  return (
    <div className={`rounded-xl border transition-all duration-300 shadow-xl overflow-hidden ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/50' 
        : 'bg-terminal-950 border-terminal-border text-white shadow-2xl'
    }`}>
      {/* Top Header Strip: Global Market Pulse, UTC Clock & Live Indicators */}
      <div className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'border-slate-200 bg-slate-50/80' : 'border-terminal-border/70 bg-terminal-900/60'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Clock className="w-4 h-4 animate-spin-slow" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={`font-bold text-xs sm:text-sm tracking-wider uppercase truncate ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                GLOBAL TRADING SESSIONS TIMELINE & REAL-TIME TIMERS
              </h3>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 shrink-0 ${activeOverlapInfo.badgeClass}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                {activeOverlapInfo.liquidityLevel}
              </span>
            </div>
            <p className={`text-[11px] font-mono truncate ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
              London • New York • Tokyo • Sydney • Live 24-Hour Interbank Liquidity Engine
            </p>
          </div>
        </div>

        {/* Right Header Status: Live UTC Clock & Expand Button */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Live UTC Clock Pill */}
          <div className={`px-3 py-1.5 rounded-lg border font-mono text-xs flex items-center gap-2 shadow-inner ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-terminal-950 border-terminal-border text-cyan-400'
          }`}>
            <Globe className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-bold tracking-wider">{utcFormatted}</span>
            <span className="text-[10px] text-slate-400 hidden sm:inline">• 24H MASTER</span>
          </div>

          {/* Toggle Full Timeline Bar */}
          <button
            onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200' 
                : 'bg-terminal-900 hover:bg-terminal-800 text-slate-300 hover:text-white border-terminal-border'
            }`}
            title="Toggle 24-Hour Visual Session Timeline"
          >
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">{isTimelineExpanded ? 'Compact View' : 'Timeline Bar'}</span>
            {isTimelineExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 4 Major Global Market Cards: London, New York, Tokyo, Sydney */}
      <div className="p-3 sm:p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sessionStates.map((session) => {
            const isSessionOpen = session.isOpen;
            const isOverlap = session.status === 'OVERLAP';
            const isClosingSoon = session.status === 'CLOSING_SOON';

            return (
              <div
                key={session.id}
                className={`p-3.5 rounded-xl border transition-all duration-200 relative overflow-hidden flex flex-col justify-between ${
                  isLight
                    ? isSessionOpen 
                      ? `${session.themeColor.lightBg} ${session.themeColor.lightBorder} shadow-sm` 
                      : 'bg-slate-50/70 border-slate-200 text-slate-700'
                    : isSessionOpen
                    ? `${session.themeColor.darkBg} ${session.themeColor.darkBorder} shadow-md`
                    : 'bg-terminal-900/60 border-terminal-border/80 text-slate-300'
                }`}
              >
                {/* Active glow accent when session is open */}
                {isSessionOpen && (
                  <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none opacity-20 ${
                    session.id === 'london' ? 'bg-cyan-500' : session.id === 'new_york' ? 'bg-emerald-500' : session.id === 'tokyo' ? 'bg-amber-500' : 'bg-purple-500'
                  }`} />
                )}

                <div>
                  {/* Card Header: City, Flag, Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-base shrink-0">{session.flag}</span>
                      <div className="min-w-0">
                        <span className={`font-bold text-sm block truncate ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {session.city}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 block truncate">
                          {session.openUtcFormatted} - {session.closeUtcFormatted} UTC
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 flex items-center gap-1 ${
                      isOverlap
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm animate-pulse'
                        : isClosingSoon
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : isSessionOpen
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {isSessionOpen && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                      )}
                      {session.statusLabel}
                    </span>
                  </div>

                  {/* City Local Time Clock */}
                  <div className={`p-2 rounded-lg border font-mono text-xs mb-2.5 flex items-center justify-between ${
                    isLight ? 'bg-white border-slate-200' : 'bg-black/30 border-terminal-border/50'
                  }`}>
                    <span className="text-[10px] text-slate-400 uppercase">Local Time:</span>
                    <strong className={`tracking-wider ${isSessionOpen ? session.themeColor.accentText : isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                      {session.localTimeFormatted}
                    </strong>
                  </div>

                  {/* Active Live Countdown Timer */}
                  <div className="space-y-1 mb-2.5">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        <span>{isSessionOpen ? 'Active Window:' : 'Next Session:'}</span>
                      </span>
                      <strong className={`font-bold ${
                        isSessionOpen 
                          ? isClosingSoon 
                            ? 'text-amber-400 animate-pulse' 
                            : 'text-emerald-400' 
                          : 'text-slate-400'
                      }`}>
                        {session.timerText}
                      </strong>
                    </div>

                    {/* Elapsed Progress Bar */}
                    <div className="w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden border border-terminal-border/40">
                      <div
                        style={{ width: `${isSessionOpen ? session.progressPercent : 0}%` }}
                        className={`h-full bg-gradient-to-r ${session.themeColor.progressGradient} transition-all duration-500`}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Footer: Financial Center & Global Volume Share */}
                <div className={`pt-2 border-t text-[10px] font-mono flex items-center justify-between ${
                  isLight ? 'border-slate-200 text-slate-500' : 'border-terminal-border/40 text-slate-400'
                }`}>
                  <span className="truncate max-w-[130px]" title={session.financialCenter}>
                    {session.benchmarkIndex}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded font-bold ${session.themeColor.badgeBg} ${session.themeColor.badgeText}`}>
                    {session.volumeSharePercent}% FX Vol
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 24-Hour Visual Global Timeline Bar & Live UTC Cursor */}
        {isTimelineExpanded && (
          <div className={`p-3.5 rounded-xl border space-y-2.5 ${
            isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/80 border-terminal-border/80'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span className={`font-bold uppercase tracking-wider ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}>
                  24-Hour Interbank Market Liquidity Bar (00:00 - 24:00 UTC)
                </span>
              </div>
              <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1 text-purple-400">
                  <span className="w-2 h-2 rounded-sm bg-purple-500" /> Sydney (22-07)
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2 h-2 rounded-sm bg-amber-500" /> Tokyo (00-09)
                </span>
                <span className="flex items-center gap-1 text-cyan-400">
                  <span className="w-2 h-2 rounded-sm bg-cyan-500" /> London (08-16:30)
                </span>
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2 h-2 rounded-sm bg-emerald-500" /> New York (13-22)
                </span>
                <span className="flex items-center gap-1 text-amber-300 font-bold hidden md:flex">
                  <span className="w-2 h-2 rounded-sm bg-gradient-to-r from-cyan-400 to-emerald-400 animate-pulse" /> London/NY Overlap (13-16:30)
                </span>
              </div>
            </div>

            {/* Visual Timeline Canvas */}
            <div className="relative pt-6 pb-2">
              {/* Hour Grid Markers (00:00, 04:00, 08:00, 12:00, 16:00, 20:00, 24:00) */}
              <div className="absolute top-0 inset-x-0 flex justify-between text-[9px] font-mono text-slate-500 px-0.5">
                <span>00:00</span>
                <span>04:00</span>
                <span>08:00</span>
                <span>12:00</span>
                <span>16:00</span>
                <span>20:00</span>
                <span>24:00</span>
              </div>

              {/* Multi-Track Session Bars */}
              <div className="relative h-10 w-full bg-slate-950 rounded-lg overflow-hidden border border-terminal-border/80 flex flex-col justify-center gap-1 px-1">
                {/* Track 1: Sydney & Tokyo */}
                <div className="relative h-3 w-full bg-slate-900/60 rounded">
                  {/* Tokyo Bar: 00:00 to 09:00 UTC (0% to 37.5%) */}
                  <div 
                    style={{ left: '0%', width: '37.5%' }}
                    className="absolute top-0 bottom-0 bg-amber-500/40 border border-amber-500/60 rounded flex items-center justify-center text-[8px] font-mono font-bold text-amber-200"
                  >
                    TOKYO (00-09)
                  </div>
                  {/* Sydney Wrap 1: 00:00 to 07:00 UTC (0% to 29.16%) */}
                  <div 
                    style={{ left: '0%', width: '29.16%' }}
                    className="absolute top-0 bottom-0 bg-purple-500/30 border border-purple-500/50 rounded pointer-events-none"
                  />
                  {/* Sydney Wrap 2: 22:00 to 24:00 UTC (91.66% to 100%) */}
                  <div 
                    style={{ left: '91.66%', width: '8.34%' }}
                    className="absolute top-0 bottom-0 bg-purple-500/40 border border-purple-500/60 rounded flex items-center justify-center text-[8px] font-mono font-bold text-purple-200"
                  >
                    SYD
                  </div>
                </div>

                {/* Track 2: London & New York */}
                <div className="relative h-4 w-full bg-slate-900/60 rounded">
                  {/* London Bar: 08:00 to 16:30 UTC (33.33% to 68.75%) */}
                  <div 
                    style={{ left: '33.33%', width: '35.42%' }}
                    className="absolute top-0 bottom-0 bg-cyan-500/35 border border-cyan-500/60 rounded flex items-center justify-start pl-2 text-[9px] font-mono font-bold text-cyan-200"
                  >
                    LONDON (08-16:30)
                  </div>

                  {/* New York Bar: 13:00 to 22:00 UTC (54.16% to 91.66%) */}
                  <div 
                    style={{ left: '54.16%', width: '37.5%' }}
                    className="absolute top-0 bottom-0 bg-emerald-500/35 border border-emerald-500/60 rounded flex items-center justify-end pr-2 text-[9px] font-mono font-bold text-emerald-200"
                  >
                    NEW YORK (13-22)
                  </div>

                  {/* London / NY Overlap Highlight: 13:00 to 16:30 UTC (54.16% to 68.75%) */}
                  <div 
                    style={{ left: '54.16%', width: '14.58%' }}
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-amber-500/40 via-cyan-400/50 to-emerald-400/40 border-2 border-amber-400/80 rounded flex items-center justify-center text-[8px] font-mono font-extrabold text-white shadow-lg animate-pulse"
                    title="London / New York Peak Overlap (13:00 - 16:30 UTC)"
                  >
                    🔥 OVERLAP
                  </div>
                </div>

                {/* Live Current Time Cursor / Needle */}
                <div 
                  style={{ left: `${cursorPercent}%` }}
                  className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-md shadow-rose-500/50 z-20 pointer-events-none"
                >
                  <div className="absolute -top-4 -translate-x-1/2 bg-rose-600 text-white text-[9px] font-mono font-bold px-1.5 py-0.2 rounded shadow">
                    NOW
                  </div>
                </div>
              </div>
            </div>

            {/* Overlap Summary Callout Banner */}
            <div className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between gap-2 flex-wrap ${
              activeOverlapInfo.hasOverlap 
                ? 'bg-gradient-to-r from-cyan-950/40 via-emerald-950/30 to-indigo-950/40 border-cyan-500/30 text-cyan-200' 
                : isLight ? 'bg-white border-slate-200 text-slate-600' : 'bg-terminal-950/80 border-terminal-border/60 text-slate-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">{activeOverlapInfo.title}</span>
                  <span className="text-[10px] text-slate-400 block truncate">{activeOverlapInfo.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-[10px]">
                <span className="text-slate-400">Selected Asset:</span>
                <strong className="text-cyan-400">{selectedPair}</strong>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
