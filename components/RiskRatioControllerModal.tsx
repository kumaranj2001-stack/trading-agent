'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Save,
  Zap,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { ConfluenceGrade, RiskRatioControllerConfig, TierRiskParameter } from '@/lib/types';
import { riskRatioController, DEFAULT_TIER_RISK_CONFIG } from '@/lib/riskRatioController';

interface RiskRatioControllerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: RiskRatioControllerConfig) => void;
}

const TIER_ORDER: ConfluenceGrade[] = ['A+', 'A', 'B', 'C', 'D', 'E', 'F'];

const TIER_BADGE_STYLES: Record<ConfluenceGrade, { bg: string; text: string; border: string; label: string }> = {
  'A+': {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/50',
    label: 'High-Conviction Core (Prime Confluence)',
  },
  'A': {
    bg: 'bg-teal-500/20',
    text: 'text-teal-400',
    border: 'border-teal-500/50',
    label: 'Primary Alpha Trend Expansion',
  },
  'B': {
    bg: 'bg-cyan-500/20',
    text: 'text-cyan-400',
    border: 'border-cyan-500/50',
    label: 'Standard Multi-Desk Alignment',
  },
  'C': {
    bg: 'bg-blue-500/20',
    text: 'text-blue-400',
    border: 'border-blue-500/50',
    label: 'Controlled Regime Allocation',
  },
  'D': {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/50',
    label: 'Defensive Secondary Momentum',
  },
  'E': {
    bg: 'bg-orange-500/20',
    text: 'text-orange-400',
    border: 'border-orange-500/50',
    label: 'Conservative Scout Allocation',
  },
  'F': {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/50',
    label: 'Micro-Volume Scout (Zero-Veto Override)',
  },
};

export const RiskRatioControllerModal: React.FC<RiskRatioControllerModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
}) => {
  const [config, setConfig] = useState<RiskRatioControllerConfig>(() => riskRatioController.getConfig());
  const [activeTabGrade, setActiveTabGrade] = useState<ConfluenceGrade>('A+');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  useEffect(() => {
    if (isOpen) {
      // Sync fresh from controller / API
      fetch('/api/risk-controller')
        .then(res => res.json())
        .then(data => {
          if (data && data.tiers) {
            setConfig(data);
          } else {
            setConfig(riskRatioController.getConfig());
          }
        })
        .catch(() => {
          setConfig(riskRatioController.getConfig());
        });
      setSaveStatus('idle');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTierChange = (grade: ConfluenceGrade, field: keyof TierRiskParameter, value: any) => {
    setConfig(prev => ({
      ...prev,
      tiers: {
        ...prev.tiers,
        [grade]: {
          ...prev.tiers[grade],
          [field]: value,
        },
      },
    }));
  };

  const handleApplyPreset = (preset: 'institutional' | 'conservative' | 'aggressive') => {
    if (preset === 'institutional') {
      setConfig({ ...DEFAULT_TIER_RISK_CONFIG });
    } else if (preset === 'conservative') {
      setConfig(prev => ({
        ...prev,
        tiers: {
          'A+': { ...prev.tiers['A+'], defaultLots: 0.50, accountRiskPercent: 1.0, targetRRRatio: 3.0 },
          'A': { ...prev.tiers['A'], defaultLots: 0.35, accountRiskPercent: 0.8, targetRRRatio: 2.6 },
          'B': { ...prev.tiers['B'], defaultLots: 0.20, accountRiskPercent: 0.6, targetRRRatio: 2.2 },
          'C': { ...prev.tiers['C'], defaultLots: 0.12, accountRiskPercent: 0.4, targetRRRatio: 1.8 },
          'D': { ...prev.tiers['D'], defaultLots: 0.06, accountRiskPercent: 0.3, targetRRRatio: 1.5 },
          'E': { ...prev.tiers['E'], defaultLots: 0.03, accountRiskPercent: 0.2, targetRRRatio: 1.3 },
          'F': { ...prev.tiers['F'], defaultLots: 0.01, accountRiskPercent: 0.1, targetRRRatio: 1.2 },
        },
      }));
    } else if (preset === 'aggressive') {
      setConfig(prev => ({
        ...prev,
        tiers: {
          'A+': { ...prev.tiers['A+'], defaultLots: 2.00, accountRiskPercent: 3.0, targetRRRatio: 3.5 },
          'A': { ...prev.tiers['A'], defaultLots: 1.50, accountRiskPercent: 2.5, targetRRRatio: 3.0 },
          'B': { ...prev.tiers['B'], defaultLots: 1.00, accountRiskPercent: 2.0, targetRRRatio: 2.5 },
          'C': { ...prev.tiers['C'], defaultLots: 0.60, accountRiskPercent: 1.5, targetRRRatio: 2.0 },
          'D': { ...prev.tiers['D'], defaultLots: 0.35, accountRiskPercent: 1.0, targetRRRatio: 1.8 },
          'E': { ...prev.tiers['E'], defaultLots: 0.15, accountRiskPercent: 0.6, targetRRRatio: 1.5 },
          'F': { ...prev.tiers['F'], defaultLots: 0.02, accountRiskPercent: 0.3, targetRRRatio: 1.2 },
        },
      }));
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // 1. Update singleton controller & localStorage
      const updated = riskRatioController.updateConfig(config);

      // 2. Persist to API backend
      await fetch('/api/risk-controller', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });

      // 3. Dispatch global browser event so active dashboard listeners update live
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('risk-controller-updated', { detail: updated }));
      }

      if (onConfigSaved) onConfigSaved(updated);
      setSaveStatus('saved');
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (e) {
      console.error('Failed to save RiskRatioController config:', e);
      setSaveStatus('idle');
    }
  };

  const activeTier = config.tiers[activeTabGrade];
  const activeStyle = TIER_BADGE_STYLES[activeTabGrade];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 bg-terminal-950 border-b border-terminal-border flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg">Risk Ratio Controller</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold">
                  ZERO-VETO ACTIVE
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  7-TIER DYNAMIC SIZING
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Decoupled execution engine: Granular lot sizes, Risk:Reward ratios, and capital limits per confidence tier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white transition-colors border border-terminal-border"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Zero-Veto Decoupling Banner */}
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/40 via-terminal-900 to-emerald-950/40 border-b border-terminal-border/80 flex items-center justify-between gap-3 shrink-0 text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong className="text-amber-300">Zero-Veto Decoupling Active:</strong> Low-confidence setups (Grade F / E) automatically execute with conservative scout volume (0.01 - 0.08 lots) rather than halting or vetoing execution.
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => handleApplyPreset('institutional')}
              className="px-2 py-1 rounded text-[11px] font-medium bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
            >
              Institutional Default
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('conservative')}
              className="px-2 py-1 rounded text-[11px] font-medium bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
            >
              Conservative Scout
            </button>
            <button
              type="button"
              onClick={() => handleApplyPreset('aggressive')}
              className="px-2 py-1 rounded text-[11px] font-medium bg-terminal-800 hover:bg-terminal-700 border border-terminal-border text-slate-300 hover:text-white transition-colors"
            >
              Aggressive Alpha
            </button>
          </div>
        </div>

        {/* Modal Body: Two Columns (Tiers Navigation List + Active Tier Editor) */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Left Column: 7 Tiers Selector */}
          <div className="md:col-span-4 space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
              Select Grading Tier to Configure
            </label>
            <div className="space-y-1.5">
              {TIER_ORDER.map(grade => {
                const tier = config.tiers[grade];
                const style = TIER_BADGE_STYLES[grade];
                const isSelected = activeTabGrade === grade;

                return (
                  <button
                    key={grade}
                    onClick={() => setActiveTabGrade(grade)}
                    className={`w-full p-2.5 rounded-lg border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? `${style.bg} ${style.border} text-white shadow-md ring-1 ring-cyan-500/50`
                        : 'bg-terminal-800/60 hover:bg-terminal-800 border-terminal-border text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded flex items-center justify-center font-bold text-xs font-mono border ${style.bg} ${style.border} ${style.text}`}>
                        {grade}
                      </div>
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <span>Grade {grade}</span>
                          {grade === 'F' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono">
                              MIN SCOUT
                            </span>
                          )}
                          {grade === 'A+' && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                              MAX CORE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {tier.defaultLots.toFixed(2)} Lots • {tier.targetRRRatio}:1 RR
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-white translate-x-0.5' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Active Tier Editor */}
          <div className="md:col-span-8 bg-terminal-950/60 border border-terminal-border rounded-xl p-4 flex flex-col justify-between">
            {activeTier && (
              <div className="space-y-4">
                
                {/* Active Tier Header */}
                <div className="flex items-center justify-between pb-3 border-b border-terminal-border">
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2.5 py-1 rounded text-sm font-bold font-mono border ${activeStyle.bg} ${activeStyle.border} ${activeStyle.text}`}>
                      TIER {activeTabGrade}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{activeTier.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{activeStyle.label}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-mono block">Confidence Threshold</span>
                    <span className="text-xs font-mono font-bold text-cyan-400">≥ {activeTier.minConfidence}% Score</span>
                  </div>
                </div>

                {/* Form Controls Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  
                  {/* Default Lot Size */}
                  <div className="p-3 rounded-lg bg-terminal-800/80 border border-terminal-border/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Default Position Sizing (Lots)
                      </label>
                      <span className="text-[10px] font-mono text-cyan-400">Primary Execution</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min={activeTabGrade === 'F' ? 0.01 : 0.01}
                      max="10.0"
                      value={activeTier.defaultLots}
                      onChange={e => handleTierChange(activeTabGrade, 'defaultLots', parseFloat(e.target.value) || 0.01)}
                      className="w-full px-3 py-2 rounded bg-terminal-900 border border-terminal-border text-white font-mono text-sm focus:outline-none focus:border-cyan-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      {activeTabGrade === 'F'
                        ? 'Min conservative scout lot size (never 0; prevents vetoes).'
                        : `Proportional pip allocation for Grade ${activeTabGrade}.`}
                    </p>
                  </div>

                  {/* Account Risk % */}
                  <div className="p-3 rounded-lg bg-terminal-800/80 border border-terminal-border/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Account Risk Limit (%)
                      </label>
                      <span className="text-[10px] font-mono text-indigo-400">Equity Guardrail</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      max="10.0"
                      value={activeTier.accountRiskPercent}
                      onChange={e => handleTierChange(activeTabGrade, 'accountRiskPercent', parseFloat(e.target.value) || 0.5)}
                      className="w-full px-3 py-2 rounded bg-terminal-900 border border-terminal-border text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Calculates hard Stop Loss dollar allocation on \$25,000 balance: \$
                      {((25000 * activeTier.accountRiskPercent) / 100).toFixed(0)} max risk.
                    </p>
                  </div>

                  {/* Target Risk:Reward Ratio */}
                  <div className="p-3 rounded-lg bg-terminal-800/80 border border-terminal-border/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Target Risk:Reward (R:R)
                      </label>
                      <span className="text-[10px] font-mono text-emerald-400">Calculated Exits</span>
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="10.0"
                      value={activeTier.targetRRRatio}
                      onChange={e => handleTierChange(activeTabGrade, 'targetRRRatio', parseFloat(e.target.value) || 1.5)}
                      className="w-full px-3 py-2 rounded bg-terminal-900 border border-terminal-border text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Target TP multiplier relative to stop distance (e.g. 1 : {activeTier.targetRRRatio}).
                    </p>
                  </div>

                  {/* Min Confidence Threshold */}
                  <div className="p-3 rounded-lg bg-terminal-800/80 border border-terminal-border/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-200">
                        Min Confidence Score (%)
                      </label>
                      <span className="text-[10px] font-mono text-amber-400">Swarm Threshold</span>
                    </div>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={activeTier.minConfidence}
                      onChange={e => handleTierChange(activeTabGrade, 'minConfidence', parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded bg-terminal-900 border border-terminal-border text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Grade activates when multi-desk swarm consensus score ≥ this value.
                    </p>
                  </div>
                </div>

                {/* Institutional Execution Policy Text */}
                <div className="p-3 rounded-lg bg-terminal-900 border border-terminal-border">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Institutional Governance Policy & Execution Directive
                  </label>
                  <textarea
                    rows={2}
                    value={activeTier.executionPolicy}
                    onChange={e => handleTierChange(activeTabGrade, 'executionPolicy', e.target.value)}
                    className="w-full px-3 py-1.5 rounded bg-terminal-950 border border-terminal-border text-slate-300 font-mono text-xs focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {/* Live Real-time Simulation Preview for Active Tier */}
                <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-cyan-300">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span>Real-time Order Routing Preview:</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-200">
                    <span>Lots: <strong className="text-white">{activeTier.defaultLots.toFixed(2)}</strong></span>
                    <span>Risk: <strong className="text-white">{activeTier.accountRiskPercent}%</strong></span>
                    <span>R:R: <strong className="text-emerald-400">{activeTier.targetRRRatio}:1</strong></span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      AUTO-EXECUTE READY
                    </span>
                  </div>
                </div>

              </div>
            )}

            {/* Bottom Actions inside Right Column */}
            <div className="mt-4 pt-3 border-t border-terminal-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => setConfig(prev => ({
                  ...prev,
                  tiers: {
                    ...prev.tiers,
                    [activeTabGrade]: { ...DEFAULT_TIER_RISK_CONFIG.tiers[activeTabGrade] },
                  },
                }))}
                className="px-3 py-1.5 rounded text-xs font-mono text-slate-400 hover:text-white flex items-center gap-1.5 hover:bg-terminal-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Grade {activeTabGrade}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white text-xs font-semibold transition-colors border border-terminal-border"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveStatus === 'saving'}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white text-xs font-bold transition-all shadow-lg flex items-center gap-2"
                >
                  {saveStatus === 'saving' ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                      <span>Persisting Settings...</span>
                    </>
                  ) : saveStatus === 'saved' ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                      <span>Settings Applied!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Apply All Tiers</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
