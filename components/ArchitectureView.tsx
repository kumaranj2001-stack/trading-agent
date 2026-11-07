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
  Radio, 
  Database, 
  HardDrive 
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  return (
    <div className="bg-terminal-900 border border-terminal-border rounded-xl p-4 sm:p-6 shadow-lg space-y-6">
      {/* Title */}
      <div className="border-b border-terminal-border pb-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>5-Agent Institutional Swarm Architecture & Roles</span>
          </h2>
          <span className="px-2.5 py-0.5 rounded text-[11px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/40">
            5 ROLES + 18 NEWS WIRES
          </span>
        </div>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Complete structural specifications of the 5 autonomous trading roles, real-time financial news scraper, and local browser persistence engine.
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
            <li><strong>Smart Money Concepts:</strong> Identifies Order Blocks, 3-bar Fair Value Gaps (FVG), Liquidity Sweeps, and CHOCH structural shifts.</li>
            <li><strong>Moving Average Ribbons:</strong> Computes EMA 20, 50, and 200 to establish micro and macro trend regimes across multi-timeframes.</li>
            <li><strong>Momentum Oscillators:</strong> Evaluates RSI (14) for dynamic divergences, overbought/oversold extremes, and 50-centerline crosses.</li>
            <li><strong>Precious Metals & Forex Pips:</strong> Dynamic volatility scaling tailored for Spot Gold ($/oz), Silver, Crude Oil, and FX Majors.</li>
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
              <span className="text-[11px] font-mono text-purple-400">Macroeconomics & Sovereign Policy</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Central Bank Policy Stance:</strong> Maps Hawkish, Neutral, and Dovish postures across the Fed, ECB, BOJ, BoE, and RBI.</li>
            <li><strong>Interest Rate Differentials:</strong> Analyzes sovereign rate spreads and 2Y/10Y bond yield curve inversions.</li>
            <li><strong>Real Yield Dynamics:</strong> Tracks TIPS real yields and inflation expectations directly driving Gold and commodities.</li>
            <li><strong>Indian Market Telemetry:</strong> Evaluates FII & DII cash flows, India VIX, NIFTY Put-Call Ratio (PCR), and RBI repo rate.</li>
          </ul>
        </div>

        {/* Role 3: Real-Time News Analyst (NEW 5th ROLE) */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-sky-800/60 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-600 text-sky-400">
              <Newspaper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 3: Real-Time News Analyst</h3>
              <span className="text-[11px] font-mono text-sky-400">18 Financial Websites & Wire Scraper</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>18 Monitored Outlets:</strong> Continuous scraping of Bloomberg, Reuters, Kitco, WSJ, CNBC, FT, DailyFX, FXStreet, and Forexlive.</li>
            <li><strong>Precious Metals Wire:</strong> Tracks central bank bullion accumulations, Comex vault drawdowns, and LBMA delivery spreads.</li>
            <li><strong>Breaking Wire Alerts:</strong> Instant detection of geopolitical tensions, OPEC+ emergency quotes, and flash macro prints.</li>
            <li><strong>Sentiment Scoring:</strong> Generates a continuous -1.0 to +1.0 sentiment score and Market Mood gauge (Risk-On / Risk-Off).</li>
          </ul>
        </div>

        {/* Role 4: Forex & Intermarket Dynamics Analyst */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-amber-800/50 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-950 border border-amber-600 text-amber-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 4: Forex & Market Dynamics</h3>
              <span className="text-[11px] font-mono text-amber-400">Currency Mechanics & Commodities</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Currency Strength Index:</strong> Computes real-time 0-10 relative strength scoring across USD, EUR, GBP, JPY, AUD, CAD, CHF.</li>
            <li><strong>Dollar Index (DXY) Transmission:</strong> Tracks USD index momentum and inverse correlation against Gold and Silver.</li>
            <li><strong>Carry Trade & Cross-Correlations:</strong> Assesses net annual yield differentials and intermarket correlations (Crude Oil, Gold, Equities).</li>
            <li><strong>Session Liquidity Radar:</strong> Evaluates trading windows (London, New York, Tokyo, NSE India) to prevent execution in thin sessions.</li>
          </ul>
        </div>

        {/* Role 5: Risk Manager & Gatekeeper */}
        <div className="bg-terminal-950 p-4 rounded-xl border border-emerald-800/50 space-y-2.5 md:col-span-2 lg:col-span-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Role 5: Risk Manager (Chief Gatekeeper)</h3>
              <span className="text-[11px] font-mono text-emerald-400">Capital Preservation, Sizing & Absolute Veto</span>
            </div>
          </div>
          <ul className="text-xs text-slate-300 font-sans space-y-1.5 list-disc pl-4">
            <li><strong>Absolute Veto Authority:</strong> Automatically rejects setups where technical, fundamental, and news signals contradict.</li>
            <li><strong>Mathematical Expectancy:</strong> Enforces minimum 1:1.8 Risk-to-Reward ratio with hard volatility-insulated stop losses.</li>
            <li><strong>1,000-Path Monte Carlo Engine:</strong> Simulates 1,000 stochastic price paths to calculate 95% Value-at-Risk (VaR) and win probability.</li>
            <li><strong>Circuit Breaker Protection:</strong> Imposes hard daily drawdown ceilings (e.g. 4.0%) to prevent emotional drawdown expansion.</li>
          </ul>
        </div>
      </div>

      {/* Backend & Firebase Cloud Firestore + Local Storage Architecture */}
      <div className="bg-terminal-950 p-4 rounded-xl border border-terminal-border space-y-3 font-mono text-xs">
        <h4 className="text-white font-bold text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-400" />
          <span>Firebase Cloud Firestore Backend & Local Storage Persistence</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-amber-400 font-bold block mb-1">1. Firebase Firestore Backend</span>
            <p className="text-slate-400 text-[11px] font-sans">
              Connected to project <code>trading-autonomous-agent</code>. Automatically synchronizes portfolio state, trade logs, consensus history, and execution parameters to Cloud Firestore in real time.
            </p>
          </div>
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-cyan-400 font-bold block mb-1">2. Local Browser Cache</span>
            <p className="text-slate-400 text-[11px] font-sans">
              All portfolio state, open positions, trade history, risk configurations, and decision logs are also mirrored in browser storage (<code>localStorage</code>) for instant 0ms latency offline/online operation.
            </p>
          </div>
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-sky-400 font-bold block mb-1">3. 18-Source News Wire Scraper</span>
            <p className="text-slate-400 text-[11px] font-sans">
              Client-side and serverless scraping pipelines continuously ingest real-time headlines across Bloomberg, Reuters, Kitco, WSJ, CNBC, and FT with instant sentiment classification.
            </p>
          </div>
          <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-emerald-400 font-bold block mb-1">4. Unified 5-Role Decision</span>
            <p className="text-slate-400 text-[11px] font-sans">
              Outputs a single consolidated BUY or SELL direction alongside the 5 underlying core fundamental, news, technical, intermarket, and risk reasons driving the decision.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
