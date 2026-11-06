import { NextRequest, NextResponse } from 'next/server';
import { CurrencyPair } from '@/lib/types';
import { browserNewsStorage, MONITORED_FINANCIAL_SOURCES, INITIAL_SCRAPED_HEADLINES } from '@/lib/newsStorage';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPair = searchParams.get('pair') || 'EUR/USD';
    const pair: CurrencyPair = (rawPair in BASE_PRICES) ? (rawPair as CurrencyPair) : 'EUR/USD';

    const sources = browserNewsStorage.getSources() || MONITORED_FINANCIAL_SOURCES;
    const articles = browserNewsStorage.getArticles(pair) || INITIAL_SCRAPED_HEADLINES;

    return NextResponse.json({
      success: true,
      data: {
        totalSources: sources.length,
        activeSources: sources.filter(s => s.enabled).length,
        sources,
        articlesCount: articles.length,
        articles,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve news intelligence' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Empty body is acceptable
    }

    const pair = (body.pair in BASE_PRICES) ? (body.pair as CurrencyPair) : 'EUR/USD';
    const scrapeResult = browserNewsStorage.runRealtimeScrape(pair);

    return NextResponse.json({
      success: true,
      data: {
        scrapeResult,
        sources: browserNewsStorage.getSources(),
        articles: browserNewsStorage.getArticles(pair),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'News scraping simulation failed' },
      { status: 500 }
    );
  }
}
