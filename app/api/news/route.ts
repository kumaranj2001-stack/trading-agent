import { NextRequest, NextResponse } from 'next/server';
import { realTimeNewsEngine } from '@/lib/newsEngine';
import { CurrencyPair } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || 'XAU/USD';
    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';

    // Ingest authentic live verified articles with strict timestamp validation
    const headlines = await realTimeNewsEngine.fetchLiveVerifiedNews(symbol);
    const synthesis = realTimeNewsEngine.synthesizeSentiment(headlines);
    const sources = realTimeNewsEngine.getMonitoredSources();

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        sourcesMonitoredCount: sources.length,
        sources,
        headlines,
        sentimentScore: synthesis.sentimentScore,
        marketMood: synthesis.marketMood,
        breakingAlert: synthesis.breakingAlert,
        topCatalysts: synthesis.topCatalysts,
        scrapedAt: new Date().toISOString(),
        verifiedCount: headlines.length,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'News wire scrape failed: ' + (error?.message || 'unknown error') },
      { status: 500 }
    );
  }
}
