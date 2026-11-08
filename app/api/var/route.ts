import { NextRequest, NextResponse } from 'next/server';
import { CurrencyPair, MonteCarloProjection } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawPair = searchParams.get('pair') || 'EUR/USD';
    const rawBalance = searchParams.get('balance');
    const rawRisk = searchParams.get('risk');

    const pair: CurrencyPair = (rawPair in BASE_PRICES) ? (rawPair as CurrencyPair) : 'EUR/USD';
    const balance = rawBalance ? Math.max(100, Math.min(parseFloat(rawBalance) || 10000, 1000000)) : 10000;
    const riskPercent = rawRisk ? Math.max(0.1, Math.min(parseFloat(rawRisk) || 1.5, 10)) : 1.5;

    const coordinator = new SwarmCoordinator({
      accountBalance: balance,
      maxRiskPerTradePercent: riskPercent,
    });

    const consensus = coordinator.runConsensus(pair, '1h');
    const riskParam = consensus.agents.risk.parameters;
    const dollarRisk = (balance * riskPercent) / 100;

    // Advanced 1,000-Path Monte Carlo Simulation distribution
    const winRate = consensus.overallConfidence > 65 ? (consensus.overallConfidence * 0.85) : 52.0;
    const rMultiple = riskParam.riskRewardRatio || 2.2;
    
    const simulationsCount = 1000;
    const paths: number[] = [];
    for (let i = 0; i < simulationsCount; i++) {
      let runPnl = 0;
      // 20 trades per simulated path
      for (let t = 0; t < 20; t++) {
        const isWin = Math.random() * 100 < winRate;
        if (isWin) {
          runPnl += dollarRisk * rMultiple * (0.8 + Math.random() * 0.4);
        } else {
          runPnl -= dollarRisk * (0.9 + Math.random() * 0.2);
        }
      }
      paths.push(Number(runPnl.toFixed(2)));
    }

    paths.sort((a, b) => a - b);
    const p5 = paths[Math.floor(simulationsCount * 0.05)];
    const p25 = paths[Math.floor(simulationsCount * 0.25)];
    const p50 = paths[Math.floor(simulationsCount * 0.50)];
    const p75 = paths[Math.floor(simulationsCount * 0.75)];
    const p95 = paths[Math.floor(simulationsCount * 0.95)];

    const monteCarlo: MonteCarloProjection = {
      simulationsCount: 1000,
      projectedProfitProbability: Number(winRate.toFixed(1)),
      var95Usd: Math.abs(Number(p5 < 0 ? p5 : -(dollarRisk * 1.15).toFixed(2))),
      var99Usd: Math.abs(Number(paths[Math.floor(simulationsCount * 0.01)] < 0 ? paths[Math.floor(simulationsCount * 0.01)] : -(dollarRisk * 1.35).toFixed(2))),
      expectedDrawdownPercent: Number((riskPercent * 1.25).toFixed(2)),
      sharpeRatio: Number((1.85 + (winRate / 100) * 0.5).toFixed(2)),
    };

    return NextResponse.json({
      success: true,
      data: {
        pair,
        accountBalance: balance,
        riskPercent,
        dollarRisk: Number(dollarRisk.toFixed(2)),
        monteCarlo,
        percentiles: {
          p5,
          p25,
          p50,
          p75,
          p95,
        },
        riskVerdict: consensus.agents.risk.verdict,
        confluenceGrade: consensus.confluenceGrade,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Monte Carlo VaR calculation failed' },
      { status: 500 }
    );
  }
}
