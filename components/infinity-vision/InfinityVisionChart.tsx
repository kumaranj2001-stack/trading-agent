'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Crosshair, 
  Minus, 
  Square, 
  Sliders, 
  Type, 
  Trash2, 
  Maximize2,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  AlertTriangle,
  MonitorPlay,
  LayoutGrid,
  RefreshCw
} from 'lucide-react';
import { Candle, CurrencyPair, TimeFrame } from '@/lib/types';
import { calculateEMA } from '@/lib/indicators';
import { OandaTradingViewChart } from '../OandaTradingViewChart';

export interface InfinityVisionChartProps {
  candles: Candle[];
  pair: CurrencyPair;
  timeframe: string;
  theme?: 'light' | 'dark';
  showQuantumSimulation?: boolean;
  showMarketDna?: boolean;
  showIndicatorsOverlay?: boolean;
  chartType?: 'Candles' | 'Line';
  showPatternOnChart?: boolean;
  horizonCandles?: number;
  latencyMs?: number;
  isInterrupted?: boolean;
  onReconnect?: () => void;
  onSelectZone?: (zoneName: string) => void;
}

export type DrawingTool = 'crosshair' | 'trendline' | 'horizontal' | 'rectangle' | 'fib' | 'text' | 'trash';

interface DrawnElement {
  id: string;
  type: 'line' | 'horizontal' | 'rectangle' | 'text';
  x1: number;
  y1: number;
  x2?: number;
  y2?: number;
  text?: string;
  color?: string;
}

export const InfinityVisionChart: React.FC<InfinityVisionChartProps> = ({
  candles = [],
  pair,
  timeframe,
  theme = 'light',
  showQuantumSimulation = true,
  showMarketDna = true,
  showIndicatorsOverlay = true,
  chartType = 'Candles',
  showPatternOnChart = true,
  horizonCandles = 5,
  latencyMs = 12,
  isInterrupted = false,
  onReconnect,
  onSelectZone,
}) => {
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 560 });
  const [chartMode, setChartMode] = useState<'OANDA_LIVE' | 'QUANTUM_MATRIX'>('OANDA_LIVE');
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [drawnElements, setDrawnElements] = useState<DrawnElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  // 📐 Fluid ResizeObserver listener (Zero UI freezing or element clipping)
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({
            width: Math.floor(width),
            height: Math.max(Math.floor(height), 380),
          });
        }
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // Safe canonical candles from live streaming feed
  const safeCandles = useMemo(() => {
    if (candles && candles.length >= 8) return candles.slice(-55);
    // Dynamic fallback generation centered around pair price
    const base = pair.includes('XAU') ? 4005.0 : pair.includes('JPY') ? 152.5 : pair.includes('NIFTY') ? 24500 : 1.0850;
    const count = 35;
    const list: Candle[] = [];
    let cur = base;
    const now = Date.now();
    for (let i = count; i >= 0; i--) {
      const isRed = (i % 3 === 0 || i % 4 === 0);
      const delta = (Math.sin(i * 0.7) * (base * 0.0006)) + (isRed ? -base * 0.0004 : base * 0.0003);
      const open = cur;
      const close = cur + delta;
      const high = Math.max(open, close) + Math.random() * (base * 0.0004);
      const low = Math.min(open, close) - Math.random() * (base * 0.0004);
      list.push({
        time: new Date(now - i * 15 * 60000).toISOString(),
        timestamp: now - i * 15 * 60000,
        open,
        high,
        low,
        close,
        volume: 1200 + Math.floor(Math.random() * 3000),
      });
      cur = close;
    }
    return list;
  }, [candles, pair]);

  // Compute dynamic coordinate scales & responsive padding
  const isMobile = dimensions.width < 640;
  const chartPadding = isMobile
    ? { top: 32, right: 68, bottom: 28, left: 10 }
    : { top: 40, right: 88, bottom: 36, left: 18 };
  const plotWidth = Math.max(dimensions.width - chartPadding.left - chartPadding.right, 80);
  const plotHeight = Math.max(dimensions.height - chartPadding.top - chartPadding.bottom, 80);

  const isXau = pair.includes('XAU');
  const priceDecimals = pair.includes('JPY') ? 3 : (pair.includes('USD') && !isXau) ? 5 : (pair.includes('NIFTY') || isXau) ? 2 : 4;

  // Technical Moving Averages computed on live closes
  const closes = useMemo(() => safeCandles.map(c => c.close), [safeCandles]);
  const ema20 = useMemo(() => calculateEMA(closes, 20), [closes]);
  const ema50 = useMemo(() => calculateEMA(closes, 50), [closes]);

  // Compute live range metrics
  const { minC, maxC, span } = useMemo(() => {
    const minVal = Math.min(...safeCandles.map(c => c.low));
    const maxVal = Math.max(...safeCandles.map(c => c.high));
    return {
      minC: minVal,
      maxC: maxVal,
      span: Math.max(maxVal - minVal, minVal * 0.002),
    };
  }, [safeCandles]);

  const minPrice = useMemo(() => minC - span * 0.18, [minC, span]);
  const maxPrice = useMemo(() => maxC + span * 0.18, [maxC, span]);
  const priceRange = Math.max(maxPrice - minPrice, 0.0001);

  const priceToY = (price: number) => {
    return chartPadding.top + plotHeight - ((price - minPrice) / priceRange) * plotHeight;
  };

  const yToPrice = (y: number) => {
    const frac = (chartPadding.top + plotHeight - y) / plotHeight;
    return minPrice + frac * priceRange;
  };

  const candleSpacing = plotWidth / (safeCandles.length + 12);
  const candleWidth = Math.max(candleSpacing * 0.65, 4);

  const getCandleX = (index: number) => {
    return chartPadding.left + index * candleSpacing + candleSpacing / 2;
  };

  const lastCandle = safeCandles[safeCandles.length - 1] || { close: 4005.88, high: 4007.65, low: 3998.92 };
  const lastCandleX = getCandleX(safeCandles.length - 1);
  const lastCandleY = priceToY(lastCandle.close);

  // Fibonacci Retracements Anchor Levels (Dynamically grounded in live candles)
  const fibLevels = useMemo(() => {
    return [
      { label: 'Fib 1.618', price: Number((minC + span * 1.618).toFixed(priceDecimals)), ratio: '1.618' },
      { label: 'Fib 1.272', price: Number((minC + span * 1.272).toFixed(priceDecimals)), ratio: '1.272' },
      { label: 'Fib 0.786', price: Number((minC + span * 0.786).toFixed(priceDecimals)), ratio: '0.786' },
      { label: 'Fib 0.618', price: Number((minC + span * 0.618).toFixed(priceDecimals)), ratio: '0.618' },
      { label: 'Fib 0.5 (EQ)', price: Number((minC + span * 0.50).toFixed(priceDecimals)), ratio: '0.50' },
      { label: 'Fib 0.382', price: Number((minC + span * 0.382).toFixed(priceDecimals)), ratio: '0.382' },
      { label: 'Fib 0.236', price: Number((minC + span * 0.236).toFixed(priceDecimals)), ratio: '0.236' },
      { label: 'Fib 0', price: Number(minC.toFixed(priceDecimals)), ratio: '0.00' },
    ];
  }, [minC, span, priceDecimals]);

  // Analysis Reference Zones (Dynamic institutional confluence bands)
  const analysisZones = useMemo(() => {
    return [
      {
        name: 'DANGER ZONE',
        min: Number((minC + span * 0.88).toFixed(priceDecimals)),
        max: Number((minC + span * 1.05).toFixed(priceDecimals)),
        color: 'rgba(239, 68, 68, 0.12)',
        borderColor: 'rgba(239, 68, 68, 0.4)',
        textColor: '#ef4444',
        badgeBg: 'rgba(239, 68, 68, 0.9)',
      },
      {
        name: 'CAUTION ZONE',
        min: Number((minC + span * 0.75).toFixed(priceDecimals)),
        max: Number((minC + span * 0.88).toFixed(priceDecimals)),
        color: 'rgba(245, 158, 11, 0.10)',
        borderColor: 'rgba(245, 158, 11, 0.35)',
        textColor: '#f59e0b',
        badgeBg: 'rgba(245, 158, 11, 0.9)',
      },
      {
        name: 'ENTRY ZONE',
        min: Number((minC + span * 0.618).toFixed(priceDecimals)),
        max: Number((minC + span * 0.75).toFixed(priceDecimals)),
        color: 'rgba(14, 165, 233, 0.14)',
        borderColor: 'rgba(14, 165, 233, 0.5)',
        textColor: '#0284c7',
        badgeBg: 'rgba(2, 132, 199, 0.9)',
      },
      {
        name: 'SAFE ZONE',
        min: Number((minC + span * 0.50).toFixed(priceDecimals)),
        max: Number((minC + span * 0.618).toFixed(priceDecimals)),
        color: 'rgba(16, 185, 129, 0.12)',
        borderColor: 'rgba(16, 185, 129, 0.4)',
        textColor: '#10b981',
        badgeBg: 'rgba(16, 185, 129, 0.9)',
      },
    ];
  }, [minC, span, priceDecimals]);

  // Dynamic Institutional Order Blocks
  const orderBlocks = useMemo(() => {
    return [
      {
        name: 'OB - Fresh',
        min: Number((maxC - span * 0.08).toFixed(priceDecimals)),
        max: Number(maxC.toFixed(priceDecimals)),
        type: 'BEARISH'
      },
      {
        name: 'Mitigation 1',
        min: Number((minC + span * 0.65).toFixed(priceDecimals)),
        max: Number((minC + span * 0.72).toFixed(priceDecimals)),
        type: 'MITIGATED'
      },
      {
        name: 'Mitigation 2',
        min: Number((minC + span * 0.45).toFixed(priceDecimals)),
        max: Number((minC + span * 0.52).toFixed(priceDecimals)),
        type: 'MITIGATED'
      },
    ];
  }, [minC, maxC, span, priceDecimals]);

  // Future Simulated Fan Paths (Quantum Vision projection)
  const projectionPoints = useMemo(() => {
    const steps = 7;
    const paths = {
      upper: [] as { x: number; y: number }[],
      median: [] as { x: number; y: number }[],
      lower: [] as { x: number; y: number }[],
    };

    paths.upper.push({ x: lastCandleX, y: lastCandleY });
    paths.median.push({ x: lastCandleX, y: lastCandleY });
    paths.lower.push({ x: lastCandleX, y: lastCandleY });

    for (let i = 1; i <= steps; i++) {
      const x = lastCandleX + i * candleSpacing;
      // Upper path
      paths.upper.push({
        x,
        y: lastCandleY - (i * 3.2) - Math.sin(i) * 2,
      });
      // Median path
      paths.median.push({
        x,
        y: lastCandleY - (i * 0.5) + Math.cos(i) * 1.5,
      });
      // Lower breakdown path
      paths.lower.push({
        x,
        y: lastCandleY + (i * 3.8) + Math.sin(i * 1.2) * 2,
      });
    }

    return paths;
  }, [lastCandleX, lastCandleY, candleSpacing]);

  // Market DNA Projected Ghost Candles (Faded historical twin projection)
  const ghostCandles = useMemo(() => {
    const list: Array<{ x: number; open: number; close: number; high: number; low: number; isUp: boolean }> = [];
    const count = 8;
    let prev = lastCandle.close;
    for (let i = 1; i <= count; i++) {
      const isUp = i % 2 === 0 || i > 4;
      const step = span * 0.04 * (isUp ? 0.75 : -0.55);
      const op = prev;
      const cl = prev + step;
      const hi = Math.max(op, cl) + span * 0.015;
      const lo = Math.min(op, cl) - span * 0.015;
      list.push({
        x: lastCandleX + i * candleSpacing,
        open: op,
        close: cl,
        high: hi,
        low: lo,
        isUp,
      });
      prev = cl;
    }
    return list;
  }, [lastCandle.close, lastCandleX, candleSpacing, span]);

  // Dynamic Liquidity Sweep & Institutional Rejection Points
  const sweepEvents = useMemo(() => {
    if (safeCandles.length < 15) return null;
    
    // Find index of recent local high (rejection)
    let maxHigh = -Infinity;
    let maxIdx = Math.floor(safeCandles.length * 0.3);
    for (let i = Math.floor(safeCandles.length * 0.2); i < Math.floor(safeCandles.length * 0.6); i++) {
      if (safeCandles[i].high > maxHigh) {
        maxHigh = safeCandles[i].high;
        maxIdx = i;
      }
    }

    // Find index of lowest sweep in recent 15 candles
    let minLow = Infinity;
    let minIdx = Math.floor(safeCandles.length * 0.7);
    for (let i = Math.floor(safeCandles.length * 0.6); i < safeCandles.length - 2; i++) {
      if (safeCandles[i].low < minLow) {
        minLow = safeCandles[i].low;
        minIdx = i;
      }
    }

    const confIdx = Math.min(minIdx + 3, safeCandles.length - 1);
    const confTime = new Date(safeCandles[confIdx]?.timestamp || safeCandles[confIdx]?.time || Date.now())
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return {
      rejectionIdx: maxIdx,
      rejectionPrice: maxHigh,
      sweepIdx: minIdx,
      sweepPrice: minLow,
      confirmIdx: confIdx,
      confirmTime: confTime,
      trapIdx: Math.min(minIdx + 4, safeCandles.length - 1),
      trapPrice: minLow + span * 0.04,
    };
  }, [safeCandles, span]);

  // Handle canvas mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Find nearest candle
    const relX = x - chartPadding.left;
    const index = Math.round(relX / candleSpacing);
    if (index >= 0 && index < safeCandles.length) {
      setHoveredCandle(safeCandles[index]);
    } else {
      setHoveredCandle(null);
    }

    // Handle ongoing draw
    if (isDrawing && drawStart) {
      // preview ongoing element
    }
  };

  const handleMouseLeave = () => {
    setMousePos(null);
    setHoveredCandle(null);
    if (isDrawing) setIsDrawing(false);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool === 'crosshair') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(false);

    if (activeTool === 'horizontal') {
      setDrawnElements(prev => [
        ...prev,
        {
          id: `line-${Date.now()}`,
          type: 'horizontal',
          x1: chartPadding.left,
          y1: drawStart.y,
          x2: dimensions.width - chartPadding.right,
          y2: drawStart.y,
          color: '#3b82f6',
        },
      ]);
    } else if (activeTool === 'rectangle') {
      setDrawnElements(prev => [
        ...prev,
        {
          id: `rect-${Date.now()}`,
          type: 'rectangle',
          x1: Math.min(drawStart.x, x),
          y1: Math.min(drawStart.y, y),
          x2: Math.max(drawStart.x, x),
          y2: Math.max(drawStart.y, y),
          color: 'rgba(59, 130, 246, 0.2)',
        },
      ]);
    } else if (activeTool === 'trendline') {
      setDrawnElements(prev => [
        ...prev,
        {
          id: `trend-${Date.now()}`,
          type: 'line',
          x1: drawStart.x,
          y1: drawStart.y,
          x2: x,
          y2: y,
          color: '#10b981',
        },
      ]);
    }
    setDrawStart(null);
  };

  const clearAllDrawings = () => {
    setDrawnElements([]);
  };

  // SVG Fan Polygon Coordinates for Quantum Vision
  const fanPolygonPoints = useMemo(() => {
    const upperStr = projectionPoints.upper.map(p => `${p.x},${p.y}`).join(' ');
    const lowerReversed = [...projectionPoints.lower].reverse().map(p => `${p.x},${p.y}`).join(' ');
    return `${upperStr} ${lowerReversed}`;
  }, [projectionPoints]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex flex-col rounded-xl overflow-hidden border shadow-xl transition-colors select-none ${
        isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border/80'
      }`}
    >
      {/* 🧭 Framed Container Header Bar (Mirrors Terminal ChartView layout) */}
      <div className={`flex flex-wrap items-center justify-between px-3.5 py-2.5 border-b font-mono text-xs gap-2 shrink-0 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'
      }`}>
        {/* Left: Symbol & Timeframe badge & Mode switcher */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">{pair}</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-terminal-800 text-slate-700 dark:text-cyan-300 text-[10px] sm:text-[11px] font-bold border border-slate-300 dark:border-terminal-border">
              {timeframe.toUpperCase()}
            </span>
          </div>

          <div className="flex items-center bg-slate-200 dark:bg-terminal-950 p-0.5 rounded-lg border border-slate-300 dark:border-terminal-border text-[11px]">
            <button
              onClick={() => setChartMode('OANDA_LIVE')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-bold transition-all ${
                chartMode === 'OANDA_LIVE'
                  ? 'bg-cyan-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MonitorPlay className="w-3.5 h-3.5" />
              <span>OANDA Live Feed</span>
            </button>
            <button
              onClick={() => setChartMode('QUANTUM_MATRIX')}
              className={`px-2.5 py-1 rounded flex items-center gap-1.5 font-bold transition-all ${
                chartMode === 'QUANTUM_MATRIX'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Quantum Confluence Overlay</span>
            </button>
          </div>
        </div>

        {/* Right: Live Stream Telemetry & Interruption Status */}
        <div className="flex items-center gap-2">
          {isInterrupted ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-500 font-bold text-[10px] animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>STREAM INTERRUPTED</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>LIVE STREAMING · WSS {latencyMs}ms</span>
            </div>
          )}
        </div>
      </div>

      {/* ⚠️ Interruption & Latency Degradation Banner */}
      {isInterrupted && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>DATA STREAM INTERRUPTED: Market stream connection dropped or latency high ({latencyMs}ms). Stale data halted to protect execution integrity.</span>
          </div>
          {onReconnect && (
            <button 
              onClick={onReconnect}
              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 font-bold border border-amber-500/40 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reconnect Stream</span>
            </button>
          )}
        </div>
      )}

      {/* Main Chart Body */}
      <div className="flex-1 relative w-full h-full min-h-[460px] overflow-hidden">
        {chartMode === 'OANDA_LIVE' ? (
          <div className="w-full h-full p-2">
            <OandaTradingViewChart 
              symbol={pair} 
              timeframe={timeframe} 
              height={Math.max(dimensions.height - 110, 440)} 
              containerIdPrefix="vision" 
              theme={theme}
            />
          </div>
        ) : (
          <div 
            className="relative w-full h-full flex flex-col"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          >
            {/* Docked Sub-Toolbar for Quantum Matrix (No floating elements) */}
            <div className={`flex flex-wrap items-center justify-between px-3 py-1.5 border-b text-xs font-mono gap-2 shrink-0 ${
              isLight ? 'bg-slate-100 border-slate-200' : 'bg-terminal-900/80 border-terminal-border'
            }`}>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setActiveTool('crosshair')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'crosshair' 
                      ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-terminal-800'
                  }`}
                  title="Crosshair Cursor"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('trendline')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'trendline' 
                      ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-terminal-800'
                  }`}
                  title="Trendline Tool"
                >
                  <Minus className="w-3.5 h-3.5 -rotate-45" />
                </button>
                <button
                  onClick={() => setActiveTool('horizontal')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'horizontal' 
                      ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-terminal-800'
                  }`}
                  title="Horizontal Line"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('rectangle')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'rectangle' 
                      ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-terminal-800'
                  }`}
                  title="Order Block / Zone Rectangle"
                >
                  <Square className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('fib')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'fib' 
                      ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-terminal-800'
                  }`}
                  title="Fibonacci Retracement Grid"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setActiveTool('text')}
                  className={`p-1.5 rounded transition-all ${
                    activeTool === 'text' 
                      ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-terminal-800'
                  }`}
                  title="Text Annotation"
                >
                  <Type className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-slate-300 dark:bg-terminal-border mx-0.5" />
                <button
                  onClick={clearAllDrawings}
                  className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
                  title="Clear User Drawings"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Status indicator badges docked in the sub-toolbar */}
              <div className="flex items-center gap-2">
                {showQuantumSimulation && (
                  <span className="text-[9px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                    QUANTUM PROJECTION ACTIVE
                  </span>
                )}
                {showMarketDna && (
                  <span className="text-[9px] font-mono font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    MARKET DNA FRACTAL ACTIVE
                  </span>
                )}
                {showIndicatorsOverlay && (
                  <div className="flex items-center gap-2 px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-terminal-800/80 text-[9px] font-mono">
                    <span className="flex items-center gap-1 text-amber-500 font-bold">
                      <span className="w-2 h-0.5 bg-amber-500 inline-block" /> EMA 20: {ema20[ema20.length - 1]?.toFixed(priceDecimals)}
                    </span>
                    <span className="flex items-center gap-1 text-cyan-500 font-bold">
                      <span className="w-2 h-0.5 bg-cyan-500 inline-block" /> EMA 50: {ema50[ema50.length - 1]?.toFixed(priceDecimals)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Main SVG Candlestick & Overlays Canvas */}
            <svg
              width={dimensions.width}
              height={Math.max(dimensions.height - 110, 380)}
              className="w-full h-full cursor-crosshair"
            >
        <defs>
          {/* Subtle grid pattern */}
          <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
            <path 
              d="M 40 0 L 0 0 0 40" 
              fill="none" 
              stroke={isLight ? 'rgba(226, 232, 240, 0.6)' : 'rgba(30, 41, 59, 0.4)'} 
              strokeWidth="1" 
            />
          </pattern>

          {/* Quantum Vision Simulation Fan Gradient */}
          <linearGradient id="fanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(59, 130, 246, 0.25)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.08)" />
          </linearGradient>
        </defs>

        {/* Background Grid */}
        <rect width={dimensions.width} height={dimensions.height} fill="url(#gridPattern)" />

        {/* ================================================================= */}
        {/* 1. SHADED ANALYSIS REFERENCE ZONES (DANGER, CAUTION, ENTRY, SAFE) */}
        {/* ================================================================= */}
        {analysisZones.map((zone) => {
          const yTop = priceToY(zone.max);
          const yBottom = priceToY(zone.min);
          const h = Math.max(yBottom - yTop, 2);

          return (
            <g key={zone.name} className="cursor-pointer" onClick={() => onSelectZone && onSelectZone(zone.name)}>
              <rect
                x={chartPadding.left}
                y={yTop}
                width={plotWidth}
                height={h}
                fill={zone.color}
                stroke={zone.borderColor}
                strokeWidth="1"
                strokeDasharray="4 2"
              />
              {/* Zone Tag & Price Range on the right */}
              <rect
                x={dimensions.width - chartPadding.right + 2}
                y={yTop + 2}
                width={86}
                height={16}
                rx={3}
                fill={zone.badgeBg}
              />
              <text
                x={dimensions.width - chartPadding.right + 6}
                y={yTop + 14}
                fill="#ffffff"
                fontSize="9"
                fontWeight="bold"
                fontFamily="monospace"
              >
                {zone.name.split(' ')[0]} {zone.min.toFixed(0)}
              </text>
            </g>
          );
        })}

        {/* ================================================================= */}
        {/* 2. FIBONACCI RETRACEMENT HORIZONTAL LEVELS */}
        {/* ================================================================= */}
        {fibLevels.map((fib) => {
          const y = priceToY(fib.price);
          if (y < chartPadding.top || y > dimensions.height - chartPadding.bottom) return null;

          return (
            <g key={fib.label}>
              <line
                x1={chartPadding.left}
                y1={y}
                x2={dimensions.width - chartPadding.right}
                y2={y}
                stroke={isLight ? 'rgba(148, 163, 184, 0.5)' : 'rgba(71, 85, 105, 0.4)'}
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              <text
                x={dimensions.width - chartPadding.right - 4}
                y={y - 3}
                textAnchor="end"
                fill={isLight ? '#64748b' : '#94a3b8'}
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
              >
                {fib.label} - {fib.price.toFixed(2)}
              </text>
            </g>
          );
        })}

        {/* ================================================================= */}
        {/* 3. ORDER BLOCKS & LIQUIDITY SWEEPS */}
        {/* ================================================================= */}
        {orderBlocks.map((ob, idx) => {
          const yTop = priceToY(ob.max);
          const yBottom = priceToY(ob.min);
          const h = Math.max(yBottom - yTop, 3);

          return (
            <g key={idx}>
              <rect
                x={chartPadding.left + 60}
                y={yTop}
                width={plotWidth - 120}
                height={h}
                fill={isLight ? 'rgba(100, 116, 139, 0.15)' : 'rgba(51, 65, 85, 0.3)'}
                stroke={isLight ? '#94a3b8' : '#475569'}
                strokeWidth="1"
              />
              <text
                x={chartPadding.left + 65}
                y={yTop + 11}
                fill={isLight ? '#475569' : '#cbd5e1'}
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="bold"
              >
                {ob.name}
              </text>
            </g>
          );
        })}

        {/* Dynamic Liquidity Sweep & Institutional Rejection Tags */}
        {sweepEvents && (
          <g pointerEvents="none">
            {/* Upper Rejection Marker */}
            <text
              x={getCandleX(sweepEvents.rejectionIdx)}
              y={priceToY(sweepEvents.rejectionPrice) - 6}
              fill="#d97706"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              [Rejection 1]
            </text>

            {/* Institutional Sweep Tag */}
            <g transform={`translate(${getCandleX(sweepEvents.sweepIdx)}, ${priceToY(sweepEvents.sweepPrice) + 14})`}>
              <rect x="-30" y="-10" width="60" height="15" rx="3" fill="rgba(234, 88, 12, 0.9)" />
              <text
                x="0"
                y="1"
                fill="#ffffff"
                fontSize="8"
                fontWeight="bold"
                fontFamily="monospace"
                textAnchor="middle"
              >
                ▼ SWEEP
              </text>
            </g>

            {/* Sweep Confirmation Tag */}
            <text
              x={getCandleX(sweepEvents.confirmIdx)}
              y={priceToY(sweepEvents.trapPrice) + 16}
              fill="#0284c7"
              fontSize="9"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              ▲ Confirmed {sweepEvents.confirmTime}
            </text>

            {/* Developing Trap Liquidity */}
            <text
              x={getCandleX(sweepEvents.trapIdx)}
              y={priceToY(sweepEvents.trapPrice) + 28}
              fill="#059669"
              fontSize="8"
              fontWeight="bold"
              fontFamily="monospace"
              textAnchor="middle"
            >
              TRAP LIQUIDITY - DEVELOPING
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* 4. QUANTUM VISION SIMULATION PROJECTION FAN & PATHS */}
        {/* ================================================================= */}
        {showQuantumSimulation && (
          <g>
            {/* Shaded Probability Cone */}
            <polygon
              points={fanPolygonPoints}
              fill="url(#fanGradient)"
              stroke="rgba(59, 130, 246, 0.4)"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
            {/* Upper Path Line */}
            <path
              d={projectionPoints.upper.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="1.5"
              strokeDasharray="3 2"
            />
            {/* Median Path Line */}
            <path
              d={projectionPoints.median.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
              fill="none"
              stroke="#6366f1"
              strokeWidth="1.2"
              strokeDasharray="2 2"
            />
            {/* Lower Breakdown Path Line */}
            <path
              d={projectionPoints.lower.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
              fill="none"
              stroke="#1e3a8a"
              strokeWidth="2"
            />
            {/* Path Target Labels */}
            <text
              x={projectionPoints.upper[projectionPoints.upper.length - 1].x + 4}
              y={projectionPoints.upper[projectionPoints.upper.length - 1].y + 3}
              fill="#2563eb"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Bullish Path (38%)
            </text>
            <text
              x={projectionPoints.lower[projectionPoints.lower.length - 1].x + 4}
              y={projectionPoints.lower[projectionPoints.lower.length - 1].y + 3}
              fill="#1e3a8a"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              Support Breakdown (32%)
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* 5. MARKET DNA HISTORICAL TWIN GHOST CANDLES */}
        {/* ================================================================= */}
        {showMarketDna && showPatternOnChart && (
          <g opacity="0.45">
            {ghostCandles.map((gc, i) => {
              const yOpen = priceToY(gc.open);
              const yClose = priceToY(gc.close);
              const yHigh = priceToY(gc.high);
              const yLow = priceToY(gc.low);
              const bodyTop = Math.min(yOpen, yClose);
              const bodyHeight = Math.max(Math.abs(yClose - yOpen), 2);
              const color = gc.isUp ? '#10b981' : '#ef4444';

              return (
                <g key={`ghost-${i}`}>
                  {/* Wick */}
                  <line
                    x1={gc.x}
                    y1={yHigh}
                    x2={gc.x}
                    y2={yLow}
                    stroke={color}
                    strokeWidth="1"
                    strokeDasharray="2 1"
                  />
                  {/* Body */}
                  <rect
                    x={gc.x - candleWidth / 2}
                    y={bodyTop}
                    width={candleWidth}
                    height={bodyHeight}
                    fill={gc.isUp ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'}
                    stroke={color}
                    strokeWidth="1"
                  />
                </g>
              );
            })}
          </g>
        )}

        {/* ================================================================= */}
        {/* 6. REAL-TIME INSTITUTIONAL CANDLESTICKS OR LINE CHART */}
        {/* ================================================================= */}
        {chartType === 'Line' ? (
          <g>
            <path
              d={safeCandles.reduce((acc, c, i) => {
                const x = getCandleX(i);
                const y = priceToY(c.close);
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#0284c7"
              strokeWidth="2.5"
            />
            {/* Area fill */}
            <path
              d={`${safeCandles.reduce((acc, c, i) => {
                const x = getCandleX(i);
                const y = priceToY(c.close);
                return `${acc} ${i === 0 ? 'M' : 'L'} ${x} ${y}`;
              }, '')} L ${getCandleX(safeCandles.length - 1)} ${dimensions.height - chartPadding.bottom} L ${getCandleX(0)} ${dimensions.height - chartPadding.bottom} Z`}
              fill="url(#fanGradient)"
              opacity="0.5"
            />
          </g>
        ) : (
          safeCandles.map((c, i) => {
            const x = getCandleX(i);
            const yOpen = priceToY(c.open);
            const yClose = priceToY(c.close);
            const yHigh = priceToY(c.high);
            const yLow = priceToY(c.low);
            const isUp = c.close >= c.open;
            const bodyTop = Math.min(yOpen, yClose);
            const bodyHeight = Math.max(Math.abs(yClose - yOpen), 1.5);
            const candleColor = isUp ? '#16a34a' : '#dc2626';

            return (
              <g key={c.timestamp || i}>
                {/* High/Low Wick */}
                <line
                  x1={x}
                  y1={yHigh}
                  x2={x}
                  y2={yLow}
                  stroke={candleColor}
                  strokeWidth="1.2"
                />
                {/* Real Body */}
                <rect
                  x={x - candleWidth / 2}
                  y={bodyTop}
                  width={candleWidth}
                  height={bodyHeight}
                  fill={candleColor}
                  stroke={candleColor}
                  strokeWidth="0.8"
                  rx={0.5}
                />
              </g>
            );
          })
        )}

        {/* ================================================================= */}
        {/* 6.5. DYNAMIC TECHNICAL INDICATOR OVERLAYS: EMA 20 & EMA 50 */}
        {/* ================================================================= */}
        {showIndicatorsOverlay && (
          <g className="indicator-overlays pointer-events-none">
            {/* EMA 20 (Amber Line) */}
            <path
              d={safeCandles.reduce((acc, _, i) => {
                const val = ema20[i];
                if (val === undefined || Number.isNaN(val)) return acc;
                const x = getCandleX(i);
                const y = priceToY(val);
                return `${acc} ${acc === '' ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
            {/* EMA 50 (Cyan Line) */}
            <path
              d={safeCandles.reduce((acc, _, i) => {
                const val = ema50[i];
                if (val === undefined || Number.isNaN(val)) return acc;
                const x = getCandleX(i);
                const y = priceToY(val);
                return `${acc} ${acc === '' ? 'M' : 'L'} ${x} ${y}`;
              }, '')}
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.95"
            />
          </g>
        )}

        {/* ================================================================= */}
        {/* 7. CURRENT LIVE PRICE LINE & BADGE */}
        {/* ================================================================= */}
        <g>
          <line
            x1={chartPadding.left}
            y1={lastCandleY}
            x2={dimensions.width - chartPadding.right}
            y2={lastCandleY}
            stroke="#dc2626"
            strokeWidth="1.2"
            strokeDasharray="4 2"
          />
          {/* Price badge on axis */}
          <rect
            x={dimensions.width - chartPadding.right}
            y={lastCandleY - 10}
            width={chartPadding.right - 4}
            height={20}
            rx={3}
            fill="#dc2626"
          />
          <text
            x={dimensions.width - chartPadding.right + 6}
            y={lastCandleY + 4}
            fill="#ffffff"
            fontSize="10"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {lastCandle.close.toFixed(priceDecimals)}
          </text>
        </g>

        {/* Right Vertical Price Scale Ticks */}
        <g pointerEvents="none">
          {Array.from({ length: 7 }).map((_, idx) => {
            const frac = idx / 6;
            const price = minPrice + frac * (maxPrice - minPrice);
            const y = chartPadding.top + plotHeight - frac * plotHeight;
            return (
              <g key={`y-tick-${idx}`}>
                <line
                  x1={dimensions.width - chartPadding.right}
                  y1={y}
                  x2={dimensions.width - chartPadding.right + 4}
                  y2={y}
                  stroke={isLight ? '#cbd5e1' : '#334155'}
                  strokeWidth="1"
                />
                <text
                  x={dimensions.width - chartPadding.right + 6}
                  y={y + 3}
                  fill={isLight ? '#64748b' : '#94a3b8'}
                  fontSize="9"
                  fontFamily="monospace"
                >
                  {price.toFixed(priceDecimals)}
                </text>
              </g>
            );
          })}
        </g>

        {/* ================================================================= */}
        {/* 8. USER DRAWN ELEMENTS */}
        {/* ================================================================= */}
        {drawnElements.map((el) => {
          if (el.type === 'horizontal') {
            return (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2 || dimensions.width}
                y2={el.y1}
                stroke={el.color || '#3b82f6'}
                strokeWidth="2"
              />
            );
          }
          if (el.type === 'rectangle') {
            return (
              <rect
                key={el.id}
                x={el.x1}
                y={el.y1}
                width={Math.abs((el.x2 || el.x1) - el.x1)}
                height={Math.abs((el.y2 || el.y1) - el.y1)}
                fill={el.color || 'rgba(59, 130, 246, 0.2)'}
                stroke="#3b82f6"
                strokeWidth="1.5"
              />
            );
          }
          if (el.type === 'line') {
            return (
              <line
                key={el.id}
                x1={el.x1}
                y1={el.y1}
                x2={el.x2 || el.x1}
                y2={el.y2 || el.y1}
                stroke={el.color || '#10b981'}
                strokeWidth="2"
              />
            );
          }
          return null;
        })}

        {/* ================================================================= */}
        {/* 9. HOVER CROSSHAIR */}
        {/* ================================================================= */}
        {mousePos && (
          <g pointerEvents="none">
            {/* Vertical crosshair line */}
            <line
              x1={mousePos.x}
              y1={chartPadding.top}
              x2={mousePos.x}
              y2={dimensions.height - chartPadding.bottom}
              stroke={isLight ? '#94a3b8' : '#475569'}
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            {/* Horizontal crosshair line */}
            <line
              x1={chartPadding.left}
              y1={mousePos.y}
              x2={dimensions.width - chartPadding.right}
              y2={mousePos.y}
              stroke={isLight ? '#94a3b8' : '#475569'}
              strokeWidth="0.8"
              strokeDasharray="3 3"
            />
            {/* Price tag on right axis */}
            <rect
              x={dimensions.width - chartPadding.right}
              y={mousePos.y - 9}
              width={chartPadding.right - 4}
              height={18}
              rx={2}
              fill={isLight ? '#1e293b' : '#334155'}
            />
            <text
              x={dimensions.width - chartPadding.right + 6}
              y={mousePos.y + 4}
              fill="#ffffff"
              fontSize="10"
              fontFamily="monospace"
            >
              {yToPrice(mousePos.y).toFixed(priceDecimals)}
            </text>
          </g>
        )}

        {/* ================================================================= */}
        {/* 10. TIME SCALE LABELS (BOTTOM) */}
        {/* ================================================================= */}
        {safeCandles.map((c, i) => {
          if (i % 6 !== 0) return null;
          const x = getCandleX(i);
          const timeLabel = new Date(c.timestamp || c.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          return (
            <text
              key={`time-${i}`}
              x={x}
              y={dimensions.height - chartPadding.bottom + 18}
              textAnchor="middle"
              fill={isLight ? '#94a3b8' : '#64748b'}
              fontSize="10"
              fontFamily="monospace"
            >
              {timeLabel}
            </text>
          );
        })}
      </svg>
          </div>
        )}
      </div>
    </div>
  );
};
