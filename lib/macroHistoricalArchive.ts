import { MacroHistoricalEvent, HistoricalMacroBaselineMetrics, MacroIndicator } from './types';

const HISTORICAL_STORAGE_KEY = 'qri_macro_30d_history_v2';
const HISTORICAL_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days

const isBrowser = typeof window !== 'undefined';

/**
 * 30-Day Seeded Historical Macro & Minor Economic Events Database
 * Comprehensive record of trailing 30 days of significant & minor global catalysts.
 */
function generateSeededHistorical30DayEvents(): MacroHistoricalEvent[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;

  // Curated 30-day baseline of institutional macroeconomic events
  const rawSeedList: Array<{
    daysAgo: number;
    name: string;
    region: string;
    category: MacroHistoricalEvent['category'];
    impact: 'HIGH' | 'MEDIUM' | 'LOW';
    actual: string;
    forecast: string;
    previous: string;
    surpriseDeviation: number;
    volatilityPips: number;
    utcTime: string;
    correlationAssets: string[];
    reaction: string;
  }> = [
    // 1-5: High Impact Rate & Inflation Catalysts
    {
      daysAgo: 2,
      name: 'US Spot Gold & Sovereign Bullion Vault Inflows',
      region: 'XAU',
      category: 'COMMODITIES_RESERVES',
      impact: 'HIGH',
      actual: '+38.4 Tons',
      forecast: '+22.0 Tons',
      previous: '+18.5 Tons',
      surpriseDeviation: +16.4,
      volatilityPips: 82,
      utcTime: '15:00:00',
      correlationAssets: ['XAU/USD', 'XAG/USD', 'DXY'],
      reaction: 'Spot Gold rallied $32/oz into multi-year highs as physical vault supply tightened.',
    },
    {
      daysAgo: 4,
      name: 'Fed FOMC Interest Rate Decision & Powell Presser',
      region: 'USD',
      category: 'CENTRAL_BANK',
      impact: 'HIGH',
      actual: '4.75%',
      forecast: '4.75%',
      previous: '5.00%',
      surpriseDeviation: 0.0,
      volatilityPips: 95,
      utcTime: '19:00:00',
      correlationAssets: ['EUR/USD', 'USD/JPY', 'XAU/USD', 'DXY'],
      reaction: '25bps rate cut met expectations; Powell balanced commentary contained bond yields.',
    },
    {
      daysAgo: 5,
      name: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
      region: 'USD',
      category: 'EMPLOYMENT',
      impact: 'HIGH',
      actual: '175K',
      forecast: '160K',
      previous: '223K',
      surpriseDeviation: +15,
      volatilityPips: 78,
      utcTime: '13:30:00',
      correlationAssets: ['EUR/USD', 'USD/JPY', 'GBP/USD', 'XAU/USD'],
      reaction: 'Modest upside beat supported US Dollar Index; 2-year yield rose 4 bps.',
    },
    {
      daysAgo: 6,
      name: 'Eurozone Harmonised CPI YoY Final',
      region: 'EUR',
      category: 'INFLATION',
      impact: 'HIGH',
      actual: '2.1%',
      forecast: '2.1%',
      previous: '2.2%',
      surpriseDeviation: 0.0,
      volatilityPips: 38,
      utcTime: '10:00:00',
      correlationAssets: ['EUR/USD', 'EUR/GBP', 'EUR/JPY'],
      reaction: 'Headline inflation confirmed cooling towards ECB 2.0% objective.',
    },
    {
      daysAgo: 8,
      name: 'Bank of Japan Policy Rate & Yield Curve Control',
      region: 'JPY',
      category: 'CENTRAL_BANK',
      impact: 'HIGH',
      actual: '0.25%',
      forecast: '0.25%',
      previous: '0.25%',
      surpriseDeviation: 0.0,
      volatilityPips: 88,
      utcTime: '03:30:00',
      correlationAssets: ['USD/JPY', 'EUR/JPY', 'GBP/JPY'],
      reaction: 'Governor Ueda hawkish guidance prompted tactical yen short squeeze.',
    },
    // 6-12: Medium Impact Events (PMIs, Inventories, Trade)
    {
      daysAgo: 9,
      name: 'OPEC+ Crude Production Quotas & JMMC Ministerial Meeting',
      region: 'WTI',
      category: 'COMMODITIES_RESERVES',
      impact: 'HIGH',
      actual: '-1.2M bpd',
      forecast: '-1.0M bpd',
      previous: '-1.0M bpd',
      surpriseDeviation: -0.2,
      volatilityPips: 64,
      utcTime: '11:00:00',
      correlationAssets: ['WTI_CRUDE', 'BRENT_CRUDE', 'CAD/USD'],
      reaction: 'Extended voluntary output curbs maintained structural support near $70/bbl.',
    },
    {
      daysAgo: 10,
      name: 'LBMA London Vault Gold & Silver Clearing Volumes',
      region: 'XAG',
      category: 'COMMODITIES_RESERVES',
      impact: 'MEDIUM',
      actual: '+14.2M oz',
      forecast: '+8.0M oz',
      previous: '+6.5M oz',
      surpriseDeviation: +6.2,
      volatilityPips: 44,
      utcTime: '14:00:00',
      correlationAssets: ['XAG/USD', 'XAU/USD'],
      reaction: 'Silver demand surge outpaced supply; spot silver advanced 1.8%.',
    },
    {
      daysAgo: 12,
      name: 'US Producer Price Index (PPI) Final Demand MoM',
      region: 'USD',
      category: 'INFLATION',
      impact: 'MEDIUM',
      actual: '0.2%',
      forecast: '0.2%',
      previous: '0.1%',
      surpriseDeviation: 0.0,
      volatilityPips: 26,
      utcTime: '13:30:00',
      correlationAssets: ['USD/JPY', 'EUR/USD'],
      reaction: 'Wholesale inflation steady; benign pipeline cost pressures confirmed.',
    },
    {
      daysAgo: 14,
      name: 'S&P Global Flash US Manufacturing PMI',
      region: 'USD',
      category: 'SURVEY',
      impact: 'MEDIUM',
      actual: '51.8',
      forecast: '51.2',
      previous: '50.7',
      surpriseDeviation: +0.6,
      volatilityPips: 32,
      utcTime: '14:45:00',
      correlationAssets: ['EUR/USD', 'USD/CAD'],
      reaction: 'US factory gauge held in expansion territory above 50.0 threshold.',
    },
    {
      daysAgo: 15,
      name: 'Germany Flash Manufacturing PMI (S&P Global)',
      region: 'EUR',
      category: 'SURVEY',
      impact: 'MEDIUM',
      actual: '43.2',
      forecast: '43.0',
      previous: '42.6',
      surpriseDeviation: +0.2,
      volatilityPips: 29,
      utcTime: '08:30:00',
      correlationAssets: ['EUR/USD', 'EUR/GBP'],
      reaction: 'German industrial contraction persistent, capping euro upside.',
    },
    {
      daysAgo: 17,
      name: 'India CPI Inflation Rate YoY',
      region: 'INR',
      category: 'INFLATION',
      impact: 'HIGH',
      actual: '4.85%',
      forecast: '5.10%',
      previous: '5.49%',
      surpriseDeviation: -0.25,
      volatilityPips: 42,
      utcTime: '12:00:00',
      correlationAssets: ['NIFTY 50', 'BANK NIFTY', 'USD/INR'],
      reaction: 'Favorable food inflation print bolstered domestic equity momentum.',
    },
    {
      daysAgo: 18,
      name: 'US Retail Sales Advance MoM',
      region: 'USD',
      category: 'GROWTH',
      impact: 'HIGH',
      actual: '0.4%',
      forecast: '0.3%',
      previous: '0.1%',
      surpriseDeviation: +0.1,
      volatilityPips: 45,
      utcTime: '13:30:00',
      correlationAssets: ['EUR/USD', 'USD/JPY'],
      reaction: 'Solid consumer retail spending affirmed resilient Q3 GDP growth.',
    },
    // 13-18: Minor & Low Impact Economic Catalysts
    {
      daysAgo: 19,
      name: 'US Wholesale Inventories MoM Final',
      region: 'USD',
      category: 'TRADE_BALANCE',
      impact: 'LOW',
      actual: '+0.1%',
      forecast: '+0.1%',
      previous: '+0.2%',
      surpriseDeviation: 0.0,
      volatilityPips: 12,
      utcTime: '15:00:00',
      correlationAssets: ['USD/CAD'],
      reaction: 'Negligible market reaction; inventory restocking in line with seasonal trends.',
    },
    {
      daysAgo: 21,
      name: 'University of Michigan Consumer Sentiment Final',
      region: 'USD',
      category: 'SURVEY',
      impact: 'LOW',
      actual: '70.5',
      forecast: '69.0',
      previous: '68.9',
      surpriseDeviation: +1.5,
      volatilityPips: 18,
      utcTime: '15:00:00',
      correlationAssets: ['EUR/USD', 'USD/JPY'],
      reaction: 'Consumer inflation expectations anchored near 2.7%; dollar steady.',
    },
    {
      daysAgo: 22,
      name: 'US Building Permits & Housing Starts MoM',
      region: 'USD',
      category: 'GROWTH',
      impact: 'LOW',
      actual: '1.42M',
      forecast: '1.40M',
      previous: '1.39M',
      surpriseDeviation: +0.02,
      volatilityPips: 15,
      utcTime: '13:30:00',
      correlationAssets: ['USD/JPY'],
      reaction: 'Residential construction steady despite elevated mortgage borrowing costs.',
    },
    {
      daysAgo: 24,
      name: 'US Initial Jobless Claims Weekly',
      region: 'USD',
      category: 'EMPLOYMENT',
      impact: 'MEDIUM',
      actual: '216K',
      forecast: '224K',
      previous: '228K',
      surpriseDeviation: -8,
      volatilityPips: 24,
      utcTime: '13:30:00',
      correlationAssets: ['EUR/USD', 'XAU/USD'],
      reaction: 'Continuing claims tight; minimal evidence of broad corporate layoffs.',
    },
    {
      daysAgo: 26,
      name: 'NY Fed Empire State Manufacturing Index',
      region: 'USD',
      category: 'SURVEY',
      impact: 'LOW',
      actual: '-11.9',
      forecast: '-4.0',
      previous: '+11.5',
      surpriseDeviation: -7.9,
      volatilityPips: 19,
      utcTime: '13:30:00',
      correlationAssets: ['EUR/USD'],
      reaction: 'Volatile regional index dipped into contraction; Treasury yields eased 2 bps.',
    },
    {
      daysAgo: 28,
      name: 'US Gross Domestic Product (GDP) Annualized Q2 Third Print',
      region: 'USD',
      category: 'GROWTH',
      impact: 'HIGH',
      actual: '3.0%',
      forecast: '3.0%',
      previous: '3.0%',
      surpriseDeviation: 0.0,
      volatilityPips: 52,
      utcTime: '13:30:00',
      correlationAssets: ['EUR/USD', 'USD/JPY', 'XAU/USD'],
      reaction: 'Robust economic expansion unrevised; soft landing trajectory supported.',
    },
  ];

  return rawSeedList.map((seed, idx) => {
    const eventTime = now - seed.daysAgo * dayMs;
    const dateObj = new Date(eventTime);
    const dateIso = dateObj.toISOString().slice(0, 10);

    const istFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const timeIST = `${istFormatter.format(dateObj)} IST`;

    return {
      id: `hist-event-${idx}-${dateIso}`,
      name: seed.name,
      region: seed.region,
      category: seed.category,
      impact: seed.impact,
      actual: seed.actual,
      forecast: seed.forecast,
      previous: seed.previous,
      surpriseDeviation: seed.surpriseDeviation,
      volatilityImpactPips: seed.volatilityPips,
      timestampIso: dateObj.toISOString(),
      timestampEpochMs: eventTime,
      date: dateIso,
      timeUTC: `${seed.utcTime.slice(0, 5)} UTC`,
      timeIST,
      correlationAssets: seed.correlationAssets,
      marketReactionSummary: seed.reaction,
    };
  });
}

/**
 * Dedicated Background Storage Architecture for 1-Month (30-Day) Historical Macro Events
 * 
 * Completely decoupled from the primary user interface to prevent visual clutter.
 * Automatically purges any records older than thirty days.
 * Calculates baseline metrics for upcoming volatility and trend tracking.
 */
export class MacroHistoricalArchiveManager {
  private static instance: MacroHistoricalArchiveManager;
  private archiveEvents: MacroHistoricalEvent[] = [];
  private lastAuditTimestamp: number = 0;

  private constructor() {
    this.initializeArchive();
  }

  public static getInstance(): MacroHistoricalArchiveManager {
    if (!MacroHistoricalArchiveManager.instance) {
      MacroHistoricalArchiveManager.instance = new MacroHistoricalArchiveManager();
    }
    return MacroHistoricalArchiveManager.instance;
  }

  /**
   * Initialize archive: loads from storage, purges > 30d, and seeds if empty
   */
  private initializeArchive(): void {
    if (isBrowser) {
      try {
        const stored = localStorage.getItem(HISTORICAL_STORAGE_KEY);
        if (stored) {
          const parsed: MacroHistoricalEvent[] = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            this.archiveEvents = this.purgeExpiredEvents(parsed);
          }
        }
      } catch (e) {
        console.warn('Failed to load historical macro archive from localStorage:', e);
      }
    }

    // If empty, seed default 30-day baseline
    if (this.archiveEvents.length === 0) {
      this.archiveEvents = generateSeededHistorical30DayEvents();
      this.saveToStorage();
    }

    this.lastAuditTimestamp = Date.now();
  }

  /**
   * Automatic 30-Day Purge Protocol
   * Strictly removes any event record with timestamp older than 30 calendar days.
   */
  public purgeExpiredEvents(events: MacroHistoricalEvent[]): MacroHistoricalEvent[] {
    const cutoff = Date.now() - HISTORICAL_TTL_MS;
    return events.filter(e => e.timestampEpochMs >= cutoff);
  }

  /**
   * Save current archive to persistent storage
   */
  private saveToStorage(): void {
    if (!isBrowser) return;
    try {
      // Always enforce 30-day purge prior to persistence
      const active = this.purgeExpiredEvents(this.archiveEvents);
      this.archiveEvents = active;
      localStorage.setItem(HISTORICAL_STORAGE_KEY, JSON.stringify(active));
    } catch (e) {
      console.warn('Failed to persist historical macro archive:', e);
    }
  }

  /**
   * Ingest a newly released economic event into the 30-day background backup
   */
  public recordReleasedEvent(indicator: MacroIndicator, volatilityPips: number = 35): MacroHistoricalEvent {
    const now = Date.now();
    const isIso = indicator.date?.includes('T');
    const dateStr = isIso ? indicator.date.slice(0, 10) : indicator.date || new Date().toISOString().slice(0, 10);

    const istFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    const timeIST = `${istFormatter.format(new Date(now))} IST`;

    let cat: MacroHistoricalEvent['category'] = 'GROWTH';
    const nameLower = indicator.name.toLowerCase();
    if (nameLower.includes('cpi') || nameLower.includes('inflation') || nameLower.includes('pce')) cat = 'INFLATION';
    else if (nameLower.includes('rate') || nameLower.includes('fomc') || nameLower.includes('ecb') || nameLower.includes('bank of')) cat = 'CENTRAL_BANK';
    else if (nameLower.includes('payroll') || nameLower.includes('nfp') || nameLower.includes('unemployment') || nameLower.includes('jobless')) cat = 'EMPLOYMENT';
    else if (nameLower.includes('gold') || nameLower.includes('bullion') || nameLower.includes('crude') || nameLower.includes('opec')) cat = 'COMMODITIES_RESERVES';
    else if (nameLower.includes('pmi') || nameLower.includes('sentiment')) cat = 'SURVEY';
    else if (nameLower.includes('trade') || nameLower.includes('inventory')) cat = 'TRADE_BALANCE';

    const newRecord: MacroHistoricalEvent = {
      id: `hist-auto-${now}`,
      name: indicator.name,
      region: indicator.region,
      category: cat,
      impact: indicator.impact || 'MEDIUM',
      actual: indicator.actual,
      forecast: indicator.forecast,
      previous: indicator.previous,
      surpriseDeviation: indicator.surpriseDeviation || 0,
      volatilityImpactPips: volatilityPips,
      timestampIso: new Date(now).toISOString(),
      timestampEpochMs: now,
      date: dateStr,
      timeUTC: indicator.timeUTC || '13:30 UTC',
      timeIST,
      correlationAssets: [indicator.region === 'USD' ? 'EUR/USD' : indicator.region === 'XAU' ? 'XAU/USD' : 'DXY'],
      marketReactionSummary: `Event printed ${indicator.actual} vs forecast ${indicator.forecast}. Market volatility registered ~${volatilityPips} pips.`,
    };

    // Prepend and purge
    this.archiveEvents = this.purgeExpiredEvents([newRecord, ...this.archiveEvents]);
    this.saveToStorage();
    return newRecord;
  }

  /**
   * Query the Decoupled Background 30-Day Historical Archive
   * Can be queried programmatically by background processes without cluttering primary UI.
   */
  public getHistoricalArchive(filter?: {
    region?: string;
    impact?: 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW';
    category?: string;
    search?: string;
  }): MacroHistoricalEvent[] {
    const now = Date.now();
    // Auto-purge any expired events
    let list = this.purgeExpiredEvents(this.archiveEvents);
    this.archiveEvents = list;

    if (filter?.region && filter.region !== 'ALL') {
      list = list.filter(e => e.region.toUpperCase() === filter.region!.toUpperCase());
    }

    if (filter?.impact && filter.impact !== 'ALL') {
      list = list.filter(e => e.impact === filter.impact);
    }

    if (filter?.category && filter.category !== 'ALL') {
      list = list.filter(e => e.category === filter.category);
    }

    if (filter?.search && filter.search.trim()) {
      const q = filter.search.toLowerCase().trim();
      list = list.filter(e => 
        e.name.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.marketReactionSummary?.toLowerCase().includes(q)
      );
    }

    return list.sort((a, b) => b.timestampEpochMs - a.timestampEpochMs);
  }

  /**
   * Derive Baseline Volatility Metrics for a Given Catalyst
   * Used to establish statistical volatility baselines before major prints.
   */
  public getHistoricalBaselineMetrics(eventName?: string): HistoricalMacroBaselineMetrics[] {
    const events = this.purgeExpiredEvents(this.archiveEvents);

    // Group by catalyst core name
    const grouped = new Map<string, MacroHistoricalEvent[]>();
    events.forEach(e => {
      // Normalize key
      const key = e.name.split('(')[0].trim();
      const existing = grouped.get(key) || [];
      existing.push(e);
      grouped.set(key, existing);
    });

    const metrics: HistoricalMacroBaselineMetrics[] = [];

    grouped.forEach((records, name) => {
      if (eventName && !name.toLowerCase().includes(eventName.toLowerCase())) return;

      const pipImpacts = records.map(r => r.volatilityImpactPips || 25);
      const avgPips = Math.round(pipImpacts.reduce((a, b) => a + b, 0) / (pipImpacts.length || 1));
      const maxPips = Math.max(...pipImpacts);

      const surprises = records.map(r => Math.abs(r.surpriseDeviation || 0));
      const avgSurprise = Number((surprises.reduce((a, b) => a + b, 0) / (surprises.length || 1)).toFixed(2));

      // Assets
      const assets = Array.from(new Set(records.flatMap(r => r.correlationAssets)));

      const riskRegime: HistoricalMacroBaselineMetrics['riskRegime'] = 
        avgPips >= 65 ? 'HIGH_VOLATILITY' : avgPips >= 35 ? 'MODERATE_VOLATILITY' : 'LOW_VOLATILITY';

      metrics.push({
        eventName: name,
        eventCount30Days: records.length,
        avgVolatilityImpactPips: avgPips,
        maxVolatilityImpactPips: maxPips,
        lastSurpriseDeviation: avgSurprise,
        historicalZScore: Number(((avgPips - 30) / 18).toFixed(2)),
        primaryCorrelatedAssets: assets.length > 0 ? assets : ['EUR/USD', 'XAU/USD'],
        riskRegime,
        lastUpdated: Date.now(),
      });
    });

    return metrics.sort((a, b) => b.avgVolatilityImpactPips - a.avgVolatilityImpactPips);
  }

  /**
   * Audit summary of the 30-day historical backup
   */
  public getArchiveAuditSummary(): {
    totalStoredEvents: number;
    highImpactCount: number;
    mediumImpactCount: number;
    lowImpactCount: number;
    trailingWindowDays: number;
    autoPurgedCount: number;
    oldestRecordDate: string;
    newestRecordDate: string;
  } {
    const active = this.purgeExpiredEvents(this.archiveEvents);
    const sorted = [...active].sort((a, b) => a.timestampEpochMs - b.timestampEpochMs);

    return {
      totalStoredEvents: active.length,
      highImpactCount: active.filter(e => e.impact === 'HIGH').length,
      mediumImpactCount: active.filter(e => e.impact === 'MEDIUM').length,
      lowImpactCount: active.filter(e => e.impact === 'LOW').length,
      trailingWindowDays: 30,
      autoPurgedCount: Math.max(0, this.archiveEvents.length - active.length),
      oldestRecordDate: sorted[0]?.date || '30 days ago',
      newestRecordDate: sorted[sorted.length - 1]?.date || 'Today',
    };
  }
}

export const macroHistoricalArchive = MacroHistoricalArchiveManager.getInstance();
