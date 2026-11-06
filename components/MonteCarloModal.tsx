'use client';

import React from 'react';
import { MonteCarloProjection } from '@/lib/types';
import { LineChart, Shield, TrendingUp, AlertTriangle } from 'lucide-react';

interface MonteCarloModalProps {
  isOpen: boolean;
  onClose: () => void;
  monteCarlo?: MonteCarloProjection;
  pair: string;
}

export const MonteCarloModal: React.FC<MonteCarloModalProps> = ({
  isOpen,
  onClose,
  monteCarlo,
  pair,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-2xl p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-terminal-border pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400">
              <LineChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Monte Carlo Drawdown & VaR Engine</h3>
              <p className="text-xs text-slate-400 font-mono">
                1,000 simulated institutional paths for {pair} risk management
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors"
          >
            Close
          </button>
        </div>

        {monteCarlo && (
          <div className="space-y-4 font-mono text-xs">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">Simulations</span>
                <span className="text-white font-bold text-base">{monteCarlo.simulationsCount}</span>
                <span className="text-[10px] text-slate-400 block">Stochastic Paths</span>
              </div>

              <div className="p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">Win Probability</span>
                <span className="text-emerald-400 font-bold text-base">{monteCarlo.projectedProfitProbability}%</span>
                <span className="text-[10px] text-slate-400 block">Positive Expectancy</span>
              </div>

              <div className="p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">95% VaR (Risk)</span>
                <span className="text-rose-400 font-bold text-base">${monteCarlo.var95Usd}</span>
                <span className="text-[10px] text-slate-400 block">Max Expected Loss</span>
              </div>

              <div className="p-3 bg-terminal-950 rounded-lg border border-terminal-border">
                <span className="text-slate-400 block text-[10px] uppercase">Sharpe Ratio</span>
                <span className="text-cyan-400 font-bold text-base">{monteCarlo.sharpeRatio}</span>
                <span className="text-[10px] text-slate-400 block">Risk-Adjusted Return</span>
              </div>
            </div>

            {/* Visual simulation fan diagram */}
            <div className="p-4 bg-terminal-950 rounded-lg border border-terminal-border space-y-2">
              <span className="text-slate-400 text-[10px] uppercase block">
                Monte Carlo 1,000-Path Equity Envelope
              </span>
              <svg viewBox="0 0 500 120" className="w-full h-28" preserveAspectRatio="none">
                {/* 95th percentile upper path */}
                <path d="M 0 60 Q 150 40, 300 20 T 500 10" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.8" />
                {/* Median path */}
                <path d="M 0 60 Q 150 55, 300 45 T 500 35" fill="none" stroke="#06b6d4" strokeWidth="2" />
                {/* 5th percentile lower path (VaR) */}
                <path d="M 0 60 Q 150 70, 300 80 T 500 95" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.8" />
                {/* Baseline */}
                <line x1="0" y1="60" x2="500" y2="60" stroke="#475569" strokeDasharray="3 3" />
              </svg>
              <div className="flex items-center justify-between text-[10px] text-slate-400">
                <span className="text-emerald-400">● 95th Percentile (+High Alpha)</span>
                <span className="text-cyan-400">● Median Expected Path</span>
                <span className="text-rose-400">● 5th Percentile (VaR Tail Risk)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
