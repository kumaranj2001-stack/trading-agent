'use client';

import React, { useState } from 'react';
import { 
  Clock, 
  RotateCcw, 
  ChevronUp, 
  ChevronDown, 
  Layers, 
  Bell, 
  ShieldCheck, 
  Database 
} from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

export interface StructureTimelineBottomProps {
  pair: CurrencyPair;
  timeframe: string;
  theme?: 'light' | 'dark';
}

export const StructureTimelineBottom: React.FC<StructureTimelineBottomProps> = ({
  pair,
  timeframe,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const cleanPair = pair.replace('/', '');
  const [activeTab, setActiveTab] = useState<'timeline' | 'sessions' | 'alerts' | 'validation' | 'account'>('timeline');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const timelineEvents = [
    { time: '11 Nov 22:15', symbol: cleanPair, tf: '15M', event: 'Sell-side liquidity swept - New York session low', price: '4013.56', tagColor: 'text-amber-600 dark:text-amber-400' },
    { time: '11 Nov 20:30', symbol: cleanPair, tf: '15M', event: 'Internal CHoCH - Bearish displacement', price: '4025.10', tagColor: 'text-rose-600 dark:text-rose-400' },
    { time: '11 Nov 19:45', symbol: cleanPair, tf: '15M', event: 'Bearish Order Block (OB) Confirmed', price: '4041.80', tagColor: 'text-purple-600 dark:text-purple-400' },
    { time: '11 Nov 18:20', symbol: cleanPair, tf: '15M', event: 'Fair Value Gap (FVG) Mitigated', price: '4050.28', tagColor: 'text-cyan-600 dark:text-cyan-400' },
    { time: '11 Nov 17:00', symbol: cleanPair, tf: '15M', event: 'Equal Lows Formed (Liquidity Trap)', price: '3998.47', tagColor: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className={`w-full border-t flex flex-col select-none transition-colors ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-800' 
        : 'bg-terminal-950 border-terminal-border text-slate-100'
    }`}>
      {/* Tab bar header */}
      <div className="flex items-center justify-between px-3 border-b border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900/60 text-xs">
        <div className="flex items-center overflow-x-auto no-scrollbar font-semibold">
          {[
            { id: 'timeline', label: 'Structure Timeline' },
            { id: 'sessions', label: 'Sessions' },
            { id: 'alerts', label: 'Alerts' },
            { id: 'validation', label: 'Validation' },
            { id: 'account', label: 'Data & account' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setIsExpanded(true);
              }}
              className={`py-2 px-3 whitespace-nowrap transition-colors border-b-2 text-[11px] ${
                activeTab === tab.id
                  ? isLight
                    ? 'border-slate-900 text-slate-900 bg-white font-bold'
                    : 'border-cyan-400 text-white bg-terminal-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Expand / Minimize toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          title={isExpanded ? 'Collapse Timeline' : 'Expand Timeline'}
        >
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Content Table */}
      {isExpanded && (
        <div className="max-h-40 overflow-y-auto custom-scrollbar font-mono text-[11px]">
          {activeTab === 'timeline' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-terminal-border text-[10px] text-slate-500 font-sans uppercase">
                  <th className="py-1.5 px-3">Time</th>
                  <th className="py-1.5 px-3">Symbol</th>
                  <th className="py-1.5 px-3">TF</th>
                  <th className="py-1.5 px-3">Event</th>
                  <th className="py-1.5 px-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-terminal-border/60">
                {timelineEvents.map((evt, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-terminal-900/40 transition-colors">
                    <td className="py-1.5 px-3 text-slate-500 font-medium">{evt.time}</td>
                    <td className="py-1.5 px-3 font-bold text-slate-900 dark:text-white">{evt.symbol}</td>
                    <td className="py-1.5 px-3 text-slate-600 dark:text-slate-300">{evt.tf}</td>
                    <td className={`py-1.5 px-3 font-medium ${evt.tagColor}`}>{evt.event}</td>
                    <td className="py-1.5 px-3 text-right font-bold text-slate-900 dark:text-white">{evt.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {activeTab === 'sessions' && (
            <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 font-sans text-xs">
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border">
                <span className="font-bold block text-slate-900 dark:text-white">Asian Session (Tokyo)</span>
                <span className="text-[10px] text-slate-500">00:00 - 09:00 UTC · Range: 4001.20 - 4022.40</span>
              </div>
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border">
                <span className="font-bold block text-slate-900 dark:text-white">London Session</span>
                <span className="text-[10px] text-slate-500">08:00 - 16:30 UTC · Expansion Trend Active</span>
              </div>
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border bg-emerald-500/5 border-emerald-500/30">
                <span className="font-bold block text-emerald-700 dark:text-emerald-400">New York Overlap (Active)</span>
                <span className="text-[10px] text-emerald-600">13:00 - 17:00 UTC · Peak Order Flow Imbalance</span>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="p-3 text-slate-500 text-xs">
              No active price alerts triggered in the current 15m candle.
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="p-3 text-slate-500 text-xs font-mono">
              Walk-forward verification pass rate: 71.4% on Grade A+ Setups.
            </div>
          )}

          {activeTab === 'account' && (
            <div className="p-3 text-slate-500 text-xs font-mono">
              Broker terminal latency: 12ms · Live Feed: Connected.
            </div>
          )}
        </div>
      )}

      {/* Bottom Replay History Status Bar */}
      <div className="px-3 py-1 bg-slate-100 dark:bg-terminal-950 border-t border-slate-200 dark:border-terminal-border flex items-center justify-between text-[10px] text-slate-500 font-mono">
        <div className="flex items-center gap-2">
          <button className="px-2 py-0.5 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-50">
            Replay history
          </button>
          <span>Analysis as of 11 Nov 22:50 (Asia/Colombo)</span>
        </div>

        <span className="hidden sm:inline">QRI Trader // Infinity Vision Enterprise</span>
      </div>
    </div>
  );
};
