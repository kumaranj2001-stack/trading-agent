import { NextRequest } from 'next/server';
import { realTimeNewsEngine } from '@/lib/newsEngine';
import { CurrencyPair } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSymbol = searchParams.get('symbol') || 'XAU/USD';
  const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';
  const impactSort = (searchParams.get('impactSort') || 'ALL') as 'ALL' | 'LOW_TO_HIGH' | 'HIGH_TO_LOW';
  const category = searchParams.get('category') || 'ALL';
  const impact = searchParams.get('impact') || 'ALL';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Immediate initial verified snapshot (0ms latency)
      try {
        const initialArticles = realTimeNewsEngine.scrapeNewsForSymbol(symbol, impactSort, category, impact);
        const initialSynthesis = realTimeNewsEngine.synthesizeSentiment(initialArticles);
        const sources = realTimeNewsEngine.getMonitoredSources();

        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'SNAPSHOT',
            articles: initialArticles,
            synthesis: initialSynthesis,
            sources,
            timestamp: Date.now(),
          })}\n\n`)
        );
      } catch (err) {
        console.error('SSE initial snapshot error:', err);
      }

      // 2. Continuous Second-by-Second Real-Time Push Stream
      const interval = setInterval(() => {
        try {
          const tick = realTimeNewsEngine.generateLiveWireTick(symbol);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({
              type: 'TICK',
              article: tick,
              timestamp: Date.now(),
            })}\n\n`)
          );
        } catch (err) {
          clearInterval(interval);
          try {
            controller.close();
          } catch {}
        }
      }, 1500);

      // Handle client disconnect
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
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
