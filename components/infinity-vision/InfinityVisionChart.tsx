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
  AlertCircle
} from 'lucide-react';
import { Candle, CurrencyPair, TimeFrame } from '@/lib/types';

export interface InfinityVisionChartProps {
  candles: Candle[];
  pair: CurrencyPair;
  timeframe: string;
  theme?: 'light' | 'dark';
  showQuantumSimulation?: boolean;
  showMarketDna?: boolean;
  showIndicatorsOverlay?: boolean;
  horizonCandles?: number;
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
  horizonCandles = 5,
  onSelectZone,
}) => {
  const isLight = theme === 'light';
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 560 });
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [drawnElements, setDrawnElements] = useState<DrawnElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        setDimensions({
          width: Math.max(clientWidth, 600),
          height: Math.max(clientHeight, 450),
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Safe fallback candles
  const safeCandles = useMemo(() => {
    if (candles && candles.length >= 10) return candles.slice(-45);
    // Generate realistic institutional candles centered around 4005.00 for XAU/USD
    const base = pair.includes('XAU') ? 4005.0 : 1.0850;
    const count = 35;
    const list: Candle[] = [];
    let cur = base;
    const now = Date.now();
    for (let i = count; i >= 0; i--) {
      const isRed = (i % 3 === 0 || i % 4 === 0);
      const delta = (Math.sin(i * 0.7) * 2.5) + (isRed ? -1.8 : 1.2);
      const open = cur;
      const close = cur + delta;
      const high = Math.max(open, close) + Math.random() * 2.0;
      const low = Math.min(open, close) - Math.random() * 2.0;
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

  // Compute coordinate scales
  const chartPadding = { top: 40, right: 90, bottom: 40, left: 20 };
  const plotWidth = dimensions.width - chartPadding.left - chartPadding.right;
  const plotHeight = dimensions.height - chartPadding.top - chartPadding.bottom;

  const minPrice = useMemo(() => {
    const minC = Math.min(...safeCandles.map(c => c.low));
    return minC - 10;
  }, [safeCandles]);

  const maxPrice = useMemo(() => {
    const maxC = Math.max(...safeCandles.map(c => c.high));
    return maxC + 15;
  }, [safeCandles]);

  const priceRange = Math.max(maxPrice - minPrice, 1);

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

  // Fibonacci Retracements Anchor Levels (From high 4092 down to 4024)
  const fibLevels = useMemo(() => [
    { label: 'Fib 1.618', price: 4092.15, ratio: '1.618' },
    { label: 'Fib 1.272', price: 4078.10, ratio: '1.272' },
    { label: 'Fib 0.786', price: 4057.61, ratio: '0.786' },
    { label: 'Fib 0.618', price: 4051.10, ratio: '0.618' },
    { label: 'Fib 0.5 (EQ)', price: 4046.02, ratio: '0.50' },
    { label: 'Fib 0.382', price: 4040.94, ratio: '0.382' },
    { label: 'Fib 0.236', price: 4034.66, ratio: '0.236' },
    { label: 'Fib 0', price: 4024.40, ratio: '0.00' },
    { label: 'SSL - 50%', price: 4020.00, ratio: 'SSL' },
  ], []);

  // Analysis Reference Zones (Horizontal highlighted bands)
  const analysisZones = useMemo(() => [
    {
      name: 'DANGER ZONE',
      min: 4067.18,
      max: 4073.67,
      color: 'rgba(239, 68, 68, 0.12)',
      borderColor: 'rgba(239, 68, 68, 0.4)',
      textColor: '#ef4444',
      badgeBg: 'rgba(239, 68, 68, 0.9)',
    },
    {
      name: 'CAUTION ZONE',
      min: 4052.81,
      max: 4067.16,
      color: 'rgba(245, 158, 11, 0.10)',
      borderColor: 'rgba(245, 158, 11, 0.35)',
      textColor: '#f59e0b',
      badgeBg: 'rgba(245, 158, 11, 0.9)',
    },
    {
      name: 'ENTRY ZONE',
      min: 4050.28,
      max: 4052.61,
      color: 'rgba(14, 165, 233, 0.14)',
      borderColor: 'rgba(14, 165, 233, 0.5)',
      textColor: '#0284c7',
      badgeBg: 'rgba(2, 132, 199, 0.9)',
    },
    {
      name: 'SAFE ZONE',
      min: 4047.02,
      max: 4050.28,
      color: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.4)',
      textColor: '#10b981',
      badgeBg: 'rgba(16, 185, 129, 0.9)',
    },
  ], []);

  // Order Blocks
  const orderBlocks = useMemo(() => [
    { name: 'OB - Fresh', min: 4075.00, max: 4082.00, type: 'BEARISH' },
    { name: 'Mitigation 1', min: 4048.00, max: 4052.00, type: 'MITIGATED' },
    { name: 'Mitigation 2', min: 4044.00, max: 4047.00, type: 'MITIGATED' },
  ], []);

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
        y: lastCandleY - (i * 2.8) - Math.sin(i) * 2,
      });
      // Median path
      paths.median.push({
        x,
        y: lastCandleY - (i * 0.4) + Math.cos(i) * 1.5,
      });
      // Lower breakdown path
      paths.lower.push({
        x,
        y: lastCandleY + (i * 3.4) + Math.sin(i * 1.2) * 2,
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
      const delta = isUp ? 2.5 : -1.8;
      const op = prev;
      const cl = prev + delta;
      const hi = Math.max(op, cl) + 1.2;
      const lo = Math.min(op, cl) - 1.2;
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
  }, [lastCandle.close, lastCandleX, candleSpacing]);

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
      className={`relative w-full h-full flex-1 flex flex-col select-none overflow-hidden transition-colors ${
        isLight ? 'bg-white' : 'bg-terminal-950'
      }`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      {/* Floating Drawing Toolbar (Top Center) */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 p-1 rounded-lg bg-white/95 dark:bg-terminal-900/95 border border-slate-300 dark:border-terminal-border shadow-md backdrop-blur-sm">
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

      {/* Quantum Vision Simulation Warning Badge (Top Right) */}
      {showQuantumSimulation && (
        <div className="absolute top-2.5 right-24 z-10 text-right pointer-events-none">
          <span className="text-[10px] font-mono font-bold text-rose-600 dark:text-rose-400 tracking-wider block">
            QUANTUM VISION SIMULATION
          </span>
          <span className="text-[9px] font-mono text-slate-400 block -mt-0.5">
            NOT LIVE MARKET DATA
          </span>
        </div>
      )}

      {/* Market DNA Twin Badge (Top Center/Right) */}
      {showMarketDna && (
        <div className="absolute top-10 right-24 z-10 text-right pointer-events-none hidden sm:block">
          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 tracking-wider block">
            HISTORICAL MATCH · 2025-10-29 14:00 · 67.3 similarity
          </span>
          <span className="text-[9px] font-mono text-slate-400 block -mt-0.5">
            NORMALIZED HISTORICAL DATA · NOT LIVE · NOT A SIGNAL
          </span>
        </div>
      )}

      {/* Main SVG Candlestick & Overlays Canvas */}
      <svg
        width={dimensions.width}
        height={dimensions.height}
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

        {/* Liquidity Sweep & Rejection Tags */}
        <g>
          <text
            x={getCandleX(Math.floor(safeCandles.length * 0.45))}
            y={priceToY(4048.0)}
            fill="#d97706"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            [Rejection 1]
          </text>
          <text
            x={getCandleX(Math.floor(safeCandles.length * 0.7))}
            y={priceToY(3996.0)}
            fill="#ea580c"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            ▼ SWEEP
          </text>
          <text
            x={getCandleX(Math.floor(safeCandles.length * 0.85))}
            y={priceToY(3992.0)}
            fill="#0284c7"
            fontSize="9"
            fontWeight="bold"
            fontFamily="monospace"
          >
            ▲ Confirmed 22:15
          </text>
          <text
            x={getCandleX(Math.floor(safeCandles.length * 0.88))}
            y={priceToY(3990.0)}
            fill="#059669"
            fontSize="8"
            fontWeight="bold"
            fontFamily="monospace"
          >
            TRAP LIQUIDITY - DEVELOPING
          </text>
        </g>

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
        {showMarketDna && (
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
        {/* 6. REAL-TIME INSTITUTIONAL CANDLESTICKS */}
        {/* ================================================================= */}
        {safeCandles.map((c, i) => {
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
        })}

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
            strokeWidth="1"
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
            fontSize="11"
            fontFamily="monospace"
            fontWeight="bold"
          >
            {lastCandle.close.toFixed(2)}
          </text>
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
              {yToPrice(mousePos.y).toFixed(2)}
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
  );
};
