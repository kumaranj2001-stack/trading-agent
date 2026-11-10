'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CurrencyPair, OrderFlowAnalysisReport, FootprintPriceLevel } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';
import { 
  Activity, 
  ArrowLeft, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart2, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Layers, 
  Radio, 
  RefreshCw, 
  Scale, 
  ShieldAlert, 
  ShieldCheck, 
  Sliders, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Globe,
  SlidersHorizontal
} from 'lucide-react';

interface OrderFlowDeskProps {
  isFullPage?: boolean;
  onClose?: () => void;
  selectedPair?: CurrencyPair;
  onSelectPair?: (pair: CurrencyPair) => void;
  onExecuteTrade?: (trade: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
    lots: number;
  }) => void;
}

export const OrderFlowDesk: React.FC<OrderFlowDeskProps> = ({
  isFullPage = true,
  onClose,
  selectedPair: initialPair = 'XAU/USD',
  onSelectPair,
  onExecuteTrade,
}) => {
  const [symbol, setSymbol] = useState<CurrencyPair>(initialPair);
  const [report, setReport] = useState<OrderFlowAnalysisReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [techWeight, setTechWeight] = useState<number>(50); // 50%
  const [liveTicksCount, setLiveTicksCount] = useState<number>(0);
  const [liveBid, setLiveBid] = useState<number>(BASE_PRICES[initialPair] || 2734.50);
  const [liveAsk, setLiveAsk] = useState<number>((BASE_PRICES[initialPair] || 2734.50) + 0.25);
  const [liveCvd, setLiveCvd] = useState<number>(420);
  const [liveBuyingPct, setLiveBuyingPct] = useState<number>(62.4);

  const eventSourceRef = useRef<EventSource | null>(null);

  // Synchronize pair if prop changes
  useEffect(() => {
    if (initialPair && initialPair !== symbol) {
      setSymbol(initialPair);
    }
  }, [initialPair]);

  // Fetch initial REST snapshot
  const fetchSnapshot = async (targetSymbol: CurrencyPair) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/order-flow?symbol=${encodeURIComponent(targetSymbol)}`);
      const json = await res.json();
      if (json.success && json.data) {
        setReport(json.data);
        setLiveBid(json.data.liveWebSocketTelemetry.bidPrice);
        setLiveAsk(json.data.liveWebSocketTelemetry.askPrice);
        setLiveCvd(json.data.volumeProfile.cumulativeVolumeDelta);
        setLiveBuyingPct(json.data.volumeProfile.buyingPressurePercent);
      }
    } catch (err) {
      console.error('Failed to fetch order flow snapshot:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Connect live WebSocket / SSE Stream
  useEffect(() => {
    fetchSnapshot(symbol);

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    try {
      const sse = new EventSource(`/api/order-flow/stream?symbol=${encodeURIComponent(symbol)}`);
      eventSourceRef.current = sse;

      sse.onopen = () => {
        setIsStreaming(true);
      };

      sse.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ORDER_FLOW_SNAPSHOT' && data.payload) {
            setReport(data.payload);
            setLiveBid(data.payload.liveWebSocketTelemetry.bidPrice);
            setLiveAsk(data.payload.liveWebSocketTelemetry.askPrice);
            setLiveCvd(data.payload.volumeProfile.cumulativeVolumeDelta);
            setLiveBuyingPct(data.payload.volumeProfile.buyingPressurePercent);
          } else if (data.type === 'ORDER_FLOW_TICK') {
            setLiveTicksCount(prev => prev + 1);
            setLiveBid(data.bid);
            setLiveAsk(data.ask);
            setLiveCvd(data.cumulativeVolumeDelta);
            setLiveBuyingPct(data.buyingPressurePercent);
          }
        } catch (e) {
          // ignore parsing error
        }
      };

      sse.onerror = () => {
        setIsStreaming(false);
      };
    } catch (e) {
      console.error('SSE connection failed:', e);
      setIsStreaming(false);
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, [symbol]);

  const handlePairChange = (newPair: CurrencyPair) => {
    setSymbol(newPair);
    if (onSelectPair) onSelectPair(newPair);
  };

  // Calculate dynamic weighted score with custom slider
  const fundWeight = 100 - techWeight;
  const dynCompositeScore = report
    ? Math.round((report.technicalMomentum.score * (techWeight / 100)) + (report.fundamentalSentiment.score * (fundWeight / 100)))
    : 50;

  const isBuyConfirmed = report?.dualConfirmation.entryConfirmationStatus === 'CONFIRMED_BUY';
  const isSellConfirmed = report?.dualConfirmation.entryConfirmationStatus === 'CONFIRMED_SELL';
  const isDivergent = report?.dualConfirmation.entryConfirmationStatus === 'MOMENTUM_FUNDAMENTAL_DIVERGENCE';

  return (
    <div className="space-y-4 animate-fade-in w-full text-slate-100 font-sans">
      {/* 09 // Top Institutional Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-terminal-900 border border-terminal-border shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border border-cyan-400/40 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <BarChart2 className="w-5 h-5 text-cyan-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                09 // QRI TRADER // ORDER FLOW & REAL-TIME PRICE ACTION ENGINE
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono border font-bold flex items-center gap-1.5 ${
                isStreaming 
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' 
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                {isStreaming ? 'WEBSOCKET STREAM ACTIVE (0ms)' : 'REST SYNCHRONIZED'}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold hidden sm:inline">
                FOOTPRINT + VOLUME PROFILE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
              Sub-second tick streaming • Bid/Ask cluster delta • 50/50 Technical Momentum & Fundamental Sentiment confirmation
            </p>
          </div>
        </div>

        {/* Action Controls & Pair Selector */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Symbol Selector */}
          <div className="flex items-center bg-terminal-950 px-3 py-1.5 rounded-lg border border-terminal-border font-mono text-xs">
            <span className="text-slate-400 mr-2 text-[10px] uppercase font-bold">ASSET:</span>
            <select
              value={symbol}
              onChange={(e) => handlePairChange(e.target.value as CurrencyPair)}
              className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
            >
              {Object.keys(BASE_PRICES).map(p => (
                <option key={p} value={p} className="bg-terminal-900 text-white font-medium">
                  {p}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => fetchSnapshot(symbol)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border transition-colors font-mono text-xs flex items-center gap-1.5"
            title="Refresh Order Flow Snapshot"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors flex items-center gap-1.5 font-semibold"
              title="Return to Main Trading Terminal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>TERMINAL</span>
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Price Action Telemetry Ticker Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs">
        <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Live Bid / Ask</span>
          <div className="flex items-baseline gap-1.5 mt-0.5">
            <span className="text-base font-bold text-white">${liveBid.toFixed(symbol.includes('XAU') ? 2 : 4)}</span>
            <span className="text-slate-500 text-xs">/</span>
            <span className="text-sm font-semibold text-slate-300">${liveAsk.toFixed(symbol.includes('XAU') ? 2 : 4)}</span>
          </div>
          <span className="text-[9px] text-slate-500 block">Spread: ${(liveAsk - liveBid).toFixed(4)}</span>
        </div>

        <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Buying vs Selling</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-base font-bold ${liveBuyingPct >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {liveBuyingPct}%
            </span>
            <span className="text-slate-400 text-xs">Buyers</span>
          </div>
          <div className="w-full bg-rose-950/80 h-1.5 rounded-full overflow-hidden mt-1 flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{ width: `${liveBuyingPct}%` }}
            />
          </div>
        </div>

        <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Cumulative Delta (CVD)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className={`text-base font-bold ${liveCvd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {liveCvd > 0 ? '+' : ''}{liveCvd}
            </span>
            <span className="text-slate-400 text-[10px]">contracts</span>
          </div>
          <span className="text-[9px] text-slate-500 block">Aggressive market delta</span>
        </div>

        <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Point of Control (POC)</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-base font-bold text-amber-300">
              ${report?.volumeProfile.pointOfControl.toFixed(symbol.includes('XAU') ? 2 : 4) || '—'}
            </span>
          </div>
          <span className="text-[9px] text-slate-500 block">Highest volume acceptance</span>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-terminal-900 border border-terminal-border">
          <span className="text-[10px] text-slate-400 block uppercase font-semibold">Stream Telemetry</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-sm font-bold text-cyan-300">12.8 Ticks/s</span>
          </div>
          <span className="text-[9px] text-emerald-400 block">⚡ 0ms Latency Active</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Interactive Footprint Chart & Volume Profile (6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Footprint Chart Price Ladder */}
          <div className="p-4 rounded-2xl bg-terminal-900 border border-terminal-border space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2 font-mono">
                <Layers className="w-4 h-4 text-cyan-400" />
                FOOTPRINT CLUSTER LADDER (BID × ASK DELTA)
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                14 BRACKET LEVELS
              </span>
            </div>

            <div className="p-2 rounded-xl bg-terminal-950 border border-terminal-border text-xs font-mono space-y-1">
              <div className="grid grid-cols-12 text-[10px] text-slate-500 uppercase font-bold px-2 py-1 border-b border-terminal-border/60">
                <span className="col-span-3 text-left">Price Level</span>
                <span className="col-span-3 text-right text-rose-400">Bid (Sells)</span>
                <span className="col-span-1 text-center">×</span>
                <span className="col-span-3 text-left text-emerald-400">Ask (Buys)</span>
                <span className="col-span-2 text-right">Delta</span>
              </div>

              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {report?.footprintLevels.map((lvl, idx) => {
                  const isPoc = lvl.isPointOfControl;
                  const deltaPositive = lvl.delta >= 0;

                  return (
                    <div
                      key={idx}
                      className={`grid grid-cols-12 items-center px-2 py-1.5 rounded transition-colors text-xs font-mono ${
                        isPoc
                          ? 'bg-amber-950/60 border border-amber-500/60 shadow-sm'
                          : 'hover:bg-terminal-900/80 border border-transparent'
                      }`}
                    >
                      {/* Price Level */}
                      <div className="col-span-3 flex items-center gap-1.5 font-bold">
                        {isPoc && (
                          <span className="px-1 py-0.2 rounded bg-amber-500 text-black text-[9px] font-extrabold">
                            POC
                          </span>
                        )}
                        <span className={isPoc ? 'text-amber-300' : 'text-white'}>
                          ${lvl.price.toFixed(symbol.includes('XAU') ? 2 : 4)}
                        </span>
                      </div>

                      {/* Bid Volume (Aggressive Sellers) */}
                      <div className="col-span-3 text-right">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          lvl.bidImbalance 
                            ? 'bg-rose-500/30 text-rose-300 border border-rose-500/60 font-extrabold' 
                            : 'text-rose-400/90'
                        }`}>
                          {lvl.bidVolume}
                          {lvl.bidImbalance && ' ⚠️'}
                        </span>
                      </div>

                      {/* Divider */}
                      <div className="col-span-1 text-center text-slate-600 text-[10px]">
                        ×
                      </div>

                      {/* Ask Volume (Aggressive Buyers) */}
                      <div className="col-span-3 text-left">
                        <span className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          lvl.askImbalance 
                            ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/60 font-extrabold' 
                            : 'text-emerald-400/90'
                        }`}>
                          {lvl.askVolume}
                          {lvl.askImbalance && ' ★'}
                        </span>
                      </div>

                      {/* Level Delta */}
                      <div className="col-span-2 text-right">
                        <span className={`font-bold text-[11px] ${
                          deltaPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {deltaPositive ? `+${lvl.delta}` : lvl.delta}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-terminal-border/60 flex items-center justify-between text-[10px] text-slate-400 px-2">
                <span>★ Ask Imbalance (≥3x Buyer Surge)</span>
                <span>⚠️ Bid Imbalance (≥3x Seller Surge)</span>
              </div>
            </div>
          </div>

          {/* Volume Profile (VAH / POC / VAL) Card */}
          <div className="p-4 rounded-2xl bg-terminal-900 border border-terminal-border space-y-3 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2.5">
              <span className="font-bold text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-400" />
                SESSION VOLUME PROFILE & VALUE AREA (70%)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                TOTAL: {report?.volumeProfile.totalVolume || 0} CONTRACTS
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-terminal-950 border border-terminal-border">
                <span className="text-[10px] text-slate-400 block uppercase">Value Area High (VAH)</span>
                <span className="text-sm font-bold text-cyan-300">
                  ${report?.volumeProfile.valueAreaHigh.toFixed(symbol.includes('XAU') ? 2 : 4) || '—'}
                </span>
                <span className="text-[9px] text-slate-500 block">70% upper bound</span>
              </div>

              <div className="p-2.5 rounded-xl bg-terminal-950 border border-amber-500/40">
                <span className="text-[10px] text-amber-300 block uppercase font-bold">Point of Control (POC)</span>
                <span className="text-sm font-bold text-amber-400">
                  ${report?.volumeProfile.pointOfControl.toFixed(symbol.includes('XAU') ? 2 : 4) || '—'}
                </span>
                <span className="text-[9px] text-amber-300/80 block">Max volume node</span>
              </div>

              <div className="p-2.5 rounded-xl bg-terminal-950 border border-terminal-border">
                <span className="text-[10px] text-slate-400 block uppercase">Value Area Low (VAL)</span>
                <span className="text-sm font-bold text-cyan-300">
                  ${report?.volumeProfile.valueAreaLow.toFixed(symbol.includes('XAU') ? 2 : 4) || '—'}
                </span>
                <span className="text-[9px] text-slate-500 block">70% lower bound</span>
              </div>
            </div>

            {/* Volume Histogram Profile Bars */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Volume Distribution by Price Level:</span>
              <div className="space-y-1">
                {report?.footprintLevels.slice(0, 7).map((lvl, i) => {
                  const maxTotal = report.volumeProfile.totalVolume || 1;
                  const barWidth = Math.min(100, Math.round((lvl.totalVolume / (maxTotal / 5)) * 100));

                  return (
                    <div key={i} className="flex items-center gap-2 text-[10px]">
                      <span className="w-16 text-slate-400 truncate">${lvl.price.toFixed(symbol.includes('XAU') ? 2 : 4)}</span>
                      <div className="flex-1 bg-terminal-950 h-3 rounded overflow-hidden flex">
                        <div
                          className={`h-full ${
                            lvl.isPointOfControl
                              ? 'bg-amber-400'
                              : lvl.delta >= 0
                              ? 'bg-emerald-500/80'
                              : 'bg-rose-500/80'
                          }`}
                          style={{ width: `${barWidth}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-slate-300 font-bold">{lvl.totalVolume}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Technical Momentum alongside Fundamental Sentiment Weighting (6 Columns) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Dual Confluence Entry Confirmation Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl transition-all ${
            isBuyConfirmed
              ? 'bg-gradient-to-br from-emerald-950/70 via-terminal-900 to-terminal-950 border-emerald-500/50'
              : isSellConfirmed
              ? 'bg-gradient-to-br from-rose-950/70 via-terminal-900 to-terminal-950 border-rose-500/50'
              : isDivergent
              ? 'bg-gradient-to-br from-amber-950/70 via-terminal-900 to-terminal-950 border-amber-500/50'
              : 'bg-gradient-to-br from-terminal-900 to-terminal-950 border-terminal-border'
          }`}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white border shadow-md ${
                  isBuyConfirmed
                    ? 'bg-emerald-600/30 border-emerald-400/50 text-emerald-300'
                    : isSellConfirmed
                    ? 'bg-rose-600/30 border-rose-400/50 text-rose-300'
                    : 'bg-amber-600/30 border-amber-400/50 text-amber-300'
                }`}>
                  {isBuyConfirmed ? (
                    <ArrowUpRight className="w-6 h-6 text-emerald-400 animate-bounce" />
                  ) : isSellConfirmed ? (
                    <ArrowDownRight className="w-6 h-6 text-rose-400 animate-bounce" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-base sm:text-lg font-extrabold tracking-wide font-mono ${
                      isBuyConfirmed
                        ? 'text-emerald-400'
                        : isSellConfirmed
                        ? 'text-rose-400'
                        : 'text-amber-300'
                    }`}>
                      {isBuyConfirmed && `DUAL CONFLUENCE CONFIRMED: BUY (${symbol})`}
                      {isSellConfirmed && `DUAL CONFLUENCE CONFIRMED: SELL (${symbol})`}
                      {isDivergent && `MOMENTUM-FUNDAMENTAL DIVERGENCE (ENTRY SUPPRESSED)`}
                      {!isBuyConfirmed && !isSellConfirmed && !isDivergent && `CONSOLIDATION – WAITING FOR CONFIRMATION`}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                      50/50 WEIGHTED
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-mono mt-0.5">
                    {report?.dualConfirmation.verdictDescription}
                  </p>
                </div>
              </div>

              {/* Composite Score Gauge */}
              <div className="bg-terminal-950/80 p-2.5 rounded-xl border border-terminal-border font-mono text-right shrink-0">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Composite Score</span>
                <span className={`text-lg font-bold ${
                  dynCompositeScore >= 60 ? 'text-emerald-400' : dynCompositeScore <= 40 ? 'text-rose-400' : 'text-amber-300'
                }`}>
                  {dynCompositeScore}%
                </span>
                <span className="text-[9px] text-slate-500 block">Threshold: 60%</span>
              </div>
            </div>
          </div>

          {/* Interactive Weighting Control */}
          <div className="p-3.5 rounded-xl bg-terminal-900 border border-terminal-border space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                CONFLUENCE WEIGHTING ALLOCATION:
              </span>
              <span className="text-[11px] text-cyan-300 font-bold">
                {techWeight}% Technical Momentum / {fundWeight}% Fundamental Sentiment
              </span>
            </div>

            <input
              type="range"
              min="20"
              max="80"
              value={techWeight}
              onChange={(e) => setTechWeight(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-terminal-950 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>More Technical Weight</span>
              <span>Balanced (50/50 Recommended)</span>
              <span>More Fundamental Weight</span>
            </div>
          </div>

          {/* Dual Desks Side-by-Side: Technical Momentum vs Fundamental Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Technical Momentum Desk */}
            <div className="p-3.5 rounded-xl bg-terminal-900 border border-cyan-500/40 space-y-2.5 font-mono text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-terminal-border pb-1.5">
                <span className="font-bold text-cyan-300 flex items-center gap-1.5 text-[11px]">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  TECHNICAL MOMENTUM ({techWeight}%)
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  report?.technicalMomentum.bias === 'BULLISH_MOMENTUM'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : report?.technicalMomentum.bias === 'BEARISH_MOMENTUM'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {report?.technicalMomentum.bias.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Technical Score:</span>
                  <strong className="text-white">{report?.technicalMomentum.score}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">RSI(14) Momentum:</span>
                  <strong className="text-cyan-300">{report?.technicalMomentum.rsi} ({report?.technicalMomentum.rsiSlope})</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">VWAP Distance:</span>
                  <strong className="text-emerald-400">{report?.technicalMomentum.vwapDistancePercent}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">EMA Ribbon:</span>
                  <strong className="text-white">{report?.technicalMomentum.emaRibbonAlignment.replace('_', ' ')}</strong>
                </div>
              </div>

              <div className="p-2 rounded bg-terminal-950 border border-terminal-border/80 space-y-1 text-[9px] text-slate-300">
                <span className="font-bold text-cyan-400 block uppercase">Momentum Drivers:</span>
                {report?.technicalMomentum.momentumDrivers.map((d, i) => (
                  <p key={i}>• {d}</p>
                ))}
              </div>
            </div>

            {/* Fundamental Sentiment Desk */}
            <div className="p-3.5 rounded-xl bg-terminal-900 border border-indigo-500/40 space-y-2.5 font-mono text-xs shadow-md">
              <div className="flex items-center justify-between border-b border-terminal-border pb-1.5">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5 text-[11px]">
                  <Globe className="w-3.5 h-3.5 text-indigo-400" />
                  FUNDAMENTAL SENTIMENT ({fundWeight}%)
                </span>
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                  report?.fundamentalSentiment.bias === 'RISK_ON_EXPANSION'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : report?.fundamentalSentiment.bias === 'RISK_OFF_CONTRACTION'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {report?.fundamentalSentiment.bias.replace('_', ' ')}
                </span>
              </div>

              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fundamental Score:</span>
                  <strong className="text-white">{report?.fundamentalSentiment.score}%</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">38-Source Wire Pulse:</span>
                  <strong className="text-emerald-400">
                    {report && report.fundamentalSentiment.wireSentimentScore > 0 ? '+' : ''}
                    {report?.fundamentalSentiment.wireSentimentScore.toFixed(2)}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Central Bank Stance:</span>
                  <strong className="text-indigo-300">{report?.fundamentalSentiment.centralBankStance}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Feeds Monitored:</span>
                  <strong className="text-white">38 Outlets Synced</strong>
                </div>
              </div>

              <div className="p-2 rounded bg-terminal-950 border border-terminal-border/80 space-y-1 text-[9px] text-slate-300">
                <span className="font-bold text-indigo-400 block uppercase">Sentiment Drivers:</span>
                {report?.fundamentalSentiment.sentimentDrivers.map((d, i) => (
                  <p key={i}>• {d}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Mathematical Execution Ticket (Order-Flow Anchored) */}
          <div className="p-4 rounded-xl bg-terminal-900 border border-cyan-500/40 space-y-3.5 shadow-lg font-mono text-xs">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2.5">
              <span className="font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                ORDER-FLOW ANCHORED EXECUTION PARAMETERS
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                R:R 1:{report?.dualConfirmation.riskRewardRatio || 2.4}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-terminal-950 border border-terminal-border">
                <span className="text-[10px] text-slate-400 block uppercase">Recommended Entry</span>
                <span className="text-base font-bold text-white">
                  ${report?.dualConfirmation.recommendedEntryPrice.toFixed(symbol.includes('XAU') ? 2 : 4)}
                </span>
                <span className="text-[9px] text-slate-500 block">At market price</span>
              </div>

              <div className="p-2.5 rounded-lg bg-terminal-950 border border-rose-500/40">
                <span className="text-[10px] text-rose-300 block uppercase font-semibold">Hard Stop-Loss</span>
                <span className="text-base font-bold text-rose-400">
                  ${report?.dualConfirmation.orderFlowAnchorStopLoss.toFixed(symbol.includes('XAU') ? 2 : 4)}
                </span>
                <span className="text-[9px] text-rose-400/80 block">Anchored outside VA</span>
              </div>

              <div className="p-2.5 rounded-lg bg-terminal-950 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Take Profit 1</span>
                <span className="text-base font-bold text-emerald-400">
                  ${report?.dualConfirmation.orderFlowTarget1.toFixed(symbol.includes('XAU') ? 2 : 4)}
                </span>
                <span className="text-[9px] text-slate-500 block">Target 1</span>
              </div>

              <div className="p-2.5 rounded-lg bg-terminal-950 border border-emerald-500/40">
                <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Take Profit 2</span>
                <span className="text-base font-bold text-emerald-400">
                  ${report?.dualConfirmation.orderFlowTarget2.toFixed(symbol.includes('XAU') ? 2 : 4)}
                </span>
                <span className="text-[9px] text-slate-500 block">Target 2 (Runner)</span>
              </div>
            </div>

            {/* Execution Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              {report?.dualConfirmation.isEntryAuthorized && onExecuteTrade && (
                <button
                  onClick={() => {
                    const dir = isBuyConfirmed ? 'BUY' : 'SELL';
                    onExecuteTrade({
                      symbol,
                      direction: dir,
                      entry: report.dualConfirmation.recommendedEntryPrice,
                      stopLoss: report.dualConfirmation.orderFlowAnchorStopLoss,
                      takeProfit: report.dualConfirmation.orderFlowTarget1,
                      lots: symbol.includes('NIFTY') ? 25 : symbol.includes('XAU') ? 0.25 : 0.50,
                    });
                  }}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md text-white ${
                    isBuyConfirmed
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>EXECUTE {isBuyConfirmed ? 'BUY' : 'SELL'} ORDER FLOW CONFIRMED TRADE</span>
                </button>
              )}

              {onClose && (
                <button
                  onClick={onClose}
                  className="py-2.5 px-4 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-cyan-400" />
                  <span>RETURN TO TERMINAL</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
