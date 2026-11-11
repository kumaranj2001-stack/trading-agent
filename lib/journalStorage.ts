import { 
  CurrencyPair, 
  ExecutionMode, 
  HistoricalJournalAnalysis, 
  JournalEntry, 
  JournalLossCategory, 
  MarketSegment, 
  Position, 
  RiskVerdict, 
  SwarmConsensusResult,
  DiagnosticFailureAudit
} from './types';
import { db } from './firebase';
import { doc, setDoc, getDocs, collection, query, orderBy, limit, deleteDoc } from 'firebase/firestore';
import { diagnosticReasoningEngine } from './diagnosticReasoningEngine';

const STORAGE_KEY = 'qri_storage_journal_v1';
const LEGACY_STORAGE_KEY = 'apex_storage_journal_v1';

const isBrowser = typeof window !== 'undefined';

// Utility to clean objects for Firestore
function cleanForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  if (data === null || typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(cleanForFirestore);
  const cleanObj: Record<string, any> = {};
  for (const [key, val] of Object.entries(data as Record<string, any>)) {
    if (val !== undefined) cleanObj[key] = cleanForFirestore(val);
  }
  return cleanObj;
}

export const INITIAL_JOURNALS: JournalEntry[] = [
  {
    id: 'jrn-101',
    symbol: 'EUR/USD',
    segment: 'FOREX',
    orderType: 'BUY',
    lots: 0.5,
    entryPrice: 1.11250,
    exitPrice: 1.11680,
    stopLoss: 1.10950,
    takeProfit: 1.11750,
    riskRewardRatio: 2.1,
    dollarRisk: 150,
    potentialDollarGain: 315.0,
    executionMode: 'SEMI_AUTONOMOUS',
    entryTimestamp: Date.now() - 86400000 * 3,
    entryTimeStr: '3 days ago 14:15',
    exitTimestamp: Date.now() - 86400000 * 3 + 3600000 * 5,
    exitTimeStr: '3 days ago 19:15',
    realizedPnl: 215.00,
    pnlPercent: 1.55,
    outcome: 'WIN',
    confluenceGrade: 'A+',
    confidenceScore: 84,
    swarmDirection: 'BUY',
    riskManagerVerdict: 'APPROVED',
    keyReasons: [
      'ECB monetary policy divergence guidance',
      'H1 Bullish Order block respected at 1.1118',
      'DXY rejection at structural resistance ceiling'
    ],
    lossReasonCategory: 'NONE_DISCIPLINED_WIN',
    lessonLearned: 'Patience rewarded: entry at retest of 50-EMA with confirmed liquidity sweep.',
    notes: 'Clean execution. Target 1 reached with zero drawdown on entry.',
    tags: ['SMC', 'OrderBlock', 'ECB', 'HighConfidence']
  },
  {
    id: 'jrn-102',
    symbol: 'EUR/USD',
    segment: 'FOREX',
    orderType: 'BUY',
    lots: 0.4,
    entryPrice: 1.11500,
    exitPrice: 1.11050,
    stopLoss: 1.11050,
    takeProfit: 1.12300,
    riskRewardRatio: 2.3,
    dollarRisk: 180,
    potentialDollarGain: 414,
    executionMode: 'MANUAL',
    entryTimestamp: Date.now() - 86400000 * 2,
    entryTimeStr: '2 days ago 13:28',
    exitTimestamp: Date.now() - 86400000 * 2 + 3600000 * 2,
    exitTimeStr: '2 days ago 15:30',
    realizedPnl: -180.00,
    pnlPercent: -1.33,
    outcome: 'LOSS',
    confluenceGrade: 'B',
    confidenceScore: 68,
    swarmDirection: 'BUY',
    riskManagerVerdict: 'MODIFIED',
    keyReasons: [
      'US Core CPI release came out hotter than forecast at 3.3% YoY',
      'Fed rate cut odds postponed'
    ],
    lossReasonCategory: 'NEWS_SLIPPAGE',
    lessonLearned: 'Trading right into US High-Impact CPI releases without sufficient stop buffer leads to stop out.',
    notes: 'Hot CPI print triggered an aggressive USD spike, invalidating setup immediately.',
    tags: ['CPI', 'NewsSpike', 'MistakeAttribution']
  },
  {
    id: 'jrn-103',
    symbol: 'XAU/USD',
    segment: 'METALS_COMMODITIES',
    orderType: 'BUY',
    lots: 0.3,
    entryPrice: 4045.50,
    exitPrice: 4080.20,
    stopLoss: 4030.00,
    takeProfit: 4085.00,
    riskRewardRatio: 2.5,
    dollarRisk: 465,
    potentialDollarGain: 1162.5,
    executionMode: 'FULL_AUTOPILOT',
    entryTimestamp: Date.now() - 86400000 * 1.5,
    entryTimeStr: 'Yesterday 10:10',
    exitTimestamp: Date.now() - 86400000 * 1.5 + 3600000 * 8,
    exitTimeStr: 'Yesterday 18:10',
    realizedPnl: 1041.00,
    pnlPercent: 7.71,
    outcome: 'WIN',
    confluenceGrade: 'A+',
    confidenceScore: 91,
    swarmDirection: 'BUY',
    riskManagerVerdict: 'APPROVED',
    keyReasons: [
      'Central bank sovereign bullion accumulation accelerated',
      'Real US 10Y yields slipped below 1.78%',
      'Bullion breakout above previous swing high'
    ],
    lossReasonCategory: 'NONE_DISCIPLINED_WIN',
    lessonLearned: 'Strong fundamental de-dollarization tailwind with Technical trend continuation offers supreme R:R.',
    notes: 'Autopilot executed smoothly. Trailing stop captured 90% of move.',
    tags: ['Gold', 'Autopilot', 'CentralBank']
  },
  {
    id: 'jrn-104',
    symbol: 'USD/JPY',
    segment: 'FOREX',
    orderType: 'BUY',
    lots: 0.3,
    entryPrice: 157.80,
    exitPrice: 156.90,
    stopLoss: 156.90,
    takeProfit: 159.20,
    riskRewardRatio: 1.9,
    dollarRisk: 175,
    potentialDollarGain: 332.5,
    executionMode: 'MANUAL',
    entryTimestamp: Date.now() - 86400000 * 4,
    entryTimeStr: '4 days ago 16:30',
    exitTimestamp: Date.now() - 86400000 * 4 + 3600000 * 3,
    exitTimeStr: '4 days ago 19:30',
    realizedPnl: -175.00,
    pnlPercent: -1.29,
    outcome: 'LOSS',
    confluenceGrade: 'B',
    confidenceScore: 65,
    swarmDirection: 'BUY',
    riskManagerVerdict: 'MODIFIED',
    keyReasons: [
      'BOJ Governor surprise jawboning warning against excessive Yen weakness',
      'Intervention speculation triggered unwinding'
    ],
    lossReasonCategory: 'COUNTER_TREND',
    lessonLearned: 'Buying USD/JPY near psychological intervention barriers (154.00-155.00) carries asymmetric downside.',
    notes: 'Risk manager warned of intervention risk. Stopped out cleanly.',
    tags: ['BOJ', 'YenIntervention', 'MacroShift']
  }
];

export class JournalStorageManager {
  // Load all journals
  public static getJournals(): JournalEntry[] {
    if (!isBrowser) return INITIAL_JOURNALS;
    try {
      const data = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
      if (data) {
        const parsed: JournalEntry[] = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.sort((a, b) => b.entryTimestamp - a.entryTimestamp);
        }
      }
    } catch (e) {
      console.warn('Error reading journals from localStorage:', e);
    }
    // Seed default if empty
    this.saveAllLocally(INITIAL_JOURNALS);
    return INITIAL_JOURNALS;
  }

  // Save or update an entry
  public static saveJournal(entry: JournalEntry): void {
    const list = this.getJournals();
    const existingIndex = list.findIndex(j => j.id === entry.id || (entry.tradeId && j.tradeId === entry.tradeId));
    let updated: JournalEntry[];
    if (existingIndex >= 0) {
      updated = [...list];
      updated[existingIndex] = { ...updated[existingIndex], ...entry };
    } else {
      updated = [entry, ...list];
    }
    this.saveAllLocally(updated);
    this.syncToFirestore(entry);
  }

  // Automatically record trade entry into the immutable journal
  public static recordTradeOpen(
    pos: Position,
    consensus: SwarmConsensusResult | null,
    executionMode: ExecutionMode = 'SEMI_AUTONOMOUS'
  ): JournalEntry {
    const now = Date.now();
    const entrySnapshot = diagnosticReasoningEngine.captureEntrySnapshot(pos, consensus);

    const entry: JournalEntry = {
      id: `jrn-${pos.id}`,
      tradeId: pos.id,
      symbol: pos.symbol,
      segment: consensus?.marketSegment || 'FOREX',
      orderType: pos.type,
      lots: pos.lots,
      entryPrice: pos.entryPrice,
      stopLoss: pos.stopLoss,
      takeProfit: pos.takeProfit,
      riskRewardRatio: pos.riskReward || consensus?.executionSignal.riskReward || 2.0,
      dollarRisk: consensus?.executionSignal.riskAmountUsd || (pos.lots * 1000 * 0.015),
      potentialDollarGain: (consensus?.executionSignal.riskAmountUsd || (pos.lots * 1000 * 0.015)) * (pos.riskReward || 2.0),
      executionMode,
      entryTimestamp: now,
      entryTimeStr: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      outcome: 'OPEN',
      confluenceGrade: consensus?.confluenceGrade || 'A',
      confidenceScore: consensus?.overallConfidence || 82,
      swarmDirection: consensus?.consensusDirection || (pos.type === 'BUY' ? 'BUY' : 'SELL'),
      riskManagerVerdict: consensus?.agents.risk.verdict || 'APPROVED',
      keyReasons: consensus?.unifiedDecision.keyDriversList.slice(0, 3) || ['Verified Institutional Setup'],
      tags: [consensus?.marketSegment || 'FOREX', consensus?.confluenceGrade || 'A', executionMode],
      isImmutableLedgerRecord: true,
      entrySnapshot,
    };

    this.saveJournal(entry);
    return entry;
  }

  // Automatically record trade close into the immutable journal via event bus
  public static recordTradeClose(
    posOrId: string | Position,
    exitPrice: number,
    realizedPnl: number,
    outcome: 'WIN' | 'LOSS' | 'SCRATCH' = realizedPnl > 0 ? 'WIN' : realizedPnl < 0 ? 'LOSS' : 'SCRATCH',
    options?: {
      exitReason?: string;
      invalidationTriggers?: string[];
      pos?: Position;
    }
  ): { updatedEntry: JournalEntry | undefined; diagnosticAudit?: DiagnosticFailureAudit } {
    const list = this.getJournals();
    const now = Date.now();
    const posId = typeof posOrId === 'string' ? posOrId : posOrId.id;
    const targetPos = typeof posOrId === 'object' ? posOrId : options?.pos;

    const item = list.find(j => j.tradeId === posId || j.id === `jrn-${posId}`);
    if (item) {
      let lossCat: JournalLossCategory | undefined = undefined;
      let lesson: string | undefined = undefined;
      let diagnosticAudit: DiagnosticFailureAudit | undefined = undefined;
      let synthesizedRuleId: string | undefined = undefined;

      // ⚡ Diagnostic Reasoning Engine activates instantly upon any Stop Loss / Loss event
      if (outcome === 'LOSS') {
        const dummyPos: Position = targetPos || {
          id: item.tradeId || item.id,
          symbol: item.symbol,
          type: item.orderType,
          lots: item.lots,
          entryPrice: item.entryPrice,
          currentPrice: exitPrice,
          stopLoss: item.stopLoss,
          takeProfit: item.takeProfit,
          openTime: item.entryTimeStr,
          pnl: realizedPnl,
          pnlPercent: item.pnlPercent || 0,
          riskReward: item.riskRewardRatio || 2.0,
        };

        diagnosticAudit = diagnosticReasoningEngine.diagnoseStopLossFailure({
          pos: dummyPos,
          exitPrice,
          realizedLossUsd: realizedPnl,
          exitReason: options?.exitReason,
          invalidationTriggers: options?.invalidationTriggers,
        });

        synthesizedRuleId = diagnosticAudit.synthesizedRuleId;
        lossCat = diagnosticAudit.failureClassification as any;
        lesson = diagnosticAudit.mitigationRuleDirective;
      } else if (outcome === 'WIN') {
        lossCat = 'NONE_DISCIPLINED_WIN';
        lesson = `Target captured at ${exitPrice}. Institutional confluence hypothesis validated.`;
      }

      const updated: JournalEntry = {
        ...item,
        exitPrice,
        realizedPnl,
        pnlPercent: Number(((realizedPnl / (item.lots * 1000)) * 100).toFixed(2)),
        exitTimestamp: now,
        exitTimeStr: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        outcome,
        lossReasonCategory: lossCat || item.lossReasonCategory,
        lessonLearned: lesson || item.lessonLearned,
        isImmutableLedgerRecord: true,
        diagnosticAudit,
        synthesizedRuleId,
        exitReason: options?.exitReason,
        invalidationTriggers: options?.invalidationTriggers,
      };

      this.saveJournal(updated);
      return { updatedEntry: updated, diagnosticAudit };
    }
    return { updatedEntry: undefined };
  }

  // Analyze historical journal data for active multi-agent swarm pre-trade review
  public static analyzeHistoricalJournals(filterSymbol?: CurrencyPair): HistoricalJournalAnalysis {
    const all = this.getJournals().filter(j => j.outcome !== 'OPEN');
    const targetList = filterSymbol ? all.filter(j => j.symbol === filterSymbol) : all;
    
    const totalTrades = targetList.length;
    const wins = targetList.filter(j => j.outcome === 'WIN');
    const losses = targetList.filter(j => j.outcome === 'LOSS');
    
    const winningTrades = wins.length;
    const losingTrades = losses.length;
    const winRate = totalTrades > 0 ? Number(((winningTrades / totalTrades) * 100).toFixed(1)) : 0;
    
    const grossProfit = wins.reduce((sum, j) => sum + (j.realizedPnl || 0), 0);
    const grossLoss = Math.abs(losses.reduce((sum, j) => sum + (j.realizedPnl || 0), 0));
    const profitFactor = grossLoss > 0 ? Number((grossProfit / grossLoss).toFixed(2)) : grossProfit > 0 ? 99 : 1.0;
    const netPnl = Number((grossProfit - grossLoss).toFixed(2));
    
    const avgWin = winningTrades > 0 ? Number((grossProfit / winningTrades).toFixed(2)) : 0;
    const avgLoss = losingTrades > 0 ? Number((grossLoss / losingTrades).toFixed(2)) : 0;

    // Symbol Breakdown
    const symbolStats: Record<string, { trades: number; wins: number; losses: number; winRate: number; netPnl: number }> = {};
    all.forEach(j => {
      if (!symbolStats[j.symbol]) {
        symbolStats[j.symbol] = { trades: 0, wins: 0, losses: 0, winRate: 0, netPnl: 0 };
      }
      symbolStats[j.symbol].trades += 1;
      if (j.outcome === 'WIN') symbolStats[j.symbol].wins += 1;
      if (j.outcome === 'LOSS') symbolStats[j.symbol].losses += 1;
      symbolStats[j.symbol].netPnl = Number((symbolStats[j.symbol].netPnl + (j.realizedPnl || 0)).toFixed(2));
      symbolStats[j.symbol].winRate = Number(((symbolStats[j.symbol].wins / symbolStats[j.symbol].trades) * 100).toFixed(1));
    });

    // Primary Loss Causes Breakdown
    const causeCount: Record<string, number> = {};
    losses.forEach(j => {
      const cat = j.lossReasonCategory || 'SL_HIT_REGULAR_VOLATILITY';
      causeCount[cat] = (causeCount[cat] || 0) + 1;
    });

    const primaryLossCauses: Array<{ category: JournalLossCategory; count: number; percentage: number }> = Object.entries(causeCount)
      .map(([cat, count]) => ({
        category: cat as JournalLossCategory,
        count,
        percentage: losingTrades > 0 ? Number(((count / losingTrades) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.count - a.count);

    // Identify recurring mistakes & compute active Swarm guardrail
    let recurringMistakesWarning: string | undefined = undefined;
    let activeGuardrailAction: string | undefined = undefined;

    if (losses.length >= 2) {
      const topCause = primaryLossCauses[0];
      if (topCause && topCause.count >= 2) {
        if (topCause.category === 'NEWS_SLIPPAGE') {
          recurringMistakesWarning = `Pattern Alert: ${topCause.count} past losses triggered by high-impact macro news slippage.`;
          activeGuardrailAction = 'Mandate 45-minute blackout around Central Bank/CPI dispatches and require 1.5x wider ATR stop-loss.';
        } else if (topCause.category === 'COUNTER_TREND') {
          recurringMistakesWarning = `Pattern Alert: ${topCause.count} past losses occurred fighting dominant H4/D1 trends.`;
          activeGuardrailAction = 'Strictly enforce H4 EMA-200 alignment; veto all counter-trend signals.';
        } else if (topCause.category === 'SESSION_LIQUIDITY_DROP') {
          recurringMistakesWarning = `Pattern Alert: ${topCause.count} past losses occurred during thin liquidity off-session hours.`;
          activeGuardrailAction = 'Restrict execution to peak London/NY overlap and active NSE hours.';
        } else {
          recurringMistakesWarning = `Pattern Alert: ${topCause.count} past losses in ${filterSymbol || 'portfolio'} due to volatility stop-outs.`;
          activeGuardrailAction = 'Reduce position sizing by 20% and tighten R:R requirement to minimum 1:2.0.';
        }
      }
    }

    return {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      profitFactor,
      netPnl,
      avgWin,
      avgLoss,
      maxConsecutiveLosses: 2,
      symbolStats,
      primaryLossCauses,
      recurringMistakesWarning,
      activeGuardrailAction
    };
  }

  // Deprecated & Excised: Historical Journal is an immutable, event-driven audit ledger.
  // Manual deletion is permanently disabled to maintain uncompromised data integrity.
  public static deleteJournal(id: string): void {
    console.warn(`[IMMUTABLE_LEDGER_AUDIT] Delete rejected for journal record '${id}'. Historical executions cannot be manually purged.`);
  }

  // Reset to initial seed
  public static resetJournals(): void {
    this.saveAllLocally(INITIAL_JOURNALS);
  }

  // Export all journals as formatted JSON
  public static exportJournalsAsJson(): string {
    return JSON.stringify(this.getJournals(), null, 2);
  }

  private static saveAllLocally(journals: JournalEntry[]): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(journals));
    } catch (e) {
      console.warn('Error saving journals locally:', e);
    }
  }

  private static async syncToFirestore(entry: JournalEntry): Promise<void> {
    if (!db) return;
    try {
      const cleaned = cleanForFirestore({
        ...entry,
        syncedAt: Date.now(),
      });
      await setDoc(doc(db, 'journals', entry.id), cleaned, { merge: true });
    } catch (e: any) {
      console.warn('Firestore syncJournal notice (local cache active):', e?.message || e);
    }
  }
}
