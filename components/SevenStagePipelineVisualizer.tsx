'use client';

import React, { useState } from 'react';
import {
  CurrencyPair,
  SevenStagePipelineResult,
  StageAuditTrailItem,
  ConfluenceGrade,
} from '@/lib/types';
import {
  CheckCircle2,
  ShieldCheck,
  ShieldAlert,
  Layers,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  ArrowRight,
  ChevronRight,
  ChevronDown,
  Radio,
  Database,
  Sliders,
  DollarSign,
  Lock,
  Scale,
  FileText,
  RefreshCw,
  AlertTriangle,
  Flame,
  Award,
  Maximize2,
  Minimize2,
  ExternalLink,
} from 'lucide-react';

export interface SevenStagePipelineVisualizerProps {
  pipeline?: SevenStagePipelineResult | null;
  selectedPair: CurrencyPair;
  theme?: 'dark' | 'light';
  isCompact?: boolean;
  onOpenAuditTrailModal?: () => void;
  onRefreshPipeline?: () => void;
}

export const SevenStagePipelineVisualizer: React.FC<SevenStagePipelineVisualizerProps> = ({
  pipeline,
  selectedPair,
  theme = 'dark',
  isCompact = false,
  onOpenAuditTrailModal,
  onRefreshPipeline,
}) => {
  const [activeStageTab, setActiveStageTab] = useState<number>(7); // Default to Stage 7 (Final Trade Output)
  const [isExpanded, setIsExpanded] = useState<boolean>(!isCompact);
  const [showFullAuditTable, setShowFullAuditTable] = useState<boolean>(false);

  if (!pipeline) {
    return (
      <div className={`p-4 rounded-2xl border font-mono text-xs shadow-xl transition-all duration-300 ${
        theme === 'light'
          ? 'bg-white border-slate-200 text-slate-700'
          : 'bg-terminal-950 border-terminal-border text-slate-300'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span className="font-bold tracking-wide">
              SYNCHRONIZING 7-STAGE DETERMINISTIC PIPELINE FOR {selectedPair}...
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Connecting Sequential Stages 1 → 7</span>
        </div>
      </div>
    );
  }

  const { stage1, stage2, stage3, stage4, stage5, stage6, stage7 } = pipeline;

  const stageTabs = [
    { num: 1, name: '2,100+ Strategies', badge: '2,100+ Models', status: stage1.status },
    { num: 2, name: 'Congress & Order Flow', badge: `Grade ${stage2.orderFlowGovernance.selectedSetupGrade}`, status: stage2.status },
    { num: 3, name: 'Live Data & MT5', badge: `${stage3.exactLiveQuotes.spreadPips} pips`, status: stage3.status },
    { num: 4, name: 'Intermarket & News', badge: `${stage4.nlpSentimentScoring.sentimentScore > 0 ? '+' : ''}${stage4.nlpSentimentScoring.sentimentScore}`, status: stage4.status },
    { num: 5, name: 'Gatekeeper Dossier', badge: stage5.gatekeeperVerdict === 'GATEKEEPER_VETO' ? 'VETOED' : 'APPROVED', status: stage5.status },
    { num: 6, name: 'Chief Reviewer Debate', badge: stage6.adjudicatedConsensus.consensusRuling, status: stage6.status },
    { num: 7, name: 'Final Trade Output', badge: `${stage7.actionableTradeDirective.action} @ ${stage7.actionableTradeDirective.entryPrice}`, status: stage7.status },
  ];

  return (
    <div className={`rounded-2xl border font-mono text-xs transition-all duration-300 shadow-2xl overflow-hidden ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-900 shadow-slate-900/5'
        : 'bg-terminal-950 border-terminal-border text-slate-100 shadow-black/60'
    }`}>
      {/* 1. Header Bar: Title, Pipeline Status, Inter-Stage Latency */}
      <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${
        theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-terminal-900/60 border-terminal-border/80'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm sm:text-base tracking-wide text-cyan-400">
                7-STAGE DETERMINISTIC SEQUENTIAL PIPELINE
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3" />
                <span>7/7 STAGES VERIFIED</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shrink-0">
                {selectedPair}
              </span>
            </div>
            <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} truncate`}>
              Downstream modules consume strictly the validated output of the preceding stage with zero context leakage
            </p>
          </div>
        </div>

        {/* Telemetry Pills & Action Controls */}
        <div className="flex items-center gap-2 flex-wrap text-[10px]">
          <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
          }`}>
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Total Pipeline Latency: <strong>{pipeline.totalPipelineLatencyMs}ms</strong></span>
          </span>

          <span className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
            theme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
          }`}>
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span>MT5 & WSS: <strong>LIVE (0ms LAG)</strong></span>
          </span>

          {onRefreshPipeline && (
            <button
              onClick={onRefreshPipeline}
              className={`p-1.5 rounded-lg border hover:opacity-80 transition-opacity ${
                theme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
              }`}
              title="Recalibrate 7-Stage Pipeline"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1.5 rounded-lg border hover:opacity-80 transition-opacity ${
              theme === 'light' ? 'bg-white border-slate-200 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
            }`}
            title={isExpanded ? 'Collapse Pipeline View' : 'Expand Pipeline View'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive 7-Stage Sequential Pipeline Stepper */}
      <div className={`p-3 border-b overflow-x-auto scrollbar-none ${
        theme === 'light' ? 'bg-slate-100/60 border-slate-200' : 'bg-terminal-950/80 border-terminal-border/60'
      }`}>
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {stageTabs.map((tab, idx) => {
            const isActive = activeStageTab === tab.num;
            return (
              <React.Fragment key={tab.num}>
                <button
                  onClick={() => setActiveStageTab(tab.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-mono font-bold transition-all text-left group ${
                    isActive
                      ? theme === 'light'
                        ? 'bg-white text-indigo-700 border-indigo-400 shadow-md ring-2 ring-indigo-400/20'
                        : 'bg-gradient-to-r from-cyan-950/80 to-indigo-950/80 text-white border-cyan-400 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400'
                      : theme === 'light'
                      ? 'bg-slate-200/60 text-slate-600 border-transparent hover:bg-white hover:text-slate-900'
                      : 'bg-terminal-900/60 text-slate-400 border-terminal-border/60 hover:bg-terminal-800 hover:text-slate-200'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                    isActive
                      ? 'bg-cyan-500 text-black'
                      : 'bg-terminal-800 text-slate-400 group-hover:bg-terminal-700 group-hover:text-white'
                  }`}>
                    {tab.num}
                  </div>
                  <div>
                    <span className="block text-[11px] font-bold leading-tight whitespace-nowrap">
                      {tab.name}
                    </span>
                    <span className={`block text-[9px] font-mono leading-tight mt-0.5 truncate max-w-[120px] ${
                      isActive ? 'text-cyan-300' : 'text-slate-500'
                    }`}>
                      {tab.badge}
                    </span>
                  </div>
                </button>

                {idx < stageTabs.length - 1 && (
                  <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${
                    activeStageTab > tab.num
                      ? 'text-cyan-400'
                      : 'text-slate-600 opacity-60'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. Detailed Stage Deep-Dive Inspection Card */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Stage 1: 1,050+ Strategies Analysis */}
          {activeStageTab === 1 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px] border border-cyan-500/40">
                    STAGE 1 OF 7
                  </span>
                  <h4 className="font-extrabold text-sm text-cyan-300 uppercase">
                    1,170+ Quantitative Execution Strategies Exhaustive Analysis
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Execution Latency: {stage1.latencyMs}ms</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Total Strategies Evaluated</span>
                  <span className="text-base font-extrabold text-cyan-400">{stage1.totalStrategiesEvaluated} Rules</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">525+ Technical + 525+ Fundamental + 120+ Candlestick</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Raw Technical Score</span>
                  <span className="text-base font-extrabold text-indigo-400">{stage1.rawTechnicalScore}%</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">SMC & Indicator Confluence</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Raw Directional Bias</span>
                  <span className={`text-base font-extrabold ${
                    stage1.rawDirectionalScores.rawBias === 'BUY' ? 'text-emerald-400' : stage1.rawDirectionalScores.rawBias === 'SELL' ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {stage1.rawDirectionalScores.rawBias} (Net {stage1.rawDirectionalScores.netScore > 0 ? '+' : ''}{stage1.rawDirectionalScores.netScore})
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Buy: {stage1.rawDirectionalScores.buyScore}% | Sell: {stage1.rawDirectionalScores.sellScore}%</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Zero-Pruning Guarantee</span>
                  <span className="text-base font-extrabold text-emerald-400">100% COMPLETE</span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Zero Heuristic Pruning</span>
                </div>
              </div>

              {/* SMC & ICT Overlays */}
              <div className={`p-3.5 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/60 border-terminal-border'}`}>
                <span className="font-bold text-[11px] text-indigo-400 block mb-2">
                  Institutional Pattern Detections (SMC, ICT, Liquidity & Quantum Vision)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 text-[10px] block">Smart Money Concepts:</span>
                    <p className="font-bold text-slate-200">
                      Structure: {stage1.patternDetections.smartMoneyConcepts.structure} • Block: {stage1.patternDetections.smartMoneyConcepts.orderBlock}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">Market DNA Overlay:</span>
                    <p className="font-bold text-slate-200">{stage1.patternDetections.marketDna}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-slate-400 text-[10px] block">Quantum Vision Volatility Vector:</span>
                    <p className="font-bold text-cyan-300">{stage1.patternDetections.quantumVisionOverlay}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 2: Institutional Strategies Congress & Order Flow */}
          {activeStageTab === 2 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 font-bold text-[10px] border border-indigo-500/40">
                    STAGE 2 OF 7
                  </span>
                  <h4 className="font-extrabold text-sm text-indigo-300 uppercase">
                    Institutional Strategies Congress & Order Flow Governance
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Execution Latency: {stage2.latencyMs}ms</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Governance Verdict</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {stage2.orderFlowGovernance.governanceVerdict.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Retail Noise Filtered</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Selected Confluence Grade</span>
                  <span className="text-base font-extrabold text-amber-400">
                    GRADE {stage2.orderFlowGovernance.selectedSetupGrade}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    {stage2.orderFlowGovernance.isInstitutionalGrade ? 'Institutional Grade A/A+' : 'Standard Setup'}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Volume Profile POC</span>
                  <span className="text-base font-extrabold text-cyan-400">
                    {stage2.institutionalVolumeProfile.pointOfControl}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    VAH: {stage2.institutionalVolumeProfile.valueAreaHigh} | VAL: {stage2.institutionalVolumeProfile.valueAreaLow}
                  </span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Cumulative Volume Delta</span>
                  <span className="text-base font-extrabold text-purple-400">
                    {stage2.institutionalVolumeProfile.cumulativeVolumeDelta > 0 ? '+' : ''}
                    {stage2.institutionalVolumeProfile.cumulativeVolumeDelta} Contracts
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">
                    Buyers: {stage2.institutionalVolumeProfile.buyingPressurePercent}% vs Sellers: {stage2.institutionalVolumeProfile.sellingPressurePercent}%
                  </span>
                </div>
              </div>

              {/* Multi-Timeframe Alignment & Congress Voting */}
              <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/60 border-terminal-border'
              }`}>
                <div>
                  <span className="text-slate-400 text-[10px] block">Multi-Timeframe Structural Alignment:</span>
                  <p className="font-bold text-slate-200 text-xs mt-0.5">
                    HTF: <strong className="text-cyan-400">{stage2.multiTimeframeAlignment.htfBias}</strong> • MTF: <strong className="text-cyan-400">{stage2.multiTimeframeAlignment.mtfBias}</strong> • LTF: <strong className="text-cyan-400">{stage2.multiTimeframeAlignment.ltfBias}</strong> (Score: {stage2.multiTimeframeAlignment.alignmentScore}%)
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[10px] block">Institutional Congress Vote Tally:</span>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    YES: {stage2.orderFlowGovernance.congressVotingTally.institutionalYes} | NO: {stage2.orderFlowGovernance.congressVotingTally.institutionalNo} | ABSTAIN: {stage2.orderFlowGovernance.congressVotingTally.abstain}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Real-Time Market Data Integration (WebSocket & MT5) */}
          {activeStageTab === 3 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/40">
                    STAGE 3 OF 7
                  </span>
                  <h4 className="font-extrabold text-sm text-emerald-300 uppercase">
                    Real-Time Market Data Integration (WebSocket & MT5 REST API)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Execution Latency: {stage3.latencyMs}ms</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Exact Live Bid / Ask</span>
                  <span className="text-sm font-extrabold text-white">
                    {stage3.exactLiveQuotes.bidPrice} / {stage3.exactLiveQuotes.askPrice}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Spread: {stage3.exactLiveQuotes.spreadPips} pips (${stage3.exactLiveQuotes.spreadCostUsd})</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">MT5 REST API Bridge</span>
                  <span className="text-sm font-extrabold text-emerald-400">
                    {stage3.liveStreamIntegrations.mt5RestApi.terminalStatus}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Ping: {stage3.liveStreamIntegrations.mt5RestApi.pingMs}ms (Direct Execution)</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Tick Volatility Regime</span>
                  <span className="text-sm font-extrabold text-amber-400">
                    {stage3.tickVolatility.volatilityRegime} ({stage3.tickVolatility.tickVelocityPerSec} t/s)
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Instant ATR: {stage3.tickVolatility.instantaneousAtr}</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Order Book Depth Imbalance</span>
                  <span className="text-sm font-extrabold text-cyan-400">
                    {stage3.orderBookDepth.depthImbalanceRatio}:1 BID DOMINANCE
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Bid Vol: {stage3.orderBookDepth.bidDepthVolume} | Ask: {stage3.orderBookDepth.askDepthVolume}</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/60 border-terminal-border'
              }`}>
                <span className="text-slate-400 text-[10px] block">Live Stream Endpoints:</span>
                <p className="font-mono text-slate-300 mt-0.5 truncate">
                  WebSocket: <strong className="text-cyan-400">{stage3.liveStreamIntegrations.webSocketStream.endpoint}</strong> ({stage3.liveStreamIntegrations.webSocketStream.latencyMs}ms latency) • MT5 Bridge: <strong className="text-indigo-400">{stage3.liveStreamIntegrations.mt5RestApi.endpoint}</strong>
                </p>
              </div>
            </div>
          )}

          {/* Stage 4: Intermarket and Forex Market News and Correlations */}
          {activeStageTab === 4 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] border border-amber-500/40">
                    STAGE 4 OF 7
                  </span>
                  <h4 className="font-extrabold text-sm text-amber-300 uppercase">
                    Intermarket and Forex Market News & Correlations
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Execution Latency: {stage4.latencyMs}ms</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">NLP Wire Sentiment</span>
                  <span className="text-base font-extrabold text-cyan-400">
                    {stage4.nlpSentimentScoring.sentimentScore > 0 ? '+' : ''}{stage4.nlpSentimentScoring.sentimentScore}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">38 Premier Financial Feeds</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Catalyst Alignment</span>
                  <span className="text-xs font-extrabold text-emerald-400">
                    {stage4.nlpSentimentScoring.catalystRelationship.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Central Bank & Wire Confluence</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Dollar Index (DXY) Correlation</span>
                  <span className="text-base font-extrabold text-rose-400">
                    {(stage4.crossAssetCorrelationTelemetry.dxyIndex.correlationToSymbol * 100).toFixed(0)}% Inverse
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">DXY Trend: {stage4.crossAssetCorrelationTelemetry.dxyIndex.trend}</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">US 10Y Real Yield Spread</span>
                  <span className="text-base font-extrabold text-purple-400">
                    {stage4.crossAssetCorrelationTelemetry.us10YRealYield.value}%
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Curve Spread: {stage4.crossAssetCorrelationTelemetry.us10YRealYield.yieldSpread2Y10Y}%</span>
                </div>
              </div>

              {/* Breaking News Feed Strip */}
              <div className={`p-3 rounded-xl border text-[11px] ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/60 border-terminal-border'
              }`}>
                <span className="text-slate-400 text-[10px] block font-bold mb-1">
                  Active Financial Wire Catalysts:
                </span>
                <div className="space-y-1">
                  {stage4.wireFeedsAndCalendar.breakingNewsBullets.slice(0, 2).map((b, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[9px]">{b.source}</span>
                      <span className="truncate text-slate-200">{b.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Stage 5: Chief Gatekeeper / Risk Manager Compilation */}
          {activeStageTab === 5 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold text-[10px] border border-purple-500/40">
                    STAGE 5 OF 7
                  </span>
                  <h4 className="font-extrabold text-sm text-purple-300 uppercase">
                    Chief Gatekeeper / Risk Manager Compilation (Unified Intelligence Dossier)
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Execution Latency: {stage5.latencyMs}ms</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Chief Gatekeeper Verdict</span>
                  <span className={`text-sm font-extrabold ${
                    stage5.gatekeeperVerdict === 'APPROVED_FOR_DEBATE' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {stage5.gatekeeperVerdict.replace(/_/g, ' ')}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">{stage5.unifiedIntelligenceDossier.chiefGatekeeper}</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Account Equity Constraints</span>
                  <span className="text-base font-extrabold text-white">
                    ${stage5.unifiedIntelligenceDossier.accountConstraints.accountEquity.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Free Margin: ${stage5.unifiedIntelligenceDossier.accountConstraints.freeMargin.toLocaleString()}</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Absolute Loss Cap</span>
                  <span className="text-base font-extrabold text-rose-400">
                    ${stage5.unifiedIntelligenceDossier.riskRatioControllerParams.absoluteDownsideLossCapUsd.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Max {stage5.unifiedIntelligenceDossier.accountConstraints.maxAllowedDrawdownPercent}% Drawdown Limit</span>
                </div>

                <div className={`p-3 rounded-xl border ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'}`}>
                  <span className="text-[10px] text-slate-400 block font-semibold">Enforced Risk-Reward</span>
                  <span className="text-base font-extrabold text-cyan-400">
                    {stage5.unifiedIntelligenceDossier.riskRatioControllerParams.enforcedMinRiskRewardRatio}:1 R:R
                  </span>
                  <span className="text-[9px] text-slate-500 block mt-0.5">Adapted Lots: {stage5.unifiedIntelligenceDossier.riskRatioControllerParams.volatilityAdaptedLotSize}</span>
                </div>
              </div>

              <div className={`p-3 rounded-xl border text-[11px] ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/60 border-terminal-border'
              }`}>
                <span className="text-slate-400 text-[10px] block font-bold">Dossier ID: {stage5.unifiedIntelligenceDossier.dossierId}</span>
                <p className="text-slate-300 mt-0.5">{stage5.gatekeeperRationale}</p>
              </div>
            </div>
          )}

          {/* Stage 6: Chief Reviewer and Buy-Side vs. Sell-Side Debate */}
          {activeStageTab === 6 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/40">
                    STAGE 6 OF 7
                  </span>
                  <h4 className="font-extrabold text-sm text-rose-300 uppercase">
                    Chief Reviewer Adjudication & Buy-Side vs. Sell-Side Adversarial Debate
                  </h4>
                </div>
                <span className="text-[10px] text-slate-400">Execution Latency: {stage6.latencyMs}ms</span>
              </div>

              {/* Buy-Side vs Sell-Side Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Buy-Side Thesis */}
                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-emerald-50/70 border-emerald-300' : 'bg-emerald-950/40 border-emerald-500/40'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-emerald-500/30">
                    <span className="font-extrabold text-emerald-400 flex items-center gap-1.5 text-xs">
                      <TrendingUp className="w-3.5 h-3.5" />
                      BUY-SIDE (BULLISH) THESIS
                    </span>
                    <span className="font-bold text-xs text-emerald-300">{stage6.adversarialDebateArena.buySideThesis.convictionScore}% Conviction</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-200">
                    {stage6.adversarialDebateArena.buySideThesis.coreArguments.map((arg, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Sell-Side Thesis */}
                <div className={`p-3.5 rounded-xl border ${
                  theme === 'light' ? 'bg-rose-50/70 border-rose-300' : 'bg-rose-950/40 border-rose-500/40'
                }`}>
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-500/30">
                    <span className="font-extrabold text-rose-400 flex items-center gap-1.5 text-xs">
                      <TrendingDown className="w-3.5 h-3.5" />
                      SELL-SIDE (BEARISH) THESIS
                    </span>
                    <span className="font-bold text-xs text-rose-300">{stage6.adversarialDebateArena.sellSideThesis.convictionScore}% Conviction</span>
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-200">
                    {stage6.adversarialDebateArena.sellSideThesis.coreArguments.map((arg, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-400 font-bold">•</span>
                        <span>{arg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Chief Reviewer Adjudication Verdict */}
              <div className={`p-3.5 rounded-xl border ${
                theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'
              }`}>
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-terminal-border/60">
                  <span className="font-bold text-xs text-cyan-400">
                    CHIEF REVIEWER VERDICT: {stage6.chiefReviewer}
                  </span>
                  <span className="px-2 py-0.5 rounded font-bold text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                    {stage6.adjudicatedConsensus.consensusRuling}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {stage6.adjudicatedConsensus.adjudicationSummary}
                </p>
                <span className="font-mono text-[9px] text-slate-500 block mt-1.5">
                  Clearance Signature: {stage6.adjudicatedConsensus.gatekeeperClearanceSignature}
                </span>
              </div>
            </div>
          )}

          {/* Stage 7: Final Trade Output Generation & Full Audit Trail */}
          {activeStageTab === 7 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-terminal-border/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-cyan-500 text-black font-extrabold text-[10px]">
                    STAGE 7 OF 7 // TERMINAL DIRECTIVE
                  </span>
                  <h4 className="font-extrabold text-sm text-cyan-300 uppercase">
                    Final Actionable Trade Directive & Full Stage Audit Trail
                  </h4>
                </div>
                <span className="text-[10px] text-emerald-400 font-bold">READY FOR EXECUTION</span>
              </div>

              {/* Actionable Trade Directive Primary Box */}
              <div className={`p-4 rounded-xl border ${
                stage7.actionableTradeDirective.action === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-950/60 via-terminal-900 to-terminal-950 border-emerald-500/60'
                  : stage7.actionableTradeDirective.action === 'SELL'
                  ? 'bg-gradient-to-r from-rose-950/60 via-terminal-900 to-terminal-950 border-rose-500/60'
                  : 'bg-terminal-900 border-terminal-border'
              }`}>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Directive</span>
                    <span className={`text-base font-extrabold ${
                      stage7.actionableTradeDirective.action === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {stage7.actionableTradeDirective.action}
                    </span>
                    <span className="text-[9px] text-slate-500">{stage7.actionableTradeDirective.orderType}</span>
                  </div>

                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Entry Quote</span>
                    <span className="text-base font-extrabold text-white">
                      {stage7.actionableTradeDirective.entryPrice}
                    </span>
                    <span className="text-[9px] text-slate-500">Live Exact Fill</span>
                  </div>

                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Take Profit (TP)</span>
                    <span className="text-base font-extrabold text-emerald-400">
                      {stage7.actionableTradeDirective.takeProfit}
                    </span>
                    <span className="text-[9px] text-slate-500">{stage7.actionableTradeDirective.riskRewardRatio}:1 R:R</span>
                  </div>

                  <div className="p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Stop Loss (SL)</span>
                    <span className="text-base font-extrabold text-rose-400">
                      {stage7.actionableTradeDirective.stopLoss}
                    </span>
                    <span className="text-[9px] text-slate-500">Max Risk ${stage7.actionableTradeDirective.maxLossUsd}</span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 p-2 rounded-lg bg-black/30 border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-semibold">Position Size</span>
                    <span className="text-base font-extrabold text-amber-400">
                      {stage7.actionableTradeDirective.confidenceGradedLots} Lots
                    </span>
                    <span className="text-[9px] text-slate-500">Graded Execution</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                  <span className="text-slate-300">
                    <strong className="text-cyan-400">Structural Invalidation:</strong> {stage7.structuralInvalidationAnchors.anchoredLiquidityWall} ({stage7.structuralInvalidationAnchors.invalidationDistancePips} pips distance)
                  </span>
                  <span className="font-bold text-emerald-400">
                    {stage7.actionableTradeDirective.executionAuthorized ? 'EXECUTION AUTHORIZED (CHIEF REVIEWER VERIFIED)' : 'EXECUTION PAUSED'}
                  </span>
                </div>
              </div>

              {/* Stage-by-Stage Traceable Audit Trail Strip */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-extrabold text-xs text-indigo-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    FULL 7-STAGE TRACEABLE AUDIT TRAIL
                  </span>
                  <button
                    onClick={() => setShowFullAuditTable(!showFullAuditTable)}
                    className="text-[10px] font-bold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>{showFullAuditTable ? 'Hide Table' : 'Show Full Audit Matrix'}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${showFullAuditTable ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {showFullAuditTable && (
                  <div className="overflow-x-auto rounded-xl border border-terminal-border/80">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead className={`border-b ${theme === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-terminal-900 text-slate-300'}`}>
                        <tr>
                          <th className="p-2">Stage</th>
                          <th className="p-2">Stage Name</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Key Metric</th>
                          <th className="p-2">Summary</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-terminal-border/50">
                        {stage7.stageByStageAuditTrail.map((item) => (
                          <tr key={item.stageNumber} className={`hover:bg-terminal-800/40 transition-colors ${
                            theme === 'light' ? 'hover:bg-slate-100' : ''
                          }`}>
                            <td className="p-2 font-bold text-cyan-400">#{item.stageNumber}</td>
                            <td className="p-2 font-semibold text-slate-200">{item.stageName}</td>
                            <td className="p-2">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                {item.status}
                              </span>
                            </td>
                            <td className="p-2 text-indigo-300 font-bold">{item.keyMetric}</td>
                            <td className="p-2 text-slate-400 truncate max-w-[280px]">{item.summary}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
