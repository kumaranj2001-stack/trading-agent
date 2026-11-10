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

    // Check for scenario reset directive
    const resetScenario = Boolean(body.resetScenario);
    const rawScenario = resetScenario ? undefined : (body.scenario ?? body.userPrompt ?? undefined);

    // Sanitize scenario input: string prompt or structured context object
    let scenarioInput: any = undefined;
    if (typeof rawScenario === 'string' && rawScenario.trim().length > 0) {
      scenarioInput = rawScenario.slice(0, 300).replace(/[<>]/g, '').trim();
    } else if (typeof rawScenario === 'object' && rawScenario !== null) {
      scenarioInput = rawScenario;
    }

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

    // Execute Cascading Swarm Evaluation under Persistent Scenario Condition
    const coordinator = new SwarmCoordinator();
    const result = coordinator.runConsensus(pair, timeframe, candlesInput, scenarioInput);

    return NextResponse.json({
      success: true,
      data: {
        pair,
        timeframe,
        transcript: result.debateTranscript,
        synthesis: result.debateSynthesis,
        terminalNode: result.debateSynthesis?.terminalNode,
        divergence: result.debateSynthesis?.divergence,
        activeScenario: result.debateSynthesis?.activeScenario,
        consensus: result.consensusDirection,
        confidence: result.overallConfidence,
        priceThresholds: result.debateSynthesis?.priceThresholds,
        executionSignal: result.executionSignal,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Debate simulation failed' },
      { status: 500 }
    );
  }
}
