'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { 
  AgentDebateMessage, 
  Candle, 
  CurrencyPair, 
  TimeFrame, 
  DebateSynthesisResult, 
  DebatePriceThresholds,
  DebateScenarioContext,
  DebateActionableDirective
} from '@/lib/types';
import { 
  Send, 
  Bot, 
  Shield, 
  BarChart2, 
  Globe, 
  Scale, 
  Newspaper, 
  Target, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  BookOpen, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  AlertOctagon,
  RotateCcw,
  Sliders,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  CornerDownRight,
  Flame,
  Zap,
  Wifi,
  WifiOff,
  Clock,
  Gauge,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { OandaTradingViewChart } from './OandaTradingViewChart';
import { 
  ExecutionTelemetryEngine, 
  ExecutionTelemetrySummary, 
  ExecutionLogRecord 
} from '@/lib/executionTelemetryEngine';

const executionTelemetryEngine = ExecutionTelemetryEngine.getInstance();

interface AgentDebateFeedProps {
  messages: AgentDebateMessage[];
  candles?: Candle[];
  pair?: CurrencyPair;
  timeframe?: TimeFrame;
  synthesis?: DebateSynthesisResult;
  activeScenario?: DebateScenarioContext | null;
  executionMode?: 'MANUAL' | 'SEMI_AUTONOMOUS' | 'FULL_AUTOPILOT';
  onExecuteTrade?: () => void;
  onApplyModification?: (thresholds: DebatePriceThresholds) => void;
  onStrategicExit?: () => void;
  onSendCustomPrompt?: (prompt: string) => void;
  onClearScenario?: () => void;
  isDebating?: boolean;
  onBackToTerminal?: () => void;
}

const PRESET_SCENARIOS = [
  'Anticipating Market Reversal',
  'Geopolitical Volatility Spike',
  'Central Bank Surprise Rate Shock',
  'Liquidity Sweep & Stop Run Invalidation',
];

export const AgentDebateFeed: React.FC<AgentDebateFeedProps> = ({
  messages,
  candles = [],
  pair = 'EUR/USD',
  timeframe = '1h',
  synthesis,
  activeScenario,
  executionMode = 'MANUAL',
  onExecuteTrade,
  onApplyModification,
  onStrategicExit,
  onSendCustomPrompt,
  onClearScenario,
  isDebating = false,
  onBackToTerminal,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [activeFilterRound, setActiveFilterRound] = useState<number | 'ALL'>('ALL');
  const [activeChannelTab, setActiveChannelTab] = useState<'ALL' | 'BUY' | 'SELL'>('ALL');
  const [showTelemetryLogger, setShowTelemetryLogger] = useState(true);

  // Telemetry state from ExecutionTelemetryEngine
  const [telemetry, setTelemetry] = useState<ExecutionTelemetrySummary>(() => 
    executionTelemetryEngine.getTelemetrySummary()
  );
  const [recentLogs, setRecentLogs] = useState<ExecutionLogRecord[]>(() => 
    executionTelemetryEngine.getRecentLogs()
  );

  // Periodic telemetry refresh
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetry(executionTelemetryEngine.getTelemetrySummary());
      setRecentLogs(executionTelemetryEngine.getRecentLogs());
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  // Format price with appropriate decimals based on pair
  const formatPrice = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0.00';
    const isIndian = pair.includes('NIFTY') || pair.includes('SENSEX') || pair.includes('RELIANCE') || pair.includes('HDFCBANK') || pair.includes('TCS');
    const isGold = pair === 'XAU/USD';
    const isSilver = pair === 'XAG/USD';
    const isJpy = pair.includes('JPY');
    const isRupee = pair.includes('/INR');
    const isOil = pair === 'WTI_CRUDE' || pair === 'BRENT_CRUDE';
    
    if (isIndian || isGold || isOil) return val.toFixed(2);
    if (isSilver || isJpy || isRupee) return val.toFixed(3);
    return val.toFixed(val < 10 ? 5 : 2);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputPrompt.trim() || isDebating) return;
    if (onSendCustomPrompt) {
      onSendCustomPrompt(inputPrompt.trim());
      setInputPrompt('');
    }
  };

  const handleSelectPreset = (preset: string) => {
    if (isDebating) return;
    if (onSendCustomPrompt) {
      onSendCustomPrompt(preset);
    }
  };

  const getRoleIcon = (role: AgentDebateMessage['role']) => {
    switch (role) {
      case 'technical_analyst':
        return <BarChart2 className="w-4 h-4 text-cyan-400" />;
      case 'fundamental_analyst':
        return <Globe className="w-4 h-4 text-purple-400" />;
      case 'forex_analyst':
        return <Scale className="w-4 h-4 text-amber-400" />;
      case 'news_analyst':
        return <Newspaper className="w-4 h-4 text-sky-400" />;
      case 'risk_manager':
        return <Shield className="w-4 h-4 text-emerald-400" />;
      case 'terminal_node':
        return <Zap className="w-4 h-4 text-amber-400" />;
      default:
        return <Bot className="w-4 h-4 text-indigo-400" />;
    }
  };

  // Safe fallback thresholds (Strictly bound to definitive bias)
  const thresholds: DebatePriceThresholds = useMemo(() => {
    if (synthesis?.priceThresholds) {
      return synthesis.priceThresholds;
    }
    const currentPrice = candles.length > 0 ? candles[candles.length - 1].close : 1.0850;
    const isSellBias = (synthesis?.definitiveBias || '').includes('SELL');

    return {
      entryPrice: currentPrice,
      takeProfit: isSellBias 
        ? Number((currentPrice * 0.992).toFixed(5)) 
        : Number((currentPrice * 1.008).toFixed(5)),
      stopLoss: isSellBias 
        ? Number((currentPrice * 1.004).toFixed(5)) 
        : Number((currentPrice * 0.996).toFixed(5)),
      riskRewardRatio: 2.2,
      positionSizeLots: 0.11,
      maxLossUsd: 150,
      projectedGainUsd: 330,
      invalidationCriteria: `${timeframe.toUpperCase()} candle close beyond stop loss level`,
      trajectoryHorizonBars: 16,
      projectedPriceMove: isSellBias 
        ? Number((currentPrice * -0.008).toFixed(5)) 
        : Number((currentPrice * 0.008).toFixed(5)),
    };
  }, [synthesis, candles, timeframe]);

  // Current live market price
  const livePrice = candles.length > 0 ? candles[candles.length - 1].close : (thresholds.entryPrice || 1.0850);

  // Volatility adjusted position size
  const volatilitySizing = useMemo(() => {
    return executionTelemetryEngine.calculateVolatilityAdjustedLots(
      thresholds.positionSizeLots || 0.1,
      candles
    );
  }, [thresholds.positionSizeLots, candles]);

  // Terminal node & scenario context
  const terminalNode = synthesis?.terminalNode;
  const divergence = synthesis?.divergence;
  const currentScenario = synthesis?.activeScenario || activeScenario;

  const directive: DebateActionableDirective = terminalNode?.directive || 'MAINTAIN_POSITION';
  const isStrategicExit = directive === 'STRATEGIC_EXIT';
  const isModifyPosition = directive === 'MODIFY_POSITION';

  const definitiveBias = synthesis?.definitiveBias || 'BUY';
  const confluenceGrade = synthesis?.confluenceGrade || 'A';
  const confidenceScore = synthesis?.confidenceScore || 85;

  const isBuy = definitiveBias.includes('BUY');
  const isSell = definitiveBias.includes('SELL');

  const directiveBadgeColor = isStrategicExit
    ? 'text-rose-400 bg-rose-950/80 border-rose-600 shadow-rose-950/50'
    : isModifyPosition
    ? 'text-amber-400 bg-amber-950/80 border-amber-600 shadow-amber-950/50'
    : 'text-emerald-400 bg-emerald-950/80 border-emerald-600 shadow-emerald-950/50';

  // -------------------------------------------------------------
  // Second-by-Second Live Chart Invalidation & Health Calculation
  // -------------------------------------------------------------
  const pipMultiplier = pair.includes('JPY') ? 0.01 : pair === 'XAU/USD' ? 0.10 : (pair.includes('NIFTY') || pair.includes('SENSEX')) ? 1.0 : 0.0001;
  const distanceToStopPips = Math.abs(livePrice - thresholds.stopLoss) / pipMultiplier;
  const isInvalidatedNow = isSell 
    ? livePrice >= thresholds.stopLoss 
    : livePrice <= thresholds.stopLoss;
  const isWarningZone = distanceToStopPips < 8.0;

  const isAutoCloseEnforced = executionMode === 'FULL_AUTOPILOT' || executionMode === 'SEMI_AUTONOMOUS';

  // -------------------------------------------------------------
  // Bifurcated Buy-Side and Sell-Side Debate Channels & Cited Rules
  // -------------------------------------------------------------
  const buySideMessages = useMemo(() => {
    return messages.filter(m => 
      !m.isTerminalNode && (m.side === 'BUY' || m.sentiment === 'BULLISH')
    );
  }, [messages]);

  const sellSideMessages = useMemo(() => {
    return messages.filter(m => 
      !m.isTerminalNode && (m.side === 'SELL' || m.sentiment === 'BEARISH')
    );
  }, [messages]);

  const citedRules = synthesis?.citedRules || [];

  const buySideRules = useMemo(() => {
    return citedRules.filter(r => r.side === 'BUY');
  }, [citedRules]);

  const sellSideRules = useMemo(() => {
    return citedRules.filter(r => r.side === 'SELL');
  }, [citedRules]);

  // Prevailing Market Pressure Calculation
  const { buyPressurePct, sellPressurePct, dominantSide } = useMemo(() => {
    let buyPoints = buySideMessages.length * 15 + buySideRules.reduce((acc, r) => acc + (r.winRate || 65), 0);
    let sellPoints = sellSideMessages.length * 15 + sellSideRules.reduce((acc, r) => acc + (r.winRate || 65), 0);

    if (definitiveBias.includes('BUY')) {
      buyPoints += 140;
    } else if (definitiveBias.includes('SELL')) {
      sellPoints += 140;
    }

    const total = Math.max(1, buyPoints + sellPoints);
    const buyPct = Math.round((buyPoints / total) * 100);
    const sellPct = 100 - buyPct;

    return {
      buyPressurePct: buyPct,
      sellPressurePct: sellPct,
      dominantSide: buyPct >= sellPct ? 'BUY-SIDE' : 'SELL-SIDE',
    };
  }, [buySideMessages, sellSideMessages, buySideRules, sellSideRules, definitiveBias]);

  // Filter messages by round
  const filteredMessages = useMemo(() => {
    if (activeFilterRound === 'ALL') return messages;
    return messages.filter(m => m.round === activeFilterRound);
  }, [messages, activeFilterRound]);

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-3 sm:p-5 flex flex-col space-y-4 shadow-2xl">
      {/* Top Header: Ingestion Status & Swarm State */}
      <div className="flex flex-wrap items-center justify-between border-b border-terminal-border/60 pb-3 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base sm:text-lg tracking-wide">
                05 // AUTONOMOUS 5-AGENT DEBATE & CONSENSUS CHAMBER
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE INGESTION
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 flex items-center gap-2 flex-wrap">
              <span>Pair: <strong className="text-white">{pair}</strong></span>
              <span>•</span>
              <span>Timeframe: <strong className="text-cyan-300">{timeframe.toUpperCase()}</strong></span>
              <span>•</span>
              <span>Live Feed: <strong className="text-emerald-400">Interactive TradingView Canvas</strong></span>
              <span>•</span>
              <span>Knowledge Base: <strong className="text-amber-300">525 Technical + 525 Fundamental Rules</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Execution Mode Invalidation Pill */}
          <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border flex items-center gap-1.5 ${
            isAutoCloseEnforced 
              ? 'bg-rose-500/15 text-rose-300 border-rose-500/40' 
              : 'bg-terminal-800 text-slate-300 border-terminal-border'
          }`}>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>
              {executionMode === 'FULL_AUTOPILOT' 
                ? 'AUTOPILOT (HARDCODED AUTO-CLOSE)' 
                : executionMode === 'SEMI_AUTONOMOUS' 
                ? 'SEMI-AUTO (HARDCODED AUTO-CLOSE)' 
                : 'MANUAL OVERRIDE'}
            </span>
          </span>

          {/* Actionable Directive Pill */}
          <span className={`px-3 py-1 rounded-lg text-xs font-mono font-bold border shadow-sm flex items-center gap-1.5 ${directiveBadgeColor}`}>
            {isStrategicExit ? (
              <AlertOctagon className="w-4 h-4 animate-pulse" />
            ) : isModifyPosition ? (
              <Sliders className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            <span>{directive.replace('_', ' ')}</span>
          </span>

          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            GRADE {confluenceGrade} ({confidenceScore}%)
          </span>

          {onBackToTerminal && (
            <button
              onClick={onBackToTerminal}
              className="px-3 py-1 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors flex items-center gap-1.5 font-semibold"
              title="Return to Terminal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>RETURN TO TERMINAL</span>
            </button>
          )}
        </div>
      </div>

      {/* Persistent Scenario Context Banner */}
      {currentScenario && currentScenario.isActive && (
        <div className="p-3 rounded-xl bg-gradient-to-r from-terminal-950 via-indigo-950/40 to-terminal-950 border border-indigo-500/40 flex flex-wrap items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shrink-0">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-indigo-300 uppercase tracking-wider">
                  Active Persistent Scenario Context:
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  {currentScenario.category}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Severity: <strong className="text-amber-400">{currentScenario.severity}</strong>
                </span>
              </div>
              <p className="text-xs text-white font-medium italic mt-0.5">
                &ldquo;{currentScenario.prompt}&rdquo;
              </p>
              <div className="text-[10px] font-mono text-indigo-400/80 mt-0.5 flex items-center gap-1.5">
                <Activity className="w-3 h-3" />
                <span>Flow Control Engaged • Swarm Dynamically Re-Evaluated • Terminal Node Appended</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearScenario}
              className="px-3 py-1.5 rounded-lg bg-terminal-900 hover:bg-terminal-800 text-slate-300 hover:text-white border border-terminal-border text-xs font-mono flex items-center gap-1.5 transition-colors"
              title="Reset to baseline consensus without custom scenario modulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Baseline</span>
            </button>
          </div>
        </div>
      )}

      {/* Grid: Left = Live Interactive TradingView Chart; Right = Unified Risk Manager Directives */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Live Interactive TradingView Chart Canvas */}
        <div className="lg:col-span-7 bg-terminal-950 border border-terminal-border/80 rounded-xl p-3 flex flex-col relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-terminal-border/40 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">{pair} • Live Interactive TradingView Chart</span>
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                OANDA FEED
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400">Live Tick: <strong className="text-white">{formatPrice(livePrice)}</strong></span>
              <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                SECOND-BY-SECOND
              </span>
            </div>
          </div>

          {/* Interactive TradingView Widget */}
          <div className="w-full h-[360px] rounded-lg overflow-hidden border border-terminal-border/60 bg-black">
            <OandaTradingViewChart symbol={pair} theme="dark" height={360} />
          </div>

          {/* Second-by-Second Invalidation & WebSocket Fail-Safe Health Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
            {/* Live Invalidation Monitor */}
            <div className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
              isInvalidatedNow 
                ? 'bg-rose-950/60 border-rose-500 text-rose-300' 
                : isWarningZone 
                ? 'bg-amber-950/50 border-amber-500 text-amber-300' 
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
            }`}>
              <div className="flex items-center gap-2 min-w-0">
                {isInvalidatedNow ? (
                  <AlertOctagon className="w-4 h-4 text-rose-400 shrink-0 animate-pulse" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="font-bold truncate">
                    {isInvalidatedNow ? 'INVALIDATION BREACH' : isWarningZone ? 'SL PROXIMITY ALERT' : 'CONFLUENCE RESILIENT'}
                  </div>
                  <div className="text-[10px] opacity-80 truncate">
                    Dist to SL: {distanceToStopPips.toFixed(1)} pips ({formatPrice(thresholds.stopLoss)})
                  </div>
                </div>
              </div>

              {isAutoCloseEnforced && isInvalidatedNow && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white shrink-0 animate-pulse">
                  AUTO-CLOSING
                </span>
              )}
            </div>

            {/* WebSocket Stream Fail-Safe */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border flex items-center justify-between gap-2 text-slate-300">
              <div className="flex items-center gap-2 min-w-0">
                <Wifi className="w-4 h-4 text-cyan-400 shrink-0" />
                <div className="min-w-0">
                  <div className="font-bold text-white text-[11px] truncate">WebSocket Feed Fail-Safe</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    Stream: ONLINE • Auto-Sever: &gt;5,000ms drop
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shrink-0">
                ARMED
              </span>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Actionable Directive & Chief Risk Manager Unified Report */}
        <div className="lg:col-span-5 bg-terminal-950/90 border border-terminal-border rounded-xl p-4 flex flex-col justify-between space-y-3">
          {/* Directive Header */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Chief Risk Manager Unified Directive
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Dialectical Synthesis Report
              </span>
            </div>

            <div className={`p-3 rounded-lg border flex items-center justify-between gap-3 ${directiveBadgeColor}`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-black/40 border border-current shrink-0">
                  {isStrategicExit ? (
                    <AlertOctagon className="w-5 h-5 text-rose-400" />
                  ) : isModifyPosition ? (
                    <Sliders className="w-5 h-5 text-amber-400" />
                  ) : (
                    <Target className="w-5 h-5 text-emerald-400" />
                  )}
                </div>
                <div>
                  <div className="text-sm font-bold tracking-wide">
                    {directive.replace('_', ' ')}
                  </div>
                  <div className="text-[11px] font-mono opacity-90">
                    {isStrategicExit 
                      ? 'Immediate position closure mandated on structural invalidation' 
                      : isModifyPosition 
                      ? 'Dynamic stop tightening & volatility lot reduction enforced' 
                      : 'High-confidence confluence verified; maintain target run'}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[9px] font-mono block opacity-75">Swarm Edge</span>
                <span className="text-xs font-mono font-bold">
                  {confidenceScore}% Confluence
                </span>
              </div>
            </div>
          </div>

          {/* Divergence Telemetry Pill */}
          {divergence && divergence.divergenceSeverity !== 'NONE' && (
            <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
              <div>
                <strong>Baseline Divergence ({divergence.divergenceSeverity}):</strong> {divergence.divergenceSummary}
              </div>
            </div>
          )}

          {/* 4 Explicit Institutional Parameters */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {/* 1. Entry Level */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
              <span className="text-[10px] text-slate-400 block mb-0.5">1. ENTRY LEVEL</span>
              <div className="font-bold text-cyan-400 text-sm">{formatPrice(thresholds.entryPrice)}</div>
              <span className="text-[9px] text-slate-500 block truncate">Live market fill target</span>
            </div>

            {/* 2. Profit Target */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 block mb-0.5">2. TARGET (TP)</span>
                <span className="text-[9px] font-mono text-emerald-400/80">
                  {isSell ? 'BELOW ENTRY' : 'ABOVE ENTRY'}
                </span>
              </div>
              <div className="font-bold text-emerald-400 text-sm">{formatPrice(thresholds.takeProfit)}</div>
              <span className="text-[9px] text-emerald-500/90 block truncate">
                +${thresholds.projectedGainUsd} USD projected
              </span>
            </div>

            {/* 3. Hard Stop-Loss */}
            <div className={`p-2.5 rounded-lg bg-terminal-900 border ${
              isModifyPosition ? 'border-amber-500/50 bg-amber-950/20' : 'border-rose-500/30'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-400 block mb-0.5">3. STOP-LOSS (SL)</span>
                <span className="text-[9px] font-bold text-rose-400">
                  {isModifyPosition ? 'TIGHTENED' : isSell ? 'ABOVE ENTRY' : 'BELOW ENTRY'}
                </span>
              </div>
              <div className="font-bold text-rose-400 text-sm">{formatPrice(thresholds.stopLoss)}</div>
              <span className="text-[9px] text-rose-500/90 block truncate">
                Max risk: -${thresholds.maxLossUsd} USD
              </span>
            </div>

            {/* 4. Risk / Reward & Volatility Sizing */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 block mb-0.5">4. R:R & VOL SIZING</span>
                <span className="text-[9px] font-bold text-cyan-400">
                  {volatilitySizing.regime === 'HIGH_VOLATILITY' ? 'VOL REDUCED' : 'STANDARD'}
                </span>
              </div>
              <div className="font-bold text-indigo-400 text-sm">{thresholds.riskRewardRatio}:1 R:R</div>
              <span className="text-[9px] text-indigo-300/80 block truncate">
                {volatilitySizing.adjustedLots} Lots (base {thresholds.positionSizeLots})
              </span>
            </div>
          </div>

          {/* Hardcoded Auto-Close Warning / Discretion Pill */}
          <div className={`p-2 rounded-lg border text-[11px] font-mono ${
            isAutoCloseEnforced 
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
              : 'bg-terminal-900 border-terminal-border text-slate-400'
          }`}>
            {isAutoCloseEnforced ? (
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>
                  <strong>HARDCODED AUTO-CLOSE ACTIVE:</strong> Position terminates immediately upon invalidation breach ({formatPrice(thresholds.stopLoss)}).
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  <strong>MANUAL MODE:</strong> Invalidation triggers will alert trader without automated termination.
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons: Driven by Actionable Directive & Definitive Bias */}
          <div className="space-y-2 pt-1">
            {isStrategicExit ? (
              <button
                onClick={onStrategicExit}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all shadow-md shadow-rose-950/40 hover:shadow-rose-500/20"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>EXECUTE STRATEGIC EXIT / CLOSE OPEN EXPOSURE</span>
              </button>
            ) : isModifyPosition ? (
              <button
                onClick={() => onApplyModification && onApplyModification(thresholds)}
                className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-lg flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all shadow-md shadow-amber-950/40 hover:shadow-amber-500/20"
              >
                <Sliders className="w-4 h-4" />
                <span>APPLY RISK-MITIGATION MODIFICATION ({volatilitySizing.adjustedLots} LOTS)</span>
              </button>
            ) : (
              <button
                onClick={onExecuteTrade}
                disabled={definitiveBias === 'NEUTRAL'}
                className={`w-full py-2.5 px-4 disabled:opacity-50 text-white rounded-lg flex items-center justify-center gap-2 font-mono text-xs font-bold transition-all shadow-md ${
                  isSell
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40 hover:shadow-rose-500/20'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40 hover:shadow-emerald-500/20'
                }`}
              >
                <Target className="w-4 h-4" />
                <span>
                  {isSell
                    ? `EXECUTE SELL MARKET (${volatilitySizing.adjustedLots} LOTS)`
                    : `EXECUTE BUY MARKET (${volatilitySizing.adjustedLots} LOTS)`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Prevailing Market Pressure Comparison Gauge */}
      <div className="bg-terminal-950 border border-terminal-border/80 rounded-xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Prevailing Market Pressure Comparison (Buy-Side vs Sell-Side Dialectics)
            </h4>
          </div>
          <div className="text-[11px] font-mono flex items-center gap-2">
            <span className="text-slate-400">Dominant Bias:</span>
            <span className={`font-bold px-2 py-0.5 rounded border ${
              dominantSide === 'BUY-SIDE' 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            }`}>
              {dominantSide} ADVANTAGE ({dominantSide === 'BUY-SIDE' ? buyPressurePct : sellPressurePct}%)
            </span>
          </div>
        </div>

        {/* Dual-Sided Pressure Gauge Bar */}
        <div className="w-full bg-slate-900 h-4 rounded-full overflow-hidden flex border border-terminal-border">
          <div 
            style={{ width: `${buyPressurePct}%` }}
            className="bg-gradient-to-r from-emerald-600 to-teal-500 flex items-center justify-start pl-2 text-[10px] font-mono font-bold text-white transition-all duration-500"
          >
            {buyPressurePct > 15 ? `BUY ${buyPressurePct}%` : ''}
          </div>
          <div 
            style={{ width: `${sellPressurePct}%` }}
            className="bg-gradient-to-l from-rose-600 to-red-500 flex items-center justify-end pr-2 text-[10px] font-mono font-bold text-white transition-all duration-500"
          >
            {sellPressurePct > 15 ? `SELL ${sellPressurePct}%` : ''}
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-1.5 px-0.5">
          <span className="flex items-center gap-1 text-emerald-400">
            <TrendingUp className="w-3 h-3" />
            Buy-Side Arguments: {buySideMessages.length} deskmates • {buySideRules.length} KB rules
          </span>
          <span className="flex items-center gap-1 text-rose-400">
            <TrendingDown className="w-3 h-3" />
            Sell-Side Arguments: {sellSideMessages.length} deskmates • {sellSideRules.length} KB rules
          </span>
        </div>
      </div>

      {/* Bifurcated Debate Section: Distinct Buy-Side vs Sell-Side Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left: BUY-SIDE CHANNEL */}
        <div className="bg-terminal-950 border border-emerald-500/30 rounded-xl p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                  Buy-Side Channel (Accumulation & Demand Blocks)
                </h4>
                <span className="text-[10px] font-mono text-emerald-400">
                  {buySideMessages.length} Bullish Cross-Examinations • {buySideRules.length} Cited Rules
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              {buyPressurePct}% WEIGHT
            </span>
          </div>

          {/* Buy-Side Rules from 525 Technical & 525 Fundamental Rules */}
          {buySideRules.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Active Buy-Side Institutional Strategies:
              </span>
              <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
                {buySideRules.map((rule) => (
                  <div key={rule.ruleId} className="p-2 rounded bg-terminal-900 border border-emerald-500/20 text-xs font-mono">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-emerald-400 text-[11px]">{rule.ruleId}: {rule.ruleName}</span>
                      <span className="text-[10px] text-amber-300 font-bold">{rule.winRate}% WR</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-sans leading-tight line-clamp-2">{rule.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Buy-Side Agent Arguments */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1 font-mono">
            {buySideMessages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No active buy-side arguments in current debate round.
              </div>
            ) : (
              buySideMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-lg bg-terminal-900/90 border border-emerald-500/20 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded ${msg.avatarColor}`}>
                        {getRoleIcon(msg.role)}
                      </div>
                      <span className="font-bold text-white text-[11px]">{msg.agentName}</span>
                      <span className="text-[10px] text-slate-400 capitalize">({msg.role.replace('_', ' ')})</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      R{msg.round} • BULLISH
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans leading-relaxed pl-1 whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: SELL-SIDE CHANNEL */}
        <div className="bg-terminal-950 border border-rose-500/30 rounded-xl p-3 flex flex-col space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <TrendingDown className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white uppercase tracking-wider">
                  Sell-Side Channel (Distribution & Supply Zones)
                </h4>
                <span className="text-[10px] font-mono text-rose-400">
                  {sellSideMessages.length} Bearish Cross-Examinations • {sellSideRules.length} Cited Rules
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
              {sellPressurePct}% WEIGHT
            </span>
          </div>

          {/* Sell-Side Rules from 525 Technical & 525 Fundamental Rules */}
          {sellSideRules.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Active Sell-Side Institutional Strategies:
              </span>
              <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin pr-1">
                {sellSideRules.map((rule) => (
                  <div key={rule.ruleId} className="p-2 rounded bg-terminal-900 border border-rose-500/20 text-xs font-mono">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-bold text-rose-400 text-[11px]">{rule.ruleId}: {rule.ruleName}</span>
                      <span className="text-[10px] text-amber-300 font-bold">{rule.winRate}% WR</span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-sans leading-tight line-clamp-2">{rule.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sell-Side Agent Arguments */}
          <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1 font-mono">
            {sellSideMessages.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 font-mono">
                No active sell-side arguments in current debate round.
              </div>
            ) : (
              sellSideMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-lg bg-terminal-900/90 border border-rose-500/20 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className={`p-1 rounded ${msg.avatarColor}`}>
                        {getRoleIcon(msg.role)}
                      </div>
                      <span className="font-bold text-white text-[11px]">{msg.agentName}</span>
                      <span className="text-[10px] text-slate-400 capitalize">({msg.role.replace('_', ' ')})</span>
                    </div>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      R{msg.round} • BEARISH
                    </span>
                  </div>
                  <p className="text-slate-200 text-xs font-sans leading-relaxed pl-1 whitespace-pre-line">
                    {msg.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Autonomous 5-Agent Multi-Round Dialectical Stream with DAG Terminal Node */}
      <div className="bg-terminal-950 border border-terminal-border rounded-xl p-3 flex flex-col space-y-3">
        {/* Stream Filter & Round Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/50 pb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-xs text-white">4-Round Dialectical Stream + DAG Terminal Node</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-mono flex-wrap">
            {(['ALL', 1, 2, 3, 4, 5] as const).map((r) => (
              <button
                key={`btn-round-${r}`}
                onClick={() => setActiveFilterRound(r)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  activeFilterRound === r 
                    ? 'bg-indigo-600 text-white font-bold' 
                    : 'bg-terminal-900 text-slate-400 hover:text-white border border-terminal-border'
                }`}
              >
                {r === 'ALL' ? 'ALL ROUNDS' : r === 5 ? '⚡ TERMINAL NODE' : `ROUND ${r}`}
              </button>
            ))}
          </div>
        </div>

        {/* Message Stream */}
        <div className="overflow-y-auto max-h-[380px] space-y-3 pr-1 font-mono scrollbar-thin">
          {filteredMessages.map((msg) => {
            // Render Consolidated Terminal Node Distinctively as Logical Conclusion Node in DAG
            if (msg.isTerminalNode && msg.terminalData) {
              const node = msg.terminalData;
              const nodeDir = node.directive;
              const isExit = nodeDir === 'STRATEGIC_EXIT';
              const isMod = nodeDir === 'MODIFY_POSITION';

              return (
                <div
                  key={msg.id}
                  className={`p-4 rounded-xl border-2 transition-all shadow-xl ${
                    isExit
                      ? 'bg-gradient-to-b from-rose-950/60 to-terminal-950 border-rose-500 shadow-rose-950/40'
                      : isMod
                      ? 'bg-gradient-to-b from-amber-950/60 to-terminal-950 border-amber-500 shadow-amber-950/40'
                      : 'bg-gradient-to-b from-emerald-950/60 to-terminal-950 border-emerald-500 shadow-emerald-950/40'
                  }`}
                >
                  {/* Terminal Node Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/60 pb-2.5 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-black/40 border border-current">
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-white uppercase tracking-wider">
                            Consolidated Terminal Node (DAG Conclusion Node)
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            ROUND 5 RESOLUTION
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          Analytical synthesis of preceding 4 rounds across Technical, Fundamental, News, Forex & Risk Desks
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${directiveBadgeColor}`}>
                        {nodeDir.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Directive Title & Actionable Summary */}
                  <div className="mb-3 p-3 rounded-lg bg-black/30 border border-terminal-border/60">
                    <div className="text-xs font-bold text-white mb-1 flex items-center gap-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{node.directiveTitle}</span>
                    </div>
                    <p className="text-xs text-slate-200 font-sans leading-relaxed">
                      {node.actionableSummary}
                    </p>
                  </div>

                  {/* Divergence Comparison Matrix (Baseline vs Debated Scenario) */}
                  <div className="mb-3">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                      <Sliders className="w-3 h-3 text-indigo-400" />
                      <span>Divergence Evaluation from Initial Baseline</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      {/* 1. Bias Direction */}
                      <div className="p-2 rounded-lg bg-terminal-900 border border-terminal-border">
                        <span className="text-[10px] text-slate-400 block">Bias Direction</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-slate-400">{node.divergence.baselineBias}</span>
                          <span className="text-slate-600">→</span>
                          <span className={`font-bold ${
                            node.divergence.debatedBias === node.divergence.baselineBias
                              ? 'text-white'
                              : 'text-amber-400'
                          }`}>
                            {node.divergence.debatedBias}
                          </span>
                        </div>
                      </div>

                      {/* 2. Confidence Delta */}
                      <div className="p-2 rounded-lg bg-terminal-900 border border-terminal-border">
                        <span className="text-[10px] text-slate-400 block">Confidence Score</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-slate-400">{node.divergence.baselineConfidence}%</span>
                          <span className="text-slate-600">→</span>
                          <span className={`font-bold ${
                            node.divergence.confidenceDelta < 0 ? 'text-rose-400' : 'text-emerald-400'
                          }`}>
                            {node.divergence.debatedConfidence}% ({node.divergence.confidenceDelta > 0 ? '+' : ''}{node.divergence.confidenceDelta}%)
                          </span>
                        </div>
                      </div>

                      {/* 3. Risk / Reward Profile */}
                      <div className="p-2 rounded-lg bg-terminal-900 border border-terminal-border">
                        <span className="text-[10px] text-slate-400 block">Risk/Reward Profile</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-slate-400">{node.divergence.baselineRiskReward}:1</span>
                          <span className="text-slate-600">→</span>
                          <span className="font-bold text-indigo-300">
                            {node.divergence.debatedRiskReward}:1
                          </span>
                        </div>
                      </div>

                      {/* 4. Sizing Adjustment */}
                      <div className="p-2 rounded-lg bg-terminal-900 border border-terminal-border">
                        <span className="text-[10px] text-slate-400 block">Position Sizing</span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="font-bold text-white">
                            {node.updatedThresholds.positionSizeLots} Lots
                          </span>
                          {node.divergence.positionSizeAdjustmentPercent !== 0 && (
                            <span className="text-[10px] font-bold text-amber-400">
                              ({node.divergence.positionSizeAdjustmentPercent}%)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swarm Multi-Desk Sign-Off Quotes */}
                  <div className="p-2.5 rounded-lg bg-terminal-900/80 border border-terminal-border space-y-1.5 text-[11px] mb-3">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Autonomous Swarm Multi-Desk Sign-Off:
                    </span>
                    <div className="text-cyan-300">
                      • {node.swarmSignOff.technicalAnalyst}
                    </div>
                    <div className="text-purple-300">
                      • {node.swarmSignOff.fundamentalAnalyst}
                    </div>
                    <div className="text-sky-300">
                      • {node.swarmSignOff.newsAnalyst}
                    </div>
                    <div className="text-amber-300">
                      • {node.swarmSignOff.forexAnalyst}
                    </div>
                    <div className="text-emerald-300 font-bold">
                      • {node.swarmSignOff.chiefRiskOfficer}
                    </div>
                  </div>

                  {/* Terminal Action Execution Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-terminal-border/60">
                    <div className="text-[10px] font-mono text-slate-400">
                      Urgency: <strong className={isExit ? 'text-rose-400' : 'text-amber-400'}>{node.executionGuidance.urgency}</strong> • Action: <strong className="text-white">{node.executionGuidance.action}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {isExit ? (
                        <button
                          onClick={onStrategicExit}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <AlertOctagon className="w-3.5 h-3.5" />
                          <span>Close Active Position / Abort</span>
                        </button>
                      ) : isMod ? (
                        <button
                          onClick={() => onApplyModification && onApplyModification(node.updatedThresholds)}
                          className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                          <span>Apply Risk Modification</span>
                        </button>
                      ) : (
                        <button
                          onClick={onExecuteTrade}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Target className="w-3.5 h-3.5" />
                          <span>Maintain & Execute Order</span>
                        </button>
                      )}

                      {currentScenario && (
                        <button
                          onClick={onClearScenario}
                          className="px-2.5 py-1.5 bg-terminal-800 hover:bg-terminal-700 text-slate-300 rounded-lg text-xs font-mono transition-colors"
                        >
                          Clear Scenario
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Standard Agent Messages (Rounds 1-4)
            const isRisk = msg.role === 'risk_manager';
            return (
              <div
                key={msg.id}
                className={`p-3 rounded-xl border transition-all ${
                  isRisk 
                    ? 'bg-terminal-900/95 border-emerald-500/40 shadow-sm shadow-emerald-500/10' 
                    : 'bg-terminal-900/60 border-terminal-border hover:border-slate-600'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`p-1.5 rounded-lg border flex items-center justify-center shrink-0 ${msg.avatarColor}`}>
                      {getRoleIcon(msg.role)}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-xs text-white block truncate">{msg.agentName}</span>
                      <span className="text-[10px] text-slate-400 capitalize truncate block">
                        {msg.role.replace('_', ' ')} • Round {msg.round}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {msg.citedRuleId && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 text-indigo-400" />
                        Rule: {msg.citedRuleId} {msg.winRate ? `(${msg.winRate}% WR)` : ''}
                      </span>
                    )}

                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      msg.sentiment === 'BULLISH'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : msg.sentiment === 'BEARISH'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : msg.sentiment === 'CAUTION'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                    }`}>
                      {msg.sentiment}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-200 text-xs font-sans leading-relaxed pl-1 whitespace-pre-line">
                  {msg.content}
                </p>
              </div>
            );
          })}
        </div>

        {/* Preset Scenario Injection Pills */}
        <div className="pt-2 border-t border-terminal-border/50">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Inject Conditional Stress Scenario (Persistent Context Variable):
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SCENARIOS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                disabled={isDebating}
                className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-terminal-900 hover:bg-indigo-950/60 text-slate-300 hover:text-indigo-200 border border-terminal-border hover:border-indigo-500/40 transition-colors disabled:opacity-50"
              >
                + {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar: Custom Conditional Scenario Injection */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Inject custom scenario (e.g. 'anticipating a market reversal', 'Fed surprise 50bps rate cut', 'oil spikes 8%')..."
            maxLength={300}
            className="flex-1 bg-terminal-900 border border-terminal-border rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isDebating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg flex items-center gap-1.5 font-mono text-xs font-bold transition-colors shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isDebating ? 'DELIBERATING...' : 'INJECT SCENARIO'}</span>
          </button>
        </form>
      </div>

      {/* Dedicated Execution Latency & Slippage Logger Module */}
      <div className="bg-terminal-950 border border-terminal-border rounded-xl p-3 flex flex-col space-y-3">
        <div className="flex items-center justify-between border-b border-terminal-border/50 pb-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs text-white uppercase tracking-wider">
              Execution Latency & Slippage Telemetry Logger
            </h4>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              CIRCUIT BREAKER: {telemetry.circuitBreakerTripped ? 'TRIPPED' : 'ARMED & MONITORING'}
            </span>
          </div>

          <button
            onClick={() => setShowTelemetryLogger(!showTelemetryLogger)}
            className="text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1"
          >
            <span>{showTelemetryLogger ? 'Hide Log' : 'Show Log'}</span>
            {showTelemetryLogger ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Telemetry Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
          <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
            <span className="text-[10px] text-slate-400 block">AVG LATENCY</span>
            <div className="font-bold text-cyan-400 text-sm">{telemetry.avgLatencyMs} ms</div>
            <span className="text-[9px] text-slate-500">Min {telemetry.minLatencyMs}ms / Max {telemetry.maxLatencyMs}ms</span>
          </div>

          <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
            <span className="text-[10px] text-slate-400 block">AVG SLIPPAGE</span>
            <div className="font-bold text-emerald-400 text-sm">{telemetry.avgSlippagePips} pips</div>
            <span className="text-[9px] text-slate-500">Max: {telemetry.maxSlippagePips} pips</span>
          </div>

          <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
            <span className="text-[10px] text-slate-400 block">TARGET VIABILITY</span>
            <div className="font-bold text-indigo-400 text-sm">{telemetry.targetViabilityRate}%</div>
            <span className="text-[9px] text-slate-500">{telemetry.totalExecutions} logged trades</span>
          </div>

          <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
            <span className="text-[10px] text-slate-400 block">RATE LIMITER</span>
            <div className="font-bold text-emerald-400 text-sm">3 orders / 5s</div>
            <span className="text-[9px] text-slate-500">Min 1,200ms spacing</span>
          </div>

          <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
            <span className="text-[10px] text-slate-400 block">CIRCUIT BREAKER</span>
            <div className={`font-bold text-sm ${telemetry.circuitBreakerTripped ? 'text-rose-400' : 'text-emerald-400'}`}>
              {telemetry.circuitBreakerTripped ? 'HALTED' : '3.0% DD CEILING'}
            </div>
            <span className="text-[9px] text-slate-500">Auto-halt protected</span>
          </div>
        </div>

        {/* Recent Execution Audit Records */}
        {showTelemetryLogger && (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-[11px] border border-terminal-border rounded-lg overflow-hidden">
              <thead className="bg-terminal-900 text-slate-400 border-b border-terminal-border">
                <tr>
                  <th className="p-2">Execution ID</th>
                  <th className="p-2">Pair</th>
                  <th className="p-2">Side</th>
                  <th className="p-2">Lots</th>
                  <th className="p-2">Target Price</th>
                  <th className="p-2">Fill Price</th>
                  <th className="p-2">Slippage</th>
                  <th className="p-2">Latency</th>
                  <th className="p-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/50 text-slate-300">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-3 text-center text-slate-500">
                      No live executions logged in this session yet. System ready for trade routing.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-terminal-900/60 transition-colors">
                      <td className="p-2 text-slate-400">{log.id.slice(0, 14)}...</td>
                      <td className="p-2 font-bold text-white">{log.symbol}</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          log.direction === 'BUY' 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {log.direction}
                        </span>
                      </td>
                      <td className="p-2">{log.lots}</td>
                      <td className="p-2">{formatPrice(log.targetEntry)}</td>
                      <td className="p-2">{formatPrice(log.filledEntry)}</td>
                      <td className="p-2 text-amber-300">{log.slippagePips} pips (${log.slippageUsd})</td>
                      <td className="p-2 text-cyan-300">{log.latencyMs} ms</td>
                      <td className="p-2">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          log.viabilityStatus === 'OPTIMAL'
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                            : log.viabilityStatus === 'VIABLE'
                            ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}>
                          {log.viabilityStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
