'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, Sliders, DollarSign, Percent, Scale, RefreshCw } from 'lucide-react';
import { RiskManagerConfig } from '@/lib/agents/RiskManager';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RiskManagerConfig;
  onSaveConfig: (cfg: RiskManagerConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [formState, setFormState] = useState<RiskManagerConfig>({ ...config });

  useEffect(() => {
    if (isOpen) {
      setFormState({ ...config });
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formState);
    onClose();
  };

  const handleResetDefaults = () => {
    setFormState({
      accountBalance: 25000,
      maxRiskPerTradePercent: 1.5,
      maxDailyDrawdownPercent: 4.0,
      currentDailyDrawdownPercent: 0.8,
      minRiskRewardRatio: 1.8,
      maxLeverage: 30,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-terminal-950 border-b border-terminal-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">Risk Manager Parameters</h3>
              <p className="text-[11px] text-slate-400 font-mono">Institutional Capital Governance Settings</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-terminal-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-4 overflow-y-auto space-y-4 font-mono text-xs scrollbar-thin">
          <div>
            <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Account Balance ($)</span>
            </label>
            <input
              type="number"
              min="100"
              max="10000000"
              value={formState.accountBalance}
              onChange={(e) => setFormState({ ...formState, accountBalance: parseFloat(e.target.value) || 1000 })}
              className="w-full bg-terminal-950 border border-terminal-border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
            />
            <span className="text-[10px] text-slate-400 block mt-1">Starting capital for position sizing</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-amber-400" />
                <span>Max Risk / Trade (%)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="0.2"
                max="5.0"
                value={formState.maxRiskPerTradePercent}
                onChange={(e) => setFormState({ ...formState, maxRiskPerTradePercent: parseFloat(e.target.value) || 1 })}
                className="w-full bg-terminal-950 border border-terminal-border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Recommended: 1.0% - 2.0%</span>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-rose-400" />
                <span>Max Daily Drawdown (%)</span>
              </label>
              <input
                type="number"
                step="0.5"
                min="1.0"
                max="10.0"
                value={formState.maxDailyDrawdownPercent}
                onChange={(e) => setFormState({ ...formState, maxDailyDrawdownPercent: parseFloat(e.target.value) || 4 })}
                className="w-full bg-terminal-950 border border-terminal-border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Trips automatic veto circuit breaker</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-indigo-400" />
                <span>Min Risk/Reward (R:R)</span>
              </label>
              <input
                type="number"
                step="0.1"
                min="1.0"
                max="5.0"
                value={formState.minRiskRewardRatio}
                onChange={(e) => setFormState({ ...formState, minRiskRewardRatio: parseFloat(e.target.value) || 1.8 })}
                className="w-full bg-terminal-950 border border-terminal-border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
              />
              <span className="text-[10px] text-slate-400 block mt-1">Minimum 1:1.8 recommended</span>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 font-semibold flex items-center gap-1">
                <span>Account Leverage (1:X)</span>
              </label>
              <select
                value={formState.maxLeverage}
                onChange={(e) => setFormState({ ...formState, maxLeverage: parseInt(e.target.value, 10) || 30 })}
                className="w-full bg-terminal-950 border border-terminal-border rounded-lg p-2.5 text-white focus:outline-none focus:border-cyan-500 font-bold"
              >
                <option value={10}>1:10 (Conservative)</option>
                <option value={20}>1:20 (Standard)</option>
                <option value={30}>1:30 (Institutional Default)</option>
                <option value={50}>1:50 (Aggressive)</option>
                <option value={100}>1:100 (High Leverage)</option>
              </select>
              <span className="text-[10px] text-slate-400 block mt-1">Determines margin requirement</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-terminal-border flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-3 py-2 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Defaults</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold transition-all shadow-md"
              >
                Apply Parameters
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
