'use client';

import React, { useEffect, useRef, memo } from 'react';
import { CurrencyPair } from '@/lib/types';
import { OANDA_TRADINGVIEW_MAP } from '@/lib/marketData';

interface OandaTradingViewChartProps {
  symbol: CurrencyPair;
  theme?: 'dark' | 'light';
  height?: number;
}

function OandaTradingViewChartComponent({
  symbol,
  theme = 'dark',
  height = 480,
}: OandaTradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const tvSymbol = OANDA_TRADINGVIEW_MAP[symbol] || 'OANDA:EURUSD';

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: tvSymbol,
          interval: '60',
          timezone: 'Asia/Kolkata',
          theme: 'dark',
          style: '1',
          locale: 'en',
          toolbar_bg: '#090d16',
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: containerRef.current.id,
          hide_side_toolbar: false,
          studies: [
            'RSI@tv-basicstudies',
            'MASimple@tv-basicstudies',
            'BollingerBands@tv-basicstudies'
          ],
        });
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, theme]);

  return (
    <div className="w-full bg-terminal-950 rounded-xl overflow-hidden border border-terminal-border/80 shadow-xl">
      <div className="flex items-center justify-between px-3 py-1.5 bg-terminal-900 border-b border-terminal-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-white font-bold">OANDA / TRADINGVIEW LIVE INSTITUTIONAL CHART</span>
          <span className="text-slate-400 text-[11px]">• SYMBOL: {tvSymbol}</span>
        </div>
        <span className="text-[10px] text-cyan-400 uppercase tracking-widest">
          REAL-TIME STREAMING
        </span>
      </div>
      <div
        id={`tv-widget-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`}
        ref={containerRef}
        style={{ height: `${height}px` }}
        className="w-full"
      />
    </div>
  );
}

export const OandaTradingViewChart = memo(OandaTradingViewChartComponent);
