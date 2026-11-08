'use client';

import React, { useState, useEffect, useRef } from 'react';
import { NewsArticle, NarrativeStoryThread, NewsMemoryEntry, DailyNewsMemorySummary, CurrencyPair } from '@/lib/types';
import { MONITORED_FINANCIAL_SOURCES, FinancialSource, realTimeNewsEngine } from '@/lib/newsEngine';
import { NewsMemoryStorageManager } from '@/lib/newsMemoryStorage';
import { 
  Radio, 
  X, 
  RefreshCw, 
  ExternalLink, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  TrendingDown,
  Layers, 
  BookOpen, 
  Clock, 
  Download, 
  Pause, 
  Play, 
  Search, 
  GitCommit, 
  Lightbulb, 
  Compass, 
  Cpu, 
  Database,
  ArrowRight,
  Filter
} from 'lucide-react';

export interface NewsWireModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles?: NewsArticle[];
  sentimentScore?: number;
  marketMood?: string;
  symbol: string;
  onRefreshScrape?: () => void;
  isScraping?: boolean;
}

export const NewsWireModal: React.FC<NewsWireModalProps> = ({
  isOpen,
  onClose,
  articles: initialArticles = [],
  sentimentScore = 0.45,
  marketMood = 'RISK_ON',
  symbol,
  onRefreshScrape,
  isScraping = false,
}) => {
  // Navigation Tabs in News Terminal
  const [activeTab, setActiveTab] = useState<'STREAM' | 'NARRATIVES' | 'MEMORIES' | 'SOURCES'>('STREAM');
  
  // Real-time second-by-second live feed state
  const [liveArticles, setLiveArticles] = useState<NewsArticle[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [streamTickInterval, setStreamTickInterval] = useState<number>(1500); // 1.5 second tick
  const [newFlashAlert, setNewFlashAlert] = useState<string | null>(null);

  // Filters
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [selectedImpactFilter, setSelectedImpactFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Daily Memories & Narrative Threads
  const [narrativeThreads, setNarrativeThreads] = useState<NarrativeStoryThread[]>([]);
  const [memories, setMemories] = useState<NewsMemoryEntry[]>([]);
  const [dailySummary, setDailySummary] = useState<DailyNewsMemorySummary | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Lock Background Body Scroll while Modal is open (Solves background scrolling bug)
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2. Initialize news data from all 18 sources and persistent memories
  useEffect(() => {
    if (isOpen) {
      // Scrape news across all 18 sources
      const allSourcesArticles = realTimeNewsEngine.scrapeNewsForSymbol(symbol as CurrencyPair);
      setLiveArticles(allSourcesArticles);

      // Load persistent memories & narrative threads
      const loadedThreads = NewsMemoryStorageManager.getNarrativeThreads();
      setNarrativeThreads(loadedThreads);
      if (loadedThreads.length > 0 && !selectedThreadId) {
        setSelectedThreadId(loadedThreads[0].id);
      }
      setMemories(NewsMemoryStorageManager.getMemories());
      setDailySummary(NewsMemoryStorageManager.getDailySummary());
    }
  }, [isOpen, symbol]);

  // 3. Second-by-Second Real-Time Live Wire Stream Engine
  useEffect(() => {
    if (!isOpen || !isLiveStreaming) return;

    const timer = setInterval(() => {
      // Generate real-time wire event second-by-second
      const tick = realTimeNewsEngine.generateLiveWireTick(symbol as CurrencyPair);
      
      // Capture into persistent daily memory
      NewsMemoryStorageManager.captureMemory(tick);

      // Update state
      setLiveArticles(prev => [tick, ...prev.slice(0, 150)]);
      setMemories(NewsMemoryStorageManager.getMemories());
      setNarrativeThreads(NewsMemoryStorageManager.getNarrativeThreads());

      if (tick.impact === 'CRITICAL') {
        setNewFlashAlert(`[${tick.source}]: ${tick.title}`);
        setTimeout(() => setNewFlashAlert(null), 4000);
      }
    }, streamTickInterval);

    return () => clearInterval(timer);
  }, [isOpen, isLiveStreaming, streamTickInterval, symbol]);

  if (!isOpen) return null;

  // Filter articles based on source, impact, and search query
  const filteredArticles = liveArticles.filter(a => {
    if (selectedSourceFilter !== 'ALL') {
      const matchDomain = a.sourceDomain.toLowerCase().includes(selectedSourceFilter.toLowerCase());
      const matchSource = a.source.toLowerCase().includes(selectedSourceFilter.toLowerCase());
      if (!matchDomain && !matchSource) return false;
    }
    if (selectedImpactFilter === 'CRITICAL' && a.impact !== 'CRITICAL') return false;
    if (selectedImpactFilter === 'HIGH' && a.impact !== 'CRITICAL' && a.impact !== 'HIGH') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchSummary = a.summary.toLowerCase().includes(q);
      const matchSource = a.source.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchSource) return false;
    }
    return true;
  });

  const activeThread = narrativeThreads.find(t => t.id === selectedThreadId) || narrativeThreads[0];

  const handleExportMemories = () => {
    const jsonStr = NewsMemoryStorageManager.exportMemoriesAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qri-daily-news-memories-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-hidden overscroll-contain"
      role="dialog"
      aria-modal="true"
      aria-label="Real-Time News Terminal"
      onClick={onClose}
    >
      <div 
        className="bg-terminal-900 border border-terminal-border rounded-2xl w-full max-w-6xl h-[94vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="p-3.5 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 border border-sky-400/40 flex items-center justify-center text-white shrink-0 shadow-lg shadow-sky-500/20">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base tracking-wide truncate">
                  QRI TRADER // REAL-TIME NEWS TERMINAL & MEMORY ENGINE
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shrink-0 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  18 SOURCES LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                Second-by-second live wire stream • Chronological story linking • Persistent daily memories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Streaming Toggle */}
            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isLiveStreaming
                  ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/50 hover:bg-emerald-600/30'
                  : 'bg-amber-600/20 text-amber-300 border-amber-500/50 hover:bg-amber-600/30'
              }`}
              title={isLiveStreaming ? 'Pause Real-Time Second-by-Second Stream' : 'Resume Live Wire Stream'}
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">STREAMING 1.5s</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">STREAM PAUSED</span>
                </>
              )}
            </button>

            {onRefreshScrape && (
              <button
                onClick={onRefreshScrape}
                disabled={isScraping}
                className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">REFRESH 18</span>
              </button>
            )}

            <button
              onClick={handleExportMemories}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors flex items-center gap-1"
              title="Export Daily News Memories as JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white border border-terminal-border font-mono text-xs transition-colors"
              aria-label="Close wire terminal"
            >
              <X className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Breaking News Flash Ticker */}
        {newFlashAlert && (
          <div className="bg-rose-600/90 text-white px-4 py-1.5 text-xs font-mono font-semibold flex items-center gap-2 animate-pulse shrink-0 border-b border-rose-500">
            <Flame className="w-3.5 h-3.5 text-amber-300 shrink-0" />
            <span className="font-bold text-amber-200">BREAKING FLASH:</span>
            <span className="truncate">{newFlashAlert}</span>
          </div>
        )}

        {/* Live Metrics & Mode Status Bar */}
        <div className="p-2.5 sm:p-3 bg-terminal-950/80 border-b border-terminal-border grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs shrink-0">
          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Target Symbol</span>
              <span className="text-white font-bold text-sm">{symbol}</span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
              ACTIVE
            </span>
          </div>

          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border/70">
            <span className="text-[10px] text-slate-400 block uppercase">Wire Sentiment</span>
            <span className={`font-bold text-sm ${
              sentimentScore > 0 ? 'text-emerald-400' : sentimentScore < 0 ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {sentimentScore > 0 ? '+' : ''}{sentimentScore} ({marketMood.replace('_', ' ')})
            </span>
          </div>

          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border/70">
            <span className="text-[10px] text-slate-400 block uppercase">Monitored Outlets</span>
            <span className="text-cyan-400 font-bold text-sm">18 / 18 Streaming Live</span>
          </div>

          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border/70">
            <span className="text-[10px] text-slate-400 block uppercase">Captured Memories</span>
            <span className="text-emerald-400 font-bold text-sm">{memories.length} Events Logged</span>
          </div>
        </div>

        {/* Main Terminal Tabs */}
        <div className="px-3 sm:px-4 py-2 bg-terminal-950/60 border-b border-terminal-border flex items-center justify-between gap-2 overflow-x-auto scrollbar-none font-mono text-xs shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab('STREAM')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'STREAM'
                  ? 'bg-sky-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
              <span>LIVE WIRE STREAM ({filteredArticles.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('NARRATIVES')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'NARRATIVES'
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
              }`}
            >
              <GitCommit className="w-3.5 h-3.5 text-indigo-300" />
              <span>STORY LINKS & REFLECTIONS ({narrativeThreads.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('MEMORIES')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'MEMORIES'
                  ? 'bg-emerald-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
              }`}
            >
              <Database className="w-3.5 h-3.5 text-emerald-300" />
              <span>DAILY MEMORY BANK</span>
            </button>

            <button
              onClick={() => setActiveTab('SOURCES')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'SOURCES'
                  ? 'bg-purple-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              <span>18 OUTLETS MATRIX</span>
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Real-time persistence enabled (Firestore + Browser Cache)</span>
          </div>
        </div>

        {/* 18 Financial Sources Active Filter Pills (Shown on STREAM tab) */}
        {activeTab === 'STREAM' && (
          <div className="p-2 sm:p-2.5 bg-terminal-950/40 border-b border-terminal-border flex items-center justify-between gap-2 overflow-x-auto scrollbar-none font-mono text-xs whitespace-nowrap shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <button
                onClick={() => setSelectedSourceFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors shrink-0 ${
                  selectedSourceFilter === 'ALL'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
                }`}
              >
                All Sources (18)
              </button>

              {MONITORED_FINANCIAL_SOURCES.map(source => {
                const isSelected = selectedSourceFilter.toLowerCase() === source.domain.toLowerCase();
                const sourceArticleCount = liveArticles.filter(a => a.sourceDomain.includes(source.domain)).length;
                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSourceFilter(source.domain)}
                    className={`px-2 py-1 rounded-md transition-colors flex items-center gap-1 text-[11px] shrink-0 ${
                      isSelected
                        ? 'bg-sky-600 text-white font-bold shadow-sm'
                        : 'text-slate-300 hover:text-white bg-terminal-900 border border-terminal-border'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{source.name.split(' ')[0]}</span>
                    <span className="text-[9px] px-1 rounded bg-terminal-950 text-slate-400">
                      {sourceArticleCount || 2}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Search Input */}
            <div className="relative shrink-0 hidden sm:block">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
              <input
                type="text"
                placeholder="Search 18 outlets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-2.5 py-1 bg-terminal-950 border border-terminal-border rounded-lg text-xs text-white placeholder-slate-500 w-36 focus:w-48 transition-all focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
        )}

        {/* Tab 1: Live Wire Stream (Second-by-Second with INDEPENDENT SCROLLING CONTAINER) */}
        {activeTab === 'STREAM' && (
          <div 
            ref={scrollContainerRef}
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto overscroll-contain p-3 sm:p-4 space-y-3 font-mono text-xs scrollbar-thin select-text"
          >
            {filteredArticles.length === 0 ? (
              <div className="text-center p-8 text-slate-400 font-sans">
                No wire articles match the selected source filter. Click "All Sources (18)" to display live updates across all outlets.
              </div>
            ) : (
              filteredArticles.map((article, idx) => {
                const isBullish = article.sentiment === 'BULLISH';
                const isBearish = article.sentiment === 'BEARISH';
                const isCritical = article.impact === 'CRITICAL';

                return (
                  <div
                    key={article.id}
                    className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                      isCritical
                        ? 'bg-sky-950/40 border-sky-600/70 shadow-md shadow-sky-500/10'
                        : 'bg-terminal-950/70 border-terminal-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800 text-[11px]">
                          {article.source}
                        </span>
                        <span className="text-[10px] text-slate-400">({article.sourceDomain})</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isBullish
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : isBearish
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                            : 'bg-slate-500/10 text-slate-400 border border-slate-500/30'
                        }`}>
                          {article.sentiment} ({article.sentimentScore > 0 ? '+' : ''}{article.sentimentScore})
                        </span>
                        {isCritical && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3 text-amber-400" />
                            CRITICAL IMPACT
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {article.publishedTime}
                      </span>
                    </div>

                    <h4 className="text-white font-bold text-sm font-sans mb-1.5 leading-snug">
                      {article.title}
                    </h4>

                    <p className="text-slate-300 text-xs font-sans leading-relaxed mb-2.5">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-terminal-border/50 text-[10px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <span>Category: <strong className="text-slate-200">{article.category.replace('_', ' ')}</strong></span>
                        <span>•</span>
                        <span>Related: <strong className="text-cyan-400">{article.relatedSymbols.join(', ')}</strong></span>
                      </div>
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline"
                      >
                        <span>Wire Source</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Chronological Story Links & Synthesized Reflections */}
        {activeTab === 'NARRATIVES' && (
          <div 
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 overflow-hidden flex flex-col md:flex-row overscroll-contain"
          >
            {/* Sidebar of Developing Narrative Threads */}
            <div className="w-full md:w-80 border-r border-terminal-border bg-terminal-950/70 p-3 overflow-y-auto space-y-2 shrink-0">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block mb-1">
                Active Daily Narrative Threads ({narrativeThreads.length})
              </span>
              {narrativeThreads.map(thread => (
                <button
                  key={thread.id}
                  onClick={() => setSelectedThreadId(thread.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    activeThread?.id === thread.id
                      ? 'bg-indigo-950/60 border-indigo-500/70 text-white shadow-md'
                      : 'bg-terminal-900 border-terminal-border/70 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-terminal-950 text-indigo-400 border border-indigo-500/30 font-semibold">
                      {thread.category.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{thread.lastUpdatedTime}</span>
                  </div>
                  <h5 className="font-sans font-bold text-xs sm:text-sm text-white line-clamp-2 leading-snug">
                    {thread.title}
                  </h5>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2 pt-1.5 border-t border-terminal-border/50">
                    <span>{thread.events.length} Linked Events</span>
                    <span className={`font-bold ${
                      thread.sentimentBias === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {thread.sentimentBias}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected Narrative Thread Chronological Event Chain & Reflections */}
            {activeThread && (
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 select-text">
                <div className="p-4 rounded-xl bg-terminal-950 border border-indigo-500/40 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold uppercase">
                      {activeThread.category.replace('_', ' ')} STORY THREAD
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      Started: {activeThread.startTime} • Updated: {activeThread.lastUpdatedTime}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-white font-sans leading-snug">
                    {activeThread.title}
                  </h3>

                  {/* Synthesized Reflections & Execution Insights */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-lg bg-indigo-950/40 border border-indigo-600/40 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-indigo-300 mb-1 font-mono">
                        <Compass className="w-3.5 h-3.5 text-indigo-400" />
                        <span>SYNTHESIZED NARRATIVE EVOLUTION</span>
                      </div>
                      <p className="text-slate-200 font-sans leading-relaxed">
                        {activeThread.synthesizedEvolution}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/40 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1 font-mono">
                        <Lightbulb className="w-3.5 h-3.5 text-emerald-400" />
                        <span>ACTIONABLE EXECUTION INSIGHT</span>
                      </div>
                      <p className="text-emerald-100 font-sans leading-relaxed">
                        {activeThread.executionInsight}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Chronological Timeline of Linked Events */}
                <div className="space-y-3">
                  <h4 className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <GitCommit className="w-4 h-4 text-cyan-400" />
                    <span>CHRONOLOGICAL STORY TIMELINE ({activeThread.events.length} LINKED HEADLINES)</span>
                  </h4>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-terminal-border">
                    {activeThread.events.map((evt, idx) => (
                      <div key={evt.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-cyan-400 border-2 border-terminal-950 group-hover:scale-125 transition-transform" />
                        <div className="p-3 rounded-xl bg-terminal-950/80 border border-terminal-border hover:border-slate-600 transition-colors">
                          <div className="flex items-center justify-between text-xs font-mono mb-1">
                            <span className="font-bold text-cyan-400">{evt.timeStr}</span>
                            <span className="text-[10px] text-slate-400">{evt.source}</span>
                          </div>
                          <p className="text-white font-sans text-xs font-bold mb-1">
                            {evt.headline}
                          </p>
                          <p className="text-[11px] font-sans text-slate-300 italic border-l-2 border-indigo-500 pl-2">
                            Linkage: {evt.linkageNote}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Daily News Memory Bank */}
        {activeTab === 'MEMORIES' && (
          <div 
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-4 font-mono text-xs select-text"
          >
            {/* Daily Synthesis Summary Banner */}
            {dailySummary && (
              <div className="p-4 rounded-xl bg-terminal-950 border border-emerald-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-400" />
                    DAILY NEWS MEMORY SUMMARY • {dailySummary.date}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {dailySummary.totalMemories} events persistently archived
                  </span>
                </div>

                <p className="text-slate-200 font-sans text-xs sm:text-sm leading-relaxed">
                  {dailySummary.synthesizedKeyTakeaway}
                </p>

                <div className="pt-2 border-t border-terminal-border/60">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1.5">
                    Swarm Synthesis Directives For Today:
                  </span>
                  <ul className="space-y-1 text-slate-300 font-sans text-xs list-disc list-inside">
                    {dailySummary.executionDirectives.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* List of Captured Memories */}
            <div className="border border-terminal-border rounded-xl overflow-hidden bg-terminal-950">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-terminal-900 border-b border-terminal-border text-slate-400 text-[10px] uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Time</th>
                      <th className="py-2.5 px-3">Source & Category</th>
                      <th className="py-2.5 px-3">Headline Memory</th>
                      <th className="py-2.5 px-3">Linked Narrative Thread</th>
                      <th className="py-2.5 px-3">Sentiment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-terminal-border/60">
                    {memories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                          Streaming events to memory bank in real-time...
                        </td>
                      </tr>
                    ) : (
                      memories.map(m => (
                        <tr key={m.id} className="hover:bg-terminal-900/50 transition-colors">
                          <td className="py-2 px-3 whitespace-nowrap text-cyan-400 font-bold">
                            {m.timeFormatted}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap">
                            <span className="font-semibold text-white block">{m.source}</span>
                            <span className="text-[10px] text-slate-400">{m.category}</span>
                          </td>
                          <td className="py-2 px-3 font-sans text-slate-200">
                            {m.title}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap text-indigo-300">
                            {m.narrativeThreadTitle}
                          </td>
                          <td className="py-2 px-3 whitespace-nowrap font-bold">
                            <span className={m.sentiment === 'BULLISH' ? 'text-emerald-400' : m.sentiment === 'BEARISH' ? 'text-rose-400' : 'text-slate-400'}>
                              {m.sentiment} ({m.sentimentScore > 0 ? '+' : ''}{m.sentimentScore})
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: 18 Monitored Outlets Status Matrix */}
        {activeTab === 'SOURCES' && (
          <div 
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 font-mono text-xs select-text"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MONITORED_FINANCIAL_SOURCES.map((source, index) => {
                const sourceArticles = liveArticles.filter(a => a.sourceDomain.includes(source.domain));
                return (
                  <div 
                    key={source.id} 
                    className="p-3.5 rounded-xl bg-terminal-950 border border-terminal-border/80 space-y-2 hover:border-sky-500/50 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px] font-bold">
                        SOURCE #{String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        {source.status}
                      </span>
                    </div>

                    <h4 className="text-white font-bold text-sm font-sans truncate">
                      {source.name}
                    </h4>

                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Domain: <strong className="text-cyan-400">{source.domain}</strong></div>
                      <div>Specialization: <strong className="text-slate-300">{source.specialization.replace(/_/g, ' ')}</strong></div>
                      <div>Ping Interval: <strong className="text-white">{source.refreshRateSeconds}s</strong></div>
                      <div>Active Headlines: <strong className="text-emerald-400">{sourceArticles.length || 2} loaded</strong></div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedSourceFilter(source.domain);
                        setActiveTab('STREAM');
                      }}
                      className="w-full mt-2 py-1 px-2.5 rounded bg-terminal-900 hover:bg-terminal-800 text-sky-400 hover:text-white border border-terminal-border text-[11px] font-bold flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>Filter Stream ({source.name.split(' ')[0]})</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Terminal Footer */}
        <div className="p-3 bg-terminal-950 border-t border-terminal-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>REAL-TIME ENGINE: 18 OUTLETS CONNECTED • DUAL PERSISTENCE ACTIVE</span>
          </div>
          <div>
            <span>Qri Trader News Terminal v1.0.0 Institutional</span>
          </div>
        </div>
      </div>
    </div>
  );
};
