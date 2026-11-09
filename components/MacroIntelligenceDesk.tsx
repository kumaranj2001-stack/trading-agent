'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Globe,
  TrendingUp,
  TrendingDown,
  Shield,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Activity,
  FileText,
  Download,
  ExternalLink,
  ChevronRight,
  Database,
  Radio,
  Sliders,
  DollarSign
} from 'lucide-react';
import { 
  CurrencyPair, 
  MacroCatalystCategory, 
  MacroCatalystEvent, 
  MacroIntelligenceReport, 
  MacroSignalType 
} from '@/lib/types';
import { HIGH_IMPACT_MACRO_CATALYSTS, macroIntelligenceEngine } from '@/lib/macroIntelligenceEngine';
import { BASE_PRICES } from '@/lib/marketData';

export interface MacroIntelligenceDeskProps {
  isFullPage?: boolean;
  onClose?: () => void;
  selectedPair: CurrencyPair;
  onSelectPair?: (pair: CurrencyPair) => void;
  onExecuteTrade?: (tradeParams?: any) => void;
  onSyncToTerminal?: (params: {
    symbol: CurrencyPair;
    direction: 'BUY' | 'SELL';
    entry: number;
    stopLoss: number;
    takeProfit: number;
  }) => void;
}

export const MacroIntelligenceDesk: React.FC<MacroIntelligenceDeskProps> = ({
  isFullPage = true,
  onClose,
  selectedPair: initialPair = 'XAU/USD',
  onSelectPair,
  onExecuteTrade,
  onSyncToTerminal,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<MacroCatalystCategory | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<string>(HIGH_IMPACT_MACRO_CATALYSTS[0].id);
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(initialPair);
  const [activeReport, setActiveReport] = useState<MacroIntelligenceReport | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationStep, setGenerationStep] = useState<string>('');
  const [historyReports, setHistoryReports] = useState<MacroIntelligenceReport[]>([]);
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);

  // Sync initialPair if parent changes
  useEffect(() => {
    if (initialPair) {
      setSelectedPair(initialPair);
    }
  }, [initialPair]);

  // Load persistent history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('qri_macro_intelligence_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setHistoryReports(parsed.slice(0, 10));
        }
      }
    } catch (e) {
      console.error('Failed to load macro history:', e);
    }
  }, []);

  // Filter catalysts
  const filteredCatalysts = HIGH_IMPACT_MACRO_CATALYSTS.filter((item) => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.currency.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeCatalyst = HIGH_IMPACT_MACRO_CATALYSTS.find(c => c.id === selectedEventId) || HIGH_IMPACT_MACRO_CATALYSTS[0];

  // Dynamically populated correlated pairs
  const correlatedPairs: CurrencyPair[] = activeCatalyst ? activeCatalyst.correlatedPairs : ['XAU/USD', 'EUR/USD', 'WTI_CRUDE'];

  // Handle switching catalyst
  const handleSelectCatalyst = (eventId: string) => {
    setSelectedEventId(eventId);
    const cat = HIGH_IMPACT_MACRO_CATALYSTS.find(c => c.id === eventId);
    if (cat && cat.correlatedPairs.length > 0) {
      if (!cat.correlatedPairs.includes(selectedPair)) {
        const newPair = cat.correlatedPairs[0];
        setSelectedPair(newPair);
        if (onSelectPair) onSelectPair(newPair);
      }
    }
  };

  // Generate Report Action
  const handleGenerateReport = async (forceUnconfirmed: boolean = false) => {
    setIsGenerating(true);
    setGenerationStep('Connecting to 38 Primary Financial Feeds & Central Bank Ports...');

    setTimeout(() => {
      setGenerationStep('Executing Autonomous Low-Latency Fallback Scraper...');
    }, 350);

    setTimeout(() => {
      setGenerationStep('Cross-Verifying Actual vs Forecast Figures (95% Confidence Threshold)...');
    }, 700);

    setTimeout(() => {
      setGenerationStep('Synthesizing Order Flow Imbalances & Technical Structure...');
    }, 1050);

    setTimeout(async () => {
      try {
        const res = await fetch('/api/macro-intelligence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: selectedEventId,
            symbol: selectedPair,
            forceUnconfirmed,
          }),
        });
        const json = await res.json();
        if (json.success && json.data) {
          const rep: MacroIntelligenceReport = json.data;
          setActiveReport(rep);

          // Save to local storage history
          const updated = [rep, ...historyReports.slice(0, 9)];
          setHistoryReports(updated);
          try {
            localStorage.setItem('qri_macro_intelligence_history', JSON.stringify(updated));
          } catch (e) {
            console.error('Storage error:', e);
          }
        }
      } catch (err) {
        console.error('Failed to generate report:', err);
      } finally {
        setIsGenerating(false);
        setGenerationStep('');
      }
    }, 1400);
  };

  // Generate initial default report on first load if none active
  useEffect(() => {
    if (!activeReport) {
      const rep = macroIntelligenceEngine.generateMacroIntelligenceReport(selectedEventId, selectedPair);
      setActiveReport(rep);
    }
  }, [selectedEventId, selectedPair]);

  // Export Report as JSON
  const handleExportJson = () => {
    if (!activeReport) return;
    const blob = new Blob([JSON.stringify(activeReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qri-macro-intelligence-${activeReport.catalystEvent.id}-${activeReport.selectedPair.replace('/', '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Sync to Terminal Handler
  const handleApplyToTerminal = () => {
    if (!activeReport || activeReport.signal === 'UNCONFIRMED') return;
    if (onSyncToTerminal) {
      onSyncToTerminal({
        symbol: activeReport.selectedPair,
        direction: activeReport.signal,
        entry: activeReport.executionParameters.entryZone.recommendedEntry,
        stopLoss: activeReport.executionParameters.stopLoss,
        takeProfit: activeReport.executionParameters.takeProfit1,
      });
    }
    if (onClose) onClose();
  };

  return (
    <div className="space-y-4 animate-fade-in w-full">
      {/* 09 // Top Institutional Header */}
      <div className="p-4 sm:p-5 rounded-2xl bg-terminal-900 border border-terminal-border shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-cyan-600 via-indigo-600 to-purple-600 border border-cyan-400/40 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 shrink-0">
            <Zap className="w-5 h-5 text-cyan-200 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-wide truncate">
                09 // QRI TRADER // EVENT-DRIVEN MACRO INTELLIGENCE & EXECUTION ENGINE
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-cyan-400 animate-ping" />
                38 WIRES SYNCED
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-bold">
                AUTONOMOUS FALLBACK ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5 truncate">
              Real-time bidirectional synchronization • 95% Confidence Fail-Safe Convergence • Calculated SL/TP Execution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-200 hover:text-white border border-terminal-border font-mono text-xs font-semibold flex items-center gap-2 transition-all shadow-sm active:scale-95"
              title="Return to Active Terminal"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-400" />
              <span>RETURN TO TERMINAL</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: Left (Catalyst & Symbol Selector) + Right (Intelligence Report & Execution Deck) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT COLUMN: Catalyst Filter, Event List & Correlated Pair Selector (5 Columns) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Catalyst Selector Card */}
          <div className="p-4 rounded-xl bg-terminal-900 border border-terminal-border space-y-3.5 shadow-md">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2.5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-400" />
                HIGH-IMPACT MACROECONOMIC CATALYSTS
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60 font-semibold">
                {filteredCatalysts.length} SCHEDULED
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-1.5 text-[10px] font-mono">
              {[
                { id: 'ALL', label: 'All Catalysts' },
                { id: 'CENTRAL_BANK', label: 'Central Banks' },
                { id: 'INFLATION', label: 'Inflation (CPI)' },
                { id: 'EMPLOYMENT', label: 'Jobs (NFP)' },
                { id: 'BULLION_RESERVES', label: 'Bullion (XAU)' },
                { id: 'ENERGY_COMMODITIES', label: 'OPEC+ / Oil' },
                { id: 'GROWTH_GDP', label: 'GDP Growth' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as any)}
                  className={`px-2 py-1 rounded transition-colors ${
                    selectedCategory === cat.id
                      ? 'bg-cyan-600 text-white font-bold shadow-sm'
                      : 'bg-terminal-950 text-slate-400 hover:text-white border border-terminal-border'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search FOMC, CPI, NFP, Gold, RBI, OPEC+..."
                className="w-full bg-terminal-950 border border-terminal-border rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            {/* Catalyst Events List */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {filteredCatalysts.map(item => {
                const isSelected = item.id === selectedEventId;
                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectCatalyst(item.id)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-500/80 shadow-md ring-1 ring-cyan-500/40'
                        : 'bg-terminal-950/70 border-terminal-border hover:border-slate-600 hover:bg-terminal-950'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-terminal-800 text-cyan-300 border border-terminal-border">
                            {item.currency}
                          </span>
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                            item.impact === 'CRITICAL'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}>
                            {item.impact}
                          </span>
                          {item.isLiveNow && (
                            <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                              LIVE CATALYST
                            </span>
                          )}
                        </div>
                        <h4 className="text-xs font-semibold text-white mt-1 line-clamp-1">
                          {item.title}
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        {item.date}
                      </span>
                    </div>

                    {/* Previous, Forecast, Actual Numbers */}
                    <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-terminal-border/60 text-[11px] font-mono">
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Previous</span>
                        <span className="text-slate-300 font-medium">{item.previous}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Forecast</span>
                        <span className="text-cyan-300 font-medium">{item.forecast}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 block uppercase">Actual</span>
                        <span className={`font-bold ${item.actual ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`}>
                          {item.actual || 'PENDING'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamically Populated Correlated Tradable Pairs */}
          <div className="p-4 rounded-xl bg-terminal-900 border border-terminal-border space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-terminal-border pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                CORRELATED TERMINAL PAIRS
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                DYNAMICALLY FILTERED
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Catalyst directly impacts liquidity & order flow on these verified asset classes:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {correlatedPairs.map((p: CurrencyPair) => {
                const isSelected = p === selectedPair;
                const price = (BASE_PRICES as Record<string, number>)[p] || 0;
                return (
                  <button
                    key={p}
                    onClick={() => {
                      setSelectedPair(p);
                      if (onSelectPair) onSelectPair(p);
                    }}
                    className={`p-2.5 rounded-lg border text-left font-mono transition-all ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-950/80 to-cyan-950/80 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/50'
                        : 'bg-terminal-950 border-terminal-border text-slate-300 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold">{p}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      ${price > 1000 ? price.toLocaleString() : price.toFixed(p.includes('JPY') ? 3 : 4)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleGenerateReport(false)}
              disabled={isGenerating}
              className={`w-full py-3 px-4 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-98 ${
                isGenerating
                  ? 'bg-terminal-800 text-slate-400 cursor-not-allowed border border-terminal-border'
                  : 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-cyan-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-500/25 border border-cyan-400/40'
              }`}
            >
              <Zap className={`w-4 h-4 ${isGenerating ? 'animate-spin' : 'text-cyan-300 animate-pulse'}`} />
              <span>
                {isGenerating ? generationStep : `GENERATE REPORT FOR ${selectedPair}`}
              </span>
            </button>

            {/* Fail-Safe Simulation Button (Proves Unconfirmed Awaiting Convergence handling) */}
            <button
              onClick={() => handleGenerateReport(true)}
              disabled={isGenerating}
              className="w-full py-2 px-3 rounded-lg bg-terminal-950 hover:bg-terminal-800 text-amber-300/90 border border-amber-500/30 font-mono text-[11px] flex items-center justify-center gap-2 transition-colors"
              title="Test Fail-Safe Protocol: Simulates data discrepancy / delay to demonstrate automatic suppression of directional bias"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span>TEST FAIL-SAFE (SIMULATE DATA DELAY / DISCREPANCY)</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Real-Time Intelligence Report & Execution Ticket (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          {activeReport ? (
            <div className="space-y-4">
              {/* Primary Signal & Validation Status Banner */}
              <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl transition-all ${
                activeReport.signal === 'BUY'
                  ? 'bg-gradient-to-br from-emerald-950/70 via-terminal-900 to-terminal-950 border-emerald-500/50'
                  : activeReport.signal === 'SELL'
                  ? 'bg-gradient-to-br from-rose-950/70 via-terminal-900 to-terminal-950 border-rose-500/50'
                  : 'bg-gradient-to-br from-amber-950/60 via-terminal-900 to-terminal-950 border-amber-500/50'
              }`}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white border shadow-md ${
                      activeReport.signal === 'BUY'
                        ? 'bg-emerald-600/30 border-emerald-400/50 text-emerald-300'
                        : activeReport.signal === 'SELL'
                        ? 'bg-rose-600/30 border-rose-400/50 text-rose-300'
                        : 'bg-amber-600/30 border-amber-400/50 text-amber-300'
                    }`}>
                      {activeReport.signal === 'BUY' ? (
                        <ArrowUpRight className="w-6 h-6 text-emerald-400 animate-bounce" />
                      ) : activeReport.signal === 'SELL' ? (
                        <ArrowDownRight className="w-6 h-6 text-rose-400 animate-bounce" />
                      ) : (
                        <ShieldAlert className="w-6 h-6 text-amber-400 animate-pulse" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-lg sm:text-xl font-extrabold tracking-wide font-mono ${
                          activeReport.signal === 'BUY'
                            ? 'text-emerald-400'
                            : activeReport.signal === 'SELL'
                            ? 'text-rose-400'
                            : 'text-amber-300'
                        }`}>
                          {activeReport.signal === 'BUY' && `DEFINITIVE BUY SIGNAL (${activeReport.selectedPair})`}
                          {activeReport.signal === 'SELL' && `DEFINITIVE SELL SIGNAL (${activeReport.selectedPair})`}
                          {activeReport.signal === 'UNCONFIRMED' && `UNCONFIRMED – AWAITING DATA CONVERGENCE`}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-mono mt-0.5">
                        {activeReport.statusDescription}
                      </p>
                    </div>
                  </div>

                  {/* Statistical Validation Score Gauge (85% to 97%) */}
                  <div className="bg-terminal-950/80 p-2.5 rounded-xl border border-terminal-border font-mono text-right shrink-0">
                    <span className="text-[10px] text-slate-400 block uppercase font-semibold">
                      Statistical Validation
                    </span>
                    <span className={`text-lg font-bold ${
                      activeReport.confidenceScore >= 85 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {activeReport.confidenceScore.toFixed(1)}%
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Target 85% - 97% SLA
                    </span>
                  </div>
                </div>

                {/* Strategic Swarm Summary */}
                <div className="mt-3.5 p-3 rounded-lg bg-terminal-950/80 border border-terminal-border/80 text-xs text-slate-200 font-mono leading-relaxed">
                  <span className="text-cyan-400 font-bold block mb-1">
                    SWARM QUANTITATIVE-SENTIMENT SYNTHESIS:
                  </span>
                  {activeReport.strategicSummary}
                </div>
              </div>

              {/* Data Convergence & Fail-Safe Verification Telemetry */}
              <div className="p-4 rounded-xl bg-terminal-900 border border-terminal-border space-y-3 shadow-md font-mono text-xs">
                <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                  <span className="font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    REAL-TIME DATA CONVERGENCE & FAIL-SAFE TELEMETRY
                  </span>
                  <button
                    onClick={() => setShowAuditLogs(!showAuditLogs)}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 underline"
                  >
                    {showAuditLogs ? 'Hide Audit Log' : 'View Audit Log'}
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-terminal-950 border border-terminal-border">
                    <span className="text-slate-500 text-[9px] block uppercase">Primary Feed</span>
                    <span className="text-white font-semibold truncate block">
                      {activeReport.dataConvergence.primarySourceData.source.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      Actual: {activeReport.dataConvergence.primarySourceData.actual || 'Pending'}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-terminal-950 border border-terminal-border">
                    <span className="text-slate-500 text-[9px] block uppercase">Scraped Fallback</span>
                    <span className="text-white font-semibold truncate block">
                      {activeReport.dataConvergence.fallbackScrapedData.source.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-emerald-400">
                      Actual: {activeReport.dataConvergence.fallbackScrapedData.actual || 'Pending'}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-terminal-950 border border-terminal-border">
                    <span className="text-slate-500 text-[9px] block uppercase">Discrepancy Delta</span>
                    <span className={`text-sm font-bold block ${
                      activeReport.dataConvergence.discrepancyDeltaPercent === 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {activeReport.dataConvergence.discrepancyDeltaPercent.toFixed(2)}%
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {activeReport.dataConvergence.discrepancyDeltaPercent === 0 ? 'Verified Zero Delta' : 'Flagged Discrepancy'}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-terminal-950 border border-terminal-border">
                    <span className="text-slate-500 text-[9px] block uppercase">Latency Window</span>
                    <span className="text-sm font-bold text-cyan-400 block">
                      {activeReport.dataConvergence.latencyMs} ms
                    </span>
                    <span className="text-[9px] text-emerald-400">
                      &lt; 2500ms Timeout SLA
                    </span>
                  </div>
                </div>

                {/* Expandable Audit Log Details */}
                {showAuditLogs && (
                  <div className="p-3 rounded-lg bg-black/80 border border-terminal-border/80 text-[10px] space-y-1 max-h-40 overflow-y-auto">
                    <span className="text-slate-400 font-bold block">CRYPTOGRAPHIC AUDIT TRAIL:</span>
                    {activeReport.dataConvergence.auditLog.map((log, i) => (
                      <p key={i} className="text-slate-300 font-mono">
                        {log}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Economic Deviation & Quantitative Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
                  <span className="text-[10px] text-slate-400 uppercase block">Surprise Delta</span>
                  <span className={`text-base font-bold ${
                    activeReport.catalystAnalysis.surpriseDelta > 0 ? 'text-emerald-400' : activeReport.catalystAnalysis.surpriseDelta < 0 ? 'text-rose-400' : 'text-slate-300'
                  }`}>
                    {activeReport.catalystAnalysis.surpriseDelta > 0 ? '+' : ''}{activeReport.catalystAnalysis.surpriseDelta} {activeReport.catalystEvent.unit}
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {activeReport.catalystAnalysis.surpriseDirection.replace('_', ' ')}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
                  <span className="text-[10px] text-slate-400 uppercase block">Central Bank Tone</span>
                  <span className="text-base font-bold text-amber-400 truncate block">
                    {activeReport.sentimentAnalysis.centralBankTone.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-cyan-400 block">
                    Divergence: {activeReport.sentimentAnalysis.policyDivergenceScore}/10
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
                  <span className="text-[10px] text-slate-400 uppercase block">Order Flow Bias</span>
                  <span className={`text-base font-bold truncate block ${
                    activeReport.orderFlowStructure.flowBias === 'INSTITUTIONAL_ACCUMULATION' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeReport.orderFlowStructure.orderBookImbalanceRatio}x
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    {activeReport.orderFlowStructure.flowBias === 'INSTITUTIONAL_ACCUMULATION' ? 'Bids Dominant' : 'Asks Dominant'}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-terminal-900 border border-terminal-border">
                  <span className="text-[10px] text-slate-400 uppercase block">38-Wire Sentiment</span>
                  <span className={`text-base font-bold ${
                    activeReport.sentimentAnalysis.wireSentimentScore >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeReport.sentimentAnalysis.wireSentimentScore >= 0 ? '+' : ''}{activeReport.sentimentAnalysis.wireSentimentScore.toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-400 block">
                    38 Outlets Monitored
                  </span>
                </div>
              </div>

              {/* Mathematical Execution Parameters Card */}
              <div className="p-4 rounded-xl bg-terminal-900 border border-cyan-500/40 space-y-3.5 shadow-lg">
                <div className="flex items-center justify-between border-b border-terminal-border pb-2.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-2 font-mono">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    CALCULATED EXECUTION PARAMETERS (RISK-GOVERNED)
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                    R:R 1:{activeReport.executionParameters.riskRewardRatio}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
                  {/* Entry Zone */}
                  <div className="p-2.5 rounded-lg bg-terminal-950 border border-terminal-border">
                    <span className="text-[10px] text-slate-400 block uppercase">Recommended Entry</span>
                    <span className="text-base font-bold text-white">
                      ${activeReport.executionParameters.entryZone.recommendedEntry}
                    </span>
                    <span className="text-[9px] text-slate-500 block truncate">
                      Zone: {activeReport.executionParameters.entryZone.min} - {activeReport.executionParameters.entryZone.max}
                    </span>
                  </div>

                  {/* Stop Loss */}
                  <div className="p-2.5 rounded-lg bg-terminal-950 border border-rose-500/40">
                    <span className="text-[10px] text-rose-300 block uppercase font-semibold">Hard Stop-Loss</span>
                    <span className="text-base font-bold text-rose-400">
                      ${activeReport.executionParameters.stopLoss}
                    </span>
                    <span className="text-[9px] text-rose-400/80 block">
                      {activeReport.signal === 'BUY' ? 'Below Entry' : 'Above Entry'}
                    </span>
                  </div>

                  {/* Target 1 */}
                  <div className="p-2.5 rounded-lg bg-terminal-950 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-300 block uppercase font-semibold">Take Profit 1</span>
                    <span className="text-base font-bold text-emerald-400">
                      ${activeReport.executionParameters.takeProfit1}
                    </span>
                    <span className="text-[9px] text-slate-500 block">
                      TP2: ${activeReport.executionParameters.takeProfit2}
                    </span>
                  </div>

                  {/* Position Sizing */}
                  <div className="p-2.5 rounded-lg bg-terminal-950 border border-terminal-border">
                    <span className="text-[10px] text-slate-400 block uppercase">Sizing / Max Risk</span>
                    <span className="text-base font-bold text-cyan-300">
                      {activeReport.executionParameters.recommendedLotSize} Lots
                    </span>
                    <span className="text-[9px] text-slate-400 block">
                      Max Risk: ${activeReport.executionParameters.maxRiskDollars}
                    </span>
                  </div>
                </div>

                {/* Execution CTA Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  {activeReport.signal !== 'UNCONFIRMED' && (
                    <button
                      onClick={handleApplyToTerminal}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98"
                    >
                      <Zap className="w-4 h-4 text-cyan-200" />
                      <span>APPLY PARAMETERS & RETURN TO TERMINAL</span>
                    </button>
                  )}

                  {activeReport.signal !== 'UNCONFIRMED' && onExecuteTrade && (
                    <button
                      onClick={() => onExecuteTrade({
                        symbol: activeReport.selectedPair,
                        direction: activeReport.signal,
                        entry: activeReport.executionParameters.entryZone.recommendedEntry,
                        stopLoss: activeReport.executionParameters.stopLoss,
                        takeProfit: activeReport.executionParameters.takeProfit1,
                        lots: activeReport.executionParameters.recommendedLotSize,
                      })}
                      className={`py-2.5 px-4 rounded-lg font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md text-white ${
                        activeReport.signal === 'BUY'
                          ? 'bg-emerald-600 hover:bg-emerald-500'
                          : 'bg-rose-600 hover:bg-rose-500'
                      }`}
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>EXECUTE {activeReport.signal} MARKET</span>
                    </button>
                  )}

                  <button
                    onClick={handleExportJson}
                    className="py-2.5 px-3 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    title="Export Macro Intelligence Report & Cryptographic Audit Log as JSON"
                  >
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export Report</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-terminal-900 border border-terminal-border text-center space-y-3 font-mono">
              <Zap className="w-10 h-10 text-cyan-400 mx-auto animate-pulse" />
              <h3 className="text-white text-base font-bold">Select Catalyst & Click Generate Report</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                The engine will ingest 38 financial wire feeds, central bank disclosures, and order flow metrics to calculate mathematical execution parameters.
              </p>
            </div>
          )}

          {/* Historical Macro Intelligence Reports Archive */}
          {historyReports.length > 0 && (
            <div className="p-4 rounded-xl bg-terminal-900 border border-terminal-border space-y-2.5 shadow-md">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 font-mono">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  PERSISTENT MACRO INTELLIGENCE AUDIT LOG
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {historyReports.length} STORED RUNS
                </span>
              </div>

              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {historyReports.map(rep => (
                  <div
                    key={rep.id}
                    onClick={() => setActiveReport(rep)}
                    className="p-2 rounded bg-terminal-950 hover:bg-terminal-800/80 border border-terminal-border flex items-center justify-between text-xs font-mono cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full ${
                        rep.signal === 'BUY' ? 'bg-emerald-400' : rep.signal === 'SELL' ? 'bg-rose-400' : 'bg-amber-400'
                      }`} />
                      <span className="font-bold text-white">{rep.selectedPair}</span>
                      <span className="text-slate-400 truncate text-[11px]">{rep.catalystEvent.title}</span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        rep.signal === 'BUY'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : rep.signal === 'SELL'
                          ? 'bg-rose-500/20 text-rose-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}>
                        {rep.signal} ({rep.confidenceScore}%)
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
