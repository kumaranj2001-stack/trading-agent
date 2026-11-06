'use client';

import React, { useState } from 'react';
import { 
  FinancialNewsSource, 
  ScrapedNewsItem, 
  CurrencyPair 
} from '@/lib/types';
import { 
  Newspaper, 
  Radio, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  Search, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  X,
  Database,
  SlidersHorizontal,
  Flame
} from 'lucide-react';

interface NewsScraperModalProps {
  isOpen: boolean;
  onClose: () => void;
  sources: FinancialNewsSource[];
  articles: ScrapedNewsItem[];
  selectedPair: CurrencyPair;
  onSelectPair?: (pair: CurrencyPair) => void;
  onToggleSource: (sourceId: string) => void;
  onRefreshScrape: () => void;
  isScraping: boolean;
}

export const NewsScraperModal: React.FC<NewsScraperModalProps> = ({
  isOpen,
  onClose,
  sources,
  articles,
  selectedPair,
  onSelectPair,
  onToggleSource,
  onRefreshScrape,
  isScraping,
}) => {
  const [activeTab, setActiveTab] = useState<'HEADLINES' | 'SOURCES'>('HEADLINES');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'GLOBAL_MACRO' | 'CENTRAL_BANK' | 'FOREX_SPECIALIST' | 'INDIAN_MARKET'>('ALL');
  const [sentimentFilter, setSentimentFilter] = useState<'ALL' | 'BULLISH' | 'BEARISH'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredArticles = articles.filter(item => {
    if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
    if (sentimentFilter !== 'ALL' && item.sentiment !== sentimentFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q) ||
      item.sourceName.toLowerCase().includes(q) ||
      item.targetSymbols.some(s => s.toLowerCase().includes(q))
    );
  });

  const activeSourcesCount = sources.filter(s => s.enabled).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-xl w-full max-w-5xl h-[92vh] sm:h-[86vh] flex flex-col shadow-2xl overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="p-3 sm:p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-950 border border-blue-700 flex items-center justify-center text-blue-400 shrink-0 shadow-md shadow-blue-500/10">
              <Newspaper className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-sm sm:text-base truncate">
                  News Analyst Engine // 20 Monitored Outlets
                </h3>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  LIVE SCRAPING ACTIVE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">
                Continuous NLP scraping across 20 global & Indian financial websites & economic calendars • Stored locally in browser
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onRefreshScrape}
              disabled={isScraping}
              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
              <span className="hidden xs:inline">{isScraping ? 'SCRAPING...' : 'SCRAPE ALL SOURCES'}</span>
              <span className="xs:hidden">{isScraping ? '...' : 'SCRAPE'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 text-xs transition-colors shrink-0"
              aria-label="Close modal"
            >
              <span className="hidden sm:inline">Close</span>
              <X className="w-4 h-4 sm:hidden" />
            </button>
          </div>
        </div>

        {/* Tab & Filter Bar */}
        <div className="p-2 sm:p-3 bg-terminal-950/70 border-b border-terminal-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 text-xs">
          {/* Main View Tabs */}
          <div className="flex items-center gap-1 bg-terminal-900 p-1 rounded-lg border border-terminal-border shrink-0">
            <button
              onClick={() => setActiveTab('HEADLINES')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'HEADLINES' 
                  ? 'bg-blue-600 text-white font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Real-Time Tape ({articles.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('SOURCES')}
              className={`px-3 py-1 rounded transition-colors flex items-center gap-1.5 ${
                activeTab === 'SOURCES' 
                  ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>20 Monitored Websites ({activeSourcesCount}/20 Active)</span>
            </button>
          </div>

          {activeTab === 'HEADLINES' && (
            <div className="flex flex-wrap items-center gap-2 flex-1 justify-end">
              {/* Category Pills */}
              <div className="flex items-center bg-terminal-900 p-0.5 rounded-lg border border-terminal-border text-[11px] overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setCategoryFilter('ALL')}
                  className={`px-2 py-0.5 rounded ${categoryFilter === 'ALL' ? 'bg-terminal-800 text-white font-bold' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setCategoryFilter('CENTRAL_BANK')}
                  className={`px-2 py-0.5 rounded ${categoryFilter === 'CENTRAL_BANK' ? 'bg-terminal-800 text-purple-300 font-bold' : 'text-slate-400'}`}
                >
                  Central Banks
                </button>
                <button
                  onClick={() => setCategoryFilter('INDIAN_MARKET')}
                  className={`px-2 py-0.5 rounded ${categoryFilter === 'INDIAN_MARKET' ? 'bg-terminal-800 text-amber-300 font-bold' : 'text-slate-400'}`}
                >
                  🇮🇳 NSE/BSE
                </button>
                <button
                  onClick={() => setCategoryFilter('FOREX_SPECIALIST')}
                  className={`px-2 py-0.5 rounded ${categoryFilter === 'FOREX_SPECIALIST' ? 'bg-terminal-800 text-cyan-300 font-bold' : 'text-slate-400'}`}
                >
                  Forex
                </button>
              </div>

              {/* Sentiment filter */}
              <div className="flex items-center bg-terminal-900 p-0.5 rounded-lg border border-terminal-border text-[11px]">
                <button
                  onClick={() => setSentimentFilter('ALL')}
                  className={`px-2 py-0.5 rounded ${sentimentFilter === 'ALL' ? 'bg-terminal-800 text-white font-bold' : 'text-slate-400'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setSentimentFilter('BULLISH')}
                  className={`px-2 py-0.5 rounded ${sentimentFilter === 'BULLISH' ? 'bg-emerald-600/30 text-emerald-300 font-bold' : 'text-slate-400'}`}
                >
                  Bullish
                </button>
                <button
                  onClick={() => setSentimentFilter('BEARISH')}
                  className={`px-2 py-0.5 rounded ${sentimentFilter === 'BEARISH' ? 'bg-rose-600/30 text-rose-300 font-bold' : 'text-slate-400'}`}
                >
                  Bearish
                </button>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-44">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search headlines..."
                  className="w-full bg-terminal-900 border border-terminal-border pl-7 pr-2.5 py-1 rounded text-[11px] text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>
            </div>
          )}
        </div>

        {/* View 1: Real-Time Headlines Stream */}
        {activeTab === 'HEADLINES' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 scrollbar-thin">
            {filteredArticles.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p>No headlines found matching your search filter.</p>
              </div>
            ) : (
              filteredArticles.map(article => {
                const isBullish = article.sentiment === 'BULLISH';
                const isBearish = article.sentiment === 'BEARISH';

                return (
                  <div
                    key={article.id}
                    className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                      article.isBreaking
                        ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                        : 'bg-terminal-950/70 border-terminal-border hover:border-slate-600'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2 mb-2">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        {article.isBreaking && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white flex items-center gap-1 animate-pulse">
                            <Flame className="w-3 h-3" />
                            BREAKING
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-terminal-800 text-blue-300 border border-blue-500/30">
                          {article.sourceName}
                        </span>
                        <span className="text-[10px] text-slate-400">({article.category.replace('_', ' ')})</span>
                        <span className="text-[10px] text-slate-400">• {article.timeAgo}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1 ${
                          isBullish
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : isBearish
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                        }`}>
                          {isBullish ? <TrendingUp className="w-3 h-3" /> : isBearish ? <TrendingDown className="w-3 h-3" /> : null}
                          {article.sentiment} ({article.sentimentScore > 0 ? '+' : ''}{article.sentimentScore})
                        </span>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 rounded hover:bg-terminal-800 text-slate-400 hover:text-white"
                          title="Open original website"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    <h4 className="text-white font-bold text-xs sm:text-sm mb-1 leading-snug">
                      {article.title}
                    </h4>

                    <p className="text-slate-300 text-xs font-sans leading-relaxed mb-2.5">
                      {article.summary}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-terminal-border/40 text-[10px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Impact: </span>
                        <span className={`font-bold ${article.impact === 'HIGH' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {article.impact} IMPACT
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="text-slate-400">Target Assets:</span>
                        {article.targetSymbols.map(sym => (
                          <button
                            key={sym}
                            onClick={() => onSelectPair && onSelectPair(sym as CurrencyPair)}
                            className="px-1.5 py-0.5 rounded bg-terminal-900 hover:bg-terminal-800 text-cyan-300 border border-terminal-border hover:border-cyan-500/40 font-bold"
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* View 2: The 20 Monitored Websites & Calendars Directory */}
        {activeTab === 'SOURCES' && (
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 scrollbar-thin">
            <div className="p-3 bg-terminal-950 rounded-lg border border-terminal-border flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Backend Storage: Local Browser (localStorage) • Automated continuous polling</span>
              </span>
              <span className="text-cyan-400 font-bold">{activeSourcesCount} of 20 Sources Active</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {sources.map(source => (
                <div
                  key={source.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    source.enabled 
                      ? 'bg-terminal-950/70 border-terminal-border hover:border-blue-500/40' 
                      : 'bg-terminal-950/30 border-terminal-border/40 opacity-60'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${source.enabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`}></span>
                      <h5 className="font-bold text-white text-xs truncate">{source.name}</h5>
                      <span className="text-[10px] text-slate-400">({source.category.replace('_', ' ')})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1">
                      <span>Ping: <strong className="text-emerald-400">{source.pingMs}ms</strong></span>
                      <span>Scraped: {source.lastScrapedTime}</span>
                      <span>Rating: <strong className="text-amber-400">{source.reliabilityRating}/10</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 rounded bg-terminal-900 hover:bg-terminal-800 text-slate-400 hover:text-white"
                      title="Open source"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <button
                      onClick={() => onToggleSource(source.id)}
                      className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                        source.enabled
                          ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40'
                          : 'bg-terminal-800 text-slate-400'
                      }`}
                    >
                      {source.enabled ? 'ACTIVE' : 'MUTED'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
