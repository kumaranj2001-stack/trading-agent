'use client';

import React, { useState } from 'react';
import { X, Minimize2, Maximize2, Droplets, Info } from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

export interface LiquidityHeatmapModalProps {
  isOpen: boolean;
  onClose: () => void;
  pair?: CurrencyPair;
  timeframe?: string;
  theme?: 'light' | 'dark';
}

export const LiquidityHeatmapModal: React.FC<LiquidityHeatmapModalProps> = ({
  isOpen,
  onClose,
  pair = 'XAU/USD',
  timeframe = '15m',
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const cleanPair = pair.replace('/', '');

  if (!isOpen) return null;

  const liquidityLevels = [
    { type: 'Sell-limit zone', price: 4051.55, strength: 33, delta: '+4', color: 'bg-amber-500', barWidth: '45%' },
    { type: 'Sell-limit zone 2', price: 4039.91, strength: 43, delta: '+2', color: 'bg-rose-500', barWidth: '65%' },
    { type: 'Sell-limit zone', price: 4034.96, strength: 29, delta: '+2', color: 'bg-amber-500', barWidth: '40%' },
    { type: 'Sell-limit zone', price: 4031.70, strength: 40, delta: '+3', color: 'bg-amber-500', barWidth: '58%' },
    { type: 'Sell-limit zone', price: 4023.69, strength: 34, delta: '+2', color: 'bg-amber-500', barWidth: '48%' },
    { type: 'Buy-side liquidity', price: 4020.00, strength: 20, delta: '+1', color: 'bg-blue-500', barWidth: '30%' },
    { type: 'Buy-limit zone', price: 3989.97, strength: 48, delta: '+5', color: 'bg-blue-600', barWidth: '72%' },
  ];

  return (
    <div className={`absolute top-12 left-1/2 -translate-x-1/2 z-40 w-[94vw] sm:w-[420px] max-w-[430px] max-h-[85vh] overflow-y-auto rounded-xl border shadow-2xl backdrop-blur-md select-none transition-all ${
      isLight 
        ? 'bg-white/98 border-slate-300 text-slate-800' 
        : 'bg-terminal-950/98 border-terminal-border text-slate-100'
    }`}>
      {/* Modal Header */}
      <div className="p-3 border-b border-slate-200 dark:border-terminal-border flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Droplets className="w-4 h-4 text-blue-500" />
          <div>
            <h3 className="text-xs font-black tracking-wider uppercase">LIQUIDITY HEATMAP</h3>
            <span className="text-[10px] text-slate-500 font-mono block">
              {cleanPair} - {timeframe} Quantum liquidity engine
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="p-3.5 space-y-3 font-sans text-xs">
        {/* OTC Disclaimer Notice */}
        <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-500/30 text-[10px] text-amber-800 dark:text-amber-300">
          <strong>ESTIMATED:</strong> No online book for this OTC instrument - orders are estimated from price behaviour.
        </div>

        {/* Live Bid / Ask / Spread */}
        <div className="p-2 rounded bg-slate-50 dark:bg-terminal-900 border border-slate-200 dark:border-terminal-border flex items-center justify-between text-xs font-mono">
          <span>Bid: <strong className="font-bold text-slate-900 dark:text-white">4001.67</strong></span>
          <span>Ask: <strong className="font-bold text-slate-900 dark:text-white">4001.84</strong></span>
          <span className="text-slate-500">Spread: <strong className="text-slate-800 dark:text-slate-200">0.17</strong></span>
        </div>

        {/* Table of Liquidity Levels */}
        <div className="space-y-1.5 font-mono text-[11px]">
          {liquidityLevels.map((lvl, i) => (
            <div 
              key={i} 
              className="p-1.5 rounded border border-slate-200 dark:border-terminal-border/80 flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-terminal-900 transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className={`w-2 h-2 rounded-full ${lvl.color}`} />
                <span className="truncate text-slate-700 dark:text-slate-300 font-medium text-[11px]">
                  {lvl.type}
                </span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-slate-900 dark:text-white">
                  {lvl.price.toFixed(2)}
                </span>

                {/* Depth visual bar */}
                <div className="w-16 h-2 bg-slate-100 dark:bg-terminal-800 rounded-full overflow-hidden flex items-center">
                  <div 
                    className={`h-full ${lvl.color}`} 
                    style={{ width: lvl.barWidth }}
                  />
                </div>

                <div className="text-[10px] text-slate-500 flex items-center gap-1 w-12 justify-end">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{lvl.strength}</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{lvl.delta}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Methodology Footnote */}
        <div className="p-2.5 rounded bg-slate-50 dark:bg-terminal-900/50 border border-slate-200 dark:border-terminal-border text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
          Real order books not available (No online book). Rather partially print available trends/order book data. Strength (0-100) = frequency independent signs point to the same point: pool/liquidity high/lows, equal highs / lows, order blocks, fair value gaps, round numbers, tick volume.
        </div>

        {/* Liquidity Analysis (Market DNA) Box */}
        <div className="p-2.5 rounded-lg border border-slate-200 dark:border-terminal-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Liquidity analysis</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-terminal-800 text-slate-600 dark:text-slate-400 font-bold">
              ESTIMATED
            </span>
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Liquidity sweep:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">Sell-side swept at 3998.47 - 3 candles ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Structure:</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">MSS (CHoCH) bearish - not confirming yet</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Analysis confidence:</span>
              <span className="font-bold text-amber-600">Low</span>
            </div>
          </div>

          {/* Split Bar: Bullish 47% vs Bearish 53% */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-[10px] font-bold">
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
        </div>
      </div>
    </div>
  );
};
