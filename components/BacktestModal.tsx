'use client';

import React, { useState } from 'react';
import { History, Play, CheckCircle, XCircle, ShieldAlert, Award, ArrowUpRight } from 'lucide-react';
import { CurrencyPair } from '@/lib/types';

interface BacktestSummary {
  totalScenarios: number;
  executedTrades: number;
  vetoedTrades: number;
  winCount: number;
  lossCount: number;
  winRatePercent: number;
  totalPnlUsd: number;
  profitFactor: number;
  maxDrawdownPercent: number;
}

interface BacktestScenarioItem {
  scenarioName: string;
  pair: CurrencyPair;
  action: 'BUY' | 'SELL' | 'NO_TRADE';
  riskVerdict: 'APPROVED' | 'MODIFIED' | 'VETOED';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pnlUsd: number;
  outcome: 'WIN' | 'LOSS' | 'SCRATCH';
  rationale: string;
}

export const BacktestView: React.FC = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<BacktestSummary | null>(null);
  const [scenarios, setScenarios] = useState<BacktestScenarioItem[]>([]);

  const runBacktest = async () => {
    setIsRunning(true);
    try {
      const res = await fetch('/api/backtest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pair: 'EUR/USD' }),
      });
      const data = await res.json();
      if (data.success) {
        setSummary(data.data.summary);
        setScenarios(data.data.scenarios);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-5 shadow-lg space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-terminal-border pb-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            <span>Macroeconomic Backtest & Stress Testing Simulator</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Test the 4-agent swarm against historical volatility spikes, central bank surprise rate cuts, and NFP announcements.
          </p>
        </div>

        <button
          onClick={runBacktest}
          disabled={isRunning}
          className="px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono text-xs font-bold rounded-lg flex items-center gap-2 shadow-lg shadow-amber-600/20 disabled:opacity-50 transition-all active:scale-95"
        >
          <Play className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'SIMULATING SCENARIOS...' : 'EXECUTE FULL BACKTEST'}</span>
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
            <span className="text-slate-400 block text-[10px] uppercase">Win Rate</span>
            <span className="text-emerald-400 font-bold text-lg">{summary.winRatePercent}%</span>
            <span className="text-[10px] text-slate-400 block">
              {summary.winCount} Wins / {summary.lossCount} Losses
            </span>
          </div>

          <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
            <span className="text-slate-400 block text-[10px] uppercase">Total Backtest P&L</span>
            <span className={`font-bold text-lg ${summary.totalPnlUsd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {summary.totalPnlUsd >= 0 ? '+' : ''}${summary.totalPnlUsd.toFixed(2)}
            </span>
            <span className="text-[10px] text-slate-400 block">Net Cumulative Equity</span>
          </div>

          <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
            <span className="text-slate-400 block text-[10px] uppercase">Profit Factor</span>
            <span className="text-cyan-400 font-bold text-lg">{summary.profitFactor}</span>
            <span className="text-[10px] text-slate-400 block">Gross Profit / Gross Loss</span>
          </div>

          <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
            <span className="text-slate-400 block text-[10px] uppercase">Risk Manager Vetoes</span>
            <span className="text-amber-400 font-bold text-lg">{summary.vetoedTrades} Trades</span>
            <span className="text-[10px] text-slate-400 block">Dangerous setups filtered</span>
          </div>
        </div>
      )}

      {scenarios.length > 0 ? (
        <div className="overflow-x-auto border border-terminal-border rounded-lg">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-[11px]">
              <tr>
                <th className="p-3">Scenario / Macro Catalyst</th>
                <th className="p-3">Pair</th>
                <th className="p-3">Action</th>
                <th className="p-3">Verdict</th>
                <th className="p-3">Lots</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">P&L ($)</th>
                <th className="p-3">Risk Manager Decision Reasoning</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/60 bg-terminal-900/60">
              {scenarios.map((sc, idx) => (
                <tr key={idx} className="hover:bg-terminal-800/40">
                  <td className="p-3 font-semibold text-white">{sc.scenarioName}</td>
                  <td className="p-3 text-cyan-400">{sc.pair}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sc.action === 'BUY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : sc.action === 'SELL'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {sc.action}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sc.riskVerdict === 'APPROVED'
                        ? 'text-emerald-400'
                        : sc.riskVerdict === 'MODIFIED'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {sc.riskVerdict}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{sc.lots}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      sc.outcome === 'WIN'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : sc.outcome === 'LOSS'
                        ? 'bg-rose-500/10 text-rose-400'
                        : 'bg-slate-500/10 text-slate-400'
                    }`}>
                      {sc.outcome}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${sc.pnlUsd > 0 ? 'text-emerald-400' : sc.pnlUsd < 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {sc.pnlUsd > 0 ? '+' : ''}${sc.pnlUsd.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-[11px] text-slate-300 max-w-xs truncate" title={sc.rationale}>
                    {sc.rationale}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-8 text-center bg-terminal-950/60 border border-terminal-border rounded-xl text-slate-400 font-mono text-xs">
          Click &quot;EXECUTE FULL BACKTEST&quot; to simulate how the Technical, Fundamental, Forex Analysts, and Risk Manager perform across historical high-volatility market events.
        </div>
      )}
    </div>
  );
};
