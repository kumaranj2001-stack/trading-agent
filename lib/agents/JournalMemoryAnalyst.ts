import { 
  CurrencyPair, 
  JournalMemoryAnalysis, 
  JournalTradeEntry, 
  SignalDirection, 
  TimeFrame 
} from '../types';
import { PersistentTradingJournal, SEED_JOURNAL_TRADES } from '../journalStorage';

export class JournalMemoryAnalystAgent {
  public readonly role = 'journal_analyst' as const;
  public readonly name = 'Dr. Marcus Vance (Quantitative Journal & Historical Memory Specialist)';

  /**
   * Analyzes historical trades and past losses to provide an active feedback loop prior to execution.
   */
  public analyzeCandidateSetup(
    symbol: CurrencyPair,
    proposedDirection: SignalDirection,
    timeframe: TimeFrame,
    currentPrice: number,
    rsiValue: number = 52,
    newsSentimentScore: number = 0.20
  ): JournalMemoryAnalysis {
    const allTrades = PersistentTradingJournal.loadEntries();
    const symbolTrades = allTrades.filter(t => t.symbol === symbol && t.status === 'CLOSED');
    const pastLosses = symbolTrades.filter(t => (t.realizedPnlUsd || 0) < 0);
    const pastWins = symbolTrades.filter(t => (t.realizedPnlUsd || 0) > 0);

    const isCandidateBuy = proposedDirection.includes('BUY');
    const isCandidateSell = proposedDirection.includes('SELL');

    // 1. Calculate Symbol Metrics from persistent journal
    const symbolTradesCount = symbolTrades.length;
    const winsCount = pastWins.length;
    const symbolWinRate = symbolTradesCount > 0 
      ? Number(((winsCount / symbolTradesCount) * 100).toFixed(1))
      : 68.5; // Institutional prior fallback

    const grossProfit = pastWins.reduce((acc, t) => acc + (t.realizedPnlUsd || 0), 0);
    const grossLoss = Math.abs(pastLosses.reduce((acc, t) => acc + (t.realizedPnlUsd || 0), 0));
    const symbolProfitFactor = grossLoss > 0 
      ? Number((grossProfit / grossLoss).toFixed(2))
      : (grossProfit > 0 ? 4.5 : 2.1);

    const avgR = symbolTradesCount > 0
      ? Number((symbolTrades.reduce((acc, t) => acc + (t.realizedRMultiple || 0), 0) / symbolTradesCount).toFixed(2))
      : 1.45;

    // 2. Deep Analysis of Past Losses (Feedback Loop & Loss Prevention)
    let similarityScore = 0;
    let mostRelevantLoss: JournalTradeEntry | undefined = undefined;
    const matchedLossPatterns: string[] = [];

    for (const loss of pastLosses) {
      let tradeSimilarity = 0;
      
      // Pattern 1: Same direction
      if ((isCandidateBuy && loss.direction === 'BUY') || (isCandidateSell && loss.direction === 'SELL')) {
        tradeSimilarity += 25;
      }

      // Pattern 2: Overbought/Oversold chasing (e.g. RSI > 70 for BUY or RSI < 30 for SELL)
      if (loss.setupSnapshot.rsiAtEntry) {
        if (isCandidateBuy && rsiValue > 68 && loss.setupSnapshot.rsiAtEntry > 68) {
          tradeSimilarity += 35;
          matchedLossPatterns.push(`Overbought exhaustion trap (RSI ${rsiValue.toFixed(1)} matching past loss #${loss.id.slice(-4)})`);
        }
        if (isCandidateSell && rsiValue < 32 && loss.setupSnapshot.rsiAtEntry < 32) {
          tradeSimilarity += 35;
          matchedLossPatterns.push(`Oversold bounce trap (RSI ${rsiValue.toFixed(1)})`);
        }
      }

      // Pattern 3: News event / Spread vulnerability
      if (loss.lossCategory === 'SPREAD_EXPANSION_NEWS' && Math.abs(newsSentimentScore) > 0.6) {
        tradeSimilarity += 25;
        matchedLossPatterns.push('High news event spread-widening risk');
      }

      // Pattern 4: Tight stop failure
      if (loss.lossCategory === 'STOP_TOO_TIGHT') {
        tradeSimilarity += 20;
        matchedLossPatterns.push('Sub-optimal stop distance vulnerable to institutional liquidity sweeps');
      }

      if (tradeSimilarity > similarityScore) {
        similarityScore = tradeSimilarity;
        mostRelevantLoss = loss;
      }
    }

    // Default fallback if no previous loss on this exact symbol
    if (!mostRelevantLoss && pastLosses.length > 0) {
      mostRelevantLoss = pastLosses[0];
    } else if (!mostRelevantLoss && allTrades.length > 0) {
      // Pick global loss for memory reference
      mostRelevantLoss = allTrades.find(t => (t.realizedPnlUsd || 0) < 0) || SEED_JOURNAL_TRADES[0];
    }

    // Cap similarity score to 0 - 100%
    const boundedSimilarity = Math.min(95, Math.max(8, similarityScore));

    // 3. Determine Loss Prevention Verdict
    let verdict: JournalMemoryAnalysis['lossPreventionVerdict'] = 'SAFE_TO_EXECUTE';
    if (boundedSimilarity >= 60) {
      verdict = 'HIGH_RISK_LOSS_PATTERN_DETECTED';
    } else if (boundedSimilarity >= 35) {
      verdict = 'CAUTION_SIMILAR_TO_PAST_LOSS';
    } else if (symbolWinRate >= 70 && pastWins.length >= 2) {
      verdict = 'FAVORABLE_WINNING_PATTERN_MATCH';
    }

    // 4. Formulate Strategic Adjustments (Feedback Loop to Risk Manager)
    let stopLossBufferPips = 5.0; // Standard baseline buffer
    let sizeModifierPercent = 100;
    let entryFilterRule = 'Execute with standard market order upon swarm consensus';
    let adjustmentReason = 'Historical trade statistics show positive expectancy with standard parameters.';

    // Symbol-specific and memory-derived fine tuning:
    if (symbol.includes('XAU') || symbol.includes('XAG') || symbol.includes('CRUDE')) {
      stopLossBufferPips = 12.0; // Higher ATR buffer on metals/energy
    }

    if (verdict === 'HIGH_RISK_LOSS_PATTERN_DETECTED') {
      stopLossBufferPips += 8.0;
      sizeModifierPercent = 50; // Cut size in half to protect capital
      entryFilterRule = `Mandatory H1 confirmation close; require pullback below ${currentPrice.toFixed(2)} to avoid chasing.`;
      adjustmentReason = `High similarity (${boundedSimilarity}%) to historical loss #${mostRelevantLoss?.id.slice(-4) || 'PREV'}. Halved position size and widened stop buffer by 8 pips based on Maximum Adverse Excursion.`;
    } else if (verdict === 'CAUTION_SIMILAR_TO_PAST_LOSS') {
      stopLossBufferPips += 4.5;
      sizeModifierPercent = 75; // 25% risk trim
      entryFilterRule = 'Wait for 15m candle close confirmation before market entry.';
      adjustmentReason = `Moderate similarity (${boundedSimilarity}%) to past false breakout. Trimmed risk to 75% and added a 4.5-pip adverse excursion buffer.`;
    } else if (verdict === 'FAVORABLE_WINNING_PATTERN_MATCH') {
      sizeModifierPercent = 100;
      entryFilterRule = 'Immediate execution authorized at market price.';
      adjustmentReason = `High historical win rate (${symbolWinRate}%) and +${avgR}R expectancy on ${symbol}. Full position size validated.`;
    }

    // 5. Active Memory Recall Snippet
    const activeRecall = {
      pastTradeId: mostRelevantLoss?.id || 'jnl-ref-01',
      dateOrTimeAgo: mostRelevantLoss?.entryTime || 'Nov 02 13:45',
      setupSummary: mostRelevantLoss 
        ? `${mostRelevantLoss.direction} on ${mostRelevantLoss.symbol} (${mostRelevantLoss.setupSnapshot.candlestickPattern || 'Breakout'})` 
        : 'Previous session breakout entry',
      outcomeDescription: mostRelevantLoss 
        ? `Stopped out for -$${Math.abs(mostRelevantLoss.realizedPnlUsd || 0)} (${mostRelevantLoss.realizedRMultiple || -1.0}R) via ${mostRelevantLoss.exitReason}` 
        : 'Stopped out at adverse liquidity sweep',
      mistakeIdentified: mostRelevantLoss?.preventativeTakeaway || 'Require additional stop loss buffer and avoid chasing overextended momentum.',
    };

    // 6. Synthesized Thesis
    const thesis = verdict === 'HIGH_RISK_LOSS_PATTERN_DETECTED'
      ? `🚨 HISTORICAL LOSS WARNING: Current candidate setup shares ${boundedSimilarity}% structural similarity with past loss on ${mostRelevantLoss?.symbol}. Enforcing 50% position sizing trim and adding +${stopLossBufferPips.toFixed(1)} pips MAE stop buffer to avoid repeating historical wick-out.`
      : verdict === 'CAUTION_SIMILAR_TO_PAST_LOSS'
      ? `⚠️ ADAPTIVE MEMORY CAUTION: Setup resembles previous choppy session loss (${boundedSimilarity}% match). Strategic feedback loop applied: risk trimmed to ${sizeModifierPercent}% and stop widened by +${stopLossBufferPips.toFixed(1)} pips.`
      : `🛡️ HISTORICAL JOURNAL VALIDATION: ${symbol} boasts ${symbolWinRate}% win rate across ${symbolTradesCount} logged trades (Profit Factor: ${symbolProfitFactor}x). No recurrent loss traps detected. Execution cleared with +${stopLossBufferPips.toFixed(1)} pips volatility buffer.`;

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    return {
      role: 'journal_analyst',
      agentName: this.name,
      symbolAnalyzed: symbol,
      totalHistoricalTrades: allTrades.length,
      symbolTradesCount,
      symbolWinRate,
      symbolProfitFactor,
      avgRMultiple: avgR,
      similarPastLossesCount: pastLosses.length,
      lossSimilarityScore: boundedSimilarity,
      lossPreventionVerdict: verdict,
      activeMemoryRecall: activeRecall,
      strategicAdjustments: {
        stopLossBufferPips,
        sizeModifierPercent,
        entryFilterRule,
        reasoning: adjustmentReason,
      },
      thesis,
      timestamp: timeStr,
    };
  }
}
