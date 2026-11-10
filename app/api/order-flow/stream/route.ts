import { NextRequest } from 'next/server';
import { orderFlowEngine } from '@/lib/orderFlowEngine';
import { CurrencyPair } from '@/lib/types';
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
      // 1. Send immediate verified snapshot (0ms latency)
      try {
        const initialReport = orderFlowEngine.analyzeOrderFlow(symbol);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({
            type: 'ORDER_FLOW_SNAPSHOT',
            payload: initialReport,
            timestamp: Date.now(),
          })}\n\n`)
        );
      } catch (err) {
        console.error('Order Flow SSE initial snapshot error:', err);
      }

      // 2. High-frequency live tick streaming (sub-second broadcast)
      const interval = setInterval(() => {
        try {
          const tick = orderFlowEngine.generateLiveStreamTick(symbol);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(tick)}\n\n`)
          );
        } catch (err) {
          clearInterval(interval);
          try {
            controller.close();
          } catch {}
        }
      }, 750);

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
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
