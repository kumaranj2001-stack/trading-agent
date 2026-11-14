'use client';

import React from 'react';
import { 
  ForexAnalysis, 
  FundamentalAnalysis, 
  NewsAnalysis, 
  RiskAssessment, 
  SignalDirection, 
  TechnicalAnalysis,
  SwarmConsensusResult
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
  ExternalLink,
  Zap,
  Activity,
  Layers,
  Target,
  Lock,
  ChevronRight
} from 'lucide-react';

interface AgentSwarmPanelProps {
  technical: TechnicalAnalysis;
  fundamental: FundamentalAnalysis;
  forex: ForexAnalysis;
  news: NewsAnalysis;
  risk: RiskAssessment;
  onExecuteTrade?: () => void;
  onOpenMonteCarlo?: () => void;
  onOpenNewsWire?: () => void;
  telemetry?: SwarmConsensusResult['autonomousLoopTelemetry'];
  theme?: 'dark' | 'light';
}

export const AgentSwarmPanel: React.FC<AgentSwarmPanelProps> = ({
  technical,
  fundamental,
  forex,
  news,
  risk,
  onExecuteTrade,
  onOpenMonteCarlo,
  onOpenNewsWire,
  telemetry,
  theme = 'dark',
}) => {
  const getBiasBadge = (bias: SignalDirection) => {
    if (bias.includes('BUY')) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-black font-mono bg-emerald-500/15 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{bias.replace('_', ' ')}</span>
        </span>
      );
    }
    if (bias.includes('SELL')) {
      return (
        <span className="px-2.5 py-1 rounded-lg text-xs font-black font-mono bg-rose-500/15 text-rose-400 dark:text-rose-400 light:text-rose-700 border border-rose-500/30 flex items-center gap-1.5 shadow-sm">
          <TrendingDown className="w-3.5 h-3.5" />
          <span>{bias.replace('_', ' ')}</span>
        </span>
      );
    }
    return (
      <span className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono bg-amber-500/15 text-amber-400 dark:text-amber-400 light:text-amber-700 border border-amber-500/30">
        NEUTRAL
      </span>
    );
  };

  const getVerdictBadge = (verdict: RiskAssessment['verdict']) => {
    switch (verdict) {
      case 'APPROVED':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-black font-mono bg-emerald-500/20 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/40 flex items-center gap-1.5 shadow-sm shadow-emerald-500/20">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>VERDICT: APPROVED</span>
          </span>
        );
      case 'MODIFIED':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-black font-mono bg-amber-500/20 text-amber-400 dark:text-amber-400 light:text-amber-700 border border-amber-500/40 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>VERDICT: MODIFIED</span>
          </span>
        );
      case 'DYNAMIC_TIER_APPROVED':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-black font-mono bg-cyan-500/20 text-cyan-400 dark:text-cyan-400 light:text-cyan-700 border border-cyan-500/40 flex items-center gap-1.5 shadow-sm shadow-cyan-500/20">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span>VERDICT: DYNAMIC TIER APPROVED</span>
          </span>
        );
      case 'VETOED':
        return (
          <span className="px-3 py-1 rounded-lg text-xs font-black font-mono bg-rose-500/20 text-rose-400 dark:text-rose-400 light:text-rose-700 border border-rose-500/40 flex items-center gap-1.5 shadow-sm shadow-rose-500/20">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>VERDICT: VETOED</span>
          </span>
        );
    }
  };

  const cardBaseClass = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-800 shadow-sm hover:border-cyan-500/60'
    : 'bg-terminal-950/90 border-terminal-border/80 text-slate-100 shadow-lg hover:border-cyan-500/40';

  const subBoxClass = theme === 'light'
    ? 'bg-slate-50 border-slate-200/80 text-slate-700'
    : 'bg-terminal-900/60 border-terminal-border/60 text-slate-200';

  return (
    <div className="space-y-4">
      {/* 24/7 Autonomous Multi-Agent Swarm Status Strip */}
      <div className={`p-3.5 sm:p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-sm border ${
        theme === 'light' 
          ? 'bg-gradient-to-r from-slate-50 via-white to-slate-50 border-slate-200 text-slate-800 shadow-slate-200/40' 
          : 'bg-gradient-to-r from-terminal-950 via-terminal-900 to-terminal-950 border-terminal-border/80 text-white'
      }`}>
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className={`font-black tracking-wide ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            24/7 AUTONOMOUS SWARM // 5 SPECIALIZED DESKS
          </span>
        </div>
        <div className={`flex flex-wrap items-center gap-3 text-[11px] ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            Loop Active {telemetry?.cycleNumber ? `(Cycle #${telemetry.cycleNumber})` : ''}
          </span>
          <span>• 15s Recalibration Interval</span>
          <span>• 1,050+ Strategies Ingested</span>
          <span>• 95 Dynamic Feeds Monitored</span>
          <span className="text-cyan-500 font-bold">
            {telemetry?.latencyMs ? `${telemetry.latencyMs}ms Latency` : '<15ms Zero Latency'}
          </span>
        </div>
      </div>

      {/* Grid of 5 Autonomous Desks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. TECHNICAL ANALYST CARD */}
        <div className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-200 ${cardBaseClass}`}>
          <div className="space-y-3.5">
            {/* Desk Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-sm sm:text-base leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Technical Analyst
                  </h3>
                  <span className="text-xs font-semibold text-cyan-500 font-mono">
                    {technical.agentName}
                  </span>
                </div>
              </div>
              {getBiasBadge(technical.bias)}
            </div>

            {/* Standardized KPI Grid (4 Metrics with High-Contrast Typography) */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  SMC Structure
                </span>
                <span className={`text-sm font-black block mt-0.5 truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {technical.smartMoneyConcepts?.structure || 'RANGE_BOUND'}
                </span>
                <span className="text-[9px] text-cyan-400 block truncate">
                  Sweep: {technical.smartMoneyConcepts?.liquiditySweep || 'None'}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  RSI & Trend
                </span>
                <span className="text-sm font-black text-cyan-400 block mt-0.5 truncate">
                  {technical.indicatorSummary.rsiStatus}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  {technical.indicatorSummary.maTrend}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Support (S1)
                </span>
                <span className="text-sm font-black text-emerald-400 block mt-0.5">
                  ${technical.keySupport}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Institutional Floor
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Resistance (R1)
                </span>
                <span className="text-sm font-black text-rose-400 block mt-0.5">
                  ${technical.keyResistance}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Liquidity Target
                </span>
              </div>
            </div>

            {/* Smart Money Concepts Container */}
            {technical.smartMoneyConcepts && (
              <div className={`p-2.5 rounded-xl border text-xs font-mono space-y-1.5 ${subBoxClass}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>SMART MONEY ALIGNMENT</span>
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30">
                    {technical.multiTimeframe?.alignment.replace(/_/g, ' ') || 'ALIGNED'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>OB: <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{technical.smartMoneyConcepts.orderBlock}</strong></span>
                  <span>•</span>
                  <span>FVG: <strong className={theme === 'light' ? 'text-slate-800' : 'text-slate-200'}>{technical.smartMoneyConcepts.fvgStatus}</strong></span>
                </div>
              </div>
            )}

            {/* De-Cluttered Thesis */}
            <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${subBoxClass}`}>
              <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block mb-1">
                EXECUTIVE THESIS:
              </span>
              <p className={`font-sans text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                {technical.thesis}
              </p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className={`mt-3.5 pt-2.5 border-t text-xs font-mono flex items-center justify-between ${
            theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-terminal-border/70 text-slate-400'
          }`}>
            <span>Stop: ${technical.suggestedStopLoss}</span>
            <span className="font-bold text-cyan-400">{technical.confidenceScore}% Confluence</span>
          </div>
        </div>

        {/* 2. FUNDAMENTAL ANALYST CARD */}
        <div className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-200 ${cardBaseClass}`}>
          <div className="space-y-3.5">
            {/* Desk Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                  <Globe2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-sm sm:text-base leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Fundamental Analyst
                  </h3>
                  <span className="text-xs font-semibold text-purple-500 font-mono">
                    {fundamental.agentName}
                  </span>
                </div>
              </div>
              {getBiasBadge(fundamental.bias)}
            </div>

            {/* Standardized KPI Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Macro Regime
                </span>
                <span className="text-sm font-black text-purple-400 block mt-0.5 truncate">
                  {fundamental.macroRegime}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Geopolitical: {fundamental.geopoliticalRiskLevel}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Yield Spread 2Y/10Y
                </span>
                <span className={`text-sm font-black block mt-0.5 ${fundamental.yieldSpread2Y10Y >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {fundamental.yieldSpread2Y10Y > 0 ? '+' : ''}{fundamental.yieldSpread2Y10Y}%
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Real Spread: {fundamental.realInterestRateSpread > 0 ? '+' : ''}{fundamental.realInterestRateSpread}%
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  {fundamental.baseCurrencyOutlook.currency} Policy
                </span>
                <span className="text-sm font-black text-amber-400 block mt-0.5 truncate">
                  {fundamental.baseCurrencyOutlook.centralBankStance}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Base Rate: {fundamental.baseCurrencyOutlook.interestRate}%
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  {fundamental.quoteCurrencyOutlook.currency} Policy
                </span>
                <span className="text-sm font-black text-amber-400 block mt-0.5 truncate">
                  {fundamental.quoteCurrencyOutlook.centralBankStance}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Quote Rate: {fundamental.quoteCurrencyOutlook.interestRate}%
                </span>
              </div>
            </div>

            {/* High Impact Release Container */}
            <div className={`p-2.5 rounded-xl border text-xs font-mono flex items-center justify-between ${subBoxClass}`}>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Next Catalyst</span>
                <span className={`font-bold block truncate max-w-[170px] ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {fundamental.highImpactEvents[0]?.name || 'FOMC Dispatches'}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {fundamental.matchedRulesCount} RULES MATCHED
              </span>
            </div>

            {/* De-Cluttered Thesis */}
            <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${subBoxClass}`}>
              <span className="text-[10px] font-mono uppercase font-bold text-purple-400 block mb-1">
                POLICY SYNTHESIS:
              </span>
              <p className={`font-sans text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                {fundamental.thesis}
              </p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className={`mt-3.5 pt-2.5 border-t text-xs font-mono flex items-center justify-between ${
            theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-terminal-border/70 text-slate-400'
          }`}>
            <span>Central Bank Divergence</span>
            <span className="font-bold text-purple-400">{fundamental.confidenceScore}% Confluence</span>
          </div>
        </div>

        {/* 3. REAL-TIME NEWS ANALYST CARD */}
        <div className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-200 ${cardBaseClass}`}>
          <div className="space-y-3.5">
            {/* Desk Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Newspaper className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-sm sm:text-base leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Real-Time News Wire
                  </h3>
                  <span className="text-xs font-semibold text-sky-500 font-mono">
                    {news.agentName}
                  </span>
                </div>
              </div>
              {getBiasBadge(news.bias)}
            </div>

            {/* Standardized KPI Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Sentiment Score
                </span>
                <span className={`text-sm font-black block mt-0.5 ${news.sentimentScore >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {news.sentimentScore > 0 ? '+' : ''}{news.sentimentScore.toFixed(2)} / 1.0
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Mood: {news.marketMood.replace(/_/g, ' ')}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Source Ingestion
                </span>
                <span className="text-sm font-black text-sky-400 block mt-0.5">
                  95 Dynamic Feeds
                </span>
                <span className="text-[9px] text-slate-400 block">
                  4 Tiers • Uncapped
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border col-span-2 ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Flash Wire Alert
                </span>
                <span className="text-xs font-bold text-amber-400 block mt-0.5 truncate">
                  {news.breakingAlert || 'No active breaking wire embargo • Live stream synchronized'}
                </span>
              </div>
            </div>

            {/* Latest Scraped Print */}
            <div className={`p-2.5 rounded-xl border text-xs font-mono space-y-1.5 ${subBoxClass}`}>
              <span className="text-[10px] uppercase font-bold text-sky-400 block">
                LATEST MONITORED WIRE PRINT:
              </span>
              {news.recentHeadlines.slice(0, 1).map((item) => (
                <div key={item.id} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-400">
                    <span className="font-bold text-sky-400">{item.source}</span>
                    <span>{item.publishedTime}</span>
                  </div>
                  <p className={`line-clamp-2 text-xs font-sans ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                    {item.title}
                  </p>
                </div>
              ))}
            </div>

            {/* De-Cluttered Thesis */}
            <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${subBoxClass}`}>
              <span className="text-[10px] font-mono uppercase font-bold text-sky-400 block mb-1">
                SENTIMENT SYNTHESIS:
              </span>
              <p className={`font-sans text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                {news.thesis}
              </p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className={`mt-3.5 pt-2.5 border-t text-xs font-mono flex items-center justify-between ${
            theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-terminal-border/70 text-slate-400'
          }`}>
            {onOpenNewsWire ? (
              <button onClick={onOpenNewsWire} className="text-sky-500 hover:underline flex items-center gap-1 font-semibold">
                <span>View Full Stream</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            ) : <span>95 Feeds Verified</span>}
            <span className="font-bold text-sky-400">{news.confidenceScore}% Confluence</span>
          </div>
        </div>

        {/* 4. FOREX & INTERMARKET DYNAMICS ANALYST */}
        <div className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-200 ${cardBaseClass}`}>
          <div className="space-y-3.5">
            {/* Desk Header */}
            <div className={`flex items-center justify-between border-b pb-3 ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-sm sm:text-base leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Forex & Intermarket
                  </h3>
                  <span className="text-xs font-semibold text-amber-500 font-mono">
                    {forex.agentName}
                  </span>
                </div>
              </div>
              {getBiasBadge(forex.bias)}
            </div>

            {/* Standardized KPI Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  DXY Stance
                </span>
                <span className="text-sm font-black text-amber-400 block mt-0.5 truncate">
                  {forex.dxyTrend}
                </span>
                <span className="text-[9px] text-slate-400 block truncate">
                  Dollar Index Direction
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Carry Trade Yield
                </span>
                <span className={`text-sm font-black block mt-0.5 ${forex.carryTradeYieldSpread >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {forex.carryTradeYieldSpread > 0 ? '+' : ''}{forex.carryTradeYieldSpread}%
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Yield Differential
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Active Session
                </span>
                <span className={`text-sm font-black block mt-0.5 truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  {forex.activeTradingSession.session.replace(/_/g, ' ')}
                </span>
                <span className="text-[9px] text-emerald-400 block">
                  {forex.activeTradingSession.liquidityRating} Liquidity
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Advantage
                </span>
                <span className="text-sm font-black text-cyan-400 block mt-0.5 truncate">
                  {forex.relativeStrengthComparison.advantage}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Relative Strength
                </span>
              </div>
            </div>

            {/* Currency Strength Distribution Bar */}
            <div className={`p-2.5 rounded-xl border text-xs font-mono space-y-1.5 ${subBoxClass}`}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-bold text-amber-400">Base: {forex.relativeStrengthComparison.baseStrength}/10</span>
                <span className="text-slate-400 font-semibold">Relative Strength</span>
                <span className="font-bold text-indigo-400">Quote: {forex.relativeStrengthComparison.quoteStrength}/10</span>
              </div>
              <div className="w-full bg-slate-700/40 rounded-full h-2 overflow-hidden flex">
                <div 
                  className="bg-amber-400 h-full transition-all duration-300"
                  style={{ width: `${(forex.relativeStrengthComparison.baseStrength / (forex.relativeStrengthComparison.baseStrength + forex.relativeStrengthComparison.quoteStrength)) * 100}%` }}
                />
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300"
                  style={{ width: `${(forex.relativeStrengthComparison.quoteStrength / (forex.relativeStrengthComparison.baseStrength + forex.relativeStrengthComparison.quoteStrength)) * 100}%` }}
                />
              </div>
            </div>

            {/* De-Cluttered Thesis */}
            <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${subBoxClass}`}>
              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 block mb-1">
                INTERMARKET THESIS:
              </span>
              <p className={`font-sans text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                {forex.thesis}
              </p>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className={`mt-3.5 pt-2.5 border-t text-xs font-mono flex items-center justify-between ${
            theme === 'light' ? 'border-slate-200 text-slate-500' : 'border-terminal-border/70 text-slate-400'
          }`}>
            <span>Relative Advantage</span>
            <span className="font-bold text-amber-400">{forex.confidenceScore}% Confluence</span>
          </div>
        </div>

        {/* 5. CHIEF RISK OFFICER & GATEKEEPER (Wide Card across 2 Columns on Large Screens) */}
        <div className={`rounded-2xl p-4 sm:p-5 flex flex-col justify-between border transition-all duration-200 md:col-span-2 lg:col-span-2 ${cardBaseClass}`}>
          <div className="space-y-3.5">
            {/* Desk Header */}
            <div className={`flex flex-wrap items-center justify-between border-b pb-3 gap-2 ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'}`}>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`font-black text-sm sm:text-base leading-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    Chief Risk Officer & Gatekeeper
                  </h3>
                  <span className="text-xs font-semibold text-emerald-500 font-mono">
                    {risk.agentName}
                  </span>
                </div>
              </div>
              {getVerdictBadge(risk.verdict)}
            </div>

            {/* Standardized 4-6 KPI Container with High-Contrast Telemetry */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Position Size
                </span>
                <span className="text-base font-black text-cyan-400 block mt-0.5">
                  {risk.parameters.positionSizeLots} Lots
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Leverage: 1:{risk.parameters.leverageUsed}
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Risk / Reward
                </span>
                <span className="text-base font-black text-emerald-400 block mt-0.5">
                  1:{risk.parameters.riskRewardRatio}
                </span>
                <span className="text-[9px] text-slate-400 block">
                  Unlimited Potential
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Max Downside Cap
                </span>
                <span className="text-base font-black text-rose-400 block mt-0.5">
                  ${risk.parameters.maxLossUsd}
                </span>
                <span className="text-[9px] text-rose-400/80 block">
                  {risk.parameters.accountRiskPercent}% Capped Equity
                </span>
              </div>

              <div className={`p-2.5 rounded-xl border ${subBoxClass}`}>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                  Projected Gain
                </span>
                <span className="text-base font-black text-cyan-300 block mt-0.5">
                  ${risk.parameters.projectedGainUsd}
                </span>
                <span className="text-[9px] text-emerald-400 block">
                  Positive Expectancy
                </span>
              </div>
            </div>

            {/* Monte Carlo Probabilistic Risk Strip */}
            {risk.monteCarlo && (
              <div className={`p-3 rounded-xl border text-xs font-mono space-y-2 ${subBoxClass}`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-xs uppercase text-slate-200 dark:text-slate-200 light:text-slate-800">
                      1,000-Path Monte Carlo Value-at-Risk Engine
                    </span>
                  </div>
                  {onOpenMonteCarlo && (
                    <button
                      onClick={onOpenMonteCarlo}
                      className="text-cyan-500 hover:text-cyan-400 font-semibold underline text-[11px] flex items-center gap-1"
                    >
                      <span>Inspect VaR Distribution</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block">VaR 95% Confidence:</span>
                    <strong className="text-rose-400 text-xs">${risk.monteCarlo.var95Usd}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Win Probability:</span>
                    <strong className="text-emerald-400 text-xs">{risk.monteCarlo.projectedProfitProbability}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Expected Drawdown:</span>
                    <strong className="text-amber-400 text-xs">{risk.monteCarlo.expectedDrawdownPercent}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Dynamic Override / Veto Reasons */}
            {risk.vetoReasons && risk.vetoReasons.length > 0 && (
              <div className={`p-3 rounded-xl text-xs font-mono border ${
                risk.verdict === 'DYNAMIC_TIER_APPROVED'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}>
                <span className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  {risk.verdict === 'DYNAMIC_TIER_APPROVED' ? 'DYNAMIC SIZING OVERRIDE (ZERO-VETO APPLIED):' : 'GOVERNANCE VETO CONSTRAINTS:'}
                </span>
                {risk.vetoReasons.map((v, i) => (
                  <p key={i} className="leading-relaxed">• {v}</p>
                ))}
              </div>
            )}

            {/* De-Cluttered Reasoning */}
            <div className={`p-2.5 rounded-xl border text-xs leading-relaxed ${subBoxClass}`}>
              <span className="text-[10px] font-mono uppercase font-bold text-emerald-400 block mb-1">
                RISK GOVERNANCE REASONING:
              </span>
              <p className={`font-sans text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                {risk.reasoning}
              </p>
            </div>
          </div>

          {/* Action Button */}
          {onExecuteTrade && (
            <div className={`mt-3.5 pt-3 border-t ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'}`}>
              <button
                onClick={onExecuteTrade}
                className={`w-full py-3 rounded-xl text-xs sm:text-sm font-black font-mono tracking-wide flex items-center justify-center gap-2 shadow-lg transition-all active:scale-98 ${
                  risk.action === 'SELL'
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/25'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/25'
                }`}
              >
                <span>
                  {risk.action === 'SELL'
                    ? `EXECUTE SELL ORDER (${risk.parameters.positionSizeLots} LOTS @ REAL-TIME BID)`
                    : `EXECUTE BUY ORDER (${risk.parameters.positionSizeLots} LOTS @ REAL-TIME ASK)`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
