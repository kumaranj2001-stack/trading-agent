import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'Apex Multi-Agent Trading Swarm',
    version: '1.0.0',
    deployment: 'Vercel Serverless Ready',
    roles: [
      'technical_analyst',
      'fundamental_analyst',
      'forex_analyst',
      'risk_manager'
    ],
    timestamp: new Date().toISOString(),
  });
}
