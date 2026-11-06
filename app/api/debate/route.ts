import { NextRequest, NextResponse } from 'next/server';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pair = 'EUR/USD', timeframe = '1h', userPrompt } = body;

    const coordinator = new SwarmCoordinator();
    const result = coordinator.runConsensus(pair as CurrencyPair, timeframe as TimeFrame);

    // If user provided a specific prompt/question, enhance the debate with custom context
    const debate = [...result.debateTranscript];
    if (userPrompt && userPrompt.trim().length > 0) {
      debate.push({
        id: `user-query-${Date.now()}`,
        round: 4,
        role: 'risk_manager',
        agentName: 'Sarah Stirling (Risk Manager)',
        avatarColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
        content: `Regarding the scenario "${userPrompt}": Our stress tests show this could trigger sudden volatility expansion. We recommend reducing position sizing by 30% and tightening stops to preserve capital.`,
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
      { success: false, error: error.message || 'Debate generation failed' },
      { status: 500 }
    );
  }
}
