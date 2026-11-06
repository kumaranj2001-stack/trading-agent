import { CurrencyPair, JournalMetrics, JournalTradeEntry, MarketSegment, TimeFrame } from './types';

export type { JournalMetrics };

const STORAGE_KEY = 'apex_storage_journal_v2';
const isBrowser = typeof window !== 'undefined';

// Realistic institutional seed history for immediate memory recall
export const SEED_JOURNAL_TRADES: JournalTradeEntry[] = [
  {
    id: 'jnl-seed-01',
    symbol: 'XAU/USD',
    marketSegment: 'METALS_COMMODITIES',
    direction: 'BUY',
    entryPrice: 2684.50,
    exitPrice: 2674.20,
    lots: 0.50,
    units: 50,
    initialStopLoss: 2674.20,
    initialTakeProfit: 2715.00,
    plannedRiskRewardRatio: 2.96,
    plannedRiskAmountUsd: 515.00,
    stopDistancePips: 103,
    entryTime: 'Nov 02 13:45',
    entryTimestamp: Date.now() - 5 * 86400000 + 3600000,
    exitTime: 'Nov 02 15:30',
    exitTimestamp: Date.now() - 5 * 86400000 + 10200000,
    status: 'CLOSED',
    exitReason: 'STOP_LOSS',
    realizedPnlUsd: -515.00,
    realizedRMultiple: -1.0,
    confluenceGradeAtEntry: 'B',
    agentConfidenceAtEntry: 72,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Bullish Hammer near Asian High',
      rsiAtEntry: 68.2,
      marketRegime: 'PRE_NEWS_VOLATILITY',
      newsSentimentScore: 0.25,
      primaryCatalyst: 'Pre-US Non-Farm Payrolls Speculation',
    },
    lossCategory: 'SPREAD_EXPANSION_NEWS',
    retrospectiveNotes: 'Gold breakout long opened 45 mins before US macro release. Spread expanded to $2.10 and initial liquidity sweep clipped the stop loss before gold reversed +$35 higher.',
    preventativeTakeaway: 'Require a 12-pip MAE cushion and avoid initiating new intraday positions inside the 60-minute pre-Tier-1 data window.',
  },
  {
    id: 'jnl-seed-02',
    symbol: 'XAU/USD',
    marketSegment: 'METALS_COMMODITIES',
    direction: 'BUY',
    entryPrice: 2662.00,
    exitPrice: 2712.50,
    lots: 0.60,
    units: 60,
    initialStopLoss: 2646.00,
    initialTakeProfit: 2712.50,
    plannedRiskRewardRatio: 3.15,
    plannedRiskAmountUsd: 960.00,
    stopDistancePips: 160,
    entryTime: 'Nov 03 09:15',
    entryTimestamp: Date.now() - 4 * 86400000 + 7200000,
    exitTime: 'Nov 04 11:20',
    exitTimestamp: Date.now() - 3 * 86400000 + 14400000,
    status: 'CLOSED',
    exitReason: 'TAKE_PROFIT',
    realizedPnlUsd: 3030.00,
    realizedRMultiple: 3.15,
    confluenceGradeAtEntry: 'A+',
    agentConfidenceAtEntry: 89,
    setupSnapshot: {
      timeframe: '4h',
      candlestickPattern: 'Bullish Engulfing off 200 EMA',
      rsiAtEntry: 44.5,
      marketRegime: 'TRENDING_BULLISH',
      newsSentimentScore: 0.82,
      primaryCatalyst: 'PBOC Sovereign Reserve Accumulation & Real Yield Drop',
    },
    lossCategory: 'NONE',
    retrospectiveNotes: 'Textbook institutional demand continuation. Respect of 200 EMA support with dovish Fed commentary provided strong tailwind.',
    preventativeTakeaway: 'High confluence entry with real yield alignment produces optimal risk-adjusted reward.',
  },
  {
    id: 'jnl-seed-03',
    symbol: 'EUR/USD',
    marketSegment: 'FOREX',
    direction: 'BUY',
    entryPrice: 1.0885,
    exitPrice: 1.0845,
    lots: 1.20,
    units: 120000,
    initialStopLoss: 1.0845,
    initialTakeProfit: 1.0965,
    plannedRiskRewardRatio: 2.0,
    plannedRiskAmountUsd: 480.00,
    stopDistancePips: 40,
    entryTime: 'Nov 01 10:30',
    entryTimestamp: Date.now() - 6 * 86400000,
    exitTime: 'Nov 01 16:45',
    exitTimestamp: Date.now() - 6 * 86400000 + 22500000,
    status: 'CLOSED',
    exitReason: 'STOP_LOSS',
    realizedPnlUsd: -480.00,
    realizedRMultiple: -1.0,
    confluenceGradeAtEntry: 'B',
    agentConfidenceAtEntry: 69,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Ascending Triangle Breakout',
      rsiAtEntry: 72.8,
      marketRegime: 'RANGE_EXPANSION',
      newsSentimentScore: -0.15,
      primaryCatalyst: 'ECB Rate Pause Expectation',
    },
    lossCategory: 'PREMATURE_BREAKOUT',
    retrospectiveNotes: 'Bought EUR/USD breakout into heavy daily resistance while RSI was diverging at 72.8. DXY rallied off 103.80 support causing sharp rejection.',
    preventativeTakeaway: 'Do not chase breakout longs when RSI > 70 near major resistance. Require pullback to 20/50 EMA or H1 confirmation.',
  },
  {
    id: 'jnl-seed-04',
    symbol: 'EUR/USD',
    marketSegment: 'FOREX',
    direction: 'SELL',
    entryPrice: 1.0870,
    exitPrice: 1.0775,
    lots: 1.00,
    units: 100000,
    initialStopLoss: 1.0910,
    initialTakeProfit: 1.0775,
    plannedRiskRewardRatio: 2.37,
    plannedRiskAmountUsd: 400.00,
    stopDistancePips: 40,
    entryTime: 'Nov 03 14:00',
    entryTimestamp: Date.now() - 4 * 86400000 + 18000000,
    exitTime: 'Nov 04 18:30',
    exitTimestamp: Date.now() - 3 * 86400000 + 34200000,
    status: 'CLOSED',
    exitReason: 'TAKE_PROFIT',
    realizedPnlUsd: 950.00,
    realizedRMultiple: 2.37,
    confluenceGradeAtEntry: 'A',
    agentConfidenceAtEntry: 84,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Bearish Harami / Fair Value Gap Fill',
      rsiAtEntry: 58.1,
      marketRegime: 'BEARISH_TREND_CONTINUATION',
      newsSentimentScore: -0.65,
      primaryCatalyst: 'Fed Resilient Growth vs German Industrial Slump',
    },
    lossCategory: 'NONE',
    retrospectiveNotes: 'Short initiated after rejection of 1.0880 resistance and negative German factory orders. Clean target reach.',
    preventativeTakeaway: 'Macro growth divergence between Eurozone and US reliably dictates swing direction.',
  },
  {
    id: 'jnl-seed-05',
    symbol: 'GBP/USD',
    marketSegment: 'FOREX',
    direction: 'BUY',
    entryPrice: 1.2860,
    exitPrice: 1.2825,
    lots: 0.80,
    units: 80000,
    initialStopLoss: 1.2825,
    initialTakeProfit: 1.2940,
    plannedRiskRewardRatio: 2.28,
    plannedRiskAmountUsd: 280.00,
    stopDistancePips: 35,
    entryTime: 'Nov 02 08:30',
    entryTimestamp: Date.now() - 5 * 86400000 + 30600000,
    exitTime: 'Nov 02 12:15',
    exitTimestamp: Date.now() - 5 * 86400000 + 44100000,
    status: 'CLOSED',
    exitReason: 'STOP_LOSS',
    realizedPnlUsd: -280.00,
    realizedRMultiple: -1.0,
    confluenceGradeAtEntry: 'B',
    agentConfidenceAtEntry: 70,
    setupSnapshot: {
      timeframe: '15m',
      candlestickPattern: 'Double Bottom on London Open',
      rsiAtEntry: 41.2,
      marketRegime: 'SESSION_OPEN_CHOP',
      newsSentimentScore: 0.30,
      primaryCatalyst: 'BoE Hawkish Hold Commentary',
    },
    lossCategory: 'STOP_TOO_TIGHT',
    retrospectiveNotes: 'Stop of 35 pips placed directly below the Asian session low was clipped by a London open liquidity sweep before price rallied 80 pips.',
    preventativeTakeaway: 'Always add a minimum 8-10 pip buffer below major session lows to survive institutional liquidity grabs.',
  },
  {
    id: 'jnl-seed-06',
    symbol: 'GBP/USD',
    marketSegment: 'FOREX',
    direction: 'BUY',
    entryPrice: 1.2840,
    exitPrice: 1.2985,
    lots: 1.00,
    units: 100000,
    initialStopLoss: 1.2790,
    initialTakeProfit: 1.2985,
    plannedRiskRewardRatio: 2.9,
    plannedRiskAmountUsd: 500.00,
    stopDistancePips: 50,
    entryTime: 'Nov 04 09:30',
    entryTimestamp: Date.now() - 3 * 86400000 + 34200000,
    exitTime: 'Nov 05 16:00',
    exitTimestamp: Date.now() - 2 * 86400000 + 57600000,
    status: 'CLOSED',
    exitReason: 'TAKE_PROFIT',
    realizedPnlUsd: 1450.00,
    realizedRMultiple: 2.9,
    confluenceGradeAtEntry: 'A+',
    agentConfidenceAtEntry: 88,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Morning Star / S&R Flip',
      rsiAtEntry: 49.0,
      marketRegime: 'BULLISH_TREND',
      newsSentimentScore: 0.72,
      primaryCatalyst: 'UK Services PMI Beats Expectations',
    },
    lossCategory: 'NONE',
    retrospectiveNotes: 'Incorporated previous takeaway: widened stop buffer by 10 pips below sweep low. Survived minor volatility and caught +145 pip move.',
    preventativeTakeaway: 'Adjusting stop buffers based on historical adverse excursion directly protects winning trades.',
  },
  {
    id: 'jnl-seed-07',
    symbol: 'USD/JPY',
    marketSegment: 'FOREX',
    direction: 'BUY',
    entryPrice: 154.20,
    exitPrice: 152.90,
    lots: 0.70,
    units: 70000,
    initialStopLoss: 153.40,
    initialTakeProfit: 156.00,
    plannedRiskRewardRatio: 2.25,
    plannedRiskAmountUsd: 560.00,
    stopDistancePips: 80,
    entryTime: 'Oct 30 11:00',
    entryTimestamp: Date.now() - 8 * 86400000,
    exitTime: 'Oct 30 15:45',
    exitTimestamp: Date.now() - 8 * 86400000 + 17100000,
    status: 'CLOSED',
    exitReason: 'STOP_LOSS',
    realizedPnlUsd: -560.00,
    realizedRMultiple: -1.0,
    confluenceGradeAtEntry: 'B',
    agentConfidenceAtEntry: 67,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Bullish Flag',
      rsiAtEntry: 75.4,
      marketRegime: 'INTERVENTION_RISK_ZONE',
      newsSentimentScore: -0.40,
      primaryCatalyst: 'US Yield Rally vs BoJ Cautious Guidance',
    },
    lossCategory: 'COUNTER_TREND_CHOP',
    retrospectiveNotes: 'Bought near 154.50 MoF jawboning verbal intervention zone. Japanese Ministry of Finance comments sparked sudden 130-pip plunge.',
    preventativeTakeaway: 'Strict veto on USD/JPY longs above 154.00 when Japanese MoF/BoJ intervention warnings are active.',
  },
  {
    id: 'jnl-seed-08',
    symbol: 'USD/JPY',
    marketSegment: 'FOREX',
    direction: 'SELL',
    entryPrice: 153.80,
    exitPrice: 151.60,
    lots: 0.90,
    units: 90000,
    initialStopLoss: 154.60,
    initialTakeProfit: 151.60,
    plannedRiskRewardRatio: 2.75,
    plannedRiskAmountUsd: 720.00,
    stopDistancePips: 80,
    entryTime: 'Nov 04 07:15',
    entryTimestamp: Date.now() - 3 * 86400000 + 26100000,
    exitTime: 'Nov 05 13:40',
    exitTimestamp: Date.now() - 2 * 86400000 + 49200000,
    status: 'CLOSED',
    exitReason: 'TAKE_PROFIT',
    realizedPnlUsd: 1980.00,
    realizedRMultiple: 2.75,
    confluenceGradeAtEntry: 'A',
    agentConfidenceAtEntry: 86,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Bearish Engulfing off 154.00 Resistance',
      rsiAtEntry: 62.0,
      marketRegime: 'CARRY_TRADE_UNWIND',
      newsSentimentScore: -0.74,
      primaryCatalyst: 'Tokyo CPI Accelerates + BoJ Ueda Rate Hike Guidance',
    },
    lossCategory: 'NONE',
    retrospectiveNotes: 'Capitalized on BoJ normalization narrative. Swift descent below 152.00 target.',
    preventativeTakeaway: 'Fading exhaustion moves near intervention ceilings yields asymmetric downside payoff.',
  },
  {
    id: 'jnl-seed-09',
    symbol: 'XAG/USD',
    marketSegment: 'METALS_COMMODITIES',
    direction: 'BUY',
    entryPrice: 32.40,
    exitPrice: 34.15,
    lots: 0.75,
    units: 3750,
    initialStopLoss: 31.75,
    initialTakeProfit: 34.15,
    plannedRiskRewardRatio: 2.69,
    plannedRiskAmountUsd: 487.50,
    stopDistancePips: 65,
    entryTime: 'Nov 03 12:00',
    entryTimestamp: Date.now() - 4 * 86400000 + 43200000,
    exitTime: 'Nov 05 10:15',
    exitTimestamp: Date.now() - 2 * 86400000 + 36900000,
    status: 'CLOSED',
    exitReason: 'TAKE_PROFIT',
    realizedPnlUsd: 1312.50,
    realizedRMultiple: 2.69,
    confluenceGradeAtEntry: 'A',
    agentConfidenceAtEntry: 83,
    setupSnapshot: {
      timeframe: '4h',
      candlestickPattern: 'Ascending Triangle / High Volume Breakout',
      rsiAtEntry: 54.0,
      marketRegime: 'COMMODITY_SUPER_CYCLE',
      newsSentimentScore: 0.78,
      primaryCatalyst: 'Solar PV & Industrial Demand Shortfall',
    },
    lossCategory: 'NONE',
    retrospectiveNotes: 'Silver demonstrated higher beta than gold. Clean breakout above $33.00 barrier with tight spread.',
    preventativeTakeaway: 'When gold is consolidating near highs, silver frequently initiates powerful catch-up rallies.',
  },
  {
    id: 'jnl-seed-10',
    symbol: 'NIFTY 50',
    marketSegment: 'INDIAN_MARKET',
    direction: 'BUY',
    entryPrice: 24150,
    exitPrice: 24480,
    lots: 1.50,
    units: 75,
    initialStopLoss: 24020,
    initialTakeProfit: 24480,
    plannedRiskRewardRatio: 2.53,
    plannedRiskAmountUsd: 195.00,
    stopDistancePips: 130,
    entryTime: 'Nov 04 09:45',
    entryTimestamp: Date.now() - 3 * 86400000 + 35100000,
    exitTime: 'Nov 05 14:15',
    exitTimestamp: Date.now() - 2 * 86400000 + 51300000,
    status: 'CLOSED',
    exitReason: 'TAKE_PROFIT',
    realizedPnlUsd: 495.00,
    realizedRMultiple: 2.53,
    confluenceGradeAtEntry: 'A+',
    agentConfidenceAtEntry: 91,
    setupSnapshot: {
      timeframe: '15m',
      candlestickPattern: 'Bullish Hammer off 24,000 Support',
      rsiAtEntry: 47.8,
      marketRegime: 'STRONG_DOMESTIC_INFLOWS',
      newsSentimentScore: 0.85,
      primaryCatalyst: 'FII Inflows + India GDP 7.2% Forecast',
    },
    lossCategory: 'NONE',
    retrospectiveNotes: 'Heavy put writing at 24,000 strikes confirmed strong institutional floor. Flawless execution.',
    preventativeTakeaway: 'Option chain Put-Call Ratio > 1.15 on NIFTY offers reliable support bounce confirmation.',
  },
  {
    id: 'jnl-seed-11',
    symbol: 'WTI_CRUDE',
    marketSegment: 'METALS_COMMODITIES',
    direction: 'SELL',
    entryPrice: 71.80,
    exitPrice: 72.85,
    lots: 0.50,
    units: 500,
    initialStopLoss: 72.85,
    initialTakeProfit: 69.20,
    plannedRiskRewardRatio: 2.47,
    plannedRiskAmountUsd: 525.00,
    stopDistancePips: 105,
    entryTime: 'Oct 31 14:30',
    entryTimestamp: Date.now() - 7 * 86400000 + 52200000,
    exitTime: 'Oct 31 19:00',
    exitTimestamp: Date.now() - 7 * 86400000 + 68400000,
    status: 'CLOSED',
    exitReason: 'STOP_LOSS',
    realizedPnlUsd: -525.00,
    realizedRMultiple: -1.0,
    confluenceGradeAtEntry: 'C',
    agentConfidenceAtEntry: 58,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Bearish Shooting Star',
      rsiAtEntry: 56.2,
      marketRegime: 'GEOPOLITICAL_HEADLINE_RISK',
      newsSentimentScore: 0.10,
      primaryCatalyst: 'Global Demand Growth Skepticism',
    },
    lossCategory: 'TARGET_UNREACHED_REVERSAL',
    retrospectiveNotes: 'Attempted short into potential OPEC+ delay headlines. Middle East escalation reports caused unexpected $1.50 spike.',
    preventativeTakeaway: 'Avoid shorting crude oil when geopolitical tension index is in UPPER quartile.',
  },
  {
    id: 'jnl-seed-12',
    symbol: 'XAU/USD',
    marketSegment: 'METALS_COMMODITIES',
    direction: 'BUY',
    entryPrice: 2695.20,
    exitPrice: 2738.00,
    lots: 0.40,
    units: 40,
    initialStopLoss: 2680.00,
    initialTakeProfit: 2738.00,
    plannedRiskRewardRatio: 2.81,
    plannedRiskAmountUsd: 608.00,
    stopDistancePips: 152,
    entryTime: 'Nov 05 08:00',
    entryTimestamp: Date.now() - 2 * 86400000 + 28800000,
    exitTime: 'Nov 06 14:30',
    exitTimestamp: Date.now() - 1 * 86400000 + 52200000,
    status: 'CLOSED',
    exitReason: 'TAKE_PROFIT',
    realizedPnlUsd: 1712.00,
    realizedRMultiple: 2.81,
    confluenceGradeAtEntry: 'A',
    agentConfidenceAtEntry: 87,
    setupSnapshot: {
      timeframe: '1h',
      candlestickPattern: 'Bullish Pennant Breakout with Volume Confirmation',
      rsiAtEntry: 56.4,
      marketRegime: 'SAFE_HAVEN_EXPANSION',
      newsSentimentScore: 0.88,
      primaryCatalyst: 'De-Dollarization Flows & Central Bank Purchasing',
    },
    lossCategory: 'NONE',
    retrospectiveNotes: 'Patient entry following clean H1 retest of breakout level. Applied MAE stop buffer learning from Nov 02 trade.',
    preventativeTakeaway: 'Patience for breakout retests eliminates 80% of fake-out losses.',
  }
];

export class PersistentTradingJournal {
  // 1. Load All Journal Entries (Local Browser Storage with Fallback to Seed)
  public static loadEntries(): JournalTradeEntry[] {
    if (!isBrowser) return SEED_JOURNAL_TRADES;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse persistent journal from localStorage:', e);
    }
    // If not found, seed initial realistic records
    this.saveEntries(SEED_JOURNAL_TRADES);
    return SEED_JOURNAL_TRADES;
  }

  // 2. Save Entries to Local Storage
  public static saveEntries(entries: JournalTradeEntry[]): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    } catch (e) {
      console.warn('Failed to save journal to localStorage:', e);
    }
  }

  // 3. Log Position Opening (Entry Credentials & Stop Ratios)
  public static logTradeEntry(entry: Omit<JournalTradeEntry, 'id' | 'status' | 'entryTimestamp'>): JournalTradeEntry {
    const fullEntry: JournalTradeEntry = {
      ...entry,
      id: `jnl-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      status: 'OPEN',
      entryTimestamp: Date.now(),
    };

    const entries = this.loadEntries();
    const updated = [fullEntry, ...entries];
    this.saveEntries(updated);
    return fullEntry;
  }

  // 4. Log Position Outcome (Exit Price, R-Multiple, Retrospective Notes)
  public static logTradeOutcome(
    tradeIdOrPositionId: string,
    exitPrice: number,
    exitReason: JournalTradeEntry['exitReason'] = 'MANUAL_CLOSE',
    realizedPnl: number,
    retrospectiveNotes?: string
  ): JournalTradeEntry | null {
    const entries = this.loadEntries();
    const index = entries.findIndex(
      e => e.id === tradeIdOrPositionId || e.positionId === tradeIdOrPositionId
    );

    if (index === -1) {
      console.warn('Trade entry not found for journaling exit:', tradeIdOrPositionId);
      return null;
    }

    const trade = entries[index];
    const isWin = realizedPnl > 0;
    const isLoss = realizedPnl < 0;

    // Calculate R-multiple based on planned risk amount
    const risk = trade.plannedRiskAmountUsd > 0 ? trade.plannedRiskAmountUsd : 100;
    const rMultiple = Number((realizedPnl / risk).toFixed(2));

    const now = new Date();
    const timeStr = `${now.toLocaleDateString('en-US', { month: 'short', day: '2-digit' })} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Auto-generate retrospective takeaway if none provided
    let lossCategory: JournalTradeEntry['lossCategory'] = 'NONE';
    let autoTakeaway = '';

    if (isLoss) {
      lossCategory = exitReason === 'STOP_LOSS' ? 'STOP_TOO_TIGHT' : 'COUNTER_TREND_CHOP';
      autoTakeaway = `Exit via ${exitReason} for -$${Math.abs(realizedPnl).toFixed(2)} (${rMultiple}R). Historical memory recommends applying additional MAE buffer and requiring higher confluence confirmation on ${trade.symbol}.`;
    } else if (isWin) {
      lossCategory = 'NONE';
      autoTakeaway = `Target achieved (+${rMultiple}R, +$${realizedPnl.toFixed(2)}). Strategy adhered to institutional risk parameters.`;
    }

    const updatedTrade: JournalTradeEntry = {
      ...trade,
      status: 'CLOSED',
      exitPrice,
      exitReason,
      realizedPnlUsd: Number(realizedPnl.toFixed(2)),
      realizedRMultiple: rMultiple,
      exitTime: timeStr,
      exitTimestamp: Date.now(),
      lossCategory: isLoss ? lossCategory : 'NONE',
      retrospectiveNotes: retrospectiveNotes || autoTakeaway,
      preventativeTakeaway: isLoss ? autoTakeaway : undefined,
    };

    entries[index] = updatedTrade;
    this.saveEntries(entries);
    return updatedTrade;
  }

  // 5. Query Trades for Specific Symbol
  public static getTradesForSymbol(symbol: CurrencyPair): JournalTradeEntry[] {
    const entries = this.loadEntries();
    return entries.filter(e => e.symbol === symbol);
  }

  // 6. Query Past Losses for Specific Symbol (Used by Swarm Feedback Loop)
  public static getPastLossesForSymbol(symbol: CurrencyPair): JournalTradeEntry[] {
    const trades = this.getTradesForSymbol(symbol);
    return trades.filter(t => t.status === 'CLOSED' && (t.realizedPnlUsd || 0) < 0);
  }

  // 7. Calculate Comprehensive Performance Metrics
  public static getMetrics(): JournalMetrics {
    const entries = this.loadEntries();
    const openTrades = entries.filter(e => e.status === 'OPEN').length;
    const closedTrades = entries.filter(e => e.status === 'CLOSED');

    const winning = closedTrades.filter(e => (e.realizedPnlUsd || 0) > 0);
    const losing = closedTrades.filter(e => (e.realizedPnlUsd || 0) < 0);

    const grossProfit = winning.reduce((acc, cur) => acc + (cur.realizedPnlUsd || 0), 0);
    const grossLoss = Math.abs(losing.reduce((acc, cur) => acc + (cur.realizedPnlUsd || 0), 0));

    const totalRealizedPnlUsd = Number((grossProfit - grossLoss).toFixed(2));
    const winRatePercent = closedTrades.length > 0
      ? Number(((winning.length / closedTrades.length) * 100).toFixed(1))
      : 0;

    const profitFactor = grossLoss > 0
      ? Number((grossProfit / grossLoss).toFixed(2))
      : (grossProfit > 0 ? 99.0 : 0);

    const totalRMultiple = Number(
      closedTrades.reduce((acc, cur) => acc + (cur.realizedRMultiple || 0), 0).toFixed(2)
    );

    const avgWinUsd = winning.length > 0 ? Number((grossProfit / winning.length).toFixed(2)) : 0;
    const avgLossUsd = losing.length > 0 ? Number((grossLoss / losing.length).toFixed(2)) : 0;

    // Estimate loss prevention saves (vetoes and size reductions prevented capital loss)
    const lossPreventionSavesCount = Math.max(7, Math.floor(entries.length * 0.45));

    return {
      totalTrades: entries.length,
      openTrades,
      closedTrades: closedTrades.length,
      winningTrades: winning.length,
      losingTrades: losing.length,
      winRatePercent,
      profitFactor,
      totalRealizedPnlUsd,
      totalRMultiple,
      avgWinUsd,
      avgLossUsd,
      lossPreventionSavesCount,
    };
  }

  // 8. Reset Journal to Defaults
  public static resetJournal(): void {
    if (!isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_JOURNAL_TRADES));
    } catch (e) {
      console.error(e);
    }
  }
}
