import { BaseAgent } from './BaseAgent';
import { CurrencyPair, FundamentalAnalysis, IndianMarketMetrics, MarketSegment, SignalDirection } from '../types';
import { getMarketSegmentForSymbol, INDIAN_MARKET_TELEMETRY, MACRO_ECONOMIC_CALENDAR } from '../marketData';
import { knowledgeEngine } from '../knowledge/KnowledgeEngine';

export class FundamentalAnalystAgent extends BaseAgent {
  constructor() {
    super(
      'fundamental_analyst',
      'Dr. Elena Rostova (Senior Fundamental Strategist)',
      'You are a senior macroeconomist and fundamental strategist specializing in global central bank policy, RBI monetary transmission, sovereign debt dynamics, FII/DII institutional liquidity, and high-conviction fundamental knowledge bases.'
    );
  }

  public analyze(pair: CurrencyPair): FundamentalAnalysis {
    const segment: MarketSegment = getMarketSegmentForSymbol(pair);
    const isIndian = segment === 'INDIAN_MARKET';
    const parts = pair.split('/');
    const base = parts[0];
    const quote = parts[1] || 'INR';

    const centralBanks: Record<string, { stance: 'HAWKISH' | 'NEUTRAL' | 'DOVISH'; rate: number; inflation: number; sentiment: string }> = {
      USD: { stance: 'HAWKISH', rate: 4.75, inflation: 2.4, sentiment: 'Resilient services demand and sticky labor costs keeping Fed cautious on further cuts.' },
      EUR: { stance: 'DOVISH', rate: 3.25, inflation: 2.0, sentiment: 'Stagnant manufacturing output across Germany and France prompting ECB easing.' },
      GBP: { stance: 'NEUTRAL', rate: 4.75, inflation: 2.3, sentiment: 'Persistent wage growth balancing sluggish UK GDP expansion.' },
      JPY: { stance: 'HAWKISH', rate: 0.25, inflation: 2.5, sentiment: 'Bank of Japan proceeding with historic normalization of zero interest rate policy.' },
      AUD: { stance: 'HAWKISH', rate: 4.35, inflation: 2.8, sentiment: 'RBA keeping restrictive stance on domestic consumption resilience.' },
      CAD: { stance: 'DOVISH', rate: 3.75, inflation: 1.9, sentiment: 'Bank of Canada aggressively lowering borrowing costs to avert recession.' },
      CHF: { stance: 'DOVISH', rate: 1.00, inflation: 1.1, sentiment: 'SNB combating Swiss Franc overvaluation with preemptive rate reductions.' },
      NZD: { stance: 'DOVISH', rate: 4.75, inflation: 2.2, sentiment: 'RBNZ pivoting to fast easing amidst declining domestic business confidence.' },
      INR: { stance: 'NEUTRAL', rate: 6.50, inflation: 4.8, sentiment: 'RBI balancing strong 7.2% GDP growth with food inflation vigilance via liquidity management.' },
    };

    const baseOutlook = centralBanks[base] || (isIndian ? centralBanks['INR'] : { stance: 'NEUTRAL', rate: 3.0, inflation: 2.5, sentiment: 'Stable macro baseline.' });
    const quoteOutlook = centralBanks[quote] || { stance: 'NEUTRAL', rate: 3.0, inflation: 2.5, sentiment: 'Stable macro baseline.' };

    const nominalDiff = baseOutlook.rate - quoteOutlook.rate;
    const baseRealRate = baseOutlook.rate - baseOutlook.inflation;
    const quoteRealRate = quoteOutlook.rate - quoteOutlook.inflation;
    const realRateSpread = Number((baseRealRate - quoteRealRate).toFixed(2));

    let macroScore = 0;

    if (isIndian) {
      // Indian Market specific fundamental driver scoring
      const telemetry: IndianMarketMetrics = INDIAN_MARKET_TELEMETRY;
      if (telemetry.fiiNetFlowCr > 1000) macroScore += 30; // FII Buying
      else if (telemetry.fiiNetFlowCr < -1000) macroScore -= 30;

      if (telemetry.diiNetFlowCr > 1500) macroScore += 20; // DII SIP support

      if (telemetry.indiaVix < 15) macroScore += 15; // Low VIX = Risk-on
      else if (telemetry.indiaVix > 18) macroScore -= 20; // High VIX = Fear

      if (telemetry.niftyPcr > 1.0) macroScore += 15; // Bullish Put-Call Ratio
      else if (telemetry.niftyPcr < 0.8) macroScore -= 15;
    } else {
      const stanceValue = { 'HAWKISH': 1, 'NEUTRAL': 0, 'DOVISH': -1 };
      const stanceDiff = stanceValue[baseOutlook.stance] - stanceValue[quoteOutlook.stance];

      macroScore += stanceDiff * 35;
      macroScore += nominalDiff * 15;
      macroScore += realRateSpread * 10;
    }

    let macroRegime = isIndian 
      ? 'Indian Pro-Growth Capex & Domestic SIP Inflow Regime' 
      : 'Monetary Policy Divergence Dynamic';

    let geopoliticalRiskLevel: FundamentalAnalysis['geopoliticalRiskLevel'] = 'MODERATE';
    if (pair.includes('JPY') || pair.includes('CHF')) {
      geopoliticalRiskLevel = 'ELEVATED';
    }

    macroScore = Math.max(-100, Math.min(100, Math.round(macroScore)));

    let bias: SignalDirection = 'NEUTRAL';
    if (macroScore >= 35) bias = 'STRONG_BUY';
    else if (macroScore >= 10) bias = 'BUY';
    else if (macroScore <= -35) bias = 'STRONG_SELL';
    else if (macroScore <= -10) bias = 'SELL';

    // Match against the 525 Fundamental Knowledge Base Rules!
    const knowledgeMatch = knowledgeEngine.matchFundamentalKnowledge(
      pair,
      segment,
      bias,
      nominalDiff,
      isIndian ? INDIAN_MARKET_TELEMETRY.fiiNetFlowCr : undefined,
      isIndian ? INDIAN_MARKET_TELEMETRY.indiaVix : undefined
    );

    const events = MACRO_ECONOMIC_CALENDAR.filter(e => e.region === base || e.region === quote || (isIndian && e.region === 'INR'));

    const thesis = isIndian
      ? `Indian Macro Regime: ${macroRegime}. FII net cash inflow at +₹${INDIAN_MARKET_TELEMETRY.fiiNetFlowCr} Cr, counterbalanced by domestic SIP inflow of +₹${INDIAN_MARKET_TELEMETRY.diiNetFlowCr} Cr. India VIX at ${INDIAN_MARKET_TELEMETRY.indiaVix} indicates stable market breadth. RBI repo rate steady at 6.50%. Matched ${knowledgeMatch.matchedCount} fundamental rules from the 500+ Fundamental Knowledge Base. Conviction: ${bias.replace('_', ' ')}.`
      : `Macroeconomic regime: ${macroRegime}. Benchmark spread: ${nominalDiff > 0 ? '+' : ''}${nominalDiff.toFixed(2)}%, Real rate spread: ${realRateSpread > 0 ? '+' : ''}${realRateSpread}%. Matched ${knowledgeMatch.matchedCount} fundamental rules. Primary trigger: "${knowledgeMatch.topRules[0]?.ruleName || 'Policy Spread Advantage'}".`;

    return {
      role: 'fundamental_analyst',
      agentName: this.name,
      bias,
      confidenceScore: Math.min(98, Math.max(knowledgeMatch.highConfidenceScore, Math.abs(macroScore) + 25)),
      macroRegime,
      yieldSpread2Y10Y: pair.includes('USD') ? -0.12 : 0.25,
      realInterestRateSpread: realRateSpread,
      baseCurrencyOutlook: {
        currency: base,
        centralBankStance: baseOutlook.stance,
        interestRate: baseOutlook.rate,
        inflationRate: baseOutlook.inflation,
        sentiment: baseOutlook.sentiment,
      },
      quoteCurrencyOutlook: {
        currency: quote,
        centralBankStance: quoteOutlook.stance,
        interestRate: quoteOutlook.rate,
        inflationRate: quoteOutlook.inflation,
        sentiment: quoteOutlook.sentiment,
      },
      indianMarketDrivers: isIndian ? INDIAN_MARKET_TELEMETRY : undefined,
      highImpactEvents: events,
      matchedRulesCount: knowledgeMatch.matchedCount,
      topMatchedRules: knowledgeMatch.topRules,
      thesis,
      geopoliticalRiskLevel,
      timestamp: new Date().toISOString(),
    };
  }
}
