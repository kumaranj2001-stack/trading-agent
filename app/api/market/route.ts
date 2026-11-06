import { NextRequest, NextResponse } from 'next/server';
import { BASE_PRICES, CURRENCY_STRENGTH_INDEX, generateCandles, getActiveTradingSession, MACRO_ECONOMIC_CALENDAR } from '@/lib/marketData';
import { CurrencyPair, TimeFrame } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const pair = (searchParams.get('pair') || 'EUR/USD') as CurrencyPair;
    const timeframe = (searchParams.get('timeframe') || '1h') as TimeFrame;
    const count = parseInt(searchParams.get('count') || '60', 10);

    const candles = generateCandles(pair, timeframe, count);
    const session = getActiveTradingSession();

    // Rates with realistic simulated jitter
    const pairs = Object.keys(BASE_PRICES) as CurrencyPair[];
    const rates = pairs.map(p => {
      const base = BASE_PRICES[p];
      const jitter = (Math.random() - 0.49) * 0.0008 * base;
      const price = Number((base + jitter).toFixed(p.includes('JPY') ? 3 : 5));
      const change24h = Number(((Math.random() - 0.48) * 0.8).toFixed(2));
      return {
        pair: p,
        price,
        change24h,
        high24h: Number((price * 1.003).toFixed(p.includes('JPY') ? 3 : 5)),
        low24h: Number((price * 0.997).toFixed(p.includes('JPY') ? 3 : 5)),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        selectedPair: pair,
        timeframe,
        candles,
        rates,
        currencyStrength: CURRENCY_STRENGTH_INDEX,
        activeSession: session,
        calendar: MACRO_ECONOMIC_CALENDAR,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Market data fetch failed' },
      { status: 500 }
    );
  }
}
