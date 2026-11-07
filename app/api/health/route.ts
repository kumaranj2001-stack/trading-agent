import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    system: 'Qri Trader 5-Agent Trading Swarm & Real-Time Wire Engine',
    version: '2.0.0',
    deployment: 'Vercel Serverless & Local Browser Storage',
    roles: [
      'technical_analyst',
      'fundamental_analyst',
      'forex_analyst',
      'news_analyst',
      'risk_manager'
    ],
    monitoredFinancialSources: 18,
    coverage: [
      'Forex Majors & Crosses',
      'Precious Metals (Gold, Silver, Platinum)',
      'Energy & Commodities (WTI Crude, Brent, Copper)',
      'Indian Equities (NSE NIFTY 50, BANK NIFTY)'
    ],
    timestamp: new Date().toISOString(),
  });
}
