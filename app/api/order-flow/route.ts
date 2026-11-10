import { NextRequest, NextResponse } from 'next/server';
import { orderFlowEngine } from '@/lib/orderFlowEngine';
import { CurrencyPair } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || 'XAU/USD';
    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';

    const report = orderFlowEngine.analyzeOrderFlow(symbol);

    return NextResponse.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze order flow' },
      { status: 500 }
    );
  }
}
