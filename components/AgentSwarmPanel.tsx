'use client';

import React from 'react';
import { 
  ForexAnalysis, 
  FundamentalAnalysis, 
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
  ExternalLink
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
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-cyan-500/40 transition-colors shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Technical Analyst</h3>
                <span className="text-xs font-semibold text-cyan-400">{technical.agentName}</span>
              </div>
            </div>
            {getBiasBadge(technical.bias)}
          </div>

          <div className="space-y-3 text-sm">
            {/* Smart Money Concepts & Structure */}
            {technical.smartMoneyConcepts && (
              <div className="bg-terminal-950/80 p-3 rounded-lg border border-cyan-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-cyan-400 text-xs uppercase font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Smart Money Concepts (SMC)
                  </span>
                  <span className="text-xs text-slate-300 font-medium">
                    MTF Alignment: {technical.multiTimeframe?.alignment.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
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

            <div className="bg-terminal-950/70 p-3 rounded-lg border border-terminal-border/40">
              <span className="text-slate-400 text-xs uppercase font-bold block mb-1.5">Indicators & Price Action</span>
              <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm">
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

            <div className="flex items-center justify-between bg-terminal-950/50 p-2.5 rounded-lg border border-terminal-border/30 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400">Support (S1): </span>
                <span className="text-emerald-400 font-bold">{technical.keySupport}</span>
              </div>
              <div>
                <span className="text-slate-400">Resistance (R1): </span>
                <span className="text-rose-400 font-bold">{technical.keyResistance}</span>
              </div>
              <div>
                <span className="text-slate-400">Confidence: </span>
                <span className="text-cyan-400 font-bold">{technical.confidenceScore}%</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1">
              {technical.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-terminal-border/40 text-xs text-slate-400 flex items-center justify-between font-medium">
          <span>Suggested Invalidation: {technical.suggestedStopLoss}</span>
          <span>Target: {technical.suggestedTakeProfit}</span>
        </div>
      </div>

      {/* 2. FUNDAMENTAL ANALYST CARD */}
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-purple-500/40 transition-colors shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400">
                <Globe2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Fundamental Analyst</h3>
                <span className="text-xs font-semibold text-purple-400">{fundamental.agentName}</span>
              </div>
            </div>
            {getBiasBadge(fundamental.bias)}
          </div>

          <div className="space-y-3 text-sm">
            <div className="bg-terminal-950/70 p-3 rounded-lg border border-terminal-border/40">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 text-xs font-bold uppercase">Macro Regime</span>
                <span className="text-purple-300 font-semibold">{fundamental.macroRegime}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm mt-2">
                <div className="border-r border-terminal-border/40 pr-2">
                  <span className="text-slate-400 font-bold block">{fundamental.baseCurrencyOutlook.currency} Policy</span>
                  <div className="flex items-center justify-between text-slate-300 mt-1">
                    <span>Stance:</span>
                    <span className="text-amber-400 font-bold">{fundamental.baseCurrencyOutlook.centralBankStance}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Rate:</span>
                    <span className="text-white font-bold">{fundamental.baseCurrencyOutlook.interestRate}%</span>
                  </div>
                </div>

                <div className="pl-1">
                  <span className="text-slate-400 font-bold block">{fundamental.quoteCurrencyOutlook.currency} Policy</span>
                  <div className="flex items-center justify-between text-slate-300 mt-1">
                    <span>Stance:</span>
                    <span className="text-amber-400 font-bold">{fundamental.quoteCurrencyOutlook.centralBankStance}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span>Rate:</span>
                    <span className="text-white font-bold">{fundamental.quoteCurrencyOutlook.interestRate}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-xs text-slate-300 font-medium">
                <span>2Y/10Y Spread: {fundamental.yieldSpread2Y10Y}%</span>
                <span>Real Rate Spread: {fundamental.realInterestRateSpread > 0 ? '+' : ''}{fundamental.realInterestRateSpread}%</span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-terminal-950/50 p-2.5 rounded-lg border border-terminal-border/30 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400">Geopolitical Risk: </span>
                <span className="text-amber-400 font-bold">{fundamental.geopoliticalRiskLevel}</span>
              </div>
              <div>
                <span className="text-slate-400">Confidence: </span>
                <span className="text-purple-400 font-bold">{fundamental.confidenceScore}%</span>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1">
              {fundamental.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-terminal-border/40 text-xs text-slate-400 flex items-center justify-between font-medium">
          <span>Upcoming: {fundamental.highImpactEvents[0]?.name || 'FOMC Dispatches'}</span>
          <span>Rules Matched: {fundamental.matchedRulesCount}</span>
        </div>
      </div>

      {/* 3. REAL-TIME NEWS ANALYST (5th DEDICATED AGENT) */}
      <div className="bg-terminal-900 border border-sky-800/60 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-sky-500/50 transition-colors shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-xl pointer-events-none" />
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-950 border border-sky-800 flex items-center justify-center text-sky-400">
                <Newspaper className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Real-Time News Analyst</h3>
                <span className="text-xs font-semibold text-sky-400">{news.agentName}</span>
              </div>
            </div>
            {getBiasBadge(news.bias)}
          </div>

          <div className="space-y-3 text-sm">
            {/* Scraping Status Bar */}
            <div className="bg-terminal-950/80 p-3 rounded-lg border border-sky-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sky-400 text-xs uppercase font-bold flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
                  38 Financial Outlets Monitored
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                  news.sentimentScore > 0 
                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                    : news.sentimentScore < 0 
                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30' 
                    : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                }`}>
                  {news.marketMood.replace('_', ' ')}
                </span>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Wire Sentiment:</span>
                  <span className="font-bold text-white">{news.sentimentScore > 0 ? '+' : ''}{news.sentimentScore} / 1.0</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="text-slate-200">38 Premier Financial Wires & Central Banks</span>
                </div>
              </div>

              {news.breakingAlert && (
                <div className="mt-2.5 pt-2 border-t border-sky-900/60 text-xs text-amber-300 font-semibold truncate">
                  ⚡ {news.breakingAlert}
                </div>
              )}
            </div>

            {/* Recent Scraped Wire Headlines */}
            <div className="bg-terminal-950/70 p-3 rounded-lg border border-terminal-border/40 space-y-2">
              <span className="text-slate-400 text-xs uppercase font-bold block">Latest Scraped Wire Prints</span>
              {news.recentHeadlines.slice(0, 2).map((item) => (
                <div key={item.id} className="text-xs sm:text-sm border-b border-terminal-border/30 last:border-b-0 pb-1.5 last:pb-0">
                  <div className="flex items-center justify-between text-xs text-sky-400 mb-0.5">
                    <span className="font-semibold">{item.source}</span>
                    <span className="text-slate-400">{item.publishedTime}</span>
                  </div>
                  <p className="text-white font-medium line-clamp-1">{item.title}</p>
                </div>
              ))}
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1">
              {news.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-terminal-border/40 text-xs text-slate-400 flex items-center justify-between font-medium">
          <span>Sources Scraped: 38 / 38</span>
          {onOpenNewsWire && (
            <button
              onClick={onOpenNewsWire}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold underline"
            >
              <span>View Full Wire</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* 4. FOREX & INTERMARKET DYNAMICS ANALYST */}
      <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-amber-500/40 transition-colors shadow-md">
        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Forex & Intermarket</h3>
                <span className="text-xs font-semibold text-amber-400">{forex.agentName}</span>
              </div>
            </div>
            {getBiasBadge(forex.bias)}
          </div>

          <div className="space-y-3 text-sm">
            <div className="bg-terminal-950/70 p-3 rounded-lg border border-terminal-border/40">
              <span className="text-slate-400 text-xs font-bold uppercase block mb-2">Currency Relativity</span>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold text-sm">{forex.relativeStrengthComparison.baseStrength}/10</span>
                  <span className="text-xs text-slate-400">Base</span>
                </div>
                <div className="w-28 sm:w-36 bg-terminal-800 rounded-full h-2.5 overflow-hidden flex">
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
                  <span className="text-white font-bold text-sm">{forex.relativeStrengthComparison.quoteStrength}/10</span>
                  <span className="text-xs text-slate-400">Quote</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs sm:text-sm mt-2">
                <div>
                  <span className="text-slate-400">DXY Stance: </span>
                  <span className="text-amber-300 font-bold">{forex.dxyTrend}</span>
                </div>
                <div>
                  <span className="text-slate-400">Carry Yield: </span>
                  <span className="text-white font-bold">{forex.carryTradeYieldSpread > 0 ? '+' : ''}{forex.carryTradeYieldSpread}%</span>
                </div>
                <div>
                  <span className="text-slate-400">Active Window: </span>
                  <span className="text-slate-200 font-medium">{forex.activeTradingSession.session}</span>
                </div>
                <div>
                  <span className="text-slate-400">Liquidity: </span>
                  <span className="text-emerald-400 font-bold">{forex.activeTradingSession.liquidityRating}</span>
                </div>
              </div>
            </div>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1">
              {forex.thesis}
            </p>
          </div>
        </div>

        <div className="mt-3.5 pt-2.5 border-t border-terminal-border/40 text-xs text-slate-400 flex items-center justify-between font-medium">
          <span>Advantage: {forex.relativeStrengthComparison.advantage}</span>
          <span>Confidence: {forex.confidenceScore}%</span>
        </div>
      </div>

      {/* 5. RISK MANAGER & CHIEF CAPITAL GATEKEEPER (Wide Card) */}
      <div className="bg-terminal-900 border border-emerald-800/60 rounded-xl p-4 sm:p-5 flex flex-col justify-between hover:border-emerald-500/50 transition-colors shadow-md relative overflow-hidden md:col-span-2 lg:col-span-2">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between border-b border-terminal-border/60 pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Risk Manager & Chief Gatekeeper</h3>
                <span className="text-xs font-semibold text-emerald-400">{risk.agentName}</span>
              </div>
            </div>
            {getVerdictBadge(risk.verdict)}
          </div>

          <div className="space-y-3 text-sm">
            <div className="bg-terminal-950/80 p-3 rounded-lg border border-emerald-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 text-xs uppercase font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Sizing & Expectancy Engine
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  Leverage: 1:{risk.parameters.leverageUsed}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs sm:text-sm">
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
                <div className="mt-2.5 pt-2 border-t border-terminal-border/40 flex items-center justify-between text-xs text-slate-300 font-medium">
                  <span>Monte Carlo VaR (95%): ${risk.monteCarlo.var95Usd} • Win Prob {risk.monteCarlo.projectedProfitProbability}%</span>
                  {onOpenMonteCarlo && (
                    <button
                      onClick={onOpenMonteCarlo}
                      className="text-cyan-400 hover:text-cyan-300 font-semibold underline flex items-center gap-1"
                    >
                      <LineChart className="w-3.5 h-3.5" />
                      <span>1,000-Path VaR</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Veto or Adjustment Reasons */}
            {risk.vetoReasons && risk.vetoReasons.length > 0 && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/50 text-xs text-rose-300">
                <span className="font-bold flex items-center gap-1.5 mb-1 text-rose-400">
                  <ShieldAlert className="w-4 h-4" />
                  VETO ACTIVE:
                </span>
                {risk.vetoReasons.map((v, i) => (
                  <p key={i} className="leading-relaxed">• {v}</p>
                ))}
              </div>
            )}

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed pt-1">
              {risk.reasoning}
            </p>
          </div>
        </div>

        {/* Execute button */}
        {risk.verdict !== 'VETOED' && risk.action !== 'NO_TRADE' && onExecuteTrade && (
          <div className="mt-3.5 pt-3 border-t border-terminal-border/40">
            <button
              onClick={onExecuteTrade}
              className={`w-full py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
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
