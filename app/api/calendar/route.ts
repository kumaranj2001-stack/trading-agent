import { NextRequest, NextResponse } from 'next/server';
import { MACRO_ECONOMIC_CALENDAR } from '@/lib/marketData';
import { MacroIndicator } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency')?.toUpperCase();
    const impact = searchParams.get('impact')?.toUpperCase();
    const rawSearch = searchParams.get('search') || '';
    const search = rawSearch.slice(0, 100).toLowerCase().trim();

    let events: MacroIndicator[] = [...MACRO_ECONOMIC_CALENDAR].map(ev => {
      const nowMs = Date.now();
      const eventTimestamp = ev.timestamp || new Date(`${ev.date}T12:00:00Z`).getTime();
      const diffMs = eventTimestamp - nowMs;
      const timeRemainingMinutes = Math.round(diffMs / 60000);

      return {
        ...ev,
        timestamp: eventTimestamp,
        time: ev.time || '14:00 EST / 19:30 IST',
        timeIST: ev.timeIST || '19:30 IST',
        timeUTC: ev.timeUTC || '14:00 UTC',
        timeRemainingMinutes,
      };
    });

    if (currency && currency !== 'ALL') {
      events = events.filter(e => e.region.toUpperCase() === currency);
    }

    if (impact && impact !== 'ALL') {
      events = events.filter(e => e.impact.toUpperCase() === impact);
    }

    if (search.length > 0) {
      events = events.filter(e => 
        e.name.toLowerCase().includes(search) ||
        e.region.toLowerCase().includes(search) ||
        (e.time && e.time.toLowerCase().includes(search))
      );
    }

    // Chronological ordering (earliest/latest or imminent catalysts first)
    events.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));

    const highImpactCount = events.filter(e => e.impact === 'HIGH').length;
    const responseTimeMs = Math.max(1, Math.round(performance.now() - startTime));

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: events.length,
        highImpactCount,
        events,
        nextHighImpactEvent: events.find(e => e.impact === 'HIGH') || null,
        timestamp: new Date().toISOString(),
        responseTimeMs,
        timezoneStandard: 'IST (UTC+05:30) & UTC synchronized',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch macroeconomic calendar' },
      { status: 500 }
    );
  }
}
