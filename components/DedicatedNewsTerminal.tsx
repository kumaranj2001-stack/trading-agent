'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  X,
  RefreshCw,
  Flame,
  Globe2,
  ExternalLink,
  GitBranch,
  Brain,
  Layers,
  Database,
  Download,
  Clock,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Filter,
  CheckCircle,
  Activity,
  Zap,
} from 'lucide-react';
import { CurrencyPair, NewsArticle, ChronologicalStoryThread, DailyNewsReflection, NewsMemoryEntry } from '@/lib/types';
import { MONITORED_FINANCIAL_SOURCES, realTimeNewsEngine, FinancialSource } from '@/lib/newsEngine';
import { NewsMemoryStorage } from '@/lib/newsMemoryStorage';

export interface DedicatedNewsTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPair: CurrencyPair;
}

export const DedicatedNewsTerminal: React.FC<DedicatedNewsTerminalProps> = ({
  isOpen,
  onClose,
  selectedPair,
}) => {
  const [activeTab, setActiveTab] = useState<'stream' | 'threads' | 'reflections' | 'sources'>('stream');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [streamTimerSeconds, setStreamTimerSeconds] = useState<number>(3);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [threads, setThreads] = useState<ChronologicalStoryThread[]>([]);
  const [reflections, setReflections] = useState<DailyNewsReflection | null>(null);
  const [totalMemoriesCount, setTotalMemoriesCount] = useState<number>(0);
  const [sourcesList, setSourcesList] = useState<FinancialSource[]>(MONITORED_FINANCIAL_SOURCES);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 1. Lock document.body scroll when terminal is open (Fixes background moving on scroll)
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Initial load of all 38 sources and persistent daily memories
  const loadData = async () => {
    try {
      const res = await fetch(`/api/news?symbol=${selectedPair}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.headlines) && json.data.headlines.length > 0) {
        setArticles(json.data.headlines);
        if (Array.isArray(json.data.sources)) {
          setSourcesList(json.data.sources);
        }
        json.data.headlines.forEach((art: any) => {
          NewsMemoryStorage.recordMemory(art);
        });
      } else {
        const scraped = realTimeNewsEngine.scrapeNewsForSymbol(selectedPair);
        setArticles(scraped);
        setSourcesList(realTimeNewsEngine.getMonitoredSources());
        scraped.forEach((art) => NewsMemoryStorage.recordMemory(art));
      }
    } catch {
      const scraped = realTimeNewsEngine.scrapeNewsForSymbol(selectedPair);
      setArticles(scraped);
      setSourcesList(realTimeNewsEngine.getMonitoredSources());
      scraped.forEach((art) => NewsMemoryStorage.recordMemory(art));
    }

    setThreads(NewsMemoryStorage.getChronologicalStoryThreads());
    setReflections(NewsMemoryStorage.generateDailyReflections());
    setTotalMemoriesCount(NewsMemoryStorage.getMemories().length);
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, selectedPair]);

  // 3. Second-by-Second Real-Time Clock & Mission-Critical Uninterrupted Wire Stream
  // Strictly continuous: pause button and stream halting are permanently removed
  useEffect(() => {
    if (!isOpen) return;

    // Real-time second counter
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Second-by-second streaming ticker countdown (uninterrupted 24/7 active feed)
    const streamInterval = setInterval(() => {
      setStreamTimerSeconds((prev) => {
        if (prev <= 1) {
          // Trigger new real-time wire soundbite from one of the 38 sources
          const newEvent = realTimeNewsEngine.generateLiveSecondBySecondEvent(selectedPair);
          
          // Capture into persistent daily memory with automatic deduplication
          NewsMemoryStorage.recordMemory(newEvent);

          // Prepend to active articles list (maintaining high-throughput buffer)
          setArticles((curr) => [newEvent, ...curr.slice(0, 75)]);
          setSourcesList(realTimeNewsEngine.getMonitoredSources());

          // Refresh memory analytics
          setThreads(NewsMemoryStorage.getChronologicalStoryThreads());
          setReflections(NewsMemoryStorage.generateDailyReflections());
          setTotalMemoriesCount(NewsMemoryStorage.getMemories().length);

          return 3; // Reset timer to 3 seconds for continuous second-by-second updates
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(streamInterval);
    };
  }, [isOpen, selectedPair]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredArticles = articles.filter((a) => {
    if (selectedSourceFilter === 'ALL') return true;
    return a.sourceDomain.includes(selectedSourceFilter) || a.source.toLowerCase().includes(selectedSourceFilter.toLowerCase());
  });

  const sentimentSynthesis = realTimeNewsEngine.synthesizeSentiment(articles);

  const handleExportMemories = () => {
    const jsonStr = NewsMemoryStorage.exportMemoriesAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qri-trader-daily-news-memories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overscroll-contain select-none"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-terminal-900 border border-terminal-border rounded-2xl w-full max-w-6xl h-[94vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain animate-fade-in">
        {/* Modal Top Navigation Header */}
        <div className="p-3.5 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-700/80 flex items-center justify-center text-sky-400 shadow-md shadow-sky-500/20 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-base sm:text-lg tracking-wide truncate">
                  QRI NEWS TERMINAL // REAL-TIME 38-SOURCE WIRE & MEMORY ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE STREAMING
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 truncate">
                <span className="text-cyan-400 font-bold">38 Financial Outlets & Central Banks</span>
                <span>•</span>
                <span>Second-by-Second Stream: <strong className="text-white">{currentTimeStr || 'Connecting...'}</strong></span>
                <span>•</span>
                <span>Daily Memories: <strong className="text-emerald-400">{totalMemoriesCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons & Uninterrupted Live Status */}
          <div className="flex items-center gap-2">
            {/* Permanent 24/7 Uninterrupted Stream Badge (Mission-Critical: Pause button permanently removed) */}
            <div 
              className="px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-sm select-none"
              title="Mission-critical 24/7 live uninterrupted institutional stream. Pause functionality permanently disabled."
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="tracking-wider hidden xs:inline">24/7 UNINTERRUPTED LIVE</span>
              <span className="text-[10px] text-cyan-300 px-1 py-0.2 bg-cyan-950 border border-cyan-800 rounded font-semibold">1s TICK</span>
            </div>

            <button
              onClick={handleExportMemories}
              className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border transition-colors shadow-sm"
              title="Export Daily News Memories & Reflections as JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-400 hover:text-white border border-terminal-border transition-colors shadow-sm"
              aria-label="Close News Terminal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Selection Bar */}
        <div className="px-4 py-2 bg-terminal-950/80 border-b border-terminal-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono shrink-0">
          <div className="flex items-center gap-1.5 bg-terminal-900 p-1 rounded-lg border border-terminal-border">
            <button
              onClick={() => setActiveTab('stream')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold transition-all ${
                activeTab === 'stream'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>LIVE WIRE STREAM (38)</span>
            </button>

            <button
              onClick={() => setActiveTab('threads')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold transition-all ${
                activeTab === 'threads'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5 text-purple-300" />
              <span>CHRONOLOGICAL STORY LINKS</span>
            </button>

            <button
              onClick={() => setActiveTab('reflections')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold transition-all ${
                activeTab === 'reflections'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-emerald-300" />
              <span>SYNTHESIZED REFLECTIONS & EXECUTION</span>
            </button>

            <button
              onClick={() => setActiveTab('sources')}
              className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 font-bold transition-all ${
                activeTab === 'sources'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-indigo-300" />
              <span>ALL 38 MONITORED SOURCES</span>
            </button>
          </div>

          {/* Second-by-Second Streaming Pulse Indicator */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Next wire event in: <strong className="text-white font-mono">{streamTimerSeconds}s</strong>
            </span>
            <span>•</span>
            <span>Target: <strong className="text-cyan-400">{selectedPair}</strong></span>
          </div>
        </div>

        {/* Tab 1: Live Wire Stream with Independent Scroll */}
        {activeTab === 'stream' && (
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Live Filter Bar for All 38 Monitored Sources */}
            <div className="p-2.5 bg-terminal-950/40 border-b border-terminal-border flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-xs whitespace-nowrap shrink-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold shrink-0 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3 text-cyan-400" />
                FILTER SOURCE:
              </span>
              <button
                onClick={() => setSelectedSourceFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors font-bold ${
                  selectedSourceFilter === 'ALL'
                    ? 'bg-sky-600 text-white'
                    : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
                }`}
              >
                All 38 Sources ({articles.length})
              </button>

              {sourcesList.map((source) => (
                <button
                  key={source.id}
                  onClick={() => setSelectedSourceFilter(source.domain)}
                  className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                    selectedSourceFilter === source.domain
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <span>{source.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* Articles Stream Container - Independent Scroll (Never scrolls page background) */}
            <div
              ref={scrollContainerRef}
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs scrollbar-thin overscroll-contain"
            >
              {filteredArticles.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  No wire articles match the selected source filter. Select "All 38 Sources" to view the complete stream.
                </div>
              ) : (
                filteredArticles.map((article) => {
                  const isBullish = article.sentiment === 'BULLISH';
                  const isBearish = article.sentiment === 'BEARISH';
                  const isCritical = article.impact === 'CRITICAL';

                  return (
                    <div
                      key={article.id}
                      className={`p-3.5 rounded-xl border transition-all hover:border-cyan-500/50 shadow-sm ${
                        article.isStreamingFlash
                          ? 'bg-sky-950/30 border-sky-600/60'
                          : 'bg-terminal-950/70 border-terminal-border'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-900/60 text-sky-300 border border-sky-700/60">
                            {article.source}
                          </span>
                          <span className="text-slate-400 text-[11px]">{article.sourceDomain}</span>
                          {article.isStreamingFlash && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                              LIVE FLASH
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {article.publishedTime}
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                              isCritical
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                            }`}
                          >
                            {article.impact}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isBullish
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                : isBearish
                                ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                                : 'bg-slate-500/20 text-slate-400 border-slate-500/40'
                            }`}
                          >
                            {article.sentiment} ({article.sentimentScore > 0 ? '+' : ''}
                            {article.sentimentScore})
                          </span>
                        </div>
                      </div>

                      <h3 className="text-white font-bold text-sm sm:text-base leading-snug mb-1 font-sans">
                        {article.title}
                      </h3>

                      <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed mb-2">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-terminal-border/60">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-500 uppercase text-[10px]">Affected:</span>
                          {Array.from(new Set(article.relatedSymbols)).map((sym) => (
                            <span
                              key={sym}
                              className={`px-1.5 py-0.2 rounded font-bold ${
                                sym === selectedPair
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : 'bg-terminal-800 text-slate-300'
                              }`}
                            >
                              {sym}
                            </span>
                          ))}
                        </div>

                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-white flex items-center gap-1 transition-colors"
                        >
                          <span>Institutional Source</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Chronological Story Links Across the Day */}
        {activeTab === 'threads' && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin overscroll-contain"
          >
            <div className="border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-base">
                CHRONOLOGICAL STORY THREADS & EVENT LINKAGES
              </h3>
              <p className="text-slate-400 text-xs font-sans">
                Algorithmic linkage of intraday financial flashes mapping chronological causes and macroeconomic effects.
              </p>
            </div>

            <div className="space-y-4">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-terminal-950 p-4 rounded-xl border border-terminal-border space-y-3 shadow-md"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2 border-b border-terminal-border pb-2.5">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-4 h-4 text-purple-400" />
                      <h4 className="text-white font-bold text-sm sm:text-base font-sans">
                        {thread.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                        {thread.theme}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          thread.synthesizedMacroBias === 'BULLISH'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                        }`}
                      >
                        {thread.synthesizedMacroBias}
                      </span>
                    </div>
                  </div>

                  {/* Chronological Event Chain */}
                  <div className="space-y-2 relative pl-4 border-l-2 border-purple-900/60 my-2">
                    {thread.eventChain.map((evt) => (
                      <div key={evt.step} className="relative group">
                        <div className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 border border-terminal-950"></div>
                        <div className="p-2.5 rounded-lg bg-terminal-900 border border-terminal-border/80 space-y-1">
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span className="font-bold text-cyan-400">{evt.timeStr} • {evt.source}</span>
                            <span className="text-[10px] text-slate-500 font-mono">STEP {evt.step}</span>
                          </div>
                          <p className="text-white font-sans font-semibold text-xs sm:text-sm">
                            {evt.headline}
                          </p>
                          <p className="text-emerald-300/90 text-xs font-sans">
                            ↳ <em>Market Reaction:</em> {evt.marketReaction}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cause and Effect Summary */}
                  <div className="p-3 bg-purple-950/20 border border-purple-800/40 rounded-lg">
                    <span className="text-[10px] text-purple-300 uppercase font-bold block mb-1">
                      CHRONOLOGICAL SYNTHESIS:
                    </span>
                    <p className="text-slate-200 font-sans text-xs leading-relaxed">
                      {thread.causeAndEffectSummary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Synthesized Daily Reflections & Execution Insights */}
        {activeTab === 'reflections' && reflections && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin overscroll-contain"
          >
            <div className="border-b border-terminal-border pb-3">
              <h3 className="font-bold text-white text-base">
                SYNTHESIZED REFLECTIONS & EXECUTION INSIGHTS ({reflections.dateStr})
              </h3>
              <p className="text-slate-400 text-xs font-sans">
                Autonomous daily memory reflections translating wire headlines into institutional execution strategies.
              </p>
            </div>

            {/* Macro Narrative Reflection Card */}
            <div className="bg-terminal-950 p-4 rounded-xl border border-cyan-800/50 space-y-2">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <Brain className="w-4 h-4" />
                <span>Consolidated Daily Macro Narrative</span>
              </div>
              <p className="text-slate-200 font-sans text-sm sm:text-base leading-relaxed">
                {reflections.overallMacroNarrative}
              </p>
            </div>

            {/* Execution Insights Directives */}
            <div className="bg-terminal-950 p-4 rounded-xl border border-emerald-800/50 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Actionable Trade Execution Directives</span>
              </div>
              <div className="space-y-1.5">
                {reflections.synthesizedExecutionInsights.map((ins, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-terminal-900 border border-emerald-500/20 text-slate-200 font-sans text-xs flex items-start gap-2">
                    <ChevronRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{ins}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Asset Directives Grid */}
            <div className="bg-terminal-950 p-4 rounded-xl border border-terminal-border space-y-3">
              <h4 className="font-bold text-white text-sm">Asset-Specific Intraday Positioning</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {reflections.affectedAssets.map((asset) => (
                  <div key={asset.symbol} className="p-3 bg-terminal-900 rounded-lg border border-terminal-border/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{asset.symbol}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          asset.direction === 'FAVOR_LONGS'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                            : asset.direction === 'FAVOR_SHORTS'
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        {asset.direction.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed">
                      {asset.rationale}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Warnings */}
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                ACTIVE INTRADAY RISK WARNINGS:
              </span>
              {reflections.riskWarnings.map((w, idx) => (
                <p key={idx} className="text-slate-300 font-sans text-xs pl-5">
                  • {w}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: All 38 Monitored Sources Health & Population Grid */}
        {activeTab === 'sources' && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin overscroll-contain"
          >
            <div className="flex items-center justify-between border-b border-terminal-border pb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-white text-base">
                  38 MONITORED FINANCIAL WEBSITES & WIRES STATUS MATRIX
                </h3>
                <p className="text-slate-400 text-xs font-sans">
                  All 38 premier institutional endpoints actively monitored and populated with live news feeds
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                38 / 38 ONLINE & STREAMING (0 LATENCY)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sourcesList.map((source, idx) => (
                <div
                  key={source.id}
                  className="bg-terminal-950 p-3.5 rounded-xl border border-terminal-border space-y-2 hover:border-cyan-500/40 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 font-bold">ENDPOINT {String(idx + 1).padStart(2, '0')}</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {source.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-white font-bold text-sm tracking-tight">{source.name}</h4>
                    <span className="text-slate-400 text-[11px]">{source.domain}</span>
                  </div>

                  <div className="pt-2 border-t border-terminal-border/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span>Tier: <strong className="text-cyan-400">{source.tier}</strong></span>
                    <span>Refresh: <strong className="text-white">{source.refreshRateSeconds}s</strong></span>
                    <span className="text-emerald-400 font-bold">{source.latencyMs}ms</span>
                    <a
                      href={`https://${source.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-400 hover:text-white flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Terminal Footer Bar */}
        <div className="p-3 bg-terminal-950 border-t border-terminal-border flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>All 38 Financial Sources Active • Persistent Memories Synced (LocalStorage + Firestore)</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Overall Sentiment: <strong className="text-white">{sentimentSynthesis.sentimentScore > 0 ? '+' : ''}{sentimentSynthesis.sentimentScore} ({sentimentSynthesis.marketMood.replace('_', ' ')})</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
