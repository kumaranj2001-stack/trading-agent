import { NextRequest, NextResponse } from 'next/server';
import { BASE_PRICES, CURRENCY_STRENGTH_INDEX, generateCandles, getActiveTradingSession, MACRO_ECONOMIC_CALENDAR } from '@/lib/marketData';
import { CurrencyPair, TimeFrame } from '@/lib/types';

export const runtime = 'nodejs';

const VALID_TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPair = searchParams.get('pair') || 'EUR/USD';
    const rawTimeframe = searchParams.get('timeframe') || '1h';
    const rawCount = searchParams.get('count') || '60';

    // 1. Sanitize & validate Pair
    const pair: CurrencyPair = (rawPair in BASE_PRICES) ? (rawPair as CurrencyPair) : 'EUR/USD';

    // 2. Sanitize & validate Timeframe
    const timeframe: TimeFrame = VALID_TIMEFRAMES.includes(rawTimeframe as TimeFrame) 
      ? (rawTimeframe as TimeFrame) 
      : '1h';

    // 3. Prevent DoS / Out-of-memory via bounded count
    const parsedCount = parseInt(rawCount, 10);
    const count = Number.isFinite(parsedCount) ? Math.min(Math.max(parsedCount, 10), 300) : 60;

    const candles = generateCandles(pair, timeframe, count);
    const session = getActiveTradingSession();

    // Rates with realistic simulated jitter
    const pairs = Object.keys(BASE_PRICES) as CurrencyPair[];
    const rates = pairs.map(p => {
      const base = BASE_PRICES[p];
      const jitter = (Math.random() - 0.49) * 0.0008 * base;
      const isJpy = p.includes('JPY');
      const isIndian = p === 'NIFTY 50' || p === 'BANK NIFTY' || p === 'RELIANCE' || p === 'TCS' || p === 'HDFC BANK' || p === 'INFY';
      const decimals = isIndian ? 2 : (isJpy || p.includes('/INR') ? 3 : 5);
      const price = Number((base + jitter).toFixed(decimals));
      const change24h = Number(((Math.random() - 0.48) * 0.8).toFixed(2));
      return {
        pair: p,
        price,
        change24h,
        high24h: Number((price * 1.003).toFixed(decimals)),
        low24h: Number((price * 0.997).toFixed(decimals)),
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
      { success: false, error: 'Failed to process market data' },
      { status: 500 }
    );
  }
}
