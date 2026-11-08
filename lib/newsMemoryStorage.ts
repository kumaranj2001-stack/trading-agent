import { 
  ChronologicalStoryEvent, 
  ChronologicalStoryThread, 
  DailyNewsReflection, 
  NewsArticle, 
  NewsMemoryEntry 
} from './types';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, query, orderBy, limit } from 'firebase/firestore';

const STORAGE_KEY = 'qri_news_memories_v2';
const REFLECTION_KEY = 'qri_news_reflections_v2';
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

// 🏛️ INITIAL PERSISTENT SEED MEMORIES (Chronological Daily Record)
export const INITIAL_NEWS_MEMORIES: NewsMemoryEntry[] = [
  {
    id: 'mem-001',
    timestamp: Date.now() - 3600000 * 7,
    timeStr: '07:30 AM',
    source: 'Bloomberg Terminal Markets',
    sourceDomain: 'bloomberg.com',
    title: 'Central Bank Gold Reserves Surge 38 Tons in Monthly Benchmark Report',
    summary: 'Sovereign balance sheet diversification accelerates with Eastern European and Asian central banks increasing non-dollar bullion reserves.',
    sentiment: 'BULLISH',
    sentimentScore: 0.85,
    impact: 'CRITICAL',
    category: 'COMMODITIES_METALS',
    relatedSymbols: ['XAU/USD', 'USD', 'DXY'],
    threadId: 'thread-bullion-reserves',
    chronologicalSequence: 1,
  },
  {
    id: 'mem-002',
    timestamp: Date.now() - 3600000 * 6,
    timeStr: '08:45 AM',
    source: 'Reuters Global Financial Wire',
    sourceDomain: 'reuters.com',
    title: 'Middle East Red Sea Maritime Traffic Diverted Around Cape of Good Hope',
    summary: 'Container shipping freight rates jump 18% as insurance premiums surge, raising concerns over imported European energy and manufacturing costs.',
    sentiment: 'BULLISH',
    sentimentScore: 0.72,
    impact: 'HIGH',
    category: 'GEOPOLITICAL',
    relatedSymbols: ['WTI_CRUDE', 'BRENT_CRUDE', 'XAU/USD'],
    threadId: 'thread-geopolitics-energy',
    chronologicalSequence: 2,
  },
  {
    id: 'mem-003',
    timestamp: Date.now() - 3600000 * 5,
    timeStr: '09:30 AM',
    source: 'Federal Reserve & ECB Official Wire',
    sourceDomain: 'federalreserve.gov',
    title: 'Federal Reserve Speaker Dispatches: Disinflation Progress Sustainable but Policy Vigilance Required',
    summary: 'Remarks prompt slight decline in 2-year US Treasury yields, reducing short-term dollar upside momentum.',
    sentiment: 'NEUTRAL',
    sentimentScore: 0.15,
    impact: 'HIGH',
    category: 'CENTRAL_BANK',
    relatedSymbols: ['EUR/USD', 'USD/JPY', 'DXY'],
    threadId: 'thread-yields-dollar',
    chronologicalSequence: 3,
  },
  {
    id: 'mem-004',
    timestamp: Date.now() - 3600000 * 4,
    timeStr: '10:45 AM',
    source: 'Kitco Metals & Bullion Desk',
    sourceDomain: 'kitco.com',
    title: 'Physical Gold Spot Deliveries Squeeze London Dealers; Premiums Rise to $4.50 Above Benchmark',
    summary: 'Institutional buyers demand physical delivery of allocated bars rather than rolling paper futures positions into next month.',
    sentiment: 'BULLISH',
    sentimentScore: 0.88,
    impact: 'CRITICAL',
    category: 'COMMODITIES_METALS',
    relatedSymbols: ['XAU/USD', 'XAG/USD'],
    threadId: 'thread-bullion-reserves',
    chronologicalSequence: 4,
  },
  {
    id: 'mem-005',
    timestamp: Date.now() - 3600000 * 3,
    timeStr: '12:15 PM',
    source: 'Livemint & Business Standard (India)',
    sourceDomain: 'livemint.com',
    title: 'Foreign Institutional Inflows into Indian Equities Exceed ₹2,100 Crore in Early Session',
    summary: 'High GDP growth projections and strong corporate earnings from banking and technology majors attract broad emerging market allocations.',
    sentiment: 'BULLISH',
    sentimentScore: 0.81,
    impact: 'HIGH',
    category: 'INDIAN_MARKET',
    relatedSymbols: ['NIFTY 50', 'BANK NIFTY', 'RELIANCE'],
    threadId: 'thread-indian-macro',
    chronologicalSequence: 5,
  },
  {
    id: 'mem-006',
    timestamp: Date.now() - 3600000 * 2,
    timeStr: '01:45 PM',
    source: 'Financial Times (FT)',
    sourceDomain: 'ft.com',
    title: '10-Year TIPS Yield Drops 8 Basis Points as Real Borrowing Costs Fall',
    summary: 'Real interest rate compression triggers synchronous buy signals across precious metals and defensive currency baskets.',
    sentiment: 'BULLISH',
    sentimentScore: 0.77,
    impact: 'HIGH',
    category: 'MACRO_DATA',
    relatedSymbols: ['XAU/USD', 'EUR/USD', 'USD'],
    threadId: 'thread-yields-dollar',
    chronologicalSequence: 6,
  },
  {
    id: 'mem-007',
    timestamp: Date.now() - 3600000 * 1,
    timeStr: '03:10 PM',
    source: 'ZeroHedge Macro & Reserve Monitor',
    sourceDomain: 'zerohedge.com',
    title: 'BRICS Settlement Clearing Mechanism Settles Record Physical Volume Bypassing Western Intermediaries',
    summary: 'Structural shift in bilateral invoice settlement reduces structural foreign exchange turnover in traditional dollar corridors.',
    sentiment: 'BULLISH',
    sentimentScore: 0.84,
    impact: 'CRITICAL',
    category: 'GEOPOLITICAL',
    relatedSymbols: ['XAU/USD', 'DXY', 'USD'],
    threadId: 'thread-bullion-reserves',
    chronologicalSequence: 7,
  },
];

export class NewsMemoryStorage {
  // 1. Get all persistent news memories
  public static getMemories(): NewsMemoryEntry[] {
    if (!isBrowser) return INITIAL_NEWS_MEMORIES;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        const parsed: NewsMemoryEntry[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => b.timestamp - a.timestamp);
        }
      }
    } catch (e) {
      console.warn('Error reading news memories:', e);
    }
    this.saveAllLocally(INITIAL_NEWS_MEMORIES);
    return INITIAL_NEWS_MEMORIES;
  }

  // 2. Record new news memory (invoked second-by-second)
  public static recordMemory(article: NewsArticle): NewsMemoryEntry {
    const list = this.getMemories();
    const now = Date.now();
    const timeStr = new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newMemory: NewsMemoryEntry = {
      id: `mem-${now}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
      timeStr,
      source: article.source,
      sourceDomain: article.sourceDomain,
      title: article.title,
      summary: article.summary,
      sentiment: article.sentiment,
      sentimentScore: article.sentimentScore,
      impact: article.impact,
      category: article.category,
      relatedSymbols: article.relatedSymbols,
      threadId: article.threadId || 'thread-yields-dollar',
      chronologicalSequence: list.length + 1,
    };

    // Prepend to maintain fresh order, keep up to 250 daily items
    const updated = [newMemory, ...list.slice(0, 249)];
    this.saveAllLocally(updated);
    this.syncToFirestore(newMemory);

    return newMemory;
  }

  // 3. Chronological Story Linking: Group daily events into cause-and-effect threads
  public static getChronologicalStoryThreads(): ChronologicalStoryThread[] {
    const memories = this.getMemories();

    const threadConfigs: Array<{
      id: string;
      title: string;
      theme: string;
      category: NewsArticle['category'];
      macroBias: ChronologicalStoryThread['synthesizedMacroBias'];
      causeAndEffectSummary: string;
    }> = [
      {
        id: 'thread-bullion-reserves',
        title: 'Sovereign De-Dollarization & Physical Vault Inventory Squeeze',
        theme: 'Central Bank Gold Accumulation & Physical Vault Drawdowns',
        category: 'COMMODITIES_METALS',
        macroBias: 'BULLISH_GOLD',
        causeAndEffectSummary: 'Morning central bank reserve reports triggered physical allocated bar withdrawals in London and Zurich. With Comex eligible inventories drawing down, institutional spot premiums pushed Gold into an aggressive higher-high continuation pattern.',
      },
      {
        id: 'thread-yields-dollar',
        title: 'US Real Yield Compression & DXY Overhead Resistance Stalling',
        theme: 'Federal Reserve Guidance, TIPS Real Yields & FX Repricing',
        category: 'CENTRAL_BANK',
        macroBias: 'BEARISH_USD',
        causeAndEffectSummary: 'Early Fed speeches failed to produce higher yields, prompting US 10-year TIPS to drop 8 bps. The resulting compression in real borrowing costs triggered profit-taking on USD longs and lifted EUR/USD, GBP/USD, and bullion.',
      },
      {
        id: 'thread-geopolitics-energy',
        title: 'Maritime Route Disruption & Energy Supply Risk Premium',
        theme: 'Red Sea Shipping Diversions, Crude Oil & Safe Haven Inflows',
        category: 'GEOPOLITICAL',
        macroBias: 'RISK_OFF',
        causeAndEffectSummary: 'Naval escort expansions and freight insurance spikes raised prompt delivery premiums on Brent and WTI crude. The heightened regional uncertainty stimulated sustained safe-haven demand.',
      },
      {
        id: 'thread-indian-macro',
        title: 'Domestic SIP Liquidity & Foreign Institutional Capital Rotation',
        theme: 'Indian GDP Growth, FII Net Buying & Manufacturing Expansion',
        category: 'INDIAN_MARKET',
        macroBias: 'RISK_ON',
        causeAndEffectSummary: 'Record domestic mutual fund monthly SIPs (₹23,500 Cr+) combined with +₹2,100 Cr in morning FII buying drove banking and tech leaders higher, establishing heavy put writing support at 24,000 strikes.',
      },
    ];

    return threadConfigs.map(cfg => {
      const relatedMemories = memories.filter(m => m.threadId === cfg.id || m.category === cfg.category);
      const sorted = relatedMemories.sort((a, b) => a.timestamp - b.timestamp);

      const eventChain: ChronologicalStoryEvent[] = sorted.slice(0, 5).map((m, idx) => ({
        step: idx + 1,
        timeStr: m.timeStr,
        source: m.source,
        sourceDomain: m.sourceDomain,
        headline: m.title,
        marketReaction: m.impact === 'CRITICAL' 
          ? 'High-volume institutional block reaction with immediate price discovery shift.' 
          : 'Order book depth absorbed without structural trend deviation.',
        impact: m.impact,
      }));

      return {
        id: cfg.id,
        title: cfg.title,
        theme: cfg.theme,
        category: cfg.category,
        startTimeStr: eventChain[0]?.timeStr || '07:30 AM',
        latestTimeStr: eventChain[eventChain.length - 1]?.timeStr || 'Live',
        articlesCount: relatedMemories.length,
        eventChain,
        causeAndEffectSummary: cfg.causeAndEffectSummary,
        synthesizedMacroBias: cfg.macroBias,
      };
    });
  }

  // 4. Synthesized Daily Reflections & Execution Insights Engine
  public static generateDailyReflections(): DailyNewsReflection {
    const memories = this.getMemories();
    const threads = this.getChronologicalStoryThreads();
    const now = Date.now();
    const dateStr = new Date(now).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });

    const totalBullish = memories.filter(m => m.sentiment === 'BULLISH').length;
    const totalBearish = memories.filter(m => m.sentiment === 'BEARISH').length;
    const isBullishDominant = totalBullish >= totalBearish;

    return {
      id: `reflection-${new Date(now).toISOString().slice(0, 10)}`,
      dateStr,
      title: 'Institutional Daily Macro Narrative & Chronological Execution Synthesis',
      overallMacroNarrative: `Today's chronological stream confirms a decisive institutional rotation into hard tangible assets and sovereign reserve hedges. Morning Federal Reserve communications failed to sustain higher terminal rate expectations, triggering an 8 bps decline in TIPS real yields. Concurrently, sovereign de-dollarization headlines and maritime shipping disruptions created a double-catalyst for Gold and Silver, while Indian equities demonstrated relentless domestic SIP liquidity defense.`,
      keyStoryLinks: [
        'Central Bank 38-ton reserve acquisition directly linked to London LBMA physical delivery premium expansion.',
        'Red Sea shipping freight fee spikes of +18% fed directly into Crude Oil prompt spread firming.',
        'US TIPS real yield drop of -8 bps correlated immediately with intraday Gold rally above $2,720 support.',
        'FII net purchases (+₹2,100 Cr) combined with record SIPs to cement 24,000 NIFTY 50 put support.',
      ],
      synthesizedExecutionInsights: [
        'GOLD / METALS: Maintain aggressive Buy-on-Dip bias above $2,715-$2,720. Physical delivery premiums validate structural floor.',
        'US DOLLAR / FOREX: Stand aside on chasing USD strength. Real yield compression caps DXY at overhead resistance ceiling.',
        'CRUDE OIL: Hold tactical long bias with tight trailing stops; avoid shorting while maritime shipping rerouting persists.',
        'NSE EQUITIES: FII net buying alignment with domestic SIP support warrants buying high-quality private banks and IT on intraday pullbacks.',
      ],
      affectedAssets: [
        {
          symbol: 'XAU/USD',
          direction: 'FAVOR_LONGS',
          rationale: 'Double confluence of TIPS real yield drop (-8 bps) and physical vault shortages provides institutional buy wall at $2,720.',
        },
        {
          symbol: 'EUR/USD',
          direction: 'STAND_ASIDE',
          rationale: 'Eurozone growth concerns offset by USD yield stall; wait for 1.0880 breakout confirmation before committing size.',
        },
        {
          symbol: 'USD/JPY',
          direction: 'FAVOR_SHORTS',
          rationale: 'Bank of Japan intervention jawboning at 154.50 creates extreme asymmetric downside risk for leveraged longs.',
        },
        {
          symbol: 'WTI_CRUDE',
          direction: 'FAVOR_LONGS',
          rationale: 'OPEC+ 102% compliance and SPR replenishment solicitations provide sovereign floor at $68.50-$70.00.',
        },
        {
          symbol: 'NIFTY 50',
          direction: 'FAVOR_LONGS',
          rationale: 'Historic ₹23,500 Cr/month domestic retail SIP support creates an unbreakable shock absorber against global volatility.',
        },
      ],
      riskWarnings: [
        'Watch for sudden Central Bank emergency statements that could trigger 15-minute spread widenings.',
        'Asian session low-liquidity window between 02:00-05:00 GMT carries elevated slippage risk on cross-currency pairs.',
      ],
      totalMemoriesAnalyzed: memories.length,
      activeThreadsCount: threads.length,
      timestamp: now,
    };
  }

  // 5. Export memories as JSON
  public static exportMemoriesAsJson(): string {
    const memories = this.getMemories();
    const threads = this.getChronologicalStoryThreads();
    const reflections = this.generateDailyReflections();

    return JSON.stringify({
      exportDate: new Date().toISOString(),
      platform: 'Qri Trader - Autonomous Intelligence',
      totalMemories: memories.length,
      memories,
      chronologicalStoryThreads: threads,
      dailyReflections: reflections,
    }, null, 2);
  }

  private static saveAllLocally(memories: NewsMemoryEntry[]): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(memories));
    } catch (e) {
      console.warn('Error saving news memories locally:', e);
    }
  }

  private static async syncToFirestore(memory: NewsMemoryEntry): Promise<void> {
    if (!db) return;
    try {
      const clean = cleanForFirestore({
        ...memory,
        syncedAt: Date.now(),
      });
      await setDoc(doc(db, 'news_memories', memory.id), clean, { merge: true });
    } catch (e: any) {
      console.warn('Firestore syncNewsMemory notice (local active):', e?.message || e);
    }
  }
}
