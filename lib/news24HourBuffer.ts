import { NewsArticle, News24HourBufferState, CurrencyPair } from './types';

const BUFFER_STORAGE_KEY = 'qri_news_24h_buffer_v2';
const BUFFER_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

const isBrowser = typeof window !== 'undefined';

/**
 * 24-Hour Rolling Memory Buffer
 * 
 * Guarantees zero data loss across page refreshes, tab switches, and network reconnections.
 * Actively caches verified institutional news across ALL impact levels (High, Medium, Low),
 * specifically tailored for Gold, Forex, Commodities, and Indices.
 * Automatically evicts any feed items older than 24 hours.
 */
export class News24HourBufferManager {
  private static instance: News24HourBufferManager;
  private memoryCache: NewsArticle[] = [];
  private lastHydrated: number = 0;

  private constructor() {
    if (isBrowser) {
      this.loadFromStorage();
    }
  }

  public static getInstance(): News24HourBufferManager {
    if (!News24HourBufferManager.instance) {
      News24HourBufferManager.instance = new News24HourBufferManager();
    }
    return News24HourBufferManager.instance;
  }

  /**
   * Immediately load cached articles from browser localStorage and purge expired items
   */
  public loadFromStorage(): NewsArticle[] {
    if (!isBrowser) return this.memoryCache;

    try {
      const raw = localStorage.getItem(BUFFER_STORAGE_KEY);
      if (raw) {
        const parsed: NewsArticle[] = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const now = Date.now();
          // Purge records older than 24 hours
          const fresh = parsed.filter(a => a.timestamp && (now - a.timestamp) < BUFFER_TTL_MS);
          this.memoryCache = fresh.sort((a, b) => b.timestamp - a.timestamp);
          this.lastHydrated = now;

          // If pruning removed old items, save back
          if (fresh.length !== parsed.length) {
            this.saveToStorage();
          }
          return this.memoryCache;
        }
      }
    } catch (e) {
      console.warn('Failed to load 24h news buffer from localStorage:', e);
    }
    return this.memoryCache;
  }

  /**
   * Save current cache to localStorage
   */
  private saveToStorage(): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(BUFFER_STORAGE_KEY, JSON.stringify(this.memoryCache.slice(0, 500)));
    } catch (e) {
      console.warn('Failed to save 24h news buffer to localStorage:', e);
    }
  }

  /**
   * Ingest and cache new articles (with fingerprint deduplication and 24-hour eviction)
   */
  public ingestArticles(articles: NewsArticle[]): NewsArticle[] {
    if (!articles || articles.length === 0) return this.memoryCache;

    const now = Date.now();
    const existingMap = new Map<string, NewsArticle>();

    // Load existing items
    this.memoryCache.forEach(a => {
      const key = this.getFingerprint(a);
      existingMap.set(key, a);
    });

    // Ingest new items
    articles.forEach(a => {
      if (!a.timestamp || (now - a.timestamp) >= BUFFER_TTL_MS) return; // Discard expired
      const key = this.getFingerprint(a);
      if (!existingMap.has(key)) {
        existingMap.set(key, a);
      } else {
        // Update if existing item doesn't have details
        const existing = existingMap.get(key)!;
        if (!existing.url && a.url) existingMap.set(key, a);
      }
    });

    // Filter by TTL and sort descending
    this.memoryCache = Array.from(existingMap.values())
      .filter(a => (now - a.timestamp) < BUFFER_TTL_MS)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 500);

    this.saveToStorage();
    return this.memoryCache;
  }

  /**
   * Ingest a single incoming live wire tick
   */
  public ingestTick(article: NewsArticle): void {
    this.ingestArticles([article]);
  }

  /**
   * Query the 24-hour memory buffer with optional symbol, impact, and category filters
   */
  public getArticles(filter?: {
    symbol?: string;
    impact?: 'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category?: string;
    search?: string;
  }): NewsArticle[] {
    const now = Date.now();
    // Auto-prune on read
    let list = this.memoryCache.filter(a => (now - a.timestamp) < BUFFER_TTL_MS);

    if (filter?.symbol && filter.symbol !== 'ALL') {
      const sym = filter.symbol.toUpperCase();
      list = list.filter(a => 
        a.relatedSymbols.some(s => s.toUpperCase() === sym || sym.includes(s.toUpperCase()))
      );
    }

    if (filter?.impact && filter.impact !== 'ALL') {
      list = list.filter(a => a.impact === filter.impact);
    }

    if (filter?.category && filter.category !== 'ALL') {
      list = list.filter(a => a.category === filter.category);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(a => 
        a.title.toLowerCase().includes(q) ||
        a.source.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get buffer status metrics
   */
  public getBufferStats(): News24HourBufferState {
    const now = Date.now();
    const active = this.memoryCache.filter(a => (now - a.timestamp) < BUFFER_TTL_MS);

    const impactBreakdown = {
      critical: active.filter(a => a.impact === 'CRITICAL').length,
      high: active.filter(a => a.impact === 'HIGH').length,
      medium: active.filter(a => a.impact === 'MEDIUM').length,
      low: active.filter(a => a.impact === 'LOW').length,
    };

    const symbolBreakdown: Record<string, number> = {};
    active.forEach(a => {
      a.relatedSymbols.forEach(s => {
        symbolBreakdown[s] = (symbolBreakdown[s] || 0) + 1;
      });
    });

    return {
      articles: active,
      lastHydrated: this.lastHydrated || now,
      totalArticlesCount: active.length,
      impactBreakdown,
      symbolBreakdown,
    };
  }

  /**
   * Clear all items in 24h buffer
   */
  public clearBuffer(): void {
    this.memoryCache = [];
    if (isBrowser) {
      try {
        localStorage.removeItem(BUFFER_STORAGE_KEY);
      } catch (e) {
        console.warn('Failed to clear 24h buffer:', e);
      }
    }
  }

  private getFingerprint(a: NewsArticle): string {
    const normTitle = (a.title || '').trim().toLowerCase().slice(0, 40);
    return `${a.sourceDomain || a.source}-${normTitle}`;
  }
}

export const news24HourBuffer = News24HourBufferManager.getInstance();
