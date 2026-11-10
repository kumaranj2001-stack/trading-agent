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
  SwarmConsensusResult
} from '@/lib/types';
import { 
  Send, 
  Bot, 
  Shield, 
  ShieldCheck,
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
  Zap
} from 'lucide-react';

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
  consensus?: SwarmConsensusResult | null;
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
  consensus,
}) => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [activeFilterRound, setActiveFilterRound] = useState<number | 'ALL'>('ALL');

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
  const isMaintainPosition = directive === 'MAINTAIN_POSITION';

  const definitiveBias = synthesis?.definitiveBias || 'BUY';
  const confluenceGrade = synthesis?.confluenceGrade || 'A';
  const confidenceScore = synthesis?.confidenceScore || 85;

  const isBuy = definitiveBias.includes('BUY');
  const isSell = definitiveBias.includes('SELL');

  // Dedicated Risk Governance & Edge derived state (Exclusive to Autonomous 5-Agent Debate & Consensus Chamber)
  const effectiveRiskVerdict = 
    isModifyPosition ? 'MODIFIED' : 
    isStrategicExit ? 'VETOED' : 
    (consensus?.agents?.risk?.verdict || synthesis?.riskGovernance?.verdict || 'APPROVED');

  const effectiveRiskGovernance = 
    consensus?.unifiedDecision?.coreReasons?.riskGovernance || 
    synthesis?.riskGovernance?.reasoning || 
    (isModifyPosition 
      ? `DYNAMIC MITIGATION: Ratcheted hard stop-loss to ${formatPrice(thresholds.stopLoss)} (${isSell ? 'above entry' : 'below entry'}), reduced position sizing to ${thresholds.positionSizeLots} lots, locking R:R at ${thresholds.riskRewardRatio}:1 with -$${thresholds.maxLossUsd} USD downside risk cap.` 
      : isStrategicExit 
      ? `VETO ENFORCED: Capital preservation gate engaged. Tail-risk invalidation threshold breached by active scenario stress condition.` 
      : `RISK APPROVED: ${thresholds.riskRewardRatio}:1 Risk-to-Reward ratio, stop anchored at ${formatPrice(thresholds.stopLoss)} (${isSell ? 'above entry' : 'below entry'}), targeting ${formatPrice(thresholds.takeProfit)} with -$${thresholds.maxLossUsd} USD downside cap.`);

  const effectiveMonteCarlo = consensus?.agents?.risk?.monteCarlo || synthesis?.riskGovernance?.monteCarlo;

  const directiveBadgeColor = isStrategicExit
    ? 'text-rose-400 bg-rose-950/80 border-rose-600 shadow-rose-950/50'
    : isModifyPosition
    ? 'text-amber-400 bg-amber-950/80 border-amber-600 shadow-amber-950/50'
    : 'text-emerald-400 bg-emerald-950/80 border-emerald-600 shadow-emerald-950/50';

  const biasColor = isBuy 
    ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' 
    : isSell 
    ? 'text-rose-400 bg-rose-500/10 border-rose-500/30' 
    : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  // Trajectory color: if strategic exit / reversal, trajectory stroke turns rose
  const trajectoryStroke = isStrategicExit 
    ? '#f43f5e' 
    : isModifyPosition 
    ? '#f59e0b' 
    : isBuy 
    ? '#10b981' 
    : isSell 
    ? '#f43f5e' 
    : '#f59e0b';

  // -------------------------------------------------------------
  // Embedded Visual Chart Snapshot & Projected Trajectory Math
  // -------------------------------------------------------------
  const chartMath = useMemo(() => {
    const svgWidth = 800;
    const svgHeight = 240;
    const padLeft = 60;
    const padRight = 135;
    const padTop = 30;
    const padBottom = 26;
    const chartW = svgWidth - padLeft - padRight;
    const chartH = svgHeight - padTop - padBottom;

    const displayCandles = candles.length > 0 ? candles.slice(-30) : [];
    
    const prices: number[] = displayCandles.flatMap(c => [c.low, c.high]);
    if (thresholds.entryPrice) prices.push(thresholds.entryPrice);
    if (thresholds.takeProfit) prices.push(thresholds.takeProfit);
    if (thresholds.stopLoss) prices.push(thresholds.stopLoss);

    const minRaw = prices.length > 0 ? Math.min(...prices) : 100;
    const maxRaw = prices.length > 0 ? Math.max(...prices) : 105;
    const rawRange = maxRaw - minRaw || 1;
    const minP = minRaw - rawRange * 0.05;
    const maxP = maxRaw + rawRange * 0.05;
    const priceSpan = maxP - minP;

    const getY = (price: number) => {
      return padTop + (1 - (price - minP) / priceSpan) * chartH;
    };

    const candleSpacing = displayCandles.length > 0 ? chartW / displayCandles.length : 14;
    const candleWidth = Math.max(3, Math.min(10, Math.floor(candleSpacing * 0.65)));

    const getX = (idx: number) => {
      return padLeft + idx * candleSpacing + candleSpacing / 2;
    };

    const lastIdx = displayCandles.length - 1;
    const lastCandleX = lastIdx >= 0 ? getX(lastIdx) : padLeft + chartW;
    const lastClosePrice = displayCandles.length > 0 ? displayCandles[lastIdx].close : thresholds.entryPrice;
    const lastCandleY = getY(lastClosePrice);

    // If strategic exit, trajectory plunges or aims at stop-loss invalidation
    const targetPrice = isStrategicExit ? thresholds.stopLoss : thresholds.takeProfit;
    const targetY = getY(targetPrice);
    const targetX = Math.min(svgWidth - 25, lastCandleX + 105);

    const cx1 = lastCandleX + (targetX - lastCandleX) * 0.35;
    const cy1 = lastCandleY + (targetY - lastCandleY) * 0.15;
    const cx2 = lastCandleX + (targetX - lastCandleX) * 0.75;
    const cy2 = targetY;

    const calcBezierPointAndAngle = (t: number) => {
      const bx = (1 - t)**3 * lastCandleX + 3*(1 - t)**2 * t * cx1 + 3*(1 - t) * t**2 * cx2 + t**3 * targetX;
      const by = (1 - t)**3 * lastCandleY + 3*(1 - t)**2 * t * cy1 + 3*(1 - t) * t**2 * cy2 + t**3 * targetY;
      const dx = 3*(1 - t)**2 * (cx1 - lastCandleX) + 6*(1 - t)*t * (cx2 - cx1) + 3*t**2 * (targetX - cx2);
      const dy = 3*(1 - t)**2 * (cy1 - lastCandleY) + 6*(1 - t)*t * (cy2 - cy1) + 3*t**2 * (targetY - cy2);
      const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
      return { x: bx, y: by, angle };
    };

    const chevron1 = calcBezierPointAndAngle(0.35);
    const chevron2 = calcBezierPointAndAngle(0.70);

    const gridLevels = [0.15, 0.4, 0.65, 0.9].map(pct => {
      const p = maxP - pct * priceSpan;
      return { price: p, y: getY(p) };
    });

    return {
      svgWidth,
      svgHeight,
      padLeft,
      padRight,
      displayCandles,
      getY,
      getX,
      candleWidth,
      lastCandleX,
      lastCandleY,
      lastClosePrice,
      targetX,
      targetY,
      targetPrice,
      cx1,
      cy1,
      cx2,
      cy2,
      chevron1,
      chevron2,
      gridLevels,
    };
  }, [candles, thresholds, isStrategicExit]);

  // Filter messages by round
  const filteredMessages = useMemo(() => {
    if (activeFilterRound === 'ALL') return messages;
    return messages.filter(m => m.round === activeFilterRound);
  }, [messages, activeFilterRound]);

  const citedRules = synthesis?.citedRules || [];

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
              <span>Chart Data: <strong className="text-indigo-300">{candles.length} Bars Ingested</strong></span>
              <span>•</span>
              <span>Knowledge Base: <strong className="text-amber-300">1,050 Technical + 1,000 Fundamental Rules (2,050 Total)</strong></span>
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

      {/* Grid: Left = Visual Chart Snapshot; Right = Definitive Bias & Updated Risk-Reward */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left (7 cols): Embedded Visual Chart Snapshot */}
        <div className="lg:col-span-7 bg-terminal-950 border border-terminal-border/80 rounded-xl p-3 flex flex-col relative overflow-hidden">
          <div className="flex items-center justify-between pb-2 mb-1 border-b border-terminal-border/40 text-xs font-mono">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white uppercase">{pair} • {timeframe} Visual Chart Snapshot</span>
              <span className="text-[10px] text-slate-400">({chartMath.displayCandles.length} Bars Ingested)</span>
            </div>
            <div className="flex items-center gap-2">
              {currentScenario && (
                <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  SCENARIO MODULATED
                </span>
              )}
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                PROJECTED TRAJECTORY
              </span>
            </div>
          </div>

          {/* SVG Canvas */}
          <div className="w-full overflow-x-auto scrollbar-thin">
            <svg 
              viewBox={`0 0 ${chartMath.svgWidth} ${chartMath.svgHeight}`} 
              className="w-full h-[210px] sm:h-[240px] select-none"
            >
              <defs>
                <filter id="trajGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <marker 
                  id="trajArrowHead" 
                  viewBox="0 0 10 10" 
                  refX="7" 
                  refY="5" 
                  markerWidth="6" 
                  markerHeight="6" 
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill={trajectoryStroke} />
                </marker>
              </defs>

              {/* Grid Lines */}
              {chartMath.gridLevels.map((lvl, i) => (
                <g key={`grid-${i}`}>
                  <line 
                    x1={chartMath.padLeft} 
                    y1={lvl.y} 
                    x2={chartMath.svgWidth - chartMath.padRight + 30} 
                    y2={lvl.y} 
                    stroke="rgba(255, 255, 255, 0.05)" 
                    strokeDasharray="2 3" 
                  />
                  <text 
                    x={chartMath.padLeft - 6} 
                    y={lvl.y + 3} 
                    textAnchor="end" 
                    fill="#64748b" 
                    fontSize="9" 
                    fontFamily="monospace"
                  >
                    {formatPrice(lvl.price)}
                  </text>
                </g>
              ))}

              {/* Horizontal Price Level: Take Profit */}
              {thresholds.takeProfit && (
                <g>
                  <line 
                    x1={chartMath.padLeft} 
                    y1={chartMath.getY(thresholds.takeProfit)} 
                    x2={chartMath.svgWidth - 15} 
                    y2={chartMath.getY(thresholds.takeProfit)} 
                    stroke="#10b981" 
                    strokeWidth="1.2" 
                    strokeDasharray="4 3" 
                    opacity={isStrategicExit ? "0.4" : "0.85"}
                  />
                  <rect 
                    x={chartMath.svgWidth - 110} 
                    y={chartMath.getY(thresholds.takeProfit) - 9} 
                    width="100" 
                    height="17" 
                    rx="3" 
                    fill="#064e3b" 
                    stroke="#10b981" 
                    strokeWidth="1" 
                    opacity={isStrategicExit ? "0.4" : "1"}
                  />
                  <text 
                    x={chartMath.svgWidth - 60} 
                    y={chartMath.getY(thresholds.takeProfit) + 3} 
                    textAnchor="middle" 
                    fill="#34d399" 
                    fontSize="9.5" 
                    fontWeight="bold" 
                    fontFamily="monospace"
                  >
                    TP: {formatPrice(thresholds.takeProfit)}
                  </text>
                </g>
              )}

              {/* Horizontal Price Level: Entry */}
              {thresholds.entryPrice && (
                <g>
                  <line 
                    x1={chartMath.padLeft} 
                    y1={chartMath.getY(thresholds.entryPrice)} 
                    x2={chartMath.svgWidth - 15} 
                    y2={chartMath.getY(thresholds.entryPrice)} 
                    stroke="#38bdf8" 
                    strokeWidth="1.2" 
                    strokeDasharray="3 3" 
                    opacity="0.75"
                  />
                  <rect 
                    x={chartMath.svgWidth - 110} 
                    y={chartMath.getY(thresholds.entryPrice) - 9} 
                    width="100" 
                    height="17" 
                    rx="3" 
                    fill="#0c4a6e" 
                    stroke="#38bdf8" 
                    strokeWidth="1"
                  />
                  <text 
                    x={chartMath.svgWidth - 60} 
                    y={chartMath.getY(thresholds.entryPrice) + 3} 
                    textAnchor="middle" 
                    fill="#7dd3fc" 
                    fontSize="9.5" 
                    fontWeight="bold" 
                    fontFamily="monospace"
                  >
                    ENTRY: {formatPrice(thresholds.entryPrice)}
                  </text>
                </g>
              )}

              {/* Horizontal Price Level: Hard Stop-Loss */}
              {thresholds.stopLoss && (
                <g>
                  <line 
                    x1={chartMath.padLeft} 
                    y1={chartMath.getY(thresholds.stopLoss)} 
                    x2={chartMath.svgWidth - 15} 
                    y2={chartMath.getY(thresholds.stopLoss)} 
                    stroke="#f43f5e" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 3" 
                    opacity="0.95"
                  />
                  <rect 
                    x={chartMath.svgWidth - 110} 
                    y={chartMath.getY(thresholds.stopLoss) - 9} 
                    width="100" 
                    height="17" 
                    rx="3" 
                    fill="#881337" 
                    stroke="#f43f5e" 
                    strokeWidth="1"
                  />
                  <text 
                    x={chartMath.svgWidth - 60} 
                    y={chartMath.getY(thresholds.stopLoss) + 3} 
                    textAnchor="middle" 
                    fill="#fda4af" 
                    fontSize="9.5" 
                    fontWeight="bold" 
                    fontFamily="monospace"
                  >
                    SL: {formatPrice(thresholds.stopLoss)}
                  </text>
                </g>
              )}

              {/* Candlesticks */}
              {chartMath.displayCandles.map((c, i) => {
                const x = chartMath.getX(i);
                const isBull = c.close >= c.open;
                const bodyTop = chartMath.getY(Math.max(c.open, c.close));
                const bodyBottom = chartMath.getY(Math.min(c.open, c.close));
                const bodyH = Math.max(2, bodyBottom - bodyTop);
                const wickTop = chartMath.getY(c.high);
                const wickBottom = chartMath.getY(c.low);
                const candleColor = isBull ? '#10b981' : '#f43f5e';

                return (
                  <g key={`candle-${i}`}>
                    <line 
                      x1={x} 
                      y1={wickTop} 
                      x2={x} 
                      y2={wickBottom} 
                      stroke={candleColor} 
                      strokeWidth="1" 
                      opacity="0.9"
                    />
                    <rect 
                      x={x - chartMath.candleWidth / 2} 
                      y={bodyTop} 
                      width={chartMath.candleWidth} 
                      height={bodyH} 
                      fill={candleColor} 
                      rx="1"
                    />
                  </g>
                );
              })}

              {/* Latest Live Tick Ingestion Point Indicator */}
              <circle 
                cx={chartMath.lastCandleX} 
                cy={chartMath.lastCandleY} 
                r="4.5" 
                fill="#38bdf8" 
                stroke="#fff" 
                strokeWidth="1.5"
              />
              <circle 
                cx={chartMath.lastCandleX} 
                cy={chartMath.lastCandleY} 
                r="8" 
                fill="none" 
                stroke="#38bdf8" 
                strokeWidth="1" 
                opacity="0.6"
              >
                <animate attributeName="r" values="6;13;6" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite" />
              </circle>

              {/* PROJECTED TRAJECTORY LINE */}
              <path 
                d={`M ${chartMath.lastCandleX} ${chartMath.lastCandleY} C ${chartMath.cx1} ${chartMath.cy1}, ${chartMath.cx2} ${chartMath.cy2}, ${chartMath.targetX} ${chartMath.targetY}`}
                fill="none" 
                stroke={trajectoryStroke} 
                strokeWidth="2.8" 
                strokeDasharray="6 3" 
                filter="url(#trajGlow)"
                markerEnd="url(#trajArrowHead)"
              />

              {/* Directional Chevron Arrow 1 along trajectory (at 35% distance) */}
              <g 
                transform={`translate(${chartMath.chevron1.x}, ${chartMath.chevron1.y}) rotate(${chartMath.chevron1.angle})`}
              >
                <path 
                  d="M -4 -3.5 L 3 0 L -4 3.5" 
                  fill="none" 
                  stroke={trajectoryStroke} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </g>

              {/* Directional Chevron Arrow 2 along trajectory (at 70% distance) */}
              <g 
                transform={`translate(${chartMath.chevron2.x}, ${chartMath.chevron2.y}) rotate(${chartMath.chevron2.angle})`}
              >
                <path 
                  d="M -4 -3.5 L 3 0 L -4 3.5" 
                  fill="none" 
                  stroke={trajectoryStroke} 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                />
              </g>

              {/* Waypoint Target Terminal Pin */}
              <circle 
                cx={chartMath.targetX} 
                cy={chartMath.targetY} 
                r="4.5" 
                fill={trajectoryStroke} 
                stroke="#fff" 
                strokeWidth="1.5"
              />
              <text 
                x={chartMath.targetX + 6} 
                y={chartMath.targetY - 5} 
                fill={trajectoryStroke} 
                fontSize="8.5" 
                fontWeight="bold" 
                fontFamily="monospace"
              >
                {isStrategicExit ? '⚠️ EXIT TARGET' : '🎯 CONSENSUS TARGET'}
              </text>
            </svg>
          </div>

          {/* Sub-chart Live Ingestion Status Banner */}
          <div className="mt-2 pt-2 border-t border-terminal-border/50 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Ingestion Active: <strong className="text-white">{formatPrice(chartMath.lastClosePrice)}</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <span>Timeframe: <span className="text-cyan-400">{timeframe}</span></span>
              <span>Horizon: <span className="text-indigo-300">+{thresholds.trajectoryHorizonBars} Bars</span></span>
              <span className={isStrategicExit ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                Trajectory Target: {formatPrice(chartMath.targetPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Right (5 cols): Actionable Directive & Updated Risk-Reward Synthesis Card */}
        <div className="lg:col-span-5 bg-terminal-950/90 border border-terminal-border rounded-xl p-4 flex flex-col justify-between space-y-3">
          {/* Directive Header */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                Actionable Consensus Directive
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                CRO Dialectical Synthesis
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

          {/* 4 Explicit Price Threshold Metrics */}
          <div className="grid grid-cols-2 gap-2 font-mono text-xs">
            {/* 1. Entry Level */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border">
              <span className="text-[10px] text-slate-400 block mb-0.5">1. ENTRY LEVEL</span>
              <div className="font-bold text-cyan-400 text-sm">{formatPrice(thresholds.entryPrice)}</div>
              <span className="text-[9px] text-slate-500 block truncate">Live terminal chart close</span>
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

            {/* 4. Risk / Reward & Sizing */}
            <div className="p-2.5 rounded-lg bg-terminal-900 border border-indigo-500/30">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-indigo-300 block mb-0.5">4. RISK / REWARD</span>
                {isModifyPosition && (
                  <span className="text-[9px] font-bold text-amber-400">REDUCED</span>
                )}
              </div>
              <div className="font-bold text-indigo-400 text-sm">{thresholds.riskRewardRatio}:1 R:R</div>
              <span className="text-[9px] text-indigo-300/80 block truncate">
                {thresholds.positionSizeLots} Standard Lots
              </span>
            </div>
          </div>

          {/* 5. RISK GOVERNANCE & EDGE (Dedicated Section Exclusive to 5-Agent Debate & Consensus Chamber) */}
          <div className="bg-terminal-900/90 border border-emerald-500/40 rounded-xl p-3 flex flex-col justify-between font-mono text-xs space-y-2 shadow-sm">
            <div>
              <div className="flex items-center justify-between mb-1.5 text-emerald-400 font-bold">
                <span className="flex items-center gap-1.5 text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  5. Risk Governance & Edge
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  effectiveRiskVerdict === 'APPROVED' 
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' 
                    : effectiveRiskVerdict === 'MODIFIED'
                    ? 'bg-amber-950/60 border border-amber-800 text-amber-300'
                    : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                }`}>
                  {effectiveRiskVerdict}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed font-sans">
                {effectiveRiskGovernance}
              </p>
            </div>
            {effectiveMonteCarlo && (
              <div className="pt-2 border-t border-emerald-900/60 flex flex-wrap items-center justify-between text-[10px] text-slate-300 font-medium">
                <span>Monte Carlo 1,000 Paths: Win Prob <strong className="text-emerald-400">{effectiveMonteCarlo.projectedProfitProbability}%</strong></span>
                <span>95% VaR: <strong className="text-cyan-300">${effectiveMonteCarlo.var95Usd}</strong></span>
                <span>Sharpe: <strong className="text-indigo-300">{effectiveMonteCarlo.sharpeRatio}</strong></span>
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

      {/* Cited Institutional Knowledge Base Rules Strip (525 Technical & 525 Fundamental Rules) */}
      <div className="bg-terminal-950 border border-terminal-border/80 rounded-xl p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <h4 className="font-bold text-xs text-white">
              Institutional Knowledge Base Cross-Examination (1,050 Technical & 1,000 Fundamental Rules)
            </h4>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {citedRules.length} Strategies Cited & Cross-Examined
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {citedRules.map((rule) => {
            const isRuleBuy = rule.side === 'BUY';
            const catBadge = rule.category === 'TECHNICAL'
              ? 'text-cyan-400 bg-cyan-950/60 border-cyan-800'
              : rule.category === 'FUNDAMENTAL'
              ? 'text-purple-400 bg-purple-950/60 border-purple-800'
              : rule.category === 'NEWS'
              ? 'text-sky-400 bg-sky-950/60 border-sky-800'
              : 'text-emerald-400 bg-emerald-950/60 border-emerald-800';

            return (
              <div 
                key={rule.ruleId}
                className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border hover:border-slate-600 transition-colors text-xs font-mono"
              >
                <div className="flex items-center justify-between gap-1.5 mb-1.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${catBadge}`}>
                    {rule.ruleId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                      isRuleBuy 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {rule.side}
                    </span>
                    <span className="text-[10px] text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                      {rule.winRate}% WR
                    </span>
                  </div>
                </div>

                <div className="font-bold text-white text-[11px] truncate mb-1">
                  {rule.ruleName}
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                  {rule.rationale}
                </p>
              </div>
            );
          })}
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

                      {/* 3. Risk / Reward Ratio */}
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
    </div>
  );
};
