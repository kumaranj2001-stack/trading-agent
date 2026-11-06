import { NextRequest, NextResponse } from 'next/server';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';
import { CurrencyPair, TimeFrame } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pair = 'EUR/USD', timeframe = '1h', riskConfig = {}, candles } = body;

    const coordinator = new SwarmCoordinator(riskConfig);
    const result = coordinator.runConsensus(pair as CurrencyPair, timeframe as TimeFrame, candles);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Analysis failed' },
      { status: 500 }
    );
  }
}
