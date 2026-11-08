import { NextRequest, NextResponse } from 'next/server';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';
import { CurrencyPair, TimeFrame, Candle } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';
import { RealMarketDataService } from '@/lib/realMarketDataService';

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

    // If client did not provide candles, ingest directly from RealMarketDataService SSOT
    if (!sanitizedCandles || sanitizedCandles.length === 0) {
      const real = await RealMarketDataService.fetchRealLiveCandles(pair, timeframe, 60);
      sanitizedCandles = real.candles;
    }

    const coordinator = new SwarmCoordinator(riskConfig);
    const result = coordinator.runConsensus(pair, timeframe, sanitizedCandles);

    // Strict Pre-Execution Guardrail: 500ms freshness and 0.05% price deviation tolerance
    const livePrice = result.currentPrice;
    const now = Date.now();
    const guardrailCheck = RealMarketDataService.validatePreExecutionGuardrail(
      livePrice,
      result.executionSignal.entry,
      now,
      0.05,
      500
    );

    return NextResponse.json({
      success: true,
      data: {
        ...result,
        parityGuardrail: {
          verified: guardrailCheck.valid,
          livePrice,
          freshnessLatencyMs: guardrailCheck.freshnessLatencyMs,
          maxTolerancePercent: 0.05,
          isWithinTolerance: guardrailCheck.isWithinTolerance,
          timestamp: now,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Swarm consensus execution failed' },
      { status: 500 }
    );
  }
}
