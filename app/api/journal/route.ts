import { NextRequest, NextResponse } from 'next/server';
import { PersistentTradingJournal } from '@/lib/journalStorage';
import { CurrencyPair } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const symbol = searchParams.get('symbol') as CurrencyPair | null;
    const filter = searchParams.get('filter') as 'ALL' | 'WINS' | 'LOSSES' | 'OPEN' | null;

    let entries = PersistentTradingJournal.loadEntries();

    if (symbol) {
      entries = entries.filter(e => e.symbol === symbol);
    }

    if (filter === 'WINS') {
      entries = entries.filter(e => e.status === 'CLOSED' && (e.realizedPnlUsd || 0) > 0);
    } else if (filter === 'LOSSES') {
      entries = entries.filter(e => e.status === 'CLOSED' && (e.realizedPnlUsd || 0) < 0);
    } else if (filter === 'OPEN') {
      entries = entries.filter(e => e.status === 'OPEN');
    }

    const metrics = PersistentTradingJournal.getMetrics();

    return NextResponse.json({
      success: true,
      data: {
        metrics,
        entries,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve trading journal' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'LOG_ENTRY') {
      const entry = PersistentTradingJournal.logTradeEntry(body.entry);
      return NextResponse.json({ success: true, data: entry });
    }

    if (action === 'LOG_OUTCOME') {
      const { tradeIdOrPositionId, exitPrice, exitReason, realizedPnl, retrospectiveNotes } = body;
      const updated = PersistentTradingJournal.logTradeOutcome(
        tradeIdOrPositionId,
        exitPrice,
        exitReason,
        realizedPnl,
        retrospectiveNotes
      );
      return NextResponse.json({ success: true, data: updated });
    }

    if (action === 'RESET') {
      PersistentTradingJournal.resetJournal();
      return NextResponse.json({ success: true, message: 'Journal reset to initial seeds' });
    }

    return NextResponse.json({ success: false, error: 'Invalid journal action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to update trading journal' },
      { status: 500 }
    );
  }
}
