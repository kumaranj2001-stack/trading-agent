import { NextRequest, NextResponse } from 'next/server';
import { orderFlowEngine } from '@/lib/orderFlowEngine';
import { CurrencyPair } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const startTime = performance.now();
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || searchParams.get('pair') || 'XAU/USD';
    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';

    const report = orderFlowEngine.analyzeOrderFlow(symbol);
    const responseTimeMs = Math.max(1, Math.round(performance.now() - startTime));

    return NextResponse.json({
      success: true,
      data: {
        ...report,
        responseTimeMs,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate order flow analysis' },
      { status: 500 }
    );
  }
}
