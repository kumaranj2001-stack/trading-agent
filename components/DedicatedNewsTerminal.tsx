'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Radio,
  X,
  Play,
  Pause,
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
} from 'lucide-react';
import { CurrencyPair, NewsArticle, ChronologicalStoryThread, DailyNewsReflection, NewsMemoryEntry } from '@/lib/types';
import { MONITORED_FINANCIAL_SOURCES, realTimeNewsEngine } from '@/lib/newsEngine';
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
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [streamTimerSeconds, setStreamTimerSeconds] = useState<number>(3);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [threads, setThreads] = useState<ChronologicalStoryThread[]>([]);
  const [reflections, setReflections] = useState<DailyNewsReflection | null>(null);
  const [totalMemoriesCount, setTotalMemoriesCount] = useState<number>(0);

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

  // 2. Initial load of all 18 sources and persistent daily memories
  const loadData = async () => {
    try {
      const res = await fetch(/api/news?symbol=\);
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.headlines) && json.data.headlines.length > 0) {
        setArticles(json.data.headlines);
        json.data.headlines.forEach((art: any) => {
          NewsMemoryStorage.recordMemory(art);
        });
      } else {
        const scraped = realTimeNewsEngine.scrapeNewsForSymbol(selectedPair);
        setArticles(scraped);
        scraped.forEach((art) => NewsMemoryStorage.recordMemory(art));
      }
    } catch {
      const scraped = realTimeNewsEngine.scrapeNewsForSymbol(selectedPair);
      setArticles(scraped);
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

  // 3. Second-by-Second Real-Time Clock & Wire Streaming Pulse
  useEffect(() => {
    if (!isOpen) return;

    // Real-time second counter
    const clockInterval = setInterval(() => {
      const now = new Date();
      setCurrentTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    // Second-by-second streaming ticker countdown
    const streamInterval = setInterval(() => {
      if (!isStreaming) return;

      setStreamTimerSeconds((prev) => {
        if (prev <= 1) {
          // Trigger new real-time wire soundbite from one of the 18 sources
          const newEvent = realTimeNewsEngine.generateLiveSecondBySecondEvent(selectedPair);
          
          // Capture into persistent daily memory
          NewsMemoryStorage.recordMemory(newEvent);

          // Prepend to active articles list
          setArticles((curr) => [newEvent, ...curr.slice(0, 49)]);

          // Refresh memory analytics
          setThreads(NewsMemoryStorage.getChronologicalStoryThreads());
          setReflections(NewsMemoryStorage.generateDailyReflections());
          setTotalMemoriesCount(NewsMemoryStorage.getMemories().length);

          return 4; // Reset timer to 4 seconds
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(clockInterval);
      clearInterval(streamInterval);
    };
  }, [isOpen, isStreaming, selectedPair]);

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
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overscroll-contain select-none"
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
                  QRI NEWS TERMINAL // REAL-TIME 18-SOURCE WIRE & MEMORY ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE STREAMING
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400 truncate">
                <span className="text-cyan-400 font-bold">18 Financial Outlets</span>
                <span>•</span>
                <span>Second-by-Second Stream: <strong className="text-white">{currentTimeStr || 'Connecting...'}</strong></span>
                <span>•</span>
                <span>Daily Memories: <strong className="text-emerald-400">{totalMemoriesCount}</strong></span>
              </div>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                isStreaming
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                  : 'bg-amber-600/20 text-amber-300 border-amber-500/50 hover:bg-amber-600/30'
              }`}
              title={isStreaming ? 'Pause live second-by-second feed' : 'Resume live stream'}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PAUSE STREAM</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span>RESUME STREAM</span>
                </>
              )}
            </button>

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
              <Radio className="w-3.5 h-3.5 text-sky-300" />
              <span>LIVE WIRE STREAM (18)</span>
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
              <span>ALL 18 MONITORED SOURCES</span>
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
            {/* Live Filter Bar for All 18 Monitored Sources */}
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
                All 18 Sources ({articles.length})
              </button>

              {MONITORED_FINANCIAL_SOURCES.map((source) => (
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

            {/* Independent Scroll Container for Articles (Zero Background Move) */}
            <div
              ref={scrollContainerRef}
              onWheel={(e) => e.stopPropagation()}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-mono text-xs scrollbar-thin overscroll-contain"
            >
              {filteredArticles.length === 0 ? (
                <div className="text-center p-8 text-slate-400 font-sans">
                  No wire articles match the selected source filter. Select "All 18 Sources" to view the complete stream.
                </div>
              ) : (
                filteredArticles.map((article) => {
                  const isBullish = article.sentiment === 'BULLISH';
                  const isBearish = article.sentiment === 'BEARISH';
                  const isCritical = article.impact === 'CRITICAL';
                  const isStreamingFlash = article.isStreamingFlash;

                  return (
                    <div
                      key={article.id}
                      className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                        isStreamingFlash
                          ? 'bg-sky-950/40 border-cyan-500/80 shadow-lg shadow-cyan-500/10 animate-fade-in'
                          : isCritical
                          ? 'bg-sky-950/20 border-sky-600/70 shadow-md shadow-sky-500/10'
                          : 'bg-terminal-950/70 border-terminal-border hover:border-slate-600'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-2">
                          {isStreamingFlash && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-cyan-500 text-black animate-pulse flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              NEW WIRE FLASH
                            </span>
                          )}

                          <span className="font-bold text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800 text-[11px]">
                            {article.source}
                          </span>
                          <span className="text-[10px] text-slate-400">({article.sourceDomain})</span>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isBullish
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isBearish
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                            }`}
                          >
                            {article.sentiment} ({article.sentimentScore > 0 ? '+' : ''}{article.sentimentScore})
                          </span>

                          {isCritical && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                              <Flame className="w-3 h-3 text-amber-400" />
                              CRITICAL IMPACT
                            </span>
                          )}
                        </div>

                        <span className="text-[10px] text-cyan-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {article.publishedTime}
                        </span>
                      </div>

                      <h3 className="text-white font-bold text-sm font-sans mb-1.5 leading-snug">
                        {article.title}
                      </h3>

                      <p className="text-slate-300 text-xs font-sans leading-relaxed mb-2.5">
                        {article.summary}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-terminal-border/50 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>
                            Category: <strong className="text-slate-200">{article.category.replace('_', ' ')}</strong>
                          </span>
                          <span>•</span>
                          <span>
                            Symbols: <strong className="text-cyan-400">{article.relatedSymbols.join(', ')}</strong>
                          </span>
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
                        >
                          <span>Wire Feed Source</span>
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

        {/* Tab 2: Chronological Story Linking Chains */}
        {activeTab === 'threads' && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin overscroll-contain"
          >
            <div className="p-3 bg-purple-950/30 border border-purple-800/60 rounded-xl">
              <span className="font-bold text-purple-300 flex items-center gap-1.5 text-sm mb-1">
                <GitBranch className="w-4 h-4 text-purple-400" />
                DAILY CHRONOLOGICAL EVENT SEQUENCING & NARRATIVE LINKS
              </span>
              <p className="text-slate-300 text-xs font-sans">
                The platform analyzes the continuous stream of events throughout the trading day to map out sequential cause-and-effect links across monetary policy, energy corridors, and physical inventory flows.
              </p>
            </div>

            <div className="space-y-4">
              {threads.map((thread) => (
                <div
                  key={thread.id}
                  className="bg-terminal-950 border border-terminal-border rounded-xl p-4 space-y-3 shadow-md"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border pb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm tracking-wide">
                          {thread.title}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {thread.articlesCount} STORIES LINKED
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs font-sans mt-0.5">
                        Theme: {thread.theme}
                      </p>
                    </div>

                    <span className="px-2 py-1 rounded text-xs font-bold font-mono bg-cyan-600/20 text-cyan-300 border border-cyan-500/40">
                      MACRO BIAS: {thread.synthesizedMacroBias.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Visual Chronological Chain Flowchart */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] text-slate-400 font-bold uppercase block">
                      Chronological Cause & Effect Event Steps:
                    </span>
                    <div className="relative pl-6 space-y-3 border-l-2 border-purple-500/40">
                      {thread.eventChain.map((ev) => (
                        <div key={ev.step} className="relative group">
                          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-purple-600 border-2 border-terminal-950 flex items-center justify-center text-[9px] font-bold text-white">
                            {ev.step}
                          </div>
                          <div className="bg-terminal-900/90 p-3 rounded-lg border border-terminal-border">
                            <div className="flex items-center justify-between gap-2 text-xs mb-1">
                              <span className="text-sky-400 font-bold">{ev.source}</span>
                              <span className="text-slate-400">{ev.timeStr}</span>
                            </div>
                            <h4 className="text-white font-sans font-bold text-xs sm:text-sm">
                              {ev.headline}
                            </h4>
                            <p className="text-slate-400 text-[11px] font-sans mt-1">
                              • Market Reaction: {ev.marketReaction}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Causal Synthesis */}
                  <div className="p-3 bg-terminal-900 rounded-lg border border-terminal-border/80">
                    <span className="text-cyan-400 font-bold block mb-1">SYNTHESIZED NARRATIVE CONCLUSION:</span>
                    <p className="text-slate-300 font-sans leading-relaxed text-xs">
                      {thread.causeAndEffectSummary}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Synthesized Reflections & Execution Insights */}
        {activeTab === 'reflections' && reflections && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin overscroll-contain"
          >
            {/* Macro Narrative Header */}
            <div className="bg-terminal-950 border border-emerald-500/40 rounded-xl p-4 space-y-2 shadow-lg">
              <div className="flex items-center justify-between border-b border-terminal-border pb-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-white text-sm sm:text-base">
                    DAILY INSTITUTIONAL MACRO REFLECTION
                  </h3>
                </div>
                <span className="text-[10px] text-slate-400">{reflections.dateStr}</span>
              </div>
              <p className="text-slate-200 font-sans leading-relaxed text-xs sm:text-sm">
                {reflections.overallMacroNarrative}
              </p>
            </div>

            {/* Tactical Execution Insights */}
            <div className="bg-terminal-950 border border-terminal-border rounded-xl p-4 space-y-3">
              <span className="font-bold text-cyan-400 text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                TACTICAL EXECUTION INSIGHTS FOR SWARM & TRADERS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {reflections.synthesizedExecutionInsights.map((insight, idx) => (
                  <div key={idx} className="bg-terminal-900 p-3 rounded-lg border border-terminal-border flex items-start gap-2">
                    <span className="w-5 h-5 rounded bg-cyan-600/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="text-slate-200 font-sans text-xs leading-relaxed">
                      {insight}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Affected Asset Direct Recommendations */}
            <div className="bg-terminal-950 border border-terminal-border rounded-xl p-4 space-y-3">
              <span className="font-bold text-white text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                ASSET-SPECIFIC TACTICAL BIAS & RATIONALE
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {reflections.affectedAssets.map((asset) => (
                  <div key={asset.symbol} className="bg-terminal-900 p-3 rounded-lg border border-terminal-border space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold text-sm">{asset.symbol}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          asset.direction === 'FAVOR_LONGS'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : asset.direction === 'FAVOR_SHORTS'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}
                      >
                        {asset.direction.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs leading-snug">
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

        {/* Tab 4: All 18 Monitored Sources Health & Population Grid */}
        {activeTab === 'sources' && (
          <div
            onWheel={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs scrollbar-thin overscroll-contain"
          >
            <div className="flex items-center justify-between border-b border-terminal-border pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  18 MONITORED FINANCIAL WEBSITES & WIRES STATUS MATRIX
                </h3>
                <p className="text-slate-400 text-xs font-sans">
                  All 18 institutional endpoints actively monitored and populated with live news feeds
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold">
                18 / 18 ONLINE & STREAMING
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MONITORED_FINANCIAL_SOURCES.map((source, idx) => (
                <div
                  key={source.id}
                  className="bg-terminal-950 p-3.5 rounded-xl border border-terminal-border space-y-2 hover:border-cyan-500/40 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">ENDPOINT {String(idx + 1).padStart(2, '0')}</span>
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
            <span>All 18 Financial Sources Active • Persistent Memories Synced (LocalStorage + Firestore)</span>
          </div>
          <div>
            <span>Qri Trader News Engine v2.0 • Active Target: <strong className="text-white">{selectedPair}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
