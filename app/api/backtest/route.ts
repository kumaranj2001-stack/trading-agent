import { NextRequest, NextResponse } from 'next/server';
import { CurrencyPair, RiskVerdict } from '@/lib/types';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';
import { BASE_PRICES, PIP_VALUES } from '@/lib/marketData';
import { RealMarketDataService } from '@/lib/realMarketDataService';

export const runtime = 'nodejs';

interface ScenarioResult {
  scenarioName: string;
  pair: CurrencyPair;
  action: 'BUY' | 'SELL' | 'NO_TRADE';
  riskVerdict: 'APPROVED' | 'MODIFIED' | 'VETOED';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pnlUsd: number;
  outcome: 'WIN' | 'LOSS' | 'SCRATCH';
  rationale: string;
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    const rawPair = typeof body?.pair === 'string' ? body.pair : 'EUR/USD';
    const pair: CurrencyPair = (rawPair in BASE_PRICES) ? (rawPair as CurrencyPair) : 'EUR/USD';

    // 1. Fetch real historical OHLCV candle series
    const { candles } = await RealMarketDataService.fetchRealLiveCandles(pair, '1h', 60);

    const isGold = pair === 'XAU/USD';
    const isJpy = pair.includes('JPY');
    const pipMultiplier = PIP_VALUES[pair] || (isGold ? 0.10 : isJpy ? 0.01 : 0.0001);
    const pipDollarPerLot = 10;

    const coordinator = new SwarmCoordinator();
    const results: ScenarioResult[] = [];
    let totalPnl = 0;
    let winCount = 0;
    let lossCount = 0;
    let vetoedCount = 0;
    let peakEquity = 100000;
    let currentEquity = 100000;
    let maxDrawdownUsd = 0;

    // 2. Walk-forward bar-by-bar historical replay across multiple market windows
    const windowStep = 6;
    const minHistory = 20;

    for (let i = minHistory; i < candles.length - 5; i += windowStep) {
      const historicalSlice = candles.slice(0, i);
      const evalCandle = candles[i];
      const futureCandles = candles.slice(i + 1, i + 6);

      const consensus = coordinator.runConsensus(pair, '1h', historicalSlice);
      const signal = consensus.executionSignal;
      const risk = consensus.agents.risk;

      const dateStr = new Date(evalCandle.time).toISOString().replace('T', ' ').slice(0, 16);
      const scenarioName = `Historical Window ${results.length + 1} (${dateStr} UTC - Bar #${i})`;

      if (!signal.authorized || signal.status === 'VETOED' || risk.verdict === 'VETOED') {
        vetoedCount++;
        results.push({
          scenarioName,
          pair,
          action: 'NO_TRADE',
          riskVerdict: 'VETOED',
          lots: 0,
          entryPrice: evalCandle.close,
          exitPrice: evalCandle.close,
          pnlUsd: 0,
          outcome: 'SCRATCH',
          rationale: signal.tierDescription || risk.reasoning || 'Hard Veto enforced: Sub-threshold confluence or gatekeeper breach.',
        });
        continue;
      }

      // Signal authorized: Replay execution across future candles
      const orderAction: 'BUY' | 'SELL' = signal.orderType === 'SELL_MARKET' ? 'SELL' : 'BUY';
      const entryPrice = signal.entry || evalCandle.close;
      const stopLoss = signal.stopLoss;
      const takeProfit = signal.takeProfit;
      const lots = Math.max(0.01, signal.lots || 0.1);

      let exitPrice = futureCandles[futureCandles.length - 1]?.close || entryPrice;
      let outcome: 'WIN' | 'LOSS' | 'SCRATCH' = 'SCRATCH';
      let tradeClosed = false;

      for (const bar of futureCandles) {
        if (orderAction === 'BUY') {
          if (bar.low <= stopLoss) {
            exitPrice = stopLoss;
            outcome = 'LOSS';
            tradeClosed = true;
            break;
          } else if (bar.high >= takeProfit) {
            exitPrice = takeProfit;
            outcome = 'WIN';
            tradeClosed = true;
            break;
          }
        } else {
          if (bar.high >= stopLoss) {
            exitPrice = stopLoss;
            outcome = 'LOSS';
            tradeClosed = true;
            break;
          } else if (bar.low <= takeProfit) {
            exitPrice = takeProfit;
            outcome = 'WIN';
            tradeClosed = true;
            break;
          }
        }
      }

      if (!tradeClosed) {
        // Exit at end of window
        const finalBar = futureCandles[futureCandles.length - 1] || evalCandle;
        exitPrice = finalBar.close;
        const diff = orderAction === 'BUY' ? (exitPrice - entryPrice) : (entryPrice - exitPrice);
        outcome = diff > 0.0001 ? 'WIN' : diff < -0.0001 ? 'LOSS' : 'SCRATCH';
      }

      const pipDelta = orderAction === 'BUY'
        ? (exitPrice - entryPrice) / pipMultiplier
        : (entryPrice - exitPrice) / pipMultiplier;

      const pnl = Number((pipDelta * pipDollarPerLot * lots).toFixed(2));
      totalPnl += pnl;
      currentEquity += pnl;

      if (currentEquity > peakEquity) peakEquity = currentEquity;
      const dd = peakEquity - currentEquity;
      if (dd > maxDrawdownUsd) maxDrawdownUsd = dd;

      if (outcome === 'WIN') winCount++;
      else if (outcome === 'LOSS') lossCount++;

      results.push({
        scenarioName,
        pair,
        action: orderAction,
        riskVerdict: risk.verdict as 'APPROVED' | 'MODIFIED' | 'VETOED',
        lots,
        entryPrice,
        exitPrice,
        pnlUsd: pnl,
        outcome,
        rationale: `Replay execution across OHLCV bars: ${orderAction} @ ${entryPrice}, SL ${stopLoss}, TP ${takeProfit}. Result: ${outcome} (${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)} USD).`,
      });
    }

    const executedCount = winCount + lossCount;
    const winRate = executedCount > 0 ? Number(((winCount / executedCount) * 100).toFixed(1)) : 0;
    const maxDrawdownPercent = Number(((maxDrawdownUsd / 100000) * 100).toFixed(2));
    const grossProfit = results.filter(r => r.pnlUsd > 0).reduce((acc, r) => acc + r.pnlUsd, 0);
    const grossLoss = Math.abs(results.filter(r => r.pnlUsd < 0).reduce((acc, r) => acc + r.pnlUsd, 0));
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : (grossProfit > 0 ? 4.5 : 1.0);

    return NextResponse.json({
      success: true,
      data: {
        targetPair: pair,
        summary: {
          totalScenarios: results.length,
          executedTrades: executedCount,
          vetoedTrades: vetoedCount,
          winCount,
          lossCount,
          winRatePercent: winRate,
          totalPnlUsd: Number(totalPnl.toFixed(2)),
          profitFactor,
          maxDrawdownPercent,
        },
        scenarios: results,
      },
    });
  } catch (error: any) {
    console.error('Backtest error:', error);
    return NextResponse.json(
      { success: false, error: 'Historical candle replay backtest failed' },
      { status: 500 }
    );
  }
}
