'use client';

import React from 'react';
import { CurrencyPair, TimeFrame } from '@/lib/types';

export interface InfinityVisionOhlcBarProps {
  pair: CurrencyPair;
  timeframe: string;
  open: number;
  high: number;
  low: number;
  close: number;
  changePercent: number;
  dateStr?: string;
  bidPrice: number;
  askPrice: number;
  spreadPts: number;
  isLive?: boolean;
  theme?: 'light' | 'dark';
}

export const InfinityVisionOhlcBar: React.FC<InfinityVisionOhlcBarProps> = ({
  pair,
  timeframe,
  open,
  high,
  low,
  close,
  changePercent,
  dateStr = '11 Nov 22:45',
  bidPrice,
  askPrice,
  spreadPts = 17,
  isLive = true,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const cleanPair = pair.replace('/', '');
  const isPositive = changePercent >= 0;

  return (
    <div className={`w-full px-3.5 py-1.5 border-b text-[11px] font-mono flex flex-wrap items-center justify-between gap-x-4 gap-y-1 select-none transition-colors ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-700' 
        : 'bg-terminal-950 border-terminal-border text-slate-300'
    }`}>
      {/* Left: Ticker, State, OHLC */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
          {cleanPair} · {timeframe} · <span className="font-normal text-slate-500">Forming</span>
        </span>

        <div className="flex items-center gap-2">
          <span>O: <strong className="font-bold text-slate-900 dark:text-white">{open.toFixed(2)}</strong></span>
          <span>H: <strong className="font-bold text-slate-900 dark:text-white">{high.toFixed(2)}</strong></span>
          <span>L: <strong className="font-bold text-slate-900 dark:text-white">{low.toFixed(2)}</strong></span>
          <span>
            C: <strong className="font-bold text-slate-900 dark:text-white">{close.toFixed(2)}</strong>{' '}
            <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </span>
        </div>

        <span className="text-slate-400">·</span>
        <span className="text-slate-500">{dateStr}</span>
      </div>

      {/* Right: Bid / Ask / Spread / Live Status */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <span>Bid: <strong className="font-bold text-slate-900 dark:text-white">{bidPrice.toFixed(2)}</strong></span>
          <span>Ask: <strong className="font-bold text-slate-900 dark:text-white">{askPrice.toFixed(2)}</strong></span>
          <span className="text-slate-500">Spread: <strong className="text-slate-800 dark:text-slate-200">{spreadPts} pts</strong></span>
        </div>

        {/* Live Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>LIVE</span>
        </div>

        <span className="hidden md:inline text-[10px] text-slate-400 font-sans">
          Live feed - Live - Infinity Vision
        </span>
      </div>
    </div>
  );
};
