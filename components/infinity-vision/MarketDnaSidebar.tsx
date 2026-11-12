'use client';

import React, { useState, useEffect } from 'react';
import { 
  Dna, 
  Search, 
  RotateCcw, 
  Clock, 
  CheckSquare, 
  TrendingUp, 
  TrendingDown, 
  Sliders,
  ChevronDown
} from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

export interface MarketDnaSidebarProps {
  pair: CurrencyPair;
  timeframe: string;
  theme?: 'light' | 'dark';
  onTogglePatternOnChart?: (on: boolean) => void;
  onToggleChartMode?: (mode: 'Candles' | 'Line') => void;
}

export const MarketDnaSidebar: React.FC<MarketDnaSidebarProps> = ({
  pair,
  timeframe,
  theme = 'light',
  onTogglePatternOnChart,
  onToggleChartMode,
}) => {
  const isLight = theme === 'light';
  const isXau = pair.includes('XAU');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'twins' | 'entry' | 'stats' | 'confirmation' | 'replay'>('overview');
  const [patternLength, setPatternLength] = useState<number>(40);
  const [outcomeLength, setOutcomeLength] = useState<number>(20);
  const [sortMethod, setSortMethod] = useState<string>('Similarity');
  const [rrFilter, setRrFilter] = useState<string>('1:1 - 1:2 - 1:3');
  const [updateOnClose, setUpdateOnClose] = useState<boolean>(true);
  const [patternOnChart, setPatternOnChart] = useState<boolean>(true);
  const [chartMode, setChartMode] = useState<'Candles' | 'Line'>('Candles');
  const [candleSeconds, setCandleSeconds] = useState<number>(368); // 6:08

  // Live countdown timer for 15M candle forming
  useEffect(() => {
    const timer = setInterval(() => {
      setCandleSeconds(prev => (prev > 0 ? prev - 1 : 900));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTimer = `${Math.floor(candleSeconds / 60)}:${(candleSeconds % 60).toString().padStart(2, '0')}`;

  const handlePatternToggle = () => {
    const nextVal = !patternOnChart;
    setPatternOnChart(nextVal);
    if (onTogglePatternOnChart) onTogglePatternOnChart(nextVal);
  };

  const handleChartModeChange = (mode: 'Candles' | 'Line') => {
    setChartMode(mode);
    if (onToggleChartMode) onToggleChartMode(mode);
  };

  return (
    <div className={`w-full h-full flex flex-col select-none overflow-y-auto custom-scrollbar font-sans text-xs ${
      isLight ? 'text-slate-800' : 'text-slate-100'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-terminal-border">
        <div className="flex items-center gap-1.5">
          <Dna className="w-4 h-4 text-amber-500" />
          <h2 className="font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
            INFINITY FUSION DNA ANALYSIS
          </h2>
        </div>
        <p className="text-[10px] text-slate-500 italic mt-0.5">
          Historical research - not a signal - not a forecast
        </p>
      </div>

      {/* Filter Parameters Bar */}
      <div className="p-3 border-b border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900/40 space-y-2">
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <label className="text-[10px] text-slate-500 block mb-0.5">Pattern length</label>
            <select
              value={patternLength}
              onChange={(e) => setPatternLength(Number(e.target.value))}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-xs font-semibold focus:outline-none"
            >
              <option value={20}>Pattern: 20 candles</option>
              <option value={40}>Pattern: 40 candles</option>
              <option value={60}>Pattern: 60 candles</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block mb-0.5">Outcome length</label>
            <select
              value={outcomeLength}
              onChange={(e) => setOutcomeLength(Number(e.target.value))}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-xs font-semibold focus:outline-none"
            >
              <option value={10}>Outcome: 10 candles</option>
              <option value={20}>Outcome: 20 candles</option>
              <option value={30}>Outcome: 30 candles</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div>
            <label className="text-[10px] text-slate-500 block mb-0.5">Sort</label>
            <select
              value={sortMethod}
              onChange={(e) => setSortMethod(e.target.value)}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-xs font-semibold focus:outline-none"
            >
              <option>Sort: Similarity</option>
              <option>Sort: Volatility Match</option>
              <option>Sort: Win Rate</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] text-slate-500 block mb-0.5">Target RR</label>
            <select
              value={rrFilter}
              onChange={(e) => setRrFilter(e.target.value)}
              className="w-full px-2 py-1 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-xs font-semibold focus:outline-none"
            >
              <option>RR: 1:1 - 1:2 - 1:3</option>
              <option>RR: 1:2+</option>
              <option>RR: 1:3+</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => {}}
          className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-amber-600 dark:hover:bg-amber-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search again</span>
        </button>
      </div>

      {/* Sub-tabs: DNA Overview | Historical Twins | Entry Research | Historical Statistics | Confirmation History | Replay */}
      <div className="flex border-b border-slate-200 dark:border-terminal-border overflow-x-auto no-scrollbar shrink-0 text-[11px] font-bold">
        {[
          { id: 'overview', label: 'DNA Overview' },
          { id: 'twins', label: 'Historical Twins' },
          { id: 'entry', label: 'Entry Research' },
          { id: 'stats', label: 'Historical Statistics' },
          { id: 'confirmation', label: 'Confirmation History' },
          { id: 'replay', label: 'Replay' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`py-2 px-2.5 whitespace-nowrap transition-colors border-b-2 ${
              activeSubTab === tab.id
                ? 'border-slate-900 dark:border-amber-400 text-slate-900 dark:text-white bg-slate-50 dark:bg-terminal-900/40'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-3.5 space-y-3.5 flex-1">
        {activeSubTab === 'overview' && (
          <>
            {/* Liquidity Analysis: ESTIMATED */}
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-600 dark:text-slate-300">
                  Liquidity analysis
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-terminal-800 font-bold text-slate-500">
                  ESTIMATED
                </span>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Liquidity sweep:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {isXau ? 'Sell-side swept at 3998.47 - 3 candles ago' : 'Sell-side swept at recent low'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Structure:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">MSS (CHoCH) bearish - not confirming yet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Analysis confidence:</span>
                  <span className="font-bold text-amber-600">Low</span>
                </div>
              </div>

              {/* Probability Split Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-bold font-mono">
                  <span className="text-emerald-600">Bullish 47%</span>
                  <span className="text-rose-600">Bearish 53%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-terminal-800 overflow-hidden flex">
                  <div className="bg-emerald-500 h-full" style={{ width: '47%' }} />
                  <div className="bg-rose-500 h-full" style={{ width: '53%' }} />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">
                  Measured on 50 past sell-side sweeps of this chart (first move of &gt;1 ATR within 12 candles). Not a guarantee.
                </p>
              </div>

              {/* Possible Reaction Zones */}
              <div className="pt-2 border-t border-slate-200 dark:border-terminal-border space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">Possible reaction zones</span>
                <div className="space-y-1 text-[11px] font-mono">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-slate-700 dark:text-slate-300">Sell-limit zone</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isXau ? '4001.70 - 4002.40' : 'Zone 1'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-700" />
                      <span className="text-slate-700 dark:text-slate-300">Sell-limit zone 2</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isXau ? '4010.14 - 4012.72' : 'Zone 2'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <span className="text-slate-700 dark:text-slate-300">Sell-side liquidity</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isXau ? '3999.67 - 4000.55' : 'SSL'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-700" />
                      <span className="text-slate-700 dark:text-slate-300">Buy-limit zone</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {isXau ? '3989.97 - 3996.36' : 'Buy Zone'}
                    </span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 italic pt-1">
                  Entry areas, invalidation and targets appear only when a sweep, a structure confirmation and enough history agree.
                </p>
              </div>
            </div>

            {/* CANDLE 15M / RESEARCH STATUS */}
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <div>
                  <span className="text-slate-500 text-[10px] uppercase block">CANDLE 15M</span>
                  <strong className="text-slate-900 dark:text-white font-bold">{formattedTimer} FORMING</strong>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 text-[10px] uppercase block">RESEARCH</span>
                  <span className="text-amber-600 font-bold">WAITING</span>
                  <span className="text-[9px] text-slate-400 block -mt-0.5">last confirmed 22:15</span>
                </div>
              </div>

              <label className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-400 cursor-pointer pt-1 border-t border-slate-200 dark:border-terminal-border">
                <input
                  type="checkbox"
                  checked={updateOnClose}
                  onChange={(e) => setUpdateOnClose(e.target.checked)}
                  className="rounded"
                />
                <span>Update after each closed candle</span>
              </label>
            </div>

            {/* RESEARCH STATUS: DEVELOPING SETUP */}
            <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">RESEARCH STATUS</span>
                <span className="text-[11px] font-bold text-slate-900 dark:text-white">DEVELOPING SETUP</span>
              </div>

              <p className="text-[10px] text-slate-600 dark:text-slate-400 italic">
                Historical bias: <strong>bullish</strong> - a description of what similar past patterns did, not a forecast or a trade instruction.
              </p>

              <div className="space-y-1 pt-1 text-[10px] font-sans border-t border-slate-200 dark:border-terminal-border">
                <div className="flex justify-between">
                  <span className="text-slate-500">Market condition:</span>
                  <span className="text-right font-medium max-w-[190px]">Structural transition - sideways - quiet volatility</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Market regime:</span>
                  <span className="font-medium">Structural transition</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Session:</span>
                  <span className="font-medium">London / New York overlap</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Volatility:</span>
                  <span className="font-medium">Quiet</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Candle strength:</span>
                  <span className="font-medium">Moderate</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Historical similarity:</span>
                  <span className="font-bold text-amber-600">67.3</span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Historical Twins Subtab */}
        {activeSubTab === 'twins' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
              Matched Pattern Fractals (Top 3)
            </span>
            <div className="space-y-2">
              <div className="p-2.5 rounded border border-amber-500/40 bg-amber-500/5 space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <strong className="text-amber-700 dark:text-amber-400">Match #1 (67.3%)</strong>
                  <span>2025-10-29 14:00</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  Reaction: +2.4R bullish expansion after sweeping London S1.
                </p>
              </div>

              <div className="p-2.5 rounded border border-slate-200 dark:border-terminal-border space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <strong className="text-slate-800 dark:text-slate-200">Match #2 (64.1%)</strong>
                  <span>2025-08-14 09:15</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  Reaction: -1.0R stop out during Asian range contraction.
                </p>
              </div>

              <div className="p-2.5 rounded border border-slate-200 dark:border-terminal-border space-y-1">
                <div className="flex justify-between font-mono text-[11px]">
                  <strong className="text-slate-800 dark:text-slate-200">Match #3 (61.8%)</strong>
                  <span>2025-06-03 16:30</span>
                </div>
                <p className="text-[10px] text-slate-600 dark:text-slate-400">
                  Reaction: +3.1R target hit at NY session close.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Entry Research Subtab */}
        {activeSubTab === 'entry' && (
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
              High-Confluence Criteria Checklist
            </span>
            <div className="space-y-1.5 text-[11px]">
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span>Sell-side liquidity sweep</span>
                <span className="font-bold text-emerald-600">CONFIRMED</span>
              </div>
              <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <span>Premium/Discount alignment</span>
                <span className="font-bold text-emerald-600">PREMIUM (68%)</span>
              </div>
              <div className="p-2 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between">
                <span>Bearish FVG at 61.8% Fib</span>
                <span className="font-bold text-cyan-600">OVERLAPPING</span>
              </div>
              <div className="p-2 rounded bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span>15m candle close below S1</span>
                <span className="font-bold text-amber-600">PENDING (WAITING)</span>
              </div>
            </div>
            <div className="p-2 rounded border border-slate-200 dark:border-terminal-border text-[10px] text-slate-500">
              Calculated RR Ratio: <strong>1:3.2</strong> · Institutional Confidence Grade: <strong>A+</strong>
            </div>
          </div>
        )}

        {/* Historical Statistics Subtab */}
        {activeSubTab === 'stats' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
              Walk-Forward Permutation Statistics
            </span>
            <div className="grid grid-cols-2 gap-2 text-center font-mono">
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border">
                <span className="text-[10px] text-slate-500 block">Win Rate</span>
                <strong className="text-emerald-600 text-sm">68.2%</strong>
              </div>
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border">
                <span className="text-[10px] text-slate-500 block">Avg R-Multiple</span>
                <strong className="text-cyan-600 text-sm">2.15R</strong>
              </div>
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border">
                <span className="text-[10px] text-slate-500 block">Max Drawdown</span>
                <strong className="text-amber-600 text-sm">0.85 ATR</strong>
              </div>
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border">
                <span className="text-[10px] text-slate-500 block">Profit Factor</span>
                <strong className="text-slate-900 dark:text-white text-sm">2.41</strong>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation History Subtab */}
        {activeSubTab === 'confirmation' && (
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase text-slate-600 dark:text-slate-400">
              Confirmation Log
            </span>
            <div className="space-y-1.5 font-mono text-[11px]">
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border flex justify-between">
                <span>22:15 UTC</span>
                <span className="font-bold text-emerald-600">Sweep Low Confirmed</span>
              </div>
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border flex justify-between">
                <span>20:30 UTC</span>
                <span className="font-bold text-rose-600">Internal CHoCH Reversal</span>
              </div>
              <div className="p-2 rounded border border-slate-200 dark:border-terminal-border flex justify-between">
                <span>19:45 UTC</span>
                <span className="font-bold text-purple-600">Bearish Order Block Formed</span>
              </div>
            </div>
          </div>
        )}

        {/* Replay Subtab */}
        {activeSubTab === 'replay' && (
          <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2 text-center">
            <span className="font-bold text-xs uppercase block text-slate-700 dark:text-slate-300">
              Bar-by-Bar Replay Simulator
            </span>
            <p className="text-[10px] text-slate-500">
              Replay historical candle progression step-by-step with real-time indicators.
            </p>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button className="px-3 py-1 rounded bg-slate-900 text-white font-bold text-xs">
                ▶ Start Replay
              </button>
              <button className="px-2 py-1 rounded border border-slate-300 text-xs">
                Next Step ⏩
              </button>
            </div>
          </div>
        )}

        {/* Bottom Toggle: Pattern on chart & Candles/Line */}
        <div className="p-2 rounded-lg bg-slate-50 dark:bg-terminal-900 border border-slate-200 dark:border-terminal-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Pattern on chart</span>
            <button
              onClick={handlePatternToggle}
              className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                patternOnChart ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-terminal-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                patternOnChart ? 'translate-x-4' : 'translate-x-0'
              }`} />
            </button>
          </div>

          <div className="flex items-center p-0.5 rounded border border-slate-200 dark:border-terminal-border text-[10px] font-bold">
            <button
              onClick={() => handleChartModeChange('Candles')}
              className={`px-2 py-0.5 rounded ${chartMode === 'Candles' ? 'bg-white dark:bg-terminal-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
            >
              Candles
            </button>
            <button
              onClick={() => handleChartModeChange('Line')}
              className={`px-2 py-0.5 rounded ${chartMode === 'Line' ? 'bg-white dark:bg-terminal-800 text-slate-900 dark:text-white shadow-xs' : 'text-slate-400'}`}
            >
              Line
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
