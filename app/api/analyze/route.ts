import { NextRequest, NextResponse } from 'next/server';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';
import { CurrencyPair, TimeFrame, Candle } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

const VALID_TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const { pair: rawPair, timeframe: rawTimeframe, riskConfig: rawRiskConfig, candles: rawCandles } = body;

    const pair: CurrencyPair = (typeof rawPair === 'string' && rawPair in BASE_PRICES) 
      ? (rawPair as CurrencyPair) 
      : 'EUR/USD';

    const timeframe: TimeFrame = (typeof rawTimeframe === 'string' && VALID_TIMEFRAMES.includes(rawTimeframe as TimeFrame))
      ? (rawTimeframe as TimeFrame)
      : '1h';

    // Sanitize risk config to prevent NaN or unexpected exploitation
    const riskConfig: any = {};
    if (rawRiskConfig && typeof rawRiskConfig === 'object') {
      if (typeof rawRiskConfig.accountBalance === 'number' && Number.isFinite(rawRiskConfig.accountBalance)) {
        riskConfig.accountBalance = Math.max(100, Math.min(rawRiskConfig.accountBalance, 10000000));
      }
      if (typeof rawRiskConfig.maxRiskPerTradePercent === 'number' && Number.isFinite(rawRiskConfig.maxRiskPerTradePercent)) {
        riskConfig.maxRiskPerTradePercent = Math.max(0.1, Math.min(rawRiskConfig.maxRiskPerTradePercent, 10));
      }
      if (typeof rawRiskConfig.maxDailyDrawdownPercent === 'number' && Number.isFinite(rawRiskConfig.maxDailyDrawdownPercent)) {
        riskConfig.maxDailyDrawdownPercent = Math.max(0.5, Math.min(rawRiskConfig.maxDailyDrawdownPercent, 20));
      }
      if (typeof rawRiskConfig.minRiskRewardRatio === 'number' && Number.isFinite(rawRiskConfig.minRiskRewardRatio)) {
        riskConfig.minRiskRewardRatio = Math.max(1.0, Math.min(rawRiskConfig.minRiskRewardRatio, 10));
      }
      if (typeof rawRiskConfig.maxLeverage === 'number' && Number.isFinite(rawRiskConfig.maxLeverage)) {
        riskConfig.maxLeverage = Math.max(1, Math.min(rawRiskConfig.maxLeverage, 500));
      }
    }

    // Sanitize candles: must be an array of at most 300 candles with valid numeric values
    let sanitizedCandles: Candle[] | undefined = undefined;
    if (Array.isArray(rawCandles) && rawCandles.length > 0) {
      sanitizedCandles = rawCandles.slice(0, 300).filter(c => 
        c && 
        typeof c.open === 'number' && Number.isFinite(c.open) &&
        typeof c.high === 'number' && Number.isFinite(c.high) &&
        typeof c.low === 'number' && Number.isFinite(c.low) &&
        typeof c.close === 'number' && Number.isFinite(c.close)
      );
    }

    const coordinator = new SwarmCoordinator(riskConfig);
    const result = coordinator.runConsensus(pair, timeframe, sanitizedCandles);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Swarm consensus execution failed' },
      { status: 500 }
    );
  }
}
