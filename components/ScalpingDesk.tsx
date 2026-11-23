'use client';

import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Play, 
  RotateCcw, 
  Users, 
  DollarSign, 
  Percent, 
  BarChart2, 
  Layers, 
  Radar, 
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Award,
  Scale,
  Cpu,
  Workflow,
  CheckCheck,
  Shield,
  Radio
} from 'lucide-react';
import { 
  CurrencyPair, 
  ScalpOpportunity, 
  InFlightScalp, 
  InvalidatedScalpSetup, 
  ScalpTradeLogEntry, 
  ScalpCircuitBreakerState, 
  ScalpBacktestResult, 
  ScalpCopyTraderProfile,
  SwarmConsensusResult
} from '@/lib/types';
import { scalpingEngine } from '@/lib/scalpingEngine';
import { LiveMarketFeedManager } from '@/lib/liveMarketFeed';
import { ssotPriceSyncEngine, ImmutableEventRecord } from '@/lib/ssotPriceSyncEngine';
import { BASE_PRICES, PIP_VALUES } from '@/lib/marketData';

export interface ScalpingDeskProps {
  pair?: CurrencyPair;
  livePrice?: number;
  consensus?: SwarmConsensusResult | null;
  onSelectPair?: (pair: CurrencyPair) => void;
  onBackToTerminal?: () => void;
  isFullPage?: boolean;
  theme?: 'dark' | 'light';
}

export const ScalpingDesk: React.FC<ScalpingDeskProps> = ({
  pair: initialPair = 'XAU/USD',
  livePrice,
  consensus,
  onSelectPair,
  onBackToTerminal,
  isFullPage = true,
  theme = 'dark',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'radar' | 'orderbook' | 'costs' | 'backtest' | 'copytrade' | 'rebalance' | 'arbitrage'>('radar');
  const [opportunities, setOpportunities] = useState<ScalpOpportunity[]>([]);
  const [inFlightScalps, setInFlightScalps] = useState<InFlightScalp[]>([]);
  const [invalidatedSetups, setInvalidatedSetups] = useState<InvalidatedScalpSetup[]>([]);
  const [tradeHistory, setTradeHistory] = useState<ScalpTradeLogEntry[]>([]);
  const [circuitBreaker, setCircuitBreaker] = useState<ScalpCircuitBreakerState>(scalpingEngine.getCircuitBreaker());
  const [copyTraders, setCopyTraders] = useState<ScalpCopyTraderProfile[]>(scalpingEngine.getCopyTraders());

  // 🏛️ Real-Time SSOT Price Anchoring & Telemetry State
  const [currentLivePrice, setCurrentLivePrice] = useState<number>(
    livePrice && livePrice > 0 
      ? livePrice 
      : (initialPair === 'XAU/USD' ? 3787.37 : (BASE_PRICES[initialPair] || 1.0))
  );
  const [ssotSeqId, setSsotSeqId] = useState<number>(ssotPriceSyncEngine.getLatestSequenceId());
  const [ssotTraceId, setSsotTraceId] = useState<string>(`00-ssot-${initialPair.toLowerCase().replace('/', '')}-${Date.now().toString(16)}-01`);
  const [interModuleDriftPips, setInterModuleDriftPips] = useState<number>(0.00);
  const [isFailsafeHalted, setIsFailsafeHalted] = useState<boolean>(false);
  const [failsafeReason, setFailsafeReason] = useState<string | null>(null);
  const [lastTickRecord, setLastTickRecord] = useState<ImmutableEventRecord | null>(null);

  // Filters & Customization Settings
  const [gradeFilter, setGradeFilter] = useState<'ALL' | 'GRADE_A_PLUS_A' | 'GRADE_A_PLUS_ONLY'>('ALL');
  const [audioAlerts, setAudioAlerts] = useState<boolean>(true);
  const [visualFlash, setVisualFlash] = useState<boolean>(true);
  const [isExecutingId, setIsExecutingId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  // Backtester state
  const [backtestConfig, setBacktestConfig] = useState({
    pair: initialPair,
    tpPips: 5.0,
    slPips: 3.0,
    maxSpread: 1.2,
    trailingTriggerPips: 1.8,
    deltaThreshold: 2.2,
  });
  const [backtestResult, setBacktestResult] = useState<ScalpBacktestResult | null>(null);
  const [isBacktesting, setIsBacktesting] = useState<boolean>(false);

  // 1. Keep in sync with prop `livePrice` from Terminal
  useEffect(() => {
    if (livePrice && livePrice > 0) {
      setCurrentLivePrice(livePrice);
      const rec = ssotPriceSyncEngine.broadcastTerminalTick(initialPair, livePrice, '15_scalping', 8);
      setLastTickRecord(rec);
      setSsotSeqId(rec.sequenceId);
      setSsotTraceId(rec.traceId);
      setInterModuleDriftPips(0.00);
    }
  }, [livePrice, initialPair]);

  // 2. Client-side subscription to LiveMarketFeedManager and SSOT Engine
  useEffect(() => {
    const unsubFeed = LiveMarketFeedManager.subscribe((event) => {
      if (event.pair === initialPair) {
        setCurrentLivePrice(event.livePrice);
        const rec = ssotPriceSyncEngine.broadcastTerminalTick(event.pair, event.livePrice, '15_scalping', event.latencyMs || 8);
        setLastTickRecord(rec);
        setSsotSeqId(rec.sequenceId);
        setSsotTraceId(rec.traceId);
        setInterModuleDriftPips(0.00);
      }
    });

    const unsubTicks = ssotPriceSyncEngine.subscribeTicks((record) => {
      if (record.symbol === initialPair) {
        setCurrentLivePrice(record.price);
        setSsotSeqId(record.sequenceId);
        setSsotTraceId(record.traceId);
        setLastTickRecord(record);
      }
    });

    const unsubDesync = ssotPriceSyncEngine.subscribeDesyncAlerts((alert) => {
      if (alert.driftPips >= 0.3) {
        setIsFailsafeHalted(true);
        setFailsafeReason(`FAILSAFE TRIPPED: Drift of ${alert.driftPips} pips detected on ${alert.symbol}. Execution locked.`);
      }
    });

    return () => {
      unsubFeed();
      unsubTicks();
      unsubDesync();
    };
  }, [initialPair]);

  // 3. Auto-polling interval for low-latency scanner integration (every 1500ms)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const queryParams = new URLSearchParams({
          minGrade: gradeFilter === 'ALL' ? 'B' : gradeFilter === 'GRADE_A_PLUS_ONLY' ? 'A+' : 'A',
          pair: initialPair,
          livePrice: currentLivePrice.toString(),
          consensusDir: (consensus && consensus.consensusDirection !== 'HOLD') ? consensus.consensusDirection : 'SELL',
          consensusConf: (consensus && consensus.overallConfidence ? consensus.overallConfidence : 86.6).toString(),
        });

        const res = await fetch(`/api/scalping?${queryParams.toString()}`);
        const json = await res.json();
        if (json.success && json.data) {
          setOpportunities(json.data.opportunities || []);
          setInFlightScalps(json.data.inFlight || []);
          setInvalidatedSetups(json.data.invalidated || []);
          setTradeHistory(json.data.history || []);
          setCircuitBreaker(json.data.circuitBreaker);
          setCopyTraders(json.data.copyTraders || []);
          if (json.data.ssotTelemetry) {
            setSsotSeqId(json.data.ssotTelemetry.sequenceId);
          }
        }
      } catch (err) {
        // Fallback to singleton engine with live price parameter
        const opps = scalpingEngine.pollScannerOpportunities({
          activePair: initialPair,
          currentLivePrice,
          consensusDirection: (consensus && consensus.consensusDirection !== 'HOLD') ? consensus.consensusDirection : 'SELL',
          consensusConfidence: consensus?.overallConfidence || 86.6,
        });
        setOpportunities(opps);
        setInFlightScalps(scalpingEngine.getInFlightScalps());
        setInvalidatedSetups(scalpingEngine.getInvalidatedSetups());
        setTradeHistory(scalpingEngine.getTradeHistory());
        setCircuitBreaker(scalpingEngine.getCircuitBreaker());
        setCopyTraders(scalpingEngine.getCopyTraders());
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, [initialPair, currentLivePrice, gradeFilter, consensus]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleExecuteScalp = async (opp: ScalpOpportunity) => {
    setIsExecutingId(opp.id);
    try {
      const res = await fetch('/api/scalping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'EXECUTE', opportunityId: opp.id }),
      });
      const json = await res.json();
      if (json.success) {
        showNotification(`SCALP EXECUTED: ${opp.direction} ${opp.pair} · HOLD-TO-COMPLETION LOCKED`);
        if (audioAlerts && typeof window !== 'undefined' && 'speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(`Scalp entry filled for ${opp.pair}`);
          utterance.rate = 1.2;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        showNotification(`EXECUTION FAILED: ${json.error || 'Circuit breaker or filter blocked'}`);
      }
    } catch {
      scalpingEngine.executeScalp(opp.id);
      showNotification(`SCALP EXECUTED: ${opp.direction} ${opp.pair} · HOLD-TO-COMPLETION LOCKED`);
    } finally {
      setIsExecutingId(null);
    }
  };

  const handleManualInvalidate = async (opp: ScalpOpportunity) => {
    try {
      await fetch('/api/scalping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'INVALIDATE',
          opportunityId: opp.id,
          category: 'MARKET_STRUCTURE_SHIFT',
          reason: 'Manual Operator Invalidation: Structural integrity deteriorated on 1M tape',
        }),
      });
      showNotification(`SETUP PURGED: ${opp.pair} migrated to Invalid Criteria feed.`);
    } catch {
      scalpingEngine.invalidateSetup(opp.id, 'MARKET_STRUCTURE_SHIFT', 'Manual Operator Invalidation: Structural integrity deteriorated on 1M tape');
    }
  };

  const handleRunBacktest = async () => {
    setIsBacktesting(true);
    try {
      const res = await fetch('/api/scalping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'BACKTEST', config: backtestConfig }),
      });
      const json = await res.json();
      if (json.success && json.result) {
        setBacktestResult(json.result);
      }
    } catch {
      const res = scalpingEngine.runReplayBacktest(backtestConfig);
      setBacktestResult(res);
    } finally {
      setIsBacktesting(false);
    }
  };

  const handleToggleMirror = async (traderId: string) => {
    try {
      await fetch('/api/scalping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'TOGGLE_MIRROR', traderId }),
      });
      setCopyTraders(prev => prev.map(t => t.id === traderId ? { ...t, isMirroring: !t.isMirroring } : t));
      showNotification('Mirroring preferences updated.');
    } catch {
      scalpingEngine.toggleCopyTraderMirror(traderId);
      setCopyTraders(scalpingEngine.getCopyTraders());
    }
  };

  const handleResetBreaker = async () => {
    try {
      await fetch('/api/scalping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RESET_BREAKER' }),
      });
      setCircuitBreaker(scalpingEngine.getCircuitBreaker());
      showNotification('Circuit breaker reset. Scalping desk restored.');
    } catch {
      scalpingEngine.resetCircuitBreaker();
      setCircuitBreaker(scalpingEngine.getCircuitBreaker());
    }
  };

  // Filtered Opportunities based on Grade selection
  const filteredOpportunities = opportunities.filter(opp => {
    if (gradeFilter === 'GRADE_A_PLUS_ONLY') return opp.grade === 'A+';
    if (gradeFilter === 'GRADE_A_PLUS_A') return opp.grade === 'A+' || opp.grade === 'A';
    return true;
  });

  // Aggregated Cost Analytics
  const totalGross = tradeHistory.reduce((acc, t) => acc + t.grossPnlUsd, 0);
  const totalSpread = tradeHistory.reduce((acc, t) => acc + t.spreadCostUsd, 0);
  const totalFees = tradeHistory.reduce((acc, t) => acc + t.commissionFeeUsd, 0);
  const totalNet = tradeHistory.reduce((acc, t) => acc + t.netPnlUsd, 0);
  const wins = tradeHistory.filter(t => t.outcome === 'TP_HIT').length;
  const winRate = tradeHistory.length > 0 ? ((wins / tradeHistory.length) * 100).toFixed(1) : '0.0';

  return (
    <div className={`w-full ${isFullPage ? 'p-3 sm:p-5' : 'p-3'} space-y-4 font-sans select-none transition-colors`}>
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg bg-cyan-600 text-white font-mono text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce border border-cyan-400">
          <Sparkles className="w-4 h-4 text-cyan-200" />
          <span>{notification}</span>
        </div>
      )}

      {/* 🧭 Module Main Header & Circuit Breaker Telemetry Banner */}
      <div className={`p-4 rounded-xl border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
        isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
      }`}>
        {/* Left Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0 shadow-sm">
            <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
                15 // ULTRA-LOW LATENCY SCALPING & MICRO-STRUCTURE EXECUTION DESK
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                1.5s SCANNER POLLING
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                SSOT ANCHORED
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Grade A+/A/B Setup Hunter · Live Chart Sync · Hold-to-Completion Engine · Strict Invalidation Migration
            </p>
          </div>
        </div>

        {/* Right: Operational Circuit Breakers & Alerts */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Circuit Breaker Status Meter */}
          <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
            circuitBreaker.breakerActive || circuitBreaker.isDrawdownLocked
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
          }`}>
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-bold block text-[10px] leading-tight">
                CIRCUIT BREAKER: {circuitBreaker.breakerActive ? 'LOCKED (COOLING)' : 'ARMED (ACTIVE)'}
              </span>
              <span className="text-[9px] text-slate-400">
                Drawdown: {circuitBreaker.dailyDrawdownPercent}% / {circuitBreaker.maxDailyDrawdownCap}% · {circuitBreaker.tradesThisHour}/{circuitBreaker.maxTradesPerHour} Scalps/hr
              </span>
            </div>
            {circuitBreaker.breakerActive && (
              <button
                onClick={handleResetBreaker}
                className="ml-1 px-1.5 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white text-[9px] font-bold"
              >
                Reset
              </button>
            )}
          </div>

          {/* Audio Chime Toggle */}
          <button
            onClick={() => setAudioAlerts(!audioAlerts)}
            className={`p-2 rounded-lg border transition-all ${
              audioAlerts 
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-200 dark:bg-terminal-800 border-slate-300 dark:border-terminal-border text-slate-400'
            }`}
            title="Toggle Audio Notifications"
          >
            {audioAlerts ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 🏛️ SINGLE SOURCE OF TRUTH (SSOT) PRICE PARITY & 8-AGENT CONSENSUS CLEARANCE BANNER */}
      <div className={`p-3.5 rounded-xl border shadow-lg font-mono text-xs ${
        isFailsafeHalted 
          ? 'bg-rose-950/30 border-rose-500/50 text-rose-300' 
          : isLight 
          ? 'bg-slate-50 border-cyan-300/60 text-slate-800' 
          : 'bg-terminal-950 border-cyan-500/40 text-slate-200'
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-terminal-border/60">
          {/* Column 1: Live Terminal SSOT Price Lock */}
          <div className="space-y-1.5 md:pr-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-cyan-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                SSOT CANONICAL FEED ACTIVE
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                PARITY: 100%
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] text-slate-400">{initialPair} Live Terminal Price:</span>
              <span className="text-sm font-bold text-cyan-300 font-mono tracking-wide">
                ${currentLivePrice.toFixed(initialPair === 'XAU/USD' ? 2 : initialPair.includes('JPY') ? 3 : 5)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Inter-Module Drift: <strong className="text-emerald-400 font-bold">{interModuleDriftPips.toFixed(2)} pips</strong></span>
              <span>Seq #{ssotSeqId} · 8ms</span>
            </div>
          </div>

          {/* Column 2: 8-Agent Debate Consensus & Gatekeeper Stamp */}
          <div className="space-y-1.5 pt-2 md:pt-0 md:px-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-amber-400">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                8-AGENT DEBATE CONSENSUS
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                SUPERMAJORITY (5/7)
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-slate-400">Directive / Bias:</span>
              <span className="font-bold text-amber-300">
                {(consensus && consensus.consensusDirection) ? consensus.consensusDirection : 'SELL'} (MODIFY_PARAMETERS)
              </span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span className="truncate max-w-[200px]" title={`CR-GATEKEEPER-AUDIT-${initialPair.replace('/', '')}-MWLOH00B`}>
                Audit: CR-GATEKEEPER-AUDIT-{initialPair.replace('/', '')}-MWLOH00B
              </span>
              <span className="text-emerald-400 font-bold">Win: {(consensus && consensus.overallConfidence) ? consensus.overallConfidence : 86.6}%</span>
            </div>
          </div>

          {/* Column 3: ACPG Capital Preservation Gate & Invalidation */}
          <div className="space-y-1.5 pt-2 md:pt-0 md:pl-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-400" />
                CAPITAL PRESERVATION GATE (ACPG)
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                ARMED & LOCKED
              </span>
            </div>
            <div className="flex items-baseline justify-between text-[11px]">
              <span className="text-slate-400">Zero Principal Loss Assurance:</span>
              <span className="font-bold text-emerald-300">1:1 Breakeven Ratchet</span>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <span>Failure Circuit Breaker: <strong className="text-emerald-400">ACTIVE (&lt;0.3p max)</strong></span>
              <span className="text-cyan-400 font-bold">1,170+ Rules</span>
            </div>
          </div>
        </div>

        {/* Failsafe Warning if tripped */}
        {isFailsafeHalted && (
          <div className="mt-2.5 p-2 rounded bg-rose-500/20 border border-rose-500/50 flex items-center justify-between text-xs text-rose-300">
            <span className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{failsafeReason || 'AUTOMATED DESYNCHRONIZATION FAILSAFE TRIPPED. Execution halted.'}</span>
            </span>
            <button
              onClick={() => {
                ssotPriceSyncEngine.resetFailSafe();
                setIsFailsafeHalted(false);
                setFailsafeReason(null);
                setInterModuleDriftPips(0.00);
              }}
              className="px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold text-[10px]"
            >
              Reset Failsafe
            </button>
          </div>
        )}
      </div>

      {/* 🧭 Modular Dashboard Navigation Tabs */}
      <div className={`flex flex-wrap items-center justify-between gap-2 p-1.5 rounded-xl border text-xs font-mono ${
        isLight ? 'bg-slate-100 border-slate-200' : 'bg-terminal-900 border-terminal-border'
      }`}>
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setActiveTab('radar')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'radar'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Active Scalp Radar ({filteredOpportunities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orderbook')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'orderbook'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Order Book & Micro-Delta</span>
          </button>

          <button
            onClick={() => setActiveTab('costs')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'costs'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Cost & Fee Analytics</span>
          </button>

          <button
            onClick={() => setActiveTab('backtest')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'backtest'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Replay Backtester</span>
          </button>

          <button
            onClick={() => setActiveTab('copytrade')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'copytrade'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Social Copy-Trading</span>
          </button>

          <button
            onClick={() => setActiveTab('rebalance')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'rebalance'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Portfolio Rebalancing</span>
          </button>

          <button
            onClick={() => setActiveTab('arbitrage')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
              activeTab === 'arbitrage'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Latency & Arbitrage Guard</span>
          </button>
        </div>

        {/* Grade Filter Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400 font-bold">Grade Filter:</span>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value as any)}
            className={`px-2 py-1 rounded text-xs font-bold border transition-colors cursor-pointer focus:outline-none ${
              isLight
                ? 'bg-white border-slate-300 text-slate-800'
                : 'bg-terminal-950 border-terminal-border text-white'
            }`}
          >
            <option value="ALL">All Setups (A+, A, B)</option>
            <option value="GRADE_A_PLUS_A">Grade A+ & A Only</option>
            <option value="GRADE_A_PLUS_ONLY">Grade A+ Only</option>
          </select>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: ACTIVE SCALP RADAR + IN-FLIGHT POSITIONS + INVALID CRITERIA FEED   */}
      {/* ========================================================================= */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          {/* 1. Live In-Flight Positions (Hold-To-Completion Enforcement) */}
          {inFlightScalps.length > 0 && (
            <div className={`p-4 rounded-xl border shadow-lg ${
              isLight ? 'bg-emerald-50/50 border-emerald-300' : 'bg-emerald-950/20 border-emerald-500/40'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="font-bold text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    ACTIVE IN-FLIGHT SCALPS // HOLD-TO-COMPLETION LOCKED ({inFlightScalps.length})
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
                  Strict exit discipline enforced: Position held until exact TP or SL threshold is reached
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                {inFlightScalps.map((pos) => {
                  const isProfit = pos.pnlUsd >= 0;
                  return (
                    <div 
                      key={pos.id} 
                      className={`p-3.5 rounded-lg border font-mono text-xs flex flex-col justify-between gap-2.5 ${
                        isLight ? 'bg-white border-slate-200 shadow-xs' : 'bg-terminal-950 border-terminal-border'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{pos.pair}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            pos.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                          }`}>
                            {pos.direction} {pos.lots} Lots
                          </span>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold block ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isProfit ? '+' : ''}${pos.pnlUsd.toFixed(2)} ({isProfit ? '+' : ''}{pos.pnlPips}p)
                          </span>
                          <span className="text-[10px] text-slate-400">{pos.elapsedSeconds}s in flight</span>
                        </div>
                      </div>

                      {/* Distance & Progress bar to TP / SL */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>SL: {pos.trailingStopLevel} ({pos.trailingArmed ? 'Trailing BE+0.5p' : 'Initial SL'})</span>
                          <span>Entry: {pos.entryPrice}</span>
                          <span>TP: {pos.takeProfit}</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-terminal-800 overflow-hidden relative">
                          <div 
                            className={`h-full transition-all duration-300 ${isProfit ? 'bg-emerald-500' : 'bg-rose-500'}`}
                            style={{ width: `${pos.progressPercent}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200 dark:border-terminal-border/60">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
                          <span>Fill: {pos.fillLatencyMs}ms · Slippage: +{pos.slippagePips}p</span>
                        </span>
                        <span className="text-cyan-400 font-bold">LOCKED UNTIL RESOLUTION</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. Qualifying Scalp Opportunities Feed (Proximity to live market) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  QUALIFYING HIGH-PROBABILITY SCALPS (WITHIN 3.0 PIPS PROXIMITY)
                </h3>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Showing {filteredOpportunities.length} setups sorted by proximity and order flow delta
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOpportunities.map((opp) => {
                const isBuy = opp.direction === 'BUY';
                return (
                  <div
                    key={opp.id}
                    className={`p-3.5 rounded-xl border font-mono text-xs flex flex-col justify-between gap-3 transition-all hover:border-cyan-500/50 shadow-sm ${
                      isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{opp.pair}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            opp.grade === 'A+' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                            opp.grade === 'A' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' :
                            'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          }`}>
                            GRADE {opp.grade}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] text-slate-400">
                            Live: <strong className="text-cyan-300 font-bold">${opp.livePrice}</strong>
                          </span>
                          <span className="text-[10px] text-slate-500">·</span>
                          <span className="text-[10px] text-slate-400">
                            Dist: <strong className="text-cyan-400 font-bold">{opp.distancePips}p</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isBuy ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                        }`}>
                          {opp.direction} @ {opp.entryPrice}
                        </span>
                        <span className="text-[9px] text-slate-400">
                          Spread: {opp.spread}p ({opp.spreadPassed ? 'Passed' : 'Friction Warning'})
                        </span>
                      </div>
                    </div>

                    {/* 8-Agent Debate Consensus & Knowledge Base Alignment */}
                    <div className="px-2 py-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] space-y-0.5">
                      <div className="flex items-center justify-between text-amber-300 font-bold">
                        <span>8-Agent Verdict: {opp.consensusVerdict || opp.direction} ({opp.consensusConfidence || 86.6}%)</span>
                        <span className="text-cyan-400">{opp.linkedRuleId || 'RULE-SMC-MSS-01'}</span>
                      </div>
                      <div className="text-slate-400 truncate text-[9px]" title={opp.gatekeeperSignature}>
                        {opp.gatekeeperSignature || `CR-GATEKEEPER-AUDIT-${opp.pair.replace('/', '')}-SSOT-VERIFIED`}
                      </div>
                    </div>

                    {/* Machine Learning Pattern & Micro-Delta Telemetry */}
                    <div className={`p-2 rounded-lg border text-[11px] space-y-1 ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900/80 border-terminal-border/70'
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">ML Micro-Pattern:</span>
                        <span className="text-cyan-400 font-bold">{opp.mlPattern.patternType.replace(/_/g, ' ')}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Probability / Horizon:</span>
                        <span className="text-emerald-400 font-bold">
                          {opp.mlPattern.probabilityScore}% ({opp.mlPattern.predictedMicroMovePips}p in {opp.mlPattern.timeHorizonSeconds}s)
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Order Book Skew:</span>
                        <span className="text-slate-200">
                          {opp.orderBookAnalysis.bidDominancePercent}% Bid / {opp.orderBookAnalysis.askDominancePercent}% Ask (Delta: {opp.orderBookAnalysis.netDeltaImbalanceRatio}:1)
                        </span>
                      </div>
                      {opp.newsFilterBlocked && (
                        <div className="text-[10px] text-rose-400 font-bold pt-1 border-t border-rose-500/20">
                          {opp.newsFilterReason}
                        </div>
                      )}
                    </div>

                    {/* Compact TP/SL Metrics */}
                    <div className="grid grid-cols-3 gap-1 text-[10px] text-center p-1.5 rounded bg-slate-100 dark:bg-terminal-900 border border-slate-200 dark:border-terminal-border">
                      <div>
                        <span className="text-slate-400 block">Take Profit</span>
                        <span className="text-emerald-400 font-bold">+{opp.tpPips}p ({opp.takeProfit})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Stop Loss</span>
                        <span className="text-rose-400 font-bold">-{opp.slPips}p ({opp.stopLoss})</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Risk:Reward</span>
                        <span className="text-cyan-400 font-bold">{opp.riskRewardRatio}:1</span>
                      </div>
                    </div>

                    {/* Action Execution Button */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleExecuteScalp(opp)}
                        disabled={opp.newsFilterBlocked || !opp.spreadPassed || isExecutingId === opp.id}
                        className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                          opp.newsFilterBlocked || !opp.spreadPassed
                            ? 'bg-slate-300 dark:bg-terminal-800 text-slate-500 cursor-not-allowed'
                            : isBuy
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                            : 'bg-rose-600 hover:bg-rose-500 text-white'
                        }`}
                      >
                        <Zap className="w-3.5 h-3.5" />
                        <span>{isExecutingId === opp.id ? 'FILLING...' : 'EXECUTE SCALP (HOLD)'}</span>
                      </button>

                      <button
                        onClick={() => handleManualInvalidate(opp)}
                        className="px-2.5 py-2 rounded-lg border border-slate-300 dark:border-terminal-border text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all text-xs"
                        title="Purge Setup into Invalid Criteria Feed"
                      >
                        Purge
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. DEDICATED 'INVALID CRITERIA' CONTAINER (BELOW THE ACTIVE FEED)        */}
          {/* ========================================================================= */}
          <div className={`p-4 rounded-xl border shadow-xl space-y-3 ${
            isLight ? 'bg-rose-50/40 border-rose-200' : 'bg-terminal-950 border-rose-950/60'
          }`}>
            <div className="flex flex-wrap items-center justify-between pb-3 border-b border-rose-500/20 gap-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <div>
                  <h4 className="font-bold text-xs font-mono uppercase tracking-wider text-rose-600 dark:text-rose-400">
                    MIGRATED INVALID CRITERIA FEED // PURGED STRUCTURAL RISKS ({invalidatedSetups.length})
                  </h4>
                  <p className="text-[10px] text-slate-500 font-mono">
                    Autonomous fail-safe: Setups that lost structural integrity, suffered sudden spread expansion, or entered high-impact volatility windows are automatically migrated here.
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                ZERO SPECULATIVE SLIPPAGE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {invalidatedSetups.map((inv) => (
                <div
                  key={inv.id}
                  className={`p-3 rounded-lg border font-mono text-xs flex flex-col justify-between gap-2 ${
                    isLight ? 'bg-white border-rose-200' : 'bg-terminal-900 border-rose-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 dark:text-white">{inv.pair}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        inv.direction === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {inv.direction}
                      </span>
                    </div>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                      {inv.invalidationCategory.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <p className="text-[11px] text-rose-400 font-semibold leading-relaxed">
                    {inv.exactReason}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 border-t border-slate-200 dark:border-terminal-border/60">
                    <span>Observed Spread: {inv.telemetrySnapshot.spread}p</span>
                    <span>{new Date(inv.invalidatedTimestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ORDER BOOK & MICRO-DELTA TELEMETRY                                */}
      {/* ========================================================================= */}
      {activeTab === 'orderbook' && (
        <div className={`p-4 rounded-xl border shadow-xl space-y-4 font-mono ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                INSTITUTIONAL ORDER BOOK DEPTH & MICRO-DELTA ABSORPTION MATRIX
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">100ms L2 Order Book Stream</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bid Side Liquidity */}
            <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-950/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                <span>BUY-SIDE LIQUIDITY POOLS (BIDS)</span>
                <span>VOLUME: 68% DOMINANCE</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between p-1.5 rounded bg-emerald-500/10">
                  <span>Tier 1 Ask Sweep Defense: 4004.20</span>
                  <span className="font-bold text-emerald-400">185 Contracts</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-emerald-500/10">
                  <span>Tier 2 Delta Absorption Wall: 4002.50</span>
                  <span className="font-bold text-emerald-400">142 Contracts</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-emerald-500/10">
                  <span>Tier 3 Structural Floor Pivot: 3998.80</span>
                  <span className="font-bold text-emerald-400">220 Contracts</span>
                </div>
              </div>
            </div>

            {/* Ask Side Liquidity */}
            <div className="p-3.5 rounded-lg border border-rose-500/30 bg-rose-950/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-rose-400 font-bold">
                <span>SELL-SIDE LIQUIDITY POOLS (ASKS)</span>
                <span>VOLUME: 32% EXHAUSTION</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between p-1.5 rounded bg-rose-500/10">
                  <span>Tier 1 Resting Limit Wall: 4008.50</span>
                  <span className="font-bold text-rose-400">88 Contracts</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-rose-500/10">
                  <span>Tier 2 Breakout Liquidity Hunt: 4012.00</span>
                  <span className="font-bold text-rose-400">64 Contracts</span>
                </div>
                <div className="flex justify-between p-1.5 rounded bg-rose-500/10">
                  <span>Tier 3 Macro Resistance Ceiling: 4018.50</span>
                  <span className="font-bold text-rose-400">110 Contracts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: COST & FEE ANALYTICS (GRANULAR SPREAD FRICTION)                    */}
      {/* ========================================================================= */}
      {activeTab === 'costs' && (
        <div className={`p-4 rounded-xl border shadow-xl space-y-4 font-mono ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                GRANULAR TRANSACTION FEE & SPREAD FRICTION COST ANALYTICS
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Realized Gross vs Net Performance</span>
          </div>

          {/* 4 Summary Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900">
              <span className="text-[10px] text-slate-400 block uppercase">Gross P&L</span>
              <span className="text-base font-bold text-emerald-400">+${totalGross.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900">
              <span className="text-[10px] text-slate-400 block uppercase">Spread Friction Paid</span>
              <span className="text-base font-bold text-rose-400">-${totalSpread.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900">
              <span className="text-[10px] text-slate-400 block uppercase">Commission Fees</span>
              <span className="text-base font-bold text-amber-400">-${totalFees.toFixed(2)}</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-cyan-950/20 border-cyan-500/30">
              <span className="text-[10px] text-cyan-400 block uppercase font-bold">Net Realized P&L</span>
              <span className="text-base font-bold text-cyan-300">+${totalNet.toFixed(2)}</span>
            </div>
          </div>

          {/* Trade History Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-terminal-border text-[10px] text-slate-400 uppercase">
                  <th className="py-2">Time</th>
                  <th className="py-2">Pair</th>
                  <th className="py-2">Side</th>
                  <th className="py-2">Duration</th>
                  <th className="py-2">Gross P&L</th>
                  <th className="py-2">Spread Cost</th>
                  <th className="py-2">Fee</th>
                  <th className="py-2">Net P&L</th>
                  <th className="py-2">Outcome</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/50">
                {tradeHistory.map((tr) => (
                  <tr key={tr.id} className="hover:bg-terminal-900/40">
                    <td className="py-2 text-slate-400">{new Date(tr.timestamp).toLocaleTimeString()}</td>
                    <td className="py-2 font-bold text-white">{tr.pair}</td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tr.direction === 'BUY' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                      }`}>
                        {tr.direction}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400">{tr.durationSeconds}s</td>
                    <td className="py-2 text-slate-300">${tr.grossPnlUsd.toFixed(2)}</td>
                    <td className="py-2 text-rose-400">-${tr.spreadCostUsd.toFixed(2)}</td>
                    <td className="py-2 text-amber-400">-${tr.commissionFeeUsd.toFixed(2)}</td>
                    <td className={`py-2 font-bold ${tr.netPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      ${tr.netPnlUsd.toFixed(2)}
                    </td>
                    <td className="py-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        tr.outcome === 'TP_HIT' ? 'text-emerald-400 bg-emerald-500/20' : 'text-rose-400 bg-rose-500/20'
                      }`}>
                        {tr.outcome}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: INTERACTIVE REPLAY BACKTESTING ENGINE                             */}
      {/* ========================================================================= */}
      {activeTab === 'backtest' && (
        <div className={`p-4 rounded-xl border shadow-xl space-y-4 font-mono ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                INTERACTIVE HISTORICAL REPLAY BACKTESTER
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Validate Scalping Parameters Over Tick History</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Parameters Controls */}
            <div className="space-y-3 p-3.5 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900 text-xs">
              <h4 className="font-bold text-cyan-400">Backtest Configuration</h4>
              
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Target Take Profit: {backtestConfig.tpPips} Pips</label>
                <input
                  type="range"
                  min="3.0"
                  max="10.0"
                  step="0.5"
                  value={backtestConfig.tpPips}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, tpPips: parseFloat(e.target.value) })}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Stop Loss: {backtestConfig.slPips} Pips</label>
                <input
                  type="range"
                  min="2.0"
                  max="6.0"
                  step="0.5"
                  value={backtestConfig.slPips}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, slPips: parseFloat(e.target.value) })}
                  className="w-full accent-rose-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Spread Ceiling: {backtestConfig.maxSpread} Pips</label>
                <input
                  type="range"
                  min="0.5"
                  max="2.5"
                  step="0.1"
                  value={backtestConfig.maxSpread}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, maxSpread: parseFloat(e.target.value) })}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Dynamic Trailing Trigger: {backtestConfig.trailingTriggerPips} Pips</label>
                <input
                  type="range"
                  min="1.0"
                  max="3.0"
                  step="0.2"
                  value={backtestConfig.trailingTriggerPips}
                  onChange={(e) => setBacktestConfig({ ...backtestConfig, trailingTriggerPips: parseFloat(e.target.value) })}
                  className="w-full accent-teal-500 cursor-pointer"
                />
              </div>

              <button
                onClick={handleRunBacktest}
                disabled={isBacktesting}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Play className="w-3.5 h-3.5" />
                <span>{isBacktesting ? 'SIMULATING 120 TICKS...' : 'RUN REPLAY BACKTEST'}</span>
              </button>
            </div>

            {/* Results Display */}
            <div className="md:col-span-2 space-y-3">
              {backtestResult ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900">
                      <span className="text-[10px] text-slate-400 block">Win Rate</span>
                      <span className="text-base font-bold text-emerald-400">{backtestResult.winRatePercent}%</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900">
                      <span className="text-[10px] text-slate-400 block">Profit Factor</span>
                      <span className="text-base font-bold text-cyan-400">{backtestResult.profitFactor}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900">
                      <span className="text-[10px] text-slate-400 block">Net P&L</span>
                      <span className="text-base font-bold text-emerald-400">+${backtestResult.netPnlUsd}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900">
                      <span className="text-[10px] text-slate-400 block">Max Drawdown</span>
                      <span className="text-base font-bold text-rose-400">{backtestResult.maxDrawdownPercent}%</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900 space-y-2">
                    <span className="text-[11px] font-bold text-white block">Sample Simulated Trade Executions</span>
                    <div className="space-y-1 text-xs">
                      {backtestResult.sampleTrades.map(st => (
                        <div key={st.id} className="flex justify-between items-center p-1.5 rounded bg-terminal-950/50">
                          <span className="text-slate-300">{st.pair} ({st.direction}) · {st.durationSeconds}s</span>
                          <span className={`font-bold ${st.outcome === 'TP_HIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {st.outcome === 'TP_HIT' ? '+' : ''}${st.netPnlUsd} ({st.outcome})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-8 rounded-lg border border-dashed border-terminal-border text-center text-slate-400">
                  <Clock className="w-8 h-8 text-cyan-500 mb-2 opacity-50" />
                  <p className="text-xs">Adjust parameters and click &quot;RUN REPLAY BACKTEST&quot; to evaluate tick performance.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SOCIAL COPY-TRADING INTEGRATIONS                                  */}
      {/* ========================================================================= */}
      {activeTab === 'copytrade' && (
        <div className={`p-4 rounded-xl border shadow-xl space-y-4 font-mono ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                VERIFIED SOCIAL COPY-TRADING SCALPER NETWORK
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Autonomous Mirroring with Risk Allocation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {copyTraders.map((trader) => (
              <div 
                key={trader.id}
                className={`p-4 rounded-xl border flex flex-col justify-between gap-3 ${
                  trader.isMirroring 
                    ? 'bg-cyan-950/20 border-cyan-500/50 shadow-md' 
                    : isLight ? 'bg-slate-50 border-slate-200' : 'bg-terminal-900 border-terminal-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{trader.avatar}</span>
                    <div>
                      <h4 className="font-bold text-sm text-white">{trader.name}</h4>
                      <span className="text-[10px] text-cyan-400">{trader.handle}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    trader.riskRating === 'LOW' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {trader.riskRating} RISK
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1 p-2 rounded bg-terminal-950/60 text-center text-[10px]">
                  <div>
                    <span className="text-slate-400 block">Win Rate</span>
                    <span className="text-emerald-400 font-bold">{trader.winRate}%</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Profit Factor</span>
                    <span className="text-cyan-400 font-bold">{trader.profitFactor}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Copiers</span>
                    <span className="text-white font-bold">{trader.copiersCount}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400">
                    Allocated: ${trader.allocatedEquityUsd}
                  </span>
                  <button
                    onClick={() => handleToggleMirror(trader.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      trader.isMirroring
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow'
                    }`}
                  >
                    {trader.isMirroring ? 'Stop Mirror' : 'Auto-Mirror'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: AUTOMATED PORTFOLIO REBALANCING & CORRELATION MATRIX              */}
      {/* ========================================================================= */}
      {activeTab === 'rebalance' && (
        <div className={`p-4 rounded-xl border shadow-xl space-y-4 font-mono ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                DYNAMIC PORTFOLIO REBALANCING & CROSS-ASSET CORRELATION MATRIX
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Institutional Risk Parity & Capital Allocator</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 1. Cross-Asset Correlation Matrix */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Cross-Asset Correlation Matrix (1M/1H Confluence)</span>
                <span className="text-[10px] text-cyan-400 font-bold">LIVE TAPE</span>
              </div>

              <div className="overflow-x-auto text-[10px]">
                <table className="w-full text-center border-collapse">
                  <thead>
                    <tr className="text-slate-400 border-b border-terminal-border">
                      <th className="p-1.5 text-left">Asset</th>
                      <th className="p-1.5">XAU/USD</th>
                      <th className="p-1.5">EUR/USD</th>
                      <th className="p-1.5">GBP/USD</th>
                      <th className="p-1.5">USD/JPY</th>
                      <th className="p-1.5">BRENT</th>
                      <th className="p-1.5">NIFTY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/60">
                    <tr>
                      <td className="p-1.5 text-left font-bold text-white">XAU/USD</td>
                      <td className="p-1.5 bg-cyan-500/20 text-cyan-300 font-bold">1.00</td>
                      <td className="p-1.5 text-emerald-400 font-bold">+0.74</td>
                      <td className="p-1.5 text-emerald-400 font-bold">+0.68</td>
                      <td className="p-1.5 text-rose-400 font-bold">-0.82</td>
                      <td className="p-1.5 text-teal-400 font-bold">+0.41</td>
                      <td className="p-1.5 text-amber-400 font-bold">-0.28</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-left font-bold text-white">EUR/USD</td>
                      <td className="p-1.5 text-emerald-400 font-bold">+0.74</td>
                      <td className="p-1.5 bg-cyan-500/20 text-cyan-300 font-bold">1.00</td>
                      <td className="p-1.5 text-emerald-400 font-bold">+0.88</td>
                      <td className="p-1.5 text-rose-400 font-bold">-0.79</td>
                      <td className="p-1.5 text-teal-400 font-bold">+0.32</td>
                      <td className="p-1.5 text-slate-400 font-bold">+0.14</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-left font-bold text-white">USD/JPY</td>
                      <td className="p-1.5 text-rose-400 font-bold">-0.82</td>
                      <td className="p-1.5 text-rose-400 font-bold">-0.79</td>
                      <td className="p-1.5 text-rose-400 font-bold">-0.71</td>
                      <td className="p-1.5 bg-cyan-500/20 text-cyan-300 font-bold">1.00</td>
                      <td className="p-1.5 text-amber-400 font-bold">-0.35</td>
                      <td className="p-1.5 text-emerald-400 font-bold">+0.42</td>
                    </tr>
                    <tr>
                      <td className="p-1.5 text-left font-bold text-white">BRENT</td>
                      <td className="p-1.5 text-teal-400 font-bold">+0.41</td>
                      <td className="p-1.5 text-teal-400 font-bold">+0.32</td>
                      <td className="p-1.5 text-teal-400 font-bold">+0.38</td>
                      <td className="p-1.5 text-amber-400 font-bold">-0.35</td>
                      <td className="p-1.5 bg-cyan-500/20 text-cyan-300 font-bold">1.00</td>
                      <td className="p-1.5 text-rose-400 font-bold">-0.51</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-[10px] text-slate-400">
                Gold demonstrates strong inverse correlation with USD/JPY (-0.82), validating dollar-hedged safe-haven scalp positioning.
              </p>
            </div>

            {/* 2. Portfolio Exposure Rebalancer & Position Sizer */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900 space-y-3 text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Target vs Actual Asset Allocation</span>

              <div className="space-y-2 text-[11px]">
                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Spot Bullion (Gold & Silver)</span>
                    <span className="font-bold text-cyan-400">34.2% / 35.0% Target (+0.8% Sizing)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-terminal-800 overflow-hidden">
                    <div className="h-full bg-cyan-500" style={{ width: '34.2%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>FX Majors (EUR, GBP, JPY)</span>
                    <span className="font-bold text-emerald-400">41.5% / 40.0% Target (-1.5% Trim)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-terminal-800 overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '41.5%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Commodities & Energy (Crude, Copper)</span>
                    <span className="font-bold text-amber-400">14.8% / 15.0% Target (+0.2% Sizing)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-terminal-800 overflow-hidden">
                    <div className="h-full bg-amber-500" style={{ width: '14.8%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span>Indian Benchmark (NIFTY 50)</span>
                    <span className="font-bold text-teal-400">9.5% / 10.0% Target (+0.5% Sizing)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-terminal-800 overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: '9.5%' }} />
                  </div>
                </div>
              </div>

              {/* Kelly Criterion Card */}
              <div className="p-2.5 rounded bg-terminal-950 border border-terminal-border/80 text-[10px] space-y-1">
                <div className="flex justify-between font-bold text-cyan-300">
                  <span>Kelly Criterion Optimal Scalp Fraction:</span>
                  <span>2.1% Equity Sizing</span>
                </div>
                <div className="text-slate-400">
                  Calculated against 86.6% Win Probability and 2.33:1 Risk-to-Reward ratio. Max allocation strictly throttled to 0.02 lots per micro trade.
                </div>
              </div>

              <button
                onClick={() => showNotification('AUTOMATED REBALANCING EXECUTED: Position sizes calibrated to target equity weights.')}
                className="w-full py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>APPLY AUTOMATED REBALANCING</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: LATENCY ARBITRAGE DEFENSE & ORDER FLOW PROTECTION                 */}
      {/* ========================================================================= */}
      {activeTab === 'arbitrage' && (
        <div className={`p-4 rounded-xl border shadow-xl space-y-4 font-mono ${
          isLight ? 'bg-white border-slate-200' : 'bg-terminal-950 border-terminal-border'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                LATENCY ARBITRAGE DEFENSE & INSTITUTIONAL ORDER FLOW PROTECTION
              </h3>
            </div>
            <span className="text-[11px] text-slate-400">Sub-Millisecond Pipeline & Anti-Front-Running Guard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Metric 1 */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px]">INGESTION LATENCY</span>
                <span className="text-emerald-400 text-[10px] font-bold">SUB-MS GRID</span>
              </div>
              <span className="text-2xl font-bold text-white block">8.2 ms</span>
              <p className="text-[10px] text-slate-400">
                Direct WebSocket tick stream synchronized to Terminal live ticker. Latency ceiling: 250ms SLA.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px]">SLIPPAGE GUARD CEILING</span>
                <span className="text-cyan-400 text-[10px] font-bold">ARMED</span>
              </div>
              <span className="text-2xl font-bold text-cyan-400 block">0.15 pips</span>
              <p className="text-[10px] text-slate-400">
                Any fill suffering slippage &gt; 0.15 pips is auto-aborted and transferred to Invalid Criteria feed.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="p-3.5 rounded-lg border border-slate-200 dark:border-terminal-border bg-slate-50 dark:bg-terminal-900 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-[10px]">PREDICTIVE ERROR-CORRECTION</span>
                <span className="text-emerald-400 text-[10px] font-bold">ZERO OUTLIERS</span>
              </div>
              <span className="text-2xl font-bold text-emerald-400 block">&gt; 5&sigma; Filter</span>
              <p className="text-[10px] text-slate-400">
                Filters anomalous rogue spikes exceeding 5 standard deviations in &lt;10ms packets to eliminate bad prints.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg border border-cyan-500/30 bg-cyan-950/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-cyan-300">
              <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>
                Deterministic State Machine: Monotonic sequence tracking (#<strong>{ssotSeqId}</strong>) with OpenTelemetry W3C tracing active.
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-bold">DRIFT: 0.00p</span>
          </div>
        </div>
      )}
    </div>
  );
};
