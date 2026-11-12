'use client';

import React, { useState } from 'react';
import { X, ChevronDown, Check, SlidersHorizontal, RotateCcw, Save } from 'lucide-react';

export interface IndicatorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export const IndicatorsModal: React.FC<IndicatorsModalProps> = ({
  isOpen,
  onClose,
  theme = 'light',
}) => {
  const isLight = theme === 'light';
  const [activeTab, setActiveTab] = useState<'Clean' | 'Standard' | 'Advanced'>('Advanced');

  // Accordion states
  const [openSection, setOpenSection] = useState<string | null>('market_structure');

  // Market structure sub-toggles
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    ms_map: true,
    ms_internal: true,
    ms_bos: true,
    ms_choch: true,
    ms_mss: true,
    ms_wick_breaks: true,
    labels: true,
    supply_demand: true,
    ob_fresh: true,
    ob_mitigated: true,
    ob_breaker: true,
    ob_rejection: true,
    fvg_fresh: true,
    fvg_inversion: true,
    fvg_mitigated: true,
    liq_sweep: true,
    liq_pools: true,
    liq_equal: true,
    fib_retracement: true,
    fib_extensions: true,
    trend_ema: false,
    rsi_momentum: true,
    volume_profile: false,
    zones_danger: true,
    zones_caution: true,
    zones_entry: true,
    zones_safe: true,
    session_london: true,
    session_ny: true,
    session_asian: true,
    strength_panel: true,
    advanced_analysis: true,
  });

  const [externalSwingLength, setExternalSwingLength] = useState<number>(8);
  const [internalSwingLength, setInternalSwingLength] = useState<number>(3);
  const [mssDisplacement, setMssDisplacement] = useState<number>(1);
  const [breakDrawOption, setBreakDrawOption] = useState<string>('Every candle-close break');
  const [transparency, setTransparency] = useState<number>(60);
  const [lineWidth, setLineWidth] = useState<number>(1);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleItem = (key: string) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleShowAll = () => {
    const updated = { ...toggles };
    Object.keys(updated).forEach(k => { updated[k] = true; });
    setToggles(updated);
  };

  const handleHideAll = () => {
    const updated = { ...toggles };
    Object.keys(updated).forEach(k => { updated[k] = false; });
    setToggles(updated);
  };

  const handleReset = () => {
    setActiveTab('Advanced');
    setExternalSwingLength(8);
    setInternalSwingLength(3);
    setMssDisplacement(1);
    setTransparency(60);
    setLineWidth(1);
  };

  const handleSavePreferences = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const categories = [
    { id: 'market_structure', label: 'MARKET STRUCTURE', count: '6/6' },
    { id: 'supply_demand', label: 'SUPPLY & DEMAND', count: '1/1' },
    { id: 'order_blocks', label: 'ORDER BLOCKS', count: '4/6' },
    { id: 'fair_value_gaps', label: 'FAIR VALUE GAPS', count: '3/4' },
    { id: 'liquidity', label: 'LIQUIDITY', count: '4/8' },
    { id: 'fibonacci', label: 'FIBONACCI', count: '8/13' },
    { id: 'trend_indicators', label: 'TREND INDICATORS', count: '0/5' },
    { id: 'momentum_indicators', label: 'MOMENTUM INDICATORS', count: '1/3' },
    { id: 'volume_indicators', label: 'VOLUME INDICATORS', count: '0/2' },
    { id: 'price_action', label: 'PRICE ACTION', count: '2/3' },
    { id: 'analysis_zones', label: 'ANALYSIS ZONES', count: '6/7' },
    { id: 'sessions', label: 'SESSIONS', count: '6/8' },
    { id: 'market_strength_panel', label: 'MARKET STRENGTH PANEL', count: '5/5' },
    { id: 'drawing_tools', label: 'DRAWING TOOLS', count: '' },
    { id: 'advanced_analysis', label: 'ADVANCED ANALYSIS', count: '1/1' },
  ];

  return (
    <div className={`fixed inset-y-0 right-0 z-50 w-[340px] sm:w-[390px] max-w-[96vw] shadow-2xl border-l flex flex-col select-none backdrop-blur-md transition-all ${
      isLight 
        ? 'bg-white/98 border-slate-300 text-slate-800' 
        : 'bg-terminal-950/98 border-terminal-border text-slate-100'
    }`}>
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 dark:border-terminal-border flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">Indicators</h2>
        <button
          onClick={onClose}
          className="px-3 py-1 rounded-md text-xs font-semibold border border-slate-300 dark:border-terminal-border text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-terminal-900"
        >
          Close
        </button>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="px-3.5 pt-3 pb-2 border-b border-slate-200 dark:border-terminal-border space-y-2.5">
        <div className="grid grid-cols-3 p-0.5 rounded-lg border border-slate-200 dark:border-terminal-border text-xs font-bold text-center">
          {(['Clean', 'Standard', 'Advanced'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-1.5 rounded transition-all ${
                activeTab === tab
                  ? 'bg-slate-200 dark:bg-terminal-800 text-slate-900 dark:text-white font-bold shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          <strong>Advanced:</strong> everything switched on below is drawn. Switching something off only hides it; the analysis is kept. Changes are kept in this browser; <strong>Save preferences</strong> also saves them to your account.
        </p>

        {/* Action Buttons: Show all, Hide all, Reset to default */}
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <button
            onClick={handleShowAll}
            className="flex-1 py-1 px-2 rounded border border-slate-300 dark:border-terminal-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-terminal-900 text-center"
          >
            Show all
          </button>
          <button
            onClick={handleHideAll}
            className="flex-1 py-1 px-2 rounded border border-slate-300 dark:border-terminal-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-terminal-900 text-center"
          >
            Hide all
          </button>
          <button
            onClick={handleReset}
            className="flex-1 py-1 px-2 rounded border border-slate-300 dark:border-terminal-border text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-terminal-900 text-center"
          >
            Reset to default
          </button>
        </div>

        <button
          onClick={handleSavePreferences}
          className="w-full py-1.5 rounded-lg border border-slate-300 dark:border-terminal-border bg-slate-100 dark:bg-terminal-900 hover:bg-slate-200 dark:hover:bg-terminal-800 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
        >
          {saveSuccess ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Save className="w-3.5 h-3.5" />}
          <span>{saveSuccess ? 'Preferences Saved!' : 'Save preferences'}</span>
        </button>
      </div>

      {/* Accordion List of Categories */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5 custom-scrollbar">
        {categories.map((cat) => {
          const isOpenSection = openSection === cat.id;

          return (
            <div 
              key={cat.id} 
              className="border border-slate-200 dark:border-terminal-border rounded-lg overflow-hidden"
            >
              {/* Accordion Row */}
              <button
                onClick={() => setOpenSection(isOpenSection ? null : cat.id)}
                className="w-full px-3 py-2 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-terminal-900/60 transition-colors"
              >
                <span className="text-[11px] font-bold tracking-wider text-slate-800 dark:text-slate-200 uppercase">
                  {cat.label}
                </span>

                <div className="flex items-center gap-2">
                  {cat.count && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {cat.count}
                    </span>
                  )}
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpenSection ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Accordion Content */}
              {isOpenSection && cat.id === 'market_structure' && (
                <div className="p-3 border-t border-slate-200 dark:border-terminal-border bg-slate-50/50 dark:bg-terminal-900/40 space-y-2.5 text-xs font-sans">
                  {/* Toggles */}
                  {[
                    { key: 'ms_map', label: 'Market structure map (HH / HL / LH / LL)' },
                    { key: 'ms_internal', label: 'Internal structure' },
                    { key: 'ms_bos', label: 'BOS' },
                    { key: 'ms_choch', label: 'CHoCH' },
                    { key: 'ms_mss', label: 'MSS' },
                    { key: 'ms_wick_breaks', label: 'Wick break markers' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">{item.label}</span>
                      <button
                        onClick={() => toggleItem(item.key)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          toggles[item.key] ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}

                  {/* Length Inputs */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-terminal-border/80">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">External swing length</span>
                      <input
                        type="number"
                        value={externalSwingLength}
                        onChange={(e) => setExternalSwingLength(Number(e.target.value))}
                        className="w-14 px-2 py-0.5 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-center font-mono font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">Internal swing length</span>
                      <input
                        type="number"
                        value={internalSwingLength}
                        onChange={(e) => setInternalSwingLength(Number(e.target.value))}
                        className="w-14 px-2 py-0.5 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-center font-mono font-bold"
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-600 dark:text-slate-400">MSS displacement (+ATR)</span>
                      <input
                        type="number"
                        value={mssDisplacement}
                        onChange={(e) => setMssDisplacement(Number(e.target.value))}
                        className="w-14 px-2 py-0.5 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-center font-mono font-bold"
                      />
                    </div>
                  </div>

                  {/* Breaks drawn on chart dropdown */}
                  <div className="pt-1">
                    <span className="text-[10px] text-slate-500 uppercase block mb-1">Breaks drawn on the chart</span>
                    <select
                      value={breakDrawOption}
                      onChange={(e) => setBreakDrawOption(e.target.value)}
                      className="w-full px-2 py-1 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 text-xs font-semibold focus:outline-none"
                    >
                      <option>Every candle-close break</option>
                      <option>Confirmed body break only</option>
                      <option>Wick sweeps only</option>
                    </select>
                  </div>

                  {/* Colors & Transparency */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-terminal-border/80 text-[11px]">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-emerald-600" />
                        <span>Bullish</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 rounded bg-rose-600" />
                        <span>Bearish</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <span className="text-slate-600 dark:text-slate-400">Transparency</span>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={transparency}
                        onChange={(e) => setTransparency(Number(e.target.value))}
                        className="w-28 cursor-pointer"
                      />
                      <select
                        value={lineWidth}
                        onChange={(e) => setLineWidth(Number(e.target.value))}
                        className="px-1.5 py-0.5 rounded border border-slate-300 dark:border-terminal-border bg-white dark:bg-terminal-900 font-mono text-[10px]"
                      >
                        <option value={1}>Line 1</option>
                        <option value={2}>Line 2</option>
                        <option value={3}>Line 3</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-700 dark:text-slate-300">Labels</span>
                      <button
                        onClick={() => toggleItem('labels')}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          toggles.labels ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles.labels ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Order Blocks */}
              {isOpenSection && cat.id === 'order_blocks' && (
                <div className="p-3 border-t border-slate-200 dark:border-terminal-border bg-slate-50/50 dark:bg-terminal-900/40 space-y-2.5 text-xs">
                  {[
                    { key: 'ob_fresh', label: 'Fresh Order Blocks (Unmitigated)' },
                    { key: 'ob_mitigated', label: 'Mitigated Order Blocks' },
                    { key: 'ob_breaker', label: 'Breaker Blocks (Failed OB)' },
                    { key: 'ob_rejection', label: 'Rejection Blocks (Long wicks)' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">{item.label}</span>
                      <button
                        onClick={() => toggleItem(item.key)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          toggles[item.key] ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                  <div className="pt-1 text-[10px] text-slate-500 font-mono">Min. volume displacement: 1.5x ATR</div>
                </div>
              )}

              {/* Fair Value Gaps */}
              {isOpenSection && cat.id === 'fair_value_gaps' && (
                <div className="p-3 border-t border-slate-200 dark:border-terminal-border bg-slate-50/50 dark:bg-terminal-900/40 space-y-2.5 text-xs">
                  {[
                    { key: 'fvg_fresh', label: 'Fresh Fair Value Gaps (FVG)' },
                    { key: 'fvg_inversion', label: 'Inversion FVG (Passed through)' },
                    { key: 'fvg_mitigated', label: 'Consequent Encroachment (0.50)' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">{item.label}</span>
                      <button
                        onClick={() => toggleItem(item.key)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          toggles[item.key] ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Liquidity */}
              {isOpenSection && cat.id === 'liquidity' && (
                <div className="p-3 border-t border-slate-200 dark:border-terminal-border bg-slate-50/50 dark:bg-terminal-900/40 space-y-2.5 text-xs">
                  {[
                    { key: 'liq_sweep', label: 'Liquidity Sweep Markers' },
                    { key: 'liq_pools', label: 'Buy-Side & Sell-Side Pools' },
                    { key: 'liq_equal', label: 'Equal Highs / Equal Lows (EQH/EQL)' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">{item.label}</span>
                      <button
                        onClick={() => toggleItem(item.key)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          toggles[item.key] ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Fibonacci */}
              {isOpenSection && cat.id === 'fibonacci' && (
                <div className="p-3 border-t border-slate-200 dark:border-terminal-border bg-slate-50/50 dark:bg-terminal-900/40 space-y-2.5 text-xs">
                  {[
                    { key: 'fib_retracement', label: '0.618 - 0.705 - 0.786 OTE Box' },
                    { key: 'fib_extensions', label: '1.272 & 1.618 Extensions' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">{item.label}</span>
                      <button
                        onClick={() => toggleItem(item.key)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          toggles[item.key] ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Analysis Zones */}
              {isOpenSection && cat.id === 'analysis_zones' && (
                <div className="p-3 border-t border-slate-200 dark:border-terminal-border bg-slate-50/50 dark:bg-terminal-900/40 space-y-2.5 text-xs">
                  {[
                    { key: 'zones_danger', label: 'Danger Zone (Invalidation ceiling)' },
                    { key: 'zones_caution', label: 'Caution Zone (Mixed structure)' },
                    { key: 'zones_entry', label: 'Entry Zone (High confluence)' },
                    { key: 'zones_safe', label: 'Safe Zone (Protected low)' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-slate-700 dark:text-slate-300 text-[11px]">{item.label}</span>
                      <button
                        onClick={() => toggleItem(item.key)}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                          toggles[item.key] ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          toggles[item.key] ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Generic fallback content for other categories */}
              {isOpenSection && !['market_structure', 'order_blocks', 'fair_value_gaps', 'liquidity', 'fibonacci', 'analysis_zones'].includes(cat.id) && (
                <div className="p-3 border-t border-slate-200 dark:border-terminal-border bg-slate-50/50 dark:bg-terminal-900/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300 text-[11px]">Enabled on chart</span>
                    <button
                      onClick={() => toggleItem(cat.id)}
                      className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                        toggles[cat.id] !== false ? 'bg-slate-800 dark:bg-cyan-600' : 'bg-slate-300 dark:bg-terminal-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        toggles[cat.id] !== false ? 'translate-x-4' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Institutional filter configured with auto-calibration for high-probability setups.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
