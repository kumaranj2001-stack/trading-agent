import { NextRequest, NextResponse } from 'next/server';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';
import { MarketSegment } from '@/lib/types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawSegment = searchParams.get('segment');
    const segment: MarketSegment | undefined = (
      rawSegment === 'FOREX' || 
      rawSegment === 'METALS_COMMODITIES' || 
      rawSegment === 'INDIAN_MARKET'
    ) ? (rawSegment as MarketSegment) : undefined;

    const coordinator = new SwarmCoordinator();
    const opportunities = coordinator.scanAllOpportunities(segment);

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
        segmentFilter: segment || 'ALL',
        totalPairsScanned: opportunities.length,
        opportunities,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Opportunity scan failed' },
      { status: 500 }
    );
  }
}
