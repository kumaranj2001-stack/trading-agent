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
  Lock
} from 'lucide-react';
import { Position } from '@/lib/types';

interface PortfolioPanelProps {
  portfolio: PortfolioState;
  onClosePosition: (posId: string) => void;
  executionMode?: string;
}

export const PortfolioPanel: React.FC<PortfolioPanelProps> = ({ 
  portfolio, 
  onClosePosition,
  executionMode = 'MANUAL'
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

  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 shadow-lg space-y-4">
      {/* Account Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 text-sm">
        <div className="bg-terminal-950 p-2.5 sm:p-3 rounded-lg border border-terminal-border min-w-0">
          <span className="text-slate-400 block text-[11px] sm:text-xs font-semibold uppercase mb-1 truncate">Account Balance</span>
          <span className="text-white font-bold text-sm sm:text-base block truncate">
            ${portfolio.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-terminal-950 p-2.5 sm:p-3 rounded-lg border border-terminal-border min-w-0">
          <span className="text-slate-400 block text-[11px] sm:text-xs font-semibold uppercase mb-1 truncate">Net Equity</span>
          <span className="text-white font-bold text-sm sm:text-base block truncate">
            ${(portfolio.balance + totalOpenPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-terminal-950 p-2.5 sm:p-3 rounded-lg border border-terminal-border min-w-0">
          <span className="text-slate-400 block text-[11px] sm:text-xs font-semibold uppercase mb-1 truncate">Free Margin</span>
          <span className="text-cyan-400 font-bold text-sm sm:text-base block truncate">
            ${portfolio.freeMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-terminal-950 p-2.5 sm:p-3 rounded-lg border border-terminal-border min-w-0">
          <span className="text-slate-400 block text-[11px] sm:text-xs font-semibold uppercase mb-1 truncate">Open P&L</span>
          <span className={`font-bold text-sm sm:text-base block truncate ${totalOpenPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalOpenPnl >= 0 ? '+' : ''}${totalOpenPnl.toFixed(2)}
          </span>
        </div>

        <div className="bg-terminal-950 p-2.5 sm:p-3 rounded-lg border border-terminal-border min-w-0">
          <span className="text-slate-400 block text-[11px] sm:text-xs font-semibold uppercase mb-1 truncate">Win Rate</span>
          <span className="text-emerald-400 font-bold text-sm sm:text-base block truncate">{winRate}%</span>
        </div>

        <div className="bg-terminal-950 p-2.5 sm:p-3 rounded-lg border border-terminal-border min-w-0">
          <span className="text-slate-400 block text-[11px] sm:text-xs font-semibold uppercase mb-1 truncate">Realized Profit</span>
          <span className={`font-bold text-sm sm:text-base block truncate ${totalRealizedPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalRealizedPnl >= 0 ? '+' : ''}${totalRealizedPnl.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Active Positions */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Active Market Positions ({portfolio.positions.length})
          </h4>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded bg-indigo-950/70 border border-indigo-500/40 text-indigo-300 flex items-center gap-1.5 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>SECOND-BY-SECOND DUAL MONITORING: ACTIVE</span>
            </span>
            {executionMode === 'FULL_AUTOPILOT' && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold">
                AUTO-EXIT ON INVALIDATION
              </span>
            )}
          </div>
        </div>

        {portfolio.positions.length === 0 ? (
          <div className="p-4 bg-terminal-950/60 border border-terminal-border rounded-lg text-center text-sm text-slate-400">
            No active positions open. Trigger the Swarm to analyze setups and execute authorized trades.
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-thin touch-pan-x border border-terminal-border rounded-lg">
            <table className="w-full text-left text-sm min-w-[750px]">
              <thead className="bg-terminal-950 text-slate-400 border-b border-terminal-border text-xs uppercase font-semibold">
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
              <tbody className="divide-y divide-terminal-border/60 bg-terminal-900/60 font-medium">
                {portfolio.positions.map((pos) => {
                  const inv = pos.invalidation;
                  const isInvalid = inv?.isInvalidated;
                  const hasProfit = pos.pnl > 0;
                  const isExpanded = expandedPositionIds[pos.id] ?? true;

                  return (
                    <React.Fragment key={pos.id}>
                      {/* Main Position Row */}
                      <tr className={`hover:bg-terminal-800/40 transition-colors ${
                        isInvalid ? 'bg-rose-950/20 border-l-4 border-l-rose-500' : 'border-l-4 border-l-emerald-500'
                      }`}>
                        <td className="p-3 font-bold text-white flex items-center gap-1.5 whitespace-nowrap">
                          <button
                            onClick={() => toggleExpand(pos.id)}
                            className="p-0.5 rounded hover:bg-terminal-800 text-slate-400 hover:text-white"
                          >
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                          <span>{pos.symbol}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                            pos.type === 'BUY'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {pos.type}
                          </span>
                        </td>
                        <td className="p-3 text-slate-300 font-mono whitespace-nowrap">{pos.lots}</td>
                        <td className="p-3 text-slate-200 font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{pos.entryPrice}</span>
                            {pos.executionBidAsk && (
                              <span className="px-1 py-0.5 rounded text-[9px] bg-cyan-950/70 border border-cyan-800 text-cyan-300 font-bold" title={`Executed at Live Market ${pos.executionBidAsk.executionSide} (Spread: ${pos.executionBidAsk.spread})`}>
                                {pos.executionBidAsk.executionSide}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-slate-200 font-mono whitespace-nowrap">{pos.currentPrice}</td>
                        <td className="p-3 text-rose-400 font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{pos.stopLoss}</span>
                            {(pos.isBreakevenLocked || inv?.isBreakevenLocked) && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold inline-flex items-center gap-0.5 shadow-sm" title="1:1 Breakeven Locked (Zero Downside Risk)">
                                <Lock className="w-2.5 h-2.5 text-emerald-400" />
                                BE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 text-emerald-400 font-mono whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span>{pos.takeProfit}</span>
                            {(pos.targetCompressed || inv?.targetCompressed) && (
                              <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold inline-flex items-center gap-0.5 shadow-sm" title="Target Compressed 50% on Confidence Decay">
                                <Zap className="w-2.5 h-2.5 text-amber-400" />
                                -50%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 font-mono whitespace-nowrap">
                          <span className={`font-bold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-xs whitespace-nowrap">
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
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1 w-fit">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              SETUP VALID
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => onClosePosition(pos.id)}
                            className={`px-3 py-1 rounded text-xs font-bold transition-all shadow-sm ${
                              isInvalid
                                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                                : 'bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border'
                            }`}
                          >
                            {isInvalid && hasProfit ? 'Close (Lock Profit)' : 'Close'}
                          </button>
                        </td>
                      </tr>

                      {/* 🛡️ Explicit Second-by-Second Technical & Fundamental Invalidation Details Bar Below Entry */}
                      {isExpanded && (
                        <tr className="bg-terminal-950/80 border-b border-terminal-border/80">
                          <td colSpan={10} className="p-3">
                            {isInvalid ? (
                              /* INVALIDATION DETECTED CARD BELOW ENTRY */
                              <div className="p-3 rounded-lg bg-gradient-to-r from-rose-950/50 via-terminal-900 to-amber-950/40 border border-rose-500/50 space-y-2.5 font-mono text-xs shadow-md">
                                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rose-500/30 pb-2">
                                  <div className="flex items-center gap-2">
                                    <ShieldAlert className="w-4 h-4 text-rose-400 animate-pulse shrink-0" />
                                    <span className="font-bold text-rose-300 uppercase tracking-wide text-xs">
                                      {(pos.structuralOverrideTriggered || inv?.structuralOverrideTriggered)
                                        ? `🚨 PARAMOUNT STRUCTURAL OVERRIDE (CHoCH DETECTED) ON ${pos.symbol} ${pos.type}`
                                        : `INVALIDATION CRITERIA FORMED ON ${pos.symbol} ${pos.type} ENTRY`}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-slate-400">
                                      Checked: {inv?.lastCheckedTime || 'Just now'}
                                    </span>
                                    {hasProfit ? (
                                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-[11px]">
                                        SMALL PROFIT AVAILABLE (+${pos.pnl.toFixed(2)})
                                      </span>
                                    ) : (
                                      <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold text-[11px]">
                                        CAPITAL PRESERVATION LEVEL (-${Math.abs(pos.pnl).toFixed(2)})
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Granular Technical & Fundamental Breakdown */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                                  {/* Technical Reasons */}
                                  <div className="p-2.5 rounded bg-terminal-950 border border-rose-900/60 space-y-1">
                                    <div className="text-[10px] font-bold text-cyan-400 uppercase flex items-center gap-1 mb-1">
                                      <Layers className="w-3 h-3" />
                                      <span>Technical Invalidation Reasons (Live Ticker):</span>
                                    </div>
                                    {inv?.technicalReasons && inv.technicalReasons.length > 0 ? (
                                      inv.technicalReasons.map((tr, idx) => (
                                        <p key={idx} className="text-slate-300 leading-snug pl-1 border-l-2 border-rose-500/60">
                                          • {tr}
                                        </p>
                                      ))
                                    ) : (
                                      <p className="text-emerald-400">• Price structure and momentum stable.</p>
                                    )}
                                  </div>

                                  {/* Fundamental Reasons */}
                                  <div className="p-2.5 rounded bg-terminal-950 border border-rose-900/60 space-y-1">
                                    <div className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1 mb-1">
                                      <Radio className="w-3 h-3" />
                                      <span>Fundamental & Wire Invalidation Reasons (Live):</span>
                                    </div>
                                    {inv?.fundamentalReasons && inv.fundamentalReasons.length > 0 ? (
                                      inv.fundamentalReasons.map((fr, idx) => (
                                        <p key={idx} className="text-slate-300 leading-snug pl-1 border-l-2 border-amber-500/60">
                                          • {fr}
                                        </p>
                                      ))
                                    ) : (
                                      <p className="text-emerald-400">• Macro news and central bank regime aligned.</p>
                                    )}
                                  </div>
                                </div>

                                {/* Urgent Recommendation & Direct Close Action */}
                                <div className="p-2 rounded bg-rose-950/70 border border-rose-800/80 flex flex-wrap items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 text-slate-200">
                                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                                    <span>
                                      <strong className="text-rose-300">RECOMMENDATION TO CLOSE ENTRY:</strong>{' '}
                                      {hasProfit
                                        ? `Close entry immediately to secure small profit of +$${pos.pnl.toFixed(2)} before invalidation creates downside loss.`
                                        : `Close entry immediately to cut loss at -$${Math.abs(pos.pnl).toFixed(2)} and preserve account capital.`}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => onClosePosition(pos.id)}
                                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95 shrink-0"
                                  >
                                    <span>
                                      {hasProfit
                                        ? `SECURE SMALL PROFIT (+${pos.pnl.toFixed(2)})`
                                        : `CLOSE ENTRY & PRESERVE CAPITAL`}
                                    </span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              /* HEALTHY ENTRY STATUS BAR BELOW ENTRY */
                              <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] text-slate-300">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>
                                    <strong className="text-emerald-300">24/7 DUAL MONITORING ACTIVE:</strong> Both Technical Structure and Fundamental Macro Wire Feeds are aligned.
                                    {(pos.isBreakevenLocked || inv?.isBreakevenLocked) && (
                                      <span className="ml-2 text-emerald-300 font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30 inline-flex items-center gap-1">
                                        <Lock className="w-2.5 h-2.5" /> 1:1 BREAKEVEN LOCKED
                                      </span>
                                    )}
                                    {(pos.targetCompressed || inv?.targetCompressed) && (
                                      <span className="ml-2 text-amber-300 font-bold bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/30 inline-flex items-center gap-1">
                                        <Zap className="w-2.5 h-2.5" /> TARGET COMPRESSED 50%
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400 text-[10px]">
                                  <span>Target R:R: <strong className="text-cyan-400">{pos.riskReward || 2.5}:1</strong></span>
                                  <span>SL Buffer: <strong className="text-rose-400">{Math.abs(pos.currentPrice - pos.stopLoss).toFixed(4)}</strong></span>
                                  <span>Last Checked: {inv?.lastCheckedTime || 'Active Live Loop'}</span>
                                </div>
                              </div>
                            )}

                            {/* Mandated Explicit Invalidation Criteria & Gatekeeper Signature */}
                            {pos.explicitInvalidationCriteria && (
                              <div className="mt-2 p-2 rounded-lg bg-terminal-950/90 border border-terminal-border/80 flex flex-wrap items-center justify-between gap-2 font-mono text-[10px] text-slate-300">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-cyan-400 font-bold uppercase">MANDATED INVALIDATION CRITERIA:</span>
                                  <span>{pos.explicitInvalidationCriteria}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                  {pos.invalidationPriceLevel && (
                                    <span>Trigger Level: <strong className="text-rose-400">{pos.invalidationPriceLevel}</strong></span>
                                  )}
                                  {pos.chiefReviewerSignature && (
                                    <span className="text-emerald-400">Cleared: {pos.chiefReviewerSignature}</span>
                                  )}
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
                <th className="p-3">Exit Rationale & Invalidation Notes</th>
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
                    <span className="text-[11px] text-slate-300 block">
                      {item.strategyNotes}
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
