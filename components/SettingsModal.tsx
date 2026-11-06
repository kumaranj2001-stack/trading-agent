'use client';

import React, { useState } from 'react';
import { X, Shield, Sliders, Key, DollarSign, Percent } from 'lucide-react';
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
  const [apiKey, setApiKey] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(formState);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-lg p-5 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-terminal-border pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">Swarm & Risk Manager Parameters</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded hover:bg-terminal-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">
          <div>
            <label className="text-slate-300 block mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>Simulated Account Balance ($)</span>
            </label>
            <input
              type="number"
              value={formState.accountBalance}
              onChange={(e) => setFormState({ ...formState, accountBalance: parseFloat(e.target.value) || 1000 })}
              className="w-full bg-terminal-950 border border-terminal-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 block mb-1 flex items-center gap-1">
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
                className="w-full bg-terminal-950 border border-terminal-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Recommended: 1.0% - 2.0%</span>
            </div>

            <div>
              <label className="text-slate-300 block mb-1 flex items-center gap-1">
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
                className="w-full bg-terminal-950 border border-terminal-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Trips automatic veto breaker</span>
            </div>
          </div>

          <div>
            <label className="text-slate-300 block mb-1">
              Minimum Required Risk-to-Reward Ratio (R:R)
            </label>
            <input
              type="number"
              step="0.1"
              min="1.0"
              max="5.0"
              value={formState.minRiskRewardRatio}
              onChange={(e) => setFormState({ ...formState, minRiskRewardRatio: parseFloat(e.target.value) || 1.5 })}
              className="w-full bg-terminal-950 border border-terminal-border rounded p-2 text-white focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Risk Manager rejects any setup below this minimum (default: 1.8)
            </span>
          </div>

          <div className="pt-2 border-t border-terminal-border">
            <label className="text-slate-300 block mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-cyan-400" />
              <span>Optional LLM API Key (OpenAI / Gemini / Anthropic)</span>
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-... (Optional: Swarm operates 100% locally if omitted)"
              className="w-full bg-terminal-950 border border-terminal-border rounded p-2 text-white text-xs focus:outline-none focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Leave blank to run on pure algorithmic and econometric quantitative logic.
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-terminal-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition-colors shadow-md shadow-cyan-600/30"
            >
              Save Parameters
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
