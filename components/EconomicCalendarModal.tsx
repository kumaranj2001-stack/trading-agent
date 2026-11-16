'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MacroIndicator, MacroHistoricalEvent, HistoricalMacroBaselineMetrics } from '@/lib/types';
import { 
  Calendar, X, RefreshCw, Filter, Search, Sparkles, ArrowLeft, Clock, 
  Database, ShieldCheck, Activity, ChevronDown, ChevronUp, Lock, Radio, Zap,
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle2
} from 'lucide-react';
import { macroHistoricalArchive } from '@/lib/macroHistoricalArchive';

interface EconomicCalendarModalProps {
  isOpen?: boolean;
  onClose: () => void;
  calendar?: MacroIndicator[];
  isFullPage?: boolean;
}

/**
 * Format remaining seconds into a clear countdown string (e.g. "T-02m 45s", "T-1h 15m")
 */
function formatCountdown(sec: number): string {
  if (sec <= 0) return '0s';
  const hours = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const s = Math.floor(sec % 60);
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  if (mins > 0) {
    return `${mins}m ${s < 10 ? '0' : ''}${s}s`;
  }
  return `${s}s`;
}

/**
 * Helper to parse exact event timestamps and format in Indian Standard Time (IST, UTC+5:30)
 * in 12-hour format with am/pm (e.g. "07:00 PM IST", "10:00 AM IST").
 */
function parseAndFormatIST(event: MacroIndicator): {
  dateOnly: string;
  timeOnlyIST: string;
  concatenatedDateTime: string;
} {
  // If backend provided pre-computed exact timeIST
  if (event.timeIST && event.date) {
    return {
      dateOnly: event.date,
      timeOnlyIST: event.timeIST,
      concatenatedDateTime: event.dateTimeIST || `${event.date} • ${event.timeIST}`,
    };
  }

  // Parse from ISO timestamp or date
  try {
    const d = event.timestamp ? new Date(event.timestamp) : new Date(event.date);
    const timeFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(d);
    const timeOnlyIST = `${timeFormatted} IST`;

    const dateFormatted = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);

    return {
      dateOnly: event.date || dateFormatted,
      timeOnlyIST,
      concatenatedDateTime: `${dateFormatted} • ${timeOnlyIST}`,
    };
  } catch {
    return {
      dateOnly: event.date || '—',
      timeOnlyIST: event.timeIST || '—',
      concatenatedDateTime: event.date || '—',
    };
  }
}

export const EconomicCalendarModal: React.FC<EconomicCalendarModalProps> = ({
  isOpen = true,
  onClose,
  calendar: initialCalendar = [],
  isFullPage = false,
}) => {
  const [events, setEvents] = useState<MacroIndicator[]>(initialCalendar);
  const [currencyFilter, setCurrencyFilter] = useState<string>('ALL');
  const [impactFilter, setImpactFilter] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<'TODAY' | 'WEEK' | 'ALL'>('TODAY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [highImpactCount, setHighImpactCount] = useState<number>(0);
  const [activeReleaseCount, setActiveReleaseCount] = useState<number>(0);
  const [serverTimeIST, setServerTimeIST] = useState<string>('');
  const [isStreamConnected, setIsStreamConnected] = useState<boolean>(false);
  const [lastStreamTick, setLastStreamTick] = useState<number>(Date.now());
  const [dualTelemetry, setDualTelemetry] = useState<{
    pipelineAPrimaryCount: number;
    pipelineBForexFactoryCount: number;
    totalDeduplicatedCount: number;
    fastestSource: string;
    lastScrapeTimestamp: number;
    activeReleaseWindowEventsCount: number;
  } | null>(null);

  // Decoupled 30-Day Historical Archive & Baseline Volatility Metrics
  const [showDecoupledHistoricalAudit, setShowDecoupledHistoricalAudit] = useState<boolean>(false);
  const [historicalAuditStats, setHistoricalAuditStats] = useState(() => macroHistoricalArchive.getArchiveAuditSummary());
  const [historicalEvents, setHistoricalEvents] = useState<MacroHistoricalEvent[]>(() => macroHistoricalArchive.getHistoricalArchive());
  const [baselineMetrics, setBaselineMetrics] = useState<HistoricalMacroBaselineMetrics[]>(() => macroHistoricalArchive.getHistoricalBaselineMetrics());

  const eventSourceRef = useRef<EventSource | null>(null);

  const fetchCalendar = async (force: boolean = false) => {
    setIsLoading(true);
    try {
      const currParam = currencyFilter !== 'ALL' ? `currency=${encodeURIComponent(currencyFilter)}` : '';
      const impParam = impactFilter !== 'ALL' ? `impact=${encodeURIComponent(impactFilter)}` : '';
      const searchParam = searchQuery.trim() ? `search=${encodeURIComponent(searchQuery.trim())}` : '';
      const forceParam = force ? 'forceRefresh=true' : '';
      const queryStr = [currParam, impParam, searchParam, forceParam].filter(Boolean).join('&');

      const res = await fetch(`/api/calendar${queryStr ? `?${queryStr}` : ''}`, {
        method: force ? 'POST' : 'GET'
      });
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data.events || []);
        setHighImpactCount(json.data.highImpactCount || 0);
        setActiveReleaseCount(json.data.activeReleaseCount || 0);
        if (json.data.serverTimeIST) {
          setServerTimeIST(json.data.serverTimeIST);
        }
        if (json.data.telemetry) {
          setDualTelemetry(json.data.telemetry);
        }
        setHistoricalAuditStats(macroHistoricalArchive.getArchiveAuditSummary());
        setHistoricalEvents(macroHistoricalArchive.getHistoricalArchive());
        setBaselineMetrics(macroHistoricalArchive.getHistoricalBaselineMetrics());
      }
    } catch (e) {
      console.error('Failed to fetch from /api/calendar:', e);
      if (initialCalendar.length > 0 && events.length === 0) setEvents(initialCalendar);
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Server-Sent Events (SSE) stream for real-time calendar updates
  useEffect(() => {
    if (!isOpen) return;

    fetchCalendar(false);

    try {
      const sse = new EventSource('/api/calendar/stream');
      eventSourceRef.current = sse;

      sse.onopen = () => {
        setIsStreamConnected(true);
      };

      sse.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload && payload.events) {
            setEvents(payload.events);
            setHighImpactCount(payload.highImpactCount ?? 0);
            setActiveReleaseCount(payload.activeReleaseCount ?? 0);
            if (payload.serverTimeIST) setServerTimeIST(payload.serverTimeIST);
            if (payload.telemetry) setDualTelemetry(payload.telemetry);
            setIsStreamConnected(true);
            setLastStreamTick(Date.now());
          }
        } catch (err) {
          console.error('SSE Message JSON parse error:', err);
        }
      };

      sse.onerror = () => {
        setIsStreamConnected(false);
      };
    } catch (e) {
      console.warn('EventSource initialization error:', e);
      setIsStreamConnected(false);
    }

    // Secondary fallback polling if SSE is disconnected
    const pollInterval = setInterval(() => {
      if (!isStreamConnected) {
        fetchCalendar(false);
      }
    }, 15000);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
      clearInterval(pollInterval);
    };
  }, [isOpen]);

  // Re-fetch on filter change if not streaming
  useEffect(() => {
    if (isOpen && !isStreamConnected) {
      fetchCalendar(false);
    }
  }, [currencyFilter, impactFilter, searchQuery, dateFilter]);

  if (!isOpen && !isFullPage) return null;

  // Filter events by currency, impact, search, and date
  const filteredEvents = events.filter((event) => {
    // 1. Currency
    if (currencyFilter !== 'ALL' && event.region !== currencyFilter) {
      return false;
    }
    // 2. Impact
    if (impactFilter !== 'ALL' && event.impact !== impactFilter) {
      return false;
    }
    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (event.name || '').toLowerCase().includes(q);
      const matchRegion = (event.region || '').toLowerCase().includes(q);
      if (!matchName && !matchRegion) return false;
    }
    // 4. Date filter
    if (dateFilter === 'TODAY') {
      const isToday = (event.date || '').includes('2026-11-16') || (event.date || '').includes('Nov 16');
      if (!isToday) return false;
    } else if (dateFilter === 'WEEK') {
      const weekDates = ['2026-11-16', '2026-11-17', '2026-11-18', '2026-11-19', '2026-11-20', '2026-11-21', '2026-11-22'];
      const inWeek = weekDates.some(d => (event.date || '').includes(d) || (event.date || '').includes('Nov 16') || (event.date || '').includes('Nov 17') || (event.date || '').includes('Nov 18') || (event.date || '').includes('Nov 19') || (event.date || '').includes('Nov 20'));
      if (!inWeek) return false;
    }
    return true;
  });

  const todayEventsCount = events.filter(e => (e.date || '').includes('2026-11-16') || (e.date || '').includes('Nov 16')).length;
  const weekEventsCount = events.filter(e => {
    const d = e.date || '';
    return d.includes('2026-11-16') || d.includes('2026-11-17') || d.includes('2026-11-18') || d.includes('2026-11-19') || d.includes('2026-11-20');
  }).length;

  const content = (
    <div className={`bg-terminal-900 border border-terminal-border rounded-xl w-full ${isFullPage ? 'shadow-xl' : 'max-w-6xl max-h-[90vh] shadow-2xl'} flex flex-col overflow-hidden`}>
      {/* Modal / Page Header */}
      <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                12 // INSTITUTIONAL MACROECONOMIC CALENDAR & FOREX FACTORY DUAL FEED
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                <Clock className="w-3 h-3 text-purple-400" />
                IST TIMEZONE (12H AM/PM)
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                isStreamConnected 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <Radio className={`w-3 h-3 ${isStreamConnected ? 'animate-pulse text-emerald-400' : 'text-amber-400'}`} />
                {isStreamConnected ? 'REAL-TIME SSE DUAL STREAM' : 'AUTO-POLLING SYNC'}
              </span>
              {activeReleaseCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/50 font-bold animate-pulse">
                  <Zap className="w-3 h-3 text-rose-400" />
                  {activeReleaseCount} ACTIVE WINDOWS (1S SCRAPE)
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              Dual-Pipeline: Forex Factory + Macro Wire ({filteredEvents.length} Shown • {highImpactCount} High Impact)
              {serverTimeIST && <span className="text-purple-300 ml-2">• Current: {serverTimeIST}</span>}
              {dualTelemetry && (
                <span className="text-slate-500 ml-2 hidden lg:inline">
                  (FF: {dualTelemetry.pipelineBForexFactoryCount} • Wire: {dualTelemetry.pipelineAPrimaryCount} • Fastest: {dualTelemetry.fastestSource})
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowDecoupledHistoricalAudit(prev => !prev)}
            className={`p-1.5 sm:px-2.5 sm:py-1 rounded font-mono text-xs flex items-center gap-1.5 border transition-all ${
              showDecoupledHistoricalAudit
                ? 'bg-purple-900/60 border-purple-500 text-purple-200'
                : 'bg-terminal-800 hover:bg-terminal-700 text-slate-300 border-terminal-border'
            }`}
            title="Toggle Decoupled 30-Day Historical Economic Events Backup (Auto-purged >30d)"
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">30D Historical Backup ({historicalAuditStats.totalStoredEvents})</span>
            <span className="sm:hidden">30D</span>
            {showDecoupledHistoricalAudit ? <ChevronUp className="w-3 h-3 text-purple-400" /> : <ChevronDown className="w-3 h-3 text-purple-400" />}
          </button>

          <button
            onClick={() => fetchCalendar(true)}
            disabled={isLoading}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs flex items-center gap-1 transition-colors border border-terminal-border"
            title="Force immediate scrape and dual-pipeline refresh"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-purple-400' : ''}`} />
            <span className="hidden sm:inline">Force Scrape</span>
          </button>
          {isFullPage ? (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors flex items-center gap-1.5 font-semibold"
              title="Return to Terminal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>RETURN TO TERMINAL</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors shrink-0"
              aria-label="Close modal"
            >
              <span className="hidden sm:inline">Close</span>
              <X className="w-4 h-4 sm:hidden" />
            </button>
          )}
        </div>
      </div>

      {/* Date Horizon Bar */}
      <div className="px-3 py-2 bg-terminal-950/90 border-b border-terminal-border/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1 mr-1">
            <Calendar className="w-3 h-3 text-purple-400" />
            HORIZON:
          </span>
          <button
            onClick={() => setDateFilter('TODAY')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 border ${
              dateFilter === 'TODAY'
                ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                : 'bg-terminal-900 text-slate-400 hover:text-white border-terminal-border'
            }`}
          >
            <span>TODAY (NOV 16)</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${dateFilter === 'TODAY' ? 'bg-purple-800 text-white' : 'bg-terminal-800 text-slate-400'}`}>
              {todayEventsCount}
            </span>
          </button>

          <button
            onClick={() => setDateFilter('WEEK')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 border ${
              dateFilter === 'WEEK'
                ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                : 'bg-terminal-900 text-slate-400 hover:text-white border-terminal-border'
            }`}
          >
            <span>THIS WEEK (NOV 16-22)</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${dateFilter === 'WEEK' ? 'bg-purple-800 text-white' : 'bg-terminal-800 text-slate-400'}`}>
              {weekEventsCount}
            </span>
          </button>

          <button
            onClick={() => setDateFilter('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1.5 border ${
              dateFilter === 'ALL'
                ? 'bg-purple-600 border-purple-400 text-white shadow-sm'
                : 'bg-terminal-900 text-slate-400 hover:text-white border-terminal-border'
            }`}
          >
            <span>ALL DATES</span>
            <span className={`px-1.5 py-0.2 rounded text-[10px] ${dateFilter === 'ALL' ? 'bg-purple-800 text-white' : 'bg-terminal-800 text-slate-400'}`}>
              {events.length}
            </span>
          </button>
        </div>

        {/* Dual-Pipeline Telemetry Pill */}
        <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 bg-terminal-900 px-2.5 py-1 rounded-lg border border-terminal-border">
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Forex Factory API
          </span>
          <span>+</span>
          <span className="flex items-center gap-1 text-purple-300 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
            Macro Primary Wire
          </span>
          <span>•</span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Deterministic Deduplication
          </span>
        </div>
      </div>

      {/* Filter Bar (Currencies & Impact) */}
      <div className="p-2 sm:p-3 bg-terminal-950/60 border-b border-terminal-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-terminal-900 p-0.5 rounded-lg border border-terminal-border">
            {(['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'INR', 'XAU', 'WTI', 'AUD', 'CAD'] as const).map(curr => (
              <button
                key={curr}
                onClick={() => setCurrencyFilter(curr)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  currencyFilter === curr 
                    ? 'bg-purple-600 text-white font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-terminal-900 p-0.5 rounded-lg border border-terminal-border">
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(imp => (
              <button
                key={imp}
                onClick={() => setImpactFilter(imp)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  impactFilter === imp 
                    ? imp === 'HIGH' ? 'bg-rose-600 text-white font-bold' : 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {imp}
              </button>
            ))}
          </div>
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search catalyst, bank or country..."
            className="w-full bg-terminal-900 border border-terminal-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>
      </div>

      {/* 🏛️ Decoupled 30-Day Background Historical Archive Drawer */}
      {showDecoupledHistoricalAudit && (
        <div className="bg-terminal-950/95 border-b border-purple-500/30 p-3 sm:p-4 space-y-3 font-mono text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-white uppercase tracking-wider text-xs">
                Decoupled 30-Day Historical Macroeconomic Backup
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Auto-Purge &gt;30d Active
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex items-center gap-3">
              <span>{historicalAuditStats.totalStoredEvents} Total Events (Trailing 30 Days)</span>
              <span>•</span>
              <span className="text-rose-400 font-bold">{historicalAuditStats.highImpactCount} High</span>
              <span className="text-sky-400 font-bold">{historicalAuditStats.mediumImpactCount} Med</span>
              <span className="text-slate-400 font-bold">{historicalAuditStats.lowImpactCount} Low</span>
            </div>
          </div>

          {/* Baseline Volatility Metrics Summary Cards */}
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1.5 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              Historical Baseline Volatility Metrics (Trailing 30-Day Statistical Drift)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {baselineMetrics.slice(0, 4).map((m, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-[11px] truncate max-w-[140px]">{m.eventName}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                      m.riskRegime === 'HIGH_VOLATILITY' ? 'bg-rose-500/20 text-rose-300 border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {m.riskRegime.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Avg Volatility: <strong className="text-cyan-300">±{m.avgVolatilityImpactPips} Pips</strong></span>
                    <span>Max: <strong className="text-rose-300">±{m.maxVolatilityImpactPips} Pips</strong></span>
                  </div>
                  <div className="text-[9px] text-slate-500 truncate">
                    Correlated: {m.primaryCorrelatedAssets.join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Decoupled Historical Events Backup List */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
            <span className="text-[10px] uppercase text-slate-400 font-bold block pt-1">
              Trailing 30-Day Historical Event Records (Completely decoupled from primary trading view)
            </span>
            {historicalEvents.map(h => (
              <div key={h.id} className="p-2 rounded bg-terminal-900/80 border border-terminal-border flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                    h.impact === 'HIGH' ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' : h.impact === 'MEDIUM' ? 'bg-sky-500/20 text-sky-400 border-sky-500/40' : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                  }`}>
                    {h.region} • {h.impact}
                  </span>
                  <span className="font-bold text-slate-200">{h.name}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                  <span>Actual: <strong className="text-white">{h.actual}</strong></span>
                  <span>Fcst: <strong className="text-slate-300">{h.forecast}</strong></span>
                  <span>Prev: <strong className="text-slate-400">{h.previous}</strong></span>
                  <span className="text-purple-300">±{h.volatilityImpactPips} Pips</span>
                  <span className="text-slate-500">{h.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Body with Table */}
      <div className="flex-1 overflow-auto p-2 sm:p-4 space-y-3">
        {/* Risk Governance & Reflection Tracking Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 px-3 rounded-lg bg-terminal-950 border border-purple-500/30 text-[11px] font-mono shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Lock className="w-3.5 h-3.5 text-purple-400" />
              <span>PRE-RELEASE LOCKOUT: ARMED</span>
            </span>
            <span className="text-slate-400 hidden sm:inline">
              (T-15m to T+5m Liquidity Vacuum Mitigation Active across USD/EUR/GBP/JPY/INR)
            </span>
          </div>
          <div className="flex items-center gap-2 text-cyan-300 font-bold">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>4-Phase Reflection Engine: Active (0-45s → 1-5m → 15-45m → 1-4h)</span>
          </div>
        </div>

        <div className="overflow-x-auto border border-terminal-border rounded-lg scrollbar-thin">
          <table className="w-full text-left font-mono text-xs min-w-[720px]">
            <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-[11px] sticky top-0">
              <tr>
                <th className="p-2.5 sm:p-3">Currency & Feed</th>
                <th className="p-2.5 sm:p-3">Economic Catalyst & Countdown</th>
                <th className="p-2.5 sm:p-3">Impact</th>
                <th className="p-2.5 sm:p-3">Actual / Surprise</th>
                <th className="p-2.5 sm:p-3">Forecast</th>
                <th className="p-2.5 sm:p-3">Previous</th>
                
                {/* Desktop View: Separate Date and Dedicated Time Column */}
                <th className="hidden md:table-cell p-2.5 sm:p-3 text-slate-300">Date</th>
                <th className="hidden md:table-cell p-2.5 sm:p-3 text-purple-300">Time (IST)</th>

                {/* Mobile / Smaller Screen View */}
                <th className="md:hidden p-2.5 sm:p-3 text-purple-300">Date & Time (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    <p className="font-bold text-white text-sm">No economic events matching current filters</p>
                    <p className="text-xs text-slate-500 mt-1">Try switching to &quot;ALL DATES&quot; or selecting another currency.</p>
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event, i) => {
                  const { dateOnly, timeOnlyIST } = parseAndFormatIST(event);
                  const isHighImpact = event.impact === 'HIGH';
                  const secUntil = typeof event.secondsUntilRelease === 'number' ? event.secondsUntilRelease : undefined;
                  const isLiveWindow = secUntil !== undefined && secUntil <= 0 && secUntil >= -300;
                  const isUpcomingWindow = secUntil !== undefined && secUntil > 0 && secUntil <= 900;
                  const isReleased = (event.actual && event.actual !== '—') || (secUntil !== undefined && secUntil < -300);

                  const delta = typeof event.deviationDelta === 'number' ? event.deviationDelta : undefined;

                  return (
                    <tr 
                      key={i} 
                      className={`hover:bg-terminal-800/50 transition-colors ${
                        isLiveWindow ? 'bg-rose-950/20' : isUpcomingWindow ? 'bg-amber-950/15' : ''
                      }`}
                    >
                      {/* Currency & Feed Source */}
                      <td className="p-2.5 sm:p-3 align-top">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            isLiveWindow ? 'bg-rose-500 animate-ping' : isHighImpact ? 'bg-purple-400' : 'bg-slate-400'
                          }`} />
                          <span className="text-sm">{event.region}</span>
                        </div>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {event.source === 'FOREX_FACTORY' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              Forex Factory
                            </span>
                          ) : event.source === 'MACRO_FEED' ? (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                              Macro Wire
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              Dual Merged
                            </span>
                          )}
                          {event.fastestSourceUpdated && (
                            <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                              ⚡ {event.fastestSourceUpdated}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Catalyst Title & Dynamic Countdown */}
                      <td className="p-2.5 sm:p-3 text-slate-200 align-top">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-white">{event.name}</span>
                          
                          {/* Pre-Release Lockout Badge */}
                          {isHighImpact && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-950 text-purple-300 border border-purple-700/60">
                              LOCKOUT PROTECTED
                            </span>
                          )}

                          {/* Dynamic Countdown Status Badge */}
                          {isLiveWindow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold bg-rose-600 text-white animate-pulse">
                              <Radio className="w-2.5 h-2.5 animate-spin" />
                              LIVE PRINTING
                            </span>
                          ) : secUntil !== undefined && secUntil > 0 ? (
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border ${
                              secUntil <= 900 
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50' 
                                : 'bg-terminal-800 text-cyan-300 border-terminal-border'
                            }`}>
                              <Clock className="w-2.5 h-2.5" />
                              T-{formatCountdown(secUntil)}
                            </span>
                          ) : isReleased ? (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              RELEASED
                            </span>
                          ) : null}
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-1 flex-wrap">
                          {event.timeUTC && (
                            <span>Release: <strong className="text-slate-300">{event.timeUTC}</strong></span>
                          )}
                          {isHighImpact && (
                            <span className="text-cyan-400 font-medium">
                              • 4-Phase: 0-45s (Impulse) → 1-5m (Disc) → 15-45m (Trend) → 1-4h (Cont)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Impact */}
                      <td className="p-2.5 sm:p-3 align-top">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block ${
                            event.impact === 'HIGH'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              : event.impact === 'MEDIUM'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                          }`}
                        >
                          {event.impact}
                        </span>
                      </td>

                      {/* Actual & Deviation Surprise Delta */}
                      <td className="p-2.5 sm:p-3 align-top">
                        <div className="font-bold text-sm">
                          {event.actual && event.actual !== '—' ? (
                            <span className="text-emerald-400">{event.actual}</span>
                          ) : isLiveWindow ? (
                            <span className="text-amber-400 animate-pulse font-mono">PRINTING...</span>
                          ) : (
                            <span className="text-slate-500 font-mono">—</span>
                          )}
                        </div>
                        {delta !== undefined && event.actual && event.actual !== '—' && (
                          <div className="mt-0.5">
                            {delta > 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                <TrendingUp className="w-2.5 h-2.5" />
                                +{delta > 0 && delta % 1 !== 0 ? delta.toFixed(2) : delta} Beat
                              </span>
                            ) : delta < 0 ? (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                <TrendingDown className="w-2.5 h-2.5" />
                                {delta % 1 !== 0 ? delta.toFixed(2) : delta} Miss
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-slate-700/50 text-slate-300">
                                Inline
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Forecast */}
                      <td className="p-2.5 sm:p-3 text-slate-300 align-top font-mono">
                        {event.forecast || '—'}
                      </td>

                      {/* Previous */}
                      <td className="p-2.5 sm:p-3 text-slate-400 align-top font-mono">
                        {event.previous || '—'}
                      </td>

                      {/* Desktop View: Dedicated Date & Dedicated Time Column */}
                      <td className="hidden md:table-cell p-2.5 sm:p-3 text-slate-300 font-mono whitespace-nowrap align-top">
                        {dateOnly}
                      </td>
                      <td className="hidden md:table-cell p-2.5 sm:p-3 text-purple-300 font-bold font-mono whitespace-nowrap align-top">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-[11px]">
                          <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                          {timeOnlyIST}
                        </span>
                      </td>

                      {/* Mobile / Smaller Screen View */}
                      <td className="md:hidden p-2.5 sm:p-3 text-slate-300 font-mono align-top">
                        <div className="flex flex-col text-[11px] leading-tight space-y-1">
                          <span className="text-white font-medium">{dateOnly}</span>
                          <span className="text-purple-400 font-bold flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5 shrink-0" />
                            {timeOnlyIST}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {content}
    </div>
  );
};
