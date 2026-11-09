import { NextRequest, NextResponse } from 'next/server';
import { realTimeNewsEngine } from '@/lib/newsEngine';
import { CurrencyPair } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || 'XAU/USD';
    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';

    // Trigger fresh ingestion if requested or on schedule
    const headlines = realTimeNewsEngine.scrapeNewsForSymbol(symbol);
    const categoryWise = realTimeNewsEngine.getCategoryWiseArticles(symbol);
    const synthesis = realTimeNewsEngine.synthesizeSentiment(headlines);
    const sources = realTimeNewsEngine.getMonitoredSources();

    const impactBreakdown = {
      critical: headlines.filter(h => h.impact === 'CRITICAL').length,
      high: headlines.filter(h => h.impact === 'HIGH').length,
      medium: headlines.filter(h => h.impact === 'MEDIUM').length,
      low: headlines.filter(h => h.impact === 'LOW').length,
      total: headlines.length,
    };

    return NextResponse.json({
      success: true,
      data: {
        symbol,
        sourcesMonitoredCount: sources.length,
        sources,
        headlines,
        categoryWise,
        impactBreakdown,
        sentimentScore: synthesis.sentimentScore,
        marketMood: synthesis.marketMood,
        breakingAlert: synthesis.breakingAlert,
        topCatalysts: synthesis.topCatalysts,
        scrapedAt: new Date().toISOString(),
        isLiveSynchronized: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'News wire scrape failed: ' + (error?.message || 'unknown error') },
      { status: 500 }
    );
  }
}
