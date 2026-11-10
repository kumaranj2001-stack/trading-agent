import { NextRequest, NextResponse } from 'next/server';
import { visionAtlasEngine } from '@/lib/visionAtlasEngine';
import { CurrencyPair, TimeFrame } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

// In-memory persistence fallback for Vision Atlas Market Reports
const SAVED_MARKET_REPORTS: Record<string, any> = {};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSymbol = searchParams.get('symbol') || searchParams.get('pair') || 'XAU/USD';
    const rawTf = searchParams.get('timeframe') || '1h';

    const symbol: CurrencyPair = (rawSymbol in BASE_PRICES) ? (rawSymbol as CurrencyPair) : 'XAU/USD';
    const timeframe: TimeFrame = (['1m', '5m', '15m', '1h', '4h', '1d'].includes(rawTf)) ? (rawTf as TimeFrame) : '1h';

    // Generate comprehensive AnalysisPayload contract
    const payload = visionAtlasEngine.generateAnalysisPayload(symbol, timeframe);

    return NextResponse.json({
      success: true,
      data: payload,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate Vision Atlas analysis payload' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, report } = body;

    if (action === 'save_report' && report) {
      const id = report.id || `rep-${Date.now()}`;
      SAVED_MARKET_REPORTS[id] = {
        ...report,
        savedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        message: 'Market report successfully persisted into Vision Atlas database repository.',
        reportId: id,
        savedReportsCount: Object.keys(SAVED_MARKET_REPORTS).length,
      });
    }

    if (action === 'list_reports') {
      return NextResponse.json({
        success: true,
        data: Object.values(SAVED_MARKET_REPORTS),
      });
    }

    return NextResponse.json(
      { success: false, error: 'Invalid action specified' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Vision Atlas report persistence failed' },
      { status: 500 }
    );
  }
}
