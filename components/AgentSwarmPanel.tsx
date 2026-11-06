'use client';

import React from 'react';
import { 
  ForexAnalysis, 
  FundamentalAnalysis, 
  RiskAssessment, 
  SignalDirection, 
  TechnicalAnalysis 
} from '@/lib/types';
import { 
  BarChart3, 
  Globe2, 
  ShieldAlert, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Scale, 
  ArrowRight,
  ShieldCheck,
  LineChart,
  Layers,
  Sparkles
} from 'lucide-react';

interface AgentSwarmPanelProps {
  technical: TechnicalAnalysis;
  fundamental: FundamentalAnalysis;
  forex: ForexAnalysis;
  risk: RiskAssessment;
  onExecuteTrade?: () => void;
  onOpenMonteCarlo?: () => void;
}

export const AgentSwarmPanel: React.FC<AgentSwarmPanelProps> = ({
  technical,
  fundamental,
  forex,
  risk,
  onExecuteTrade,
  onOpenMonteCarlo,
}) => {
  const getBiasBadge = (bias: SignalDirection) => {
    if (bias.includes('BUY')) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {bias.replace('_', ' ')}
        </span>
      );
    }
    if (bias.includes('SELL')) {
      return (
        <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1">
          <TrendingDown className="w-3 h-3" />
          {bias.replace('_', ' ')}
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-slate-500/10 text-slate-400 border border-slate-500/30">
        NEUTRAL
      </span>
    );
  };

  const getVerdictBadge = (verdict: RiskAssessment['verdict']) => {
    switch (verdict) {
      case 'APPROVED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            VERDICT: APPROVED
          </span>
        );
      case 'MODIFIED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            VERDICT: APPROVED (MODIFIED)
          </span>
        );
      case 'VETOED':
        return (
          <span className="px-2.5 py-1 rounded text-xs font-bold font-mono bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5 shadow-sm shadow-rose-500/20">
            <XCircle className="w-4 h-4 text-rose-400" />
            VERDICT: VETOED
          </span>
        );
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 1. TECHNICAL ANALYST CARD */}
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-colors shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Technical Analyst</h3>
                <span className="text-[11px] font-mono text-cyan-400">{technical.agentName}</span>
              </div>
            </div>
            {getBiasBadge(technical.bias)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Smart Money Concepts & Structure */}
            {technical.smartMoneyConcepts && (
              <div className="bg-terminal-950/80 p-2.5 rounded-lg border border-cyan-500/20">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-cyan-400 text-[10px] uppercase font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Smart Money Concepts (SMC)
                  </span>
                  <span className="text-[10px] text-slate-300">
                    MTF Alignment: {technical.multiTimeframe?.alignment.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Structure: </span>
                    <span className="text-white font-medium">{technical.smartMoneyConcepts.structure}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Liquidity Sweep: </span>
                    <span className="text-cyan-300 font-medium">{technical.smartMoneyConcepts.liquiditySweep}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Order Block: </span>
                    <span className="text-slate-200">{technical.smartMoneyConcepts.orderBlock}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">FVG Status: </span>
                    <span className="text-slate-200">{technical.smartMoneyConcepts.fvgStatus}</span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Algorithmic Indicators</span>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Pattern: </span>
                  <span className="text-white font-medium">{technical.candlestickPattern}</span>
                </div>
                <div>
                  <span className="text-slate-400">RSI State: </span>
                  <span className="text-cyan-300 font-medium">{technical.indicatorSummary.rsiStatus}</span>
                </div>
                <div>
                  <span className="text-slate-400">Moving Avg: </span>
                  <span className="text-slate-200">{technical.indicatorSummary.maTrend}</span>
                </div>
                <div>
                  <span className="text-slate-400">Volatility: </span>
                  <span className="text-slate-200">{technical.indicatorSummary.volatilityState}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-terminal-950/50 p-2 rounded border border-terminal-border/30 text-[11px]">
              <div>
                <span className="text-slate-400">Support (S1): </span>
                <span className="text-emerald-400 font-semibold">{technical.keySupport}</span>
              </div>
              <div>
                <span className="text-slate-400">Resistance (R1): </span>
                <span className="text-rose-400 font-semibold">{technical.keyResistance}</span>
              </div>
              <div>
                <span className="text-slate-400">Confidence: </span>
                <span className="text-cyan-400 font-semibold">{technical.confidenceScore}%</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
              {technical.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Suggested Invalidation: {technical.suggestedStopLoss}</span>
          <span>Target: {technical.suggestedTakeProfit}</span>
        </div>
      </div>

      {/* 2. FUNDAMENTAL ANALYST CARD */}
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Fundamental Analyst</h3>
                <span className="text-[11px] font-mono text-purple-400">{fundamental.agentName}</span>
              </div>
            </div>
            {getBiasBadge(fundamental.bias)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-slate-400 text-[10px] uppercase">Macroeconomic Regime</span>
                <span className="text-purple-300 font-medium">{fundamental.macroRegime}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-[11px] mt-2">
                <div className="border-r border-terminal-border/40 pr-2">
                  <span className="text-slate-400 font-bold block">{fundamental.baseCurrencyOutlook.currency} Stance</span>
                  <div className="flex items-center justify-between text-slate-300 mt-1">
                    <span>Policy:</span>
                    <span className="text-amber-400 font-semibold">{fundamental.baseCurrencyOutlook.centralBankStance}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Benchmark:</span>
                    <span className="text-white font-semibold">{fundamental.baseCurrencyOutlook.interestRate}%</span>
                  </div>
                </div>

                <div className="pl-1">
                  <span className="text-slate-400 font-bold block">{fundamental.quoteCurrencyOutlook.currency} Stance</span>
                  <div className="flex items-center justify-between text-slate-300 mt-1">
                    <span>Policy:</span>
                    <span className="text-amber-400 font-semibold">{fundamental.quoteCurrencyOutlook.centralBankStance}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Benchmark:</span>
                    <span className="text-white font-semibold">{fundamental.quoteCurrencyOutlook.interestRate}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">2Y/10Y Curve Spread: {fundamental.yieldSpread2Y10Y}%</span>
                <span className="text-slate-400">Real Rate Spread: {fundamental.realInterestRateSpread > 0 ? '+' : ''}{fundamental.realInterestRateSpread}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-terminal-950/50 p-2 rounded border border-terminal-border/30 text-[11px]">
              <div>
                <span className="text-slate-400">Geopolitical Risk: </span>
                <span className="text-amber-400 font-semibold">{fundamental.geopoliticalRiskLevel}</span>
              </div>
              <div>
                <span className="text-slate-400">Confidence: </span>
                <span className="text-purple-400 font-semibold">{fundamental.confidenceScore}%</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
              {fundamental.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Upcoming Catalyst: {fundamental.highImpactEvents[0]?.name || 'FOMC Minutes'}</span>
          <span>Impact: HIGH</span>
        </div>
      </div>

      {/* 3. FOREX MARKET ANALYST CARD */}
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Forex Market Analyst</h3>
                <span className="text-[11px] font-mono text-amber-400">{forex.agentName}</span>
              </div>
            </div>
            {getBiasBadge(forex.bias)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Currency Strength Relativity</span>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{forex.relativeStrengthComparison.baseStrength}/10</span>
                  <span className="text-[10px] text-slate-400">Base</span>
                </div>
                <div className="w-32 bg-terminal-800 rounded-full h-2 overflow-hidden flex">
                  <div 
                    className="bg-amber-400 h-full" 
                    style={{ width: `${(forex.relativeStrengthComparison.baseStrength / (forex.relativeStrengthComparison.baseStrength + forex.relativeStrengthComparison.quoteStrength)) * 100}%` }}
                  />
                  <div 
                    className="bg-indigo-500 h-full" 
                    style={{ width: `${(forex.relativeStrengthComparison.quoteStrength / (forex.relativeStrengthComparison.baseStrength + forex.relativeStrengthComparison.quoteStrength)) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{forex.relativeStrengthComparison.quoteStrength}/10</span>
                  <span className="text-[10px] text-slate-400">Quote</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
                <div>
                  <span className="text-slate-400">DXY Stance: </span>
                  <span className="text-amber-300 font-semibold">{forex.dxyTrend}</span>
                </div>
                <div>
                  <span className="text-slate-400">Carry Yield: </span>
                  <span className="text-white font-semibold">{forex.carryTradeYieldSpread > 0 ? '+' : ''}{forex.carryTradeYieldSpread}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Active Window: </span>
                  <span className="text-slate-200">{forex.activeTradingSession.session}</span>
                </div>
                <div>
                  <span className="text-slate-400">Liquidity: </span>
                  <span className="text-emerald-400 font-semibold">{forex.activeTradingSession.liquidityRating}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
              {forex.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Advantage: {forex.relativeStrengthComparison.advantage}</span>
          <span>Confidence: {forex.confidenceScore}%</span>
        </div>
      </div>

      {/* 4. RISK MANAGER & CHIEF GATEKEEPER CARD */}
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Risk Manager</h3>
                <span className="text-[11px] font-mono text-emerald-400">{risk.agentName}</span>
              </div>
            </div>
            {getVerdictBadge(risk.verdict)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Risk Sizing & Bracket Order Parameters */}
            <div className="bg-terminal-950/80 p-2.5 rounded-lg border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                  Mandatory Execution Parameters
                </span>
                <span className="text-white font-bold">
                  {risk.action} {risk.parameters.positionSizeLots > 0 ? `${risk.parameters.positionSizeLots} LOTS` : ''}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400">Entry Level: </span>
                  <span className="text-white font-semibold">{risk.parameters.entryPrice}</span>
                </div>
                <div>
                  <span className="text-slate-400">Hard Stop Loss: </span>
                  <span className="text-rose-400 font-semibold">{risk.parameters.stopLoss}</span>
                </div>
                <div>
                  <span className="text-slate-400">Take Profit 1: </span>
                  <span className="text-emerald-400 font-semibold">{risk.parameters.takeProfit1}</span>
                </div>
                <div>
                  <span className="text-slate-400">Risk/Reward: </span>
                  <span className="text-cyan-400 font-semibold">1 : {risk.parameters.riskRewardRatio}</span>
                </div>
                <div>
                  <span className="text-slate-400">Max Risk: </span>
                  <span className="text-rose-400 font-semibold">${risk.parameters.maxLossUsd} ({risk.parameters.accountRiskPercent}%)</span>
                </div>
                <div>
                  <span className="text-slate-400">Target Gain: </span>
                  <span className="text-emerald-400 font-semibold">+${risk.parameters.projectedGainUsd}</span>
                </div>
              </div>

              {/* Monte Carlo mini-bar */}
              {risk.monteCarlo && (
                <div className="mt-2 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Monte Carlo VaR (95%): ${risk.monteCarlo.var95Usd}</span>
                  {onOpenMonteCarlo && (
                    <button
                      onClick={onOpenMonteCarlo}
                      className="text-cyan-400 hover:text-cyan-300 underline flex items-center gap-0.5"
                    >
                      <LineChart className="w-3 h-3" />
                      <span>View 1,000-Path VaR</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Veto or Adjustment Reasons */}
            {risk.vetoReasons && risk.vetoReasons.length > 0 && (
              <div className="p-2 rounded bg-rose-950/40 border border-rose-800/50 text-[11px] text-rose-300">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  VETO ACTIVE:
                </span>
                {risk.vetoReasons.map((v, i) => (
                  <p key={i}>• {v}</p>
                ))}
              </div>
            )}

            {risk.adjustmentsMade && risk.adjustmentsMade.length > 0 && (
              <div className="p-2 rounded bg-amber-950/40 border border-amber-800/50 text-[11px] text-amber-300">
                <span className="font-bold flex items-center gap-1 mb-0.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  SAFETY ADJUSTMENT:
                </span>
                {risk.adjustmentsMade.map((a, i) => (
                  <p key={i}>• {a}</p>
                ))}
              </div>
            )}

            <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
              {risk.reasoning}
            </p>
          </div>
        </div>

        {/* Execute button */}
        {risk.verdict !== 'VETOED' && risk.action !== 'NO_TRADE' && onExecuteTrade && (
          <div className="mt-3 pt-2.5 border-t border-terminal-border/40">
            <button
              onClick={onExecuteTrade}
              className={`w-full py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                risk.action === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              <span>EXECUTE APPROVED {risk.action} ORDER ({risk.parameters.positionSizeLots} LOTS)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
