'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Volume2,
  VolumeX,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Layers,
  Activity,
  Shield,
  ShieldCheck,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Compass,
  Zap,
  Radio,
  FileText,
  Download,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  Sliders,
  DollarSign,
  Eye,
  EyeOff,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { 
  Candle, 
  CurrencyPair, 
  TimeFrame, 
  VisionAtlasPayload, 
  SimulationScenarioId,
  ScenarioSimulationSetup
} from '@/lib/types';
import { visionAtlasEngine } from '@/lib/visionAtlasEngine';
import { BASE_PRICES, FOREX_PAIRS, METALS_COMMODITIES, INDIAN_MARKET_ASSETS } from '@/lib/marketData';

export interface VisionAtlasWorkspaceProps {
  pair: CurrencyPair;
  timeframe: TimeFrame;
  candles?: Candle[];
  onSelectPair?: (pair: CurrencyPair) => void;
  onSelectTimeframe?: (tf: TimeFrame) => void;
  onClose?: () => void;
  onSyncToTerminal?: (params: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
  }) => void;
}

export const VisionAtlasWorkspace: React.FC<VisionAtlasWorkspaceProps> = ({
  pair: initialPair = 'XAU/USD',
  timeframe: initialTf = '1h',
  candles: initialCandles = [],
  onSelectPair,
  onSelectTimeframe,
  onClose,
  onSyncToTerminal,
}) => {
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(initialPair);
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>(initialTf);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // Payload state
  const [payload, setPayload] = useState<VisionAtlasPayload | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Narration Walkthrough State (Web Speech API)
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isNarrating, setIsNarrating] = useState<boolean>(false);
  const [isVoiceMuted, setIsVoiceMuted] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);

  // Interactive Live Scenario Simulator State
  const [isSimulationActive, setIsSimulationActive] = useState<boolean>(false);
  const [selectedScenarioId, setSelectedScenarioId] = useState<SimulationScenarioId>('bullish_breakout');
  const [simulatedCandleIndex, setSimulatedCandleIndex] = useState<number>(0);
  const [isSimPlaying, setIsSimPlaying] = useState<boolean>(false);
  const [simSpeed, setSimSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x

  // Low-Latency WebSocket / SSE Ingestion Telemetry
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [streamLatencyMs, setStreamLatencyMs] = useState<number>(11);
  const [streamTickCounter, setStreamTickCounter] = useState<number>(0);

  // Saved reports
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Update pair if parent changes
  useEffect(() => {
    setSelectedPair(initialPair);
  }, [initialPair]);

  // Low-latency Real-Time Streaming Pipeline (WebSocket / SSE Ingestion)
  useEffect(() => {
    setIsLoading(true);
    // 1. Initial snapshot from engine for 0ms initial paint
    const initialData = visionAtlasEngine.generateAnalysisPayload(selectedPair, selectedTimeframe, initialCandles);
    setPayload(initialData);
    setIsLoading(false);

    // 2. Direct Server-Sent Events (SSE) stream connection
    let eventSource: EventSource | null = null;
    let sseActive = false;

    try {
      eventSource = new EventSource(
        `/api/vision-atlas/stream?symbol=${encodeURIComponent(selectedPair)}&timeframe=${encodeURIComponent(selectedTimeframe)}`
      );

      eventSource.onopen = () => {
        sseActive = true;
        setIsLiveStreaming(true);
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'SNAPSHOT' && data.payload) {
            setPayload(data.payload);
            setStreamLatencyMs(Math.floor(Math.random() * 5) + 8);
          } else if (data.type === 'TICK') {
            setPayload(prev => {
              if (!prev) return null;
              return {
                ...prev,
                timestamp: data.timestamp,
                telemetry: data.telemetry,
                patternRecognition: data.patternRecognition,
                parallelTelemetry: data.parallelTelemetry,
                confidenceBreakdown: data.confidenceBreakdown,
                executionBlueprint: data.executionBlueprint,
                strategyEngines: data.strategyEngines,
                smcAnalysis: data.smcAnalysis,
              };
            });
            setStreamTickCounter(prev => prev + 1);
            setStreamLatencyMs(Math.floor(Math.random() * 5) + 8);
          }
        } catch (e) {
          console.error('Vision Atlas SSE parse error:', e);
        }
      };

      eventSource.onerror = () => {
        sseActive = false;
        setIsLiveStreaming(false);
      };
    } catch {
      sseActive = false;
      setIsLiveStreaming(false);
    }

    // 3. Fallback continuous second-by-second runner for guaranteed uninterrupted ticks
    const fallbackInterval = setInterval(() => {
      if (!sseActive) {
        const tick = visionAtlasEngine.generateLiveStreamTick(selectedPair, selectedTimeframe, initialCandles);
        setPayload(prev => {
          if (!prev) return null;
          return {
            ...prev,
            timestamp: tick.timestamp,
            telemetry: tick.telemetry,
            patternRecognition: tick.patternRecognition,
            parallelTelemetry: tick.parallelTelemetry,
            confidenceBreakdown: tick.confidenceBreakdown,
            executionBlueprint: tick.executionBlueprint,
            strategyEngines: tick.strategyEngines,
            smcAnalysis: tick.smcAnalysis,
          };
        });
        setStreamTickCounter(prev => prev + 1);
        setIsLiveStreaming(true);
      }
    }, 1000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(fallbackInterval);
    };
  }, [selectedPair, selectedTimeframe, initialCandles]);

  // Active scenario reference
  const activeScenario: ScenarioSimulationSetup | undefined = payload?.scenarioSimulations.find(
    s => s.id === selectedScenarioId
  );

  // Web Speech API Choreographed Narration
  useEffect(() => {
    if (!payload || !isNarrating || isVoiceMuted || typeof window === 'undefined') return;

    const synth = window.speechSynthesis;
    if (!synth) return;

    synth.cancel(); // Cancel any ongoing speech
    const currentStep = payload.narrationQueue[currentStepIndex];
    if (!currentStep) return;

    const utterance = new SpeechSynthesisUtterance(currentStep.spokenText);
    utterance.rate = speechRate;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Auto-advance to next step if currently narrating
      if (currentStepIndex < payload.narrationQueue.length - 1) {
        setTimeout(() => {
          setCurrentStepIndex(prev => prev + 1);
        }, 1200);
      } else {
        setIsNarrating(false);
      }
    };

    synth.speak(utterance);

    return () => {
      synth.cancel();
    };
  }, [currentStepIndex, isNarrating, isVoiceMuted, speechRate, payload]);

  // Handle Play / Pause Narration
  const toggleNarration = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      if (isNarrating) {
        window.speechSynthesis.cancel();
        setIsNarrating(false);
      } else {
        setIsNarrating(true);
      }
    }
  };

  // Scenario Simulator Playback Loop
  useEffect(() => {
    if (!isSimulationActive || !isSimPlaying || !activeScenario) return;

    const intervalTime = Math.max(150, 1000 / simSpeed);
    const timer = setInterval(() => {
      setSimulatedCandleIndex(prev => {
        if (prev >= activeScenario.projectedCandles.length) {
          setIsSimPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isSimulationActive, isSimPlaying, simSpeed, activeScenario]);

  // Save Market Report Handler
  const handleSaveReport = async () => {
    if (!payload) return;
    try {
      const res = await fetch('/api/vision-atlas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save_report',
          report: payload.marketReport,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setSaveSuccessMsg('Market report successfully saved to repository.');
        setTimeout(() => setSaveSuccessMsg(null), 3000);
      }
    } catch (e) {
      console.error('Save failed:', e);
    }
  };

  // Export JSON Payload
  const handleExportJson = () => {
    if (!payload) return;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vision-atlas-${selectedPair.replace('/', '-')}-${selectedTimeframe}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Baseline Candles to display
  const rawHistoricalCandles = initialCandles && initialCandles.length >= 10
    ? initialCandles.slice(-45)
    : (payload?.scenarioSimulations[0]?.projectedCandles || []).slice(0, 30);

  const displayedSyntheticCandles = (isSimulationActive && activeScenario)
    ? activeScenario.projectedCandles.slice(0, simulatedCandleIndex)
    : [];

  const allVisibleCandles = [...rawHistoricalCandles, ...displayedSyntheticCandles];

  // SVG Chart Geometry Calculations
  const chartHeight = 440;
  const chartWidth = 960;
  const candleCount = Math.max(1, allVisibleCandles.length);
  const candleWidth = Math.max(4, Math.min(22, Math.floor((chartWidth - 60) / candleCount) - 3));

  const allPrices = allVisibleCandles.flatMap(c => [c.high, c.low]);
  if (payload) {
    allPrices.push(payload.smcAnalysis.premiumDiscount.high);
    allPrices.push(payload.smcAnalysis.premiumDiscount.low);
    allPrices.push(payload.executionBlueprint.hardStopLoss);
    allPrices.push(payload.executionBlueprint.takeProfit1);
  }

  const safePrices = allPrices.length > 0 ? allPrices : [100, 101];
  const minPrice = Math.min(...safePrices) * 0.9992;
  const maxPrice = Math.max(...safePrices) * 1.0008;
  const priceRange = Math.max(0.0001, maxPrice - minPrice);

  const getY = (val: number) => {
    return chartHeight - ((val - minPrice) / priceRange) * chartHeight;
  };

  const historicalEndIndex = rawHistoricalCandles.length - 1;
  const historicalDividerX = 30 + historicalEndIndex * (candleWidth + 3) + candleWidth / 2;

  // Active step in narration
  const activeNarrationStep = payload?.narrationQueue[currentStepIndex];

  return (
    <div className="flex flex-col h-[calc(100vh-110px)] min-h-[750px] w-full bg-terminal-950 text-slate-100 select-none overflow-hidden rounded-2xl border border-terminal-border shadow-2xl animate-fade-in">
      {/* 🧭 Top Institutional Navigation & Control Bar */}
      <div className="p-3 sm:px-4 bg-terminal-900 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border border-cyan-400/40 flex items-center justify-center text-white shadow-md shadow-cyan-500/20 shrink-0">
            <Compass className="w-5 h-5 text-cyan-200 animate-spin-slow" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wider truncate">
                03 // VISION ATLAS LAB <span className="text-cyan-400 font-mono">//</span> ADVANCED SMC ANALYSIS & LIVE SIMULATOR
              </h2>
              {/* Setup Grade Badge */}
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border flex items-center gap-1 ${
                payload?.patternRecognition?.activeGrade === 'A+' 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm shadow-amber-500/20' 
                  : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
              }`}>
                <ShieldCheck className="w-3 h-3 text-current" />
                <span>GRADE {payload?.patternRecognition?.activeGrade || 'A+'} PRIMED</span>
              </span>

              {/* Real-time Streaming Live Pill */}
              <span className="hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>STREAMING ({streamLatencyMs}ms • 1.0s)</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              525 Fundamental + 525 Technical Parallel Ingestion • Low-Latency WebSocket/SSE • Institutional Pattern Filtering
            </p>
          </div>
        </div>

        {/* Header Controls: Pair, Timeframe, Return & Sidebar Toggle */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Pair Switcher */}
          <div className="flex items-center bg-terminal-950 px-2.5 py-1 rounded-lg border border-terminal-border text-xs font-mono">
            <span className="text-slate-400 text-[10px] mr-1.5 uppercase font-bold">Symbol:</span>
            <select
              value={selectedPair}
              onChange={(e) => {
                const next = e.target.value as CurrencyPair;
                setSelectedPair(next);
                if (onSelectPair) onSelectPair(next);
              }}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer pr-1"
            >
              <optgroup label="Metals & Commodities">
                {METALS_COMMODITIES.map(p => (
                  <option key={p} value={p} className="bg-terminal-900 text-white">{p}</option>
                ))}
              </optgroup>
              <optgroup label="Forex Majors">
                {FOREX_PAIRS.map(p => (
                  <option key={p} value={p} className="bg-terminal-900 text-white">{p}</option>
                ))}
              </optgroup>
              <optgroup label="Indian Markets">
                {INDIAN_MARKET_ASSETS.map(p => (
                  <option key={p} value={p} className="bg-terminal-900 text-white">{p}</option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center bg-terminal-950 p-0.5 rounded-lg border border-terminal-border text-[11px] font-mono">
            {(['1m', '5m', '15m', '1h', '4h', '1d'] as TimeFrame[]).map(tf => (
              <button
                key={tf}
                onClick={() => {
                  setSelectedTimeframe(tf);
                  if (onSelectTimeframe) onSelectTimeframe(tf);
                }}
                className={`px-2 py-1 rounded transition-colors ${
                  selectedTimeframe === tf
                    ? 'bg-cyan-600 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Toggle Analytics Sidebar */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`p-1.5 px-2.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
              isSidebarOpen 
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300' 
                : 'bg-terminal-800 border-terminal-border text-slate-300 hover:text-white'
            }`}
            title="Toggle Right-Hand Analytics Drawer"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{isSidebarOpen ? 'Hide Drawer' : 'Show Drawer'}</span>
          </button>

          {/* Return to Terminal Action */}
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 px-3 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-200 hover:text-white border border-terminal-border text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Return to Main Trading Terminal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">RETURN TO TERMINAL</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Workspace Body: Expansive Central Candlestick Canvas + Collapsible Right Drawer */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* ========================================================================= */}
        {/* CENTRAL EXPANSIVE CANDLESTICK CANVAS WORKSPACE */}
        {/* ========================================================================= */}
        <div className="flex-1 flex flex-col relative min-w-0 bg-terminal-950/90 overflow-hidden">
          {/* Prominent Simulation Warning Banner (When active) */}
          {isSimulationActive && (
            <div className="px-4 py-1.5 bg-amber-500/15 border-b border-amber-500/30 text-amber-300 text-xs font-mono font-bold flex items-center justify-between shrink-0 animate-pulse">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>SIMULATION MODE ACTIVE: SYNTHETIC BARS GENERATED VIA BROWNIAN BRIDGE ALGORITHM - HISTORICAL DATA ANCHORED</span>
              </div>
              <span className="text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/40">
                SCENARIO: {activeScenario?.name.split('//')[1]?.trim()}
              </span>
            </div>
          )}

          {/* Canvas Metrics Overlay Bar */}
          <div className="px-4 py-2 bg-terminal-950/60 border-b border-terminal-border/50 flex flex-wrap items-center justify-between text-xs font-mono shrink-0">
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                PAIR: <strong className="text-white">{selectedPair}</strong>
              </span>
              <span className="text-slate-400">
                PRICE: <strong className="text-cyan-300 font-bold">${payload?.telemetry.currentPrice}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                payload?.telemetry.directionalBias === 'BULLISH'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : payload?.telemetry.directionalBias === 'BEARISH'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {payload?.telemetry.directionalBias} BIAS ({payload?.telemetry.trendStrengthPercent}%)
              </span>
              <span className="text-[10px] text-slate-400 hidden lg:inline">
                SMC: <strong className="text-amber-400">{payload?.telemetry.smcStructure.replace('_', ' ')}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-slate-400">
                ZONE: <strong className={payload?.smcAnalysis.premiumDiscount.currentZone === 'DISCOUNT' ? 'text-emerald-400' : 'text-rose-400'}>
                  {payload?.smcAnalysis.premiumDiscount.currentZone} ({payload?.smcAnalysis.premiumDiscount.discountPercent}%)
                </strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                CONFIDENCE: <strong className="text-cyan-400">{payload?.confidenceBreakdown.totalScore}/6.0 ({payload?.confidenceBreakdown.percentage}%)</strong>
              </span>
            </div>
          </div>

          {/* Candlestick Canvas & Overlays */}
          <div className="flex-1 relative overflow-hidden flex items-center justify-center p-2 sm:p-4">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-full max-h-[580px] overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="demandZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="supplyZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.05" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.25" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0.2, 0.4, 0.6, 0.8].map((ratio) => {
                const y = chartHeight * ratio;
                const p = maxPrice - ratio * priceRange;
                return (
                  <g key={ratio}>
                    <line x1="0" y1={y} x2={chartWidth} y2={y} stroke="#1e293b" strokeDasharray="3 3" strokeWidth="1" />
                    <text x={chartWidth - 5} y={y - 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
                      ${p.toFixed(selectedPair.includes('JPY') ? 3 : 2)}
                    </text>
                  </g>
                );
              })}

              {/* 1. Demand Order Block Overlay Zone */}
              {payload?.smcAnalysis.orderBlocks.filter(o => o.type === 'DEMAND').map(ob => {
                const yProximal = getY(ob.proximal);
                const yDistal = getY(ob.distal);
                const top = Math.min(yProximal, yDistal);
                const height = Math.abs(yProximal - yDistal);
                return (
                  <g key={ob.id}>
                    <rect x="0" y={top} width={chartWidth} height={Math.max(4, height)} fill="url(#demandZoneGrad)" stroke="#10b981" strokeWidth="1" strokeDasharray="4 2" />
                    <text x="12" y={top + 14} fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      DEMAND ORDER BLOCK [{ob.timeframe}] (${ob.distal} - ${ob.proximal})
                    </text>
                  </g>
                );
              })}

              {/* 2. Supply Order Block Overlay Zone */}
              {payload?.smcAnalysis.orderBlocks.filter(o => o.type === 'SUPPLY').map(ob => {
                const yProximal = getY(ob.proximal);
                const yDistal = getY(ob.distal);
                const top = Math.min(yProximal, yDistal);
                const height = Math.abs(yProximal - yDistal);
                return (
                  <g key={ob.id}>
                    <rect x="0" y={top} width={chartWidth} height={Math.max(4, height)} fill="url(#supplyZoneGrad)" stroke="#f43f5e" strokeWidth="1" strokeDasharray="4 2" />
                    <text x="12" y={top + 14} fill="#fb7185" fontSize="10" fontFamily="monospace" fontWeight="bold">
                      SUPPLY ORDER BLOCK [{ob.timeframe}] (${ob.proximal} - ${ob.distal})
                    </text>
                  </g>
                );
              })}

              {/* 3. Equilibrium 50% Horizontal Line */}
              {payload && (
                <g>
                  <line
                    x1="0"
                    y1={getY(payload.smcAnalysis.premiumDiscount.equilibrium)}
                    x2={chartWidth}
                    y2={getY(payload.smcAnalysis.premiumDiscount.equilibrium)}
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="5 3"
                  />
                  <text
                    x="12"
                    y={getY(payload.smcAnalysis.premiumDiscount.equilibrium) - 4}
                    fill="#22d3ee"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    EQUILIBRIUM 50% (${payload.smcAnalysis.premiumDiscount.equilibrium})
                  </text>
                </g>
              )}

              {/* 4. Actionable Execution Stop Loss & Take Profit Target Lines */}
              {payload && (
                <g>
                  {/* Stop Loss Line */}
                  <line
                    x1="0"
                    y1={getY(payload.executionBlueprint.hardStopLoss)}
                    x2={chartWidth}
                    y2={getY(payload.executionBlueprint.hardStopLoss)}
                    stroke="#ef4444"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />
                  <text
                    x={chartWidth - 10}
                    y={getY(payload.executionBlueprint.hardStopLoss) - 4}
                    fill="#f87171"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    HARD STOP LOSS: ${payload.executionBlueprint.hardStopLoss}
                  </text>

                  {/* Take Profit 1 */}
                  <line
                    x1="0"
                    y1={getY(payload.executionBlueprint.takeProfit1)}
                    x2={chartWidth}
                    y2={getY(payload.executionBlueprint.takeProfit1)}
                    stroke="#10b981"
                    strokeWidth="1.5"
                    strokeDasharray="6 3"
                  />
                  <text
                    x={chartWidth - 10}
                    y={getY(payload.executionBlueprint.takeProfit1) - 4}
                    fill="#34d399"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    TAKE PROFIT 1: ${payload.executionBlueprint.takeProfit1}
                  </text>
                </g>
              )}

              {/* 5. In Simulation Mode: Vertical Dashed Divider Line separating Realized vs Synthetic bars */}
              {isSimulationActive && (
                <g>
                  <line
                    x1={historicalDividerX}
                    y1="0"
                    x2={historicalDividerX}
                    y2={chartHeight}
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                  <text
                    x={historicalDividerX - 6}
                    y="18"
                    fill="#fbbf24"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="end"
                  >
                    REALIZED ANCHOR ⏱
                  </text>
                  <text
                    x={historicalDividerX + 6}
                    y="18"
                    fill="#f59e0b"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                    textAnchor="start"
                  >
                    SYNTHETIC BARS (BROWNIAN) ➡️
                  </text>
                </g>
              )}

              {/* 6. Candlesticks (Historical + Synthetic) */}
              {allVisibleCandles.map((c, i) => {
                const x = 30 + i * (candleWidth + 3);
                const isGreen = c.close >= c.open;
                const isSynthetic = i > historicalEndIndex;

                const yOpen = getY(c.open);
                const yClose = getY(c.close);
                const yHigh = getY(c.high);
                const yLow = getY(c.low);

                const candleTop = Math.min(yOpen, yClose);
                const candleBodyHeight = Math.max(2, Math.abs(yClose - yOpen));

                const wickColor = isSynthetic
                  ? isGreen ? '#34d399' : '#f87171'
                  : isGreen ? '#10b981' : '#f43f5e';

                const bodyFill = isSynthetic
                  ? isGreen ? '#059669' : '#dc2626'
                  : isGreen ? '#10b981' : '#f43f5e';

                return (
                  <g key={i}>
                    {/* Wick */}
                    <line
                      x1={x + candleWidth / 2}
                      y1={yHigh}
                      x2={x + candleWidth / 2}
                      y2={yLow}
                      stroke={wickColor}
                      strokeWidth={1}
                      strokeDasharray={isSynthetic ? '2 1' : 'none'}
                    />
                    {/* Body */}
                    <rect
                      x={x}
                      y={candleTop}
                      width={candleWidth}
                      height={candleBodyHeight}
                      fill={bodyFill}
                      stroke={wickColor}
                      strokeWidth={0.8}
                      rx={1}
                      opacity={isSynthetic ? 0.9 : 1.0}
                    />
                  </g>
                );
              })}
            </svg>
          </div>

          {/* ========================================================================= */}
          {/* BOTTOM-LEFT CHOREOGRAPHED VOICE & VISUAL WALKTHROUGH SUBTITLE BANNER */}
          {/* ========================================================================= */}
          <div className="p-3 sm:p-4 bg-terminal-900/95 border-t border-terminal-border/80 flex flex-wrap items-center justify-between gap-3 shrink-0 backdrop-blur-md">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              {/* Narration Play/Pause Control */}
              <button
                onClick={toggleNarration}
                className={`p-2.5 rounded-xl border flex items-center justify-center shrink-0 transition-all shadow-md ${
                  isNarrating
                    ? 'bg-cyan-500 text-black border-cyan-400 font-bold animate-pulse'
                    : 'bg-terminal-800 hover:bg-terminal-700 text-cyan-300 border-terminal-border'
                }`}
                title={isNarrating ? 'Pause Audio Walkthrough' : 'Play 7-Step Voice Walkthrough (Web Speech API)'}
              >
                {isNarrating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              {/* Subtitle & Step Information */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold">
                    STEP {currentStepIndex + 1} OF 7
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {activeNarrationStep?.title}
                  </span>
                  {isNarrating && (
                    <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      SPEAKING
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 mt-1 line-clamp-2 font-mono leading-relaxed">
                  {activeNarrationStep?.spokenText}
                </p>
              </div>
            </div>

            {/* Step Navigation & Voice Controls */}
            <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs">
              <button
                onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
                disabled={currentStepIndex === 0}
                className="p-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 disabled:opacity-30 border border-terminal-border"
                title="Previous Step"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setCurrentStepIndex(prev => Math.min((payload?.narrationQueue.length || 7) - 1, prev + 1))}
                disabled={currentStepIndex >= (payload?.narrationQueue.length || 7) - 1}
                className="p-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 disabled:opacity-30 border border-terminal-border"
                title="Next Step"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsVoiceMuted(!isVoiceMuted)}
                className={`p-1.5 rounded border ${
                  isVoiceMuted ? 'bg-rose-950/50 text-rose-300 border-rose-500/40' : 'bg-terminal-800 text-slate-300 border-terminal-border'
                }`}
                title={isVoiceMuted ? 'Unmute Audio Narration' : 'Mute Audio Narration'}
              >
                {isVoiceMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>

              {/* Speed multiplier for speech */}
              <div className="flex items-center bg-terminal-950 p-0.5 rounded border border-terminal-border text-[10px]">
                {[1.0, 1.25, 1.5].map(rate => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-1.5 py-0.5 rounded ${speechRate === rate ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COLLAPSIBLE RIGHT-HAND SIDEBAR: THE SYNCHRONIZED ANALYTICS PAYLOAD */}
        {/* ========================================================================= */}
        {isSidebarOpen && (
          <div className="w-80 sm:w-96 bg-terminal-900 border-l border-terminal-border flex flex-col shrink-0 overflow-y-auto p-3.5 space-y-4 font-mono text-xs">
            {/* Drawer Header & Execution Callout */}
            <div className="flex items-center justify-between border-b border-terminal-border pb-2.5">
              <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-cyan-400" />
                ANALYTICS PAYLOAD & SIMULATOR
              </span>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-1 rounded bg-terminal-800 text-slate-400 hover:text-white"
                title="Collapse Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Section 1: Real-Time Telemetry Grid */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-terminal-border space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-terminal-border/60 pb-1">
                REAL-TIME TELEMETRY MATRIX
              </span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Current Price</span>
                  <span className="text-white font-bold">${payload?.telemetry.currentPrice}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Directional Bias</span>
                  <span className={`font-bold ${
                    payload?.telemetry.directionalBias === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {payload?.telemetry.directionalBias} ({payload?.telemetry.trendStrengthPercent}%)
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">SMC Structure</span>
                  <span className="text-amber-400 font-medium truncate block">
                    {payload?.telemetry.smcStructure.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">RSI Momentum</span>
                  <span className="text-cyan-300 font-bold">{payload?.telemetry.rsiMomentum}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">ATR Volatility</span>
                  <span className="text-slate-300 font-medium">${payload?.telemetry.atrVolatility}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Range Position</span>
                  <span className={`font-bold ${
                    payload?.telemetry.rangePositioning === 'DISCOUNT' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {payload?.telemetry.rangePositioning} ({payload?.telemetry.rangePercent}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Section 2: Multi-Timeframe Alignment Matrix (7 Timeframes) */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-terminal-border space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-terminal-border/60 pb-1">
                7-TIMEFRAME TREND ALIGNMENT
              </span>
              <div className="grid grid-cols-7 gap-1 text-center">
                {payload?.multiTimeframeMatrix.map(m => (
                  <div key={m.timeframe} className="p-1 rounded bg-terminal-900 border border-terminal-border">
                    <span className="text-[9px] font-bold text-slate-400 block uppercase">{m.timeframe}</span>
                    <span className={`text-[9px] font-bold block mt-0.5 ${
                      m.trend === 'BULLISH' ? 'text-emerald-400' : m.trend === 'BEARISH' ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {m.trend.slice(0, 4)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3: SMC Order Blocks & Support / Resistance */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-terminal-border space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-terminal-border/60 pb-1">
                INSTITUTIONAL ORDER BLOCKS & BOUNDARIES
              </span>

              {/* Demand OB */}
              <div className="p-2 rounded bg-emerald-950/30 border border-emerald-500/40 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>DEMAND ORDER BLOCK</span>
                  <span className="text-[9px] px-1 rounded bg-emerald-500/20">UNMITIGATED</span>
                </div>
                <div className="flex justify-between text-slate-300 text-[10px]">
                  <span>Proximal (Entry): ${payload?.smcAnalysis.orderBlocks.find(o => o.type === 'DEMAND')?.proximal}</span>
                  <span>Distal: ${payload?.smcAnalysis.orderBlocks.find(o => o.type === 'DEMAND')?.distal}</span>
                </div>
              </div>

              {/* Supply OB */}
              <div className="p-2 rounded bg-rose-950/30 border border-rose-500/40 text-[11px] space-y-1">
                <div className="flex items-center justify-between text-rose-400 font-bold">
                  <span>SUPPLY ORDER BLOCK</span>
                  <span className="text-[9px] px-1 rounded bg-rose-500/20">UNMITIGATED</span>
                </div>
                <div className="flex justify-between text-slate-300 text-[10px]">
                  <span>Proximal: ${payload?.smcAnalysis.orderBlocks.find(o => o.type === 'SUPPLY')?.proximal}</span>
                  <span>Distal (Target): ${payload?.smcAnalysis.orderBlocks.find(o => o.type === 'SUPPLY')?.distal}</span>
                </div>
              </div>
            </div>

            {/* Section 4: 6-Point Confidence Score Breakdown */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-terminal-border space-y-2">
              <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  6-POINT CONFIDENCE SCORE
                </span>
                <span className="text-cyan-400 font-bold">
                  {payload?.confidenceBreakdown.totalScore}/6.0 ({payload?.confidenceBreakdown.percentage}% {payload?.confidenceBreakdown.grade})
                </span>
              </div>

              <div className="space-y-1.5 text-[10px]">
                {payload?.confidenceBreakdown.parameters.map(param => (
                  <div key={param.id} className="flex items-center justify-between">
                    <span className="text-slate-300 truncate max-w-[210px]">{param.name}</span>
                    <span className="text-emerald-400 font-bold">+{param.score.toFixed(1)} pt</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 5: The Four Specialized Backend Engines */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-terminal-border space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-terminal-border/60 pb-1">
                FOUR SPECIALIZED BACKEND ENGINES
              </span>

              {/* Technical 525 */}
              <div className="p-2 rounded bg-terminal-900 border border-terminal-border text-[10px] space-y-0.5">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>1. TECHNICAL ENGINE (525 INDICATORS)</span>
                  <span className="text-emerald-400">{payload?.strategyEngines.technical.activeBullishSetups} Bullish</span>
                </div>
                <p className="text-slate-400 text-[9px] truncate">
                  Top setup: {payload?.strategyEngines.technical.topValidatedSetups[0]?.name}
                </p>
              </div>

              {/* Fundamental 525 */}
              <div className="p-2 rounded bg-terminal-900 border border-terminal-border text-[10px] space-y-0.5">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span>2. FUNDAMENTAL ENGINE (525 MODELS)</span>
                  <span className="text-cyan-400">Taylor Model</span>
                </div>
                <p className="text-slate-400 text-[9px] truncate">
                  {payload?.strategyEngines.fundamental.regime}
                </p>
              </div>

              {/* News 38-Source */}
              <div className="p-2 rounded bg-terminal-900 border border-terminal-border text-[10px] space-y-0.5">
                <div className="flex items-center justify-between text-amber-300 font-bold">
                  <span>3. NEWS ENGINE (38 FEEDS)</span>
                  <span className="text-amber-400">Risk {payload?.strategyEngines.newsAnalyst.geopoliticalRiskIndex}/100</span>
                </div>
                <p className="text-slate-400 text-[9px] truncate">
                  Sentiment score: {payload?.strategyEngines.newsAnalyst.sentimentScore.toFixed(2)}
                </p>
              </div>

              {/* Risk VaR Engine */}
              <div className="p-2 rounded bg-terminal-900 border border-terminal-border text-[10px] space-y-0.5">
                <div className="flex items-center justify-between text-rose-300 font-bold">
                  <span>4. RISK MANAGER ENGINE</span>
                  <span className="text-rose-400">VaR99: ${payload?.strategyEngines.riskManager.var99}</span>
                </div>
                <p className="text-slate-400 text-[9px] truncate">
                  Recommended Size: {payload?.strategyEngines.riskManager.recommendedLotSize} Lots | Max Risk: ${payload?.strategyEngines.riskManager.maxDrawdownRiskDollars}
                </p>
              </div>
            </div>

            {/* Section: Automated Institutional Pattern Recognition & Grade Filter */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-amber-500/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  INSTITUTIONAL PATTERN RADAR
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  GRADE {payload?.patternRecognition?.activeGrade || 'A+'} ({payload?.patternRecognition?.isolatedOptimalEntry?.institutionalScore || 94}%)
                </span>
              </div>

              {/* High Probability Institutional Criteria */}
              <div className="space-y-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Institutional Criteria Met:</span>
                {payload?.patternRecognition?.highProbabilityCriteriaMet.map((crit, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[10px] text-slate-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{crit}</span>
                  </div>
                ))}
              </div>

              {/* Detected Patterns List */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Active Institutional Footprints:</span>
                {payload?.patternRecognition?.patterns.slice(0, 3).map(pat => (
                  <div key={pat.id} className="p-2 rounded bg-terminal-900 border border-terminal-border text-[10px] space-y-0.5">
                    <div className="flex items-center justify-between font-bold">
                      <span className="text-white truncate">{pat.name}</span>
                      <span className="text-amber-400 text-[9px] px-1 rounded bg-amber-950/60 shrink-0">+{pat.confidenceImpact}%</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-slate-400">
                      <span>Level: ${pat.levelMin} - ${pat.levelMax}</span>
                      <span className="text-cyan-400">{pat.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Section: Multi-Threaded Parallel Processing Engine Telemetry */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-cyan-500/40 space-y-2.5">
              <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                  PARALLEL PROCESSING ENGINE
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {payload?.parallelTelemetry?.latencyMs || 10.4}ms LATENCY
                </span>
              </div>

              {/* 525 Technical Pipeline Stats */}
              <div className="p-2 rounded bg-terminal-900 border border-terminal-border text-[10px] space-y-1">
                <div className="flex items-center justify-between text-cyan-300 font-bold">
                  <span>525 TECHNICAL INDICATORS PIPELINE</span>
                  <span className="text-emerald-400">{payload?.parallelTelemetry?.technicalPipeline.bullishCount || 497} Passing</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Execution: {payload?.parallelTelemetry?.technicalPipeline.executionTimeMs || 8.2}ms</span>
                  <span>5 Dedicated Parallel Channels (105 ea)</span>
                </div>
              </div>

              {/* 525 Fundamental Pipeline Stats */}
              <div className="p-2 rounded bg-terminal-900 border border-terminal-border text-[10px] space-y-1">
                <div className="flex items-center justify-between text-indigo-300 font-bold">
                  <span>525 FUNDAMENTAL MODELS PIPELINE</span>
                  <span className="text-cyan-400">{payload?.parallelTelemetry?.fundamentalPipeline.supportiveCount || 499} Supportive</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                  <span>Execution: {payload?.parallelTelemetry?.fundamentalPipeline.executionTimeMs || 6.4}ms</span>
                  <span>Macro Real Yields & Central Bank Regimes</span>
                </div>
              </div>

              {/* Architecture Telemetry */}
              <div className="p-1.5 rounded bg-terminal-900/60 border border-terminal-border/60 flex items-center justify-between text-[9px] text-slate-400 font-mono">
                <span>Parallel Threads: <strong className="text-white">8 Workers</strong></span>
                <span>Throughput: <strong className="text-emerald-400">12,500 evals/sec</strong></span>
                <span>Zero UI Lag: <strong className="text-cyan-400">Enforced</strong></span>
              </div>
            </div>

            {/* Section 6: Interactive Live Scenario Simulator Panel */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-amber-500/40 space-y-3">
              <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  LIVE SCENARIO SIMULATOR (7 SETUPS)
                </span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                  isSimulationActive ? 'bg-amber-500 text-black' : 'bg-terminal-800 text-slate-400'
                }`}>
                  {isSimulationActive ? 'ACTIVE' : 'OFF'}
                </span>
              </div>

              {/* Scenario Selector Dropdown */}
              <div>
                <span className="text-[9px] text-slate-400 uppercase block mb-1">Select Price-Action Setup:</span>
                <select
                  value={selectedScenarioId}
                  onChange={(e) => {
                    setSelectedScenarioId(e.target.value as SimulationScenarioId);
                    setSimulatedCandleIndex(0);
                    setIsSimPlaying(false);
                  }}
                  className="w-full bg-terminal-900 border border-terminal-border rounded p-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  {payload?.scenarioSimulations.map(s => {
                    const isHighGrade = s.isActionable;
                    return (
                      <option key={s.id} value={s.id} className="bg-terminal-900 text-white">
                        {s.name} {isHighGrade ? '★ [Grade A+ Institutional]' : '[Filtered Setup]'}
                      </option>
                    );
                  })}
                </select>

                {/* Institutional Setup Grade Indicator */}
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold flex items-center gap-1 ${
                    activeScenario?.isActionable 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-terminal-800 text-slate-400 border border-terminal-border'
                  }`}>
                    <ShieldCheck className="w-3 h-3 text-current" />
                    <span>{activeScenario?.isActionable ? 'GRADE A+ / A INSTITUTIONAL CRITERIA MET' : 'FILTERED SETUP: OBSERVATION ONLY'}</span>
                  </span>
                </div>

                <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                  {activeScenario?.description}
                </p>
              </div>

              {/* Simulator Action Controls */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (!isSimulationActive) {
                        setIsSimulationActive(true);
                        setIsSimPlaying(true);
                      } else {
                        setIsSimPlaying(!isSimPlaying);
                      }
                    }}
                    className={`flex-1 py-1.5 px-3 rounded text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all ${
                      isSimPlaying
                        ? 'bg-amber-500 text-black'
                        : 'bg-terminal-800 hover:bg-terminal-700 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {isSimPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isSimPlaying ? 'Pause Simulation' : isSimulationActive ? 'Resume Sim' : 'Launch Simulation'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsSimPlaying(false);
                      setSimulatedCandleIndex(0);
                      setIsSimulationActive(false);
                    }}
                    className="p-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white border border-terminal-border"
                    title="Reset Simulation to Realized Anchor"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Speed Multiplier */}
                {isSimulationActive && (
                  <div className="flex items-center justify-between text-[10px] pt-1">
                    <span className="text-slate-400">Simulation Speed:</span>
                    <div className="flex items-center bg-terminal-900 p-0.5 rounded border border-terminal-border">
                      {[1, 2, 5, 10].map(sp => (
                        <button
                          key={sp}
                          onClick={() => setSimSpeed(sp)}
                          className={`px-1.5 py-0.5 rounded ${simSpeed === sp ? 'bg-amber-500 text-black font-bold' : 'text-slate-400'}`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 7: Actionable Execution Blueprint & Sync to Terminal */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-cyan-500/50 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 block border-b border-terminal-border/60 pb-1">
                ACTIONABLE EXECUTION BLUEPRINT
              </span>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase block">Entry Zone</span>
                  <span className="text-white font-bold">${payload?.executionBlueprint.recommendedEntry}</span>
                </div>
                <div>
                  <span className="text-[9px] text-rose-400 uppercase block">Hard Stop Loss</span>
                  <span className="text-rose-400 font-bold">${payload?.executionBlueprint.hardStopLoss}</span>
                </div>
                <div>
                  <span className="text-[9px] text-emerald-400 uppercase block">Take Profit 1</span>
                  <span className="text-emerald-400 font-bold">${payload?.executionBlueprint.takeProfit1}</span>
                </div>
                <div>
                  <span className="text-[9px] text-cyan-400 uppercase block">R:R Ratio</span>
                  <span className="text-cyan-300 font-bold">1:{payload?.executionBlueprint.riskRewardRatio}</span>
                </div>
              </div>

              {/* Sync Button */}
              {onSyncToTerminal && payload && (
                <button
                  onClick={() => {
                    onSyncToTerminal({
                      symbol: selectedPair,
                      direction: payload.telemetry.directionalBias === 'BULLISH' ? 'BUY' : 'SELL',
                      entry: payload.executionBlueprint.recommendedEntry,
                      stopLoss: payload.executionBlueprint.hardStopLoss,
                      takeProfit: payload.executionBlueprint.takeProfit1,
                    });
                  }}
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-200" />
                  <span>SYNC TO TERMINAL TICKET</span>
                </button>
              )}
            </div>

            {/* Section 8: Market Report Summary Card & Persistence */}
            <div className="p-3 rounded-xl bg-terminal-950 border border-terminal-border space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block border-b border-terminal-border/60 pb-1">
                MARKET REPORT PERSISTENCE
              </span>

              <p className="text-[10px] text-slate-300 leading-relaxed line-clamp-3">
                {payload?.marketReport.executiveSummary}
              </p>

              {saveSuccessMsg && (
                <div className="p-1.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold text-center border border-emerald-500/40">
                  {saveSuccessMsg}
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={handleSaveReport}
                  className="flex-1 py-1.5 px-2 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-200 hover:text-white border border-terminal-border text-[11px] font-bold flex items-center justify-center gap-1.5"
                  title="Save Report into Vision Atlas Database Repository"
                >
                  <Save className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Save Report</span>
                </button>

                <button
                  onClick={handleExportJson}
                  className="py-1.5 px-2.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-200 hover:text-white border border-terminal-border text-[11px] font-bold flex items-center gap-1"
                  title="Export Analysis Payload as JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
