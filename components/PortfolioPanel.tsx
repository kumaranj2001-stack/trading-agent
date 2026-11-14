'use client';

import React, { useState } from 'react';
import { PortfolioState } from '@/lib/store';
import { 
  TrendingUp, 
  TrendingDown, 
  X, 
  Shield, 
  Award, 
  AlertCircle, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Radio, 
  ArrowRight, 
  Clock, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  Wallet
} from 'lucide-react';
import { Position } from '@/lib/types';

interface PortfolioPanelProps {
  portfolio: PortfolioState;
  onClosePosition: (posId: string) => void;
  executionMode?: string;
  theme?: 'dark' | 'light';
}

export const PortfolioPanel: React.FC<PortfolioPanelProps> = ({ 
  portfolio, 
  onClosePosition,
  executionMode = 'MANUAL',
  theme = 'dark',
}) => {
  const totalOpenPnl = portfolio.positions.reduce((sum, p) => sum + p.pnl, 0);
  const winTrades = portfolio.tradeHistory.filter(t => t.outcome === 'WIN').length;
  const totalClosed = portfolio.tradeHistory.length;
  const winRate = totalClosed > 0 ? ((winTrades / totalClosed) * 100).toFixed(1) : '0.0';
  const totalRealizedPnl = portfolio.tradeHistory.reduce((sum, t) => sum + t.pnl, 0);

  const [expandedPositionIds, setExpandedPositionIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedPositionIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cardBaseClass = theme === 'light'
    ? 'bg-white border-slate-200 text-slate-800 shadow-sm'
    : 'bg-terminal-950/90 border-terminal-border/80 text-slate-100 shadow-lg';

  const subBoxClass = theme === 'light'
    ? 'bg-slate-50 border-slate-200 text-slate-800'
    : 'bg-terminal-900/60 border-terminal-border/60 text-slate-200';

  const tableHeaderBg = theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-terminal-950 text-slate-400';
  const tableRowHover = theme === 'light' ? 'hover:bg-slate-50' : 'hover:bg-terminal-900/60';
  const tableBorder = theme === 'light' ? 'border-slate-200' : 'border-terminal-border/60';

  return (
    <div className={`rounded-2xl border p-4 sm:p-5 shadow-xl space-y-4 transition-colors duration-200 ${cardBaseClass}`}>
      {/* Account Metric Cards: 6 Standardized Labeled Containers with Rigorous Typographical Weighting */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 text-xs font-mono">
        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
            Account Balance
          </span>
          <span className={`text-base sm:text-lg font-black block mt-0.5 truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            ${portfolio.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Primary Capital</span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
            Net Equity
          </span>
          <span className={`text-base sm:text-lg font-black block mt-0.5 truncate ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            ${(portfolio.balance + totalOpenPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-cyan-400 block mt-0.5">Live Mark-to-Market</span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
            Free Margin
          </span>
          <span className="text-base sm:text-lg font-black text-cyan-400 block mt-0.5 truncate">
            ${portfolio.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Unencumbered</span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
            Open P&L
          </span>
          <span className={`text-base sm:text-lg font-black block mt-0.5 truncate ${totalOpenPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalOpenPnl >= 0 ? '+' : ''}${totalOpenPnl.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Active Exposure</span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
            Win Rate
          </span>
          <span className="text-base sm:text-lg font-black text-emerald-400 block mt-0.5 truncate">
            {winRate}%
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">{totalClosed} Closed Trades</span>
        </div>

        <div className={`p-3 rounded-xl border min-w-0 ${subBoxClass}`}>
          <span className="text-[10px] text-slate-400 uppercase font-semibold block truncate">
            Realized Profit
          </span>
          <span className={`text-base sm:text-lg font-black block mt-0.5 truncate ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(2)}
          </span>
          <span className="text-[9px] text-slate-400 block mt-0.5">Historical Gain</span>
        </div>
      </div>

      {/* Active Positions */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>
              ACTIVE MARKET POSITIONS ({portfolio.positions.length})
            </h4>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5 shadow-sm text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>DUAL TELEMETRY MONITORING ACTIVE</span>
            </span>
            {executionMode === 'FULL_AUTOPILOT' && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                AUTO-EXIT ON INVALIDATION
              </span>
            )}
          </div>
        </div>

        {portfolio.positions.length === 0 ? (
          <div className={`p-6 border rounded-xl text-center text-xs font-mono ${
            theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-terminal-900/40 border-terminal-border/60 text-slate-400'
          }`}>
            No active positions open. Trigger the Swarm to analyze setups and execute authorized trades.
          </div>
        ) : (
          <div className={`overflow-x-auto scrollbar-thin border rounded-xl shadow-sm ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/80'}`}>
            <table className="w-full text-left text-xs font-mono min-w-[780px]">
              <thead className={`${tableHeaderBg} border-b ${tableBorder} text-[11px] uppercase font-bold sticky top-0`}>
                <tr>
                  <th className="p-3 whitespace-nowrap">Symbol</th>
                  <th className="p-3 whitespace-nowrap">Side</th>
                  <th className="p-3 whitespace-nowrap">Lots</th>
                  <th className="p-3 whitespace-nowrap">Entry</th>
                  <th className="p-3 whitespace-nowrap">Current</th>
                  <th className="p-3 whitespace-nowrap">Stop Loss</th>
                  <th className="p-3 whitespace-nowrap">Take Profit</th>
                  <th className="p-3 whitespace-nowrap">P&L ($)</th>
                  <th className="p-3 whitespace-nowrap">Validation Health</th>
                  <th className="p-3 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tableBorder} font-medium ${theme === 'light' ? 'bg-white' : 'bg-terminal-950/70'}`}>
                {portfolio.positions.map((pos) => {
                  const inv = pos.invalidation;
                  const isInvalid = inv?.isInvalidated;
                  const hasProfit = pos.pnl > 0;
                  const isExpanded = expandedPositionIds[pos.id] ?? true;

                  return (
                    <React.Fragment key={pos.id}>
                      {/* Main Position Row */}
                      <tr className={`${tableRowHover} transition-colors ${
                        isInvalid ? 'bg-rose-500/10 border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'
                      }`}>
                        <td className="p-3 font-bold flex items-center gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => toggleExpand(pos.id)}
                            className="p-0.5 rounded hover:bg-slate-700/30 text-slate-400"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <span className={theme === 'light' ? 'text-slate-900 font-extrabold' : 'text-white'}>{pos.symbol}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-black ${
                            pos.type === 'BUY'
                              ? 'bg-emerald-500/15 text-emerald-400 dark:text-emerald-400 light:text-emerald-700 border border-emerald-500/30'
                              : 'bg-rose-500/15 text-rose-400 dark:text-rose-400 light:text-rose-700 border border-rose-500/30'
                          }`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="p-3 font-bold whitespace-nowrap">{pos.lots}</td>
                        <td className="p-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">{pos.entryPrice}</span>
                            {pos.executionBidAsk && (
                              <span className="px-1 py-0.2 rounded text-[9px] bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-bold">
                                {pos.executionBidAsk.executionSide}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-bold whitespace-nowrap">{pos.currentPrice}</td>
                        <td className="p-3 text-rose-400 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{pos.stopLoss}</span>
                            {(pos.isBreakevenLocked || inv?.isBreakevenLocked) && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold inline-flex items-center gap-0.5">
                                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                BE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-emerald-400 font-bold whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{pos.takeProfit}</span>
                            {(pos.targetCompressed || inv?.targetCompressed) && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                                -50%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`font-black text-sm ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 text-xs whitespace-nowrap">
                          {(pos.structuralOverrideTriggered || inv?.structuralOverrideTriggered) ? (
                            <span className="px-2 py-0.5 rounded bg-rose-600 text-white border border-rose-400 font-bold flex items-center gap-1 w-fit animate-pulse">
                              <ShieldAlert className="w-3 h-3 text-white" />
                              CHoCH OVERRIDE
                            </span>
                          ) : isInvalid ? (
                            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold flex items-center gap-1 w-fit animate-pulse">
                              <AlertTriangle className="w-3 h-3 text-rose-400" />
                              INVALID CRITERIA
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              SETUP VALID
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95 ${
                              isInvalid
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                                : theme === 'light'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                                : 'bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border'
                            }`}
                          >
                            {isInvalid && hasProfit ? 'Close (Lock Profit)' : 'Close'}
                          </button>
                        </td>
                      </tr>

                      {/* Invalidation Details Accordion */}
                      {isExpanded && (
                        <tr className={`${theme === 'light' ? 'bg-slate-50' : 'bg-terminal-950/80'} border-b ${tableBorder}`}>
                          <td colSpan={10} className="p-3">
                            {isInvalid ? (
                              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 space-y-2 text-xs">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/20 pb-2">
                                  <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                                    <span className="font-bold text-rose-400 uppercase tracking-wide">
                                      {(pos.structuralOverrideTriggered || inv?.structuralOverrideTriggered)
                                        ? `🚨 PARAMOUNT STRUCTURAL OVERRIDE (CHoCH DETECTED) ON ${pos.symbol} ${pos.type}`
                                        : `INVALIDATION CRITERIA FORMED ON ${pos.symbol} ${pos.type} ENTRY`}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-slate-400">
                                    Checked: {inv?.lastCheckedTime || 'Just now'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                                  <div className={`p-2.5 rounded-lg border ${subBoxClass}`}>
                                    <span className="font-bold text-cyan-400 uppercase block mb-1">Technical Invalidation:</span>
                                    {inv?.technicalReasons && inv.technicalReasons.length > 0 ? (
                                      inv.technicalReasons.map((tr, idx) => (
                                        <p key={idx} className="leading-snug">• {tr}</p>
                                      ))
                                    ) : (
                                      <p className="text-emerald-400">• Price structure and momentum stable.</p>
                                    )}
                                  </div>
                                  <div className={`p-2.5 rounded-lg border ${subBoxClass}`}>
                                    <span className="font-bold text-amber-400 uppercase block mb-1">Fundamental Invalidation:</span>
                                    {inv?.fundamentalReasons && inv.fundamentalReasons.length > 0 ? (
                                      inv.fundamentalReasons.map((fr, idx) => (
                                        <p key={idx} className="leading-snug">• {fr}</p>
                                      ))
                                    ) : (
                                      <p className="text-emerald-400">• Macro news and central bank regime aligned.</p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                                  <span className="font-bold text-emerald-400">
                                    24/7 DUAL MONITORING ACTIVE:
                                  </span>
                                  <span className="text-slate-300">
                                    Both Technical Structure and Fundamental Macro Wire Feeds remain aligned.
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-[10px] text-slate-400">
                                  <span>R:R: <strong className="text-cyan-400">{pos.riskReward || 2.5}:1</strong></span>
                                  <span>SL Buffer: <strong className="text-rose-400">{Math.abs(pos.currentPrice - pos.stopLoss).toFixed(4)}</strong></span>
                                </div>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Closed Trade History */}
      {portfolio.tradeHistory.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-terminal-border/50">
          <h4 className={`text-xs font-mono font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>
            CLOSED TRADE HISTORY & ATTRIBUTION LOG
          </h4>
          <div className={`overflow-x-auto border rounded-xl max-h-48 scrollbar-thin ${theme === 'light' ? 'border-slate-200' : 'border-terminal-border/80'}`}>
            <table className="w-full text-left font-mono text-xs min-w-[700px]">
              <thead className={`${tableHeaderBg} border-b ${tableBorder} text-[11px] uppercase font-bold sticky top-0`}>
                <tr>
                  <th className="p-2.5 sm:p-3">Pair</th>
                  <th className="p-2.5 sm:p-3">Side</th>
                  <th className="p-2.5 sm:p-3">Lots</th>
                  <th className="p-2.5 sm:p-3">Entry</th>
                  <th className="p-2.5 sm:p-3">Exit</th>
                  <th className="p-2.5 sm:p-3">Outcome</th>
                  <th className="p-2.5 sm:p-3">P&L ($)</th>
                  <th className="p-2.5 sm:p-3">Exit Rationale</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${tableBorder} font-medium ${theme === 'light' ? 'bg-white' : 'bg-terminal-950/70'}`}>
                {portfolio.tradeHistory.map((item) => (
                  <tr key={item.id} className={tableRowHover}>
                    <td className="p-2.5 sm:p-3 font-bold">{item.symbol}</td>
                    <td className="p-2.5 sm:p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        item.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3">{item.lots}</td>
                    <td className="p-2.5 sm:p-3">{item.entryPrice}</td>
                    <td className="p-2.5 sm:p-3">{item.exitPrice}</td>
                    <td className="p-2.5 sm:p-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        item.outcome === 'WIN' 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}>
                        {item.outcome}
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3 font-bold">
                      <span className={item.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {item.pnl >= 0 ? '+' : ''}${item.pnl.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-2.5 sm:p-3 text-[11px] text-slate-400 truncate max-w-[200px]">
                      {item.strategyNotes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
