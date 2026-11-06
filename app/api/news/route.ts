import { NextRequest, NextResponse } from 'next/server';
import { realTimeNewsEngine, MONITORED_FINANCIAL_SOURCES } from '@/lib/newsEngine';
import { CurrencyPair } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || 'XAU/USD';
    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';

    const headlines = realTimeNewsEngine.scrapeNewsForSymbol(symbol);
    const synthesis = realTimeNewsEngine.synthesizeSentiment(headlines);
    const sources = MONITORED_FINANCIAL_SOURCES;

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
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'News wire scrape failed' },
      { status: 500 }
    );
  }
}
