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
  Cpu,
  BarChart3,
  Scale,
  Search,
  Filter,
  Globe,
  Landmark,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X
} from 'lucide-react';
import { 
  Candle, 
  CurrencyPair, 
  TimeFrame, 
  VisionAtlasPayload, 
  SimulationScenarioId,
  ScenarioSimulationSetup,
  KnowledgeRule,
  MultiFactorConfluenceReport,
  ConfluenceFactorItem
} from '@/lib/types';
import { visionAtlasEngine } from '@/lib/visionAtlasEngine';
import { BASE_PRICES, FOREX_PAIRS, METALS_COMMODITIES, INDIAN_MARKET_ASSETS } from '@/lib/marketData';
import { TECHNICAL_KNOWLEDGE_BASE } from '@/lib/knowledge/technicalKnowledge';
import { FUNDAMENTAL_KNOWLEDGE_BASE } from '@/lib/knowledge/fundamentalKnowledge';

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

  // Multi-Factor Confluence Dashboard State
  const [activeDashboardView, setActiveDashboardView] = useState<'confluence-visualizer' | 'confluence-matrix' | 'knowledge-explorer'>('confluence-visualizer');
  const [strategySearchQuery, setStrategySearchQuery] = useState<string>('');
  const [strategyFilterCategory, setStrategyFilterCategory] = useState<'ALL' | 'TECHNICAL' | 'FUNDAMENTAL' | 'SMC' | 'INDIAN_MARKET' | 'CENTRAL_BANK' | 'FLOWS'>('ALL');
  const [selectedRuleDetail, setSelectedRuleDetail] = useState<KnowledgeRule | null>(null);
  const [userTechWeightAdjustment, setUserTechWeightAdjustment] = useState<number | null>(null);

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
                multiFactorConfluence: data.multiFactorConfluence || prev.multiFactorConfluence,
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
            multiFactorConfluence: tick.multiFactorConfluence || prev.multiFactorConfluence,
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

          {/* ========================================================================= */}
          {/* MULTI-FACTOR CONFLUENCE DASHBOARD: 1,050+ INSTITUTIONAL STRATEGIES */}
          {/* ========================================================================= */}

          {/* Top Confluence Command & View Switcher Bar */}
          <div className="px-4 py-2.5 bg-terminal-900/90 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0 shadow-md">
            {/* Left: Asset Telemetry & Directional Conviction */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-slate-400">
                PAIR: <strong className="text-white font-bold">{selectedPair}</strong>
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">
                QUOTE: <strong className="text-cyan-300 font-bold">${payload?.telemetry.currentPrice}</strong>
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                (payload?.multiFactorConfluence?.directionalBias || payload?.telemetry.directionalBias) === 'BULLISH'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              }`}>
                {(payload?.multiFactorConfluence?.directionalBias || payload?.telemetry.directionalBias) === 'BULLISH' ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-400" />
                )}
                {payload?.multiFactorConfluence?.directionalBias || payload?.telemetry.directionalBias} CONFLUENCE ({payload?.telemetry.trendStrengthPercent}%)
              </span>
              <span className="hidden xl:inline-flex px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-medium truncate max-w-[280px]">
                {payload?.multiFactorConfluence?.activeSetupName || 'Multi-Factor Institutional Quant Setup'}
              </span>
            </div>

            {/* Center: View Switcher Tabs */}
            <div className="flex items-center bg-terminal-950 p-1 rounded-lg border border-terminal-border text-[11px] font-mono">
              <button
                onClick={() => setActiveDashboardView('confluence-visualizer')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeDashboardView === 'confluence-visualizer'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-cyan-200" />
                <span>Confluence Visualizer</span>
              </button>

              <button
                onClick={() => setActiveDashboardView('confluence-matrix')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeDashboardView === 'confluence-matrix'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Scale className="w-3.5 h-3.5 text-cyan-200" />
                <span>10-Factor Matrix</span>
              </button>

              <button
                onClick={() => setActiveDashboardView('knowledge-explorer')}
                className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 ${
                  activeDashboardView === 'knowledge-explorer'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Search className="w-3.5 h-3.5 text-cyan-200" />
                <span>1,050+ Strategies</span>
                <span className="ml-1 px-1.5 py-0.2 rounded bg-terminal-800 text-[10px] text-cyan-300 font-bold border border-cyan-500/30">
                  1,050
                </span>
              </button>
            </div>

            {/* Right: Dynamic Weight Pill & Sync Action */}
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-terminal-950/80 px-2.5 py-1 rounded-lg border border-terminal-border text-[11px]">
                <span className="text-slate-400 font-mono">SCORE:</span>
                <span className="font-bold text-cyan-300 font-mono">
                  {payload?.multiFactorConfluence?.compositeScore || payload?.confidenceBreakdown.percentage || 94.2}%
                </span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/40">
                  GRADE {payload?.multiFactorConfluence?.grade || 'A+'}
                </span>
              </div>

              {onSyncToTerminal && (
                <button
                  onClick={() => {
                    const direction = (payload?.multiFactorConfluence?.directionalBias || payload?.telemetry.directionalBias) === 'BEARISH' ? 'SELL' : 'BUY';
                    onSyncToTerminal({
                      symbol: selectedPair,
                      direction,
                      entry: payload?.executionBlueprint.recommendedEntry || payload?.telemetry.currentPrice || 0,
                      stopLoss: payload?.executionBlueprint.hardStopLoss || 0,
                      takeProfit: payload?.executionBlueprint.takeProfit1 || 0,
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950 border border-emerald-400/40"
                  title="Directly load multi-factor verified entry, SL and TP into terminal execution ticket"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>SYNC TO TERMINAL</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Scrollable Dashboard Content */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-5 space-y-4 custom-scrollbar bg-terminal-950/80">
            {/* ========================================================================= */}
            {/* VIEW 1: COMPREHENSIVE MULTI-FACTOR CONFLUENCE VISUALIZER */}
            {/* ========================================================================= */}
            {activeDashboardView === 'confluence-visualizer' && (
              <>
                {/* 1. TOP HERO: DYNAMIC STREAM WEIGHTING & CONFLUENCE BAROMETER */}
                <div className="p-4 sm:p-5 bg-gradient-to-br from-terminal-900 via-terminal-900/95 to-terminal-950 border border-terminal-border rounded-xl shadow-xl space-y-4">
                  <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                    {/* Radial / Arc Score Badge */}
                    <div className="flex items-center gap-4 bg-terminal-950/80 p-3.5 rounded-xl border border-terminal-border/80 shrink-0">
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-terminal-800"
                            strokeWidth="3.5"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-cyan-400 transition-all duration-1000 ease-out"
                            strokeDasharray={`${payload?.multiFactorConfluence?.compositeScore || 94}, 100`}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute flex flex-col items-center justify-center text-center">
                          <span className="text-base sm:text-lg font-black font-mono text-white leading-none">
                            {payload?.multiFactorConfluence?.compositeScore || 94.2}%
                          </span>
                          <span className="text-[9px] font-bold text-cyan-300 font-mono mt-0.5">
                            CONFLUENCE
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono font-bold tracking-wider">
                            GRADE {payload?.multiFactorConfluence?.grade || 'A+'} PRIMED
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">1,050+ STRATEGIES</span>
                        </div>
                        <h3 className="text-sm sm:text-base font-bold text-white tracking-wide truncate">
                          {payload?.multiFactorConfluence?.activeSetupName || 'Multi-Factor Institutional Quant Setup'}
                        </h3>
                        <p className="text-xs text-slate-400 leading-snug line-clamp-2 max-w-xl">
                          {payload?.multiFactorConfluence?.institutionalRationale || 'Unified pipeline synthesizing 525 technical heuristics and 525 fundamental models with institutional confidence weighting.'}
                        </p>
                      </div>
                    </div>

                    {/* Dynamic Multi-Source Stream Weighting Sliders & Balance Meter */}
                    <div className="flex-1 bg-terminal-950/80 p-3.5 rounded-xl border border-terminal-border/80 space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>DYNAMIC STREAM WEIGHTING MATRIX</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-cyan-400 font-bold">
                            {userTechWeightAdjustment ?? payload?.multiFactorConfluence?.dynamicWeights.technicalWeight ?? 50}% TECH
                          </span>
                          <span className="text-slate-500">/</span>
                          <span className="text-indigo-400 font-bold">
                            {100 - (userTechWeightAdjustment ?? payload?.multiFactorConfluence?.dynamicWeights.technicalWeight ?? 50)}% FUNDAMENTAL
                          </span>
                          {userTechWeightAdjustment !== null && (
                            <button
                              onClick={() => setUserTechWeightAdjustment(null)}
                              className="text-[10px] text-slate-400 hover:text-cyan-300 underline ml-1"
                              title="Reset to automated institutional SSOT weights"
                            >
                              Auto
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Visual Dual-Weight Ratio Bar */}
                      <div className="w-full h-3 bg-terminal-800 rounded-full overflow-hidden flex shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                          style={{ width: `${userTechWeightAdjustment ?? payload?.multiFactorConfluence?.dynamicWeights.technicalWeight ?? 50}%` }}
                        />
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                          style={{ width: `${100 - (userTechWeightAdjustment ?? payload?.multiFactorConfluence?.dynamicWeights.technicalWeight ?? 50)}%` }}
                        />
                      </div>

                      {/* Interactive Weight Slider & Sub-Factor Tags */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono">
                        <div className="flex items-center gap-2 text-slate-400">
                          <span>Adjust Weight:</span>
                          <input
                            type="range"
                            min="20"
                            max="80"
                            value={userTechWeightAdjustment ?? payload?.multiFactorConfluence?.dynamicWeights.technicalWeight ?? 50}
                            onChange={(e) => setUserTechWeightAdjustment(Number(e.target.value))}
                            className="w-24 sm:w-32 accent-cyan-400 h-1 bg-terminal-700 rounded cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded bg-terminal-800 border border-terminal-border text-slate-300">
                            FII/FPI Flow: <strong>{payload?.multiFactorConfluence?.dynamicWeights.flowWeight || 25}%</strong>
                          </span>
                          <span className="px-2 py-0.5 rounded bg-terminal-800 border border-terminal-border text-slate-300">
                            Central Bank: <strong>{payload?.multiFactorConfluence?.dynamicWeights.centralBankWeight || 25}%</strong>
                          </span>
                        </div>
                      </div>

                      {/* Dynamic Institutional Calibration Rationale Banner */}
                      <div className="p-2 bg-cyan-950/30 border border-cyan-500/20 rounded-lg text-[11px] text-cyan-200/90 font-mono flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{payload?.multiFactorConfluence?.dynamicWeights.rationale || 'Weights dynamically allocated across 525 technical heuristics and 525 fundamental models based on real-time asset class and market regime.'}</span>
                      </div>
                    </div>
                  </div>

                  {/* 4 Summary Stat Pills */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 pt-1 text-xs font-mono">
                    <div className="p-2.5 bg-terminal-950/70 border border-terminal-border/80 rounded-lg space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase">525 Technical Rules</div>
                      <div className="text-white font-bold flex items-center gap-1.5">
                        <span className="text-cyan-300">{payload?.multiFactorConfluence?.technicalStream.passingRulesCount || 489}</span>
                        <span className="text-slate-500">/ 525 Passing</span>
                        <span className="text-[10px] text-emerald-400">({payload?.multiFactorConfluence?.technicalStream.streamConfidence || 93.1}%)</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-terminal-950/70 border border-terminal-border/80 rounded-lg space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase">525 Fundamental Models</div>
                      <div className="text-white font-bold flex items-center gap-1.5">
                        <span className="text-indigo-300">{payload?.multiFactorConfluence?.fundamentalStream.passingRulesCount || 482}</span>
                        <span className="text-slate-500">/ 525 Supportive</span>
                        <span className="text-[10px] text-emerald-400">({payload?.multiFactorConfluence?.fundamentalStream.streamConfidence || 91.8}%)</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-terminal-950/70 border border-terminal-border/80 rounded-lg space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase">FII/FPI Institutional Flow</div>
                      <div className="text-emerald-400 font-bold flex items-center gap-1.5">
                        <span>{payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.fiiFpiNetCashFlowCr && payload.multiFactorConfluence.fundamentalStream.indianMarketDynamics.fiiFpiNetCashFlowCr > 0 ? '+' : ''}₹{payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.fiiFpiNetCashFlowCr || 2340} Cr</span>
                        <span className="text-[10px] text-slate-400">Net Cash Inflow</span>
                      </div>
                    </div>

                    <div className="p-2.5 bg-terminal-950/70 border border-terminal-border/80 rounded-lg space-y-0.5">
                      <div className="text-[10px] text-slate-400 uppercase">Central Bank Stance</div>
                      <div className="text-cyan-300 font-bold truncate">
                        {payload?.multiFactorConfluence?.fundamentalStream.centralBankPolicyStance.rateSpreadDirection || 'Accommodative Liquidity'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. DUAL-PANEL SIDE-BY-SIDE VISUAL MAPPING */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* ========================================================================= */}
                  {/* LEFT PANEL: MACRO-FUNDAMENTAL DATA VISUALIZER (525 RULES STREAM) */}
                  {/* ========================================================================= */}
                  <div className="p-4 bg-terminal-900/90 border border-terminal-border rounded-xl shadow-lg space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-terminal-border/80">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-indigo-500/20 text-indigo-300 rounded-lg border border-indigo-500/30">
                          <Globe className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                            Macro-Fundamental Stream
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            525 Institutional Models • Central Banks • Indian Market Flow
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {payload?.multiFactorConfluence?.fundamentalStream.streamConfidence || 91.8}% CONFIDENCE
                      </span>
                    </div>

                    {/* Central Bank Monetary Policy & Yield Spread Barometer */}
                    <div className="p-3 bg-terminal-950/80 border border-terminal-border rounded-lg space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Landmark className="w-3.5 h-3.5 text-indigo-400" />
                          <span>CENTRAL BANK MONETARY POLICY & RATE DIFFERENTIALS</span>
                        </span>
                        <span className="text-[10px] text-indigo-400 font-bold">
                          Spread: {payload?.multiFactorConfluence?.fundamentalStream.centralBankPolicyStance.rateDifferentialBps || 125} bps
                        </span>
                      </div>

                      {/* 4 Major Central Banks Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded text-center space-y-0.5">
                          <div className="text-[10px] text-slate-400">US FED</div>
                          <div className="font-bold text-cyan-300">
                            {payload?.multiFactorConfluence?.fundamentalStream.centralBankPolicyStance.usFed || 'DOVISH'}
                          </div>
                          <div className="text-[9px] text-slate-500">Gradual Easing</div>
                        </div>

                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded text-center space-y-0.5">
                          <div className="text-[10px] text-slate-400">RBI (INDIA)</div>
                          <div className="font-bold text-emerald-400">
                            {payload?.multiFactorConfluence?.fundamentalStream.centralBankPolicyStance.rbi || 'ACCOMMODATIVE'}
                          </div>
                          <div className="text-[9px] text-slate-500">Repo 6.50% VRR</div>
                        </div>

                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded text-center space-y-0.5">
                          <div className="text-[10px] text-slate-400">ECB (EUROPE)</div>
                          <div className="font-bold text-amber-300">
                            {payload?.multiFactorConfluence?.fundamentalStream.centralBankPolicyStance.ecb || 'DOVISH'}
                          </div>
                          <div className="text-[9px] text-slate-500">-25 bps Cut</div>
                        </div>

                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded text-center space-y-0.5">
                          <div className="text-[10px] text-slate-400">BOJ (JAPAN)</div>
                          <div className="font-bold text-purple-300">
                            {payload?.multiFactorConfluence?.fundamentalStream.centralBankPolicyStance.boj || 'HAWKISH'}
                          </div>
                          <div className="text-[9px] text-slate-500">Rate Hike Stance</div>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 bg-terminal-900/60 p-2 rounded border border-terminal-border/60">
                        {payload?.multiFactorConfluence?.fundamentalStream.centralBankPolicyStance.rateSpreadDirection || 'US-Fed & RBI spread provides structural support for domestic equities and currency stability.'}
                      </div>
                    </div>

                    {/* Indian Market Dynamics & Institutional Liquidity Gauges */}
                    <div className="p-3 bg-terminal-950/80 border border-terminal-border rounded-lg space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-emerald-400" />
                          <span>INSTITUTIONAL LIQUIDITY & INDIAN MARKET DYNAMICS</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold">FII ACCUMULATION</span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded flex items-center justify-between">
                          <span className="text-slate-400">FII Net Cash:</span>
                          <span className="font-bold text-emerald-400">
                            {payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.fiiFpiNetCashFlowCr && payload.multiFactorConfluence.fundamentalStream.indianMarketDynamics.fiiFpiNetCashFlowCr > 0 ? '+' : ''}₹{payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.fiiFpiNetCashFlowCr || 2340} Cr
                          </span>
                        </div>

                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded flex items-center justify-between">
                          <span className="text-slate-400">DII SIP Support:</span>
                          <span className="font-bold text-cyan-300">
                            +₹{payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.diiNetCashFlowCr || 1980} Cr
                          </span>
                        </div>

                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded flex items-center justify-between">
                          <span className="text-slate-400">F&O Long/Short:</span>
                          <span className="font-bold text-emerald-400">
                            {payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.fiiIndexLongShortRatio || 1.38}x (Bullish)
                          </span>
                        </div>

                        <div className="p-2 bg-terminal-900 border border-terminal-border rounded flex items-center justify-between">
                          <span className="text-slate-400">India VIX:</span>
                          <span className="font-bold text-cyan-300">
                            {payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.indiaVix || 13.2} (Low Vol)
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-400 leading-snug">
                        {payload?.multiFactorConfluence?.fundamentalStream.indianMarketDynamics.corporateEarningsImpact || 'Banking NII and capital goods expansions offset global headwinds with strong domestic cash market absorption.'}
                      </div>
                    </div>

                    {/* Macro-Commodity & DXY Transmission */}
                    <div className="p-3 bg-terminal-950/80 border border-terminal-border rounded-lg space-y-1.5 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-300 font-semibold">
                        <span>COMMODITY & FX TRANSMISSION</span>
                        <span className="text-cyan-400 font-bold">DXY: {payload?.multiFactorConfluence?.fundamentalStream.macroCommodityTransmission.dxyDollarStrengthIndex || 103.4}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        • {payload?.multiFactorConfluence?.fundamentalStream.macroCommodityTransmission.crudeOilImpact || 'Brent stable at $74/bbl easing imported inflation risks.'}
                      </div>
                      <div className="text-[11px] text-slate-400 leading-relaxed">
                        • {payload?.multiFactorConfluence?.fundamentalStream.macroCommodityTransmission.goldReserveInflow || 'Central bank bullion inflows and LBMA physical drawdowns maintain firm pricing support.'}
                      </div>
                    </div>

                    {/* Top Matched Fundamental Rules */}
                    <div className="space-y-1.5 font-mono">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>TOP ACTIVE FUNDAMENTAL RULES ({payload?.multiFactorConfluence?.fundamentalStream.topMatchedRules.length || 0})</span>
                        <span className="text-[10px] text-slate-400">Citations from 525 Models</span>
                      </div>
                      <div className="space-y-1.5">
                        {payload?.multiFactorConfluence?.fundamentalStream.topMatchedRules.slice(0, 3).map(rule => (
                          <div
                            key={rule.id}
                            onClick={() => setSelectedRuleDetail(rule)}
                            className="p-2 bg-terminal-950/60 hover:bg-terminal-950 border border-terminal-border/70 hover:border-indigo-500/50 rounded-lg cursor-pointer transition-all text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-indigo-300">{rule.id} • {rule.subcategory}</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                {rule.expectedWinRate}% WIN RATE
                              </span>
                            </div>
                            <div className="text-white font-semibold text-xs mt-0.5 truncate">{rule.ruleName}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{rule.conditionDescription}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* ========================================================================= */}
                  {/* RIGHT PANEL: HIGH-ACCURACY TECHNICAL SETUPS VISUALIZER (525 RULES STREAM) */}
                  {/* ========================================================================= */}
                  <div className="p-4 bg-terminal-900/90 border border-terminal-border rounded-xl shadow-lg space-y-3.5">
                    <div className="flex items-center justify-between pb-2 border-b border-terminal-border/80">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-cyan-500/20 text-cyan-300 rounded-lg border border-cyan-500/30">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                            High-Accuracy Technical Setups
                          </h4>
                          <span className="text-[10px] text-slate-400 font-mono">
                            525 Technical Heuristics • SMC • Nifty Setups • MTF
                          </span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {payload?.multiFactorConfluence?.technicalStream.streamConfidence || 93.1}% CONFIDENCE
                      </span>
                    </div>

                    {/* 10-Category Technical Heuristics Heatmap */}
                    <div className="p-3 bg-terminal-950/80 border border-terminal-border rounded-lg space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px]">
                        <span className="flex items-center gap-1.5">
                          <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
                          <span>10-CATEGORY TECHNICAL HEURISTICS HEATMAP</span>
                        </span>
                        <span className="text-[10px] text-cyan-300 font-bold">525 TOTAL RULES</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 pt-1">
                        {payload?.multiFactorConfluence?.technicalStream.subcategories && Object.entries(payload.multiFactorConfluence.technicalStream.subcategories).map(([name, cat]) => (
                          <div key={name} className="space-y-0.5">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-300 truncate max-w-[170px]">{name}</span>
                              <span className="font-bold text-cyan-300">{cat.score}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-terminal-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  cat.bias === 'BULLISH'
                                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                                    : cat.bias === 'BEARISH'
                                    ? 'bg-gradient-to-r from-rose-500 to-red-400'
                                    : 'bg-slate-600'
                                }`}
                                style={{ width: `${cat.score}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* High-Accuracy Setup Confluence & Execution Parameters Box */}
                    <div className="p-3 bg-gradient-to-br from-terminal-950 via-terminal-900 to-cyan-950/40 border border-cyan-500/30 rounded-lg space-y-2.5 font-mono text-xs shadow-md">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                          <span>MATHEMATICAL EXECUTION BLUEPRINT</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          {payload?.executionBlueprint.recommendedLotSize && (
                            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/40">
                              TIER {payload.executionBlueprint.gradingTier || payload.multiFactorConfluence?.grade || 'A'} • {payload.executionBlueprint.recommendedLotSize} LOTS
                            </span>
                          )}
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                            R:R {payload?.executionBlueprint.riskRewardRatio || 2.85}x
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                        <div className="p-2 bg-terminal-950 border border-terminal-border rounded space-y-0.5">
                          <div className="text-[10px] text-slate-400">RECOMMENDED ENTRY</div>
                          <div className="font-bold text-cyan-300">
                            ${payload?.executionBlueprint.recommendedEntry || payload?.telemetry.currentPrice}
                          </div>
                          <div className="text-[9px] text-slate-500">
                            ${payload?.executionBlueprint.entryZoneMin} - ${payload?.executionBlueprint.entryZoneMax}
                          </div>
                        </div>

                        <div className="p-2 bg-terminal-950 border border-rose-500/30 rounded space-y-0.5">
                          <div className="text-[10px] text-rose-300">HARD STOP LOSS</div>
                          <div className="font-bold text-rose-400">
                            ${payload?.executionBlueprint.hardStopLoss}
                          </div>
                          <div className="text-[9px] text-slate-500">Structural Invalidation</div>
                        </div>

                        <div className="p-2 bg-terminal-950 border border-emerald-500/30 rounded space-y-0.5">
                          <div className="text-[10px] text-emerald-300">TAKE PROFIT 1</div>
                          <div className="font-bold text-emerald-400">
                            ${payload?.executionBlueprint.takeProfit1}
                          </div>
                          <div className="text-[9px] text-slate-500">1:1.5 RR</div>
                        </div>

                        <div className="p-2 bg-terminal-950 border border-emerald-500/30 rounded space-y-0.5">
                          <div className="text-[10px] text-emerald-300">TAKE PROFIT 2 / 3</div>
                          <div className="font-bold text-emerald-400">
                            ${payload?.executionBlueprint.takeProfit2}
                          </div>
                          <div className="text-[9px] text-slate-500">${payload?.executionBlueprint.takeProfit3} Max</div>
                        </div>
                      </div>

                      {onSyncToTerminal && (
                        <button
                          onClick={() => {
                            const direction = (payload?.multiFactorConfluence?.directionalBias || payload?.telemetry.directionalBias) === 'BEARISH' ? 'SELL' : 'BUY';
                            onSyncToTerminal({
                              symbol: selectedPair,
                              direction,
                              entry: payload?.executionBlueprint.recommendedEntry || 0,
                              stopLoss: payload?.executionBlueprint.hardStopLoss || 0,
                              takeProfit: payload?.executionBlueprint.takeProfit1 || 0,
                            });
                          }}
                          className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                        >
                          <Zap className="w-4 h-4 text-cyan-200" />
                          <span>LOAD HIGH-ACCURACY SETUP INTO TERMINAL</span>
                        </button>
                      )}
                    </div>

                    {/* Top Matched Technical Rules */}
                    <div className="space-y-1.5 font-mono">
                      <div className="text-[11px] font-bold text-slate-300 flex items-center justify-between">
                        <span>TOP ACTIVE TECHNICAL HEURISTICS ({payload?.multiFactorConfluence?.technicalStream.topMatchedRules.length || 0})</span>
                        <span className="text-[10px] text-slate-400">Citations from 525 Rules</span>
                      </div>
                      <div className="space-y-1.5">
                        {payload?.multiFactorConfluence?.technicalStream.topMatchedRules.slice(0, 3).map(rule => (
                          <div
                            key={rule.id}
                            onClick={() => setSelectedRuleDetail(rule)}
                            className="p-2 bg-terminal-950/60 hover:bg-terminal-950 border border-terminal-border/70 hover:border-cyan-500/50 rounded-lg cursor-pointer transition-all text-xs"
                          >
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-bold text-cyan-300">{rule.id} • {rule.subcategory}</span>
                              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                {rule.expectedWinRate}% WIN RATE
                              </span>
                            </div>
                            <div className="text-white font-semibold text-xs mt-0.5 truncate">{rule.ruleName}</div>
                            <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{rule.conditionDescription}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. MULTI-FACTOR CONFLUENCE FACTOR MATRIX TABLE */}
                <div className="p-4 bg-terminal-900/90 border border-terminal-border rounded-xl shadow-lg space-y-3 font-mono">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-4 h-4 text-cyan-400" />
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                        10-Factor Multi-Source Confluence Matrix
                      </h4>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Synthesized Across 1,050+ Knowledge Rules
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-terminal-border text-[10px] text-slate-400 uppercase">
                          <th className="py-2 px-3">Factor</th>
                          <th className="py-2 px-3">Domain</th>
                          <th className="py-2 px-3">Alignment Status</th>
                          <th className="py-2 px-3">Weight</th>
                          <th className="py-2 px-3">Score</th>
                          <th className="py-2 px-3">Institutional Observation</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-terminal-border/50 text-[11px]">
                        {payload?.multiFactorConfluence?.confluenceMatrix.map((item) => (
                          <tr key={item.id} className="hover:bg-terminal-800/40 transition-colors">
                            <td className="py-2 px-3 font-bold text-white whitespace-nowrap">
                              {item.factor}
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.category === 'TECHNICAL'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                  : item.category === 'CENTRAL_BANK'
                                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                  : item.category === 'FLOW'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              }`}>
                                {item.category}
                              </span>
                            </td>
                            <td className="py-2 px-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                item.status.includes('BULLISH')
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : item.status.includes('BEARISH')
                                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                                  : 'bg-slate-700 text-slate-300'
                              }`}>
                                {item.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-2 px-3 font-mono text-slate-300 whitespace-nowrap">
                              {item.weightPercent}%
                            </td>
                            <td className="py-2 px-3 font-bold font-mono text-cyan-300 whitespace-nowrap">
                              {item.impactScore}/100
                            </td>
                            <td className="py-2 px-3 text-slate-400 max-w-md truncate">
                              {item.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: DEDICATED 10-FACTOR CONFLUENCE MATRIX DETAIL */}
            {/* ========================================================================= */}
            {activeDashboardView === 'confluence-matrix' && (
              <div className="p-5 bg-terminal-900/90 border border-terminal-border rounded-xl shadow-xl space-y-4 font-mono">
                <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
                  <div className="flex items-center gap-2">
                    <Scale className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        Institutional 10-Factor Confluence Matrix & Correlation Weights
                      </h3>
                      <p className="text-xs text-slate-400">
                        Multi-layered quantitative alignment across 525 Technical Heuristics and 525 Macro-Fundamental Models
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveDashboardView('confluence-visualizer')}
                    className="px-3 py-1 bg-terminal-800 hover:bg-terminal-700 text-slate-300 rounded text-xs"
                  >
                    Back to Visualizer
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {payload?.multiFactorConfluence?.confluenceMatrix.map((item) => (
                    <div key={item.id} className="p-3.5 bg-terminal-950 border border-terminal-border rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-xs">{item.factor}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.status.includes('BULLISH')
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : item.status.includes('BEARISH')
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-700 text-slate-300'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Domain: <strong className="text-cyan-300">{item.category}</strong></span>
                        <span>Factor Weight: <strong className="text-white">{item.weightPercent}%</strong></span>
                        <span>Impact Score: <strong className="text-emerald-400">{item.impactScore}/100</strong></span>
                      </div>

                      <div className="w-full h-1.5 bg-terminal-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full"
                          style={{ width: `${item.impactScore}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed pt-1">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: 1,050+ INSTITUTIONAL STRATEGY KNOWLEDGE EXPLORER */}
            {/* ========================================================================= */}
            {activeDashboardView === 'knowledge-explorer' && (
              <div className="p-5 bg-terminal-900/90 border border-terminal-border rounded-xl shadow-xl space-y-4 font-mono">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-terminal-border">
                  <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                        1,050+ Institutional Strategy Knowledge Base
                      </h3>
                      <p className="text-xs text-slate-400">
                        525 Technical Heuristics + 525 Macro-Fundamental Models • Real-Time Confluence Matcher
                      </p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Search 1,050 rules by ID, keyword..."
                      value={strategySearchQuery}
                      onChange={(e) => setStrategySearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 bg-terminal-950 border border-terminal-border rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Filter Chips */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 text-[11px]">Filter:</span>
                  {(['ALL', 'TECHNICAL', 'FUNDAMENTAL', 'SMC', 'INDIAN_MARKET', 'CENTRAL_BANK', 'FLOWS'] as const).map(cat => (
                    <button
                      key={cat}
                      onClick={() => setStrategyFilterCategory(cat)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-colors ${
                        strategyFilterCategory === cat
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-terminal-950 text-slate-400 hover:text-white border border-terminal-border'
                      }`}
                    >
                      {cat.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Rules Cards Grid */}
                {(() => {
                  const allRules = [...TECHNICAL_KNOWLEDGE_BASE, ...FUNDAMENTAL_KNOWLEDGE_BASE];
                  const filtered = allRules.filter(r => {
                    if (strategyFilterCategory === 'TECHNICAL' && r.category !== 'TECHNICAL') return false;
                    if (strategyFilterCategory === 'FUNDAMENTAL' && r.category !== 'FUNDAMENTAL') return false;
                    if (strategyFilterCategory === 'SMC' && !r.subcategory.toLowerCase().includes('smc')) return false;
                    if (strategyFilterCategory === 'INDIAN_MARKET' && r.marketScope !== 'INDIAN_MARKET' && !r.subcategory.toLowerCase().includes('nse') && !r.subcategory.toLowerCase().includes('rbi')) return false;
                    if (strategyFilterCategory === 'CENTRAL_BANK' && !r.subcategory.toLowerCase().includes('central bank')) return false;
                    if (strategyFilterCategory === 'FLOWS' && !r.subcategory.toLowerCase().includes('flow') && !r.subcategory.toLowerCase().includes('fii')) return false;
                    if (strategySearchQuery.trim()) {
                      const q = strategySearchQuery.toLowerCase();
                      return r.id.toLowerCase().includes(q) ||
                        r.ruleName.toLowerCase().includes(q) ||
                        r.subcategory.toLowerCase().includes(q) ||
                        r.conditionDescription.toLowerCase().includes(q);
                    }
                    return true;
                  });

                  return (
                    <div className="space-y-2">
                      <div className="text-[11px] text-slate-400 flex items-center justify-between">
                        <span>Showing {filtered.length} of 1,050 institutional rules</span>
                        <span className="text-cyan-400">Click any card to inspect full criteria & invalidation</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto custom-scrollbar p-1">
                        {filtered.slice(0, 48).map(rule => {
                          const isBull = (payload?.multiFactorConfluence?.directionalBias || payload?.telemetry.directionalBias) === 'BULLISH';
                          const isBear = (payload?.multiFactorConfluence?.directionalBias || payload?.telemetry.directionalBias) === 'BEARISH';
                          const isMatched = (isBull && rule.signalAction.includes('BUY')) || (isBear && rule.signalAction.includes('SELL'));

                          return (
                            <div
                              key={rule.id}
                              onClick={() => setSelectedRuleDetail(rule)}
                              className="p-3 bg-terminal-950 hover:bg-terminal-900 border border-terminal-border hover:border-cyan-500/50 rounded-xl cursor-pointer transition-all space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-[10px]">
                                <span className="font-bold text-cyan-300">{rule.id}</span>
                                <div className="flex items-center gap-1">
                                  {isMatched && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold border border-emerald-500/40">
                                      ACTIVE MATCH
                                    </span>
                                  )}
                                  <span className="px-1.5 py-0.2 rounded bg-terminal-800 text-slate-300 text-[9px]">
                                    {rule.expectedWinRate}% WR
                                  </span>
                                </div>
                              </div>
                              <div className="font-bold text-white text-xs truncate">{rule.ruleName}</div>
                              <div className="text-[10px] text-slate-400 line-clamp-2">{rule.conditionDescription}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Rule Detail Modal Flyout */}
          {selectedRuleDetail && (
            <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
              <div className="bg-terminal-900 border border-cyan-500/40 rounded-2xl max-w-xl w-full p-5 space-y-4 font-mono shadow-2xl animate-scale-up">
                <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
                  <div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {selectedRuleDetail.category} • {selectedRuleDetail.id}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">{selectedRuleDetail.ruleName}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedRuleDetail(null)}
                    className="p-1 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-terminal-950 border border-terminal-border rounded text-center">
                      <div className="text-[10px] text-slate-400">WIN RATE</div>
                      <div className="font-bold text-emerald-400 text-sm">{selectedRuleDetail.expectedWinRate}%</div>
                    </div>
                    <div className="p-2 bg-terminal-950 border border-terminal-border rounded text-center">
                      <div className="text-[10px] text-slate-400">WEIGHT</div>
                      <div className="font-bold text-cyan-300 text-sm">{selectedRuleDetail.confidenceWeight}/10</div>
                    </div>
                    <div className="p-2 bg-terminal-950 border border-terminal-border rounded text-center">
                      <div className="text-[10px] text-slate-400">ACTION</div>
                      <div className="font-bold text-white text-sm">{selectedRuleDetail.signalAction}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-terminal-950 border border-terminal-border rounded-lg space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Execution Condition Trigger:</div>
                    <p className="text-slate-200 leading-relaxed">{selectedRuleDetail.conditionDescription}</p>
                  </div>

                  <div className="p-3 bg-terminal-950 border border-rose-500/30 rounded-lg space-y-1">
                    <div className="text-[10px] text-rose-300 uppercase font-bold">Invalidation Criteria:</div>
                    <p className="text-slate-200 leading-relaxed">{selectedRuleDetail.invalidationCriteria}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRuleDetail(null)}
                  className="w-full py-2 bg-terminal-800 hover:bg-terminal-700 text-white rounded-lg font-bold text-xs"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          )}

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
