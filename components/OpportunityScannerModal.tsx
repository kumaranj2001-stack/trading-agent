'use client';

import React, { useState } from 'react';
import { MarketScannerOpportunity, CurrencyPair, MarketSegment } from '@/lib/types';
import { Radar, ArrowRight, ShieldCheck, AlertTriangle, XCircle, TrendingUp, TrendingDown, Globe } from 'lucide-react';

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
        return <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">GRADE A+</span>;
      case 'A':
        return <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">GRADE A</span>;
      case 'B':
        return <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30">GRADE B</span>;
      case 'C':
        return <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-slate-500/10 text-slate-400 border border-slate-500/30">GRADE C</span>;
      case 'F':
        return <span className="px-2 py-0.5 rounded text-xs font-bold font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">VETOED (F)</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-4xl p-5 shadow-2xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-terminal-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
              <Radar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Multi-Market Opportunity Scanner</h3>
              <p className="text-xs text-slate-400 font-mono">
                Continuous institutional scanning across Forex & Indian NSE/BSE markets (1,050+ rules)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Segment filter buttons */}
            <div className="flex items-center bg-terminal-950 p-1 rounded-lg border border-terminal-border">
              <button
                onClick={() => setFilterSegment('ALL')}
                className={`px-2 py-0.5 rounded ${filterSegment === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400'}`}
              >
                All ({opportunities.length})
              </button>
              <button
                onClick={() => setFilterSegment('FOREX')}
                className={`px-2 py-0.5 rounded ${filterSegment === 'FOREX' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400'}`}
              >
                Forex
              </button>
              <button
                onClick={() => setFilterSegment('INDIAN_MARKET')}
                className={`px-2 py-0.5 rounded ${filterSegment === 'INDIAN_MARKET' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400'}`}
              >
                🇮🇳 Indian Market
              </button>
            </div>

            <button
              onClick={onRefreshScan}
              disabled={isScanning}
              className="px-3 py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-cyan-400 border border-terminal-border transition-colors disabled:opacity-50"
            >
              {isScanning ? 'SCANNING...' : 'REFRESH'}
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-terminal-border rounded-lg max-h-[500px] scrollbar-thin">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-[11px] sticky top-0">
              <tr>
                <th className="p-3">Rank & Asset</th>
                <th className="p-3">Scope</th>
                <th className="p-3">Price</th>
                <th className="p-3">Analyst Bias</th>
                <th className="p-3">Tech Score</th>
                <th className="p-3">Confluence</th>
                <th className="p-3">Risk Verdict</th>
                <th className="p-3">Lots</th>
                <th className="p-3">R:R Ratio</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/60 bg-terminal-900/60">
              {filteredOpps.map((opp, idx) => (
                <tr key={opp.pair} className="hover:bg-terminal-800/40 transition-colors">
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span className="text-slate-400 text-[10px]">#{idx + 1}</span>
                    <span>{opp.pair}</span>
                  </td>
                  <td className="p-3 text-[11px]">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      opp.segment === 'INDIAN_MARKET' ? 'text-amber-400 bg-amber-950/60' : 'text-cyan-400 bg-cyan-950/60'
                    }`}>
                      {opp.segment === 'INDIAN_MARKET' ? '🇮🇳 NSE' : '🌐 FX'}
                    </span>
                  </td>
                  <td className="p-3 text-slate-200">
                    {opp.pair === 'NIFTY 50' || opp.pair === 'BANK NIFTY' 
                      ? `₹${opp.price.toLocaleString('en-IN')}` 
                      : opp.price.toFixed(opp.pair.includes('JPY') ? 3 : 5)}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      opp.bias.includes('BUY')
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : opp.bias.includes('SELL')
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {opp.bias.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="p-3 text-cyan-400">{opp.technicalScore}%</td>
                  <td className="p-3">{getGradeBadge(opp.grade)}</td>
                  <td className="p-3">
                    <span className={`text-[10px] font-bold ${
                      opp.riskVerdict === 'APPROVED' ? 'text-emerald-400' : opp.riskVerdict === 'MODIFIED' ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {opp.riskVerdict}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{opp.potentialLots > 0 ? `${opp.potentialLots} L` : '-'}</td>
                  <td className="p-3 text-cyan-300">1:{opp.riskReward}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        onSelectPair(opp.pair);
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-bold border border-indigo-500/30 transition-colors flex items-center gap-1 ml-auto"
                    >
                      <span>LOAD</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
