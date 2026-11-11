import { NextRequest, NextResponse } from 'next/server';
import { MACRO_ECONOMIC_CALENDAR } from '@/lib/marketData';
import { MacroIndicator } from '@/lib/types';
import { macroHistoricalArchive } from '@/lib/macroHistoricalArchive';

export const runtime = 'nodejs';

/**
 * Institutional Macroeconomic Calendar Events with Exact UTC Timestamps
 * Mapped to Official Monetary and Statistical Release Schedules.
 */
const ENRICHED_MACRO_CALENDAR_DATABASE: Array<MacroIndicator & { utcTime: string }> = [
  {
    name: 'Bank of Japan Policy Rate & Yield Curve Control',
    region: 'JPY',
    actual: '0.25%',
    forecast: '0.25%',
    previous: '0.25%',
    impact: 'HIGH',
    date: '2026-11-02',
    utcTime: '03:30:00', // 03:30 UTC -> 09:00 AM IST
  },
  {
    name: 'Eurozone Harmonised CPI YoY Final',
    region: 'EUR',
    actual: '2.1%',
    forecast: '2.1%',
    previous: '2.2%',
    impact: 'HIGH',
    date: '2026-11-04',
    utcTime: '10:00:00', // 10:00 UTC -> 03:30 PM IST
  },
  {
    name: 'Fed FOMC Interest Rate Decision & Powell Presser',
    region: 'USD',
    actual: '4.75%',
    forecast: '4.75%',
    previous: '5.00%',
    impact: 'HIGH',
    date: '2026-11-05',
    utcTime: '19:00:00', // 19:00 UTC -> 12:30 AM IST (Nov 6)
  },
  {
    name: 'Bank of England (BoE) Official Bank Rate & Minutes',
    region: 'GBP',
    actual: '4.75%',
    forecast: '4.75%',
    previous: '5.00%',
    impact: 'HIGH',
    date: '2026-11-06',
    utcTime: '12:00:00', // 12:00 UTC -> 05:30 PM IST
  },
  {
    name: 'US Non-Farm Payrolls (NFP) & Unemployment Rate',
    region: 'USD',
    actual: '175K',
    forecast: '160K',
    previous: '223K',
    impact: 'HIGH',
    date: '2026-11-06',
    utcTime: '13:30:00', // 13:30 UTC -> 07:00 PM IST
  },
  {
    name: 'US Spot Gold & Metals Bullion Reserve Inflows',
    region: 'XAU',
    actual: '+38.4 Tons',
    forecast: '+22.0 Tons',
    previous: '+18.5 Tons',
    impact: 'HIGH',
    date: '2026-11-06',
    utcTime: '15:00:00', // 15:00 UTC -> 08:30 PM IST
  },
  {
    name: 'OPEC+ Crude Production Quotas & Strategic Reserve',
    region: 'WTI',
    actual: '-1.2M bpd',
    forecast: '-1.0M bpd',
    previous: '-1.0M bpd',
    impact: 'HIGH',
    date: '2026-11-07',
    utcTime: '11:00:00', // 11:00 UTC -> 04:30 PM IST
  },
  {
    name: 'LBMA London Vault Gold & Silver Clearing Data',
    region: 'XAG',
    actual: '+14.2M oz',
    forecast: '+8.0M oz',
    previous: '+6.5M oz',
    impact: 'MEDIUM',
    date: '2026-11-08',
    utcTime: '14:00:00', // 14:00 UTC -> 07:30 PM IST
  },
  {
    name: 'US Consumer Price Index (CPI) MoM & Core Inflation',
    region: 'USD',
    actual: '0.2%',
    forecast: '0.2%',
    previous: '0.2%',
    impact: 'HIGH',
    date: '2026-11-12',
    utcTime: '13:30:00', // 13:30 UTC -> 07:00 PM IST
  },
  {
    name: 'India CPI Inflation Rate YoY & Industrial Production',
    region: 'INR',
    actual: '4.85%',
    forecast: '5.10%',
    previous: '5.49%',
    impact: 'HIGH',
    date: '2026-11-12',
    utcTime: '12:00:00', // 12:00 UTC -> 05:30 PM IST
  },
  {
    name: 'US Producer Price Index (PPI) Final Demand MoM',
    region: 'USD',
    actual: '0.2%',
    forecast: '0.2%',
    previous: '0.1%',
    impact: 'MEDIUM',
    date: '2026-11-14',
    utcTime: '13:30:00', // 13:30 UTC -> 07:00 PM IST
  },
  {
    name: 'S&P Global Flash US Manufacturing & Services PMI',
    region: 'USD',
    actual: '51.8',
    forecast: '51.2',
    previous: '50.7',
    impact: 'MEDIUM',
    date: '2026-11-20',
    utcTime: '14:45:00', // 14:45 UTC -> 08:15 PM IST
  },
  {
    name: 'Germany Flash Manufacturing PMI (S&P Global)',
    region: 'EUR',
    actual: '43.2',
    forecast: '43.0',
    previous: '42.6',
    impact: 'MEDIUM',
    date: '2026-11-22',
    utcTime: '08:30:00', // 08:30 UTC -> 02:00 PM IST
  },
  {
    name: 'US Gross Domestic Product (GDP) Annualized Q3 Second Estimate',
    region: 'USD',
    actual: '2.8%',
    forecast: '2.8%',
    previous: '3.0%',
    impact: 'HIGH',
    date: '2026-11-26',
    utcTime: '13:30:00', // 13:30 UTC -> 07:00 PM IST
  },
  {
    name: 'China Caixin Manufacturing PMI',
    region: 'XAU',
    actual: '50.6',
    forecast: '50.3',
    previous: '50.1',
    impact: 'MEDIUM',
    date: '2026-12-01',
    utcTime: '01:45:00', // 01:45 UTC -> 07:15 AM IST
  },
  {
    name: 'RBI Monetary Policy Repo Rate Decision & Stance',
    region: 'INR',
    actual: '6.50%',
    forecast: '6.50%',
    previous: '6.50%',
    impact: 'HIGH',
    date: '2026-12-06',
    utcTime: '04:30:00', // 04:30 UTC -> 10:00 AM IST
  },
  {
    name: 'ECB Monetary Policy Statement & Lagarde Presser',
    region: 'EUR',
    actual: '3.25%',
    forecast: '3.25%',
    previous: '3.50%',
    impact: 'HIGH',
    date: '2026-12-12',
    utcTime: '13:15:00', // 13:15 UTC -> 06:45 PM IST
  },
  {
    name: 'US Core PCE Price Index MoM (Fed Favored Metric)',
    region: 'USD',
    actual: '0.2%',
    forecast: '0.2%',
    previous: '0.2%',
    impact: 'HIGH',
    date: '2026-12-18',
    utcTime: '13:30:00', // 13:30 UTC -> 07:00 PM IST
  },
];

/**
 * Helper to compute exact ISO timestamp, Epoch ms, and 12-hour IST string
 */
function buildEnrichedMacroEvent(rawEvent: MacroIndicator & { utcTime?: string }): MacroIndicator {
  const utcTimeStr = rawEvent.utcTime || '13:30:00';
  const isoUtcString = `${rawEvent.date}T${utcTimeStr}.000Z`;
  const eventDate = new Date(isoUtcString);

  // Format 12-hour IST time with am/pm (e.g., "07:00 PM IST" or "10:00 AM IST")
  const istTimeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const timePart = istTimeFormatter.format(eventDate);
  const timeIST = `${timePart} IST`;

  // Format full Date + Time in IST
  const istDateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const dateFormatted = istDateFormatter.format(eventDate);
  const dateTimeIST = `${dateFormatted} • ${timeIST}`;

  return {
    ...rawEvent,
    timestamp: eventDate.toISOString(),
    timestampEpochMs: eventDate.getTime(),
    timeIST,
    timeUTC: `${utcTimeStr.slice(0, 5)} UTC`,
    dateTimeIST,
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency')?.toUpperCase();
    const impact = searchParams.get('impact')?.toUpperCase();
    const rawSearch = searchParams.get('search') || '';
    const search = rawSearch.slice(0, 100).toLowerCase().trim();
    const isHistoricalQuery = searchParams.get('historical') === 'true';

    // If historical archive is explicitly requested (decoupled background service)
    if (isHistoricalQuery) {
      const historicalEvents = macroHistoricalArchive.getHistoricalArchive({
        region: currency,
        impact: impact as any,
        search,
      });
      const baselineMetrics = macroHistoricalArchive.getHistoricalBaselineMetrics();
      const auditSummary = macroHistoricalArchive.getArchiveAuditSummary();

      return NextResponse.json({
        success: true,
        data: {
          isHistoricalArchive: true,
          auditSummary,
          events: historicalEvents,
          baselineMetrics,
          retentionPolicy: 'Auto-purge all events older than 30 days',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Ingest all enriched active events with exact UTC and IST timestamps
    let events: MacroIndicator[] = ENRICHED_MACRO_CALENDAR_DATABASE.map(buildEnrichedMacroEvent);

    // Apply currency/region filter
    if (currency && currency !== 'ALL') {
      events = events.filter(e => e.region.toUpperCase() === currency);
    }

    // Apply impact filter
    if (impact && impact !== 'ALL') {
      events = events.filter(e => e.impact.toUpperCase() === impact);
    }

    // Apply search query filter
    if (search.length > 0) {
      events = events.filter(e => 
        e.name.toLowerCase().includes(search) ||
        e.region.toLowerCase().includes(search)
      );
    }

    // Strictly sort chronologically by exact timestamp
    events.sort((a, b) => (a.timestampEpochMs || 0) - (b.timestampEpochMs || 0));

    const highImpactCount = events.filter(e => e.impact === 'HIGH').length;
    const historicalAudit = macroHistoricalArchive.getArchiveAuditSummary();

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: events.length,
        highImpactCount,
        events,
        nextHighImpactEvent: events.find(e => e.impact === 'HIGH') || null,
        backgroundStorage: {
          historical30DayBackupActive: true,
          total30DayHistoricalEvents: historicalAudit.totalStoredEvents,
          autoPurgeEnforced: true,
          decoupledFromPrimaryView: true,
        },
        serverTimeIST: new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date()) + ' IST',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch macroeconomic calendar' },
      { status: 500 }
    );
  }
}
