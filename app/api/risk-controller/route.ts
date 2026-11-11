import { NextRequest, NextResponse } from 'next/server';
import { riskRatioController } from '@/lib/riskRatioController';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const config = riskRatioController.getConfig();
    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch Risk Ratio Controller configuration' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = riskRatioController.updateConfig(body);
    return NextResponse.json({
      success: true,
      message: 'Risk Ratio Controller institutional parameters successfully updated.',
      config: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update Risk Ratio Controller configuration' },
      { status: 500 }
    );
  }
}
