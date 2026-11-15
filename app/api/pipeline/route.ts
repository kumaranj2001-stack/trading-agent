import { NextRequest, NextResponse } from 'next/server';
import { sevenStagePipelineEngine } from '@/lib/sevenStagePipelineEngine';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPair = searchParams.get('pair') || searchParams.get('symbol') || 'XAU/USD';
    const pair: CurrencyPair = (rawPair in BASE_PRICES) ? (rawPair as CurrencyPair) : 'XAU/USD';
    const timeframe = (searchParams.get('timeframe') || '1h') as TimeFrame;

    const result = sevenStagePipelineEngine.executePipeline({
      pair,
      timeframe,
    });

    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute 7-stage sequential pipeline' },
      { status: 500 }
    );
  }
}
