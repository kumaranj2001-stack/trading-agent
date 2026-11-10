import { NextRequest, NextResponse } from 'next/server';
import { MACRO_ECONOMIC_CALENDAR } from '@/lib/marketData';
import { MacroIndicator } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency')?.toUpperCase();
    const impact = searchParams.get('impact')?.toUpperCase();
    const rawSearch = searchParams.get('search') || '';
    const search = rawSearch.slice(0, 100).toLowerCase().trim();

    let events: MacroIndicator[] = [...MACRO_ECONOMIC_CALENDAR];

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
    const responseTime = new Date().toISOString();

    // Map each indicator to guarantee exact chronological timestamp metadata
    const enrichedEvents = events.map(evt => {
      const defaultTime = evt.time || '13:30 UTC';
      const eventTimestamp = evt.timestamp || `${evt.date}T${defaultTime.split(' ')[0]}:00.000Z`;
      
      // Calculate minutes until or since event
      const eventEpoch = new Date(eventTimestamp).getTime();
      const nowEpoch = Date.now();
      const diffMinutes = Math.round((eventEpoch - nowEpoch) / 60000);

      return {
        ...evt,
        time: defaultTime,
        timestamp: eventTimestamp,
        timezone: evt.timezone || 'UTC',
        timeRemainingMinutes: diffMinutes,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: enrichedEvents.length,
        highImpactCount,
        events: enrichedEvents,
        nextHighImpactEvent: enrichedEvents.find(e => e.impact === 'HIGH') || null,
        responseTime,
        serverClockUtc: new Date().toUTCString(),
        timestamp: responseTime,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch macroeconomic calendar' },
      { status: 500 }
    );
  }
}
