'use client';

import React from 'react';
import { 
  ForexAnalysis, 
  FundamentalAnalysis, 
  JournalMemoryAnalysis,
  NewsAnalysis, 
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
  Sparkles,
  Newspaper,
  Radio,
  ExternalLink,
  History,
  BookOpen
} from 'lucide-react';

interface AgentSwarmPanelProps {
  technical: TechnicalAnalysis;
  fundamental: FundamentalAnalysis;
  forex: ForexAnalysis;
  news: NewsAnalysis;
  journal?: JournalMemoryAnalysis;
  risk: RiskAssessment;
  onExecuteTrade?: () => void;
  onOpenMonteCarlo?: () => void;
  onOpenNewsWire?: () => void;
  onOpenJournal?: () => void;
}

export const AgentSwarmPanel: React.FC<AgentSwarmPanelProps> = ({
  technical,
  fundamental,
  forex,
  news,
  journal,
  risk,
  onExecuteTrade,
  onOpenMonteCarlo,
  onOpenNewsWire,
  onOpenJournal,
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <span className="text-slate-400">Sweep: </span>
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
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Indicators & Price Action</span>
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
                  <span className="text-slate-400 font-bold block">{fundamental.baseCurrencyOutlook.currency} Policy</span>
                  <div className="flex items-center justify-between text-slate-300 mt-1">
                    <span>Stance:</span>
                    <span className="text-amber-400 font-semibold">{fundamental.baseCurrencyOutlook.centralBankStance}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Rate:</span>
                    <span className="text-white font-semibold">{fundamental.baseCurrencyOutlook.interestRate}%</span>
                  </div>
                </div>

                <div className="pl-1">
                  <span className="text-slate-400 font-bold block">{fundamental.quoteCurrencyOutlook.currency} Policy</span>
                  <div className="flex items-center justify-between text-slate-300 mt-1">
                    <span>Stance:</span>
                    <span className="text-amber-400 font-semibold">{fundamental.quoteCurrencyOutlook.centralBankStance}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Rate:</span>
                    <span className="text-white font-semibold">{fundamental.quoteCurrencyOutlook.interestRate}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-[10px]">
                <span className="text-slate-400">2Y/10Y Spread: {fundamental.yieldSpread2Y10Y}%</span>
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
          <span>Upcoming Catalyst: {fundamental.highImpactEvents[0]?.name || 'FOMC Dispatches'}</span>
          <span>Rules Matched: {fundamental.matchedRulesCount}</span>
        </div>
      </div>

      {/* 3. REAL-TIME NEWS ANALYST (5th DEDICATED AGENT) */}
      <div className="bg-terminal-900 border border-sky-800/60 rounded-xl p-4 flex flex-col justify-between hover:border-sky-500/50 transition-colors shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Real-Time News Analyst</h3>
                <span className="text-[11px] font-mono text-sky-400">{news.agentName}</span>
              </div>
            </div>
            {getBiasBadge(news.bias)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            {/* Scraping Status Bar */}
            <div className="bg-terminal-950/80 p-2.5 rounded-lg border border-sky-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sky-400 text-[10px] uppercase font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  18 Financial Outlets Monitored
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                  news.sentimentScore > 0 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : news.sentimentScore < 0 
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {news.marketMood.replace('_', ' ')}
                </span>
              </div>

              <div className="text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Wire Sentiment Score:</span>
                  <span className="font-bold text-white">{news.sentimentScore > 0 ? '+' : ''}{news.sentimentScore} / 1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="text-slate-200">Bloomberg, Reuters, Kitco, WSJ, CNBC, FT</span>
                </div>
              </div>

              {news.breakingAlert && (
                <div className="mt-2 pt-1.5 border-t border-sky-900/60 text-[11px] text-amber-300 truncate">
                  ⚡ {news.breakingAlert}
                </div>
              )}
            </div>

            {/* Recent Scraped Wire Headlines */}
            <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40 space-y-1.5">
              <span className="text-slate-400 text-[10px] uppercase block">Latest Scraped Wire Prints</span>
              {news.recentHeadlines.slice(0, 2).map((item) => (
                <div key={item.id} className="text-[11px] font-sans border-b border-terminal-border/30 last:border-b-0 pb-1 last:pb-0">
                  <div className="flex items-center justify-between text-[10px] font-mono text-sky-400 mb-0.5">
                    <span className="font-semibold">{item.source}</span>
                    <span className="text-slate-500">{item.publishedTime}</span>
                  </div>
                  <p className="text-white font-medium line-clamp-1">{item.title}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
              {news.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>Sources Scraped: 18 / 18</span>
          {onOpenNewsWire && (
            <button
              onClick={onOpenNewsWire}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
            >
              <span>View Full Wire</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. FOREX & INTERMARKET DYNAMICS ANALYST */}
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Forex & Market Dynamics</h3>
                <span className="text-[11px] font-mono text-amber-400">{forex.agentName}</span>
              </div>
            </div>
            {getBiasBadge(forex.bias)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40">
              <span className="text-slate-400 text-[10px] uppercase block mb-1">Currency & Commodity Relativity</span>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{forex.relativeStrengthComparison.baseStrength}/10</span>
                  <span className="text-[10px] text-slate-400">Base</span>
                </div>
                <div className="w-28 sm:w-32 bg-terminal-800 rounded-full h-2 overflow-hidden flex">
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

      {/* 5. HISTORICAL MEMORY & TRADE JOURNAL SPECIALIST */}
      {journal && (
        <div className="bg-terminal-900 border border-rose-900/60 rounded-xl p-4 flex flex-col justify-between hover:border-rose-500/50 transition-colors shadow-md relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-rose-950 border border-rose-800 flex items-center justify-center text-rose-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">Historical Memory & Journal</h3>
                  <span className="text-[11px] font-mono text-rose-400">Dr. Marcus Vance</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                journal.lossPreventionVerdict === 'HIGH_RISK_LOSS_PATTERN_DETECTED'
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : journal.lossPreventionVerdict === 'CAUTION_SIMILAR_TO_PAST_LOSS'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {journal.lossPreventionVerdict === 'HIGH_RISK_LOSS_PATTERN_DETECTED' ? 'LOSS TRAP' : journal.lossPreventionVerdict.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="bg-terminal-950/70 p-2.5 rounded-lg border border-terminal-border/40">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-slate-400 text-[10px] uppercase">Symbol Win Rate ({journal.symbolAnalyzed})</span>
                  <span className="text-white font-bold">{journal.symbolWinRate}% ({journal.symbolTradesCount} trades)</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400">Loss Similarity: </span>
                    <span className={`font-bold ${
                      journal.lossSimilarityScore >= 60 ? 'text-rose-400' : journal.lossSimilarityScore >= 35 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {journal.lossSimilarityScore}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">Profit Factor: </span>
                    <span className="text-cyan-400 font-bold">{journal.symbolProfitFactor}x</span>
                  </div>
                  <div>
                    <span className="text-slate-400">MAE Stop Buffer: </span>
                    <span className="text-rose-300">+{journal.strategicAdjustments.stopLossBufferPips.toFixed(1)} pips</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Size Modifier: </span>
                    <span className={journal.strategicAdjustments.sizeModifierPercent < 100 ? 'text-amber-400 font-bold' : 'text-emerald-400'}>
                      {journal.strategicAdjustments.sizeModifierPercent}%
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-slate-300 text-xs font-sans leading-relaxed pt-1">
                {journal.thesis}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-terminal-border/40 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Archive Memory: #{journal.activeMemoryRecall.pastTradeId?.slice(-6) || 'SEED'}</span>
            {onOpenJournal && (
              <button
                onClick={onOpenJournal}
                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 underline"
              >
                <BookOpen className="w-3 h-3" />
                <span>Open Journal</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 6. RISK MANAGER & CHIEF CAPITAL GATEKEEPER */}
      <div className="bg-terminal-900 border border-emerald-800/60 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Risk Manager & Chief Gatekeeper</h3>
                <span className="text-[11px] font-mono text-emerald-400">{risk.agentName}</span>
              </div>
            </div>
            {getVerdictBadge(risk.verdict)}
          </div>

          <div className="space-y-2.5 text-xs font-mono">
            <div className="bg-terminal-950/80 p-2.5 rounded-lg border border-emerald-500/20">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-emerald-400 text-[10px] uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Mathematical Expectancy & Sizing Engine
                </span>
                <span className="text-[10px] text-slate-300">
                  Leverage: 1:{risk.parameters.leverageUsed}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-400 block">Position Size:</span>
                  <span className="text-white font-bold">{risk.parameters.positionSizeLots} Lots</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Risk/Reward:</span>
                  <span className="text-emerald-400 font-bold">{risk.parameters.riskRewardRatio}:1</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Max Downside:</span>
                  <span className="text-rose-400 font-bold">${risk.parameters.maxLossUsd} ({risk.parameters.accountRiskPercent}%)</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Projected Gain:</span>
                  <span className="text-cyan-400 font-bold">${risk.parameters.projectedGainUsd}</span>
                </div>
              </div>

              {/* Monte Carlo mini-bar */}
              {risk.monteCarlo && (
                <div className="mt-2 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Monte Carlo VaR (95%): ${risk.monteCarlo.var95Usd} • Win Prob {risk.monteCarlo.projectedProfitProbability}%</span>
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
              className={`w-full py-2.5 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
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
