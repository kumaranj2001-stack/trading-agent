import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'Apex Multi-Agent Trading Swarm',
    version: '2.0.0',
    deployment: 'Vercel Serverless & Local Browser Ready',
    rolesCount: 5,
    roles: [
      'technical_analyst',
      'fundamental_analyst',
      'forex_analyst',
      'news_analyst',
      'risk_manager'
    ],
    monitoredFinancialSourcesCount: 20,
    timestamp: new Date().toISOString(),
  });
}
