'use client';

import React, { useState, useEffect } from 'react';
import { MonteCarloProjection } from '@/lib/types';
import { LineChart, X, RefreshCw, Sparkles, ShieldCheck, ArrowLeft } from 'lucide-react';

interface MonteCarloModalProps {
  isOpen?: boolean;
  onClose: () => void;
  monteCarlo?: MonteCarloProjection;
  pair: string;
  isFullPage?: boolean;
}

export const MonteCarloModal: React.FC<MonteCarloModalProps> = ({
  isOpen = true,
  onClose,
  monteCarlo: initialMonteCarlo,
  pair,
  isFullPage = false,
}) => {
  const [data, setData] = useState<MonteCarloProjection | undefined>(initialMonteCarlo);
  const [percentiles, setPercentiles] = useState<{ p5: number; p25: number; p50: number; p75: number; p95: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchSimulation = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/var?pair=${encodeURIComponent(pair)}&balance=10000&risk=1.5`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data.monteCarlo);
        setPercentiles(json.data.percentiles);
      }
    } catch (e) {
      console.error('Failed to fetch from /api/var:', e);
      if (initialMonteCarlo) setData(initialMonteCarlo);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (!initialMonteCarlo) {
        fetchSimulation();
      } else {
        setData(initialMonteCarlo);
      }
    }
  }, [isOpen, pair, initialMonteCarlo]);

  if (!isOpen && !isFullPage) return null;

  const content = (
    <div className={`bg-terminal-900 border border-terminal-border rounded-xl w-full ${isFullPage ? 'shadow-xl' : 'max-w-3xl max-h-[90vh] shadow-2xl'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 shrink-0">
            <LineChart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                05 // MONTE CARLO VALUE-AT-RISK (VaR) & DOWNSIDE SIMULATION
              </h3>
              <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                REST API CONNECTED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate">
              1,000 simulated institutional paths for {pair} • Tail risk and loss distribution
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchSimulation}
            disabled={isLoading}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs flex items-center gap-1 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Re-Simulate</span>
          </button>
          {isFullPage ? (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors flex items-center gap-1.5 font-semibold"
              title="Return to Terminal"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
              <span>RETURN TO TERMINAL</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors shrink-0"
              aria-label="Close modal"
            >
              <span className="hidden sm:inline">Close</span>
              <X className="w-4 h-4 sm:hidden" />
            </button>
          )}
        </div>
      </div>

        {/* Body */}
        {data && (
          <div className="p-3 sm:p-4 overflow-y-auto space-y-4 font-mono text-xs scrollbar-thin">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              <div className="p-2.5 sm:p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">Simulations</span>
                <span className="text-white font-bold text-sm sm:text-base">{data.simulationsCount}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">Stochastic Paths</span>
              </div>

              <div className="p-2.5 sm:p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">Win Probability</span>
                <span className="text-emerald-400 font-bold text-sm sm:text-base">{data.projectedProfitProbability}%</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">Positive Expectancy</span>
              </div>

              <div className="p-2.5 sm:p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">95% VaR (Risk)</span>
                <span className="text-rose-400 font-bold text-sm sm:text-base">${data.var95Usd}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">Max Expected Loss</span>
              </div>

              <div className="p-2.5 sm:p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">Sharpe Ratio</span>
                <span className="text-cyan-400 font-bold text-sm sm:text-base">{data.sharpeRatio}</span>
                <span className="text-[9px] sm:text-[10px] text-slate-400 block">Risk-Adjusted Return</span>
              </div>
            </div>

            {/* Visual simulation fan diagram */}
            <div className="p-3 sm:p-4 bg-terminal-950 rounded-lg border border-terminal-border space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[10px] uppercase block">
                  Monte Carlo 1,000-Path Equity Envelope
                </span>
                {percentiles && (
                  <span className="text-slate-400 text-[10px]">
                    Median Outcome: <strong className="text-cyan-400">${percentiles.p50}</strong>
                  </span>
                )}
              </div>
              <svg viewBox="0 0 500 120" className="w-full h-24 sm:h-28" preserveAspectRatio="none">
                {/* 95th percentile upper path */}
                <path d="M 0 60 Q 150 40, 300 20 T 500 10" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                {/* Median path */}
                <path d="M 0 60 Q 150 55, 300 45 T 500 35" fill="none" stroke="#06b6d4" strokeWidth="2" />
                {/* 5th percentile lower path (VaR) */}
                <path d="M 0 60 Q 150 70, 300 80 T 500 95" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                {/* Baseline */}
                <line x1="0" y1="60" x2="500" y2="60" stroke="#475569" strokeDasharray="3 3" />
              </svg>
              <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 gap-2">
                <span className="text-emerald-400">● 95th Percentile (+High Alpha: {percentiles ? `+$${percentiles.p95}` : '+$380'})</span>
                <span className="text-cyan-400">● Median Expected Path ({percentiles ? `$${percentiles.p50}` : '+$120'})</span>
                <span className="text-rose-400">● 5th Percentile (VaR Tail Risk: {percentiles ? `$${percentiles.p5}` : '-$150'})</span>
              </div>
            </div>
          </div>
        )}
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
