import { NextRequest, NextResponse } from 'next/server';
import { aiMarketAnalysisEngine } from '@/lib/aiMarketAnalysisEngine';
import { CurrencyPair, TimeFrame, Candle, TechnicalIndicators, MarketSegment } from '@/lib/types';
import { generateCandles } from '@/lib/marketData';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      symbol = 'EUR/USD', 
      timeframe = '1h', 
      candles, 
      indicators, 
      segment 
    } = body as {
      symbol: CurrencyPair;
      timeframe: TimeFrame;
      candles?: Candle[];
      indicators?: TechnicalIndicators;
      segment?: MarketSegment;
    };

    // If candles are not supplied, generate high-fidelity simulated candles
    const resolvedCandles = (candles && candles.length > 0)
      ? candles
      : generateCandles(symbol, timeframe, 40);

    const result = aiMarketAnalysisEngine.analyzeMarket(
      symbol,
      timeframe,
      resolvedCandles,
      indicators,
      segment
    );

    return NextResponse.json({
      success: true,
      data: result,
      evaluatedRulesCount: result.totalKnowledgeRulesEvaluated,
      latencyMs: result.latencyMs,
    });
  } catch (error: any) {
    console.error('Error in AI Market Analysis API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to execute AI Market Analysis' },
      { status: 500 }
    );
  }
}
