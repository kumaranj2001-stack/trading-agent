import { NextRequest } from 'next/server';
import { realTimeNewsEngine } from '@/lib/newsEngine';
import { CurrencyPair, NewsArticle } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawSymbol = searchParams.get('symbol') || 'XAU/USD';
  const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // 1. Send initial connected payload with current verified headlines
      const initialHeadlines = realTimeNewsEngine.scrapeNewsForSymbol(symbol);
      const categoryWise = realTimeNewsEngine.getCategoryWiseArticles(symbol);
      const synthesis = realTimeNewsEngine.synthesizeSentiment(initialHeadlines);

      controller.enqueue(
        encoder.encode(
          `event: init\ndata: ${JSON.stringify({
            symbol,
            headlines: initialHeadlines,
            categoryWise,
            synthesis,
            timestamp: Date.now(),
          })}\n\n`
        )
      );

      // 2. Subscribe to new incoming verified articles from background ingestion
      const unsubscribe = realTimeNewsEngine.subscribe((newArticles: NewsArticle[]) => {
        try {
          controller.enqueue(
            encoder.encode(
              `event: articles\ndata: ${JSON.stringify({
                articles: newArticles,
                timestamp: Date.now(),
              })}\n\n`
            )
          );
        } catch (e) {
          // Stream might be closed
        }
      });

      // 3. Second-by-second true heartbeat & sync pulse (0ms artificial latency)
      const interval = setInterval(() => {
        try {
          const now = Date.now();
          controller.enqueue(
            encoder.encode(
              `event: pulse\ndata: ${JSON.stringify({
                time: now,
                timeStr: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                status: 'LIVE_SYNCHRONIZED',
              })}\n\n`
            )
          );
        } catch (e) {
          clearInterval(interval);
          unsubscribe();
          controller.close();
        }
      }, 1000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        unsubscribe();
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
