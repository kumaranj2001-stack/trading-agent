'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, Database, CheckCircle, X, ArrowLeft, ShieldAlert, AlertTriangle, ShieldCheck, Zap, Lock, History } from 'lucide-react';
import { KnowledgeRule, FailureConstraintRule } from '@/lib/types';
import { TECHNICAL_KNOWLEDGE_BASE } from '@/lib/knowledge/technicalKnowledge';
import { FUNDAMENTAL_KNOWLEDGE_BASE } from '@/lib/knowledge/fundamentalKnowledge';
import { CANDLESTICK_KNOWLEDGE_BASE } from '@/lib/knowledge/candlestickKnowledge';
import { knowledgeEngine } from '@/lib/knowledge/KnowledgeEngine';
import { diagnosticReasoningEngine } from '@/lib/diagnosticReasoningEngine';

interface KnowledgeBaseModalProps {
  isOpen?: boolean;
  onClose: () => void;
  activeTriggeredRules?: KnowledgeRule[];
  isFullPage?: boolean;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen = true,
  onClose,
  activeTriggeredRules = [],
  isFullPage = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TECHNICAL' | 'FUNDAMENTAL' | 'CANDLESTICK_PATTERN' | 'INDIAN_MARKET' | 'FAILURE_CONSTRAINTS' | 'TRIGGERED'>('ALL');
  const [apiRules, setApiRules] = useState<KnowledgeRule[] | null>(null);
  const [apiStats, setApiStats] = useState<any>(null);
  const [isLoadingApi, setIsLoadingApi] = useState<boolean>(false);

  // Dynamic Backend API Integration
  useEffect(() => {
    if (!isOpen) return;
    const fetchKnowledgeFromApi = async () => {
      setIsLoadingApi(true);
      try {
        const catParam = activeTab === 'ALL' || activeTab === 'TRIGGERED' 
          ? '' 
          : activeTab === 'FAILURE_CONSTRAINTS' 
          ? '&category=FAILURE_CONSTRAINTS' 
          : `&category=${activeTab}`;
        const queryParam = searchTerm.trim() ? `&query=${encodeURIComponent(searchTerm.trim())}` : '';
        const res = await fetch(`/api/knowledge?${catParam}${queryParam}`);
        const json = await res.json();
        if (json.success && json.data) {
          setApiRules(json.data.rules);
          setApiStats(json.data.stats);
        }
      } catch (err) {
        console.error('Failed to fetch knowledge via API:', err);
      } finally {
        setIsLoadingApi(false);
      }
    };

    fetchKnowledgeFromApi();
  }, [isOpen, activeTab, searchTerm]);

  const dynamicRules: FailureConstraintRule[] = useMemo(() => {
    return diagnosticReasoningEngine.getDynamicRules();
  }, [isOpen, activeTab]);

  const allRules: (KnowledgeRule | FailureConstraintRule)[] = useMemo(() => {
    return knowledgeEngine.getAllRules();
  }, [dynamicRules]);

  const filteredRules = useMemo(() => {
    // If backend API returned filtered rules, prioritize API result unless on TRIGGERED tab
    if (activeTab !== 'TRIGGERED' && apiRules && apiRules.length > 0) {
      return apiRules;
    }

    return allRules.filter(rule => {
      const isDynamic = 'isSynthesizedFromLoss' in rule || rule.id.startsWith('RULE-KB-105');

      // Tab filter
      if (activeTab === 'TECHNICAL' && (rule.category !== 'TECHNICAL' || isDynamic)) return false;
      if (activeTab === 'FUNDAMENTAL' && (rule.category !== 'FUNDAMENTAL' || isDynamic)) return false;
      if (activeTab === 'CANDLESTICK_PATTERN' && (rule.category !== 'CANDLESTICK_PATTERN' || isDynamic)) return false;
      if (activeTab === 'INDIAN_MARKET' && rule.marketScope !== 'INDIAN_MARKET') return false;
      if (activeTab === 'FAILURE_CONSTRAINTS' && !isDynamic) return false;
      if (activeTab === 'TRIGGERED') {
        const isTriggered = activeTriggeredRules.some(r => r.id === rule.id);
        if (!isTriggered) return false;
      }

      // Search filter
      if (!searchTerm.trim()) return true;
      const s = searchTerm.toLowerCase().trim();
      return (
        rule.ruleName.toLowerCase().includes(s) ||
        rule.conditionDescription.toLowerCase().includes(s) ||
        rule.subcategory.toLowerCase().includes(s) ||
        rule.id.toLowerCase().includes(s)
      );
    });
  }, [allRules, activeTab, searchTerm, activeTriggeredRules, apiRules]);

  if (!isOpen && !isFullPage) return null;

  const content = (
    <div className={`bg-terminal-900 border border-terminal-border rounded-xl w-full ${isFullPage ? 'shadow-xl' : 'max-w-5xl h-[92vh] sm:h-[85vh] shadow-2xl'} flex flex-col overflow-hidden`}>
      {/* Header */}
      <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 shrink-0">
            <Database className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-sm sm:text-base truncate">
                10 // INSTITUTIONAL KNOWLEDGE BASE (1,170+ QUANTITATIVE MODELS)
              </h3>
              <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                {allRules.length} VERIFIED MODELS (525+ TECH + 525+ FUND + 120+ CANDLESTICK)
              </span>
              <span className="hidden md:inline px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                DYNAMIC RISK PRECEDENCE
              </span>
              <span className="hidden lg:inline px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                UNIFIED RISK-LINKED SCHEMA
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
              525+ Technical (SMC / AMT / Volatility) • 525+ Fundamental (Macro / Rates / Flows / COT) • 120+ Candlestick Patterns
            </p>
          </div>
        </div>

        {isFullPage ? (
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors flex items-center gap-1.5 font-semibold"
            title="Return to Terminal"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>RETURN TO TERMINAL</span>
          </button>
        ) : (
          <button
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors shrink-0"
            aria-label="Close Explorer"
          >
            <span className="hidden sm:inline">Close Explorer</span>
            <X className="w-4 h-4 sm:hidden" />
          </button>
        )}
      </div>

        {/* Filter & Search Bar */}
        <div className="p-2 sm:p-3 bg-terminal-950/60 border-b border-terminal-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 font-mono text-xs">
          {/* Scrollable Tabs */}
          <div className="flex items-center gap-1 bg-terminal-900 p-1 rounded-lg border border-terminal-border overflow-x-auto scrollbar-none whitespace-nowrap">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({allRules.length})
            </button>
            <button
              onClick={() => setActiveTab('TECHNICAL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'TECHNICAL' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Technical ({TECHNICAL_KNOWLEDGE_BASE.length})
            </button>
            <button
              onClick={() => setActiveTab('FUNDAMENTAL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'FUNDAMENTAL' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Fundamental ({FUNDAMENTAL_KNOWLEDGE_BASE.length})
            </button>
            <button
              onClick={() => setActiveTab('CANDLESTICK_PATTERN')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'CANDLESTICK_PATTERN' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Candlestick ({CANDLESTICK_KNOWLEDGE_BASE.length})
            </button>
            <button
              onClick={() => setActiveTab('INDIAN_MARKET')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'INDIAN_MARKET' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 NSE
            </button>
            <button
              onClick={() => setActiveTab('FAILURE_CONSTRAINTS')}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'FAILURE_CONSTRAINTS' 
                  ? 'bg-rose-600 text-white font-bold shadow-sm' 
                  : 'text-rose-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3 h-3 text-rose-300" />
              <span>Operative Rules ({dynamicRules.length})</span>
            </button>
            {activeTriggeredRules.length > 0 && (
              <button
                onClick={() => setActiveTab('TRIGGERED')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'TRIGGERED' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-white'
                }`}
              >
                Triggered ({activeTriggeredRules.length})
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative w-full md:max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search SMC, Nifty, FII, FVG..."
              className="w-full bg-terminal-900 border border-terminal-border pl-8 pr-3 py-1.5 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        {/* Rules Table / Cards */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 font-mono scrollbar-thin">
          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
            <span>SHOWING {Math.min(100, filteredRules.length)} OF {filteredRules.length} RULES</span>
            <span className="hidden sm:inline">HIGH-ACCURACY CONFLUENCE ENGINE</span>
          </div>

          {filteredRules.slice(0, 100).map((rule) => {
            const isTriggered = activeTriggeredRules.some(r => r.id === rule.id);
            const isDynamic = 'isSynthesizedFromLoss' in rule && (rule as FailureConstraintRule).isSynthesizedFromLoss;
            const failureRule = isDynamic ? (rule as FailureConstraintRule) : null;
            const audit = failureRule?.failureAudit;
            const isTech = rule.category === 'TECHNICAL';

            if (isDynamic && failureRule) {
              return (
                <div
                  key={rule.id}
                  className="p-3 sm:p-4 rounded-xl border bg-gradient-to-r from-rose-950/40 via-terminal-950 to-amber-950/30 border-rose-500/50 hover:border-rose-400 transition-all shadow-lg"
                >
                  <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white border border-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-3 h-3" />
                        OPERATIVE RULE #{audit?.ruleIndex || 1051}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        SYNTHESIZED FROM STOP LOSS
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        failureRule.enforcementAction === 'DECLINE_ENTRY' 
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' 
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}>
                        ENFORCEMENT: {failureRule.enforcementAction.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <span>ORIGIN: <strong className="text-white">{audit?.symbol} {audit?.orderType}</strong></span>
                      <span>LOSS: <strong className="text-rose-400">-${Math.abs(audit?.realizedLossUsd || 0).toFixed(2)}</strong></span>
                      <span>ID: {rule.id}</span>
                    </div>
                  </div>

                  <h4 className="text-white font-bold text-xs sm:text-sm mb-1">{rule.ruleName}</h4>
                  
                  {/* Point of Failure & Primary Metric */}
                  <div className="p-2.5 rounded-lg bg-terminal-900/90 border border-rose-900/60 my-2 space-y-1 text-xs">
                    <p className="text-rose-200">
                      <strong className="text-rose-400 uppercase text-[10px] tracking-wide block">Point of Failure:</strong>
                      {audit?.pointOfFailure || rule.conditionDescription}
                    </p>
                    {audit?.primaryFailureMetric && (
                      <p className="text-slate-300 text-[11px]">
                        <strong className="text-cyan-400 uppercase text-[10px] tracking-wide">Primary Failure Metric: </strong>
                        {audit.primaryFailureMetric}
                      </p>
                    )}
                    <p className="text-amber-200 text-[11px] pt-1 border-t border-rose-900/40">
                      <strong className="text-amber-400 uppercase text-[10px] tracking-wide">Active Filter Directive: </strong>
                      {failureRule.preventativeMessage}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-900/40 text-[10px]">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-slate-400">
                        Scope: <strong className="text-slate-200">{rule.marketScope.replace('_', ' ')}</strong>
                      </span>
                      <span className="text-slate-400">
                        Inverse Signal Action: <strong className={rule.signalAction.includes('BUY') ? 'text-emerald-400' : 'text-rose-400'}>{rule.signalAction}</strong>
                      </span>
                      <span className="text-slate-400">
                        Expected Win Rate: <strong className="text-cyan-400">{rule.expectedWinRate}%</strong>
                      </span>
                      <span className="text-slate-400">
                        Weight: <strong className="text-indigo-400">{rule.confidenceWeight}/10</strong>
                      </span>
                    </div>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE PRE-EXECUTION FILTER
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={rule.id}
                className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                  isTriggered 
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10' 
                    : 'bg-terminal-950/70 border-terminal-border hover:border-slate-600'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.category === 'TECHNICAL'
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                        : rule.category === 'CANDLESTICK_PATTERN'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}>
                      {rule.category}
                    </span>
                    {rule.tier && (
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border ${
                        rule.tier === 'TIER_1_ALPHA_VANGUARD'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : rule.tier === 'TIER_2_HIGH_CONVICTION'
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}>
                        {rule.tier === 'TIER_1_ALPHA_VANGUARD' ? 'ALPHA VANGUARD' : rule.tier === 'TIER_2_HIGH_CONVICTION' ? 'HIGH CONVICTION' : 'TACTICAL'}
                      </span>
                    )}
                    <span className="text-white font-bold text-xs">{rule.ruleName}</span>
                    <span className="text-[10px] text-slate-400">({rule.orthogonalFamily || rule.subcategory})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {rule.sharpeRatio && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                        Sharpe: <strong>{rule.sharpeRatio}</strong>
                      </span>
                    )}
                    {isTriggered && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        ACTIVE
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400">ID: {rule.id}</span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs font-sans mb-2 leading-relaxed">
                  {rule.conditionDescription}
                </p>

                {/* 🕯️ Curated Candlestick Pattern Metrics */}
                {rule.candlestickMetrics && (
                  <div className="my-2 p-2.5 rounded-lg bg-rose-950/20 border border-rose-500/30 text-[10px] font-mono grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-slate-400 text-[9px] block">Pattern Formation</span>
                      <strong className="text-rose-300 truncate block">{rule.candlestickMetrics.patternType.replace(/_/g, ' ')}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Min Wick:Body Ratio</span>
                      <strong className="text-amber-300 block">{rule.candlestickMetrics.minWickToBodyRatio}:1</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Volume Confirmation</span>
                      <strong className="text-cyan-300 block">≥{rule.candlestickMetrics.volumeConfirmationThreshold}x 20-SMA</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[9px] block">Defining SL Anchor</span>
                      <strong className="text-emerald-300 truncate block">{rule.candlestickMetrics.stopLossAnchorPoint.replace(/_/g, ' ')}</strong>
                    </div>
                  </div>
                )}

                {/* 🏛️ Standardized Unified Risk-First Schema: Structural Invalidation & Dynamic Target Logic */}
                {rule.structuralInvalidation && rule.dynamicTargetLogic && (
                  <div className="my-2 p-2.5 rounded-lg bg-black/40 border border-indigo-500/30 text-[10px] font-mono grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div className="min-w-0">
                      <span className="text-rose-400 font-bold block mb-0.5 truncate">
                        🛡️ STRUCTURAL INVALIDATION (STOP-LOSS):
                      </span>
                      <span className="text-slate-300 block truncate">
                        Anchor: <strong className="text-white">{rule.structuralInvalidation.anchorType}</strong> (+{rule.structuralInvalidation.anchorOffsetPips}p Buffer)
                      </span>
                      <span className="text-slate-400 text-[9px] block truncate">
                        Formula: {rule.structuralInvalidation.invalidationPriceFormula}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <span className="text-emerald-400 font-bold block mb-0.5 truncate">
                        🎯 DYNAMIC TARGET LOGIC (EXIT MANAGEMENT):
                      </span>
                      <span className="text-slate-300 block truncate">
                        Target: <strong className="text-white">{rule.dynamicTargetLogic.targetType}</strong> (Min {rule.dynamicTargetLogic.minimumRiskRewardRatio}:1 R:R)
                      </span>
                      <span className="text-slate-400 text-[9px] block truncate">
                        Formula: {rule.dynamicTargetLogic.targetCalculationFormula}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-terminal-border/40 text-[10px]">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-slate-400">
                      Scope: <strong className="text-slate-200">{rule.marketScope.replace('_', ' ')}</strong>
                    </span>
                    <span className="text-slate-400">
                      Signal: <strong className={rule.signalAction.includes('BUY') ? 'text-emerald-400' : rule.signalAction.includes('SELL') ? 'text-rose-400' : 'text-amber-400'}>{rule.signalAction}</strong>
                    </span>
                    <span className="text-slate-400">
                      Win Rate: <strong className="text-cyan-400">{rule.expectedWinRate}%</strong>
                    </span>
                    {rule.maxDrawdownPercent !== undefined && (
                      <span className="text-slate-400">
                        Max DD: <strong className="text-emerald-400">{rule.maxDrawdownPercent}%</strong>
                      </span>
                    )}
                    {rule.profitFactor !== undefined && (
                      <span className="text-slate-400">
                        PF: <strong className="text-indigo-400">{rule.profitFactor}</strong>
                      </span>
                    )}
                    <span className="text-slate-400">
                      Weight: <strong className="text-indigo-400">{rule.confidenceWeight}/10</strong>
                    </span>
                  </div>
                  <span className="text-slate-400 truncate max-w-xs">
                    Invalidation: {rule.invalidationCriteria}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
  );

  if (isFullPage) {
    return content;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      {content}
    </div>
  );
};
