'use client';

import React from 'react';
import { ShieldCheck, BarChart3, Globe2, Scale, Terminal, CheckCircle, Cpu, Cloud, Code } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-5 shadow-lg space-y-6">
      {/* Title */}
      <div className="border-b border-terminal-border pb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Multi-Agent Swarm Architecture & Assigned Roles</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Complete structural specifications of the 4 autonomous trading roles and Vercel serverless runtime pipeline.
        </p>
      </div>

      {/* The 4 Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Role 1: Technical Analyst */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-cyan-800/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 1: Technical Analyst</h3>
              <span className="text-[11px] font-mono text-cyan-400">Algorithmic Price Action & Indicators</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Moving Average Alignments:</strong> Computes EMA 20, 50, and 200 to establish micro and macro trend regimes.</li>
            <li><strong>Momentum Oscillators:</strong> Evaluates RSI (14) for overbought/oversold extremes, dynamic divergences, and center-line crosses.</li>
            <li><strong>Volatility Envelopes:</strong> Calculates Bollinger Bands (20, 2) and ATR (14) for volatility expansion and squeeze detection.</li>
            <li><strong>Price Action Formations:</strong> Detects Bullish/Bearish Engulfings, Pinbars, Hammers, and key Support/Resistance pivot levels.</li>
          </ul>
        </div>

        {/* Role 2: Fundamental Analyst */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-purple-800/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-purple-950 border border-purple-600 text-purple-400">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 2: Fundamental Analyst</h3>
              <span className="text-[11px] font-mono text-purple-400">Macroeconomics & Monetary Policy</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Central Bank Policy Stance:</strong> Maps Hawkish, Neutral, and Dovish postures across the Federal Reserve, ECB, BOJ, BoE, and RBA.</li>
            <li><strong>Interest Rate Differentials:</strong> Analyzes sovereign rate spreads and bond yield curves between base and quote economies.</li>
            <li><strong>High-Impact Economic Data:</strong> Evaluates CPI/PCE inflation, Non-Farm Payrolls (NFP), GDP growth, and retail sales catalysts.</li>
            <li><strong>Macro Regime Identification:</strong> Categorizes conditions into Policy Divergence, Reflationary, or Stagflationary regimes.</li>
          </ul>
        </div>

        {/* Role 3: Forex Market Analyst */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-amber-800/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-600 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 3: Forex Market Analyst</h3>
              <span className="text-[11px] font-mono text-amber-400">Currency Mechanics, Strength & Sessions</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Currency Strength Index:</strong> Computes real-time 0-10 relative strength scoring across USD, EUR, GBP, JPY, AUD, CAD, CHF, NZD.</li>
            <li><strong>Dollar Index (DXY) Trend:</strong> Tracks USD index momentum and transmission across major currency pairs.</li>
            <li><strong>Carry Trade & Cross-Correlations:</strong> Assesses net annual yield differentials and intermarket correlations (Crude Oil, Gold, Equities).</li>
            <li><strong>Session Liquidity Radar:</strong> Evaluates trading windows (London, New York, Tokyo) to prevent execution in thin illiquid periods.</li>
          </ul>
        </div>

        {/* Role 4: Risk Manager */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-emerald-800/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 4: Risk Manager (Chief Gatekeeper)</h3>
              <span className="text-[11px] font-mono text-emerald-400">Capital Preservation & Veto Authority</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Absolute Veto Power:</strong> Scrutinizes technical, fundamental, and forex proposals; immediately vetoes setups that violate safety rules.</li>
            <li><strong>Mathematical Sizing:</strong> Calculates exact position sizing (standard lots) using fixed fractional equity risk (1-2%).</li>
            <li><strong>Expectancy & R:R Validation:</strong> Enforces minimum 1:1.8 Risk-to-Reward ratio with hard ATR-anchored Stop Loss and Take Profit levels.</li>
            <li><strong>Circuit Breakers:</strong> Halts all trading if account daily drawdown reaches maximum threshold (e.g. 4.0%).</li>
          </ul>
        </div>
      </div>

      {/* Consensus & Vercel Pipeline */}
      <div className="bg-terminal-950 p-4 rounded-xl border border-terminal-border space-y-3 font-mono text-xs">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <Cloud className="w-4 h-4 text-cyan-400" />
          <span>Vercel Cloud Deployment & Execution Pipeline</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-cyan-400 font-bold block mb-1">1. Ingestion & Analysis</span>
            <p className="text-slate-400 text-[11px] font-sans">
              Serverless Node.js runtime receives market tick data and simultaneously invokes the Technical, Fundamental, and Forex specialists.
            </p>
          </div>
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-purple-400 font-bold block mb-1">2. Multi-Turn Debate</span>
            <p className="text-slate-400 text-[11px] font-sans">
              Agents cross-examine assumptions in structured rounds, checking for macro event risks and intermarket contradictions.
            </p>
          </div>
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-emerald-400 font-bold block mb-1">3. Risk Manager Verdict</span>
            <p className="text-slate-400 text-[11px] font-sans">
              Risk Manager issues the binding verdict (APPROVED, MODIFIED, or VETOED) with strict lot sizing and bracket orders.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
