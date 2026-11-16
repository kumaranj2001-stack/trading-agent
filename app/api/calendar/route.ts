import { NextRequest, NextResponse } from 'next/server';
import { macroHistoricalArchive } from '@/lib/macroHistoricalArchive';
import { macroCalendarIngestionEngine } from '@/lib/macroCalendarIngestionEngine';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const currency = searchParams.get('currency')?.toUpperCase();
    const impact = searchParams.get('impact')?.toUpperCase() as any;
    const rawSearch = searchParams.get('search') || '';
    const search = rawSearch.slice(0, 100).toLowerCase().trim();
    const isHistoricalQuery = searchParams.get('historical') === 'true';
    const dateParam = searchParams.get('date') || undefined;
    const isTodayQuery = searchParams.get('today') === 'true' || dateParam === 'TODAY';
    const startDate = searchParams.get('startDate') || undefined;
    const endDate = searchParams.get('endDate') || undefined;
    const sourceParam = (searchParams.get('source')?.toUpperCase() || 'ALL') as any;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;

    // 1. If historical archive is explicitly requested (decoupled background service)
    if (isHistoricalQuery) {
      const historicalEvents = macroHistoricalArchive.getHistoricalArchive({
        region: currency,
        impact: impact as any,
        search,
      });
      const baselineMetrics = macroHistoricalArchive.getHistoricalBaselineMetrics();
      const auditSummary = macroHistoricalArchive.getArchiveAuditSummary();

      return NextResponse.json({
        success: true,
        data: {
          isHistoricalArchive: true,
          auditSummary,
          events: historicalEvents,
          baselineMetrics,
          retentionPolicy: 'Auto-purge all events older than 30 days',
          timestamp: new Date().toISOString(),
        },
      });
    }

    // 2. Query the normalized, deduplicated Dual-Pipeline Calendar Ingestion Engine
    const result = macroCalendarIngestionEngine.getMergedCalendar({
      currency,
      impact: impact && impact !== 'ALL' ? impact : undefined,
      search,
      date: dateParam,
      todayOnly: isTodayQuery,
      startDate,
      endDate,
      source: sourceParam,
      page,
      limit,
    });

    const historicalAudit = macroHistoricalArchive.getArchiveAuditSummary();

    return NextResponse.json({
      success: true,
      data: {
        totalEvents: result.totalCount,
        highImpactCount: result.highImpactCount,
        todayEventsCount: result.todayEventsCount,
        currentTradingDate: macroCalendarIngestionEngine.getCurrentTradingDate(),
        events: result.events,
        nextHighImpactEvent: result.events.find(e => e.impact === 'HIGH') || null,
        telemetry: result.telemetry,
        dualPipelineStatus: {
          primaryMacroFeedActive: true,
          forexFactoryScraperActive: true,
          deduplicationActive: true,
          zeroDateCutoffActive: true,
          highFrequencyReleaseWindowActive: result.telemetry.highFrequencyReleaseWindowActive,
        },
        backgroundStorage: {
          historical30DayBackupActive: true,
          total30DayHistoricalEvents: historicalAudit.totalStoredEvents,
          autoPurgeEnforced: true,
          decoupledFromPrimaryView: true,
        },
        serverTimeIST: new Intl.DateTimeFormat('en-US', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
        }).format(new Date()) + ' IST',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch macroeconomic calendar' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    // Force refresh dual pipeline (Primary Macro Feed + Forex Factory)
    const freshEvents = await macroCalendarIngestionEngine.refreshDualPipeline();
    const telemetry = macroCalendarIngestionEngine.getTelemetry();

    return NextResponse.json({
      success: true,
      data: {
        refreshed: true,
        totalEvents: freshEvents.length,
        telemetry,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to refresh dual-pipeline calendar' },
      { status: 500 }
    );
  }
}
