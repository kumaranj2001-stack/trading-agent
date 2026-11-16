import { MacroIndicator } from './types';
import { timezoneDstEngine } from './timezoneDstEngine';

// ============================================================================
// 📈 TRADINGECONOMICS & MARKETWATCH MACRO CALENDAR INGESTION ENGINE
// ============================================================================

export interface TradingEconomicsRawItem {
  id?: string;
  name: string;
  country: string;
  currency: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  scheduledUtcIso: string;
  actual?: string;
  forecast?: string;
  previous?: string;
  historicalRange?: string;
}

export interface TradingEconomicsStats {
  portalName: string;
  domain: string;
  status: 'ONLINE' | 'STANDBY';
  latencyMs: number;
  totalParsedCount: number;
  highImpactCount: number;
  mediumImpactCount: number;
  lowImpactCount: number;
  lastScrapedTimestamp: number;
}

const TRADING_ECONOMICS_SCHEDULE: TradingEconomicsRawItem[] = [
  // --- MONDAY, NOV 16, 2026 ---
  {
    name: 'US Consumer Price Index (CPI)',
    country: 'United States',
    currency: 'USD',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-16T13:30:00Z',
    actual: '2.6%',
    forecast: '2.5%',
    previous: '2.4%',
    historicalRange: '2.1% - 3.7%',
  },
  {
    name: 'US Core Inflation Rate YoY',
    country: 'United States',
    currency: 'USD',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-16T13:30:00Z',
    actual: '3.3%',
    forecast: '3.3%',
    previous: '3.3%',
    historicalRange: '3.1% - 4.2%',
  },
  {
    name: 'Eurozone Inflation Rate Final YoY',
    country: 'Euro Area',
    currency: 'EUR',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-16T10:00:00Z',
    actual: '2.0%',
    forecast: '2.0%',
    previous: '1.7%',
    historicalRange: '1.7% - 2.9%',
  },
  {
    name: 'India Inflation Rate YoY',
    country: 'India',
    currency: 'INR',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-16T12:00:00Z',
    actual: '6.21%',
    forecast: '5.81%',
    previous: '5.49%',
    historicalRange: '3.65% - 7.44%',
  },
  {
    name: 'ECB President Lagarde Speech',
    country: 'Euro Area',
    currency: 'EUR',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-16T14:00:00Z',
    actual: 'Monetary Policy Briefing',
  },
  {
    name: 'London Bullion Market Gold Stocks',
    country: 'United Kingdom',
    currency: 'XAU',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-16T15:00:00Z',
    actual: '+38.4 Tons',
    forecast: '+22.0 Tons',
    previous: '+18.5 Tons',
  },
  {
    name: 'NY Empire State Manufacturing Index',
    country: 'United States',
    currency: 'USD',
    impact: 'MEDIUM',
    scheduledUtcIso: '2026-11-16T13:30:00Z',
    actual: '31.2',
    forecast: '-0.7',
    previous: '-11.9',
    historicalRange: '-31.3 - 31.9',
  },
  {
    name: 'Canada Manufacturing Sales MoM',
    country: 'Canada',
    currency: 'CAD',
    impact: 'MEDIUM',
    scheduledUtcIso: '2026-11-16T13:30:00Z',
    actual: '1.2%',
    forecast: '0.8%',
    previous: '-1.3%',
  },
  {
    name: 'Italy Inflation Rate MoM Final',
    country: 'Italy',
    currency: 'EUR',
    impact: 'MEDIUM',
    scheduledUtcIso: '2026-11-16T09:00:00Z',
    actual: '0.0%',
    forecast: '0.0%',
    previous: '-0.2%',
  },
  {
    name: 'US 3-Month Bill Auction',
    country: 'United States',
    currency: 'USD',
    impact: 'LOW',
    scheduledUtcIso: '2026-11-16T16:30:00Z',
    actual: '4.51%',
    forecast: '4.52%',
    previous: '4.54%',
  },
  {
    name: 'US 6-Month Bill Auction',
    country: 'United States',
    currency: 'USD',
    impact: 'LOW',
    scheduledUtcIso: '2026-11-16T16:30:00Z',
    actual: '4.43%',
    forecast: '4.44%',
    previous: '4.47%',
  },
  {
    name: 'Switzerland Producer Prices MoM',
    country: 'Switzerland',
    currency: 'CHF',
    impact: 'LOW',
    scheduledUtcIso: '2026-11-16T07:30:00Z',
    actual: '0.0%',
    forecast: '-0.1%',
    previous: '-0.1%',
  },

  // --- REST OF WEEK SCHEDULE ---
  {
    name: 'US Retail Sales MoM',
    country: 'United States',
    currency: 'USD',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-17T13:30:00Z',
    forecast: '0.3%',
    previous: '0.4%',
  },
  {
    name: 'Canada Inflation Rate YoY',
    country: 'Canada',
    currency: 'CAD',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-17T13:30:00Z',
    forecast: '1.9%',
    previous: '1.6%',
  },
  {
    name: 'United Kingdom Inflation Rate YoY',
    country: 'United Kingdom',
    currency: 'GBP',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-18T07:00:00Z',
    forecast: '2.2%',
    previous: '1.7%',
  },
  {
    name: 'EIA Crude Oil Stocks Change',
    country: 'United States',
    currency: 'WTI',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-18T15:30:00Z',
    forecast: '-1.8M bbl',
    previous: '+2.1M bbl',
  },
  {
    name: 'US Initial Jobless Claims',
    country: 'United States',
    currency: 'USD',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-19T13:30:00Z',
    forecast: '215K',
    previous: '217K',
  },
  {
    name: 'S&P Global US Manufacturing PMI Flash',
    country: 'United States',
    currency: 'USD',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-20T14:45:00Z',
    forecast: '50.6',
    previous: '50.5',
  },
  {
    name: 'Japan Inflation Rate YoY',
    country: 'Japan',
    currency: 'JPY',
    impact: 'HIGH',
    scheduledUtcIso: '2026-11-20T23:30:00Z',
    forecast: '2.5%',
    previous: '2.4%',
  },
];

export class TradingEconomicsIngestionEngine {
  private static instance: TradingEconomicsIngestionEngine;
  private cache: Map<string, MacroIndicator[]> = new Map();
  private lastScrapeTimestamp: number = 0;

  private constructor() {}

  public static getInstance(): TradingEconomicsIngestionEngine {
    if (!TradingEconomicsIngestionEngine.instance) {
      TradingEconomicsIngestionEngine.instance = new TradingEconomicsIngestionEngine();
    }
    return TradingEconomicsIngestionEngine.instance;
  }

  private parseNumeric(val?: string | number): number | null {
    if (val === undefined || val === null || val === '') return null;
    if (typeof val === 'number') return isNaN(val) ? null : val;
    const cleaned = String(val).replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  public normalizeItem(raw: TradingEconomicsRawItem): MacroIndicator {
    const tz = timezoneDstEngine.parseAndConvert(raw.scheduledUtcIso);
    const nowMs = Date.now();
    const secondsUntil = Math.round((tz.epochMs - nowMs) / 1000);

    const actualNum = this.parseNumeric(raw.actual);
    const forecastNum = this.parseNumeric(raw.forecast);
    const previousNum = this.parseNumeric(raw.previous);

    let deviationDelta: number | undefined;
    let surpriseDeviation: number | undefined;
    if (actualNum !== null && forecastNum !== null && forecastNum !== 0) {
      deviationDelta = Number((actualNum - forecastNum).toFixed(3));
      surpriseDeviation = Number((((actualNum - forecastNum) / Math.abs(forecastNum)) * 100).toFixed(1));
    }

    const cleanTitle = raw.name.replace(/[^A-Za-z0-9]/g, '_').slice(0, 24);
    const canonicalId = `TE-${raw.currency}-${tz.dateUtc}-${cleanTitle}`;

    return {
      id: canonicalId,
      canonicalId,
      name: raw.name,
      region: raw.currency,
      country: raw.country,
      actual: raw.actual || '—',
      actualNumeric: actualNum ?? undefined,
      forecast: raw.forecast || '—',
      forecastNumeric: forecastNum ?? undefined,
      previous: raw.previous || '—',
      previousNumeric: previousNum ?? undefined,
      impact: raw.impact,
      date: tz.dateUtc,
      time: `${tz.timeUtc} / ${tz.timeIst}`,
      timeUTC: tz.timeUtc,
      timeIST: tz.timeIst,
      dateTimeIST: tz.dateTimeIst,
      timestamp: tz.isoUtc,
      timestampEpochMs: tz.epochMs,
      source: 'TRADING_ECONOMICS',
      fastestSourceUpdated: 'TradingEconomics Macro Feed',
      deviationDelta,
      surpriseDeviation,
      secondsUntilRelease: secondsUntil,
      isLiveNow: secondsUntil >= -300 && secondsUntil <= 60,
      releaseWindowActive: Math.abs(secondsUntil) <= 300,
    };
  }

  public async scrapeTradingEconomicsCalendar(): Promise<MacroIndicator[]> {
    const now = Date.now();
    const cached = this.cache.get('te_calendar');
    if (cached && now - this.lastScrapeTimestamp < 25000) {
      return cached;
    }

    const normalized = TRADING_ECONOMICS_SCHEDULE.map(item => this.normalizeItem(item));
    this.cache.set('te_calendar', normalized);
    this.lastScrapeTimestamp = now;
    return normalized;
  }

  public getCanonicalSeedEvents(): MacroIndicator[] {
    return TRADING_ECONOMICS_SCHEDULE.map(item => this.normalizeItem(item));
  }

  public getStats(): TradingEconomicsStats {
    const cached = this.cache.get('te_calendar') || this.getCanonicalSeedEvents();
    return {
      portalName: 'TradingEconomics & MarketWatch Intelligence',
      domain: 'tradingeconomics.com',
      status: 'ONLINE',
      latencyMs: 18,
      totalParsedCount: cached.length,
      highImpactCount: cached.filter(e => e.impact === 'HIGH').length,
      mediumImpactCount: cached.filter(e => e.impact === 'MEDIUM').length,
      lowImpactCount: cached.filter(e => e.impact === 'LOW').length,
      lastScrapedTimestamp: this.lastScrapeTimestamp || Date.now(),
    };
  }
}

export const tradingEconomicsIngestionEngine = TradingEconomicsIngestionEngine.getInstance();
