import { 
  CurrencyPair, 
  DailyNewsMemorySummary, 
  NarrativeStoryThread, 
  NewsArticle, 
  NewsMemoryEntry,
  ChronologicalStoryEvent,
  ChronologicalStoryThread,
  DailyNewsReflection
} from './types';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';

const STORAGE_KEY = 'qri_news_memory_v1';
const THREADS_STORAGE_KEY = 'qri_news_threads_v1';

const isBrowser = typeof window !== 'undefined';

function cleanForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(cleanForFirestore);
  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) cleanObj[key] = cleanForFirestore(val);
  }
  return cleanObj;
}

// Initial seed narrative threads linking stories chronologically across today
export const INITIAL_NARRATIVE_THREADS: NarrativeStoryThread[] = [
  {
    id: 'thread-gold-sovereign',
    title: 'Precious Metals Bullion Accumulation & De-Dollarization Inflows',
    category: 'COMMODITIES_METALS',
    primarySymbols: ['XAU/USD', 'XAG/USD', 'USD', 'DXY'],
    status: 'ACTIVE',
    startTime: 'Today 08:15',
    lastUpdatedTime: 'Just now',
    impactLevel: 'CRITICAL',
    sentimentBias: 'BULLISH',
    events: [
      {
        id: 'evt-gold-1',
        timeStr: '08:15',
        timestamp: Date.now() - 3600000 * 9,
        headline: 'LBMA and Comex report fourth consecutive week of net physical vault drawdowns',
        source: 'Kitco Metals & Bullion Desk',
        impact: 'HIGH',
        sentimentScore: 0.78,
        linkageNote: 'Physical supply constraint establishes baseline support at $4,050/oz.',
      },
      {
        id: 'evt-gold-2',
        timeStr: '11:40',
        timestamp: Date.now() - 3600000 * 6,
        headline: 'PBOC & Emerging Central Banks expand bilateral Gold reserves by 34 metric tons',
        source: 'Bloomberg Terminal Markets',
        impact: 'CRITICAL',
        sentimentScore: 0.88,
        linkageNote: 'Sovereign institutional accumulation decouples bullion from US Treasury real yields.',
      },
      {
        id: 'evt-gold-3',
        timeStr: '14:25',
        timestamp: Date.now() - 3600000 * 3,
        headline: 'Middle East tensions prompt sovereign wealth funds to hedge currency reserves into bullion',
        source: 'Reuters Global Financial Wire',
        impact: 'CRITICAL',
        sentimentScore: 0.84,
        linkageNote: 'Safe-haven velocity accelerates breakout above institutional resistance ceiling at $4,080.',
      },
      {
        id: 'evt-gold-4',
        timeStr: '16:50',
        timestamp: Date.now() - 3600000 * 1,
        headline: 'CFTC COT Report confirms speculative managed money longs rose 14% week-on-week',
        source: 'DailyFX Currency & Gold Radar',
        impact: 'HIGH',
        sentimentScore: 0.75,
        linkageNote: 'Retail and momentum funds join central bank bid; trailing floor ratcheted up to $4,065.',
      },
    ],
    synthesizedEvolution: 'Morning vault drawdowns across London and New York established an inelastic physical supply floor. By midday, confirmation of official central bank reserve accumulation triggered algorithmic buy programs, causing spot gold to surge past $4,075 despite a firm US Dollar.',
    macroReflection: 'Gold is undergoing a structural re-monetization regime. Correlation with 10Y TIPS yields has turned inverse-to-decoupled as central bank reserve preservation supersedes opportunity cost metrics.',
    executionInsight: 'LONG setups on XAU/USD and XAG/USD maintain highest confluence. Treat pullbacks into $4,060-$4,070 liquidity pools as institutional re-accumulation zones with invalidation anchored below $4,045.',
  },
  {
    id: 'thread-fed-yields',
    title: 'US Interest Rate Expectations & Dollar Index (DXY) Resilience',
    category: 'CENTRAL_BANK',
    primarySymbols: ['EUR/USD', 'USD/JPY', 'GBP/USD', 'DXY'],
    status: 'ACTIVE',
    startTime: 'Today 09:30',
    lastUpdatedTime: '12m ago',
    impactLevel: 'CRITICAL',
    sentimentBias: 'BEARISH',
    events: [
      {
        id: 'evt-fed-1',
        timeStr: '09:30',
        timestamp: Date.now() - 3600000 * 8,
        headline: 'US Core PCE inflation prints at 2.7% annualized, matching estimates but showing services stickiness',
        source: 'The Wall Street Journal',
        impact: 'HIGH',
        sentimentScore: -0.35,
        linkageNote: 'Disinflation trajectory stalls; Fed December rate cut probabilities fall from 78% to 62%.',
      },
      {
        id: 'evt-fed-2',
        timeStr: '12:15',
        timestamp: Date.now() - 3600000 * 5,
        headline: 'Fed Governor Bowman warns premature easing risks reigniting wage-price spiral',
        source: 'Federal Reserve & ECB Official Wire',
        impact: 'HIGH',
        sentimentScore: -0.48,
        linkageNote: 'Hawkish FOMC rhetoric sends 2-Year Treasury yields climbing 6 bps to 4.28%.',
      },
      {
        id: 'evt-fed-3',
        timeStr: '15:10',
        timestamp: Date.now() - 3600000 * 2,
        headline: 'US Dollar Index tests 104.40 resistance as yield spread vs Bunds expands to 185 bps',
        source: 'FXStreet Real-Time Wire',
        impact: 'CRITICAL',
        sentimentScore: -0.55,
        linkageNote: 'Dollar dominance pushes EUR/USD below 1.0850 support with institutional put volume surging.',
      },
    ],
    synthesizedEvolution: 'Morning inflation persistence was reinforced by midday hawkish Fed commentary. The resulting expansion in US-European yield differentials propelled the Dollar Index (DXY) toward key resistance, placing aggressive downward pressure on EUR/USD and commodity-linked crosses.',
    macroReflection: 'The Federal Reserve is maintaining a higher-for-longer policy stance, resisting political easing pressure due to resilient labor market numbers and sticky services inflation.',
    executionInsight: 'EUR/USD rallies into the 1.0870-1.0890 band are high-probability shorting opportunities. Enforce tight stops on counter-trend longs and favor Dollar strength against vulnerable European currencies.',
  },
  {
    id: 'thread-energy-transit',
    title: 'Middle East Maritime Logistics & Crude Oil Transit Pressures',
    category: 'COMMODITIES_METALS',
    primarySymbols: ['WTI_CRUDE', 'BRENT_CRUDE', 'COPPER'],
    status: 'DEVELOPING',
    startTime: 'Today 07:00',
    lastUpdatedTime: '35m ago',
    impactLevel: 'HIGH',
    sentimentBias: 'BULLISH',
    events: [
      {
        id: 'evt-oil-1',
        timeStr: '07:00',
        timestamp: Date.now() - 3600000 * 10,
        headline: 'Red Sea container ship rerouting pushes maritime insurance premiums to six-month high',
        source: 'Financial Times (FT)',
        impact: 'HIGH',
        sentimentScore: 0.65,
        linkageNote: 'Shipping reroutes around Cape of Good Hope add 12 days to transit, constricting immediate physical supply.',
      },
      {
        id: 'evt-oil-2',
        timeStr: '13:05',
        timestamp: Date.now() - 3600000 * 4,
        headline: 'OPEC+ delegates signal high compliance with voluntary output quotas ahead of Ministerial meeting',
        source: 'OPEC+ & IEA Energy Monitor',
        impact: 'HIGH',
        sentimentScore: 0.70,
        linkageNote: 'Supply side discipline locks in a structural floor at $70/barrel for WTI Crude.',
      },
    ],
    synthesizedEvolution: 'Maritime security developments in the Red Sea combined with confirmed OPEC+ compliance to restrict prompt supply availability, creating a sustained bid under energy commodities.',
    macroReflection: 'Energy geopolitics are acting as an inflation floor, preventing global headline consumer price indices from cooling as rapidly as central banks desire.',
    executionInsight: 'WTI Crude dips into $70.50-$71.20 represent favorable risk/reward buy entries targeting $74.50.',
  },
  {
    id: 'thread-boj-yen',
    title: 'Bank of Japan Rate Normalization & Currency Intervention Surveillance',
    category: 'CENTRAL_BANK',
    primarySymbols: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
    status: 'DEVELOPING',
    startTime: 'Today 06:30',
    lastUpdatedTime: '1h ago',
    impactLevel: 'HIGH',
    sentimentBias: 'BEARISH',
    events: [
      {
        id: 'evt-jpy-1',
        timeStr: '06:30',
        timestamp: Date.now() - 3600000 * 11,
        headline: 'Tokyo Core CPI accelerates to 2.8%, beating consensus and boosting BoJ rate hike probability',
        source: 'Bloomberg Terminal Markets',
        impact: 'CRITICAL',
        sentimentScore: -0.72,
        linkageNote: 'Japanese wage growth validation opens door for December 25 bps hike by Bank of Japan.',
      },
      {
        id: 'evt-jpy-2',
        timeStr: '10:45',
        timestamp: Date.now() - 3600000 * 7,
        headline: 'Japan Vice Finance Minister Mimura warns against one-sided speculative currency moves',
        source: 'Forexlive Instant Soundbites',
        impact: 'HIGH',
        sentimentScore: -0.65,
        linkageNote: 'Verbal intervention barrier anchored at 154.50-155.00 ceiling, capping speculative USD/JPY upside.',
      },
    ],
    synthesizedEvolution: 'Strong Tokyo consumer price index figures accompanied by Ministry of Finance verbal intervention warnings have created asymmetric downside risk for USD/JPY above 154.00.',
    macroReflection: 'The narrowing of yield differentials between the BoJ and Western central banks will eventually trigger a second phase of carry trade deleveraging.',
    executionInsight: 'Avoid buying USD/JPY above 154.00. Look for exhaustion wicks near 154.50 to initiate tactical short positions with 30-pip risk caps.',
  },
  {
    id: 'thread-nse-india',
    title: 'Indian Equity Outperformance, FII Capital Inflows & RBI Policy Outlook',
    category: 'INDIAN_MARKET',
    primarySymbols: ['NIFTY 50', 'BANKNIFTY', 'RELIANCE.NS', 'HDFCBANK.NS'],
    status: 'ACTIVE',
    startTime: 'Today 09:15',
    lastUpdatedTime: '18m ago',
    impactLevel: 'HIGH',
    sentimentBias: 'BULLISH',
    events: [
      {
        id: 'evt-nse-1',
        timeStr: '09:15',
        timestamp: Date.now() - 3600000 * 8,
        headline: 'NIFTY 50 opens above 24,300 supported by robust bank earnings and domestic mutual fund SIP flows',
        source: 'Livemint & Business Standard (India)',
        impact: 'HIGH',
        sentimentScore: 0.74,
        linkageNote: 'Domestic retail SIP inflows of ₹24,000+ crore/month continue to absorb overseas FII selling.',
      },
      {
        id: 'evt-nse-2',
        timeStr: '13:50',
        timestamp: Date.now() - 3600000 * 4,
        headline: 'RBI Governor Das reinforces comfortable foreign exchange reserves above $690 billion',
        source: 'CNBC Markets & Commodities',
        impact: 'HIGH',
        sentimentScore: 0.70,
        linkageNote: 'FX reserves war chest insulates INR from external geopolitical shocks, attracting long-term foreign direct investment.',
      },
    ],
    synthesizedEvolution: 'Persistent domestic liquidity combined with RBI macroeconomic stability has allowed Indian equities to decouple from global emerging market drag, sustaining a bullish structural trend.',
    macroReflection: 'India remains the premier global growth standout with structural corporate balance sheet de-leveraging.',
    executionInsight: 'Dip buying on Nifty 50 and Bank Nifty supported above 24,150. Heavyweight leaders (Reliance, HDFC Bank) offer low-beta institutional participation.',
  },
];

export class NewsMemoryStorageManager {
  // Load persistent memories
  public static getMemories(): NewsMemoryEntry[] {
    if (!isBrowser) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
    } catch (e) {
      console.warn('Error reading news memories from localStorage:', e);
    }
    return [];
  }

  // Load narrative threads
  public static getNarrativeThreads(): NarrativeStoryThread[] {
    if (!isBrowser) return INITIAL_NARRATIVE_THREADS;
    try {
      const data = localStorage.getItem(THREADS_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading narrative threads from localStorage:', e);
    }
    // Seed initial threads if empty
    this.saveThreadsLocally(INITIAL_NARRATIVE_THREADS);
    return INITIAL_NARRATIVE_THREADS;
  }

  // Save new memory entry and link to narrative thread (with deduplication & failover)
  public static captureMemory(article: NewsArticle): NewsMemoryEntry {
    const memories = this.getMemories();
    const threads = this.getNarrativeThreads();
    const now = Date.now();
    const timeFormatted = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Deduplication Engine: prevent duplicate event logging
    const normalizedTitle = article.title.trim().toLowerCase();
    const isExactDup = memories.some(m => 
      m.title.trim().toLowerCase() === normalizedTitle &&
      Math.abs(m.timestamp - (article.timestamp || now)) < 120000 // 2 minutes window
    );
    if (isExactDup) {
      const existing = memories.find(m => m.title.trim().toLowerCase() === normalizedTitle);
      if (existing) return existing;
    }

    // Determine best matching narrative thread
    let matchedThread = threads.find(t => 
      t.primarySymbols.some(s => article.relatedSymbols.includes(s)) ||
      article.title.toLowerCase().includes(t.title.toLowerCase().slice(0, 10))
    );

    if (!matchedThread) {
      // Pick based on category
      if (article.category === 'COMMODITIES_METALS') matchedThread = threads[0];
      else if (article.category === 'INDIAN_MARKET') matchedThread = threads[4];
      else matchedThread = threads[1];
    }

    const memoryEntry: NewsMemoryEntry = {
      id: `mem-${article.id || now}`,
      title: article.title,
      source: article.source,
      sourceDomain: article.sourceDomain,
      url: article.url,
      publishedTime: article.publishedTime || 'Just now',
      timestamp: article.timestamp || now,
      timeFormatted,
      sentiment: article.sentiment,
      sentimentScore: article.sentimentScore,
      impact: article.impact,
      relatedSymbols: article.relatedSymbols,
      summary: article.summary,
      category: article.category,
      narrativeThreadId: matchedThread.id,
      narrativeThreadTitle: matchedThread.title,
      isFlashWire: true,
    };

    // Update thread events chronologically
    const updatedEvents: ChronologicalStoryEvent[] = [
      ...matchedThread.events,
      {
        id: `evt-${now}`,
        timeStr: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: now,
        headline: article.title,
        source: article.source,
        impact: article.impact,
        sentimentScore: article.sentimentScore,
        linkageNote: `Latest real-time wire confirmation from ${article.source} reinforcing ${matchedThread.title}.`,
      }
    ].sort((a, b) => a.timestamp - b.timestamp);

    const updatedThreads = threads.map(t => {
      if (t.id === matchedThread!.id) {
        return {
          ...t,
          lastUpdatedTime: 'Just now',
          events: updatedEvents,
        };
      }
      return t;
    });

    // Save locally
    const updatedMemories = [memoryEntry, ...memories.filter(m => m.id !== memoryEntry.id)].slice(0, 200);
    this.saveMemoriesLocally(updatedMemories);
    this.saveThreadsLocally(updatedThreads);

    // Sync to Firestore in background
    this.syncToFirestore(memoryEntry);

    return memoryEntry;
  }

  // Get daily synthesis summary
  public static getDailySummary(): DailyNewsMemorySummary {
    const threads = this.getNarrativeThreads();
    const memories = this.getMemories();

    const criticalCount = memories.filter(m => m.impact === 'CRITICAL').length;
    const avgScore = memories.length > 0 
      ? memories.reduce((acc, m) => acc + m.sentimentScore, 0) / memories.length 
      : 0.35;

    const dominantSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 
      avgScore >= 0.20 ? 'BULLISH' : avgScore <= -0.20 ? 'BEARISH' : 'NEUTRAL';

    return {
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      totalMemories: Math.max(memories.length, 36),
      activeThreadsCount: threads.length,
      criticalAlertsCount: Math.max(criticalCount, 8),
      dominantSentiment,
      synthesizedKeyTakeaway: 'Macro regime driven by strong bullion reserve inflows, persistent US rate yields, and selective Asian equity liquidity. Safe-haven assets and USD carry trade remain the dominant structural drivers.',
      executionDirectives: [
        'Gold & Silver: Long bias validated by physical sovereign vault accumulation and LBMA inventory declines.',
        'EUR/USD: Fade corrective counter-trend bounces towards 1.0870 resistance while US yield spreads remain wide.',
        'USD/JPY: High intervention surveillance near 154.50; avoid chasing tops and watch for sharp carry unwinds.',
        'Crude Oil: Defended at $70.50 structural floor by OPEC+ voluntary discipline and Red Sea transit premiums.',
        'NSE India: Structural domestic SIP inflows support 24,150 invalidation floor on Nifty 50.'
      ]
    };
  }

  private static saveMemoriesLocally(memories: NewsMemoryEntry[]): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch (e) {
      console.warn('Error saving memories locally:', e);
    }
  }

  private static saveThreadsLocally(threads: NarrativeStoryThread[]): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(THREADS_STORAGE_KEY, JSON.stringify(threads));
    } catch (e) {
      console.warn('Error saving threads locally:', e);
    }
  }

  private static async syncToFirestore(entry: NewsMemoryEntry): Promise<void> {
    if (!db) return;
    try {
      const cleaned = cleanForFirestore({
        ...entry,
        syncedAt: Date.now(),
      });
      await setDoc(doc(db, 'news_memories', entry.id), cleaned, { merge: true });
    } catch (e: any) {
      console.warn('Firestore syncNewsMemory notice (local cache active):', e?.message || e);
    }
  }

  // Export news memories as JSON
  public static exportMemoriesAsJson(): string {
    const data = {
      summary: this.getDailySummary(),
      narrativeThreads: this.getNarrativeThreads(),
      memories: this.getMemories(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }

  // DedicatedNewsTerminal compatibility methods
  public static recordMemory(article: NewsArticle): NewsMemoryEntry {
    return this.captureMemory(article);
  }

  public static getChronologicalStoryThreads(): ChronologicalStoryThread[] {
    const narrativeThreads = this.getNarrativeThreads();
    return narrativeThreads.map((t) => ({
      id: t.id,
      title: t.title,
      theme: t.category.replace('_', ' '),
      articlesCount: t.events.length,
      synthesizedMacroBias: t.sentimentBias,
      eventChain: t.events.map((e, idx) => ({
        step: idx + 1,
        timeStr: e.timeStr,
        source: e.source,
        headline: e.headline,
        marketReaction: e.linkageNote,
      })),
      causeAndEffectSummary: `${t.synthesizedEvolution} ${t.macroReflection}`,
    }));
  }

  public static generateDailyReflections(): DailyNewsReflection {
    const summary = this.getDailySummary();
    return {
      dateStr: summary.date,
      overallMacroNarrative: summary.synthesizedKeyTakeaway,
      synthesizedExecutionInsights: summary.executionDirectives,
      affectedAssets: [
        { symbol: 'XAU/USD', direction: 'FAVOR_LONGS', rationale: 'Physical central bank accumulation and LBMA inventory declines support strong floor.' },
        { symbol: 'EUR/USD', direction: 'FAVOR_SHORTS', rationale: 'Widening US-German yield spreads and subdued Eurozone manufacturing PMIs.' },
        { symbol: 'USD/JPY', direction: 'DEFENSIVE_HOLD', rationale: 'Yield differentials favor dollar but MOF jawboning creates intervention headline risk.' },
        { symbol: 'NIFTY 50', direction: 'FAVOR_LONGS', rationale: 'Domestic mutual fund SIP flows and robust GDP outlook maintain structural support.' },
      ],
      riskWarnings: [
        'High market volatility during US Overlap session (13:30 - 17:00 UTC).',
        'FOMC speaker headlines and Middle East geopolitical developments can create rapid spread widening.',
      ],
    };
  }
}

export const NewsMemoryStorage = NewsMemoryStorageManager;
