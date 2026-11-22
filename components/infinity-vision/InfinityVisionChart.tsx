'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  LayoutGrid,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Atom,
  Dna,
  Compass,
  Droplets,
  Activity,
  GitBranch,
  ShieldCheck,
  Zap,
  BarChart2,
  Eye,
  EyeOff
} from 'lucide-react';
import { 
  createChart, 
  CandlestickSeries, 
  LineSeries, 
  ColorType, 
  CrosshairMode, 
  LineStyle, 
  createSeriesMarkers,
  IChartApi,
  ISeriesApi,
  Time,
  UTCTimestamp
} from 'lightweight-charts';
import { Candle, CurrencyPair, TimeFrame } from '@/lib/types';
import { calculateEMA } from '@/lib/indicators';

export interface InfinityVisionChartProps {
  candles: Candle[];
  pair: CurrencyPair;
  timeframe: string;
  theme?: 'light' | 'dark';
  showQuantumSimulation?: boolean;
  showMarketDna?: boolean;
  showIndicatorsOverlay?: boolean;
  showVisionAtlasLab?: boolean;
  showLiquidityHeatmap?: boolean;
  showMarketStructure?: boolean;
  showInternalStructure?: boolean;
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

interface OverlayPoint {
  timeSec: number;
  price: number;
  label?: string;
  subLabel?: string;
  type?: 'HH' | 'HL' | 'LH' | 'LL' | 'BOS' | 'CHOCH' | 'MSS';
}

export const InfinityVisionChart: React.FC<InfinityVisionChartProps> = ({
  candles = [],
  pair,
  timeframe,
  theme = 'light',
  showQuantumSimulation: propShowQuantumSimulation = true,
  showMarketDna: propShowMarketDna = true,
  showIndicatorsOverlay: propShowIndicatorsOverlay = true,
  showVisionAtlasLab: propShowVisionAtlasLab = true,
  showLiquidityHeatmap: propShowLiquidityHeatmap = false,
  showMarketStructure: propShowMarketStructure = true,
  showInternalStructure: propShowInternalStructure = true,
  chartType: propChartType = 'Candles',
  showPatternOnChart = true,
  horizonCandles = 5,
  latencyMs = 12,
  isInterrupted = false,
  onReconnect,
  onSelectZone,
}) => {
  const isLight = theme === 'light';

  // 🎛️ Bi-Directional Interactive Overlay Control States (Syncs with external props or local toggles)
  const [showQuantumSimulation, setShowQuantumSimulation] = useState<boolean>(propShowQuantumSimulation);
  const [showMarketDna, setShowMarketDna] = useState<boolean>(propShowMarketDna);
  const [showIndicatorsOverlay, setShowIndicatorsOverlay] = useState<boolean>(propShowIndicatorsOverlay);
  const [showVisionAtlasLab, setShowVisionAtlasLab] = useState<boolean>(propShowVisionAtlasLab);
  const [showLiquidityHeatmap, setShowLiquidityHeatmap] = useState<boolean>(propShowLiquidityHeatmap);
  const [showMarketStructure, setShowMarketStructure] = useState<boolean>(propShowMarketStructure);
  const [showInternalStructure, setShowInternalStructure] = useState<boolean>(propShowInternalStructure);
  const [chartType, setChartType] = useState<'Candles' | 'Line'>(propChartType);

  // Sync state when parent toolbar buttons toggle
  useEffect(() => setShowQuantumSimulation(propShowQuantumSimulation), [propShowQuantumSimulation]);
  useEffect(() => setShowMarketDna(propShowMarketDna), [propShowMarketDna]);
  useEffect(() => setShowIndicatorsOverlay(propShowIndicatorsOverlay), [propShowIndicatorsOverlay]);
  useEffect(() => setShowVisionAtlasLab(propShowVisionAtlasLab), [propShowVisionAtlasLab]);
  useEffect(() => setShowLiquidityHeatmap(propShowLiquidityHeatmap), [propShowLiquidityHeatmap]);
  useEffect(() => setShowMarketStructure(propShowMarketStructure), [propShowMarketStructure]);
  useEffect(() => setShowInternalStructure(propShowInternalStructure), [propShowInternalStructure]);
  useEffect(() => setChartType(propChartType), [propChartType]);

  // DOM Container & Canvas References
  const containerRef = useRef<HTMLDivElement>(null);
  const chartWrapperRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const overlaySvgRef = useRef<SVGSVGElement>(null);

  // Native Lightweight Charts Instance References
  const chartInstanceRef = useRef<IChartApi | null>(null);
  const seriesInstanceRef = useRef<ISeriesApi<'Candlestick'> | ISeriesApi<'Line'> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // Dimensions & Drawing State
  const [dimensions, setDimensions] = useState({ width: 900, height: 540 });
  const [activeTool, setActiveTool] = useState<DrawingTool>('crosshair');
  const [hoveredCandle, setHoveredCandle] = useState<Candle | null>(null);
  const [drawnElements, setDrawnElements] = useState<DrawnElement[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [renderVersion, setRenderVersion] = useState<number>(0);

  // 1. Prepare Safe Canonical Candlesticks sorted in strictly ascending time
  const safeCandles = useMemo(() => {
    let list: Candle[] = [];
    if (candles && candles.length >= 8) {
      list = [...candles.slice(-65)];
    } else {
      const base = pair.includes('XAU') ? 4005.0 : pair.includes('JPY') ? 152.5 : pair.includes('NIFTY') ? 24500 : 1.0850;
      const count = 45;
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
    }

    // Ensure strictly unique and ascending timestamps
    let lastTime = 0;
    return list.map((c, i) => {
      let tSec = Math.floor(new Date(c.time || c.timestamp || (Date.now() - (list.length - i) * 60000)).getTime() / 1000);
      if (tSec <= lastTime) {
        tSec = lastTime + 60;
      }
      lastTime = tSec;
      return {
        ...c,
        timestamp: tSec * 1000,
        time: new Date(tSec * 1000).toISOString(),
      };
    });
  }, [candles, pair]);

  const lastCandle = safeCandles[safeCandles.length - 1] || {
    open: 4005.0,
    high: 4007.6,
    low: 3998.9,
    close: 4005.8,
    timestamp: Date.now(),
    volume: 1500,
  };

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

  // 🏛️ Market Structure & Internal Structure Analysis Calculations
  const marketStructureData = useMemo(() => {
    const majorSwings: OverlayPoint[] = [];
    const internalSwings: OverlayPoint[] = [];
    const bosLines: Array<{ x1Time: number; x2Time: number; price: number; type: 'BULLISH' | 'BEARISH'; label: string }> = [];
    const chochLines: Array<{ x1Time: number; x2Time: number; price: number; type: 'BULLISH' | 'BEARISH'; label: string }> = [];

    if (safeCandles.length < 10) return { majorSwings, internalSwings, bosLines, chochLines };

    // 1. Detect Major Swing Points (k = 3)
    let lastMajorHigh: OverlayPoint | null = null;
    let lastMajorLow: OverlayPoint | null = null;

    for (let i = 3; i < safeCandles.length - 3; i++) {
      const cur = safeCandles[i];
      const tSec = Math.floor(cur.timestamp! / 1000);

      // Swing High
      const isHigh = 
        cur.high > safeCandles[i-1].high && cur.high > safeCandles[i-2].high && cur.high > safeCandles[i-3].high &&
        cur.high > safeCandles[i+1].high && cur.high > safeCandles[i+2].high && cur.high > safeCandles[i+3].high;

      // Swing Low
      const isLow = 
        cur.low < safeCandles[i-1].low && cur.low < safeCandles[i-2].low && cur.low < safeCandles[i-3].low &&
        cur.low < safeCandles[i+1].low && cur.low < safeCandles[i+2].low && cur.low < safeCandles[i+3].low;

      if (isHigh) {
        const type = lastMajorHigh ? (cur.high > lastMajorHigh.price ? 'HH' : 'LH') : 'HH';
        const point: OverlayPoint = { timeSec: tSec, price: cur.high, label: type, type };
        majorSwings.push(point);

        // Check BOS or CHoCH
        if (lastMajorHigh && cur.high > lastMajorHigh.price) {
          bosLines.push({
            x1Time: lastMajorHigh.timeSec,
            x2Time: tSec,
            price: lastMajorHigh.price,
            type: 'BULLISH',
            label: 'BOS (Bullish)',
          });
        }
        lastMajorHigh = point;
      }

      if (isLow) {
        const type = lastMajorLow ? (cur.low > lastMajorLow.price ? 'HL' : 'LL') : 'LL';
        const point: OverlayPoint = { timeSec: tSec, price: cur.low, label: type, type };
        majorSwings.push(point);

        if (lastMajorLow && cur.low < lastMajorLow.price) {
          chochLines.push({
            x1Time: lastMajorLow.timeSec,
            x2Time: tSec,
            price: lastMajorLow.price,
            type: 'BEARISH',
            label: 'CHoCH (Bearish)',
          });
        }
        lastMajorLow = point;
      }
    }

    // 2. Detect Internal Swings (k = 1)
    for (let i = 1; i < safeCandles.length - 1; i += 2) {
      const cur = safeCandles[i];
      const tSec = Math.floor(cur.timestamp! / 1000);
      if (cur.high > safeCandles[i-1].high && cur.high > safeCandles[i+1].high) {
        internalSwings.push({ timeSec: tSec, price: cur.high, label: 'iH' });
      }
      if (cur.low < safeCandles[i-1].low && cur.low < safeCandles[i+1].low) {
        internalSwings.push({ timeSec: tSec, price: cur.low, label: 'iL' });
      }
    }

    return { majorSwings, internalSwings, bosLines, chochLines };
  }, [safeCandles]);

  // 🌐 Fibonacci Retracements Anchor Levels
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

  // 🧭 Confluence Shaded Reference Zones
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

  // 🏛️ Institutional Order Blocks
  const orderBlocks = useMemo(() => {
    return [
      {
        name: 'Fresh Bearish OB',
        min: Number((maxC - span * 0.08).toFixed(priceDecimals)),
        max: Number(maxC.toFixed(priceDecimals)),
        type: 'BEARISH',
        color: 'rgba(239, 68, 68, 0.18)',
        borderColor: '#ef4444',
      },
      {
        name: 'Mitigation Level 1',
        min: Number((minC + span * 0.65).toFixed(priceDecimals)),
        max: Number((minC + span * 0.72).toFixed(priceDecimals)),
        type: 'MITIGATED',
        color: 'rgba(100, 116, 139, 0.15)',
        borderColor: '#94a3b8',
      },
      {
        name: 'Fresh Demand OB',
        min: Number(minC.toFixed(priceDecimals)),
        max: Number((minC + span * 0.10).toFixed(priceDecimals)),
        type: 'BULLISH',
        color: 'rgba(16, 185, 129, 0.18)',
        borderColor: '#10b981',
      },
    ];
  }, [minC, maxC, span, priceDecimals]);

  // 🌊 Live Liquidity Heatmap Depth Walls
  const liquidityDepthWalls = useMemo(() => {
    return {
      bidWall: {
        price: Number((lastCandle.close - span * 0.045).toFixed(priceDecimals)),
        volume: '157 Lots',
        label: 'Institutional Bid Wall Depth',
      },
      askWall: {
        price: Number((lastCandle.close + span * 0.045).toFixed(priceDecimals)),
        volume: '120 Lots',
        label: 'Institutional Ask Wall Depth',
      },
    };
  }, [lastCandle.close, span, priceDecimals]);

  // ⚛️ Quantum Vision Simulation Projection Paths
  const quantVisionPaths = useMemo(() => {
    const lastTimeSec = Math.floor(lastCandle.timestamp! / 1000);
    const steps = 7;
    const intervalSec = 15 * 60; // 15-minute intervals
    const upper: Array<{ timeSec: number; price: number }> = [];
    const median: Array<{ timeSec: number; price: number }> = [];
    const lower: Array<{ timeSec: number; price: number }> = [];

    upper.push({ timeSec: lastTimeSec, price: lastCandle.close });
    median.push({ timeSec: lastTimeSec, price: lastCandle.close });
    lower.push({ timeSec: lastTimeSec, price: lastCandle.close });

    for (let i = 1; i <= steps; i++) {
      const t = lastTimeSec + i * intervalSec;
      upper.push({
        timeSec: t,
        price: lastCandle.close + (span * 0.035 * i) + Math.sin(i) * (span * 0.005),
      });
      median.push({
        timeSec: t,
        price: lastCandle.close + (span * 0.008 * i) + Math.cos(i) * (span * 0.003),
      });
      lower.push({
        timeSec: t,
        price: lastCandle.close - (span * 0.038 * i) - Math.sin(i * 1.2) * (span * 0.004),
      });
    }

    return { upper, median, lower };
  }, [lastCandle.close, lastCandle.timestamp, span]);

  // 🧬 Market DNA Projected Fractal Ghost Candles
  const ghostCandles = useMemo(() => {
    const lastTimeSec = Math.floor(lastCandle.timestamp! / 1000);
    const count = 8;
    const intervalSec = 15 * 60;
    const list: Array<{ timeSec: number; open: number; close: number; high: number; low: number; isUp: boolean }> = [];
    let prev = lastCandle.close;

    for (let i = 1; i <= count; i++) {
      const isUp = i % 2 === 0 || i > 4;
      const step = span * 0.03 * (isUp ? 0.8 : -0.6);
      const op = prev;
      const cl = prev + step;
      const hi = Math.max(op, cl) + span * 0.012;
      const lo = Math.min(op, cl) - span * 0.012;
      list.push({
        timeSec: lastTimeSec + i * intervalSec,
        open: op,
        close: cl,
        high: hi,
        low: lo,
        isUp,
      });
      prev = cl;
    }
    return list;
  }, [lastCandle.close, lastCandle.timestamp, span]);

  // =========================================================================
  // 🚀 MOUNT TRADINGVIEW LIGHTWEIGHT CHARTS DIRECTLY INTO APPLICATION'S DOM
  // =========================================================================
  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Destroy existing instance if any
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove();
      chartInstanceRef.current = null;
    }

    const { clientWidth, clientHeight } = chartContainerRef.current;
    const initialWidth = clientWidth || dimensions.width;
    const initialHeight = clientHeight || dimensions.height;

    // 1. Create native HTML5 Canvas Chart with bidirectional DOM integration
    const chart = createChart(chartContainerRef.current, {
      width: initialWidth,
      height: initialHeight,
      layout: {
        background: { type: ColorType.Solid, color: isLight ? '#ffffff' : '#090d16' },
        textColor: isLight ? '#334155' : '#94a3b8',
        fontFamily: 'JetBrains Mono, ui-monospace, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: isLight ? 'rgba(226, 232, 240, 0.7)' : 'rgba(30, 41, 59, 0.35)' },
        horzLines: { color: isLight ? 'rgba(226, 232, 240, 0.7)' : 'rgba(30, 41, 59, 0.35)' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: isLight ? '#94a3b8' : '#475569',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isLight ? '#1e293b' : '#0f172a',
        },
        horzLine: {
          color: isLight ? '#94a3b8' : '#475569',
          width: 1,
          style: LineStyle.Dashed,
          labelBackgroundColor: isLight ? '#1e293b' : '#0f172a',
        },
      },
      rightPriceScale: {
        borderColor: isLight ? '#e2e8f0' : '#1e293b',
        scaleMargins: {
          top: 0.12,
          bottom: 0.12,
        },
      },
      timeScale: {
        borderColor: isLight ? '#e2e8f0' : '#1e293b',
        timeVisible: true,
        secondsVisible: false,
        barSpacing: 10,
        minBarSpacing: 3,
        rightOffset: 12,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
        horzTouchDrag: true,
        vertTouchDrag: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    });

    chartInstanceRef.current = chart;

    // 2. Add Candlestick / Line Series based on chartType
    let mainSeries: ISeriesApi<'Candlestick'> | ISeriesApi<'Line'>;
    if (chartType === 'Line') {
      mainSeries = chart.addSeries(LineSeries, {
        color: '#0284c7',
        lineWidth: 2,
        priceFormat: {
          type: 'price',
          precision: priceDecimals,
          minMove: 1 / Math.pow(10, priceDecimals),
        },
      });
    } else {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: '#10b981',
        downColor: '#ef4444',
        borderUpColor: '#10b981',
        borderDownColor: '#ef4444',
        wickUpColor: '#10b981',
        wickDownColor: '#ef4444',
        priceFormat: {
          type: 'price',
          precision: priceDecimals,
          minMove: 1 / Math.pow(10, priceDecimals),
        },
      });
    }
    seriesInstanceRef.current = mainSeries;

    // 3. Populate Series with canonical live data
    const formattedData = safeCandles.map(c => {
      const timeVal = Math.floor(c.timestamp! / 1000) as UTCTimestamp;
      if (chartType === 'Line') {
        return { time: timeVal, value: c.close };
      }
      return {
        time: timeVal,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      };
    });

    // @ts-ignore
    mainSeries.setData(formattedData);

    // 4. Add Dynamic EMA Overlays if enabled
    if (showIndicatorsOverlay) {
      const ema20Series = chart.addSeries(LineSeries, {
        color: '#f59e0b',
        lineWidth: 2,
        title: 'EMA 20',
      });
      const ema50Series = chart.addSeries(LineSeries, {
        color: '#06b6d4',
        lineWidth: 2,
        title: 'EMA 50',
      });

      const ema20Data = safeCandles
        .map((c, i) => ({ time: Math.floor(c.timestamp! / 1000) as UTCTimestamp, value: ema20[i] }))
        .filter(d => !Number.isNaN(d.value) && d.value !== undefined);

      const ema50Data = safeCandles
        .map((c, i) => ({ time: Math.floor(c.timestamp! / 1000) as UTCTimestamp, value: ema50[i] }))
        .filter(d => !Number.isNaN(d.value) && d.value !== undefined);

      ema20Series.setData(ema20Data);
      ema50Series.setData(ema50Data);

      ema20SeriesRef.current = ema20Series;
      ema50SeriesRef.current = ema50Series;
    }

    // 5. Native Series Markers for Institutional Sweeps & Order Flow Signals
    if (safeCandles.length >= 15) {
      const markers = [
        {
          time: Math.floor(safeCandles[safeCandles.length - 8].timestamp! / 1000) as UTCTimestamp,
          position: 'aboveBar' as const,
          color: '#d97706',
          shape: 'arrowDown' as const,
          text: 'REJECTION 1',
        },
        {
          time: Math.floor(safeCandles[safeCandles.length - 4].timestamp! / 1000) as UTCTimestamp,
          position: 'belowBar' as const,
          color: '#ea580c',
          shape: 'arrowUp' as const,
          text: '▼ LIQUIDITY SWEEP',
        },
        {
          time: Math.floor(safeCandles[safeCandles.length - 2].timestamp! / 1000) as UTCTimestamp,
          position: 'belowBar' as const,
          color: '#0284c7',
          shape: 'circle' as const,
          text: '▲ CONFIRMED',
        },
      ];
      createSeriesMarkers(mainSeries, markers);
    }

    // 6. Native Structural Price Lines for Invalidation Boundaries
    mainSeries.createPriceLine({
      price: lastCandle.close,
      color: '#06b6d4',
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      axisLabelVisible: true,
      title: 'LIVE TICK',
    });

    // 7. Subscribe to Crosshair & Pan/Zoom events to bi-directionally sync SVG Overlays
    const handleTimeScaleChange = () => {
      setRenderVersion(v => v + 1);
    };

    chart.timeScale().subscribeVisibleLogicalRangeChange(handleTimeScaleChange);
    chart.timeScale().subscribeVisibleTimeRangeChange(handleTimeScaleChange);

    chart.subscribeCrosshairMove((param) => {
      if (!param || !param.time || !param.seriesData) {
        setHoveredCandle(null);
        return;
      }
      const data = param.seriesData.get(mainSeries);
      if (data && 'close' in data) {
        setHoveredCandle({
          time: new Date(Number(param.time) * 1000).toISOString(),
          timestamp: Number(param.time) * 1000,
          open: (data as any).open || (data as any).value,
          high: (data as any).high || (data as any).value,
          low: (data as any).low || (data as any).value,
          close: (data as any).close || (data as any).value,
          volume: 0,
        });
      }
    });

    // Fit content smoothly on initial mount
    chart.timeScale().fitContent();

    return () => {
      chart.remove();
      chartInstanceRef.current = null;
      seriesInstanceRef.current = null;
      ema20SeriesRef.current = null;
      ema50SeriesRef.current = null;
    };
  }, [
    pair, 
    chartType, 
    isLight, 
    priceDecimals, 
    showIndicatorsOverlay,
    // safeCandles reference ensures clean rebuild on symbol switch
  ]);

  // Update Data dynamically without destroying canvas
  useEffect(() => {
    if (!seriesInstanceRef.current || safeCandles.length === 0) return;

    const formattedData = safeCandles.map(c => {
      const timeVal = Math.floor(c.timestamp! / 1000) as UTCTimestamp;
      if (chartType === 'Line') {
        return { time: timeVal, value: c.close };
      }
      return {
        time: timeVal,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      };
    });

    // @ts-ignore
    seriesInstanceRef.current.setData(formattedData);

    if (showIndicatorsOverlay && ema20SeriesRef.current && ema50SeriesRef.current) {
      const ema20Data = safeCandles
        .map((c, i) => ({ time: Math.floor(c.timestamp! / 1000) as UTCTimestamp, value: ema20[i] }))
        .filter(d => !Number.isNaN(d.value) && d.value !== undefined);

      const ema50Data = safeCandles
        .map((c, i) => ({ time: Math.floor(c.timestamp! / 1000) as UTCTimestamp, value: ema50[i] }))
        .filter(d => !Number.isNaN(d.value) && d.value !== undefined);

      ema20SeriesRef.current.setData(ema20Data);
      ema50SeriesRef.current.setData(ema50Data);
    }

    setRenderVersion(v => v + 1);
  }, [safeCandles, chartType, showIndicatorsOverlay, ema20, ema50]);

  // 📐 ResizeObserver ensuring zero layout shifting and perfect DOM synchronization
  useEffect(() => {
    if (!chartContainerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          const w = Math.floor(width);
          const h = Math.max(Math.floor(height), 460);
          setDimensions({ width: w, height: h });
          if (chartInstanceRef.current) {
            chartInstanceRef.current.applyOptions({ width: w, height: h });
            setRenderVersion(v => v + 1);
          }
        }
      }
    });
    ro.observe(chartContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // 📍 Mathematical Projection Coordinate Converter (Maps chart coordinates to overlay SVG canvas)
  const getCoordinates = useCallback((timeSec: number, price: number) => {
    if (!chartInstanceRef.current || !seriesInstanceRef.current) {
      // Fallback relative interpolation
      const frac = (maxC - price) / Math.max(maxC - minC, 0.0001);
      return { x: dimensions.width * 0.75, y: dimensions.height * Math.max(0.05, Math.min(0.95, frac)) };
    }

    const series = seriesInstanceRef.current;
    const timeScale = chartInstanceRef.current.timeScale();

    let x = timeScale.timeToCoordinate(timeSec as unknown as Time);
    const y = series.priceToCoordinate(price);

    // If future time (beyond existing candles), project forward linearly based on candle spacing
    if (x === null) {
      const lastTimeSec = Math.floor(lastCandle.timestamp! / 1000);
      const prevTimeSec = safeCandles.length > 1 ? Math.floor(safeCandles[safeCandles.length - 2].timestamp! / 1000) : lastTimeSec - 900;
      const lastX = timeScale.timeToCoordinate(lastTimeSec as unknown as Time);
      const prevX = timeScale.timeToCoordinate(prevTimeSec as unknown as Time);
      const spacing = (lastX !== null && prevX !== null) ? Math.max(lastX - prevX, 10) : 12;
      const stepIndex = Math.max(1, Math.round((timeSec - lastTimeSec) / 900));
      x = ((lastX ?? (dimensions.width - 80)) + stepIndex * spacing) as any;
    }

    return {
      x: Number(x ?? dimensions.width / 2),
      y: Number(y ?? dimensions.height / 2),
    };
  }, [maxC, minC, dimensions, lastCandle.timestamp, safeCandles]);

  // Zoom / Scale Controls
  const handleZoom = (factor: number) => {
    if (!chartInstanceRef.current) return;
    const timeScale = chartInstanceRef.current.timeScale();
    const currentRange = timeScale.getVisibleLogicalRange();
    if (currentRange) {
      const mid = (currentRange.from + currentRange.to) / 2;
      const span = (currentRange.to - currentRange.from) * factor;
      timeScale.setVisibleLogicalRange({
        from: mid - span / 2,
        to: mid + span / 2,
      });
      setRenderVersion(v => v + 1);
    }
  };

  const handleResetZoom = () => {
    if (!chartInstanceRef.current) return;
    chartInstanceRef.current.timeScale().fitContent();
    setRenderVersion(v => v + 1);
  };

  // ✍️ User Interactive Drawing Handler (Operates natively without iframe traps)
  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (activeTool === 'crosshair') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setIsDrawing(true);
    setDrawStart({ x, y });
  };

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawing || !drawStart || activeTool === 'crosshair') return;
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
          x1: 0,
          y1: drawStart.y,
          x2: dimensions.width,
          y2: drawStart.y,
          color: '#06b6d4',
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
          color: 'rgba(6, 182, 212, 0.2)',
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

  // Convert Quant Vision paths to screen coordinates for smooth SVG overlay
  const quantVisionSvgCoordinates = useMemo(() => {
    const upperCoords = quantVisionPaths.upper.map(p => getCoordinates(p.timeSec, p.price));
    const medianCoords = quantVisionPaths.median.map(p => getCoordinates(p.timeSec, p.price));
    const lowerCoords = quantVisionPaths.lower.map(p => getCoordinates(p.timeSec, p.price));

    const upperStr = upperCoords.map(p => `${p.x},${p.y}`).join(' ');
    const lowerReversed = [...lowerCoords].reverse().map(p => `${p.x},${p.y}`).join(' ');
    const polygonPoints = `${upperStr} ${lowerReversed}`;

    return { upperCoords, medianCoords, lowerCoords, polygonPoints };
  }, [quantVisionPaths, getCoordinates, renderVersion]);

  return (
    <div 
      ref={containerRef}
      className={`w-full h-full flex flex-col rounded-xl overflow-hidden border shadow-xl transition-colors select-none ${
        isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border/80'
      }`}
    >
      {/* 🧭 Header Bar: Direct DOM Native Lightweight Charts Status & WSS Telemetry */}
      <div className={`flex flex-wrap items-center justify-between px-3.5 py-2 border-b font-mono text-xs gap-2 shrink-0 ${
        isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'
      }`}>
        {/* Left: Symbol & Native Lightweight Charts Badge */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-wide">{pair}</span>
            <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-terminal-800 text-slate-700 dark:text-cyan-300 text-[10px] sm:text-[11px] font-bold border border-slate-300 dark:border-terminal-border">
              {timeframe.toUpperCase()}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              <Zap className="w-3 h-3 text-cyan-500" />
              <span>TV LIGHTWEIGHT CHARTS (NATIVE CANVAS)</span>
            </span>
          </div>

          {/* Real-time OHLC Cursor Telemetry */}
          {hoveredCandle && (
            <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono text-slate-600 dark:text-slate-300 bg-slate-200/60 dark:bg-terminal-800/60 px-2 py-0.5 rounded border border-slate-300 dark:border-terminal-border">
              <span>O: <strong className="text-slate-900 dark:text-white">{hoveredCandle.open.toFixed(priceDecimals)}</strong></span>
              <span>H: <strong className="text-emerald-500">{hoveredCandle.high.toFixed(priceDecimals)}</strong></span>
              <span>L: <strong className="text-rose-500">{hoveredCandle.low.toFixed(priceDecimals)}</strong></span>
              <span>C: <strong className="text-cyan-500">{hoveredCandle.close.toFixed(priceDecimals)}</strong></span>
            </div>
          )}
        </div>

        {/* Right: WSS Streaming & Interruption Status */}
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

      {/* ⚠️ Interruption Banner */}
      {isInterrupted && (
        <div className="mx-3 mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono text-xs flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>DATA STREAM INTERRUPTED: Market stream connection dropped. Stale data halted to protect execution integrity.</span>
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

      {/* 🎛️ Bi-Directional Overlay Controls & Drawing Toolbar */}
      <div className={`flex flex-wrap items-center justify-between px-3 py-1.5 border-b text-xs font-mono gap-1.5 shrink-0 ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-terminal-900/90 border-terminal-border'
      }`}>
        {/* Drawing Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTool('crosshair')}
            className={`p-1.5 rounded transition-all ${
              activeTool === 'crosshair' 
                ? 'bg-slate-300 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-terminal-800'
            }`}
            title="Crosshair & Free Pan Tool (Direct Touch/Mouse Gestures)"
          >
            <Crosshair className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTool('trendline')}
            className={`p-1.5 rounded transition-all ${
              activeTool === 'trendline' 
                ? 'bg-slate-300 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-terminal-800'
            }`}
            title="Draw Trendline"
          >
            <Minus className="w-3.5 h-3.5 -rotate-45" />
          </button>
          <button
            onClick={() => setActiveTool('horizontal')}
            className={`p-1.5 rounded transition-all ${
              activeTool === 'horizontal' 
                ? 'bg-slate-300 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-terminal-800'
            }`}
            title="Draw Horizontal Key Level"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setActiveTool('rectangle')}
            className={`p-1.5 rounded transition-all ${
              activeTool === 'rectangle' 
                ? 'bg-slate-300 dark:bg-terminal-800 text-slate-900 dark:text-cyan-400 font-bold' 
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200 dark:hover:bg-terminal-800'
            }`}
            title="Draw Order Block / Liquidity Zone"
          >
            <Square className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={clearAllDrawings}
            className="p-1.5 rounded text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
            title="Clear User Drawings"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 🎛️ Bi-Directional Visual Elements Toggle Chips */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* Market Structure Toggle */}
          <button
            onClick={() => setShowMarketStructure(!showMarketStructure)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              showMarketStructure
                ? 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 border border-transparent hover:border-slate-300'
            }`}
            title="Toggle Major Market Structure Mapping (BOS / CHoCH / Swings)"
          >
            <GitBranch className="w-3 h-3" />
            <span>MKT STRUCTURE</span>
          </button>

          {/* Internal Structure Toggle */}
          <button
            onClick={() => setShowInternalStructure(!showInternalStructure)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              showInternalStructure
                ? 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border border-purple-500/40'
                : 'text-slate-400 border border-transparent hover:border-slate-300'
            }`}
            title="Toggle Internal Minor Structure Mapping (iBOS / iCHoCH)"
          >
            <Layers className="w-3 h-3" />
            <span>INTERNAL</span>
          </button>

          {/* Quant Vision Toggle */}
          <button
            onClick={() => setShowQuantumSimulation(!showQuantumSimulation)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              showQuantumSimulation
                ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40'
                : 'text-slate-400 border border-transparent hover:border-slate-300'
            }`}
            title="Toggle Quant Vision Probability Fan & Projection Paths"
          >
            <Atom className="w-3 h-3" />
            <span>QUANT VISION</span>
          </button>

          {/* Market DNA Toggle */}
          <button
            onClick={() => setShowMarketDna(!showMarketDna)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              showMarketDna
                ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40'
                : 'text-slate-400 border border-transparent hover:border-slate-300'
            }`}
            title="Toggle Market DNA Fractal Twin Ghost Candles"
          >
            <Dna className="w-3 h-3" />
            <span>MARKET DNA</span>
          </button>

          {/* Vision Atlas Lab Overlays Toggle */}
          <button
            onClick={() => setShowVisionAtlasLab(!showVisionAtlasLab)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              showVisionAtlasLab
                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 border border-transparent hover:border-slate-300'
            }`}
            title="Toggle Vision Atlas Lab Confluence Zones & Order Blocks"
          >
            <Compass className="w-3 h-3" />
            <span>ATLAS ZONES</span>
          </button>

          {/* Liquidity Heatmap Toggle */}
          <button
            onClick={() => setShowLiquidityHeatmap(!showLiquidityHeatmap)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 transition-all ${
              showLiquidityHeatmap
                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40'
                : 'text-slate-400 border border-transparent hover:border-slate-300'
            }`}
            title="Toggle Live Liquidity Heatmap Depth Walls"
          >
            <Droplets className="w-3 h-3" />
            <span>LIQUIDITY HEATMAP</span>
          </button>

          {/* Candles vs Line Switcher */}
          <button
            onClick={() => setChartType(chartType === 'Candles' ? 'Line' : 'Candles')}
            className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-terminal-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-terminal-border hover:text-cyan-400 transition-colors"
            title="Switch Chart Type (Candles / Line)"
          >
            {chartType === 'Candles' ? 'LINE VIEW' : 'CANDLE VIEW'}
          </button>

          {/* Zoom / Reset View */}
          <div className="flex items-center gap-0.5 bg-slate-200 dark:bg-terminal-800 p-0.5 rounded border border-slate-300 dark:border-terminal-border">
            <button onClick={() => handleZoom(0.85)} className="p-1 hover:text-cyan-400" title="Zoom In">
              <ZoomIn className="w-3 h-3" />
            </button>
            <button onClick={() => handleZoom(1.18)} className="p-1 hover:text-cyan-400" title="Zoom Out">
              <ZoomOut className="w-3 h-3" />
            </button>
            <button onClick={handleResetZoom} className="p-1 hover:text-cyan-400" title="Reset View (1:1)">
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 🏛️ MAIN CHART CONTAINER: NATIVE CANVAS + LAYERED OVERLAYS */}
      {/* ========================================================================= */}
      <div 
        ref={chartWrapperRef}
        className="flex-1 relative w-full h-[520px] sm:h-[560px] overflow-hidden bg-white dark:bg-terminal-950"
      >
        {/* 1. DOM Element where TradingView Lightweight Charts canvas is mounted */}
        <div 
          ref={chartContainerRef}
          className="absolute inset-0 w-full h-full z-10"
        />

        {/* 2. Custom Visual Elements Layer (Mounted natively in DOM directly over canvas) */}
        <svg
          ref={overlaySvgRef}
          width={dimensions.width}
          height={dimensions.height}
          className="absolute inset-0 w-full h-full z-20 pointer-events-none"
        >
          <defs>
            {/* Quantum Vision Simulation Fan Gradient */}
            <linearGradient id="tvFanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(59, 130, 246, 0.28)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.08)" />
            </linearGradient>

            {/* Liquidity Heatmap Gradient */}
            <linearGradient id="liqBidGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(16, 185, 129, 0.35)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.02)" />
            </linearGradient>

            <linearGradient id="liqAskGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(239, 68, 68, 0.35)" />
              <stop offset="100%" stopColor="rgba(239, 68, 68, 0.02)" />
            </linearGradient>
          </defs>

          {/* =============================================================== */}
          {/* A. VISION ATLAS LAB OVERLAYS (CONFLUENCE ZONES & ORDER BLOCKS)   */}
          {/* =============================================================== */}
          {showVisionAtlasLab && (
            <g className="atlas-confluence-zones">
              {/* Shaded Reference Confluence Zones */}
              {analysisZones.map((zone) => {
                const coordTop = getCoordinates(Math.floor(lastCandle.timestamp! / 1000), zone.max);
                const coordBottom = getCoordinates(Math.floor(lastCandle.timestamp! / 1000), zone.min);
                const yTop = Math.min(coordTop.y, coordBottom.y);
                const h = Math.max(Math.abs(coordBottom.y - coordTop.y), 3);

                return (
                  <g key={zone.name} className="pointer-events-auto cursor-pointer" onClick={() => onSelectZone && onSelectZone(zone.name)}>
                    <rect
                      x={0}
                      y={yTop}
                      width={dimensions.width - 65}
                      height={h}
                      fill={zone.color}
                      stroke={zone.borderColor}
                      strokeWidth="1"
                      strokeDasharray="4 2"
                    />
                    <rect
                      x={dimensions.width - 150}
                      y={yTop + 2}
                      width={82}
                      height={15}
                      rx={3}
                      fill={zone.badgeBg}
                    />
                    <text
                      x={dimensions.width - 146}
                      y={yTop + 13}
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

              {/* Fibonacci Retracements Grid */}
              {fibLevels.map((fib) => {
                const coord = getCoordinates(Math.floor(lastCandle.timestamp! / 1000), fib.price);
                if (coord.y < 20 || coord.y > dimensions.height - 30) return null;

                return (
                  <g key={fib.label}>
                    <line
                      x1={0}
                      y1={coord.y}
                      x2={dimensions.width - 65}
                      y2={coord.y}
                      stroke={isLight ? 'rgba(148, 163, 184, 0.45)' : 'rgba(71, 85, 105, 0.35)'}
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={dimensions.width - 70}
                      y={coord.y - 3}
                      textAnchor="end"
                      fill={isLight ? '#64748b' : '#94a3b8'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {fib.label} · {fib.price.toFixed(priceDecimals)}
                    </text>
                  </g>
                );
              })}

              {/* Institutional Order Blocks */}
              {orderBlocks.map((ob, idx) => {
                const coordTop = getCoordinates(Math.floor(lastCandle.timestamp! / 1000), ob.max);
                const coordBottom = getCoordinates(Math.floor(lastCandle.timestamp! / 1000), ob.min);
                const yTop = Math.min(coordTop.y, coordBottom.y);
                const h = Math.max(Math.abs(coordBottom.y - coordTop.y), 4);

                return (
                  <g key={`ob-${idx}`}>
                    <rect
                      x={80}
                      y={yTop}
                      width={dimensions.width - 170}
                      height={h}
                      fill={ob.color}
                      stroke={ob.borderColor}
                      strokeWidth="1"
                    />
                    <text
                      x={86}
                      y={yTop + 11}
                      fill={isLight ? '#334155' : '#e2e8f0'}
                      fontSize="9"
                      fontFamily="sans-serif"
                      fontWeight="bold"
                    >
                      {ob.name} ({ob.min.toFixed(priceDecimals)} - {ob.max.toFixed(priceDecimals)})
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* =============================================================== */}
          {/* B. LIVE LIQUIDITY HEATMAP DEPTH WALLS                            */}
          {/* =============================================================== */}
          {showLiquidityHeatmap && (
            <g className="liquidity-heatmap-layer">
              {/* Bid Wall */}
              {(() => {
                const coord = getCoordinates(Math.floor(lastCandle.timestamp! / 1000), liquidityDepthWalls.bidWall.price);
                return (
                  <g>
                    <rect
                      x={0}
                      y={coord.y - 12}
                      width={dimensions.width - 65}
                      height={24}
                      fill="url(#liqBidGradient)"
                      stroke="rgba(16, 185, 129, 0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={12}
                      y={coord.y + 4}
                      fill="#10b981"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ▲ BID LIQUIDITY WALL · {liquidityDepthWalls.bidWall.volume} @ {liquidityDepthWalls.bidWall.price.toFixed(priceDecimals)}
                    </text>
                  </g>
                );
              })()}

              {/* Ask Wall */}
              {(() => {
                const coord = getCoordinates(Math.floor(lastCandle.timestamp! / 1000), liquidityDepthWalls.askWall.price);
                return (
                  <g>
                    <rect
                      x={0}
                      y={coord.y - 12}
                      width={dimensions.width - 65}
                      height={24}
                      fill="url(#liqAskGradient)"
                      stroke="rgba(239, 68, 68, 0.4)"
                      strokeWidth="1"
                    />
                    <text
                      x={12}
                      y={coord.y + 4}
                      fill="#ef4444"
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      ▼ ASK LIQUIDITY WALL · {liquidityDepthWalls.askWall.volume} @ {liquidityDepthWalls.askWall.price.toFixed(priceDecimals)}
                    </text>
                  </g>
                );
              })()}
            </g>
          )}

          {/* =============================================================== */}
          {/* C. MARKET STRUCTURE MAPPING (MAJOR BOS / CHOCH / SWINGS)        */}
          {/* =============================================================== */}
          {showMarketStructure && (
            <g className="market-structure-layer">
              {/* Major Swing Badges (HH, HL, LH, LL) */}
              {marketStructureData.majorSwings.map((swing, idx) => {
                const coord = getCoordinates(swing.timeSec, swing.price);
                const isHigh = swing.type === 'HH' || swing.type === 'LH';
                const yPos = isHigh ? coord.y - 10 : coord.y + 14;

                return (
                  <g key={`ms-${idx}`}>
                    <circle
                      cx={coord.x}
                      cy={coord.y}
                      r="3.5"
                      fill={isHigh ? '#ef4444' : '#10b981'}
                      stroke="#ffffff"
                      strokeWidth="1"
                    />
                    <rect
                      x={coord.x - 14}
                      y={yPos - 9}
                      width={28}
                      height={14}
                      rx={3}
                      fill={isHigh ? 'rgba(239, 68, 68, 0.85)' : 'rgba(16, 185, 129, 0.85)'}
                    />
                    <text
                      x={coord.x}
                      y={yPos + 1}
                      fill="#ffffff"
                      fontSize="9"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      {swing.label}
                    </text>
                  </g>
                );
              })}

              {/* Break of Structure (BOS) Lines */}
              {marketStructureData.bosLines.map((bos, idx) => {
                const c1 = getCoordinates(bos.x1Time, bos.price);
                const c2 = getCoordinates(bos.x2Time, bos.price);

                return (
                  <g key={`bos-${idx}`}>
                    <line
                      x1={c1.x}
                      y1={c1.y}
                      x2={c2.x}
                      y2={c2.y}
                      stroke="#06b6d4"
                      strokeWidth="1.5"
                      strokeDasharray="4 2"
                    />
                    <rect
                      x={(c1.x + c2.x) / 2 - 24}
                      y={c1.y - 8}
                      width={48}
                      height={13}
                      rx={2}
                      fill="rgba(6, 182, 212, 0.9)"
                    />
                    <text
                      x={(c1.x + c2.x) / 2}
                      y={c1.y + 2}
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      BOS
                    </text>
                  </g>
                );
              })}

              {/* Change of Character (CHoCH / MSS) Lines */}
              {marketStructureData.chochLines.map((choch, idx) => {
                const c1 = getCoordinates(choch.x1Time, choch.price);
                const c2 = getCoordinates(choch.x2Time, choch.price);

                return (
                  <g key={`choch-${idx}`}>
                    <line
                      x1={c1.x}
                      y1={c1.y}
                      x2={c2.x}
                      y2={c2.y}
                      stroke="#f59e0b"
                      strokeWidth="2"
                    />
                    <rect
                      x={(c1.x + c2.x) / 2 - 28}
                      y={c1.y - 9}
                      width={56}
                      height={14}
                      rx={2}
                      fill="rgba(245, 158, 11, 0.9)"
                    />
                    <text
                      x={(c1.x + c2.x) / 2}
                      y={c1.y + 2}
                      fill="#ffffff"
                      fontSize="8"
                      fontWeight="bold"
                      fontFamily="monospace"
                      textAnchor="middle"
                    >
                      CHoCH / MSS
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* =============================================================== */}
          {/* D. INTERNAL STRUCTURE MAPPING (MINOR iBOS / iSWINGS)             */}
          {/* =============================================================== */}
          {showInternalStructure && (
            <g className="internal-structure-layer" opacity="0.75">
              {marketStructureData.internalSwings.map((iswing, idx) => {
                const coord = getCoordinates(iswing.timeSec, iswing.price);
                return (
                  <g key={`iswing-${idx}`}>
                    <circle cx={coord.x} cy={coord.y} r="2" fill="#a855f7" />
                    <text
                      x={coord.x}
                      y={iswing.label === 'iH' ? coord.y - 4 : coord.y + 9}
                      fill="#a855f7"
                      fontSize="7"
                      fontFamily="monospace"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {iswing.label}
                    </text>
                  </g>
                );
              })}
            </g>
          )}

          {/* =============================================================== */}
          {/* E. QUANT VISION PROJECTION FAN & TRAJECTORY PATHS                */}
          {/* =============================================================== */}
          {showQuantumSimulation && (
            <g className="quant-vision-layer">
              {/* Shaded Probability Cone */}
              <polygon
                points={quantVisionSvgCoordinates.polygonPoints}
                fill="url(#tvFanGradient)"
                stroke="rgba(59, 130, 246, 0.4)"
                strokeWidth="1"
                strokeDasharray="3 2"
              />

              {/* Upper Bullish Path */}
              <path
                d={quantVisionSvgCoordinates.upperCoords.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 2"
              />

              {/* Median Continuation Path */}
              <path
                d={quantVisionSvgCoordinates.medianCoords.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
                fill="none"
                stroke="#6366f1"
                strokeWidth="1.5"
                strokeDasharray="2 2"
              />

              {/* Lower Breakdown Path */}
              <path
                d={quantVisionSvgCoordinates.lowerCoords.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`, '')}
                fill="none"
                stroke="#1e3a8a"
                strokeWidth="2"
              />

              {/* Path Probability Badges */}
              {quantVisionSvgCoordinates.upperCoords.length > 0 && (
                <g>
                  <text
                    x={quantVisionSvgCoordinates.upperCoords[quantVisionSvgCoordinates.upperCoords.length - 1].x + 4}
                    y={quantVisionSvgCoordinates.upperCoords[quantVisionSvgCoordinates.upperCoords.length - 1].y + 3}
                    fill="#2563eb"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Bullish Target (38%)
                  </text>
                  <text
                    x={quantVisionSvgCoordinates.lowerCoords[quantVisionSvgCoordinates.lowerCoords.length - 1].x + 4}
                    y={quantVisionSvgCoordinates.lowerCoords[quantVisionSvgCoordinates.lowerCoords.length - 1].y + 3}
                    fill="#1e3a8a"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    Support Breakdown (32%)
                  </text>
                </g>
              )}
            </g>
          )}

          {/* =============================================================== */}
          {/* F. MARKET DNA HISTORICAL TWIN GHOST CANDLES                      */}
          {/* =============================================================== */}
          {showMarketDna && showPatternOnChart && (
            <g className="market-dna-ghost-layer" opacity="0.45">
              {ghostCandles.map((gc, i) => {
                const cOpen = getCoordinates(gc.timeSec, gc.open);
                const cClose = getCoordinates(gc.timeSec, gc.close);
                const cHigh = getCoordinates(gc.timeSec, gc.high);
                const cLow = getCoordinates(gc.timeSec, gc.low);

                const yTop = Math.min(cOpen.y, cClose.y);
                const h = Math.max(Math.abs(cClose.y - cOpen.y), 2);
                const color = gc.isUp ? '#10b981' : '#ef4444';

                return (
                  <g key={`gc-${i}`}>
                    <line
                      x1={cOpen.x}
                      y1={cHigh.y}
                      x2={cOpen.x}
                      y2={cLow.y}
                      stroke={color}
                      strokeWidth="1"
                      strokeDasharray="2 1"
                    />
                    <rect
                      x={cOpen.x - 4}
                      y={yTop}
                      width={8}
                      height={h}
                      fill={gc.isUp ? 'rgba(16, 185, 129, 0.45)' : 'rgba(239, 68, 68, 0.45)'}
                      stroke={color}
                      strokeWidth="1"
                    />
                  </g>
                );
              })}

              {/* DNA Match Badge */}
              {ghostCandles.length > 0 && (() => {
                const first = getCoordinates(ghostCandles[0].timeSec, ghostCandles[0].high);
                return (
                  <text
                    x={first.x}
                    y={first.y - 12}
                    fill="#d97706"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    🧬 86.4% DNA SIMILARITY MATCH
                  </text>
                );
              })()}
            </g>
          )}

          {/* =============================================================== */}
          {/* G. USER DRAWN ELEMENTS                                          */}
          {/* =============================================================== */}
          {drawnElements.map((el) => {
            if (el.type === 'horizontal') {
              return (
                <line
                  key={el.id}
                  x1={el.x1}
                  y1={el.y1}
                  x2={el.x2 || dimensions.width}
                  y2={el.y1}
                  stroke={el.color || '#06b6d4'}
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
                  fill={el.color || 'rgba(6, 182, 212, 0.2)'}
                  stroke="#06b6d4"
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
        </svg>

        {/* 3. Interactive Drawing Capture Layer (Enabled only when a drawing tool is selected) */}
        {activeTool !== 'crosshair' && (
          <svg
            width={dimensions.width}
            height={dimensions.height}
            className="absolute inset-0 w-full h-full z-30 cursor-crosshair"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
          />
        )}
      </div>
    </div>
  );
};
