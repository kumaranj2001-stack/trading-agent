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
      // 1. Send initial full order flow snapshot
      const initialReport = orderFlowEngine.analyzeOrderFlow(symbol);
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'ORDER_FLOW_SNAPSHOT', payload: initialReport })}\n\n`)
      );

      // 2. High-frequency price action stream (every 220ms)
      const interval = setInterval(() => {
        try {
          const tick = orderFlowEngine.generateLiveStreamTick(symbol);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(tick)}\n\n`));
        } catch (e) {
          clearInterval(interval);
        }
      }, 220);

      // 3. Periodic full snapshot refresh (every 6 seconds)
      const snapshotInterval = setInterval(() => {
        try {
          const freshReport = orderFlowEngine.analyzeOrderFlow(symbol);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'ORDER_FLOW_SNAPSHOT', payload: freshReport })}\n\n`)
          );
        } catch (e) {
          clearInterval(snapshotInterval);
        }
      }, 6000);

      // Handle client disconnect / connection close
      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
        clearInterval(snapshotInterval);
        try {
          controller.close();
        } catch {
          // stream already closed
        }
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
