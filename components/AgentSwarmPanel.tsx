'use client';

import React from 'react';
import { 
  ForexAnalysis, 
  FundamentalAnalysis, 
  NewsAnalysis, 
  RiskAssessment, 
  SignalDirection, 
  TechnicalAnalysis,
  UnifiedSwarmDecision
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
  Sparkles,
  Newspaper,
  Radio,
  Flame,
  Zap,
  Layers,
  Award
} from 'lucide-react';

interface AgentSwarmPanelProps {
  technical: TechnicalAnalysis;
  fundamental: FundamentalAnalysis;
  forex: ForexAnalysis;
  news?: NewsAnalysis;
  risk: RiskAssessment;
  unifiedDecision?: UnifiedSwarmDecision;
  onExecuteTrade?: () => void;
  onOpenMonteCarlo?: () => void;
  onOpenNewsRadar?: () => void;
}

export const AgentSwarmPanel: React.FC<AgentSwarmPanelProps> = ({
  technical,
  fundamental,
  forex,
  news,
  risk,
  unifiedDecision,
  onExecuteTrade,
  onOpenMonteCarlo,
  onOpenNewsRadar,
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
            VERDICT: MODIFIED
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

  const direction = unifiedDecision?.direction || (risk.action === 'NO_TRADE' ? 'HOLD' : risk.action);
  const isBuy = direction === 'BUY';
  const isSell = direction === 'SELL';

  return (
    <div className="space-y-4">
      {/* 🌟 1. UNIFIED 5-ROLE SWARM CONSENSUS & CORE FUNDAMENTAL REASONS BANNER */}
      {unifiedDecision && (
        <div className={`rounded-xl border p-4 sm:p-5 shadow-xl transition-all relative overflow-hidden font-mono ${
          isBuy
            ? 'bg-gradient-to-br from-emerald-950/80 via-terminal-900 to-terminal-950 border-emerald-500/50 shadow-emerald-500/10'
            : isSell
            ? 'bg-gradient-to-br from-rose-950/80 via-terminal-900 to-terminal-950 border-rose-500/50 shadow-rose-500/10'
            : 'bg-gradient-to-br from-amber-950/70 via-terminal-900 to-terminal-950 border-amber-500/50 shadow-amber-500/10'
        }`}>
          {/* Subtle background glow */}
          <div className={`absolute -top-16 -right-16 w-56 h-56 rounded-full blur-3xl pointer-events-none ${
            isBuy ? 'bg-emerald-500/15' : isSell ? 'bg-rose-500/15' : 'bg-amber-500/15'
          }`} />

          {/* Banner Header: Direction & Confidence */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-terminal-border/60 pb-3 mb-4">
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl text-xl sm:text-2xl font-black tracking-widest flex items-center gap-2 border shadow-lg ${
                isBuy
                  ? 'bg-emerald-500 text-terminal-950 border-emerald-400 shadow-emerald-500/30'
                  : isSell
                  ? 'bg-rose-500 text-white border-rose-400 shadow-rose-500/30'
                  : 'bg-amber-500 text-terminal-950 border-amber-400 shadow-amber-500/30'
              }`}>
                {isBuy ? <TrendingUp className="w-6 h-6 stroke-[3]" /> : isSell ? <TrendingDown className="w-6 h-6 stroke-[3]" /> : <Scale className="w-6 h-6 stroke-[3]" />}
                <span>UNIFIED {direction}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-sm sm:text-base">
                    5-ROLE COMPILED SWARM CONSENSUS
                  </h3>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                    unifiedDecision.confluenceGrade === 'A+' || unifiedDecision.confluenceGrade === 'A'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : unifiedDecision.confluenceGrade === 'B'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}>
                    GRADE {unifiedDecision.confluenceGrade}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span className="text-cyan-400 font-bold">{unifiedDecision.confidence}% Overall Conviction</span>
                  <span>•</span>
                  <span>{unifiedDecision.rolesAlignmentText}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              {onOpenNewsRadar && (
                <button
                  onClick={onOpenNewsRadar}
                  className="px-3 py-1.5 rounded-lg bg-blue-950/80 hover:bg-blue-900 border border-blue-700/60 text-blue-300 flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Newspaper className="w-3.5 h-3.5 text-blue-400" />
                  <span>20 News Sources</span>
                </button>
              )}
              {risk.verdict !== 'VETOED' && risk.action !== 'NO_TRADE' && onExecuteTrade && (
                <button
                  onClick={onExecuteTrade}
                  className={`px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 shadow-lg transition-all ${
                    isBuy 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30' 
                      : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                  }`}
                >
                  <span>EXECUTE {direction}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Synthesis Narrative */}
          <p className="text-slate-200 text-xs sm:text-sm font-sans leading-relaxed mb-4">
            {unifiedDecision.synthesisSummary}
          </p>

          {/* 🏛️ CORE FUNDAMENTAL & NEWS REASONS DRIVING THE DECISION */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-2 uppercase tracking-wider text-cyan-400 text-[11px]">
                <Award className="w-4 h-4 text-cyan-400" />
                Core Fundamental & Catalytic Drivers Behind Decision
              </span>
              <span className="text-[10px] text-slate-400 font-normal">
                Synthesized by News Analyst & Fundamental Desk
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {unifiedDecision.coreFundamentalReasons.slice(0, 4).map(reason => {
                const isBull = reason.sentiment === 'BULLISH';
                const isBear = reason.sentiment === 'BEARISH';

                return (
                  <div
                    key={reason.id}
                    className="p-3 rounded-lg bg-terminal-950/80 border border-terminal-border/80 hover:border-slate-600 transition-all flex flex-col justify-between gap-1.5 text-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-terminal-900 border border-terminal-border text-slate-300">
                          {reason.pillar.replace('_', ' ')}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${
                          isBull
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isBear
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          {reason.sentiment} ({reason.impactWeight}%)
                        </span>
                      </div>
                      <h5 className="font-bold text-white text-xs mb-1">
                        {reason.title}
                      </h5>
                      <p className="text-slate-300 text-[11px] font-sans leading-relaxed">
                        {reason.description}
                      </p>
                    </div>

                    <div className="pt-1.5 border-t border-terminal-border/40 text-[10px] text-slate-400 flex items-center justify-between">
                      <span className="truncate">Evidence: {reason.evidenceSource}</span>
                      <span className="text-cyan-400 shrink-0">Weight: +{reason.impactWeight}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 👥 2. THE 5 SPECIALIZED AGENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* CARD 1: TECHNICAL ANALYST */}
        <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-cyan-500/40 transition-colors shadow-md">
          <div>
            <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Role 1: Technical Analyst</h3>
                  <span className="text-[11px] font-mono text-cyan-400">{technical.agentName}</span>
                </div>
              </div>
              {getBiasBadge(technical.bias)}
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              {technical.smartMoneyConcepts && (
                <div className="bg-terminal-950/80 p-2.5 rounded-lg border border-cyan-500/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-cyan-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      Smart Money Concepts (SMC)
                    </span>
                    <span className="text-[10px] text-slate-300">
                      {technical.multiTimeframe?.alignment.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400">Structure: </span>
                      <span className="text-white font-medium">{technical.smartMoneyConcepts.structure}</span>
                    </div>
                    <div>
                      <span className="text-slate-400">Liquidity: </span>
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
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Pattern: </span>
                    <span className="text-white font-medium">{technical.candlestickPattern}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">RSI (14): </span>
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
                  <span className="text-slate-400">Support: </span>
                  <span className="text-emerald-400 font-semibold">{technical.keySupport}</span>
                </div>
                <div>
                  <span className="text-slate-400">Resistance: </span>
                  <span className="text-rose-400 font-semibold">{technical.keyResistance}</span>
                </div>
                <div>
                  <span className="text-cyan-400 font-semibold">{technical.confidenceScore}%</span>
                </div>
              </div>

              <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
                {technical.thesis}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Invalidation: {technical.suggestedStopLoss}</span>
            <span>Target: {technical.suggestedTakeProfit}</span>
          </div>
        </div>

        {/* CARD 2: FUNDAMENTAL ANALYST */}
        <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-md">
          <div>
            <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Role 2: Fundamental Analyst</h3>
                  <span className="text-[11px] font-mono text-purple-400">{fundamental.agentName}</span>
                </div>
              </div>
              {getBiasBadge(fundamental.bias)}
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-400 text-[10px] uppercase">Macro Regime</span>
                  <span className="text-purple-300 font-medium">{fundamental.macroRegime}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px] mt-2">
                  <div className="border-r border-terminal-border/40 pr-2">
                    <span className="text-slate-400 font-bold block">{fundamental.baseCurrencyOutlook.currency}</span>
                    <div className="flex items-center justify-between text-slate-300 mt-0.5">
                      <span>Rate:</span>
                      <span className="text-white font-semibold">{fundamental.baseCurrencyOutlook.interestRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Stance:</span>
                      <span className="text-amber-400 font-semibold">{fundamental.baseCurrencyOutlook.centralBankStance}</span>
                    </div>
                  </div>

                  <div className="pl-1">
                    <span className="text-slate-400 font-bold block">{fundamental.quoteCurrencyOutlook.currency}</span>
                    <div className="flex items-center justify-between text-slate-300 mt-0.5">
                      <span>Rate:</span>
                      <span className="text-white font-semibold">{fundamental.quoteCurrencyOutlook.interestRate}%</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Stance:</span>
                      <span className="text-amber-400 font-semibold">{fundamental.quoteCurrencyOutlook.centralBankStance}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-2 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">2Y/10Y Spread: {fundamental.yieldSpread2Y10Y}%</span>
                  <span className="text-slate-400">Real Rate Spread: {fundamental.realInterestRateSpread > 0 ? '+' : ''}{fundamental.realInterestRateSpread}%</span>
                </div>
              </div>

              {fundamental.indianMarketDrivers && (
                <div className="bg-terminal-950/50 p-2 rounded border border-terminal-border/30 text-[11px] flex items-center justify-between">
                  <span>FII: +₹{fundamental.indianMarketDrivers.fiiNetFlowCr}Cr</span>
                  <span>DII: +₹{fundamental.indianMarketDrivers.diiNetFlowCr}Cr</span>
                  <span>VIX: {fundamental.indianMarketDrivers.indiaVix}</span>
                </div>
              )}

              <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
                {fundamental.thesis}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Catalyst: {fundamental.highImpactEvents[0]?.name || 'Central Bank Print'}</span>
            <span>Confidence: {fundamental.confidenceScore}%</span>
          </div>
        </div>

        {/* CARD 3: FOREX MARKET ANALYST */}
        <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-md">
          <div>
            <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                  <Scale className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Role 3: Forex Analyst</h3>
                  <span className="text-[11px] font-mono text-amber-400">{forex.agentName}</span>
                </div>
              </div>
              {getBiasBadge(forex.bias)}
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40">
                <span className="text-slate-400 text-[10px] uppercase block mb-1">Currency Strength Relativity</span>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white font-bold">{forex.relativeStrengthComparison.baseStrength}/10 Base</span>
                  <div className="w-24 sm:w-28 bg-terminal-800 rounded-full h-1.5 overflow-hidden flex">
                    <div 
                      className="bg-amber-400 h-full" 
                      style={{ width: `${(forex.relativeStrengthComparison.baseStrength / (forex.relativeStrengthComparison.baseStrength + forex.relativeStrengthComparison.quoteStrength)) * 100}%` }}
                    />
                    <div 
                      className="bg-indigo-500 h-full" 
                      style={{ width: `${(forex.relativeStrengthComparison.quoteStrength / (forex.relativeStrengthComparison.baseStrength + forex.relativeStrengthComparison.quoteStrength)) * 100}%` }}
                    />
                  </div>
                  <span className="text-white font-bold">{forex.relativeStrengthComparison.quoteStrength}/10 Quote</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] mt-2">
                  <div>
                    <span className="text-slate-400">DXY: </span>
                    <span className="text-amber-300 font-semibold">{forex.dxyTrend}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Carry Yield: </span>
                    <span className="text-white font-semibold">{forex.carryTradeYieldSpread > 0 ? '+' : ''}{forex.carryTradeYieldSpread}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Session: </span>
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

        {/* CARD 4: 📰 DEDICATED NEWS & SENTIMENT ANALYST (NEW 5TH AGENT) */}
        {news && (
          <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-blue-500/40 transition-colors shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />

            <div>
              <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-md bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-400 shadow-sm shadow-blue-500/10">
                    <Newspaper className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-white text-sm">Role 4: News Analyst</h3>
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" title="Live Scraper Running"></span>
                    </div>
                    <span className="text-[11px] font-mono text-blue-400">{news.agentName}</span>
                  </div>
                </div>
                {getBiasBadge(news.bias)}
              </div>

              <div className="space-y-2.5 text-xs font-mono">
                {/* 20 Financial Outlets Scrape Telemetry */}
                <div className="bg-terminal-950/80 p-2.5 rounded-lg border border-blue-500/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-blue-400 text-[10px] uppercase font-bold flex items-center gap-1">
                      <Radio className="w-3 h-3 text-blue-400 animate-pulse" />
                      20 Financial Outlets Scraped
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      {news.activeSourcesCount}/20 Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between bg-terminal-900 p-2 rounded text-[11px] mb-2">
                    <span className="text-slate-400">Headline Sentiment:</span>
                    <span className={`font-bold text-sm ${
                      news.overallSentimentScore > 0 ? 'text-emerald-400' : news.overallSentimentScore < 0 ? 'text-rose-400' : 'text-amber-400'
                    }`}>
                      {news.overallSentimentScore > 0 ? '+' : ''}{news.overallSentimentScore} / 100
                    </span>
                  </div>

                  {/* Breaking news alert if present */}
                  {news.breakingNewsAlert && (
                    <div className="p-2 rounded bg-blue-950/60 border border-blue-800/60 text-[11px] text-blue-200 mb-2">
                      <span className="font-bold flex items-center gap-1 text-rose-400 mb-0.5 text-[10px]">
                        <Flame className="w-3 h-3" />
                        BREAKING ({news.breakingNewsAlert.sourceName}):
                      </span>
                      <p className="truncate text-white font-medium">{news.breakingNewsAlert.title}</p>
                    </div>
                  )}

                  {/* Scraped headline snippets */}
                  <div className="space-y-1">
                    <span className="text-[10px] text-slate-400 block">Top Real-Time Catalysts:</span>
                    {news.topCatalysts.slice(0, 2).map((cat, i) => (
                      <div key={i} className="text-[11px] truncate flex items-center gap-1.5 text-slate-300">
                        <span className="text-blue-400 text-[10px] font-bold">[{cat.sourceName.split(' ')[0]}]</span>
                        <span className="truncate">{cat.title}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
                  {news.thesis}
                </p>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
              {onOpenNewsRadar && (
                <button
                  onClick={onOpenNewsRadar}
                  className="text-blue-400 hover:text-blue-300 underline flex items-center gap-1"
                >
                  <Newspaper className="w-3 h-3" />
                  <span>Inspect 20 News Feeds</span>
                </button>
              )}
              <span>Confidence: {news.confidenceScore}%</span>
            </div>
          </div>
        )}

        {/* CARD 5: RISK MANAGER & GATEKEEPER */}
        <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/40 transition-colors shadow-md relative overflow-hidden md:col-span-2 lg:col-span-2">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Role 5: Risk Manager & Gatekeeper</h3>
                  <span className="text-[11px] font-mono text-emerald-400">{risk.agentName}</span>
                </div>
              </div>
              {getVerdictBadge(risk.verdict)}
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-terminal-950/80 p-2.5 rounded-lg border border-emerald-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-emerald-400 text-[10px] uppercase font-bold tracking-wider">
                    Mandatory Execution Parameters (5-Role Consensus)
                  </span>
                  <span className="text-white font-bold">
                    {risk.action} {risk.parameters.positionSizeLots > 0 ? `${risk.parameters.positionSizeLots} LOTS` : ''}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Entry: </span>
                    <span className="text-white font-semibold">{risk.parameters.entryPrice}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Stop Loss: </span>
                    <span className="text-rose-400 font-semibold">{risk.parameters.stopLoss}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Take Profit: </span>
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
                    <span className="text-slate-400">Projected Gain: </span>
                    <span className="text-emerald-400 font-semibold">+${risk.parameters.projectedGainUsd}</span>
                  </div>
                </div>

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

          {risk.verdict !== 'VETOED' && risk.action !== 'NO_TRADE' && onExecuteTrade && (
            <div className="mt-3 pt-2.5 border-t border-terminal-border/40">
              <button
                onClick={onExecuteTrade}
                className={`w-full py-2.5 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                  risk.action === 'BUY'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                    : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                }`}
              >
                <span>EXECUTE 5-AGENT APPROVED {risk.action} ORDER ({risk.parameters.positionSizeLots} LOTS)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
