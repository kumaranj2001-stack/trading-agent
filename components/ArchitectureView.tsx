'use client';

import React from 'react';
import { 
  ShieldCheck, 
  BarChart3, 
  Globe2, 
  Scale, 
  Cpu, 
  Cloud, 
  Newspaper, 
  Database,
  Radio
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 sm:p-5 shadow-lg space-y-6">
      {/* Title */}
      <div className="border-b border-terminal-border pb-4">
        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-cyan-400" />
          <span>Multi-Agent Swarm Architecture // 5 Autonomous Roles</span>
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Complete structural specifications of the 5 autonomous trading roles, 20-source real-time news scraping pipeline, and local browser backend engine.
        </p>
      </div>

      {/* The 5 Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Role 1: Technical Analyst */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-cyan-800/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-600 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 1: Technical Analyst</h3>
              <span className="text-[11px] font-mono text-cyan-400">Algorithmic Price Action & SMC</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Smart Money Concepts:</strong> Identifies 3-bar Fair Value Gaps (FVG), order blocks, and structural liquidity sweeps.</li>
            <li><strong>Momentum Oscillators:</strong> Evaluates RSI (14) dynamic divergences, center-line crosses, and volume absorption.</li>
            <li><strong>Trend Alignments:</strong> Computes EMA 20, 50, and 200 to establish micro and macro trend regimes across MTF frames.</li>
            <li><strong>Volatility Envelopes:</strong> Calculates Bollinger Bands (20, 2) and ATR (14) for volatility expansion and squeeze detection.</li>
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
            <li><strong>Central Bank Policy Stance:</strong> Maps Hawkish, Neutral, and Dovish postures across the Federal Reserve, ECB, BOJ, BoE, and RBI.</li>
            <li><strong>Rate Differentials:</strong> Analyzes sovereign rate spreads and 2Y/10Y yield curves between base and quote economies.</li>
            <li><strong>Indian Market Catalysts:</strong> Monitors FII & DII cash flows, India VIX volatility gauge, and Nifty Put-Call Ratio (PCR).</li>
            <li><strong>Macro Regime Classification:</strong> Categorizes conditions into Policy Divergence, Reflationary, or Stagflationary regimes.</li>
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
              <span className="text-[11px] font-mono text-amber-400">Currency Mechanics & Sessions</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Currency Strength Index:</strong> Computes real-time 0-10 relative strength scoring across G10 and INR currencies.</li>
            <li><strong>Dollar Index (DXY) Trend:</strong> Tracks USD index momentum and transmission across major currency pairs.</li>
            <li><strong>Carry Yield & Cross-Correlations:</strong> Assesses net annual yield differentials and intermarket correlations (Crude Oil, Gold).</li>
            <li><strong>Session Liquidity Radar:</strong> Evaluates trading windows (London, New York, Tokyo, NSE) to prevent thin execution.</li>
          </ul>
        </div>

        {/* Role 4: 📰 News Analyst (NEW DEDICATED 5TH ROLE) */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-blue-800/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-600 text-blue-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 4: News Analyst (David Vance)</h3>
              <span className="text-[11px] font-mono text-blue-400">20 Financial Outlets & Scraper</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>20 Financial Sources Scraped:</strong> Continuously monitors Bloomberg, Reuters, FT, WSJ, CNBC, Forex Factory, Moneycontrol, LiveMint, etc.</li>
            <li><strong>NLP Sentiment Scoring:</strong> Calculates -100 to +100 directional sentiment scores from live headline order flow.</li>
            <li><strong>Breaking Shock Alerts:</strong> Detects sudden central bank statements, emergency interventions, and geopolitics.</li>
            <li><strong>Core Fundamental Reasons:</strong> Synthesizes the core fundamental and news catalysts driving the unified decision.</li>
          </ul>
        </div>

        {/* Role 5: Risk Manager */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-emerald-800/50 space-y-2.5 md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 5: Risk Manager (Sarah Stirling)</h3>
              <span className="text-[11px] font-mono text-emerald-400">Capital Preservation & Veto Gatekeeper</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Absolute Veto Authority:</strong> Cross-examines technical, fundamental, forex, and news proposals; vetoes setups lacking mathematical edge.</li>
            <li><strong>Mathematical Sizing:</strong> Calculates exact position sizing (standard lots) using fixed fractional equity risk (1.0%–1.5%).</li>
            <li><strong>Expectancy & R:R Enforcement:</strong> Enforces minimum 1:1.8 Risk-to-Reward ratio with hard ATR-anchored Stop Loss and Take Profit brackets.</li>
            <li><strong>Monte Carlo Simulation Engine:</strong> Runs 1,000 stochastic price paths to calculate 95% & 99% Value-at-Risk (VaR).</li>
          </ul>
        </div>
      </div>

      {/* Backend & Deployment Architecture */}
      <div className="bg-terminal-950 p-4 rounded-xl border border-terminal-border space-y-3 font-mono text-xs">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Local Browser Backend Storage & Vercel Execution Pipeline</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-cyan-400 font-bold block mb-1">1. Local Browser Storage</span>
            <p className="text-slate-400 text-[11px] font-sans">
              All 20 monitored sources, active scrape feeds, custom headline updates, and unified decision logs are persistently stored in the user's local browser (localStorage).
            </p>
          </div>
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-blue-400 font-bold block mb-1">2. Continuous Real-Time Polling</span>
            <p className="text-slate-400 text-[11px] font-sans">
              A background engine simulates continuous real-time web scraping, updates ping latencies, processes breaking wires, and recalculates sentiment meters.
            </p>
          </div>
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-emerald-400 font-bold block mb-1">3. Unified 5-Role Decision</span>
            <p className="text-slate-400 text-[11px] font-sans">
              Findings from all five roles are compiled into a unified Buy/Sell verdict, immediately backed by the core fundamental reasons displayed directly on the dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
