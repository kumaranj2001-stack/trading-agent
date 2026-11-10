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

    let events: MacroIndicator[] = [...MACRO_ECONOMIC_CALENDAR].map(e => ({
      ...e,
      time: e.time || '18:30 IST',
      timeUtc: e.timeUtc || '13:00 UTC',
      exactTimestamp: e.exactTimestamp || `${e.date}T13:00:00.000Z`,
      timezone: e.timezone || 'IST (UTC+5:30)',
    }));

    if (currency && currency !== 'ALL') {
      events = events.filter(e => e.region.toUpperCase() === currency);
    }

    if (impact && impact !== 'ALL') {
      events = events.filter(e => e.impact.toUpperCase() === impact);
    }

    if (search.length > 0) {
      events = events.filter(e => 
        e.name.toLowerCase().includes(search) ||
        e.region.toLowerCase().includes(search)
      );
    }

    const highImpactCount = events.filter(e => e.impact === 'HIGH').length;
    const responseTimeMs = Math.max(1, Math.round(performance.now() - startTime));

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: events.length,
        highImpactCount,
        events,
        nextHighImpactEvent: events.find(e => e.impact === 'HIGH') || null,
        responseTimeMs,
        serverTimestamp: new Date().toISOString(),
        timezone: 'IST',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch macroeconomic calendar' },
      { status: 500 }
    );
  }
}
