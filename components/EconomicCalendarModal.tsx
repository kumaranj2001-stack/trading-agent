'use client';

import React, { useState, useEffect } from 'react';
import { MacroIndicator, MacroHistoricalEvent, HistoricalMacroBaselineMetrics } from '@/lib/types';
import { Calendar, X, RefreshCw, Filter, Search, Sparkles, ArrowLeft, Clock, Database, ShieldCheck, Activity, ChevronDown, ChevronUp } from 'lucide-react';
import { macroHistoricalArchive } from '@/lib/macroHistoricalArchive';

interface EconomicCalendarModalProps {
  isOpen?: boolean;
  onClose: () => void;
  calendar?: MacroIndicator[];
  isFullPage?: boolean;
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
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [highImpactCount, setHighImpactCount] = useState<number>(0);
  const [serverTimeIST, setServerTimeIST] = useState<string>('');

  // Decoupled 30-Day Historical Archive & Baseline Volatility Metrics (Separated to eliminate UI clutter)
  const [showDecoupledHistoricalAudit, setShowDecoupledHistoricalAudit] = useState<boolean>(false);
  const [historicalAuditStats, setHistoricalAuditStats] = useState(() => macroHistoricalArchive.getArchiveAuditSummary());
  const [historicalEvents, setHistoricalEvents] = useState<MacroHistoricalEvent[]>(() => macroHistoricalArchive.getHistoricalArchive());
  const [baselineMetrics, setBaselineMetrics] = useState<HistoricalMacroBaselineMetrics[]>(() => macroHistoricalArchive.getHistoricalBaselineMetrics());

  const fetchCalendar = async () => {
    setIsLoading(true);
    try {
      const currParam = currencyFilter !== 'ALL' ? `currency=${encodeURIComponent(currencyFilter)}` : '';
      const impParam = impactFilter !== 'ALL' ? `impact=${encodeURIComponent(impactFilter)}` : '';
      const searchParam = searchQuery.trim() ? `search=${encodeURIComponent(searchQuery.trim())}` : '';
      const queryStr = [currParam, impParam, searchParam].filter(Boolean).join('&');

      const res = await fetch(`/api/calendar${queryStr ? `?${queryStr}` : ''}`);
      const json = await res.json();
      if (json.success && json.data) {
        setEvents(json.data.events);
        setHighImpactCount(json.data.highImpactCount);
        if (json.data.serverTimeIST) {
          setServerTimeIST(json.data.serverTimeIST);
        }
        setHistoricalAuditStats(macroHistoricalArchive.getArchiveAuditSummary());
        setHistoricalEvents(macroHistoricalArchive.getHistoricalArchive());
        setBaselineMetrics(macroHistoricalArchive.getHistoricalBaselineMetrics());
      }
    } catch (e) {
      console.error('Failed to fetch from /api/calendar:', e);
      if (initialCalendar.length > 0) setEvents(initialCalendar);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCalendar();
    }
  }, [isOpen, currencyFilter, impactFilter, searchQuery]);

  if (!isOpen && !isFullPage) return null;

  const content = (
    <div className={`bg-terminal-900 border border-terminal-border rounded-xl w-full ${isFullPage ? 'shadow-xl' : 'max-w-5xl max-h-[90vh] shadow-2xl'} flex flex-col overflow-hidden`}>
      {/* Modal / Page Header */}
      <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                12 // INSTITUTIONAL MACROECONOMIC CALENDAR & DISPATCHES
              </h3>
              <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1 font-bold">
                <Clock className="w-3 h-3 text-purple-400" />
                IST TIMEZONE (12H AM/PM)
              </span>
              <span className="hidden lg:inline px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                EXACT TIMESTAMPS SYNCED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              Central Bank & Macro Catalysts Radar ({events.length} Events • {highImpactCount} High Impact)
              {serverTimeIST && <span className="text-purple-300 ml-2">• Current: {serverTimeIST}</span>}
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
            onClick={fetchCalendar}
            disabled={isLoading}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
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

      {/* Filter Bar */}
      <div className="p-2 sm:p-3 bg-terminal-950/60 border-b border-terminal-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 bg-terminal-900 p-0.5 rounded-lg border border-terminal-border">
            {(['ALL', 'USD', 'EUR', 'GBP', 'JPY', 'INR', 'XAU', 'WTI'] as const).map(curr => (
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

      {/* 🏛️ Decoupled 30-Day Background Historical Archive Drawer (Kept separate from primary UI) */}
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

          {/* Decoupled Historical Events Backup List (Recent Releases) */}
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

      {/* Modal Body with Horizontal & Vertical Scrolling */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <div className="overflow-x-auto border border-terminal-border rounded-lg scrollbar-thin">
          <table className="w-full text-left font-mono text-xs min-w-[620px]">
            <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-[11px] sticky top-0">
              <tr>
                <th className="p-2.5 sm:p-3">Currency</th>
                <th className="p-2.5 sm:p-3">Economic Catalyst</th>
                <th className="p-2.5 sm:p-3">Impact</th>
                <th className="p-2.5 sm:p-3">Actual</th>
                <th className="p-2.5 sm:p-3">Forecast</th>
                <th className="p-2.5 sm:p-3">Previous</th>
                
                {/* Desktop View: Separate Date and Dedicated Time Column */}
                <th className="hidden md:table-cell p-2.5 sm:p-3 text-slate-300">Date</th>
                <th className="hidden md:table-cell p-2.5 sm:p-3 text-purple-300">Time (IST)</th>

                {/* Mobile / Smaller Screen View: Combined Single Date & Time Column */}
                <th className="md:hidden p-2.5 sm:p-3 text-purple-300">Date & Time (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {events.map((event, i) => {
                const { dateOnly, timeOnlyIST, concatenatedDateTime } = parseAndFormatIST(event);
                return (
                  <tr key={i} className="hover:bg-terminal-800/50 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-white flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
                      {event.region}
                    </td>
                    <td className="p-2.5 sm:p-3 text-slate-200">
                      <span className="font-semibold text-white block">{event.name}</span>
                      {event.timeUTC && (
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Release: {event.timeUTC}
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 sm:p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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
                    <td className="p-2.5 sm:p-3 text-emerald-400 font-bold">{event.actual || '—'}</td>
                    <td className="p-2.5 sm:p-3 text-slate-300">{event.forecast || '—'}</td>
                    <td className="p-2.5 sm:p-3 text-slate-400">{event.previous || '—'}</td>

                    {/* Desktop View: Dedicated Date & Dedicated Time Column (Right next to each other) */}
                    <td className="hidden md:table-cell p-2.5 sm:p-3 text-slate-300 font-mono whitespace-nowrap">
                      {dateOnly}
                    </td>
                    <td className="hidden md:table-cell p-2.5 sm:p-3 text-purple-300 font-bold font-mono whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-purple-950/60 border border-purple-800/50 text-[11px]">
                        <Clock className="w-3 h-3 text-purple-400 shrink-0" />
                        {timeOnlyIST}
                      </span>
                    </td>

                    {/* Mobile / Smaller Screen View: Dynamically Concatenated String */}
                    <td className="md:hidden p-2.5 sm:p-3 text-slate-300 font-mono">
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
              })}
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
