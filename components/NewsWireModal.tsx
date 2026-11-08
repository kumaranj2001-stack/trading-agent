'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CurrencyPair, DailyNewsMemory, NewsArticle, NewsNarrativeChain } from '@/lib/types';
import { MONITORED_FINANCIAL_SOURCES, FinancialSource, realTimeNewsEngine } from '@/lib/newsEngine';
import { NewsMemoryStorageManager } from '@/lib/newsMemoryStorage';
import { 
  Radio, 
  X, 
  RefreshCw, 
  ExternalLink, 
  Flame, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ShieldCheck, 
  Search, 
  Pause, 
  Play, 
  Link2, 
  Cpu, 
  Layers, 
  Activity, 
  Zap, 
  AlertTriangle,
  BookOpen,
  Filter,
  CheckCircle2,
  Sliders,
  ChevronRight
} from 'lucide-react';

export interface NewsWireModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  sentimentScore: number;
  marketMood: string;
  symbol: CurrencyPair | string;
  onRefreshScrape?: () => void;
  isScraping?: boolean;
}

export const NewsWireModal: React.FC<NewsWireModalProps> = ({
  isOpen,
  onClose,
  articles: initialArticles,
  sentimentScore: initialSentimentScore,
  marketMood: initialMarketMood,
  symbol,
  onRefreshScrape,
  isScraping = false,
}) => {
  const [activeTerminalTab, setActiveTerminalTab] = useState<'STREAM' | 'NARRATIVES' | 'REFLECTIONS' | 'SOURCES'>('STREAM');
  const [liveArticles, setLiveArticles] = useState<NewsArticle[]>([]);
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isStreamingLive, setIsStreamingLive] = useState<boolean>(true);
  const [secondTick, setSecondTick] = useState<number>(0);
  const [dailyMemory, setDailyMemory] = useState<DailyNewsMemory | null>(null);

  const articlesContainerRef = useRef<HTMLDivElement>(null);

  // 1. Independent Scroll Lock: Prevent background page from moving when scrolling inside the news modal
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

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

  // 2. Initialize and populate all 18 sources
  useEffect(() => {
    if (isOpen) {
      // Ingest initial articles or pull fresh batch for the current symbol across ALL 18 sources
      const all18Articles = realTimeNewsEngine.scrapeNewsForSymbol(symbol as CurrencyPair);
      setLiveArticles(all18Articles);

      // Load persistent news memories
      const memory = NewsMemoryStorageManager.getDailyMemory();
      setDailyMemory(memory);
    }
  }, [isOpen, symbol]);

  // 3. Second-by-Second Real-Time Ticker & Dynamic Wire Emitter
  useEffect(() => {
    if (!isOpen || !isStreamingLive) return;

    const timer = setInterval(() => {
      setSecondTick((prev) => prev + 1);

      // Every 6-8 seconds, emit a live second-by-second wire event from one of the 18 sources
      const now = Date.now();
      setLiveArticles((prevList) => {
        // Re-calculate second-by-second relative timestamps for existing articles
        const updatedList = prevList.map((art) => {
          const diffSeconds = Math.max(0, Math.floor((now - art.timestamp) / 1000));
          let publishedTime = `${diffSeconds}s ago`;
          if (diffSeconds >= 60) {
            const mins = Math.floor(diffSeconds / 60);
            publishedTime = `${mins}m ago`;
          }
          return { ...art, publishedTime };
        });

        // Chance to inject a brand-new live breaking wire dispatch
        if (Math.random() > 0.45) {
          const newEvent = realTimeNewsEngine.generateLiveSecondWireEvent(symbol as CurrencyPair);
          const memory = NewsMemoryStorageManager.getDailyMemory();
          setDailyMemory(memory);
          return [newEvent, ...updatedList.slice(0, 49)];
        }

        return updatedList;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isStreamingLive, symbol]);

  if (!isOpen) return null;

  // Filter articles based on source and search
  const filteredArticles = liveArticles.filter((a) => {
    if (selectedSourceFilter !== 'ALL') {
      const matchDomain = a.sourceDomain.toLowerCase().includes(selectedSourceFilter.toLowerCase());
      const matchSource = a.source.toLowerCase().includes(selectedSourceFilter.toLowerCase());
      if (!matchDomain && !matchSource) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchSummary = a.summary.toLowerCase().includes(q);
      const matchSource = a.source.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchSource) return false;
    }
    return true;
  });

  const synthesis = realTimeNewsEngine.synthesizeSentiment(liveArticles);
  const narrativeChains = dailyMemory?.narrativeChains || [];
  const reflections = dailyMemory?.reflections;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overscroll-contain select-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-terminal-900 border border-terminal-border rounded-2xl w-full max-w-6xl h-[94vh] sm:h-[90vh] flex flex-col shadow-2xl overflow-hidden overscroll-contain animate-fade-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking modal content
      >
        {/* Terminal Header */}
        <div className="p-3.5 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-cyan-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base sm:text-lg tracking-wide truncate">
                  QRI NEWS TERMINAL <span className="text-cyan-400 font-mono">//</span> 18-SOURCE WIRE & MEMORY
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shrink-0 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ALL 18 SOURCES LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                Real-time second-by-second financial intelligence, chronological narrative links & persistent daily memories
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Live Streaming Pause / Resume Button */}
            <button
              onClick={() => setIsStreamingLive(!isStreamingLive)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                isStreamingLive
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 hover:bg-emerald-900'
                  : 'bg-amber-950/70 border-amber-500 text-amber-300 hover:bg-amber-900'
              }`}
              title={isStreamingLive ? 'Pause second-by-second updates' : 'Resume live stream'}
            >
              {isStreamingLive ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden xs:inline">PAUSE 1s STREAM</span>
                  <span className="xs:hidden">PAUSE</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xs:inline">RESUME 1s STREAM</span>
                  <span className="xs:hidden">RESUME</span>
                </>
              )}
            </button>

            {onRefreshScrape && (
              <button
                onClick={onRefreshScrape}
                disabled={isScraping}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-sky-600/20 active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">{isScraping ? 'SYNCING 18 SOURCES...' : 'FORCE SCRAPE ALL 18'}</span>
                <span className="sm:hidden">SCRAPE</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-terminal-800 hover:bg-terminal-700 text-slate-300 hover:text-white font-mono text-xs border border-terminal-border transition-colors flex items-center gap-1"
              aria-label="Close wire modal"
            >
              <X className="w-4 h-4" />
              <span className="hidden sm:inline">Close</span>
            </button>
          </div>
        </div>

        {/* Live Second-by-Second Telemetry & Sentiment Ribbon */}
        <div className="p-3 bg-terminal-950/80 border-b border-terminal-border grid grid-cols-2 sm:grid-cols-5 gap-2.5 font-mono text-xs shrink-0">
          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Target Asset</span>
            <span className="text-white font-bold text-sm truncate block">{symbol}</span>
          </div>

          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">18-Source Sentiment</span>
            <span className={`font-bold text-sm block truncate ${
              synthesis.sentimentScore > 0 ? 'text-emerald-400' : synthesis.sentimentScore < 0 ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {synthesis.sentimentScore > 0 ? '+' : ''}{synthesis.sentimentScore} ({synthesis.marketMood.replace('_', ' ')})
            </span>
          </div>

          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Active Wires</span>
            <div className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold text-sm">18 / 18</span>
              <span className="text-[10px] text-emerald-400">100% OK</span>
            </div>
          </div>

          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Second-by-Second Stream</span>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isStreamingLive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`}></span>
              <span className="text-white font-bold text-sm">
                {isStreamingLive ? `${secondTick}s LIVE` : 'PAUSED'}
              </span>
            </div>
          </div>

          <div className="p-2 bg-terminal-900 rounded-lg border border-terminal-border col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">Daily Memory Bank</span>
            <span className="text-purple-400 font-bold text-sm">
              {dailyMemory?.totalEventsCount || liveArticles.length} Events • {narrativeChains.length} Chains
            </span>
          </div>
        </div>

        {/* Navigation Tabs for Dedicated News Terminal */}
        <div className="px-3 bg-terminal-950/60 border-b border-terminal-border flex items-center justify-between gap-2 overflow-x-auto scrollbar-none font-mono text-xs shrink-0">
          <div className="flex items-center gap-1 py-1.5">
            <button
              onClick={() => setActiveTerminalTab('STREAM')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold ${
                activeTerminalTab === 'STREAM'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-terminal-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5 text-cyan-300" />
              <span>LIVE WIRE STREAM (18)</span>
            </button>

            <button
              onClick={() => setActiveTerminalTab('NARRATIVES')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold ${
                activeTerminalTab === 'NARRATIVES'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-terminal-800'
              }`}
            >
              <Link2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>NARRATIVE CHAINS ({narrativeChains.length})</span>
            </button>

            <button
              onClick={() => setActiveTerminalTab('REFLECTIONS')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold ${
                activeTerminalTab === 'REFLECTIONS'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-terminal-800'
              }`}
            >
              <Cpu className="w-3.5 h-3.5 text-purple-300" />
              <span>DAILY REFLECTIONS & EXECUTION</span>
            </button>

            <button
              onClick={() => setActiveTerminalTab('SOURCES')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors font-bold ${
                activeTerminalTab === 'SOURCES'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-terminal-800'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-teal-300" />
              <span>18 SOURCES HEALTH</span>
            </button>
          </div>

          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search wire articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-terminal-900 border border-terminal-border rounded-lg text-xs text-white placeholder-slate-500 w-48 focus:outline-none focus:border-cyan-500 font-sans"
            />
          </div>
        </div>

        {/* TAB 1: LIVE WIRE FEED (Scrolls independently with zero background bleed) */}
        {activeTerminalTab === 'STREAM' && (
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* 18 Financial Sources Pill Filter Ribbon */}
            <div className="p-2 bg-terminal-950/40 border-b border-terminal-border flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-xs whitespace-nowrap shrink-0">
              <button
                onClick={() => setSelectedSourceFilter('ALL')}
                className={`px-2.5 py-1 rounded-md transition-colors font-bold flex items-center gap-1.5 ${
                  selectedSourceFilter === 'ALL'
                    ? 'bg-cyan-600 text-white'
                    : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
                }`}
              >
                <span>All 18 Sources</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-cyan-200">
                  {liveArticles.length}
                </span>
              </button>

              {MONITORED_FINANCIAL_SOURCES.map((source) => {
                const countForSource = liveArticles.filter(
                  (a) => a.sourceDomain.includes(source.domain) || a.source.toLowerCase().includes(source.id)
                ).length;
                const isSelected = selectedSourceFilter === source.domain;

                return (
                  <button
                    key={source.id}
                    onClick={() => setSelectedSourceFilter(source.domain)}
                    className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-cyan-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>{source.name.split(' ')[0]}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/40 text-slate-300">
                      {countForSource}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Independent Scroll Container: overscroll-contain & touch-pan-y ensure background stays fixed */}
            <div
              ref={articlesContainerRef}
              className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-mono text-xs overscroll-contain scrollbar-thin select-text"
              style={{ overscrollBehavior: 'contain' }}
            >
              {filteredArticles.length === 0 ? (
                <div className="text-center p-12 text-slate-400 font-sans">
                  No wire articles match the filter. Click "All 18 Sources" to view the full streaming news desk.
                </div>
              ) : (
                filteredArticles.map((article) => {
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
                        <span className="text-[11px] text-cyan-300 font-bold flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {article.publishedTime}
                        </span>
                      </div>

                      <h4 className="text-white font-bold text-sm font-sans mb-1.5 leading-snug">
                        {article.title}
                      </h4>

                      <p className="text-slate-300 text-xs font-sans leading-relaxed mb-2.5">
                        {article.summary}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-terminal-border/50 text-[10px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>Category: <strong className="text-slate-200">{article.category.replace('_', ' ')}</strong></span>
                          <span>•</span>
                          <span>Related: <strong className="text-cyan-400">{article.relatedSymbols.join(', ')}</strong></span>
                        </div>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300 flex items-center gap-1 underline font-sans"
                        >
                          <span>Live Source</span>
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

        {/* TAB 2: CHRONOLOGICAL NARRATIVE CHAINS & STORY LINKS */}
        {activeTerminalTab === 'NARRATIVES' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 overscroll-contain select-text">
            <div className="p-3 bg-indigo-950/40 border border-indigo-700/50 rounded-xl text-xs space-y-1">
              <span className="font-bold text-indigo-300 uppercase font-mono flex items-center gap-1.5">
                <Link2 className="w-4 h-4 text-indigo-400" />
                Chronological Narrative Linking Engine
              </span>
              <p className="text-slate-300 font-sans">
                The platform analyzes the stream of events throughout the trading day to identify chronological links between related stories, tracing initial news catalysts to cross-asset market transmissions.
              </p>
            </div>

            {narrativeChains.length === 0 ? (
              <div className="text-center p-12 text-slate-400 font-sans">
                Building chronological story links from today's wire stream...
              </div>
            ) : (
              narrativeChains.map((chain) => (
                <div key={chain.id} className="bg-terminal-950 p-4 rounded-xl border border-terminal-border space-y-3 shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-terminal-border pb-2.5">
                    <div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 uppercase font-bold mr-2">
                        {chain.category.replace('_', ' ')}
                      </span>
                      <h4 className="text-sm font-bold text-white inline-block">{chain.themeTitle}</h4>
                    </div>
                    <span className="text-[11px] font-mono text-cyan-400">
                      {chain.timeSpanStr} • Confidence {chain.confidence}%
                    </span>
                  </div>

                  {/* Chronological Timeline Stages */}
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
                      Chronological Story Evolution:
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                      {chain.chronologicalProgression.map((step, sIdx) => (
                        <div key={sIdx} className="bg-terminal-900 p-2.5 rounded-lg border border-terminal-border/80 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                              <span className="text-indigo-400 font-bold">{step.stage}</span>
                              <span className="text-slate-400">{step.timeAgo}</span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-200 line-clamp-2 mb-1">{step.headline}</h5>
                            <p className="text-[11px] text-slate-400 line-clamp-2">{step.takeaway}</p>
                          </div>
                          <span className="text-[9px] font-mono text-sky-400 mt-2 block border-t border-terminal-border/40 pt-1">
                            {step.source}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Synthesized Execution Takeaway */}
                  <div className="p-3 bg-terminal-900 rounded-lg border border-cyan-500/30 flex items-start gap-2 text-xs">
                    <Zap className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 font-sans">
                      <span className="font-bold text-cyan-300 block font-mono text-[11px]">
                        SYNTHESIZED INSIGHT & EXECUTION DIRECTIVE:
                      </span>
                      <p className="text-slate-200">{chain.synthesizedInsight}</p>
                      <p className="text-emerald-300 font-mono text-[11px] font-semibold pt-0.5">
                        • Action: {chain.executionImplication}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: DAILY SYNTHESIZED REFLECTIONS & MULTI-AGENT EXECUTION INSIGHTS */}
        {activeTerminalTab === 'REFLECTIONS' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 overscroll-contain select-text">
            {reflections && (
              <>
                <div className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 p-4 rounded-xl border border-purple-500/40 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/30 pb-2">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-purple-400" />
                      <h4 className="font-bold text-white text-sm uppercase font-mono tracking-wide">
                        Daily News Reflection & Institutional Memory Digest ({reflections.dateStr})
                      </h4>
                    </div>
                    <span className="text-xs font-mono px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold">
                      {reflections.sentimentTrajectory.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs font-sans">
                    <div>
                      <span className="text-[11px] font-bold text-cyan-300 uppercase font-mono block mb-0.5">
                        Macro Regime Shift Reflection:
                      </span>
                      <p className="text-slate-200 leading-relaxed">{reflections.macroRegimeShift}</p>
                    </div>

                    <div>
                      <span className="text-[11px] font-bold text-indigo-300 uppercase font-mono block mb-0.5">
                        Intermarket Transmission Architecture:
                      </span>
                      <p className="text-slate-200 leading-relaxed">{reflections.intermarketTransmission}</p>
                    </div>

                    <div className="p-3 bg-terminal-950 rounded-lg border border-emerald-500/40">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase font-mono block mb-0.5">
                        Swarm Tactical Execution Directive:
                      </span>
                      <p className="text-white font-mono font-medium leading-relaxed">
                        {reflections.executionEdgeDirective}
                      </p>
                    </div>

                    <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-200 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold uppercase font-mono text-[10px] text-amber-300">
                          Primary Risk Guardrail:
                        </span>
                        <p className="text-[11px]">{reflections.primaryRiskWarning}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-terminal-950 p-4 rounded-xl border border-terminal-border text-xs font-mono space-y-2">
                  <span className="text-slate-400 uppercase block font-semibold">
                    Persistent Memory Storage Telemetry
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div className="bg-terminal-900 p-2 rounded border border-terminal-border">
                      <span className="text-slate-400 text-[10px] block">Captured Today</span>
                      <span className="text-base font-bold text-white">{reflections.totalEventsProcessed} Stories</span>
                    </div>
                    <div className="bg-terminal-900 p-2 rounded border border-terminal-border">
                      <span className="text-slate-400 text-[10px] block">Identified Chains</span>
                      <span className="text-base font-bold text-indigo-400">{reflections.keyNarrativeCount} Arcs</span>
                    </div>
                    <div className="bg-terminal-900 p-2 rounded border border-terminal-border">
                      <span className="text-slate-400 text-[10px] block">Storage Engine</span>
                      <span className="text-base font-bold text-emerald-400">Local + Firestore</span>
                    </div>
                    <div className="bg-terminal-900 p-2 rounded border border-terminal-border">
                      <span className="text-slate-400 text-[10px] block">Sync Frequency</span>
                      <span className="text-base font-bold text-cyan-400">1 Sec Real-time</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB 4: 18 MONITORED SOURCES HEALTH & TELEMETRY GRID */}
        {activeTerminalTab === 'SOURCES' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3 overscroll-contain select-text">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 font-mono text-xs">
              {MONITORED_FINANCIAL_SOURCES.map((source) => (
                <div
                  key={source.id}
                  className="bg-terminal-950 p-3 rounded-xl border border-terminal-border/80 flex items-center justify-between gap-3 hover:border-slate-500 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <h5 className="font-bold text-white text-xs truncate">{source.name}</h5>
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">{source.domain}</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-terminal-900 border border-terminal-border text-cyan-300 mt-1 inline-block">
                      {source.specialization.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-bold text-emerald-400 block">{source.status}</span>
                    <span className="text-[10px] text-slate-400 block">{source.latencyMs}ms ping</span>
                    <span className="text-[10px] text-cyan-400 font-bold block">{source.headlinesCountToday} today</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-terminal-950 border-t border-terminal-border flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              18 Sources Actively Transmitting
            </span>
            <span>•</span>
            <span>Memory Persistence: <strong>ONLINE</strong></span>
          </div>

          <span className="text-slate-400">
            Qri Trader News Engine • Real-time Second-by-Second Wire Desk
          </span>
        </div>
      </div>
    </div>
  );
};
