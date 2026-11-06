'use client';

import React, { useState, useMemo } from 'react';
import { Search, Database, CheckCircle, X } from 'lucide-react';
import { KnowledgeRule } from '@/lib/types';
import { TECHNICAL_KNOWLEDGE_BASE } from '@/lib/knowledge/technicalKnowledge';
import { FUNDAMENTAL_KNOWLEDGE_BASE } from '@/lib/knowledge/fundamentalKnowledge';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTriggeredRules?: KnowledgeRule[];
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({
  isOpen,
  onClose,
  activeTriggeredRules = [],
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'TECHNICAL' | 'FUNDAMENTAL' | 'INDIAN_MARKET' | 'TRIGGERED'>('ALL');

  const allRules: KnowledgeRule[] = useMemo(() => {
    return [...TECHNICAL_KNOWLEDGE_BASE, ...FUNDAMENTAL_KNOWLEDGE_BASE];
  }, []);

  const filteredRules = useMemo(() => {
    return allRules.filter(rule => {
      // Tab filter
      if (activeTab === 'TECHNICAL' && rule.category !== 'TECHNICAL') return false;
      if (activeTab === 'FUNDAMENTAL' && rule.category !== 'FUNDAMENTAL') return false;
      if (activeTab === 'INDIAN_MARKET' && rule.marketScope !== 'INDIAN_MARKET') return false;
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
  }, [allRules, activeTab, searchTerm, activeTriggeredRules]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-5xl h-[92vh] sm:h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400 shrink-0">
              <Database className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">Institutional Knowledge Base</h3>
                <span className="hidden sm:inline px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {allRules.length} VERIFIED RULES
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono truncate">
                525 Technical (SMC / Confluence) • 525 Fundamental (Central Banks / Indian Markets)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors shrink-0"
            aria-label="Close Explorer"
          >
            <span className="hidden sm:inline">Close Explorer</span>
            <X className="w-4 h-4 sm:hidden" />
          </button>
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
              onClick={() => setActiveTab('INDIAN_MARKET')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'INDIAN_MARKET' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              🇮🇳 NSE
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
            const isTech = rule.category === 'TECHNICAL';

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
                      isTech 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' 
                        : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                    }`}>
                      {rule.category}
                    </span>
                    <span className="text-white font-bold text-xs">{rule.ruleName}</span>
                    <span className="text-[10px] text-slate-400">({rule.subcategory})</span>
                  </div>

                  <div className="flex items-center gap-2">
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
    </div>
  );
};
