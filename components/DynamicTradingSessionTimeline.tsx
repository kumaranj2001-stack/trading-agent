'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  Globe, 
  Activity, 
  Zap, 
  Layers, 
  ShieldCheck, 
  TrendingUp, 
  ChevronDown, 
  ChevronUp,
  Sparkles,
  Flame,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

interface DynamicTradingSessionTimelineProps {
  currentPair?: CurrencyPair;
  theme?: 'dark' | 'light';
}

interface MarketSessionConfig {
  id: 'sydney' | 'tokyo' | 'london' | 'newyork';
  name: string;
  flag: string;
  financialCenter: string;
  country: string;
  timeZone: string;
  utcOpenHour: number;
  utcOpenMinute: number;
  utcCloseHour: number;
  utcCloseMinute: number;
  accentColor: string;
  borderAccent: string;
  badgeBg: string;
  barColor: string;
  pairs: string[];
}

const SESSIONS: MarketSessionConfig[] = [
  {
    id: 'sydney',
    name: 'Sydney Session',
    flag: '🇦🇺',
    financialCenter: 'ASX • Sydney',
    country: 'Australia',
    timeZone: 'Australia/Sydney',
    utcOpenHour: 21,
    utcOpenMinute: 0,
    utcCloseHour: 6,
    utcCloseMinute: 0,
    accentColor: 'text-sky-400',
    borderAccent: 'border-sky-500/40',
    badgeBg: 'bg-sky-500/10 text-sky-300',
    barColor: 'from-sky-600 to-cyan-500',
    pairs: ['AUD/USD', 'NZD/USD', 'AUD/JPY'],
  },
  {
    id: 'tokyo',
    name: 'Tokyo Session',
    flag: '🇯🇵',
    financialCenter: 'TSE • Tokyo',
    country: 'Japan',
    timeZone: 'Asia/Tokyo',
    utcOpenHour: 0,
    utcOpenMinute: 0,
    utcCloseHour: 9,
    utcCloseMinute: 0,
    accentColor: 'text-amber-400',
    borderAccent: 'border-amber-500/40',
    badgeBg: 'bg-amber-500/10 text-amber-300',
    barColor: 'from-amber-600 to-orange-500',
    pairs: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
  },
  {
    id: 'london',
    name: 'London Session',
    flag: '🇬🇧',
    financialCenter: 'LSE • London',
    country: 'United Kingdom',
    timeZone: 'Europe/London',
    utcOpenHour: 8,
    utcOpenMinute: 0,
    utcCloseHour: 16,
    utcCloseMinute: 30,
    accentColor: 'text-purple-400',
    borderAccent: 'border-purple-500/40',
    badgeBg: 'bg-purple-500/10 text-purple-300',
    barColor: 'from-purple-600 to-indigo-500',
    pairs: ['EUR/USD', 'GBP/USD', 'XAU/USD'],
  },
  {
    id: 'newyork',
    name: 'New York Session',
    flag: '🇺🇸',
    financialCenter: 'NYSE/CME • New York',
    country: 'United States',
    timeZone: 'America/New_York',
    utcOpenHour: 13,
    utcOpenMinute: 0,
    utcCloseHour: 21,
    utcCloseMinute: 0,
    accentColor: 'text-emerald-400',
    borderAccent: 'border-emerald-500/40',
    badgeBg: 'bg-emerald-500/10 text-emerald-300',
    barColor: 'from-emerald-600 to-teal-500',
    pairs: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'WTI_CRUDE'],
  },
];

interface OverlapConfig {
  id: string;
  name: string;
  shortName: string;
  sessions: string[];
  utcStartHour: number;
  utcStartMinute: number;
  utcEndHour: number;
  utcEndMinute: number;
  importance: 'PEAK' | 'HIGH' | 'MODERATE';
  description: string;
  accentBg: string;
  accentBorder: string;
  accentText: string;
}

const OVERLAPS: OverlapConfig[] = [
  {
    id: 'london-ny',
    name: 'London / New York Overlap',
    shortName: 'London + NY',
    sessions: ['london', 'newyork'],
    utcStartHour: 13,
    utcStartMinute: 0,
    utcEndHour: 16,
    utcEndMinute: 30,
    importance: 'PEAK',
    description: 'Golden Liquidity Window • Over 70% of global daily volume transacted',
    accentBg: 'bg-emerald-500/15',
    accentBorder: 'border-emerald-500/50',
    accentText: 'text-emerald-300',
  },
  {
    id: 'sydney-tokyo',
    name: 'Sydney / Tokyo Overlap',
    shortName: 'Sydney + Tokyo',
    sessions: ['sydney', 'tokyo'],
    utcStartHour: 0,
    utcStartMinute: 0,
    utcEndHour: 6,
    utcEndMinute: 0,
    importance: 'HIGH',
    description: 'Asian Regional Liquidity Corridor • APAC momentum and yield spreads',
    accentBg: 'bg-sky-500/15',
    accentBorder: 'border-sky-500/50',
    accentText: 'text-sky-300',
  },
  {
    id: 'tokyo-london',
    name: 'Tokyo / London Overlap',
    shortName: 'Tokyo + London',
    sessions: ['tokyo', 'london'],
    utcStartHour: 8,
    utcStartMinute: 0,
    utcEndHour: 9,
    utcEndMinute: 0,
    importance: 'HIGH',
    description: 'European Open Handover • High-velocity breakout volatility',
    accentBg: 'bg-purple-500/15',
    accentBorder: 'border-purple-500/50',
    accentText: 'text-purple-300',
  },
];

export const DynamicTradingSessionTimeline: React.FC<DynamicTradingSessionTimelineProps> = ({
  currentPair = 'XAU/USD',
  theme = 'dark',
}) => {
  const [now, setNow] = useState<Date>(() => new Date());
  const [mounted, setMounted] = useState<boolean>(false);
  const [showTimelineBar, setShowTimelineBar] = useState<boolean>(true);

  // High-fidelity 1-second pulse for clock & timers
  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isLight = theme === 'light';

  // UTC and local time metrics
  const utcHours = now.getUTCHours();
  const utcMinutes = now.getUTCMinutes();
  const utcSeconds = now.getUTCSeconds();
  const utcDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
  const currentUtcMinutes = utcHours * 60 + utcMinutes;
  const currentUtcFraction = (currentUtcMinutes + utcSeconds / 60) / 1440; // 0 to 1 across 24h

  // Format digital countdown string: "04h 12m 38s"
  const formatCountdown = (totalSeconds: number) => {
    if (totalSeconds <= 0) return '00h 00m 00s';
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`;
  };

  // Weekend determination (FX/Metals close Friday 22:00 UTC to Sunday 21:00 UTC)
  const isWeekend = 
    (utcDay === 5 && currentUtcMinutes >= 22 * 60) || 
    (utcDay === 6) || 
    (utcDay === 0 && currentUtcMinutes < 21 * 60);

  // Evaluate each market session status
  const sessionStatuses = useMemo(() => {
    return SESSIONS.map((sess) => {
      const openMinutes = sess.utcOpenHour * 60 + sess.utcOpenMinute;
      const closeMinutes = sess.utcCloseHour * 60 + sess.utcCloseMinute;
      const wrapsMidnight = closeMinutes <= openMinutes; // e.g. Sydney 21:00 to 06:00

      let isOpen = false;
      let secondsUntilClose = 0;
      let secondsUntilOpen = 0;
      let progressPercent = 0;

      if (!isWeekend) {
        if (wrapsMidnight) {
          isOpen = currentUtcMinutes >= openMinutes || currentUtcMinutes < closeMinutes;
          if (isOpen) {
            const totalDurationMinutes = (1440 - openMinutes) + closeMinutes;
            const elapsedMinutes = currentUtcMinutes >= openMinutes 
              ? currentUtcMinutes - openMinutes 
              : (1440 - openMinutes) + currentUtcMinutes;
            progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalDurationMinutes) * 100)));

            const remainingMinutes = currentUtcMinutes >= openMinutes
              ? (1440 - currentUtcMinutes) + closeMinutes
              : closeMinutes - currentUtcMinutes;
            secondsUntilClose = Math.max(0, remainingMinutes * 60 - utcSeconds);
          } else {
            const minutesUntilOpen = openMinutes - currentUtcMinutes;
            secondsUntilOpen = Math.max(0, minutesUntilOpen * 60 - utcSeconds);
          }
        } else {
          isOpen = currentUtcMinutes >= openMinutes && currentUtcMinutes < closeMinutes;
          if (isOpen) {
            const totalDurationMinutes = closeMinutes - openMinutes;
            const elapsedMinutes = currentUtcMinutes - openMinutes;
            progressPercent = Math.min(100, Math.max(0, Math.round((elapsedMinutes / totalDurationMinutes) * 100)));

            const remainingMinutes = closeMinutes - currentUtcMinutes;
            secondsUntilClose = Math.max(0, remainingMinutes * 60 - utcSeconds);
          } else {
            const minutesUntilOpen = currentUtcMinutes < openMinutes
              ? openMinutes - currentUtcMinutes
              : (1440 - currentUtcMinutes) + openMinutes;
            secondsUntilOpen = Math.max(0, minutesUntilOpen * 60 - utcSeconds);
          }
        }
      } else {
        // Weekend close countdown to each session's actual opening
        let daysUntilNextSessionOpen = 0;
        let openTimeMinutes = openMinutes;
        
        if (sess.id === 'sydney') {
          // Sydney opens Sunday 21:00 UTC
          daysUntilNextSessionOpen = (7 - utcDay) % 7;
          openTimeMinutes = 21 * 60;
        } else {
          // Tokyo, London, New York open Monday at their respective open times
          daysUntilNextSessionOpen = (8 - utcDay) % 7 || 7;
          openTimeMinutes = openMinutes;
        }
        
        const minutesUntilSessionOpen = (daysUntilNextSessionOpen * 1440) + (openTimeMinutes - currentUtcMinutes);
        secondsUntilOpen = Math.max(0, minutesUntilSessionOpen * 60 - utcSeconds);
      }

      // Local city time string
      let localCityTime = '';
      try {
        localCityTime = new Intl.DateTimeFormat('en-US', {
          timeZone: sess.timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
      } catch {
        localCityTime = `${String(sess.utcOpenHour).padStart(2, '0')}:00`;
      }

      const isClosingSoon = isOpen && secondsUntilClose <= 3600;

      return {
        ...sess,
        isOpen,
        isClosingSoon,
        secondsUntilClose,
        secondsUntilOpen,
        progressPercent,
        localCityTime,
      };
    });
  }, [currentUtcMinutes, utcSeconds, utcDay, isWeekend, now]);

  // Evaluate overlapping sessions
  const overlapStatuses = useMemo(() => {
    return OVERLAPS.map((overlap) => {
      const startMin = overlap.utcStartHour * 60 + overlap.utcStartMinute;
      const endMin = overlap.utcEndHour * 60 + overlap.utcEndMinute;

      const isActive = !isWeekend && currentUtcMinutes >= startMin && currentUtcMinutes < endMin;
      let secondsUntilEnd = 0;
      let secondsUntilStart = 0;

      if (isActive) {
        const remainingMin = endMin - currentUtcMinutes;
        secondsUntilEnd = Math.max(0, remainingMin * 60 - utcSeconds);
      } else if (!isWeekend) {
        const minUntilStart = currentUtcMinutes < startMin
          ? startMin - currentUtcMinutes
          : (1440 - currentUtcMinutes) + startMin;
        secondsUntilStart = Math.max(0, minUntilStart * 60 - utcSeconds);
      } else {
        // On weekend, next overlap occurs on Monday
        const daysUntilMonday = (8 - utcDay) % 7 || 7;
        const minUntilStart = (daysUntilMonday * 1440) + startMin - currentUtcMinutes;
        secondsUntilStart = Math.max(0, minUntilStart * 60 - utcSeconds);
      }

      return {
        ...overlap,
        isActive,
        secondsUntilEnd,
        secondsUntilStart,
      };
    });
  }, [currentUtcMinutes, utcSeconds, isWeekend]);

  // Find currently active overlap
  const activeOverlap = overlapStatuses.find((o) => o.isActive);
  const nextOverlap = !activeOverlap 
    ? [...overlapStatuses].sort((a, b) => a.secondsUntilStart - b.secondsUntilStart)[0] 
    : null;

  // Active open sessions count
  const activeOpenCount = sessionStatuses.filter((s) => s.isOpen).length;

  // Formatted master clocks
  const utcClockString = `${String(utcHours).padStart(2, '0')}:${String(utcMinutes).padStart(2, '0')}:${String(utcSeconds).padStart(2, '0')} UTC`;
  const localClockString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  const localTimeZoneName = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return (
    <div 
      suppressHydrationWarning
      className={`rounded-xl border transition-all duration-300 shadow-xl overflow-hidden ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800 shadow-slate-200/60' 
        : 'bg-terminal-950 border-terminal-border text-white shadow-2xl'
    }`}>
      {/* 1. Header Command Ribbon: Master Clocks & Overlap Telemetry */}
      <div className={`p-3 sm:p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/90 border-terminal-border/60'
      }`}>
        {/* Left: Master Clock & Market Liquidity Stance */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs sm:text-sm font-bold tracking-wide font-mono ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}>
                GLOBAL TRADING SESSION CLOCK & OVERLAPPING TIMELINE
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
                isWeekend
                  ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  : activeOpenCount >= 2
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 animate-pulse'
                  : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  isWeekend ? 'bg-rose-400' : 'bg-emerald-400 animate-ping'
                }`} />
                {isWeekend 
                  ? 'WEEKEND FREEZE' 
                  : activeOpenCount >= 2 
                  ? `${activeOpenCount} SESSIONS OVERLAPPING` 
                  : `${activeOpenCount} SESSION ACTIVE`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-slate-400 mt-0.5 flex-wrap">
              <span className="text-cyan-400 font-bold" suppressHydrationWarning>{utcClockString}</span>
              <span>•</span>
              <span className={isLight ? 'text-slate-700' : 'text-slate-300'}>
                Local: <strong className={isLight ? 'text-slate-900' : 'text-white'} suppressHydrationWarning>{mounted ? localClockString : '--:--:--'}</strong> <span suppressHydrationWarning>({mounted ? localTimeZoneName : 'UTC'})</span>
              </span>
              <span>•</span>
              <span className="text-indigo-400 font-semibold">Active Pair: {currentPair}</span>
            </div>
          </div>
        </div>

        {/* Right: Overlap Telemetry & Timeline Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {activeOverlap ? (
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-xs shadow-sm ${
              activeOverlap.accentBg
            } ${activeOverlap.accentBorder}`}>
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-white block text-[11px] leading-tight">
                  ACTIVE NOW: {activeOverlap.name.toUpperCase()}
                </span>
                <span className="text-[10px] text-emerald-300 block" suppressHydrationWarning>
                  Closes in: <strong className="text-white" suppressHydrationWarning>{mounted ? formatCountdown(activeOverlap.secondsUntilEnd) : '--:--:--'}</strong>
                </span>
              </div>
            </div>
          ) : nextOverlap ? (
            <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 font-mono text-xs ${
              isLight ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
            }`}>
              <Compass className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="font-semibold block text-[11px] leading-tight">
                  NEXT OVERLAP: {nextOverlap.name}
                </span>
                <span className="text-[10px] text-cyan-400 block" suppressHydrationWarning>
                  Opens in: <strong suppressHydrationWarning>{mounted ? formatCountdown(nextOverlap.secondsUntilStart) : '--:--:--'}</strong>
                </span>
              </div>
            </div>
          ) : null}

          <button
            onClick={() => setShowTimelineBar(!showTimelineBar)}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
              isLight 
                ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300' 
                : 'bg-terminal-900 hover:bg-terminal-800 text-slate-300 border-terminal-border'
            }`}
            title="Toggle 24-Hour Visual Timeline View"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">{showTimelineBar ? 'Hide 24h Bar' : 'Show 24h Bar'}</span>
            {showTimelineBar ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Overlapping Sessions Ribbon (Explicit High-Visibility Strip) */}
      <div className={`p-2.5 sm:p-3 border-b flex flex-wrap items-center justify-between gap-2.5 text-xs font-mono ${
        isLight ? 'bg-slate-100/70 border-slate-200' : 'bg-terminal-900/60 border-terminal-border/50'
      }`}>
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-bold text-[11px] uppercase tracking-wider text-slate-400">
            Overlapping Liquidity Windows (Global Multi-Dealer Confluence):
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 w-full lg:w-auto flex-1 lg:max-w-4xl">
          {overlapStatuses.map((ov) => {
            return (
              <div 
                key={ov.id}
                className={`p-2 rounded-lg border transition-all ${
                  ov.isActive
                    ? `${ov.accentBg} ${ov.accentBorder} shadow-sm shadow-emerald-500/10`
                    : isLight
                    ? 'bg-white border-slate-200 text-slate-600'
                    : 'bg-terminal-950/80 border-terminal-border/40 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`font-bold text-[11px] ${
                    ov.isActive ? 'text-white' : isLight ? 'text-slate-800' : 'text-slate-300'
                  }`}>
                    {ov.shortName}
                  </span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                    ov.isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                      : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {ov.isActive ? 'ACTIVE' : 'IDLE'}
                  </span>
                </div>

                <div className="flex items-center justify-between text-[10px]">
                  <span className="opacity-80">
                    {String(ov.utcStartHour).padStart(2, '0')}:{String(ov.utcStartMinute).padStart(2, '0')} - {String(ov.utcEndHour).padStart(2, '0')}:{String(ov.utcEndMinute).padStart(2, '0')} UTC
                  </span>
                  <span className={`font-bold font-mono ${ov.isActive ? 'text-emerald-400' : 'text-cyan-400'}`} suppressHydrationWarning>
                    {mounted 
                      ? (ov.isActive ? formatCountdown(ov.secondsUntilEnd) : `in ${formatCountdown(ov.secondsUntilStart)}`)
                      : '--:--:--'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Four Major Global Markets Grid (London, New York, Tokyo, Sydney) */}
      <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {sessionStatuses.map((sess) => {
          const isSydney = sess.id === 'sydney';
          const isTokyo = sess.id === 'tokyo';
          const isLondon = sess.id === 'london';
          const isNewYork = sess.id === 'newyork';

          return (
            <div
              key={sess.id}
              className={`rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between relative overflow-hidden ${
                sess.isOpen
                  ? sess.isClosingSoon
                    ? isLight
                      ? 'bg-amber-50/60 border-amber-300 shadow-sm'
                      : 'bg-amber-950/20 border-amber-500/50 shadow-md shadow-amber-950/20'
                    : isLight
                    ? 'bg-white border-slate-300 shadow-md hover:border-cyan-400'
                    : 'bg-terminal-900 border-terminal-border hover:border-cyan-500/40 shadow-lg'
                  : isLight
                  ? 'bg-slate-100/80 border-slate-200 text-slate-500 opacity-90'
                  : 'bg-terminal-950/80 border-terminal-border/60 text-slate-400 opacity-85'
              }`}
            >
              {/* Subtle top indicator glow if open */}
              {sess.isOpen && (
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${sess.barColor}`} />
              )}

              <div>
                {/* Session Card Header: Flag + Name + Live Badge */}
                <div className="flex items-center justify-between border-b pb-2 mb-2.5 border-current/10">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl shrink-0">{sess.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold text-xs sm:text-sm truncate ${
                          isLight ? 'text-slate-900' : 'text-white'
                        }`}>
                          {sess.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {sess.financialCenter}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border shrink-0 ${
                    sess.isOpen
                      ? sess.isClosingSoon
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 flex items-center gap-1'
                      : isLight
                      ? 'bg-slate-200 text-slate-600 border-slate-300'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {sess.isOpen ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block mr-1" />
                        {sess.isClosingSoon ? 'CLOSING SOON' : 'ACTIVE OPEN'}
                      </>
                    ) : (
                      'CLOSED'
                    )}
                  </span>
                </div>

                {/* Local Financial Center Clock */}
                <div className={`p-2 rounded-lg mb-2.5 border flex items-center justify-between text-xs font-mono ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-950 border-terminal-border/60'
                }`}>
                  <span className="text-slate-400 text-[10px] flex items-center gap-1">
                    {sess.isOpen ? <Sun className="w-3 h-3 text-amber-400" /> : <Moon className="w-3 h-3 text-slate-400" />}
                    Local Time:
                  </span>
                  <span className={`font-bold text-xs ${isLight ? 'text-slate-800' : 'text-slate-200'}`} suppressHydrationWarning>
                    {mounted ? sess.localCityTime : '--:--'}
                  </span>
                </div>

                {/* Operating Window & Active Countdown Timer */}
                <div className="space-y-1.5 text-xs font-mono">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">UTC Window:</span>
                    <span className={isLight ? 'text-slate-700 font-semibold' : 'text-slate-300 font-semibold'}>
                      {String(sess.utcOpenHour).padStart(2, '0')}:{String(sess.utcOpenMinute).padStart(2, '0')} - {String(sess.utcCloseHour).padStart(2, '0')}:{String(sess.utcCloseMinute).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Active Dynamic Countdown Timer */}
                  <div className={`p-2 rounded-lg border flex items-center justify-between ${
                    sess.isOpen
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : isLight
                      ? 'bg-slate-100 border-slate-200 text-slate-700'
                      : 'bg-terminal-950/60 border-terminal-border/50 text-slate-300'
                  }`}>
                    <span className="text-[10px] text-slate-400 uppercase">
                      {sess.isOpen ? 'Closes In:' : 'Opens In:'}
                    </span>
                    <span className="font-bold text-xs font-mono text-cyan-400" suppressHydrationWarning>
                      {mounted 
                        ? (sess.isOpen ? formatCountdown(sess.secondsUntilClose) : formatCountdown(sess.secondsUntilOpen))
                        : '--:--:--'}
                    </span>
                  </div>

                  {/* Session Progress Bar (When Open) */}
                  {sess.isOpen && (
                    <div className="pt-1">
                      <div className="flex items-center justify-between text-[9px] text-slate-400 mb-0.5">
                        <span>Elapsed Progress</span>
                        <span>{sess.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${sess.progressPercent}%` }}
                          className={`h-full bg-gradient-to-r ${sess.barColor} transition-all duration-1000`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Influenced Instruments Footer Tag */}
              <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Key Pairs:</span>
                <span className="font-bold text-slate-300">
                  {sess.pairs.slice(0, 2).join(' • ')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Dynamic 24-Hour Visual Timeline Bar */}
      {showTimelineBar && (
        <div className={`px-3 sm:px-4 pb-3 sm:pb-4 border-t pt-3 font-mono text-xs ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/40 border-terminal-border/50'
        }`}>
          <div className="flex items-center justify-between mb-2 text-[10px] text-slate-400">
            <span className="flex items-center gap-1 font-bold uppercase tracking-wider text-slate-400">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              24-Hour Global Timeline (00:00 to 24:00 UTC) with Real-Time Marker
            </span>
            <span className="text-cyan-400 font-bold">
              Current UTC: {String(utcHours).padStart(2, '0')}:{String(utcMinutes).padStart(2, '0')}
            </span>
          </div>

          {/* Visual Timeline Track with Session Spans */}
          <div className="relative w-full h-8 bg-slate-900 rounded-lg overflow-hidden border border-terminal-border flex items-center">
            {/* Hour Grid Markers */}
            <div className="absolute inset-0 flex justify-between px-1 pointer-events-none opacity-20">
              {[0, 3, 6, 9, 12, 15, 18, 21, 24].map((h) => (
                <div key={h} className="h-full border-r border-slate-400 flex flex-col justify-end pb-0.5">
                  <span className="text-[8px] text-white pl-0.5">{String(h).padStart(2, '0')}</span>
                </div>
              ))}
            </div>

            {/* Tokyo Span: 00:00 to 09:00 UTC (0% to 37.5%) */}
            <div 
              style={{ left: '0%', width: '37.5%' }}
              className="absolute h-5 rounded bg-amber-500/25 border border-amber-500/50 flex items-center justify-center text-[9px] font-bold text-amber-200"
              title="Tokyo Session: 00:00 - 09:00 UTC"
            >
              🇯🇵 Tokyo (00:00 - 09:00)
            </div>

            {/* Sydney Span: 21:00 to 06:00 UTC (wraps: 87.5% to 100% and 0% to 25%) */}
            <div 
              style={{ left: '87.5%', width: '12.5%' }}
              className="absolute h-4 rounded-l bg-sky-500/25 border-y border-l border-sky-500/50 flex items-center justify-center text-[8px] font-bold text-sky-200"
              title="Sydney Open: 21:00 - 24:00 UTC"
            >
              🇦🇺 Syd
            </div>
            <div 
              style={{ left: '0%', width: '25%' }}
              className="absolute h-3 rounded-r bg-sky-500/20 border-y border-r border-sky-500/40 flex items-center justify-center text-[8px] font-bold text-sky-300 pointer-events-none"
              title="Sydney Close: 00:00 - 06:00 UTC"
            />

            {/* London Span: 08:00 to 16:30 UTC (33.3% to 68.75%) */}
            <div 
              style={{ left: '33.33%', width: '35.42%' }}
              className="absolute h-5 rounded bg-purple-500/30 border border-purple-500/60 flex items-center justify-center text-[9px] font-bold text-purple-200"
              title="London Session: 08:00 - 16:30 UTC"
            >
              🇬🇧 London (08:00 - 16:30)
            </div>

            {/* New York Span: 13:00 to 21:00 UTC (54.16% to 87.5%) */}
            <div 
              style={{ left: '54.16%', width: '33.34%' }}
              className="absolute h-5 rounded bg-emerald-500/30 border border-emerald-500/60 flex items-center justify-center text-[9px] font-bold text-emerald-200"
              title="New York Session: 13:00 - 21:00 UTC"
            >
              🇺🇸 New York (13:00 - 21:00)
            </div>

            {/* Golden Overlap Highlight: 13:00 to 16:30 UTC (54.16% to 68.75%) */}
            <div 
              style={{ left: '54.16%', width: '14.58%' }}
              className="absolute h-6 rounded bg-gradient-to-r from-emerald-500/60 to-purple-500/60 border-2 border-emerald-400 flex items-center justify-center text-[8px] font-extrabold text-white animate-pulse shadow-lg z-10"
              title="London / New York Golden Overlap: 13:00 - 16:30 UTC"
            >
              ⚡ PEAK OVERLAP
            </div>

            {/* Current Real-Time Live Cursor */}
            <div 
              style={{ left: `${(currentUtcFraction * 100).toFixed(2)}%` }}
              className="absolute top-0 bottom-0 w-0.5 bg-rose-500 shadow-md shadow-rose-500 z-20 flex flex-col items-center pointer-events-none"
            >
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white -translate-y-1 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-rose-600 border border-white -translate-y-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-1.5 px-0.5 flex-wrap gap-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400 inline-block" /> Sydney (21:00-06:00)
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block ml-1" /> Tokyo (00:00-09:00)
              <span className="w-2 h-2 rounded-full bg-purple-400 inline-block ml-1" /> London (08:00-16:30)
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block ml-1" /> New York (13:00-21:00)
            </span>
            <span className="text-rose-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Live Cursor: {(currentUtcFraction * 100).toFixed(1)}% of 24h Day
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
