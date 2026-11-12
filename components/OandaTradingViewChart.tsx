'use client';

import React, { useEffect, useRef, useState, memo } from 'react';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { OANDA_TRADINGVIEW_MAP } from '@/lib/marketData';
import { AlertCircle, RefreshCw } from 'lucide-react';

export interface OandaTradingViewChartProps {
  symbol: CurrencyPair;
  timeframe?: TimeFrame | string;
  theme?: 'dark' | 'light';
  height?: number;
  containerIdPrefix?: string;
}

const getTimeframeInterval = (tf?: string): string => {
  if (!tf) return '60';
  const lower = tf.toLowerCase();
  if (lower === '1m') return '1';
  if (lower === '5m') return '5';
  if (lower === '15m') return '15';
  if (lower === '30m') return '30';
  if (lower === '1h') return '60';
  if (lower === '4h') return '240';
  if (lower === '1d') return 'D';
  if (lower === '1w') return 'W';
  return '60';
};

function OandaTradingViewChartComponent({
  symbol,
  timeframe = '1h',
  theme = 'dark',
  height = 460,
  containerIdPrefix = 'oanda',
}: OandaTradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [retryNonce, setRetryNonce] = useState(0);
  const tvSymbol = OANDA_TRADINGVIEW_MAP[symbol] || 'OANDA:EURUSD';
  const interval = getTimeframeInterval(timeframe);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setLoadError(false);

    if (!containerRef.current) return;

    // Clear previous widget safely
    containerRef.current.innerHTML = '';

    const initWidget = () => {
      if (!isMounted || !containerRef.current) return;
      try {
        if (typeof (window as any).TradingView !== 'undefined') {
          new (window as any).TradingView.widget({
            autosize: true,
            symbol: tvSymbol,
            interval: interval,
            timezone: 'Asia/Kolkata',
            theme: theme === 'light' ? 'light' : 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: theme === 'light' ? '#f8fafc' : '#090d16',
            enable_publishing: false,
            allow_symbol_change: true,
            container_id: containerRef.current.id,
            hide_side_toolbar: false,
            studies: [
              'RSI@tv-basicstudies',
              'MASimple@tv-basicstudies',
              'BollingerBands@tv-basicstudies',
            ],
          });
          setIsLoading(false);
        } else {
          setLoadError(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setLoadError(true);
          setIsLoading(false);
        }
      }
    };

    // Check if script is already present
    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript && typeof (window as any).TradingView !== 'undefined') {
      initWidget();
    } else {
      const script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = () => {
        initWidget();
      };
      script.onerror = () => {
        if (isMounted) {
          setLoadError(true);
          setIsLoading(false);
        }
      };
      document.head.appendChild(script);
    }

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [tvSymbol, theme, interval, retryNonce]);

  const sanitizedId = `tv_widget_${containerIdPrefix}_${tvSymbol.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const handleRetry = () => {
    setLoadError(false);
    setIsLoading(true);
    setRetryNonce(prev => prev + 1);
  };

  const isEmbeddedVision = containerIdPrefix === 'vision';

  return (
    <div className={`w-full overflow-hidden ${
      isEmbeddedVision ? 'bg-transparent' : 'bg-terminal-950 rounded-xl border border-terminal-border/80 shadow-xl'
    }`}>
      {!isEmbeddedVision && (
        <div className="flex flex-wrap items-center justify-between px-3 py-1.5 bg-terminal-900 border-b border-terminal-border text-xs font-mono gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-white font-bold text-[11px] sm:text-xs">OANDA / TRADINGVIEW LIVE FEED</span>
            <span className="text-slate-400 text-[10px] sm:text-[11px] hidden xs:inline">• {tvSymbol}</span>
            <span className="px-1.5 py-0.2 rounded bg-terminal-800 text-cyan-300 text-[10px] font-bold border border-terminal-border">
              {timeframe.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[9px] sm:text-[10px] text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              STREAMING
            </span>
          </div>
        </div>
      )}

      {loadError ? (
        <div className="h-72 sm:h-[460px] flex flex-col items-center justify-center p-6 text-center text-xs font-mono text-slate-400 space-y-3">
          <AlertCircle className="w-8 h-8 text-amber-400" />
          <p className="max-w-md text-slate-300">
            External TradingView widget is unable to connect (offline or blocked by ad-blocker). 
            You can still switch to the algorithmic <strong className="text-indigo-400">Apex Swarm Matrix</strong> chart above.
          </p>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-cyan-400 border border-terminal-border flex items-center gap-1.5 font-bold transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Loading Widget</span>
          </button>
        </div>
      ) : (
        <div
          id={sanitizedId}
          ref={containerRef}
          style={{ height: `${height}px` }}
          className="w-full min-h-[320px] sm:min-h-[460px]"
        />
      )}
    </div>
  );
}

export const OandaTradingViewChart = memo(OandaTradingViewChartComponent);
