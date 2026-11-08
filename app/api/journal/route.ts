import { NextRequest, NextResponse } from 'next/server';
import { JournalStorageManager } from '@/lib/journalStorage';
import { CurrencyPair, JournalEntry } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol');
    const symbol: CurrencyPair | undefined = (rawSymbol && rawSymbol in BASE_PRICES) 
      ? (rawSymbol as CurrencyPair) 
      : undefined;

    const journals = JournalStorageManager.getJournals();
    const filteredJournals = symbol ? journals.filter(j => j.symbol === symbol) : journals;
    const analysis = JournalStorageManager.analyzeHistoricalJournals(symbol);

    return NextResponse.json({
      success: true,
      data: {
        totalJournals: filteredJournals.length,
        journals: filteredJournals,
        analysis,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch trading journals' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }

    const rawSymbol = body.symbol || 'EUR/USD';
    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'EUR/USD';

    const now = Date.now();
    const entryId = body.id || `jrn-${now}`;

    const newEntry: JournalEntry = {
      id: entryId,
      tradeId: body.tradeId || `trade-${now}`,
      symbol,
      segment: body.segment || 'FOREX',
      orderType: body.orderType === 'SELL' ? 'SELL' : 'BUY',
      lots: typeof body.lots === 'number' ? body.lots : 0.5,
      entryPrice: typeof body.entryPrice === 'number' ? body.entryPrice : 1.0850,
      exitPrice: typeof body.exitPrice === 'number' ? body.exitPrice : undefined,
      stopLoss: typeof body.stopLoss === 'number' ? body.stopLoss : 1.0820,
      takeProfit: typeof body.takeProfit === 'number' ? body.takeProfit : 1.0920,
      riskRewardRatio: typeof body.riskRewardRatio === 'number' ? body.riskRewardRatio : 2.2,
      dollarRisk: typeof body.dollarRisk === 'number' ? body.dollarRisk : 150,
      potentialDollarGain: typeof body.potentialDollarGain === 'number' ? body.potentialDollarGain : 330,
      executionMode: body.executionMode || 'SEMI_AUTONOMOUS',
      entryTimestamp: body.entryTimestamp || now,
      entryTimeStr: body.entryTimeStr || new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      exitTimestamp: body.exitTimestamp,
      exitTimeStr: body.exitTimeStr,
      realizedPnl: typeof body.realizedPnl === 'number' ? body.realizedPnl : (body.outcome === 'WIN' ? 150 : body.outcome === 'LOSS' ? -100 : 0),
      pnlPercent: typeof body.pnlPercent === 'number' ? body.pnlPercent : 1.5,
      outcome: body.outcome || 'OPEN',
      confluenceGrade: body.confluenceGrade || 'A',
      confidenceScore: typeof body.confidenceScore === 'number' ? body.confidenceScore : 82,
      swarmDirection: body.swarmDirection || 'BUY',
      riskManagerVerdict: body.riskManagerVerdict || 'APPROVED',
      keyReasons: Array.isArray(body.keyReasons) ? body.keyReasons : ['Institutional Swarm Consensus Confirmation'],
      lossReasonCategory: body.lossReasonCategory || (body.outcome === 'WIN' ? 'NONE_DISCIPLINED_WIN' : 'SL_HIT_REGULAR_VOLATILITY'),
      lessonLearned: body.lessonLearned || 'Strict risk-reward parameters adhered to.',
      notes: body.notes || 'Executed according to 5-Agent Consensus.',
      tags: Array.isArray(body.tags) ? body.tags : ['SwarmConsensus', 'LiveAPI'],
    };

    JournalStorageManager.saveJournal(newEntry);
    const updatedAnalysis = JournalStorageManager.analyzeHistoricalJournals(symbol);

    return NextResponse.json({
      success: true,
      data: {
        entry: newEntry,
        analysis: updatedAnalysis,
        message: 'Journal entry successfully persisted to institutional database.',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save trading journal' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Journal ID required' }, { status: 400 });
    }

    JournalStorageManager.deleteJournal(id);

    return NextResponse.json({
      success: true,
      message: `Journal entry ${id} successfully removed.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete journal entry' },
      { status: 500 }
    );
  }
}
