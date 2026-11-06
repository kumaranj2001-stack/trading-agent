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

    const coordinator = new SwarmCoordinator();
    const result = coordinator.runConsensus(pair, timeframe);

    // If user provided a specific prompt/question, enhance the debate with custom context
    const debate = [...result.debateTranscript];
    if (sanitizedPrompt.length > 0) {
      debate.push({
        id: `user-query-${Date.now()}`,
        round: 4,
        role: 'risk_manager',
        agentName: 'Sarah Stirling (Risk Manager)',
        avatarColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
        content: `Regarding the scenario "${sanitizedPrompt}": Our stress tests show this could trigger sudden volatility expansion. We recommend reducing position sizing by 30% and tightening stops to preserve capital.`,
        sentiment: 'CAUTION',
        timestamp: 'Just now',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        pair,
        transcript: debate,
        consensus: result.consensusDirection,
        confidence: result.overallConfidence,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Debate simulation failed' },
      { status: 500 }
    );
  }
}
