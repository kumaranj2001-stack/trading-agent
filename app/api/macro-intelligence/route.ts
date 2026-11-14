import { NextRequest, NextResponse } from 'next/server';
import { macroIntelligenceEngine, HIGH_IMPACT_MACRO_CATALYSTS } from '@/lib/macroIntelligenceEngine';
import { dynamicTieredSourceDirectory } from '@/lib/dynamicTieredSourceDirectory';
import { macroTelemetryBridge } from '@/lib/macroTelemetryBridge';
import { eventDrivenRiskProtocols } from '@/lib/eventDrivenRiskProtocols';
import { CurrencyPair, MacroCatalystCategory } from '@/lib/types';
import { BASE_PRICES } from '@/lib/marketData';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') as MacroCatalystCategory | 'ALL' | null;
    const eventId = searchParams.get('eventId');
    const action = searchParams.get('action');
    const symbolParam = (searchParams.get('symbol') || 'XAU/USD') as CurrencyPair;

    // Sub-action: get telemetry bridge status
    if (action === 'TELEMETRY_BRIDGE') {
      const bridgeState = macroTelemetryBridge.getBridgeState(symbolParam);
      return NextResponse.json({
        success: true,
        data: bridgeState,
      });
    }

    // Sub-action: get tiered source directory manifest
    if (action === 'TIERED_DIRECTORY') {
      const summary = dynamicTieredSourceDirectory.getDirectorySummary();
      const allSources = dynamicTieredSourceDirectory.getAllSources();
      return NextResponse.json({
        success: true,
        data: {
          summary,
          sources: allSources,
        },
      });
    }

    if (eventId) {
      const correlatedPairs = macroIntelligenceEngine.getCorrelatedPairs(eventId);
      const catalyst = HIGH_IMPACT_MACRO_CATALYSTS.find(c => c.id === eventId);
      return NextResponse.json({
        success: true,
        data: {
          catalyst,
          correlatedPairs,
        },
      });
    }

    const catalysts = macroIntelligenceEngine.getCatalysts(category || 'ALL');

    return NextResponse.json({
      success: true,
      data: {
        totalCatalysts: catalysts.length,
        catalysts,
        tieredDirectorySummary: dynamicTieredSourceDirectory.getDirectorySummary(),
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch macroeconomic catalysts' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventId, symbol: rawSymbol, forceUnconfirmed, action, triggerReason, validationScoreBefore } = body;

    const symbol: CurrencyPair = (rawSymbol && rawSymbol in BASE_PRICES) 
      ? (rawSymbol as CurrencyPair) 
      : 'XAU/USD';

    // Sub-action: Execute on-demand deep-scraping across 90+ tiered sources
    if (action === 'TRIGGER_DEEP_SCRAPE') {
      const deepScrapeResult = await dynamicTieredSourceDirectory.executeOnDemandDeepScrape(
        symbol,
        triggerReason || 'ON_DEMAND_MANUAL',
        validationScoreBefore || 72.0
      );
      return NextResponse.json({
        success: true,
        data: deepScrapeResult,
      });
    }

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: eventId' },
        { status: 400 }
      );
    }

    // Generate full macro intelligence synthesis report
    let report = macroIntelligenceEngine.generateMacroIntelligenceReport(eventId, symbol);

    // Optional override for fail-safe testing
    if (forceUnconfirmed) {
      report = {
        ...report,
        signal: 'UNCONFIRMED',
        confidenceScore: 61.5,
        validationStatus: 'AWAITING_CONVERGENCE',
        statusDescription: 'Unconfirmed – Awaiting Data Convergence (Fail-safe simulated timeout exceeded)',
        dataConvergence: {
          ...report.dataConvergence,
          isConverged: false,
          confidenceThresholdMet: false,
          timeoutExceeded: true,
          discrepancyDeltaPercent: 4.85,
          auditLog: [
            ...report.dataConvergence.auditLog,
            `[TIMEOUT EXCEEDED]: Autonomous fallback scraper exceeded 2500ms SLA without verified cryptographic convergence.`,
            `[FAIL-SAFE ENFORCED]: Directional bias suppressed. State flagged as UNCONFIRMED.`
          ]
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate macro intelligence report' },
      { status: 500 }
    );
  }
}
