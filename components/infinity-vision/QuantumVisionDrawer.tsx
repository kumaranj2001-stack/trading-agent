'use client';

import React, { useState } from 'react';
import { 
  X, 
  RotateCcw, 
  Play, 
  Download, 
  ChevronDown, 
  ChevronRight, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert,
  Info
} from 'lucide-react';

export interface QuantumVisionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  horizonCandles?: number;
  onChangeHorizon?: (h: number) => void;
  theme?: 'light' | 'dark';
}

export const QuantumVisionDrawer: React.FC<QuantumVisionDrawerProps> = ({
  isOpen,
  onClose,
  horizonCandles = 5,
  onChangeHorizon,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [activeViewMode, setActiveViewMode] = useState<'Candles' | 'Line'>('Candles');
  const [selectedScenario, setSelectedScenario] = useState<string>('Support breakdown - 32% of paths');
  const [isHowToUseOpen, setIsHowToUseOpen] = useState<boolean>(false);
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    comparison: false,
    mtf: false,
    sessions: false,
    distribution: false,
  });

  if (!isOpen) return null;

  const toggleAccordion = (key: string) => {
    setOpenAccordions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportCsv = () => {
    const csvContent = 'data:text/csv;charset=utf-8,Step,Timestamp,UpperPath,MedianPath,LowerPath,Confidence\n'
      + '1,2026-11-11T22:45:00Z,4007.80,4005.88,4001.20,0.50\n'
      + '2,2026-11-11T23:00:00Z,4010.50,4004.90,3998.47,0.50\n'
      + '3,2026-11-11T23:15:00Z,4012.30,4003.50,3995.10,0.50\n'
      + '4,2026-11-11T23:30:00Z,4015.60,4002.80,3991.40,0.50\n'
      + '5,2026-11-11T23:45:00Z,4018.90,4001.60,3987.04,0.50\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'quantum_vision_simulation.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`absolute top-2 left-2 z-30 w-[94vw] sm:w-[330px] max-w-[340px] max-h-[calc(100%-20px)] overflow-y-auto rounded-xl border shadow-2xl backdrop-blur-md select-none transition-all ${
      isLight 
        ? 'bg-white/95 border-slate-300 text-slate-800' 
        : 'bg-terminal-950/95 border-terminal-border text-slate-100'
    }`}>
      {/* Header */}
      <div className="p-3 border-b border-slate-200 dark:border-terminal-border flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black tracking-wider uppercase">QUANTUM VISION</h3>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              SIMULATION · NOT A PREDICTION
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3 space-y-3 text-xs font-sans">
        {/* Top Control Buttons: Run again, Reset, Line/Candles */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {}}
              className="px-2.5 py-1 rounded bg-slate-900 text-white dark:bg-cyan-600 font-bold text-[11px] flex items-center gap-1 hover:opacity-90 shadow-sm"
            >
              <span>Run again</span>
            </button>
            <button
              onClick={() => {}}
              className="px-2 py-1 rounded border border-slate-300 dark:border-terminal-border text-slate-600 dark:text-slate-300 font-medium text-[11px] hover:bg-slate-100 dark:hover:bg-terminal-900"
            >
              <span>Reset</span>
            </button>
          </div>

          {/* Line / Candles Toggle */}
          <div className="flex items-center p-0.5 rounded border border-slate-200 dark:border-terminal-border text-[10px] font-bold">
            <button
              onClick={() => setActiveViewMode('Line')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeViewMode === 'Line'
                  ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setActiveViewMode('Candles')}
              className={`px-2 py-0.5 rounded transition-colors ${
                activeViewMode === 'Candles'
                  ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-white'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Candles
            </button>
          </div>
        </div>

        {/* Horizon Selector & Export CSV */}
        <div className="flex items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-500">Horizon:</span>
            <select
              value={horizonCandles}
              onChange={(e) => onChangeHorizon && onChangeHorizon(Number(e.target.value))}
              className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-terminal-border font-bold bg-transparent focus:outline-none"
            >
              <option value={3} className="dark:bg-terminal-900">3 candles</option>
              <option value={5} className="dark:bg-terminal-900">5 candles</option>
              <option value={10} className="dark:bg-terminal-900">10 candles</option>
              <option value={20} className="dark:bg-terminal-900">20 candles</option>
            </select>
          </div>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-cyan-400 hover:underline"
          >
            <Download className="w-3 h-3" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* How to use Accordion */}
        <div className="border border-slate-200 dark:border-terminal-border rounded-lg overflow-hidden">
          <button
            onClick={() => setIsHowToUseOpen(!isHowToUseOpen)}
            className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-terminal-900/50 flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300"
          >
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-slate-400" />
              How to use
            </span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isHowToUseOpen ? 'rotate-180' : ''}`} />
          </button>
          {isHowToUseOpen && (
            <div className="p-2.5 text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-terminal-border">
              Quantum Vision applies non-parametric Monte Carlo path simulations and order flow probability cones to model price progression without directional bias assumptions.
            </div>
          )}
        </div>

        {/* Core Metrics Table */}
        <div className="space-y-1.5 pt-1 text-[11px] font-mono border-t border-slate-200 dark:border-terminal-border">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Market Bias:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">Neutral (no measurable edge)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Bullish Probability:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">50% (no edge)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Bearish Probability:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">50% (no edge)</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Key Support:</span>
            <span className="font-bold text-slate-900 dark:text-white">3998.47</span>
          </div>
          <p className="text-[10px] text-slate-400 -mt-1 text-right font-sans">Range low (1h) - hard S1</p>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Key Resistance:</span>
            <span className="font-bold text-slate-900 dark:text-white">4005.30</span>
          </div>
          <p className="text-[10px] text-slate-400 -mt-1 text-right font-sans">SSL (swing low) - hold C1</p>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Potential Breakout:</span>
            <span className="font-bold text-slate-900 dark:text-white">above 4005.58</span>
          </div>
          <p className="text-[10px] text-slate-400 -mt-1 text-right font-sans">past breakout can run 61% of 1h</p>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Potential Rejection:</span>
            <span className="font-bold text-slate-900 dark:text-white">4003.33 / 3998.47</span>
          </div>
          <p className="text-[10px] text-slate-400 -mt-1 text-right font-sans">Expected Price Range 3987.04 - 4013.47, 80% of paths</p>

          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-500">Prediction Timeframe:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">5 × 15m = 1.3 hours</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500">Scenario Confidence:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">No measurable edge</span>
          </div>
        </div>

        {/* Walk-forward Validation Notice Box */}
        <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-terminal-900/60 border border-slate-200 dark:border-terminal-border text-[10px] text-slate-600 dark:text-slate-400 leading-normal">
          On this instrument and timeframe the model did not beat a coin flip in walk-forward testing, so the direction is showed as 50/50. Market DNA ran with a 20-candle outcome, set both to the same length to compare.
        </div>

        {/* Scenario Selection Dropdown */}
        <div className="pt-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Scenario Selection</label>
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            className="w-full px-2 py-1 rounded border border-slate-300 dark:border-terminal-border text-xs font-bold bg-white dark:bg-terminal-900 text-slate-800 dark:text-slate-100 focus:outline-none"
          >
            <option>Support breakdown - 32% of paths</option>
            <option>Bullish breakout above C1 - 38% of paths</option>
            <option>Consolidation equilibrium - 30% of paths</option>
          </select>
        </div>

        {/* Additional Collapsible Accordions */}
        <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-terminal-border">
          {[
            { key: 'comparison', label: 'Scenario comparison' },
            { key: 'mtf', label: 'Multi-timeframe view' },
            { key: 'sessions', label: 'Sessions in this horizon' },
            { key: 'distribution', label: 'Simulated distribution & touch odds' },
          ].map(acc => (
            <div key={acc.key} className="border border-slate-200 dark:border-terminal-border rounded">
              <button
                onClick={() => toggleAccordion(acc.key)}
                className="w-full px-2.5 py-1.5 flex items-center justify-between text-[11px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-terminal-900"
              >
                <span>▶ {acc.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${openAccordions[acc.key] ? 'rotate-180' : ''}`} />
              </button>
              {openAccordions[acc.key] && (
                <div className="p-2 text-[10px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-terminal-900/40 border-t border-slate-200 dark:border-terminal-border">
                  Telemetry calculated across 1,000 historical Monte Carlo permutations. Touch odds for Hard S1 (3998.47) are currently 68.4%.
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
