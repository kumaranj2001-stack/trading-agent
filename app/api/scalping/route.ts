import { NextRequest, NextResponse } from 'next/server';
import { scalpingEngine } from '@/lib/scalpingEngine';
import { ssotPriceSyncEngine } from '@/lib/ssotPriceSyncEngine';
import { CurrencyPair } from '@/lib/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minGrade = (searchParams.get('minGrade') as 'A+' | 'A' | 'B') || 'B';
    const maxDistancePips = searchParams.get('maxDistance') ? parseFloat(searchParams.get('maxDistance')!) : 3.0;
    const pairParam = (searchParams.get('pair') as CurrencyPair) || undefined;
    const livePriceParam = searchParams.get('livePrice') ? parseFloat(searchParams.get('livePrice')!) : undefined;
    const consensusDirParam = (searchParams.get('consensusDir') as 'BUY' | 'SELL') || undefined;
    const consensusConfParam = searchParams.get('consensusConf') ? parseFloat(searchParams.get('consensusConf')!) : undefined;

    const opportunities = scalpingEngine.pollScannerOpportunities({
      minGrade,
      maxDistancePips,
      activePair: pairParam,
      currentLivePrice: livePriceParam,
      consensusDirection: consensusDirParam,
      consensusConfidence: consensusConfParam,
    });

    const inFlight = scalpingEngine.getInFlightScalps();
    const invalidated = scalpingEngine.getInvalidatedSetups();
    const history = scalpingEngine.getTradeHistory();
    const circuitBreaker = scalpingEngine.getCircuitBreaker();
    const copyTraders = scalpingEngine.getCopyTraders();

    // Calculate aggregated cost analytics
    const totalGross = history.reduce((acc, t) => acc + t.grossPnlUsd, 0);
    const totalSpread = history.reduce((acc, t) => acc + t.spreadCostUsd, 0);
    const totalFees = history.reduce((acc, t) => acc + t.commissionFeeUsd, 0);
    const totalNet = history.reduce((acc, t) => acc + t.netPnlUsd, 0);
    const wins = history.filter(t => t.outcome === 'TP_HIT').length;
    const winRate = history.length > 0 ? Number(((wins / history.length) * 100).toFixed(1)) : 0;

    const canonicalLive = (pairParam && livePriceParam) 
      ? livePriceParam 
      : ssotPriceSyncEngine.getCanonicalPrice(pairParam || 'XAU/USD');

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
      data: {
        opportunities,
        inFlight,
        invalidated,
        history,
        circuitBreaker,
        copyTraders,
        ssotTelemetry: {
          canonicalPrice: canonicalLive,
          sequenceId: ssotPriceSyncEngine.getLatestSequenceId(),
          failSafeState: ssotPriceSyncEngine.getFailSafeState(),
          modulesTelemetry: ssotPriceSyncEngine.getModulesTelemetry(),
        },
        costAnalytics: {
          totalGrossUsd: Number(totalGross.toFixed(2)),
          totalSpreadCostUsd: Number(totalSpread.toFixed(2)),
          totalCommissionFeesUsd: Number(totalFees.toFixed(2)),
          totalNetPnlUsd: Number(totalNet.toFixed(2)),
          winRatePercent: winRate,
          totalTrades: history.length,
          avgDurationSec: 42,
          avgSlippagePips: 0.08,
        },
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Scalping polling failed' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'EXECUTE') {
      const { opportunityId } = body;
      const position = scalpingEngine.executeScalp(opportunityId);
      if (!position) {
        return NextResponse.json({
          success: false,
          error: 'Circuit breaker active, drawdown locked, or setup filtered out',
        }, { status: 400 });
      }
      return NextResponse.json({ success: true, position });
    }

    if (action === 'INVALIDATE') {
      const { opportunityId, category, reason } = body;
      scalpingEngine.invalidateSetup(opportunityId, category || 'MARKET_STRUCTURE_SHIFT', reason || 'Adverse micro tick structural breach');
      return NextResponse.json({ success: true });
    }

    if (action === 'BACKTEST') {
      const { config } = body;
      const result = scalpingEngine.runReplayBacktest({
        pair: config?.pair || 'XAU/USD',
        tpPips: config?.tpPips || 5.0,
        slPips: config?.slPips || 3.0,
        maxSpread: config?.maxSpread || 1.2,
        trailingTriggerPips: config?.trailingTriggerPips || 1.8,
        deltaThreshold: config?.deltaThreshold || 2.0,
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === 'TOGGLE_MIRROR') {
      const { traderId } = body;
      scalpingEngine.toggleCopyTraderMirror(traderId);
      return NextResponse.json({ success: true });
    }

    if (action === 'RESET_BREAKER') {
      scalpingEngine.resetCircuitBreaker();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Scalping execution failed' },
      { status: 500 }
    );
  }
}
