'use client';

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  ArrowUpRight, 
  Layers, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  ChevronDown
} from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

export interface ScenariosAndZonesSidebarProps {
  pair: CurrencyPair;
  timeframe: string;
  theme?: 'light' | 'dark';
  onSyncToTerminal?: (params: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
  }) => void;
}

export const ScenariosAndZonesSidebar: React.FC<ScenariosAndZonesSidebarProps> = ({
  pair,
  timeframe,
  theme = 'light',
  onSyncToTerminal,
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'Strength' | 'Scenarios & Zones' | 'Structure'>('Scenarios & Zones');
  const [selectedScenario, setSelectedScenario] = useState<string>('Follow market bias');

  return (
    <div className={`w-full h-full flex flex-col select-none overflow-y-auto custom-scrollbar font-sans text-xs ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      {/* Top Tabs: Strength | Scenarios & Zones | Structure */}
      <div className="grid grid-cols-3 border-b border-slate-200 dark:border-terminal-border text-center font-bold shrink-0">
        {(['Strength', 'Scenarios & Zones', 'Structure'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2 px-1 text-[11px] transition-colors border-b-2 ${
              activeTab === tab
                ? isLight
                  ? 'border-slate-900 text-slate-900 bg-slate-50'
                  : 'border-cyan-400 text-white bg-terminal-900/60'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        {activeTab === 'Scenarios & Zones' && (
          <>
            {/* Analysis Reference Zones Section Header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  Analysis reference zones
                </h3>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] text-slate-500">Scenario</span>
                <div className="relative">
                  <select
                    value={selectedScenario}
                    onChange={(e) => setSelectedScenario(e.target.value)}
                    className="appearance-none pl-2.5 pr-6 py-0.5 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-slate-800 dark:text-white font-semibold text-[11px] focus:outline-none cursor-pointer"
                  >
                    <option>Follow market bias</option>
                    <option>Bullish breakout scenario</option>
                    <option>Bearish continuation breakdown</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                Bearish scenario - scenario invalidation above
              </p>
            </div>

            {/* 1. SAFE ZONE CARD */}
            <div className="p-2.5 rounded-lg border border-emerald-500/40 bg-emerald-500/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-emerald-700 dark:text-emerald-400">
                  SAFE ZONE
                </span>
                <span className="font-mono font-bold text-xs text-emerald-800 dark:text-emerald-300">
                  4047.02 - 4050.28
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                A relatively supportive price-structure area under this scenario. It is NOT guaranteed to be safe.
              </p>
              <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-3">
                <li>Below the entry zone with structure intact</li>
                <li>Not guaranteed to be safe</li>
              </ul>
            </div>

            {/* 2. ENTRY ZONE CARD */}
            <div className="p-2.5 rounded-lg border border-cyan-500/50 bg-cyan-500/10 space-y-1.5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-cyan-700 dark:text-cyan-400 flex items-center gap-1">
                  <span>ENTRY ZONE</span>
                  <span className="px-1 py-0.2 rounded bg-cyan-600 text-white text-[9px] font-bold">HIGH CONF</span>
                </span>
                <span className="font-mono font-bold text-xs text-cyan-800 dark:text-cyan-300">
                  4050.28 - 4052.61
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                A price area where several technical factors align. It is NOT an instruction to enter a trade.
              </p>
              <ul className="text-[10px] text-slate-700 dark:text-slate-300 space-y-0.5 list-disc pl-3">
                <li>Bearish Fair Value Gap - fresh</li>
                <li>Overlaps the 0.5 - 0.786 Fibonacci retracement</li>
                <li>In the premium half of the range</li>
              </ul>
            </div>

            {/* 3. CAUTION ZONE CARD */}
            <div className="p-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-amber-700 dark:text-amber-400">
                  CAUTION ZONE
                </span>
                <span className="font-mono font-bold text-xs text-amber-800 dark:text-amber-300">
                  4052.81 - 4067.16
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                Market structure and technical evidence become mixed here.
              </p>
              <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-3">
                <li>Between the entry zone and the invalidation level; structure becomes invalidation risk</li>
                <li>Width: 1.5 × ATR</li>
              </ul>
            </div>

            {/* 4. DANGER ZONE CARD */}
            <div className="p-2.5 rounded-lg border border-rose-500/40 bg-rose-500/5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-black text-xs text-rose-700 dark:text-rose-400">
                  DANGER ZONE
                </span>
                <span className="font-mono font-bold text-xs text-rose-800 dark:text-rose-300">
                  4067.18 - 4073.67
                </span>
              </div>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                The selected scenario may become invalidated or see increased adverse movement here.
              </p>
              <ul className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5 list-disc pl-3">
                <li>Above 4067.16 the bearish scenario is invalidated (protected high / false edge)</li>
                <li>Width: 1 × ATR</li>
              </ul>
            </div>

            <p className="text-[10px] text-slate-400 italic text-center">
              These are technical reference zones, not trade instructions or guarantees.
            </p>

            {/* Scenarios Execution Criteria Breakdown */}
            <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2.5">
              <div className="space-y-1">
                <span className="font-bold text-[11px] text-slate-900 dark:text-white block">
                  Bullish scenario
                </span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal">
                  1h candle closes above <strong>4046.88</strong> (internal swing high) and the next candle confirms it, the next technical reference area is <strong>4052.81</strong> (Bearish Order Block).
                </p>
              </div>

              <div className="space-y-1 pt-1.5 border-t border-slate-200 dark:border-terminal-border">
                <span className="font-bold text-[11px] text-rose-600 dark:text-rose-400 block">
                  Bearish scenario
                </span>
                <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-normal">
                  1h candle closes below <strong>3984.39</strong> (Support zone (3 rejections)) and the next candle confirms it, the next technical reference area is <strong>3968.10</strong>.
                </p>
              </div>
            </div>

            {/* Sync Entry to Terminal Action */}
            {onSyncToTerminal && (
              <button
                onClick={() => {
                  onSyncToTerminal({
                    symbol: pair,
                    direction: 'SELL',
                    entry: 4051.50,
                    stopLoss: 4068.50,
                    takeProfit: 3988.00,
                  });
                }}
                className="w-full py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-cyan-600 dark:hover:bg-cyan-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>SYNC ENTRY ZONE TO TERMINAL</span>
              </button>
            )}
          </>
        )}

        {/* Strength Tab */}
        {activeTab === 'Strength' && (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Relative Market Strength Matrix
            </span>
            <div className="space-y-2 font-mono text-[11px]">
              {[
                { name: 'XAU (Gold)', score: 78, bar: '78%', color: 'bg-amber-500' },
                { name: 'USD (DXY)', score: 68, bar: '68%', color: 'bg-emerald-500' },
                { name: 'EUR', score: 42, bar: '42%', color: 'bg-blue-500' },
                { name: 'GBP', score: 51, bar: '51%', color: 'bg-indigo-500' },
                { name: 'JPY', score: 35, bar: '35%', color: 'bg-rose-500' },
              ].map(cur => (
                <div key={cur.name} className="p-2 rounded border border-slate-200 dark:border-terminal-border space-y-1">
                  <div className="flex justify-between">
                    <span className="font-bold">{cur.name}</span>
                    <span>{cur.score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-terminal-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cur.color}`} style={{ width: cur.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Structure Tab */}
        {activeTab === 'Structure' && (
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
              Multi-Timeframe Structure Hierarchy
            </span>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded border border-slate-200 dark:border-terminal-border space-y-1">
                <div className="flex justify-between font-bold">
                  <span>1D Timeframe</span>
                  <span className="text-rose-600">BEARISH (BOS)</span>
                </div>
                <p className="text-[10px] text-slate-500">Structural swing low broken at 4020.00.</p>
              </div>

              <div className="p-2.5 rounded border border-slate-200 dark:border-terminal-border space-y-1">
                <div className="flex justify-between font-bold">
                  <span>4H Timeframe</span>
                  <span className="text-rose-600">BEARISH CONTINUATION</span>
                </div>
                <p className="text-[10px] text-slate-500">Order blocks holding lower highs intact.</p>
              </div>

              <div className="p-2.5 rounded border border-slate-200 dark:border-terminal-border space-y-1">
                <div className="flex justify-between font-bold">
                  <span>1H Timeframe</span>
                  <span className="text-amber-600">CONSOLIDATION RANGE</span>
                </div>
                <p className="text-[10px] text-slate-500">Range bound between 3998.47 and 4046.88.</p>
              </div>

              <div className="p-2.5 rounded border border-cyan-500/40 bg-cyan-500/5 space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-cyan-700 dark:text-cyan-400">15M Timeframe</span>
                  <span className="text-cyan-600">DEVELOPING REVERSAL</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">Sell-side sweep confirmed, looking for CHoCH confirmation.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
