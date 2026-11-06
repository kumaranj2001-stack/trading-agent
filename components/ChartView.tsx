'use client';

import React, { useState } from 'react';
import { Candle, CurrencyPair, SignalDirection, TechnicalIndicators, TimeFrame } from '@/lib/types';
import { BarChart2, Eye, EyeOff, LayoutGrid, MonitorPlay } from 'lucide-react';
import { calculateEMA, calculateRSI } from '@/lib/indicators';
import { OandaTradingViewChart } from './OandaTradingViewChart';

interface ChartViewProps {
  candles: Candle[];
  pair: CurrencyPair;
  timeframe: TimeFrame;
  indicators?: TechnicalIndicators;
  stopLoss?: number;
  takeProfit?: number;
  entryPrice?: number;
  signalBias?: SignalDirection;
}

export const ChartView: React.FC<ChartViewProps> = ({
  candles,
  pair,
  timeframe,
  indicators,
  stopLoss,
  takeProfit,
  entryPrice,
  signalBias,
}) => {
  const [chartMode, setChartMode] = useState<'ALGO_SWARM' | 'OANDA_LIVE'>('OANDA_LIVE');
  const [showIndicators, setShowIndicators] = useState(true);
  const [showRsi, setShowRsi] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const isJpy = pair.includes('JPY');
  const isIndianIndex = pair === 'NIFTY 50' || pair === 'BANK NIFTY';
  const isIndianStock = pair === 'RELIANCE' || pair === 'TCS' || pair === 'HDFC BANK' || pair === 'INFY';
  const decimalCount = (isIndianIndex || isIndianStock) ? 2 : (isJpy || pair.includes('/INR') ? 3 : 5);

  const closes = candles && candles.length > 0 ? candles.map(c => c.close) : [1.0];
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes, 14);

  const prices = candles.flatMap(c => [c.high, c.low]);
  if (stopLoss) prices.push(stopLoss);
  if (takeProfit) prices.push(takeProfit);

  const minPrice = Math.min(...prices) * 0.9995;
  const maxPrice = Math.max(...prices) * 1.0005;
  const priceRange = maxPrice - minPrice || 0.001;

  const chartHeight = 280;
  const rsiHeight = 80;
  const chartWidth = 720;
  const candleWidth = Math.max(4, Math.floor((chartWidth - 40) / Math.max(1, candles.length)) - 2);

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const getRsiY = (val: number) => {
    return rsiHeight - (val / 100) * rsiHeight;
  };

  const lastCandle = candles.length > 0 ? candles[candles.length - 1] : { open: 0, high: 0, low: 0, close: 0, timestamp: 0, time: '', volume: 0 };

  const buildLinePath = (values: number[]) => {
    return values
      .map((val, idx) => {
        const x = 20 + idx * (candleWidth + 2) + candleWidth / 2;
        const y = getY(val);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const buildRsiPath = (values: number[]) => {
    return values
      .map((val, idx) => {
        const x = 20 + idx * (candleWidth + 2) + candleWidth / 2;
        const y = getRsiY(val);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col gap-3 shadow-lg">
      {/* Chart Top Bar with Chart Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/60 pb-3 font-mono text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-wide">{pair}</span>
            <span className="px-2 py-0.5 rounded bg-terminal-800 text-slate-300 text-[11px] border border-terminal-border">
              {timeframe.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center bg-terminal-950 p-1 rounded-lg border border-terminal-border text-[11px]">
            <button
              onClick={() => setChartMode('OANDA_LIVE')}
              className={`px-2.5 py-0.5 rounded flex items-center gap-1.5 transition-colors ${
                chartMode === 'OANDA_LIVE'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3 h-3" />
              <span>OANDA / Live Feed</span>
            </button>
            <button
              onClick={() => setChartMode('ALGO_SWARM')}
              className={`px-2.5 py-0.5 rounded flex items-center gap-1.5 transition-colors ${
                chartMode === 'ALGO_SWARM'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Apex Swarm Matrix</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {signalBias && (
            <span className={`px-2.5 py-0.5 rounded font-bold text-[11px] border ${
              signalBias.includes('BUY') 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : signalBias.includes('SELL')
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            }`}>
              BIAS: {signalBias.replace('_', ' ')}
            </span>
          )}

          {chartMode === 'ALGO_SWARM' && (
            <>
              <button
                onClick={() => setShowIndicators(!showIndicators)}
                className="px-2 py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 text-[11px] flex items-center gap-1 border border-terminal-border transition-colors"
              >
                {showIndicators ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
                <span>EMA 20/50</span>
              </button>

              <button
                onClick={() => setShowRsi(!showRsi)}
                className="px-2 py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 text-[11px] flex items-center gap-1 border border-terminal-border transition-colors"
              >
                <BarChart2 className="w-3 h-3 text-purple-400" />
                <span>RSI (14)</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* View 1: Real OANDA / TradingView Live Advanced Chart */}
      {chartMode === 'OANDA_LIVE' && (
        <OandaTradingViewChart symbol={pair} height={460} />
      )}

      {/* View 2: Apex Swarm Algorithmic SVG Candlestick Chart */}
      {chartMode === 'ALGO_SWARM' && (
        <>
          <div className="relative w-full overflow-hidden bg-terminal-950/70 rounded-lg p-2 border border-terminal-border/40">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-64 select-none"
              preserveAspectRatio="none"
            >
              {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                const y = chartHeight * ratio;
                const priceLabel = (maxPrice - ratio * priceRange).toFixed(decimalCount);
                return (
                  <g key={ratio}>
                    <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#1f293d" strokeDasharray="3 3" strokeWidth="1" />
                    <text x={chartWidth - 65} y={y - 4} fill="#64748b" fontSize="9" fontFamily="monospace">
                      {priceLabel}
                    </text>
                  </g>
                );
              })}

              {/* Stop Loss Line */}
              {stopLoss && (
                <g>
                  <line
                    x1="0"
                    y1={getY(stopLoss)}
                    x2={chartWidth}
                    y2={getY(stopLoss)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <rect x="10" y={getY(stopLoss) - 16} width="125" height="15" fill="#7f1d1d" rx="2" opacity="0.9" />
                  <text x="14" y={getY(stopLoss) - 5} fill="#fca5a5" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    STOP LOSS: {stopLoss.toFixed(decimalCount)}
                  </text>
                </g>
              )}

              {/* Take Profit Line */}
              {takeProfit && (
                <g>
                  <line
                    x1="0"
                    y1={getY(takeProfit)}
                    x2={chartWidth}
                    y2={getY(takeProfit)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                  />
                  <rect x="10" y={getY(takeProfit) - 16} width="135" height="15" fill="#064e3b" rx="2" opacity="0.9" />
                  <text x="14" y={getY(takeProfit) - 5} fill="#6ee7b7" fontSize="9" fontFamily="monospace" fontWeight="bold">
                    TAKE PROFIT: {takeProfit.toFixed(decimalCount)}
                  </text>
                </g>
              )}

              {/* Candlesticks */}
              {candles.map((candle, idx) => {
                const x = 20 + idx * (candleWidth + 2);
                const highY = getY(candle.high);
                const lowY = getY(candle.low);
                const openY = getY(candle.open);
                const closeY = getY(candle.close);
                const isBullish = candle.close >= candle.open;
                const bodyY = Math.min(openY, closeY);
                const bodyHeight = Math.max(2, Math.abs(closeY - openY));
                const color = isBullish ? '#10b981' : '#f43f5e';

                return (
                  <g
                    key={candle.timestamp}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setHoveredCandle(candle)}
                    onMouseLeave={() => setHoveredCandle(null)}
                  >
                    <line x1={x + candleWidth / 2} y1={highY} x2={x + candleWidth / 2} y2={lowY} stroke={color} strokeWidth="1.2" />
                    <rect x={x} y={bodyY} width={candleWidth} height={bodyHeight} fill={color} rx="1" />
                  </g>
                );
              })}

              {showIndicators && (
                <>
                  <path d={buildLinePath(ema20)} fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.85" />
                  <path d={buildLinePath(ema50)} fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.85" />
                </>
              )}
            </svg>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1 px-2">
              <div className="flex items-center gap-4">
                {showIndicators && (
                  <>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-amber-400 inline-block"></span>
                      EMA (20)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-0.5 bg-purple-500 inline-block"></span>
                      EMA (50)
                    </span>
                  </>
                )}
              </div>
              <span>ALGORITHMIC SWARM ENGINE • {candles.length} BARS</span>
            </div>
          </div>

          {showRsi && (
            <div className="bg-terminal-950/70 border border-terminal-border/40 rounded-lg p-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="text-purple-400 font-bold">RSI (14): {indicators?.rsi ? indicators.rsi.toFixed(1) : '52.4'}</span>
                <span className="text-slate-400">70 (Overbought) / 30 (Oversold)</span>
              </div>
              <svg viewBox={`0 0 ${chartWidth} ${rsiHeight}`} className="w-full h-16 select-none" preserveAspectRatio="none">
                <line x1="0" y1={getRsiY(70)} x2={chartWidth} y2={getRsiY(70)} stroke="#ef4444" strokeDasharray="2 2" strokeWidth="1" opacity="0.6" />
                <line x1="0" y1={getRsiY(50)} x2={chartWidth} y2={getRsiY(50)} stroke="#475569" strokeDasharray="2 2" strokeWidth="1" opacity="0.4" />
                <line x1="0" y1={getRsiY(30)} x2={chartWidth} y2={getRsiY(30)} stroke="#10b981" strokeDasharray="2 2" strokeWidth="1" opacity="0.6" />
                <path d={buildRsiPath(rsi)} fill="none" stroke="#a855f7" strokeWidth="1.5" />
              </svg>
            </div>
          )}
        </>
      )}
    </div>
  );
};
