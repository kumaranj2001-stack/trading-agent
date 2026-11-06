'use client';

import React, { useState } from 'react';
import { NewsArticle } from '@/lib/types';
import { MONITORED_FINANCIAL_SOURCES, FinancialSource } from '@/lib/newsEngine';
import { 
  Newspaper, 
  ExternalLink, 
  RefreshCw, 
  Globe2, 
  Flame, 
  ShieldCheck, 
  Radio, 
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface NewsWireModalProps {
  isOpen: boolean;
  onClose: () => void;
  articles: NewsArticle[];
  sentimentScore: number;
  marketMood: string;
  symbol: string;
  onRefreshScrape?: () => void;
  isScraping?: boolean;
}

export const NewsWireModal: React.FC<NewsWireModalProps> = ({
  isOpen,
  onClose,
  articles,
  sentimentScore,
  marketMood,
  symbol,
  onRefreshScrape,
  isScraping = false,
}) => {
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const filteredArticles = articles.filter(a => {
    if (selectedSourceFilter === 'ALL') return true;
    return a.sourceDomain.includes(selectedSourceFilter) || a.source.toLowerCase().includes(selectedSourceFilter.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="bg-terminal-900 border border-terminal-border rounded-2xl w-full max-w-5xl h-[92vh] sm:h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-terminal-950 border-b border-terminal-border flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-sky-950 border border-sky-700 flex items-center justify-center text-sky-400 shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white text-base truncate">
                  Real-Time Financial Scraper & News Wire Desk
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/40 shrink-0">
                  18 SOURCES LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono truncate">
                Monitoring Bloomberg, Reuters, Kitco, WSJ, CNBC, FT, DailyFX & Central Bank Wires
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onRefreshScrape && (
              <button
                onClick={onRefreshScrape}
                disabled={isScraping}
                className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScraping ? 'animate-spin' : ''}`} />
                <span>{isScraping ? 'SCRAPING 18 SOURCES...' : 'SCRAPE LIVE NOW'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 sm:px-3 sm:py-1.5 rounded bg-terminal-800 hover:bg-terminal-700 text-slate-300 font-mono text-xs transition-colors"
              aria-label="Close wire modal"
            >
              <X className="w-4 h-4 sm:hidden" />
              <span className="hidden sm:inline">Close Wire</span>
            </button>
          </div>
        </div>

        {/* Live Sentiment & Wire Health Bar */}
        <div className="p-3 bg-terminal-950/70 border-b border-terminal-border grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono text-xs">
          <div className="p-2.5 bg-terminal-900/80 rounded-lg border border-terminal-border/60">
            <span className="text-[10px] text-slate-400 uppercase block">Active Target</span>
            <span className="text-white font-bold text-sm">{symbol}</span>
          </div>

          <div className="p-2.5 bg-terminal-900/80 rounded-lg border border-terminal-border/60">
            <span className="text-[10px] text-slate-400 uppercase block">Wire Sentiment</span>
            <span className={`font-bold text-sm ${
              sentimentScore > 0 ? 'text-emerald-400' : sentimentScore < 0 ? 'text-rose-400' : 'text-amber-400'
            }`}>
              {sentimentScore > 0 ? '+' : ''}{sentimentScore} ({marketMood.replace('_', ' ')})
            </span>
          </div>

          <div className="p-2.5 bg-terminal-900/80 rounded-lg border border-terminal-border/60">
            <span className="text-[10px] text-slate-400 uppercase block">Monitored Outlets</span>
            <span className="text-cyan-400 font-bold text-sm">18 Websites Streaming</span>
          </div>

          <div className="p-2.5 bg-terminal-900/80 rounded-lg border border-terminal-border/60">
            <span className="text-[10px] text-slate-400 uppercase block">Headline Density</span>
            <span className="text-white font-bold text-sm">{articles.length} Wire Alerts</span>
          </div>
        </div>

        {/* 18 Financial Sources Pill Filter */}
        <div className="p-2.5 bg-terminal-950/40 border-b border-terminal-border flex items-center gap-1.5 overflow-x-auto scrollbar-none font-mono text-xs whitespace-nowrap">
          <button
            onClick={() => setSelectedSourceFilter('ALL')}
            className={`px-2.5 py-1 rounded-md transition-colors ${
              selectedSourceFilter === 'ALL'
                ? 'bg-sky-600 text-white font-bold'
                : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
            }`}
          >
            All Sources (18)
          </button>
          {MONITORED_FINANCIAL_SOURCES.map(source => (
            <button
              key={source.id}
              onClick={() => setSelectedSourceFilter(source.domain)}
              className={`px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                selectedSourceFilter === source.domain
                  ? 'bg-sky-600 text-white font-bold'
                  : 'text-slate-400 hover:text-white bg-terminal-900 border border-terminal-border'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>{source.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Scraped Articles Wire Stream */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 font-mono text-xs scrollbar-thin">
          {filteredArticles.length === 0 ? (
            <div className="text-center p-8 text-slate-400">
              No wire articles match the selected source filter. Click "All Sources" to see synthesized updates.
            </div>
          ) : (
            filteredArticles.map(article => {
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
                    <span className="text-[10px] text-slate-400">{article.publishedTime}</span>
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
      </div>
    </div>
  );
};
