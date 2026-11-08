'use client';

import React, { useState } from 'react';
import { 
  Candle, 
  CurrencyPair, 
  SignalDirection, 
  TechnicalIndicators, 
  TimeFrame,
  AISignalOverlayItem,
  AIMarketAnalysisResult 
} from '@/lib/types';
import { 
  BarChart2, 
  Eye, 
  EyeOff, 
  LayoutGrid, 
  MonitorPlay,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
} from 'lucide-react';
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
  aiSignals?: AISignalOverlayItem[];
  aiAnalysis?: AIMarketAnalysisResult | null;
  onOpenAIMarketAnalysis?: () => void;
}

export const ChartView: React.FC<ChartViewProps> = ({
  candles = [],
  pair,
  timeframe,
  indicators,
  stopLoss,
  takeProfit,
  entryPrice,
  signalBias,
  aiSignals = [],
  aiAnalysis,
  onOpenAIMarketAnalysis,
}) => {
  const [chartMode, setChartMode] = useState<'ALGO_SWARM' | 'OANDA_LIVE'>('OANDA_LIVE');
  const [showIndicators, setShowIndicators] = useState(true);
  const [showRsi, setShowRsi] = useState(true);
  const [showAiOverlay, setShowAiOverlay] = useState(true);
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);

  const isJpy = pair.includes('JPY');
  const isIndianIndex = pair === 'NIFTY 50' || pair === 'BANK NIFTY';
  const isIndianStock = pair === 'RELIANCE' || pair === 'TCS' || pair === 'HDFC BANK' || pair === 'INFY';
  const decimalCount = (isIndianIndex || isIndianStock) ? 2 : (isJpy || pair.includes('/INR') ? 3 : 5);

  const safeCandles = candles && candles.length > 0 ? candles : [];
  const closes = safeCandles.length > 0 ? safeCandles.map(c => c.close) : [1.0];
  const ema20 = calculateEMA(closes, 20);
  const ema50 = calculateEMA(closes, 50);
  const rsi = calculateRSI(closes, 14);

  const prices = safeCandles.flatMap(c => [c.high, c.low]);
  if (stopLoss && Number.isFinite(stopLoss)) prices.push(stopLoss);
  if (takeProfit && Number.isFinite(takeProfit)) prices.push(takeProfit);

  // Safe min/max to prevent Infinity if candles is empty
  const safePrices = prices.length > 0 ? prices : [1.0, 1.01];
  const minPrice = Math.min(...safePrices) * 0.9995;
  const maxPrice = Math.max(...safePrices) * 1.0005;
  const priceRange = Math.max(0.00001, maxPrice - minPrice);

  const chartHeight = 280;
  const rsiHeight = 80;
  const chartWidth = 720;
  const candleCount = Math.max(1, safeCandles.length);
  const candleWidth = Math.max(3, Math.floor((chartWidth - 40) / candleCount) - 2);

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const getRsiY = (val: number) => {
    return rsiHeight - (val / 100) * rsiHeight;
  };

  const buildLinePath = (values: number[]) => {
    if (!values || values.length === 0) return '';
    return values
      .map((val, idx) => {
        const x = 20 + idx * (candleWidth + 2) + candleWidth / 2;
        const y = getY(val);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  const buildRsiPath = (values: number[]) => {
    if (!values || values.length === 0) return '';
    return values
      .map((val, idx) => {
        const x = 20 + idx * (candleWidth + 2) + candleWidth / 2;
        const y = getRsiY(val);
        return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  };

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-3 sm:p-4 flex flex-col gap-3 shadow-lg">
      {/* Chart Top Bar with Chart Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-terminal-border/60 pb-3 font-mono text-xs">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-white tracking-wide">{pair}</span>
            <span className="px-2 py-0.5 rounded bg-terminal-800 text-slate-300 text-[10px] sm:text-[11px] border border-terminal-border">
              {timeframe.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center bg-terminal-950 p-0.5 rounded-lg border border-terminal-border text-[11px]">
            <button
              onClick={() => setChartMode('OANDA_LIVE')}
              className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 sm:gap-1.5 transition-colors ${
                chartMode === 'OANDA_LIVE'
                  ? 'bg-cyan-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3 h-3" />
              <span>Live Chart</span>
            </button>
            <button
              onClick={() => setChartMode('ALGO_SWARM')}
              className={`px-2 sm:px-2.5 py-1 rounded flex items-center gap-1 sm:gap-1.5 transition-colors ${
                chartMode === 'ALGO_SWARM'
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Swarm Matrix</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Signals (1,050+ Strategies) Overlay Toggle */}
          <button
            onClick={() => setShowAiOverlay(!showAiOverlay)}
            className={`px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-[11px] flex items-center gap-1 border transition-colors ${
              showAiOverlay
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/40 font-bold shadow-sm shadow-fuchsia-500/20'
                : 'bg-terminal-800 text-slate-400 border-terminal-border hover:text-slate-200'
            }`}
            title="Toggle Real-Time AI Buy/Sell Signal Arrows Overlay (1,050+ Strategies)"
          >
            <Sparkles className={`w-3 h-3 ${showAiOverlay ? 'text-fuchsia-400 animate-pulse' : 'text-slate-400'}`} />
            <span>AI Signals {aiSignals && aiSignals.length > 0 ? `(${aiSignals.length})` : ''}</span>
          </button>

          {onOpenAIMarketAnalysis && (
            <button
              onClick={onOpenAIMarketAnalysis}
              className="px-2 py-0.5 sm:py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 text-[10px] sm:text-[11px] flex items-center gap-1 border border-terminal-border transition-colors"
              title="Open AI Market Analysis Console"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              <span className="hidden sm:inline">AI Analysis</span>
            </button>
          )}

          {signalBias && (
            <span className={`px-2 py-0.5 rounded font-bold text-[10px] sm:text-[11px] border ${
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
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowIndicators(!showIndicators)}
                className="px-2 py-0.5 sm:py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 text-[10px] sm:text-[11px] flex items-center gap-1 border border-terminal-border transition-colors"
              >
                {showIndicators ? <Eye className="w-3 h-3 text-cyan-400" /> : <EyeOff className="w-3 h-3" />}
                <span>EMA</span>
              </button>

              <button
                onClick={() => setShowRsi(!showRsi)}
                className="px-2 py-0.5 sm:py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 text-[10px] sm:text-[11px] flex items-center gap-1 border border-terminal-border transition-colors"
              >
                <BarChart2 className="w-3 h-3 text-purple-400" />
                <span>RSI</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* View 1: Real OANDA / TradingView Live Advanced Chart */}
      {chartMode === 'OANDA_LIVE' && (
        <div className="relative w-full overflow-hidden rounded-lg">
          <OandaTradingViewChart symbol={pair} height={460} />

          {/* Dynamic AI Market Analysis Signal Overlay HUD */}
          {showAiOverlay && aiAnalysis && (
            <div className="absolute top-3 right-3 z-10 pointer-events-none max-w-[280px] sm:max-w-xs transition-all">
              <div className="pointer-events-auto bg-terminal-950/90 backdrop-blur-md border border-fuchsia-500/40 rounded-xl p-2.5 shadow-xl shadow-fuchsia-950/40 text-xs font-mono space-y-1.5">
                <div className="flex items-center justify-between gap-2 border-b border-terminal-border/60 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
                    <span className="font-bold text-white tracking-wide text-[11px]">AI SIGNAL HUD</span>
                    <span className="px-1.5 py-0.2 rounded bg-fuchsia-500/20 text-fuchsia-300 text-[9px] border border-fuchsia-500/30">
                      1,050+ AI
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                    {aiAnalysis.latencyMs}ms
                  </span>
                </div>

                {/* Primary Signal Pill */}
                {aiAnalysis.activeSignals.length > 0 && (
                  <div className={`p-1.5 rounded-lg border flex items-center justify-between gap-1.5 ${
                    aiAnalysis.activeSignals[0].type === 'BUY'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      {aiAnalysis.activeSignals[0].type === 'BUY' ? (
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      )}
                      <span className="font-extrabold text-[11px]">
                        {aiAnalysis.activeSignals[0].type} SIGNAL @ {aiAnalysis.activeSignals[0].price.toFixed(decimalCount)}
                      </span>
                    </div>
                    <span className="font-bold text-[10px] px-1.5 py-0.5 rounded bg-terminal-900 border border-current">
                      {aiAnalysis.activeSignals[0].confidence}%
                    </span>
                  </div>
                )}

                {/* Matched Strategy Summary */}
                <div className="text-[10px] text-slate-300 space-y-0.5 pt-0.5">
                  <div className="truncate text-fuchsia-300 font-semibold" title={aiAnalysis.topMatchedStrategies[0]?.name}>
                    {aiAnalysis.topMatchedStrategies[0]?.name || 'Institutional Order Block Entry'}
                  </div>
                  <div className="flex items-center justify-between text-slate-400 pt-1">
                    <span>Order Flow: <strong className={aiAnalysis.orderFlowPressure.deltaStatus.includes('BULL') ? 'text-emerald-400' : 'text-rose-400'}>
                      {aiAnalysis.orderFlowPressure.buyVolumeDelta}% Buy
                    </strong></span>
                    {onOpenAIMarketAnalysis && (
                      <button
                        onClick={onOpenAIMarketAnalysis}
                        className="text-cyan-400 hover:text-cyan-300 underline font-semibold flex items-center gap-0.5"
                      >
                        Details &rarr;
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View 2: Apex Swarm Algorithmic SVG Candlestick Chart */}
      {chartMode === 'ALGO_SWARM' && (
        <>
          <div className="relative w-full overflow-hidden bg-terminal-950/70 rounded-lg p-2 border border-terminal-border/40">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-56 sm:h-64 select-none"
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
              {stopLoss && Number.isFinite(stopLoss) && (
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
              {takeProfit && Number.isFinite(takeProfit) && (
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
              {safeCandles.map((candle, idx) => {
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
                    key={candle.timestamp || idx}
                    className="cursor-pointer transition-opacity hover:opacity-80"
                    onMouseEnter={() => setHoveredCandle(candle)}
                    onMouseLeave={() => setHoveredCandle(null)}
                  >
                    <line x1={x + candleWidth / 2} y1={highY} x2={x + candleWidth / 2} y2={lowY} stroke={color} strokeWidth="1.2" />
                    <rect x={x} y={bodyY} width={candleWidth} height={bodyHeight} fill={color} rx="1" />
                  </g>
                );
              })}

              {/* Actionable Visual Buy & Sell Signal Arrows Overlay (1,050+ Strategies) */}
              {showAiOverlay && aiSignals && aiSignals.map((sig) => {
                let idx = sig.candleIndex;
                if (idx === undefined || idx < 0 || idx >= safeCandles.length) {
                  idx = safeCandles.findIndex((c) => c.timestamp === sig.timestamp);
                  if (idx === -1) idx = safeCandles.length - 1;
                }
                const candle = safeCandles[idx];
                if (!candle) return null;

                const x = 20 + idx * (candleWidth + 2) + candleWidth / 2;
                const isBuy = sig.type === 'BUY';

                if (isBuy) {
                  const arrowTipY = getY(candle.low) + 5;
                  const arrowBaseY = arrowTipY + 8;
                  return (
                    <g key={sig.id} className="cursor-pointer group select-none">
                      <title>{`${sig.type} SIGNAL: ${sig.strategyName} (${sig.confidence}% Conf, ${sig.expectedWinRate}% WR)`}</title>
                      <circle cx={x} cy={arrowTipY + 4} r="8" fill="#10b981" opacity="0.25" className="animate-pulse" />
                      <polygon
                        points={`${x},${arrowTipY} ${x - 5},${arrowBaseY} ${x + 5},${arrowBaseY}`}
                        fill="#10b981"
                        stroke="#064e3b"
                        strokeWidth="1"
                      />
                      <rect
                        x={x - 20}
                        y={arrowBaseY + 2}
                        width="40"
                        height="12"
                        rx="2"
                        fill="#064e3b"
                        stroke="#10b981"
                        strokeWidth="0.8"
                        opacity="0.95"
                      />
                      <text
                        x={x}
                        y={arrowBaseY + 11}
                        fill="#6ee7b7"
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ▲ BUY {sig.confidence}%
                      </text>
                    </g>
                  );
                } else {
                  const arrowTipY = getY(candle.high) - 5;
                  const arrowBaseY = arrowTipY - 8;
                  return (
                    <g key={sig.id} className="cursor-pointer group select-none">
                      <title>{`${sig.type} SIGNAL: ${sig.strategyName} (${sig.confidence}% Conf, ${sig.expectedWinRate}% WR)`}</title>
                      <circle cx={x} cy={arrowTipY - 4} r="8" fill="#f43f5e" opacity="0.25" className="animate-pulse" />
                      <polygon
                        points={`${x},${arrowTipY} ${x - 5},${arrowBaseY} ${x + 5},${arrowBaseY}`}
                        fill="#f43f5e"
                        stroke="#7f1d1d"
                        strokeWidth="1"
                      />
                      <rect
                        x={x - 20}
                        y={arrowBaseY - 14}
                        width="40"
                        height="12"
                        rx="2"
                        fill="#7f1d1d"
                        stroke="#f43f5e"
                        strokeWidth="0.8"
                        opacity="0.95"
                      />
                      <text
                        x={x}
                        y={arrowBaseY - 5}
                        fill="#fca5a5"
                        fontSize="7.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ▼ SELL {sig.confidence}%
                      </text>
                    </g>
                  );
                }
              })}

              {showIndicators && (
                <>
                  <path d={buildLinePath(ema20)} fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.85" />
                  <path d={buildLinePath(ema50)} fill="none" stroke="#8b5cf6" strokeWidth="1.5" opacity="0.85" />
                </>
              )}
            </svg>

            <div className="flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 mt-1 px-1 gap-2">
              <div className="flex items-center gap-3">
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
              <span>ALGORITHMIC SWARM • {safeCandles.length} BARS</span>
            </div>
          </div>

          {showRsi && (
            <div className="bg-terminal-950/70 border border-terminal-border/40 rounded-lg p-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="text-purple-400 font-bold">RSI (14): {indicators?.rsi ? indicators.rsi.toFixed(1) : '52.4'}</span>
                <span className="text-slate-400">70 (Overbought) / 30 (Oversold)</span>
              </div>
              <svg viewBox={`0 0 ${chartWidth} ${rsiHeight}`} className="w-full h-14 sm:h-16 select-none" preserveAspectRatio="none">
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
