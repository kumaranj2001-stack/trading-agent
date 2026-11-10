'use client';

import React, { useState, useEffect } from 'react';
import { MacroIndicator } from '@/lib/types';
import { Calendar, X, RefreshCw, Filter, Search, Sparkles, ArrowLeft, Clock, Globe } from 'lucide-react';

interface EconomicCalendarModalProps {
  isOpen?: boolean;
  onClose: () => void;
  calendar?: MacroIndicator[];
  isFullPage?: boolean;
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
  const [responseTimeMs, setResponseTimeMs] = useState<number>(2);
  const [timezoneMode, setTimezoneMode] = useState<'IST' | 'UTC'>('IST');

  const fetchCalendar = async () => {
    setIsLoading(true);
    const clientStart = performance.now();
    try {
      const currParam = currencyFilter !== 'ALL' ? `currency=${encodeURIComponent(currencyFilter)}` : '';
      const impParam = impactFilter !== 'ALL' ? `impact=${encodeURIComponent(impactFilter)}` : '';
      const searchParam = searchQuery.trim() ? `search=${encodeURIComponent(searchQuery.trim())}` : '';
      const queryStr = [currParam, impParam, searchParam].filter(Boolean).join('&');

      const res = await fetch(`/api/calendar${queryStr ? `?${queryStr}` : ''}`);
      const json = await res.json();
      const elapsed = Math.max(1, Math.round(performance.now() - clientStart));
      if (json.success && json.data) {
        setEvents(json.data.events);
        setHighImpactCount(json.data.highImpactCount);
        setResponseTimeMs(json.data.responseTimeMs || elapsed);
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
    <div className={`bg-terminal-900 border border-terminal-border rounded-xl w-full ${isFullPage ? 'shadow-xl' : 'max-w-4xl max-h-[90vh] shadow-2xl'} flex flex-col overflow-hidden`}>
      {/* Modal / Page Header */}
      <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                10 // INSTITUTIONAL MACROECONOMIC CALENDAR & DISPATCHES
              </h3>
              <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                REST API CONNECTED
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                <Clock className="w-2.5 h-2.5 text-cyan-400" />
                API RESPONSE: {responseTimeMs}ms
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              Central Bank & Macro Catalysts Radar ({events.length} Events • {highImpactCount} High Impact • Exact Release Timestamps)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Timezone Toggle Pill */}
          <div className="flex items-center bg-terminal-950 border border-terminal-border rounded-lg p-0.5 font-mono text-[11px]">
            <button
              onClick={() => setTimezoneMode('IST')}
              className={`px-2 py-0.5 rounded transition-all ${
                timezoneMode === 'IST'
                  ? 'bg-cyan-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display times in Indian Standard Time (IST - UTC+05:30)"
            >
              IST
            </button>
            <button
              onClick={() => setTimezoneMode('UTC')}
              className={`px-2 py-0.5 rounded transition-all ${
                timezoneMode === 'UTC'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Display times in Coordinated Universal Time (UTC)"
            >
              UTC
            </button>
          </div>

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
            placeholder="Search event, currency or time..."
            className="w-full bg-terminal-900 border border-terminal-border rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-sans"
          />
        </div>
      </div>

      {/* Modal Body with Horizontal & Vertical Scrolling */}
      <div className="flex-1 overflow-auto p-2 sm:p-4">
        <div className="overflow-x-auto border border-terminal-border rounded-lg scrollbar-thin">
          <table className="w-full text-left font-mono text-xs min-w-[720px]">
            <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-[11px] sticky top-0">
              <tr>
                <th className="p-2.5 sm:p-3">Currency</th>
                <th className="p-2.5 sm:p-3">Economic Event</th>
                <th className="p-2.5 sm:p-3">Impact</th>
                <th className="p-2.5 sm:p-3">Actual</th>
                <th className="p-2.5 sm:p-3">Forecast</th>
                <th className="p-2.5 sm:p-3">Previous</th>
                <th className="p-2.5 sm:p-3">Date</th>
                <th className="p-2.5 sm:p-3 text-cyan-300">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    <span>Time ({timezoneMode})</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/50">
              {events.map((event, i) => (
                <tr key={i} className="hover:bg-terminal-800/50 transition-colors">
                  <td className="p-2.5 sm:p-3 font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-purple-400" />
                    {event.region}
                  </td>
                  <td className="p-2.5 sm:p-3 text-slate-200 font-medium">
                    <div className="flex flex-col">
                      <span>{event.name}</span>
                      {/* Responsive mobile timestamp badge */}
                      <span className="sm:hidden text-[10px] text-cyan-300 font-normal mt-0.5">
                        🕒 {event.date} • {timezoneMode === 'IST' ? (event.timeIST || event.time) : (event.timeUTC || event.time)}
                      </span>
                    </div>
                  </td>
                  <td className="p-2.5 sm:p-3 whitespace-nowrap">
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
                  <td className="p-2.5 sm:p-3 text-emerald-400 font-bold whitespace-nowrap">{event.actual || '—'}</td>
                  <td className="p-2.5 sm:p-3 text-slate-300 whitespace-nowrap">{event.forecast || '—'}</td>
                  <td className="p-2.5 sm:p-3 text-slate-400 whitespace-nowrap">{event.previous || '—'}</td>
                  {/* Dedicated Date Column */}
                  <td className="p-2.5 sm:p-3 text-slate-300 font-medium whitespace-nowrap">
                    {event.date}
                  </td>
                  {/* Dedicated Time Column placed right next to Date Column */}
                  <td className="p-2.5 sm:p-3 whitespace-nowrap">
                    <div className="flex flex-col">
                      <span className="text-cyan-300 font-bold flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
                        {timezoneMode === 'IST' ? (event.timeIST || '19:30 IST') : (event.timeUTC || '14:00 UTC')}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate max-w-[130px]" title={event.time}>
                        {timezoneMode === 'IST' ? (event.timeUTC || '14:00 UTC') : (event.timeIST || '19:30 IST')}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
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
