import { NextRequest, NextResponse } from 'next/server';
import { realTimeNewsEngine, MONITORED_FINANCIAL_SOURCES } from '@/lib/newsEngine';
import { NewsMemoryStorage } from '@/lib/newsMemoryStorage';
import { CurrencyPair } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || 'XAU/USD';
    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';

    // Populate all 18 sources actively
    const headlines = realTimeNewsEngine.scrapeNewsForSymbol(symbol);
    const synthesis = realTimeNewsEngine.synthesizeSentiment(headlines);
    const sources = MONITORED_FINANCIAL_SOURCES;
    const dailyReflections = NewsMemoryStorage.generateDailyReflections();
    const chronologicalThreads = NewsMemoryStorage.getChronologicalStoryThreads();

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
        dailyReflections,
        chronologicalThreads,
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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symbol: CurrencyPair = (body.symbol in BASE_PRICES) ? body.symbol : 'XAU/USD';
    
    // Generate a fresh live second-by-second event
    const liveArticle = realTimeNewsEngine.generateLiveSecondBySecondEvent(symbol);
    const recordedMemory = NewsMemoryStorage.recordMemory(liveArticle);

    return NextResponse.json({
      success: true,
      data: {
        liveArticle,
        recordedMemory,
        emittedAt: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to process news event' },
      { status: 500 }
    );
  }
}
