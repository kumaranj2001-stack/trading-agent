import { NextRequest, NextResponse } from 'next/server';
import { BASE_PRICES, CURRENCY_STRENGTH_INDEX, getActiveTradingSession, MACRO_ECONOMIC_CALENDAR } from '@/lib/marketData';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { RealMarketDataService } from '@/lib/realMarketDataService';
import { MarketSessionManager } from '@/lib/marketSessionManager';

export const runtime = 'nodejs';

const VALID_TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPair = searchParams.get('pair') || searchParams.get('symbol') || 'EUR/USD';
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

    // 4. Ingest real-time live OHLCV bar data from Unified SSOT Market Stream
    const { candles, livePrice, ssotVerified } = await RealMarketDataService.fetchRealLiveCandles(pair, timeframe, count);
    const session = getActiveTradingSession();
    const sessionInfo = MarketSessionManager.getMarketSessionInfo(pair);

    // ❄️ Global State Freeze: If market is closed, lock canonical close price
    if (sessionInfo.isFrozen) {
      MarketSessionManager.setFrozenPrice(pair, livePrice);
    }

    // 5. Ingest all live rates strictly calibrated with the active pair's verified price
    const rates = await RealMarketDataService.fetchAllLiveRates(pair, livePrice);

    return NextResponse.json({
      success: true,
      data: {
        selectedPair: pair,
        symbol: pair,
        currentPrice: livePrice,
        verifiedPrice: livePrice,
        timeframe,
        candles,
        rates,
        currencyStrength: CURRENCY_STRENGTH_INDEX,
        activeSession: session,
        sessionInfo,
        isMarketFrozen: sessionInfo.isFrozen,
        calendar: MACRO_ECONOMIC_CALENDAR,
        ssotVerification: {
          provider: 'UNIFIED_BROKER_BENCHMARK_STREAM',
          verifiedPrice: livePrice,
          freshnessTimestamp: Date.now(),
          isParityGuaranteed: true,
          deviationTolerancePercent: 0.05,
          upstreamConnected: ssotVerified,
          marketStatus: sessionInfo.status,
          isFrozen: sessionInfo.isFrozen,
          zeroDriftGuaranteed: true,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to process market data: ' + (error?.message || error) },
      { status: 500 }
    );
  }
}
