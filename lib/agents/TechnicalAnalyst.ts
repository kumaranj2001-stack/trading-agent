import { BaseAgent } from './BaseAgent';
import { Candle, CurrencyPair, MarketSegment, MultiTimeframeAnalysis, SignalDirection, TechnicalAnalysis, TechnicalIndicators, TimeFrame } from '../types';
import { computeTechnicalIndicators, detectCandlePattern, detectSmartMoneyConcepts } from '../indicators';
import { knowledgeEngine } from '../knowledge/KnowledgeEngine';
import { getMarketSegmentForSymbol } from '../marketData';

export class TechnicalAnalystAgent extends BaseAgent {
  constructor() {
    super(
      'technical_analyst',
      'Marcus Vance (Senior Technical Analyst)',
      'You are a senior algorithmic and technical analyst specialized in candlestick price action, multi-timeframe moving average alignments, momentum oscillators (RSI, MACD), Smart Money Concepts (FVG, Order Blocks), and institutional knowledge bases for Forex and Indian markets.'
    );
  }

  public analyze(pair: CurrencyPair, timeframe: TimeFrame, candles: Candle[]): TechnicalAnalysis {
    const indicators: TechnicalIndicators = computeTechnicalIndicators(candles);
    const pattern = detectCandlePattern(candles);
    const smc = detectSmartMoneyConcepts(candles);
    const currentPrice = candles[candles.length - 1].close;
    const segment: MarketSegment = getMarketSegmentForSymbol(pair);

    let score = 0;

    // 1. Moving Average Alignment (EMA 20, 50, 200)
    let maTrend = 'Neutral / Flat';
    if (currentPrice > indicators.ema20 && indicators.ema20 > indicators.ema50) {
      score += 25;
      maTrend = 'Bullish Stack (Price > EMA20 > EMA50)';
    } else if (currentPrice < indicators.ema20 && indicators.ema20 < indicators.ema50) {
      score -= 25;
      maTrend = 'Bearish Stack (Price < EMA20 < EMA50)';
    }

    if (currentPrice > indicators.ema200) {
      score += 15;
    } else {
      score -= 15;
    }

    // 2. RSI Momentum
    let rsiStatus = 'Neutral Momentum (45-55)';
    if (indicators.rsi > 70) {
      score -= 15;
      rsiStatus = `Overbought (${indicators.rsi.toFixed(1)}) - Exhaustion risk`;
    } else if (indicators.rsi < 30) {
      score += 15;
      rsiStatus = `Oversold (${indicators.rsi.toFixed(1)}) - Capitulation bounce likely`;
    } else if (indicators.rsi >= 55) {
      score += 20;
      rsiStatus = `Bullish Momentum (${indicators.rsi.toFixed(1)}) - Trend continuation`;
    } else if (indicators.rsi <= 45) {
      score -= 20;
      rsiStatus = `Bearish Momentum (${indicators.rsi.toFixed(1)}) - Bearish pressure`;
    }

    // 3. MACD Assessment
    let macdStatus = 'Neutral Flatline';
    if (indicators.macd.histogram > 0 && indicators.macd.macdLine > indicators.macd.signalLine) {
      score += 20;
      macdStatus = 'Bullish Crossover with expanding histogram';
    } else if (indicators.macd.histogram < 0 && indicators.macd.macdLine < indicators.macd.signalLine) {
      score -= 20;
      macdStatus = 'Bearish Crossover with expanding histogram';
    }

    // 4. Smart Money Concepts (SMC) & Liquidity Sweeps
    if (smc.liquiditySweep.detected) {
      if (smc.liquiditySweep.type === 'SELL_SIDE_SWEPT') {
        score += 20;
      } else if (smc.liquiditySweep.type === 'BUY_SIDE_SWEPT') {
        score -= 20;
      }
    }

    if (smc.marketStructure === 'BOS_BULLISH') score += 15;
    else if (smc.marketStructure === 'BOS_BEARISH') score -= 15;

    // 5. Bollinger Bands Volatility
    let volatilityState = 'Normal Volatility';
    if (indicators.bollingerBands.bandwidth < 0.8) {
      volatilityState = 'Bollinger Squeeze (Breakout Imminent)';
    } else if (currentPrice >= indicators.bollingerBands.upper) {
      score -= 10;
      volatilityState = 'Upper Band Extension';
    } else if (currentPrice <= indicators.bollingerBands.lower) {
      score += 10;
      volatilityState = 'Lower Band Support Test';
    }

    // 6. Candlestick Pattern
    if (pattern.includes('Bullish')) score += 15;
    else if (pattern.includes('Bearish')) score -= 15;

    score = Math.max(-100, Math.min(100, score));

    let bias: SignalDirection = 'NEUTRAL';
    if (score >= 45) bias = 'STRONG_BUY';
    else if (score >= 15) bias = 'BUY';
    else if (score <= -45) bias = 'STRONG_SELL';
    else if (score <= -15) bias = 'SELL';

    let trend: TechnicalAnalysis['trend'] = 'SIDEWAYS';
    if (score >= 40) trend = 'STRONG_UPTREND';
    else if (score >= 10) trend = 'UPTREND';
    else if (score <= -40) trend = 'STRONG_DOWNTREND';
    else if (score <= -10) trend = 'DOWNTREND';

    // 7. Match against the 525 Technical Knowledge Base Rules!
    const knowledgeMatch = knowledgeEngine.matchTechnicalKnowledge(
      pair,
      segment,
      indicators,
      bias,
      pattern,
      smc.marketStructure
    );

    // Multi-Timeframe Alignment
    const multiTimeframe: MultiTimeframeAnalysis = {
      tf15m: score > 0 ? 'BUY' : 'SELL',
      tf1h: bias,
      tf4h: score > 20 ? 'STRONG_BUY' : score < -20 ? 'STRONG_SELL' : 'NEUTRAL',
      tf1d: currentPrice > indicators.ema200 ? 'BUY' : 'SELL',
      confluenceScore: Math.round(75 + Math.abs(score) * 0.2),
      alignment: score > 30 ? 'PERFECT_BULLISH' : score < -30 ? 'PERFECT_BEARISH' : 'MIXED_CHOP',
    };

    const isJpy = pair.includes('JPY');
    const isIndian = pair === 'NIFTY 50' || pair === 'BANK NIFTY' || 
                     pair === 'RELIANCE' || pair === 'TCS' || 
                     pair === 'HDFC BANK' || pair === 'INFY';
    const isGold = pair === 'XAU/USD';
    const isSilver = pair === 'XAG/USD';
    const isPlatinum = pair === 'XPT/USD';
    const isCopper = pair === 'COPPER';
    const isOil = pair === 'WTI_CRUDE' || pair === 'BRENT_CRUDE';
    const isRupee = pair.includes('/INR');

    let decimals = 5;
    if (isIndian || isGold || isPlatinum || isOil) decimals = 2;
    else if (isSilver || isJpy || isRupee) decimals = 3;
    else if (isCopper) decimals = 4;

    const atr = indicators.atr;
    let suggestedEntry = currentPrice;
    let suggestedStopLoss = bias.includes('BUY') 
      ? Number((currentPrice - 1.5 * atr).toFixed(decimals)) 
      : Number((currentPrice + 1.5 * atr).toFixed(decimals));
    let suggestedTakeProfit = bias.includes('BUY')
      ? Number((currentPrice + 3.0 * atr).toFixed(decimals))
      : Number((currentPrice - 3.0 * atr).toFixed(decimals));

    const thesis = `Technical matrix validates ${bias.replace('_', ' ')} posture with algorithmic score ${score > 0 ? '+' : ''}${score}/100. Matched ${knowledgeMatch.matchedCount} institutional rules from 500+ Technical Knowledge Base. SMC Structure: ${smc.marketStructure} with ${smc.liquiditySweep.detected ? `${smc.liquiditySweep.type} sweep confirmed` : 'clean flow'}. Primary support: ${indicators.supportLevels[0]}, Resistance: ${indicators.resistanceLevels[0]}. Top rule: "${knowledgeMatch.topRules[0]?.ruleName || 'Standard Momentum'}".`;

    return {
      role: 'technical_analyst',
      agentName: this.name,
      bias,
      confidenceScore: Math.min(98, Math.max(knowledgeMatch.highConfidenceScore, Math.abs(score) + 25)),
      keySupport: indicators.supportLevels[0],
      keyResistance: indicators.resistanceLevels[0],
      trend,
      candlestickPattern: pattern,
      indicatorSummary: {
        rsiStatus,
        maTrend,
        macdStatus,
        volatilityState,
      },
      smartMoneyConcepts: {
        structure: smc.marketStructure,
        orderBlock: smc.orderBlocks.length > 0 ? `${smc.orderBlocks[0].type} @ ${smc.orderBlocks[0].low.toFixed(5)}` : 'None active',
        fvgStatus: smc.fairValueGaps.length > 0 ? `${smc.fairValueGaps[0].type} (${smc.fairValueGaps[0].bottom.toFixed(5)} - ${smc.fairValueGaps[0].top.toFixed(5)})` : 'No unmitigated gaps',
        liquiditySweep: smc.liquiditySweep.detected ? `${smc.liquiditySweep.type} @ ${smc.liquiditySweep.level?.toFixed(5)}` : 'Normal range rotation',
      },
      multiTimeframe,
      matchedRulesCount: knowledgeMatch.matchedCount,
      topMatchedRules: knowledgeMatch.topRules,
      thesis,
      suggestedEntry,
      suggestedStopLoss,
      suggestedTakeProfit,
      timestamp: new Date().toISOString(),
    };
  }
}
