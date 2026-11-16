import { NextRequest } from 'next/server';
import { macroCalendarIngestionEngine } from '@/lib/macroCalendarIngestionEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const currency = searchParams.get('currency')?.toUpperCase();
  const impact = searchParams.get('impact')?.toUpperCase() as any;
  const rawSearch = searchParams.get('search') || '';
  const search = rawSearch.slice(0, 100).toLowerCase().trim();
  const todayOnly = searchParams.get('today') === 'true';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial SNAPSHOT of merged calendar
      try {
        const initial = macroCalendarIngestionEngine.getMergedCalendar({
          currency,
          impact: impact && impact !== 'ALL' ? impact : undefined,
          search,
          todayOnly,
        });

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'SNAPSHOT',
            events: initial.events,
            totalCount: initial.totalCount,
            highImpactCount: initial.highImpactCount,
            todayEventsCount: initial.todayEventsCount,
            currentTradingDate: macroCalendarIngestionEngine.getCurrentTradingDate(),
            telemetry: initial.telemetry,
            timestamp: Date.now(),
          })}\n\n`)
        );
      } catch (err) {
        console.error('Calendar SSE snapshot error:', err);
      }

      // 2. High-Frequency Real-Time Push Stream (Ticks every 1000ms for countdowns & live prints)
      const interval = setInterval(() => {
        try {
          const fresh = macroCalendarIngestionEngine.getMergedCalendar({
            currency,
            impact: impact && impact !== 'ALL' ? impact : undefined,
            search,
            todayOnly,
          });

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'TICK',
              events: fresh.events,
              totalCount: fresh.totalCount,
              highImpactCount: fresh.highImpactCount,
              todayEventsCount: fresh.todayEventsCount,
              currentTradingDate: macroCalendarIngestionEngine.getCurrentTradingDate(),
              telemetry: fresh.telemetry,
              timestamp: Date.now(),
            })}\n\n`)
          );
        } catch (err) {
          clearInterval(interval);
          try {
            controller.close();
          } catch {}
        }
      }, 1000);

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
