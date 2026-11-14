'use client';

import React, { useState, useEffect } from 'react';
import { 
  CurrencyPair, 
  IngestionEngineTelemetry, 
  MultiAssetNormalizedTick 
} from '@/lib/types';
import { multiAssetIngestionEngine } from '@/lib/multiAssetIngestionEngine';
import { 
  Activity, 
  Radio, 
  Layers, 
  Zap, 
  TrendingUp, 
  ShieldCheck, 
  Clock, 
  Database, 
  CheckCircle2, 
  AlertTriangle,
  Flame,
  ArrowRight,
  Maximize2,
  Minimize2,
  Lock,
  RefreshCw
} from 'lucide-react';

interface MultiAssetIngestionTelemetryCardProps {
  selectedPair: CurrencyPair;
  onSelectPair?: (pair: CurrencyPair) => void;
  theme?: 'dark' | 'light';
}

export const MultiAssetIngestionTelemetryCard: React.FC<MultiAssetIngestionTelemetryCardProps> = ({
  selectedPair,
  onSelectPair,
  theme = 'dark',
}) => {
  const [telemetry, setTelemetry] = useState<IngestionEngineTelemetry>(() => 
    multiAssetIngestionEngine.getTelemetry()
  );
  const [activeAssetTab, setActiveAssetTab] = useState<'ALL' | 'FOREX' | 'METALS_COMMODITIES' | 'EQUITIES' | 'INDICES'>('ALL');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  useEffect(() => {
    // Start background ingestion daemon if not already running
    const stopDaemon = multiAssetIngestionEngine.startIngestionDaemon(1500);

    const interval = setInterval(() => {
      setTelemetry(multiAssetIngestionEngine.getTelemetry());
    }, 1500);

    return () => {
      clearInterval(interval);
      stopDaemon();
    };
  }, []);

  const instrumentsList = Object.values(telemetry.normalizedInstruments);
  const filteredInstruments = activeAssetTab === 'ALL' 
    ? instrumentsList 
    : instrumentsList.filter(item => item.assetClass === activeAssetTab);

  return (
    <div className={`p-4 rounded-2xl border font-mono text-xs transition-all duration-300 shadow-xl ${
      theme === 'light'
        ? 'bg-white border-slate-200 text-slate-800 shadow-slate-900/5'
        : 'bg-terminal-950 border-terminal-border text-slate-200 shadow-black/40'
    }`}>
      {/* Header Bar */}
      <div className={`flex flex-wrap items-center justify-between pb-3 mb-3 border-b gap-2 ${
        theme === 'light' ? 'border-slate-200' : 'border-terminal-border/70'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm tracking-wide">
                MULTI-ASSET REAL-TIME INGESTION LAYER
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>FIX 5.0 SP2 & WSS ACTIVE</span>
              </span>
            </div>
            <p className={`text-[10px] mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Normalized Pip Metrics across Global Forex, Commodities, Equities & Indices via In-Memory TSDB
            </p>
          </div>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex items-center gap-2 flex-wrap text-[10px]">
          <span className={`px-2 py-1 rounded border flex items-center gap-1 ${
            theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
          }`}>
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>Avg Latency: <strong>{telemetry.averageIngestionLatencyMs}ms</strong></span>
          </span>
          <span className={`px-2 py-1 rounded border flex items-center gap-1 ${
            theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
          }`}>
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>Throughput: <strong>{telemetry.ticksPerSecond} ticks/s</strong></span>
          </span>
          <span className={`px-2 py-1 rounded border flex items-center gap-1 ${
            theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
          }`}>
            <Database className="w-3 h-3 text-purple-400" />
            <span>In-Memory Ring Buffers: <strong>{telemetry.inMemoryTimeSeriesRecords} ticks</strong></span>
          </span>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-1 rounded border hover:opacity-80 transition-opacity ${
              theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-700' : 'bg-terminal-900 border-terminal-border text-slate-300'
            }`}
            title={isExpanded ? 'Collapse Instrument Table' : 'Expand Instrument Table'}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Core Protocol Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-3 text-[11px]">
        {/* Pillar A: Multi-Asset Decimal Normalizer */}
        <div className={`p-2.5 rounded-xl border ${
          theme === 'light' ? 'bg-cyan-50/50 border-cyan-200 text-cyan-950' : 'bg-cyan-950/30 border-cyan-500/30 text-cyan-200'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1 text-cyan-500 text-xs">
            <Layers className="w-3.5 h-3.5" />
            <span>1. PIP METRICS NORMALIZER</span>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            Normalizes diverse decimal conventions (5-dec FX, 3-dec JPY/Silver, 2-dec Gold/Oil/Indices) into uniform pip distances.
          </p>
        </div>

        {/* Pillar B: Strict Entry-Proximity Filter (10 to 50 Pip Band) */}
        <div className={`p-2.5 rounded-xl border ${
          theme === 'light' ? 'bg-indigo-50/50 border-indigo-200 text-indigo-950' : 'bg-indigo-950/30 border-indigo-500/30 text-indigo-200'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1 text-indigo-500 text-xs">
            <Zap className="w-3.5 h-3.5" />
            <span>2. 10–50 PIP PROXIMITY BAND</span>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            Strictly filters execution signals: orders only trigger when entry threshold variance falls within designated 10 to 50 pip band.
          </p>
        </div>

        {/* Pillar C: Continuous Post-Trade Monitoring Daemon */}
        <div className={`p-2.5 rounded-xl border ${
          theme === 'light' ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950' : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
        }`}>
          <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-500 text-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>3. POST-TRADE DAEMON</span>
          </div>
          <p className="text-[10px] leading-relaxed opacity-90">
            Tracks open positions tick-by-tick to trigger automated 1:1 breakeven adjustments and immediate structural/sentiment closures.
          </p>
        </div>
      </div>

      {/* Asset Class Filter Tabs */}
      <div className="flex items-center justify-between pb-2 mb-2 flex-wrap gap-2">
        <div className="flex items-center gap-1 text-[10px]">
          {(['ALL', 'FOREX', 'METALS_COMMODITIES', 'EQUITIES', 'INDICES'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveAssetTab(tab)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                activeAssetTab === tab
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : theme === 'light'
                  ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-300'
                  : 'bg-terminal-900 text-slate-400 hover:text-white border border-terminal-border'
              }`}
            >
              {tab === 'METALS_COMMODITIES' ? 'METALS & COMMODITIES' : tab}
            </button>
          ))}
        </div>

        <span className="text-[10px] text-slate-500">
          Showing {filteredInstruments.length} normalized instruments
        </span>
      </div>

      {/* Normalized Instruments Table */}
      <div className={`overflow-x-auto rounded-xl border scrollbar-thin ${
        theme === 'light' ? 'border-slate-200 bg-slate-50/50' : 'border-terminal-border/80 bg-terminal-900/60'
      }`}>
        <table className="w-full text-left text-[11px] border-collapse">
          <thead>
            <tr className={`border-b text-[10px] uppercase font-bold tracking-wider ${
              theme === 'light' ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-terminal-950 text-slate-400 border-terminal-border'
            }`}>
              <th className="py-2 px-3">Symbol</th>
              <th className="py-2 px-2.5">Asset Class</th>
              <th className="py-2 px-2.5">Live Bid</th>
              <th className="py-2 px-2.5">Live Ask</th>
              <th className="py-2 px-2.5">Spread</th>
              <th className="py-2 px-2.5">Decimals</th>
              <th className="py-2 px-2.5">Pip Multiplier</th>
              <th className="py-2 px-2.5">Latency</th>
              <th className="py-2 px-3 text-right">Band [10, 50]</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-terminal-border/30">
            {filteredInstruments.slice(0, isExpanded ? 30 : 6).map((inst) => {
              const isSelected = inst.symbol === selectedPair;
              return (
                <tr 
                  key={inst.symbol}
                  onClick={() => onSelectPair && onSelectPair(inst.symbol)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? theme === 'light' ? 'bg-cyan-100/70 font-bold' : 'bg-cyan-950/40 font-bold'
                      : theme === 'light' ? 'hover:bg-slate-100' : 'hover:bg-terminal-800/40'
                  }`}
                >
                  <td className="py-2 px-3 font-bold flex items-center gap-1.5">
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />}
                    <span className={isSelected ? 'text-cyan-500' : ''}>{inst.symbol}</span>
                  </td>
                  <td className="py-2 px-2.5 text-[10px] opacity-80">{inst.assetClass.replace('_', ' ')}</td>
                  <td className="py-2 px-2.5 text-rose-500 font-medium">{inst.currentBid.toFixed(inst.decimals)}</td>
                  <td className="py-2 px-2.5 text-emerald-500 font-medium">{inst.currentAsk.toFixed(inst.decimals)}</td>
                  <td className="py-2 px-2.5 font-bold">{inst.spreadPips} pips</td>
                  <td className="py-2 px-2.5 text-[10px] opacity-70">{inst.decimals} Dec</td>
                  <td className="py-2 px-2.5 text-[10px] opacity-70">{inst.pipMultiplier}</td>
                  <td className="py-2 px-2.5 text-[10px] text-cyan-400">{inst.lastLatencyMs}ms</td>
                  <td className="py-2 px-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      FILTER ACTIVE
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {!isExpanded && filteredInstruments.length > 6 && (
        <div className="mt-2 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className={`text-[10px] font-bold underline transition-colors ${
              theme === 'light' ? 'text-cyan-700 hover:text-cyan-900' : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            Show all {filteredInstruments.length} normalized multi-asset instruments...
          </button>
        </div>
      )}
    </div>
  );
};
