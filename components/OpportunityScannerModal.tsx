'use client';

import React, { useState } from 'react';
import { MarketScannerOpportunity, CurrencyPair, MarketSegment } from '@/lib/types';
import { Radar, ArrowRight, X } from 'lucide-react';

interface OpportunityScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunities: MarketScannerOpportunity[];
  onSelectPair: (pair: CurrencyPair) => void;
  isScanning: boolean;
  onRefreshScan: () => void;
}

export const OpportunityScannerModal: React.FC<OpportunityScannerModalProps> = ({
  isOpen,
  onClose,
  opportunities,
  onSelectPair,
  isScanning,
  onRefreshScan,
}) => {
  const [filterSegment, setFilterSegment] = useState<'ALL' | MarketSegment>('ALL');

  if (!isOpen) return null;

  const filteredOpps = opportunities.filter(o => {
    if (filterSegment === 'ALL') return true;
    return o.segment === filterSegment;
  });

  const getGradeBadge = (grade: MarketScannerOpportunity['grade']) => {
    switch (grade) {
      case 'A+':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">GRADE A+</span>;
      case 'A':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">GRADE A</span>;
      case 'B':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">GRADE B</span>;
      case 'C':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-500/10 text-slate-400 border border-slate-500/30">GRADE C</span>;
      case 'F':
        return <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">VETOED</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 shrink-0">
              <Radar className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">Multi-Market Opportunity Scanner</h3>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                Continuous scanning across Forex, Precious Metals, Energy & Indian Markets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <button
              onClick={onRefreshScan}
              disabled={isScanning}
              className="px-2.5 sm:px-3 py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-cyan-400 border border-terminal-border transition-colors disabled:opacity-50"
            >
              {isScanning ? 'SCANNING...' : 'REFRESH'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 transition-colors shrink-0"
              aria-label="Close modal"
            >
              <span className="hidden sm:inline">Close</span>
              <X className="w-4 h-4 sm:hidden" />
            </button>
          </div>
        </div>

        {/* Filter Segment Tabs */}
        <div className="p-2 sm:p-3 bg-terminal-950/60 border-b border-terminal-border flex items-center gap-1.5 font-mono text-xs overflow-x-auto scrollbar-none whitespace-nowrap">
          <button
            onClick={() => setFilterSegment('ALL')}
            className={`px-3 py-1 rounded transition-colors ${filterSegment === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            All Markets ({opportunities.length})
          </button>
          <button
            onClick={() => setFilterSegment('FOREX')}
            className={`px-3 py-1 rounded transition-colors ${filterSegment === 'FOREX' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            Global Forex
          </button>
          <button
            onClick={() => setFilterSegment('METALS_COMMODITIES')}
            className={`px-3 py-1 rounded transition-colors ${filterSegment === 'METALS_COMMODITIES' ? 'bg-amber-500 text-black font-extrabold' : 'text-slate-400 hover:text-white'}`}
          >
            🏆 Metals & Oil
          </button>
          <button
            onClick={() => setFilterSegment('INDIAN_MARKET')}
            className={`px-3 py-1 rounded transition-colors ${filterSegment === 'INDIAN_MARKET' ? 'bg-orange-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
          >
            🇮🇳 NSE India
          </button>
        </div>

        {/* Scanner Opportunities List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 font-mono text-xs scrollbar-thin">
          {filteredOpps.map((opp) => {
            const avgConfidence = Math.round((opp.technicalScore + opp.fundamentalScore + opp.forexScore) / 3);
            const isBuy = opp.bias.includes('BUY');
            const isSell = opp.bias.includes('SELL');

            return (
              <div
                key={opp.pair}
                className="p-3 sm:p-3.5 rounded-xl bg-terminal-950/70 border border-terminal-border hover:border-cyan-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-white text-sm">{opp.pair}</span>
                    <span className="text-[10px] text-slate-400">({opp.segment.replace('_', ' ')})</span>
                    {getGradeBadge(opp.grade)}
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      isBuy
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : isSell
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                    }`}>
                      {opp.bias.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs font-sans">
                    Setup Status: <strong className="text-white">{opp.status.replace(/_/g, ' ')}</strong>. Governance Verdict: <strong className={opp.riskVerdict === 'APPROVED' ? 'text-emerald-400' : opp.riskVerdict === 'MODIFIED' ? 'text-amber-400' : 'text-rose-400'}>{opp.riskVerdict}</strong>.
                  </p>
                  <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400">
                    <span>Current Price: <strong className="text-white">{opp.price}</strong></span>
                    <span>Confidence: <strong className="text-cyan-400">{avgConfidence}%</strong></span>
                    <span>Risk/Reward: <strong className="text-emerald-400">{opp.riskReward}:1</strong></span>
                    <span>Size: <strong className="text-indigo-400">{opp.potentialLots} Lots</strong></span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onSelectPair(opp.pair);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500/30 flex items-center justify-center gap-1.5 transition-all text-xs font-bold shrink-0"
                >
                  <span>Load Chart</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
