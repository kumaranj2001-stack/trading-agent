'use client';

import React from 'react';
import { MacroIndicator } from '@/lib/types';
import { Calendar, X } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">Macroeconomic Calendar</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Central Bank & Macro Catalysts Radar
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors shrink-0"
            aria-label="Close modal"
          >
            <span className="hidden sm:inline">Close</span>
            <X className="w-4 h-4 sm:hidden" />
          </button>
        </div>

        {/* Modal Body with Horizontal & Vertical Scrolling */}
        <div className="flex-1 overflow-auto p-2 sm:p-4">
          <div className="overflow-x-auto border border-terminal-border rounded-lg scrollbar-thin">
            <table className="w-full text-left font-mono text-xs min-w-[550px]">
              <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-[11px] sticky top-0">
                <tr>
                  <th className="p-2.5 sm:p-3">Currency</th>
                  <th className="p-2.5 sm:p-3">Economic Event</th>
                  <th className="p-2.5 sm:p-3">Impact</th>
                  <th className="p-2.5 sm:p-3">Actual</th>
                  <th className="p-2.5 sm:p-3">Forecast</th>
                  <th className="p-2.5 sm:p-3">Previous</th>
                  <th className="p-2.5 sm:p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/60 bg-terminal-900/60">
                {calendar.map((item, idx) => (
                  <tr key={idx} className="hover:bg-terminal-800/40 transition-colors">
                    <td className="p-2.5 sm:p-3 font-bold text-purple-400">{item.region}</td>
                    <td className="p-2.5 sm:p-3 font-medium text-white">{item.name}</td>
                    <td className="p-2.5 sm:p-3">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        HIGH
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3 font-bold text-emerald-400">{item.actual}</td>
                    <td className="p-2.5 sm:p-3 text-slate-300">{item.forecast}</td>
                    <td className="p-2.5 sm:p-3 text-slate-400">{item.previous}</td>
                    <td className="p-2.5 sm:p-3 text-slate-400 text-[11px] whitespace-nowrap">{item.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
