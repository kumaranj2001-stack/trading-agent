'use client';

import React from 'react';
import { PortfolioState } from '@/lib/store';
import { TrendingUp, TrendingDown, X, Shield, Award, AlertCircle } from 'lucide-react';
import { Position } from '@/lib/types';

interface PortfolioPanelProps {
  portfolio: PortfolioState;
  onClosePosition: (posId: string) => void;
}

export const PortfolioPanel: React.FC<PortfolioPanelProps> = ({ portfolio, onClosePosition }) => {
  const totalOpenPnl = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
  const winTrades = portfolio.tradeHistory.filter(t => t.outcome === 'WIN').length;
  const totalClosed = portfolio.tradeHistory.length;
  const winRate = totalClosed > 0 ? ((winTrades / totalClosed) * 100).toFixed(1) : '0.0';
  const totalRealizedPnl = portfolio.tradeHistory.reduce((sum, t) => sum + t.pnl, 0);

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 shadow-lg space-y-4">
      {/* Account Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
        <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
          <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">Account Balance</span>
          <span className="text-white font-bold text-base">
            ${portfolio.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
          <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">Net Equity</span>
          <span className="text-white font-bold text-base">
            ${(portfolio.balance + totalOpenPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
          <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">Free Margin</span>
          <span className="text-cyan-400 font-bold text-base">
            ${portfolio.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
          <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">Open P&L</span>
          <span className={`font-bold text-base ${totalOpenPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalOpenPnl >= 0 ? '+' : ''}${totalOpenPnl.toFixed(2)}
          </span>
        </div>

        <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
          <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">Win Rate</span>
          <span className="text-emerald-400 font-bold text-base">{winRate}%</span>
        </div>

        <div className="bg-terminal-950 p-3 rounded-lg border border-terminal-border">
          <span className="text-slate-400 block text-xs font-semibold uppercase mb-1">Realized Profit</span>
          <span className={`font-bold text-base ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Active Positions */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Market Positions ({portfolio.positions.length})
          </h4>
        </div>

        {portfolio.positions.length === 0 ? (
          <div className="p-4 bg-terminal-950/60 border border-terminal-border rounded-lg text-center text-sm text-slate-400">
            No active positions open. Trigger the Swarm to analyze setups and execute authorized trades.
          </div>
        ) : (
          <div className="overflow-x-auto border border-terminal-border rounded-lg">
            <table className="w-full text-left text-sm">
              <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-xs uppercase font-semibold">
                <tr>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Side</th>
                  <th className="p-3">Lots</th>
                  <th className="p-3">Entry</th>
                  <th className="p-3">Current</th>
                  <th className="p-3">Stop Loss</th>
                  <th className="p-3">Take Profit</th>
                  <th className="p-3">P&L ($)</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-terminal-border/60 bg-terminal-900/60 font-medium">
                {portfolio.positions.map((pos) => (
                  <tr key={pos.id} className="hover:bg-terminal-800/40">
                    <td className="p-3 font-bold text-white">{pos.symbol}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                        pos.type === 'BUY'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300">{pos.lots}</td>
                    <td className="p-3 text-slate-200">{pos.entryPrice}</td>
                    <td className="p-3 text-slate-200">{pos.currentPrice}</td>
                    <td className="p-3 text-rose-400">{pos.stopLoss}</td>
                    <td className="p-3 text-emerald-400">{pos.takeProfit}</td>
                    <td className="p-3">
                      <span className={`font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onClosePosition(pos.id)}
                        className="px-2.5 py-1 rounded bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-xs font-semibold transition-colors border border-rose-600/30"
                      >
                        Close
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closed Trade History */}
      <div>
        <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2">
          Historical Trade Log
        </h4>
        <div className="overflow-x-auto border border-terminal-border rounded-lg max-h-48 scrollbar-thin">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-xs uppercase font-semibold sticky top-0">
              <tr>
                <th className="p-3">Pair</th>
                <th className="p-3">Side</th>
                <th className="p-3">Lots</th>
                <th className="p-3">Entry</th>
                <th className="p-3">Exit</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">P&L ($)</th>
                <th className="p-3">Governance Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-terminal-border/60 bg-terminal-900/60 font-medium">
              {portfolio.tradeHistory.map((item) => (
                <tr key={item.id} className="hover:bg-terminal-800/40">
                  <td className="p-3 font-bold text-white">{item.symbol}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      item.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="p-3 text-slate-300">{item.lots}</td>
                  <td className="p-3 text-slate-200">{item.entryPrice}</td>
                  <td className="p-3 text-slate-200">{item.exitPrice}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                      item.outcome === 'WIN' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {item.outcome}
                    </span>
                  </td>
                  <td className="p-3">
                    <span className={`font-bold ${item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                    </span>
                  </td>
                  <td className="p-3 text-xs text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-terminal-800 border border-terminal-border text-xs font-semibold">
                      {item.riskManagerVerdict}
                    </span>
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
