'use client';

import React, { useState, useMemo } from 'react';
import { 
  AgentDebateMessage, 
  Candle, 
  CurrencyPair, 
  TimeFrame, 
  DebateSynthesisResult, 
  DebatePriceThresholds,
  DebateScenarioContext,
  DebateActionableDirective,
  KnowledgeRule
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
  Clock,
  Wifi,
  Cpu,
  Gauge
} from 'lucide-react';
import { ChartView } from '@/components/ChartView';
import { KnowledgeEngine } from '@/lib/knowledge/KnowledgeEngine';
import { getMarketSegmentForSymbol } from '@/lib/marketData';
import { LiveMarketFeedManager } from '@/lib/liveMarketFeed';
import { executionTelemetryLogger } from '@/lib/executionTelemetryLogger';
import { circuitBreakerManager } from '@/lib/circuitBreakerManager';
import { webSocketFailSafeManager } from '@/lib/webSocketFailSafeManager';
import { apiRateLimiter } from '@/lib/apiRateLimiter';

interface AgentDebateFeedProps {
  messages: AgentDebateMessage[];
  candles?: Candle[];
  pair?: CurrencyPair;
  timeframe?: TimeFrame;
  synthesis?: DebateSynthesisResult;
  activeScenario?: DebateScenarioContext | null;
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
  const [channelFilter, setChannelFilter] = useState<'ALL' | 'BUY_SIDE' | 'SELL_SIDE'>('ALL');

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
      takeProfit2: isSellBias
        ? Number((currentPrice * 0.985).toFixed(5))
        : Number((currentPrice * 1.015).toFixed(5)),
      stopLoss: isSellBias 
        ? Number((currentPrice * 1.004).toFixed(5)) 
        : Number((currentPrice * 0.996).toFixed(5)),
      riskRewardRatio: 2.2,
      positionSizeLots: 0.11,
      volatilityScaledLots: 0.09,
      maxLossUsd: 150,
      projectedGainUsd: 330,
      invalidationCriteria: `${timeframe} candle close beyond stop loss`,
      trajectoryHorizonBars: 16,
      projectedPriceMove: isSellBias 
        ? Number((currentPrice * -0.008).toFixed(5)) 
        : Number((currentPrice * 0.008).toFixed(5)),
    };
  }, [synthesis, candles, timeframe]);

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
  // Knowledge Base Engine: Bifurcated 525 Tech & 525 Fund Rules
  // -------------------------------------------------------------
  const segment = useMemo(() => getMarketSegmentForSymbol(pair), [pair]);
  const knowledgeEngine = useMemo(() => new KnowledgeEngine(), []);

  const opposingRules = useMemo(() => {
    return knowledgeEngine.getOpposingRules(segment, 'BUY');
  }, [knowledgeEngine, segment]);

  const livePrice = LiveMarketFeedManager.getCanonicalPrice(pair);

  // -------------------------------------------------------------
  // Second-by-Second Live Chart Monitoring & Invalidation Engine
  // -------------------------------------------------------------
  const isChartInvalidated = useMemo(() => {
    if (isBuy && livePrice <= thresholds.stopLoss) return true;
    if (isSell && livePrice >= thresholds.stopLoss) return true;
    return false;
  }, [isBuy, isSell, livePrice, thresholds.stopLoss]);

  const invalidationReason = useMemo(() => {
    if (isBuy && livePrice <= thresholds.stopLoss) {
      return `Price breached stop-loss (${formatPrice(thresholds.stopLoss)}). Structural Long Invalidation Active.`;
    }
    if (isSell && livePrice >= thresholds.stopLoss) {
      return `Price breached stop-loss (${formatPrice(thresholds.stopLoss)}). Structural Short Invalidation Active.`;
    }
    return '';
  }, [isBuy, isSell, livePrice, thresholds.stopLoss, formatPrice]);

  // Bifurcated Stances & Prevailing Market Pressure Calculation
  const buyMessages = useMemo(() => messages.filter(m => m.side === 'BUY' || m.sentiment === 'BULLISH'), [messages]);
  const sellMessages = useMemo(() => messages.filter(m => m.side === 'SELL' || m.sentiment === 'BEARISH'), [messages]);

  const totalBuyPower = opposingRules.supportingTech.length + opposingRules.supportingFund.length + (buyMessages.length * 4);
  const totalSellPower = opposingRules.opposingTech.length + opposingRules.opposingFund.length + (sellMessages.length * 4);
  const totalPower = Math.max(1, totalBuyPower + totalSellPower);
  const buyPressurePercent = Math.round((totalBuyPower / totalPower) * 100);
  const sellPressurePercent = 100 - buyPressurePercent;

  // Secondary Take-Profit Target (TP2)
  const takeProfit1 = thresholds.takeProfit;
  const takeProfit2 = thresholds.takeProfit2 || (isSell
    ? Number((thresholds.entryPrice - Math.abs(thresholds.entryPrice - thresholds.stopLoss) * 3.2).toFixed(5))
    : Number((thresholds.entryPrice + Math.abs(thresholds.stopLoss - thresholds.entryPrice) * 3.2).toFixed(5)));

  // Telemetry Summaries
  const telemetrySummary = useMemo(() => executionTelemetryLogger.getSummary(), []);
  const cbState = useMemo(() => circuitBreakerManager.getState(), []);
  const failSafeStatus = useMemo(() => webSocketFailSafeManager.getStatus(), []);

  // Filter messages by round & channel
  const filteredMessages = useMemo(() => {
    let list = messages;
    if (activeFilterRound !== 'ALL') {
      list = list.filter(m => m.round === activeFilterRound);
    }
    if (channelFilter === 'BUY_SIDE') {
      list = list.filter(m => m.side === 'BUY' || m.sentiment === 'BULLISH');
    } else if (channelFilter === 'SELL_SIDE') {
      list = list.filter(m => m.side === 'SELL' || m.sentiment === 'BEARISH');
    }
    return list;
  }, [messages, activeFilterRound, channelFilter]);

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
                06 // AUTONOMOUS 5-AGENT DEBATE & CONSENSUS CHAMBER
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
              <span>Live Feed: <strong className="text-emerald-400 font-bold">{formatPrice(livePrice)}</strong></span>
              <span>•</span>
              <span>Strategies: <strong className="text-amber-300">525 Technical + 525 Fundamental Rules</strong></span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
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

      {/* ============================================================= */}
      {/* SECTION 1: INTERACTIVE TRADINGVIEW CHART & RISK DIRECTIVES    */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Interactive TradingView Live Chart Canvas */}
        <div className="lg:col-span-7 bg-terminal-950 border border-terminal-border/80 rounded-xl p-3 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-terminal-border/40 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">{pair} • {timeframe.toUpperCase()} Interactive TradingView Chart</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE STREAM ACTIVE
              </span>
            </div>
          </div>

          {/* Interactive TradingView Chart Component */}
          <div className="w-full rounded-lg overflow-hidden border border-terminal-border/60">
            <ChartView
              candles={candles}
              pair={pair}
              timeframe={timeframe}
              entryPrice={thresholds.entryPrice}
              stopLoss={thresholds.stopLoss}
              takeProfit={thresholds.takeProfit}
              signalBias={definitiveBias}
            />
          </div>

          {/* Second-by-Second Live Monitoring of Active Chart */}
          <div className={`mt-2.5 p-2.5 rounded-lg border flex items-center justify-between text-xs font-mono transition-colors ${
            isChartInvalidated 
              ? 'bg-rose-950/80 border-rose-500 text-rose-200 animate-pulse'
              : 'bg-terminal-900 border-terminal-border text-slate-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isChartInvalidated ? 'bg-rose-400 animate-ping' : 'bg-emerald-400 animate-pulse'}`} />
              <span className="font-bold text-[11px]">
                {isChartInvalidated ? 'CRITICAL INVALIDATION TRIGGERED:' : 'SECOND-BY-SECOND MONITOR:'}
              </span>
              <span className="text-[11px] opacity-90 truncate max-w-[260px]">
                {isChartInvalidated ? invalidationReason : 'Tape resilient; active parameters strictly bounded.'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 shrink-0 font-mono">
              Live: <strong className="text-white">{formatPrice(livePrice)}</strong> | SL: <strong className="text-rose-400">{formatPrice(thresholds.stopLoss)}</strong> | TP1: <strong className="text-emerald-400">{formatPrice(takeProfit1)}</strong>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Actionable Directive & Synthesized Risk Manager Report */}
        <div className="lg:col-span-5 bg-terminal-950/90 border border-terminal-border rounded-xl p-4 flex flex-col justify-between space-y-3">
          {/* Directive Header */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Actionable Consensus Directive
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Risk Manager Gatekeeper Synthesis
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
                      ? 'Immediate position closure / order abort mandated' 
                      : isModifyPosition 
                      ? 'Dynamic stop tightening & lot size reduction required' 
                      : 'Confluence resilient; maintain current position'}
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

          {/* Explicit Price Threshold Metrics */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {/* 1. Entry Level */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
              <span className="text-[10px] text-slate-400 block mb-0.5">1. ENTRY LEVEL</span>
              <div className="font-bold text-cyan-400 text-sm">{formatPrice(thresholds.entryPrice)}</div>
              <span className="text-[9px] text-slate-500 block truncate">Deterministic Latched Entry</span>
            </div>

            {/* 2. Profit Targets: TP1 & TP2 */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-emerald-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-400 block mb-0.5">2. TARGETS (TP1/TP2)</span>
                <span className="text-[9px] font-mono text-emerald-400/80">
                  {isSell ? 'BELOW' : 'ABOVE'}
                </span>
              </div>
              <div className="font-bold text-emerald-400 text-sm">
                TP1: {formatPrice(takeProfit1)}
              </div>
              <div className="text-[10px] text-emerald-300/90 font-mono truncate">
                TP2 (Runner): {formatPrice(takeProfit2)}
              </div>
              <span className="text-[9px] text-emerald-500/90 block truncate mt-0.5">
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

            {/* 4. Risk / Reward & Volatility-Adjusted Sizing */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 block mb-0.5">4. R:R & SIZING</span>
                <span className="text-[9px] font-bold text-emerald-400">ZERO-VETO</span>
              </div>
              <div className="font-bold text-indigo-400 text-sm">{thresholds.riskRewardRatio}:1 R:R</div>
              <span className="text-[9px] text-indigo-300/80 block truncate">
                {thresholds.positionSizeLots} Lots (Vol Scaled)
              </span>
            </div>
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
                <span>APPLY RISK-MITIGATION MODIFICATION ({thresholds.positionSizeLots} LOTS)</span>
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
                    ? `EXECUTE SELL MARKET (${thresholds.positionSizeLots} LOTS)`
                    : `EXECUTE BUY MARKET (${thresholds.positionSizeLots} LOTS)`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 2: BIFURCATED BUY-SIDE VS SELL-SIDE DEBATE CHANNELS   */}
      {/* ============================================================= */}
      <div className="bg-terminal-950 border border-terminal-border/80 rounded-xl p-3 sm:p-4 space-y-3">
        {/* Prevailing Market Pressure Synthesizer Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/50 pb-2.5">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-indigo-400" />
            <h4 className="font-bold text-xs sm:text-sm text-white">
              Bifurcated Buy-Side vs Sell-Side Channel Matrix (525 Technical vs 525 Fundamental Strategies)
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">Channel View:</span>
            <div className="flex items-center gap-1 font-mono text-[10px]">
              {(['ALL', 'BUY_SIDE', 'SELL_SIDE'] as const).map(ch => (
                <button
                  key={ch}
                  onClick={() => setChannelFilter(ch)}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    channelFilter === ch 
                      ? 'bg-indigo-600 text-white font-bold' 
                      : 'bg-terminal-900 text-slate-400 hover:text-white border border-terminal-border'
                  }`}
                >
                  {ch === 'ALL' ? 'SPLIT VIEW' : ch === 'BUY_SIDE' ? 'BUY CHANNEL' : 'SELL CHANNEL'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Prevailing Market Pressure Gauge Bar */}
        <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>BUY-SIDE PRESSURE: {buyPressurePercent}%</span>
            </div>
            <div className="text-[11px] text-slate-300 font-bold uppercase">
              {buyPressurePercent >= 55 ? (
                <span className="text-emerald-400">Bullish Institutional Dominance</span>
              ) : sellPressurePercent >= 55 ? (
                <span className="text-rose-400">Bearish Institutional Dominance</span>
              ) : (
                <span className="text-amber-400">Consensus Equilibrium Range</span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span>SELL-SIDE PRESSURE: {sellPressurePercent}%</span>
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Tug-of-War Pressure Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500" 
              style={{ width: `${buyPressurePercent}%` }} 
            />
            <div 
              className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500" 
              style={{ width: `${sellPressurePercent}%` }} 
            />
          </div>
        </div>

        {/* Bifurcated Dual-Channel Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* 1. BUY-SIDE CHANNEL */}
          {(channelFilter === 'ALL' || channelFilter === 'BUY_SIDE') && (
            <div className="p-3 rounded-lg bg-terminal-900/90 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-emerald-500/20 text-emerald-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-emerald-400 uppercase tracking-wide">
                      BUY-SIDE CHANNEL (BULLS)
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">
                      {opposingRules.supportingTech.length} Technical & {opposingRules.supportingFund.length} Fundamental Long Rules
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  {buyPressurePercent}% PRESSURE
                </span>
              </div>

              {/* Top Supporting Technical Rules for Long */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-emerald-300 font-bold block">
                  Top Technical Confluences (from 525 Technical Strategies):
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {opposingRules.supportingTech.slice(0, 3).map(rule => (
                    <div key={rule.id} className="p-2 rounded bg-terminal-950 border border-emerald-500/20 text-[11px]">
                      <div className="flex items-center justify-between text-emerald-400 font-bold">
                        <span>{rule.id} • {rule.ruleName}</span>
                        <span className="text-amber-300">{rule.expectedWinRate}% WR</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {rule.conditionDescription}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Supporting Fundamental Rules for Long */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-purple-300 font-bold block">
                  Top Fundamental Confluences (from 525 Fundamental Strategies):
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {opposingRules.supportingFund.slice(0, 2).map(rule => (
                    <div key={rule.id} className="p-2 rounded bg-terminal-950 border border-purple-500/20 text-[11px]">
                      <div className="flex items-center justify-between text-purple-300 font-bold">
                        <span>{rule.id} • {rule.ruleName}</span>
                        <span className="text-amber-300">{rule.expectedWinRate}% WR</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {rule.conditionDescription}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 2. SELL-SIDE CHANNEL */}
          {(channelFilter === 'ALL' || channelFilter === 'SELL_SIDE') && (
            <div className="p-3 rounded-lg bg-terminal-900/90 border border-rose-500/30 space-y-2.5">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-rose-500/20 text-rose-400">
                    <TrendingDown className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-rose-400 uppercase tracking-wide">
                      SELL-SIDE CHANNEL (BEARS)
                    </h5>
                    <span className="text-[10px] font-mono text-slate-400">
                      {opposingRules.opposingTech.length} Technical & {opposingRules.opposingFund.length} Fundamental Short Rules
                    </span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30">
                  {sellPressurePercent}% PRESSURE
                </span>
              </div>

              {/* Top Supporting Technical Rules for Short */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-rose-300 font-bold block">
                  Top Technical Confluences (from 525 Technical Strategies):
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {opposingRules.opposingTech.slice(0, 3).map(rule => (
                    <div key={rule.id} className="p-2 rounded bg-terminal-950 border border-rose-500/20 text-[11px]">
                      <div className="flex items-center justify-between text-rose-400 font-bold">
                        <span>{rule.id} • {rule.ruleName}</span>
                        <span className="text-amber-300">{rule.expectedWinRate}% WR</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {rule.conditionDescription}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Supporting Fundamental Rules for Short */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-mono uppercase text-purple-300 font-bold block">
                  Top Fundamental Confluences (from 525 Fundamental Strategies):
                </span>
                <div className="space-y-1 font-mono text-xs">
                  {opposingRules.opposingFund.slice(0, 2).map(rule => (
                    <div key={rule.id} className="p-2 rounded bg-terminal-950 border border-purple-500/20 text-[11px]">
                      <div className="flex items-center justify-between text-purple-300 font-bold">
                        <span>{rule.id} • {rule.ruleName}</span>
                        <span className="text-amber-300">{rule.expectedWinRate}% WR</span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-sans line-clamp-1 mt-0.5">
                        {rule.conditionDescription}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 3: SYSTEM TELEMETRY & EXECUTION PROTECTION DECK       */}
      {/* ============================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 font-mono text-xs">
        {/* 1. Execution Latency & Slippage Logger Card */}
        <div className="p-2.5 rounded-lg bg-terminal-950 border border-terminal-border/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Execution Telemetry</span>
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="font-bold text-white text-sm">
            {telemetrySummary.avgLatencyMs}ms <span className="text-[10px] text-slate-400 font-normal">avg latency</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>Slippage: <strong className="text-emerald-400">{telemetrySummary.avgSlippagePips} pips</strong></span>
            <span>Target R:R: <strong className="text-indigo-300">{telemetrySummary.targetRRRetentionPercent}%</strong></span>
          </div>
        </div>

        {/* 2. Institutional Circuit Breaker */}
        <div className="p-2.5 rounded-lg bg-terminal-950 border border-terminal-border/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold">Circuit Breaker</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${cbState.isTripped ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'}`} />
            <span>{cbState.isTripped ? 'HALTED' : 'NORMAL (ARMED)'}</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>Flash Limit: <strong>3.0%/60s</strong></span>
            <span>Drawdown Cap: <strong>4.0%</strong></span>
          </div>
        </div>

        {/* 3. WebSocket Fail-Safe */}
        <div className="p-2.5 rounded-lg bg-terminal-950 border border-terminal-border/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold">WebSocket Fail-Safe</span>
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="font-bold text-emerald-400 text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>AUTO-SEVER ARMED</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>Drop Threshold: <strong>5000ms</strong></span>
            <span>Autopilot: <strong>Auto-Close</strong></span>
          </div>
        </div>

        {/* 4. Strict API Rate Limiter */}
        <div className="p-2.5 rounded-lg bg-terminal-950 border border-terminal-border/80">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[10px] uppercase font-bold">API Rate Limiter</span>
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="font-bold text-indigo-300 text-sm flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span>TOKEN BUCKET ACTIVE</span>
          </div>
          <div className="text-[10px] text-slate-400 flex items-center justify-between mt-1">
            <span>Rate: <strong>Max 3 / 2s</strong></span>
            <span>Debounce: <strong>400ms</strong></span>
          </div>
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 4: 5-AGENT MULTI-ROUND DIALECTICAL STREAM             */}
      {/* ============================================================= */}
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
        <div className="overflow-y-auto max-h-[420px] space-y-3 pr-1 font-mono scrollbar-thin">
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
                      <span className={`px-2.5 py-1 rounded text-xs font-bold border ${directiveBadgeColor}`}>
                        DIRECTIVE: {nodeDir.replace('_', ' ')}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {node.directiveConfidence}% CONFLUENCE
                      </span>
                    </div>
                  </div>

                  {/* Synthetic Summary Paragraph */}
                  <p className="text-xs text-slate-200 leading-relaxed font-sans mb-3 bg-black/30 p-2.5 rounded-lg border border-terminal-border/40">
                    {node.actionableSummary}
                  </p>

                  {/* Terminal Price Targets Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                    <div className="p-2 rounded bg-terminal-900 border border-terminal-border">
                      <span className="text-[10px] text-slate-400 block">ENTRY PRICE</span>
                      <div className="font-bold text-cyan-400">{formatPrice(node.updatedThresholds.entryPrice)}</div>
                    </div>
                    <div className="p-2 rounded bg-terminal-900 border border-emerald-500/30">
                      <span className="text-[10px] text-emerald-400 block">TAKE-PROFIT</span>
                      <div className="font-bold text-emerald-400">{formatPrice(node.updatedThresholds.takeProfit)}</div>
                    </div>
                    <div className="p-2 rounded bg-terminal-900 border border-rose-500/30">
                      <span className="text-[10px] text-rose-400 block">STOP-LOSS</span>
                      <div className="font-bold text-rose-400">{formatPrice(node.updatedThresholds.stopLoss)}</div>
                    </div>
                    <div className="p-2 rounded bg-terminal-900 border border-indigo-500/30">
                      <span className="text-[10px] text-indigo-300 block">R:R / SIZING</span>
                      <div className="font-bold text-indigo-300">
                        {node.updatedThresholds.riskRewardRatio}:1 ({node.updatedThresholds.positionSizeLots} L)
                      </div>
                    </div>
                  </div>

                  {/* Invalidation Criteria & Trajectory Banner */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2 rounded bg-terminal-900/60 border border-terminal-border/60 text-[11px]">
                    <div className="flex items-center gap-1.5 text-rose-300">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                      <span><strong>Invalidation Criteria:</strong> {node.updatedThresholds.invalidationCriteria}</span>
                    </div>
                    <div className="text-slate-400">
                      Trajectory Horizon: <strong className="text-white">{node.updatedThresholds.trajectoryHorizonBars} bars</strong>
                    </div>
                  </div>
                </div>
              );
            }

            // Standard Agent Debate Turn Message
            const isBuyStance = msg.side === 'BUY' || msg.sentiment === 'BULLISH';
            const isSellStance = msg.side === 'SELL' || msg.sentiment === 'BEARISH';
            const stanceColor = isBuyStance
              ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
              : isSellStance
              ? 'text-rose-400 bg-rose-500/10 border-rose-500/30'
              : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

            return (
              <div 
                key={msg.id} 
                className="p-3 rounded-lg bg-terminal-900 border border-terminal-border/70 hover:border-terminal-border transition-colors space-y-2"
              >
                {/* Agent Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border/40 pb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-terminal-950 border border-terminal-border">
                      {getRoleIcon(msg.role)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-white">{msg.agentName}</span>
                        <span className="text-[10px] text-slate-400">({msg.role.replace('_', ' ')})</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      R{msg.round}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${stanceColor}`}>
                      {msg.side || msg.sentiment}
                    </span>
                    {msg.winRate && (
                      <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                        {msg.winRate}% WR
                      </span>
                    )}
                  </div>
                </div>

                {/* Agent Argument / Content */}
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {msg.content}
                </p>

                {/* Cited Rule Footnote */}
                {msg.citedRuleName && (
                  <div className="p-1.5 rounded bg-terminal-950 border border-terminal-border/50 text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="text-indigo-300 font-bold">
                      Rule: {msg.citedRuleId ? `${msg.citedRuleId} • ` : ''}{msg.citedRuleName}
                    </span>
                    {msg.strategyCategory && (
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        {msg.strategyCategory}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================= */}
      {/* SECTION 5: CUSTOM DIALECTICAL PROMPT & STRESS TEST SCENARIOS  */}
      {/* ============================================================= */}
      <div className="bg-terminal-950 border border-terminal-border rounded-xl p-3 sm:p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="font-bold text-xs text-white">
              Stress-Test Swarm Consensus with Custom Macro or Structural Scenarios
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Injects real-time dialectical prompt into next round
          </span>
        </div>

        {/* Preset Scenarios */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400 mr-1">Presets:</span>
          {PRESET_SCENARIOS.map((preset) => (
            <button
              key={preset}
              onClick={() => handleSelectPreset(preset)}
              disabled={isDebating}
              className="px-2.5 py-1 rounded-lg bg-terminal-900 hover:bg-terminal-800 disabled:opacity-50 text-[11px] font-mono text-slate-300 hover:text-white border border-terminal-border transition-colors flex items-center gap-1"
            >
              <span>{preset}</span>
              <ArrowRight className="w-3 h-3 text-cyan-400" />
            </button>
          ))}
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            disabled={isDebating}
            placeholder="E.g. What happens if Powell signals 50bps rate cut? Or what if price sweeps previous day low?"
            className="flex-1 bg-terminal-900 border border-terminal-border rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isDebating}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>DISPATCH PROMPT</span>
          </button>
        </form>
      </div>
    </div>
  );
};
