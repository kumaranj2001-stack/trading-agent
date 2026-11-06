'use client';

import React, { useState, useMemo } from 'react';
import { BookOpen, Search, Filter, ShieldCheck, Zap, Database, Award, CheckCircle } from 'lucide-react';
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
      if (!searchTerm) return true;
      const s = searchTerm.toLowerCase();
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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-950 border border-indigo-700 flex items-center justify-center text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base">Institutional Knowledge Base</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {allRules.length} VERIFIED RULES STORED
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                525 Technical Patterns & SMC Setups • 525 Macro & Indian Market Fundamental Catalysts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors"
          >
            Close Explorer
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-3 bg-terminal-950/60 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-terminal-900 p-1 rounded-lg border border-terminal-border">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2.5 py-1 rounded transition-colors ${
                activeTab === 'ALL' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Rules ({allRules.length})
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
              🇮🇳 Indian Market (150+)
            </button>
            {activeTriggeredRules.length > 0 && (
              <button
                onClick={() => setActiveTab('TRIGGERED')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  activeTab === 'TRIGGERED' ? 'bg-emerald-600 text-white font-bold' : 'text-emerald-400 hover:text-white'
                }`}
              >
                Triggered Today ({activeTriggeredRules.length})
              </button>
            )}
          </div>

          {/* Search box */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by SMC, Nifty, FII, FVG, CPI..."
              className="w-full bg-terminal-900 border border-terminal-border pl-8 pr-3 py-1.5 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        {/* Rules Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono scrollbar-thin">
          <div className="text-[11px] text-slate-400 flex items-center justify-between px-1">
            <span>SHOWING {filteredRules.length} OF {allRules.length} RULES</span>
            <span>HIGH-ACCURACY CONFLUENCE ENGINE</span>
          </div>

          {filteredRules.slice(0, 100).map((rule) => {
            const isTriggered = activeTriggeredRules.some(r => r.id === rule.id);
            const isTech = rule.category === 'TECHNICAL';

            return (
              <div
                key={rule.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isTriggered 
                    ? 'bg-emerald-950/40 border-emerald-500/60 shadow-md shadow-emerald-500/10' 
                    : 'bg-terminal-950/70 border-terminal-border hover:border-slate-600'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
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
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 flex items-center gap-1 animate-pulse">
                        <CheckCircle className="w-3 h-3" />
                        ACTIVE CONFLUENCE
                      </span>
                    )}
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      Win Rate: {rule.expectedWinRate}%
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Weight: {rule.confidenceWeight}/10
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      rule.signalAction.includes('BUY')
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {rule.signalAction}
                    </span>
                  </div>
                </div>

                <p className="text-slate-300 text-xs font-sans leading-relaxed mb-1.5">
                  <strong>Trigger Criteria:</strong> {rule.conditionDescription}
                </p>

                <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-terminal-border/40">
                  <span>Scope: <strong className="text-slate-300">{rule.marketScope}</strong></span>
                  <span>Invalidation: <strong className="text-rose-300">{rule.invalidationCriteria}</strong></span>
                </div>
              </div>
            );
          })}
          {filteredRules.length > 100 && (
            <div className="p-3 text-center text-xs text-slate-400 bg-terminal-950 rounded-lg">
              Showing first 100 matching rules. Use search above to narrow down specific institutional setups.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
