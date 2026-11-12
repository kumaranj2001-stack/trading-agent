'use client';

import React from 'react';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { AlertTriangle, Wifi, WifiOff } from 'lucide-react';

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
  latencyMs?: number;
  isInterrupted?: boolean;
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
  dateStr,
  bidPrice,
  askPrice,
  spreadPts = 17,
  isLive = true,
  latencyMs = 12,
  isInterrupted = false,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const cleanPair = pair.replace('/', '');
  const isPositive = changePercent >= 0;

  const isJpy = pair.includes('JPY');
  const isIndianIndex = pair === 'NIFTY 50' || pair === 'BANK NIFTY';
  const isIndianStock = pair === 'RELIANCE' || pair === 'TCS' || pair === 'HDFC BANK' || pair === 'INFY';
  const isGold = pair === 'XAU/USD';
  const isSilver = pair === 'XAG/USD';
  const isPlatinum = pair === 'XPT/USD';
  const isCopper = pair === 'COPPER';
  const isOil = pair === 'WTI_CRUDE' || pair === 'BRENT_CRUDE';
  const isRupee = pair.includes('/INR');

  let decimalCount = 5;
  if (isIndianIndex || isIndianStock || isGold || isPlatinum || isOil) decimalCount = 2;
  else if (isSilver || isJpy || isRupee) decimalCount = 3;
  else if (isCopper) decimalCount = 4;

  const fmt = (val: number) => {
    if (!Number.isFinite(val)) return '0.00';
    if (isIndianIndex) return `₹${val.toLocaleString('en-IN')}`;
    if (isGold || isSilver || isPlatinum || isOil) return `$${val.toFixed(decimalCount)}`;
    return val.toFixed(decimalCount);
  };

  const formattedDate = dateStr || new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + ' UTC';

  return (
    <div className={`w-full px-3 sm:px-4 py-1.5 border-b text-[11px] font-mono flex flex-wrap items-center justify-between gap-x-3 sm:gap-x-4 gap-y-1.5 select-none transition-colors min-w-0 ${
      isLight 
        ? 'bg-white border-slate-200 text-slate-700' 
        : 'bg-terminal-950 border-terminal-border text-slate-300'
    }`}>
      {/* Left: Ticker, State, OHLC */}
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
        <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider shrink-0">
          {cleanPair} · {timeframe} · <span className="font-normal text-slate-500">Live Tick</span>
        </span>

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          <span>O: <strong className="font-bold text-slate-900 dark:text-white">{fmt(open)}</strong></span>
          <span>H: <strong className="font-bold text-slate-900 dark:text-white">{fmt(high)}</strong></span>
          <span>L: <strong className="font-bold text-slate-900 dark:text-white">{fmt(low)}</strong></span>
          <span>
            C: <strong className="font-bold text-slate-900 dark:text-white">{fmt(close)}</strong>{' '}
            <span className={`font-bold ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
            </span>
          </span>
        </div>

        <span className="text-slate-400 hidden sm:inline">·</span>
        <span className="text-slate-500 hidden sm:inline">{formattedDate}</span>
      </div>

      {/* Right: Bid / Ask / Spread / Live Status */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 flex-wrap shrink-0">
        <div className="flex items-center gap-2">
          <span>Bid: <strong className="font-bold text-slate-900 dark:text-white">{fmt(bidPrice)}</strong></span>
          <span>Ask: <strong className="font-bold text-slate-900 dark:text-white">{fmt(askPrice)}</strong></span>
          <span className="text-slate-500">Spread: <strong className="text-slate-800 dark:text-slate-200">{spreadPts} pts</strong></span>
        </div>

        {/* Live / Interrupted Status Pill */}
        {isInterrupted ? (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold animate-pulse">
            <WifiOff className="w-3 h-3 text-amber-500" />
            <span>INTERRUPTED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LIVE ({latencyMs}ms)</span>
          </div>
        )}

        <span className="hidden md:inline text-[10px] text-slate-400 font-sans">
          Synchronized Terminal Feed
        </span>
      </div>
    </div>
  );
};
