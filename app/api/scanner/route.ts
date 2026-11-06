import { NextResponse } from 'next/server';
import { SwarmCoordinator } from '@/lib/agents/SwarmCoordinator';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const coordinator = new SwarmCoordinator();
    const opportunities = coordinator.scanAllOpportunities();

    return NextResponse.json({
      success: true,
      data: {
        timestamp: new Date().toISOString(),
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
