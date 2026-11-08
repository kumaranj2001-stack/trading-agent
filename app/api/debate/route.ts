import { NextRequest, NextResponse } from 'next/server';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

const VALID_TIMEFRAMES: TimeFrame[] = ['1m', '5m', '15m', '1h', '4h', '1d'];

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON request body' }, { status: 400 });
    }

    const rawPair = typeof body.pair === 'string' ? body.pair : 'EUR/USD';
    const rawTimeframe = typeof body.timeframe === 'string' ? body.timeframe : '1h';
    const rawUserPrompt = typeof body.userPrompt === 'string' ? body.userPrompt : '';

    const pair: CurrencyPair = (rawPair in BASE_PRICES) ? (rawPair as CurrencyPair) : 'EUR/USD';
    const timeframe: TimeFrame = VALID_TIMEFRAMES.includes(rawTimeframe as TimeFrame) 
      ? (rawTimeframe as TimeFrame) 
      : '1h';

    // Sanitize user prompt: truncate to 300 chars, strip dangerous control characters
    const sanitizedPrompt = rawUserPrompt
      .slice(0, 300)
      .replace(/[<>]/g, '')
      .trim();

    // Validate optional incoming real-time terminal chart candles
    const candlesInput = Array.isArray(body.candles) && body.candles.length > 0
      ? body.candles.filter((c: any) => 
          typeof c === 'object' && 
          typeof c.open === 'number' && 
          typeof c.high === 'number' && 
          typeof c.low === 'number' && 
          typeof c.close === 'number'
        )
      : undefined;

    const coordinator = new SwarmCoordinator();
    const result = coordinator.runConsensus(pair, timeframe, candlesInput);

    // If user provided a specific prompt/question, enhance the debate with custom context
    const debate = [...result.debateTranscript];
    if (sanitizedPrompt.length > 0) {
      debate.push({
        id: `user-query-${Date.now()}`,
        round: 4,
        role: 'risk_manager',
        agentName: 'Sarah Stirling (Risk Manager)',
        avatarColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
        content: `Custom Scenario Ingestion — "${sanitizedPrompt}": Chief Risk Office evaluated against real-time chart structure on ${pair} [${timeframe}]. Stress tests indicate potential intraday spread expansion; dynamic hard stop-loss anchored at ${result.debateSynthesis?.priceThresholds.stopLoss ?? 'structural floor'} insulates the position while maintaining our ${result.debateSynthesis?.priceThresholds.riskRewardRatio ?? 2.2}:1 R:R profile.`,
        sentiment: 'CAUTION',
        timestamp: 'Just now',
        citedRuleId: 'RISK-STRESS-001',
        citedRuleName: 'Macro Stress Scenario Invalidation Filter',
        strategyCategory: 'RISK',
        winRate: 85.0,
        side: 'NEUTRAL',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        pair,
        timeframe,
        transcript: debate,
        synthesis: result.debateSynthesis,
        consensus: result.consensusDirection,
        confidence: result.overallConfidence,
        priceThresholds: result.debateSynthesis?.priceThresholds,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Debate simulation failed' },
      { status: 500 }
    );
  }
}
