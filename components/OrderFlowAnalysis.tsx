'use client';

import React, { useState, useMemo } from 'react';
import { CurrencyPair, TimeFrame, Candle, OrderFlowSessionAnalysis } from '@/lib/types';
import { orderFlowEngine } from '@/lib/orderFlowEngine';
import { 
  BarChart2, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Radio, 
  Crosshair, 
  ArrowLeft,
  X,
  Flame,
  Activity
} from 'lucide-react';

interface OrderFlowAnalysisProps {
  symbol: CurrencyPair;
  timeframe: TimeFrame;
  candles?: Candle[];
  isFullPage?: boolean;
  onClose?: () => void;
}

export const OrderFlowAnalysis: React.FC<OrderFlowAnalysisProps> = ({
  symbol,
  timeframe,
  candles = [],
  isFullPage = false,
  onClose,
}) => {
  const [activeView, setActiveView] = useState<'FOOTPRINT' | 'VOLUME_PROFILE' | 'DELTA_LADDER'>('FOOTPRINT');
  const [selectedCandleIdx, setSelectedCandleIdx] = useState<number | null>(null);

  // Compute real-time session order flow and footprints
  const sessionData: OrderFlowSessionAnalysis = useMemo(() => {
    return orderFlowEngine.analyzeSessionOrderFlow(symbol, timeframe, candles);
  }, [symbol, timeframe, candles]);

  const footprints = sessionData.footprints;
  const volumeProfile = sessionData.volumeProfile;
  const activeCandle = selectedCandleIdx !== null && footprints[selectedCandleIdx]
    ? footprints[selectedCandleIdx]
    : footprints[footprints.length - 1];

  const content = (
    <div className={`bg-terminal-900 border border-terminal-border rounded-2xl w-full ${isFullPage ? 'shadow-xl' : 'max-w-6xl max-h-[92vh] shadow-2xl'} flex flex-col overflow-hidden font-mono`}>
      {/* Header Bar */}
      <div className="p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border border-cyan-400/40 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Layers className="w-5 h-5 text-cyan-200 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                INSTITUTIONAL ORDER FLOW // FOOTPRINT & VOLUME PROFILE
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-400 animate-ping" />
                LIVE BID/ASK MATRIX
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                {symbol} • {timeframe.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">
              Order Book Micro-Structure • Buying vs Selling Pressure • Point of Control (POC) & Value Area
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center bg-terminal-900 p-0.5 rounded-lg border border-terminal-border text-xs">
            <button
              onClick={() => setActiveView('FOOTPRINT')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeView === 'FOOTPRINT'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Footprint</span>
            </button>
            <button
              onClick={() => setActiveView('VOLUME_PROFILE')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeView === 'VOLUME_PROFILE'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Volume Profile</span>
            </button>
            <button
              onClick={() => setActiveView('DELTA_LADDER')}
              className={`px-3 py-1.5 rounded transition-all flex items-center gap-1.5 ${
                activeView === 'DELTA_LADDER'
                  ? 'bg-cyan-600 text-white font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Delta Ladder</span>
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              {isFullPage ? (
                <>
                  <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Back to Chart</span>
                </>
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Real-Time Order Flow Metrics & Buying vs Selling Pressure Gauge */}
      <div className="p-4 bg-terminal-950/60 border-b border-terminal-border space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          {/* Total Session Volume */}
          <div className="p-2.5 rounded-xl bg-terminal-950 border border-terminal-border">
            <span className="text-[10px] text-slate-400 block uppercase">Session Volume</span>
            <span className="text-base font-bold text-white">
              {sessionData.sessionVolume.toLocaleString()} Lots
            </span>
            <span className="text-[9px] text-slate-500 block truncate">
              {candles.length} Candles Processed
            </span>
          </div>

          {/* Cumulative Volume Delta (CVD) */}
          <div className={`p-2.5 rounded-xl bg-terminal-950 border ${
            sessionData.cumulativeVolumeDelta >= 0 ? 'border-emerald-500/40' : 'border-rose-500/40'
          }`}>
            <span className="text-[10px] text-slate-400 block uppercase">Cumulative Delta (CVD)</span>
            <span className={`text-base font-bold flex items-center gap-1 ${
              sessionData.cumulativeVolumeDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
            }`}>
              {sessionData.cumulativeVolumeDelta >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {sessionData.cumulativeVolumeDelta > 0 ? '+' : ''}{sessionData.cumulativeVolumeDelta.toLocaleString()}
            </span>
            <span className="text-[9px] text-cyan-300 block truncate">
              {sessionData.cvdTrend.replace(/_/g, ' ')}
            </span>
          </div>

          {/* Point of Control (POC) */}
          <div className="p-2.5 rounded-xl bg-terminal-950 border border-amber-500/40">
            <span className="text-[10px] text-amber-300 block uppercase font-bold flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-amber-400" />
              Point of Control (POC)
            </span>
            <span className="text-base font-bold text-amber-400">
              ${sessionData.pocPrice}
            </span>
            <span className="text-[9px] text-slate-400 block truncate">
              Peak Session Liquidity
            </span>
          </div>

          {/* Value Area (VAH to VAL) */}
          <div className="p-2.5 rounded-xl bg-terminal-950 border border-indigo-500/40">
            <span className="text-[10px] text-indigo-300 block uppercase font-semibold">Value Area (70%)</span>
            <span className="text-sm font-bold text-white block truncate">
              ${sessionData.valueAreaLow} - ${sessionData.valueAreaHigh}
            </span>
            <span className="text-[9px] text-indigo-400 block truncate">
              VAL to VAH Institutional Bounds
            </span>
          </div>

          {/* Current Live Price */}
          <div className="p-2.5 rounded-xl bg-terminal-950 border border-terminal-border col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 block uppercase">Current Quote</span>
            <span className="text-base font-bold text-cyan-300">
              ${sessionData.currentPrice}
            </span>
            <span className="text-[9px] text-slate-400 block truncate">
              {sessionData.currentPrice >= sessionData.pocPrice ? 'Trading Above POC (Bullish)' : 'Trading Below POC (Bearish)'}
            </span>
          </div>
        </div>

        {/* Buying vs Selling Pressure Gauge */}
        <div className="p-3 rounded-xl bg-terminal-950 border border-terminal-border space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-emerald-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
              Buying Aggression: {sessionData.buyVolumeRatioPercent}% ({sessionData.totalBuyVolume.toLocaleString()} Lots)
            </span>
            <span className="text-rose-400 flex items-center gap-1.5">
              Selling Aggression: {sessionData.sellVolumeRatioPercent}% ({sessionData.totalSellVolume.toLocaleString()} Lots)
              <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
            </span>
          </div>
          {/* Dual Color Progress Bar */}
          <div className="w-full h-3 rounded-full bg-terminal-900 border border-terminal-border/80 overflow-hidden flex">
            <div 
              style={{ width: `${sessionData.buyVolumeRatioPercent}%` }}
              className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full transition-all duration-500"
            />
            <div 
              style={{ width: `${sessionData.sellVolumeRatioPercent}%` }}
              className="bg-gradient-to-r from-rose-400 to-rose-600 h-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Main Interactive Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* VIEW 1: FOOTPRINT MATRIX */}
        {activeView === 'FOOTPRINT' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-terminal-border pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                CANDLE FOOTPRINT MATRIX (BID VOL × ASK VOL AT PRICE LEVELS)
              </span>
              <span className="text-[11px] text-slate-400">
                Green = Buy Imbalance (&gt;300%) • Red = Sell Imbalance • Gold = Candle POC
              </span>
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-thin">
              <div className="flex gap-3 min-w-max">
                {footprints.map((fp: any, idx: number) => {
                  const isBullCandle = fp.close >= fp.open;
                  const isSelected = selectedCandleIdx === idx || (selectedCandleIdx === null && idx === footprints.length - 1);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedCandleIdx(idx)}
                      className={`w-44 rounded-xl border p-2.5 space-y-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-terminal-950 border-cyan-500 shadow-md shadow-cyan-500/10'
                          : 'bg-terminal-950/70 border-terminal-border hover:border-slate-600'
                      }`}
                    >
                      {/* Candle Header */}
                      <div className="flex items-center justify-between border-b border-terminal-border/60 pb-1.5 text-[11px]">
                        <span className="text-slate-400 font-bold">
                          {new Date(fp.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={`px-1.5 py-0.5 rounded font-bold text-[10px] ${
                          fp.candleDelta >= 0
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          Δ {fp.candleDelta > 0 ? '+' : ''}{fp.candleDelta}
                        </span>
                      </div>

                      {/* Footprint Price Levels Ladder */}
                      <div className="space-y-1 text-[10px]">
                        {fp.levels.map((lvl: any, lIdx: number) => {
                          const isCandlePoc = lvl.price === fp.pocPrice;
                          return (
                            <div
                              key={lIdx}
                              className={`flex items-center justify-between px-1.5 py-0.5 rounded text-[10px] ${
                                isCandlePoc
                                  ? 'bg-amber-950/40 border border-amber-500/50 text-amber-200'
                                  : lvl.imbalanceType === 'BUY_IMBALANCE'
                                  ? 'bg-emerald-950/50 text-emerald-300 font-bold'
                                  : lvl.imbalanceType === 'SELL_IMBALANCE'
                                  ? 'bg-rose-950/50 text-rose-300 font-bold'
                                  : 'text-slate-300'
                              }`}
                            >
                              <span className="w-10 text-right text-rose-400 font-semibold">{lvl.bidVolume}</span>
                              <span className="text-slate-400 font-mono text-[9px] px-1">${lvl.price}</span>
                              <span className="w-10 text-left text-emerald-400 font-semibold">{lvl.askVolume}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Candle Footer Stats */}
                      <div className="border-t border-terminal-border/60 pt-1.5 text-[9px] text-slate-400 flex justify-between">
                        <span>Vol: {fp.totalCandleVolume}</span>
                        <span className={isBullCandle ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {isBullCandle ? 'BULL' : 'BEAR'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: VOLUME PROFILE HISTOGRAM */}
        {activeView === 'VOLUME_PROFILE' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border-b border-terminal-border pb-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Crosshair className="w-4 h-4 text-amber-400" />
                SESSION VOLUME PROFILE & VALUE AREA DISTRIBUTION (70% VAH/VAL)
              </span>
              <span className="text-[11px] text-amber-400 font-bold">
                POC: ${sessionData.pocPrice}
              </span>
            </div>

            <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
              {volumeProfile.map((bucket: any, bIdx: number) => (
                <div
                  key={bIdx}
                  className={`p-1.5 rounded-lg flex items-center gap-3 text-xs ${
                    bucket.isPoc
                      ? 'bg-amber-950/40 border border-amber-500/60 text-amber-200'
                      : bucket.isValueArea
                      ? 'bg-terminal-950 border border-indigo-500/30 text-white'
                      : 'bg-terminal-950/60 border border-terminal-border text-slate-400'
                  }`}
                >
                  <span className="w-20 font-bold shrink-0 font-mono text-[11px]">
                    ${bucket.priceLevel}
                  </span>

                  {/* Horizontal Volume Bar */}
                  <div className="flex-1 h-4 bg-terminal-900 rounded overflow-hidden flex relative">
                    <div
                      style={{ width: `${bucket.volumePercent * 3.5}%` }}
                      className={`h-full ${
                        bucket.isPoc
                          ? 'bg-amber-500'
                          : bucket.isValueArea
                          ? 'bg-indigo-500'
                          : 'bg-slate-700'
                      }`}
                    />
                    <span className="absolute left-2 top-0.5 text-[9px] font-bold text-white">
                      {bucket.totalVolume.toLocaleString()} Lots ({bucket.volumePercent}%)
                    </span>
                  </div>

                  <div className="w-28 text-right text-[10px] shrink-0">
                    {bucket.isPoc && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                        ★ POC
                      </span>
                    )}
                    {!bucket.isPoc && bucket.isValueArea && (
                      <span className="text-indigo-300">Value Area</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 3: DELTA LADDER & INSTITUTIONAL ABSORPTION */}
        {activeView === 'DELTA_LADDER' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Active Candle Delta Breakdown */}
            <div className="p-4 rounded-xl bg-terminal-950 border border-terminal-border space-y-3">
              <span className="font-bold text-white text-xs flex items-center gap-2 border-b border-terminal-border pb-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                ACTIVE CANDLE ORDER FLOW BREAKDOWN
              </span>

              {activeCandle ? (
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Open / Close:</span>
                    <strong className="text-white">${activeCandle.open} / ${activeCandle.close}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Candle Delta:</span>
                    <strong className={activeCandle.candleDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                      {activeCandle.candleDelta > 0 ? '+' : ''}{activeCandle.candleDelta} Lots
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Point of Control (POC):</span>
                    <strong className="text-amber-400">${activeCandle.pocPrice}</strong>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Total Volume:</span>
                    <strong className="text-white">{activeCandle.totalCandleVolume} Lots</strong>
                  </div>

                  {activeCandle.stackedBuyImbalances.length > 0 && (
                    <div className="p-2 rounded bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300">
                      <strong>Stacked Buy Imbalances Detected:</strong>
                      <p>Institutional accumulation confirmed across: {activeCandle.stackedBuyImbalances.join(', ')}</p>
                    </div>
                  )}

                  {activeCandle.stackedSellImbalances.length > 0 && (
                    <div className="p-2 rounded bg-rose-950/40 border border-rose-500/40 text-[11px] text-rose-300">
                      <strong>Stacked Sell Imbalances Detected:</strong>
                      <p>Institutional distribution confirmed across: {activeCandle.stackedSellImbalances.join(', ')}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-slate-500 text-xs">No candle selected.</p>
              )}
            </div>

            {/* Right: Institutional Order Block Absorption Zones */}
            <div className="p-4 rounded-xl bg-terminal-950 border border-terminal-border space-y-3">
              <span className="font-bold text-white text-xs flex items-center gap-2 border-b border-terminal-border pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                INSTITUTIONAL ABSORPTION ORDER BLOCKS
              </span>

              <div className="space-y-2.5">
                {sessionData.institutionalOrderBlocks.map((ob: any, oIdx: number) => (
                  <div
                    key={oIdx}
                    className={`p-3 rounded-lg border text-xs space-y-1 ${
                      ob.type === 'DEMAND'
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
                    }`}
                  >
                    <div className="flex justify-between font-bold">
                      <span>{ob.type} ORDER BLOCK (ABSORPTION)</span>
                      <span>${ob.priceRange[0]} - ${ob.priceRange[1]}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Stacked Volume: {ob.volumeStacked.toLocaleString()} Lots • {ob.mitigated ? 'Mitigated' : 'Unmitigated (Active Floor/Ceiling)'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      {content}
    </div>
  );
};
