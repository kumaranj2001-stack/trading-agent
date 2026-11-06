'use client';

import React from 'react';
import { MacroIndicator } from '@/lib/types';
import { Calendar, Clock, AlertCircle, X, TrendingUp } from 'lucide-react';

interface EconomicCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: MacroIndicator[];
}

export const EconomicCalendarModal: React.FC<EconomicCalendarModalProps> = ({
  isOpen,
  onClose,
  calendar,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-3xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-terminal-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">High-Impact Macroeconomic Calendar</h3>
              <p className="text-xs text-slate-400 font-mono">
                Real-time central bank announcements & macroeconomic catalyst radar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors"
          >
            Close
          </button>
        </div>

        <div className="overflow-x-auto border border-terminal-border rounded-lg max-h-[460px] scrollbar-thin">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-[11px] sticky top-0">
              <tr>
                <th className="p-3">Currency</th>
                <th className="p-3">Economic Event</th>
                <th className="p-3">Impact</th>
                <th className="p-3">Actual</th>
                <th className="p-3">Forecast</th>
                <th className="p-3">Previous</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/60 bg-terminal-900/60">
              {calendar.map((item, idx) => (
                <tr key={idx} className="hover:bg-terminal-800/40 transition-colors">
                  <td className="p-3 font-bold text-purple-400">{item.region}</td>
                  <td className="p-3 font-medium text-white">{item.name}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                      HIGH
                    </span>
                  </td>
                  <td className="p-3 font-bold text-emerald-400">{item.actual}</td>
                  <td className="p-3 text-slate-300">{item.forecast}</td>
                  <td className="p-3 text-slate-400">{item.previous}</td>
                  <td className="p-3 text-slate-400 text-[11px]">{item.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
