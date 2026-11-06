import { Candle, CurrencyPair, SwarmConsensusResult, TimeFrame, AgentDebateMessage, MarketScannerOpportunity, MarketSegment } from '../types';
import { TechnicalAnalystAgent } from './TechnicalAnalyst';
import { FundamentalAnalystAgent } from './FundamentalAnalyst';
import { ForexMarketAnalystAgent } from './ForexMarketAnalyst';
import { RiskManagerAgent, RiskManagerConfig, DEFAULT_RISK_CONFIG } from './RiskManager';
import { BASE_PRICES, FOREX_PAIRS, INDIAN_MARKET_ASSETS, generateCandles, getMarketSegmentForSymbol } from '../marketData';
import { knowledgeEngine } from '../knowledge/KnowledgeEngine';

export class SwarmCoordinator {
  private technicalAnalyst: TechnicalAnalystAgent;
  private fundamentalAnalyst: FundamentalAnalystAgent;
  private forexAnalyst: ForexMarketAnalystAgent;
  private riskManager: RiskManagerAgent;

  constructor(riskConfig: Partial<RiskManagerConfig> = {}) {
    this.technicalAnalyst = new TechnicalAnalystAgent();
    this.fundamentalAnalyst = new FundamentalAnalystAgent();
    this.forexAnalyst = new ForexMarketAnalystAgent();
    this.riskManager = new RiskManagerAgent({ ...DEFAULT_RISK_CONFIG, ...riskConfig });
  }

  public runConsensus(
    pair: CurrencyPair,
    timeframe: TimeFrame = '1h',
    candles?: Candle[]
  ): SwarmConsensusResult {
    const marketCandles = candles && candles.length > 0 ? candles : generateCandles(pair, timeframe, 60);
    const currentPrice = marketCandles[marketCandles.length - 1].close;
    const marketSegment: MarketSegment = getMarketSegmentForSymbol(pair);

    // 1. Technical Analysis (with 500+ Knowledge Rule matching)
    const technical = this.technicalAnalyst.analyze(pair, timeframe, marketCandles);

    // 2. Fundamental Analysis (with 500+ Knowledge Rule matching & Indian Market drivers)
    const fundamental = this.fundamentalAnalyst.analyze(pair);

    // 3. Forex & Market Dynamics Analysis
    const forex = this.forexAnalyst.analyze(pair);

    // 4. Risk Manager Evaluation & Final Sizing
    const risk = this.riskManager.evaluateTrade(pair, currentPrice, technical, fundamental, forex);

    // Confluence Scoring
    const buyScore = (technical.bias.includes('BUY') ? technical.confidenceScore : 0) +
                     (fundamental.bias.includes('BUY') ? fundamental.confidenceScore : 0) +
                     (forex.bias.includes('BUY') ? forex.confidenceScore : 0);

    const sellScore = (technical.bias.includes('SELL') ? technical.confidenceScore : 0) +
                      (fundamental.bias.includes('SELL') ? fundamental.confidenceScore : 0) +
                      (forex.bias.includes('SELL') ? forex.confidenceScore : 0);

    let consensusDirection: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let overallConfidence = 50;

    if (buyScore > sellScore && buyScore > 100) {
      consensusDirection = 'BUY';
      overallConfidence = Math.round(buyScore / 3);
    } else if (sellScore > buyScore && sellScore > 100) {
      consensusDirection = 'SELL';
      overallConfidence = Math.round(sellScore / 3);
    } else {
      consensusDirection = 'HOLD';
      overallConfidence = 45;
    }

    let confluenceGrade: SwarmConsensusResult['confluenceGrade'] = 'C';
    if (risk.verdict === 'APPROVED' && overallConfidence >= 85) confluenceGrade = 'A+';
    else if (risk.verdict === 'APPROVED' && overallConfidence >= 70) confluenceGrade = 'A';
    else if (risk.verdict === 'MODIFIED') confluenceGrade = 'B';
    else if (risk.verdict === 'VETOED') confluenceGrade = 'F';

    // Aggregate top confluence knowledge rules from both agents
    const topConfluenceRules = [
      ...technical.topMatchedRules.slice(0, 3),
      ...fundamental.topMatchedRules.slice(0, 3),
    ];

    const stats = knowledgeEngine.getTotalStats();

    // Build Debate Transcript
    const debateTranscript = this.generateDebateTranscript(pair, currentPrice, technical, fundamental, forex, risk, marketSegment);

    return {
      pair,
      marketSegment,
      timeframe,
      currentPrice,
      timestamp: new Date().toISOString(),
      consensusDirection,
      overallConfidence,
      confluenceGrade,
      knowledgeSummary: {
        totalTechnicalRulesLoaded: stats.technicalCount,
        totalFundamentalRulesLoaded: stats.fundamentalCount,
        matchedTechnicalRules: technical.matchedRulesCount,
        matchedFundamentalRules: fundamental.matchedRulesCount,
        topConfluenceRules,
      },
      agents: {
        technical,
        fundamental,
        forex,
        risk,
      },
      debateTranscript,
      executionSignal: {
        authorized: risk.verdict !== 'VETOED' && risk.action !== 'NO_TRADE',
        orderType: risk.action === 'BUY' ? 'BUY_MARKET' : risk.action === 'SELL' ? 'SELL_MARKET' : 'NONE',
        symbol: pair,
        lots: risk.parameters.positionSizeLots,
        entry: risk.parameters.entryPrice,
        stopLoss: risk.parameters.stopLoss,
        takeProfit: risk.parameters.takeProfit1,
        riskReward: risk.parameters.riskRewardRatio,
        riskAmountUsd: risk.parameters.maxLossUsd,
        status: risk.verdict === 'VETOED' ? 'VETOED' : 'READY',
      },
    };
  }

  // Multi-Pair & Multi-Market Opportunity Scanner
  public scanAllOpportunities(segment?: MarketSegment): MarketScannerOpportunity[] {
    const symbolsToScan = segment === 'INDIAN_MARKET' 
      ? INDIAN_MARKET_ASSETS 
      : segment === 'FOREX' 
      ? FOREX_PAIRS 
      : (Object.keys(BASE_PRICES) as CurrencyPair[]);

    const opportunities: MarketScannerOpportunity[] = [];

    for (const pair of symbolsToScan) {
      const result = this.runConsensus(pair, '1h');
      const tech = result.agents.technical;
      const fund = result.agents.fundamental;
      const fx = result.agents.forex;
      const risk = result.agents.risk;

      let status: MarketScannerOpportunity['status'] = 'MODERATE_SETUP';
      if (risk.verdict === 'VETOED') status = 'VETOED';
      else if (result.confluenceGrade === 'A+' || result.confluenceGrade === 'A') status = 'PRIME_SETUP';
      else if (result.overallConfidence < 50) status = 'AVOID_NO_EDGE';

      opportunities.push({
        pair,
        segment: result.marketSegment,
        price: result.currentPrice,
        bias: tech.bias,
        technicalScore: tech.confidenceScore,
        fundamentalScore: fund.confidenceScore,
        forexScore: fx.confidenceScore,
        riskVerdict: risk.verdict,
        grade: result.confluenceGrade,
        potentialLots: risk.parameters.positionSizeLots,
        riskReward: risk.parameters.riskRewardRatio,
        status,
      });
    }

    const gradeWeight = { 'A+': 5, 'A': 4, 'B': 3, 'C': 2, 'F': 1 };
    return opportunities.sort((a, b) => gradeWeight[b.grade] - gradeWeight[a.grade]);
  }

  private generateDebateTranscript(
    pair: CurrencyPair,
    price: number,
    tech: ReturnType<TechnicalAnalystAgent['analyze']>,
    fund: ReturnType<FundamentalAnalystAgent['analyze']>,
    fx: ReturnType<ForexMarketAnalystAgent['analyze']>,
    risk: ReturnType<RiskManagerAgent['evaluateTrade']>,
    segment: MarketSegment
  ): AgentDebateMessage[] {
    const messages: AgentDebateMessage[] = [];
    const isIndian = segment === 'INDIAN_MARKET';

    // Round 1: Specialist Theses
    messages.push({
      id: 'deb-1',
      round: 1,
      role: 'technical_analyst',
      agentName: tech.agentName,
      avatarColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
      content: `I've mapped the chart structure on ${pair} (${segment}). Price action exhibits ${tech.candlestickPattern} with ${tech.smartMoneyConcepts?.structure}. RSI sits at ${tech.indicatorSummary.rsiStatus.split(' ')[0]}. Matched ${tech.matchedRulesCount} patterns from our 500+ Technical Knowledge Base. Primary support is at ${tech.keySupport}, resistance at ${tech.keyResistance}. Bias: ${tech.bias}.`,
      sentiment: tech.bias.includes('BUY') ? 'BULLISH' : tech.bias.includes('SELL') ? 'BEARISH' : 'NEUTRAL',
      timestamp: '00:01s',
    });

    messages.push({
      id: 'deb-2',
      round: 1,
      role: 'fundamental_analyst',
      agentName: fund.agentName,
      avatarColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
      content: isIndian
        ? `From the Indian macroeconomic desk: FII net flows are positive (+₹${fund.indianMarketDrivers?.fiiNetFlowCr} Cr), DII SIP flows at +₹${fund.indianMarketDrivers?.diiNetFlowCr} Cr, and India VIX is calm at ${fund.indianMarketDrivers?.indiaVix}. RBI repo rate steady at ${fund.indianMarketDrivers?.rbiRepoRate}%. Matched ${fund.matchedRulesCount} rules from 500+ Fundamental Knowledge Base. Conviction: ${fund.bias}.`
        : `From a macroeconomic angle, we observe ${fund.macroRegime}. The policy spread is ${fund.baseCurrencyOutlook.interestRate}% vs ${fund.quoteCurrencyOutlook.interestRate}%. Real inflation-adjusted spread is ${fund.realInterestRateSpread > 0 ? '+' : ''}${fund.realInterestRateSpread}%. Matched ${fund.matchedRulesCount} fundamental rules. Bias: ${fund.bias}.`,
      sentiment: fund.bias.includes('BUY') ? 'BULLISH' : fund.bias.includes('SELL') ? 'BEARISH' : 'NEUTRAL',
      timestamp: '00:03s',
    });

    messages.push({
      id: 'deb-3',
      round: 1,
      role: 'forex_analyst',
      agentName: fx.agentName,
      avatarColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
      content: isIndian
        ? `In the Rupee cross-market space, USD/INR sits at 84.38 with RBI intervention keeping volatility tight. DXY is in a ${fx.dxyTrend} stance. We are in the ${fx.activeTradingSession.session} session with optimal domestic institutional liquidity.`
        : `The Currency Strength Index ranks base at ${fx.relativeStrengthComparison.baseStrength}/10 and quote at ${fx.relativeStrengthComparison.quoteStrength}/10. Carry yield is ${fx.carryTradeYieldSpread > 0 ? '+' : ''}${fx.carryTradeYieldSpread}%. Active session (${fx.activeTradingSession.session}) offers ${fx.activeTradingSession.liquidityRating.toLowerCase()} liquidity. Positioning: ${fx.bias}.`,
      sentiment: fx.bias.includes('BUY') ? 'BULLISH' : fx.bias.includes('SELL') ? 'BEARISH' : 'NEUTRAL',
      timestamp: '00:05s',
    });

    // Round 2: Cross-Examination
    messages.push({
      id: 'deb-4',
      round: 2,
      role: 'fundamental_analyst',
      agentName: fund.agentName,
      avatarColor: 'text-purple-400 bg-purple-950/60 border-purple-800',
      content: `@TechnicalAnalyst Marcus, verify whether your entry level on ${pair} accounts for the upcoming catalyst print and institutional block liquidity. Has the ATR stop been placed beyond the institutional sweep zone?`,
      sentiment: 'CAUTION',
      timestamp: '00:08s',
    });

    messages.push({
      id: 'deb-5',
      round: 2,
      role: 'technical_analyst',
      agentName: tech.agentName,
      avatarColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
      content: `Yes Dr. Rostova. Knowledge rule "${tech.topMatchedRules[0]?.ruleName || 'SMC Liquidity Sweep'}" mandates placing our stop loss 1.5x ATR below structural support ${tech.keySupport}, well insulated from routine stop hunts.`,
      sentiment: 'NEUTRAL',
      timestamp: '00:11s',
    });

    // Round 3: Risk Manager Review & Binding Verdict
    messages.push({
      id: 'deb-6',
      round: 3,
      role: 'risk_manager',
      agentName: risk.agentName,
      avatarColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      content: risk.verdict === 'VETOED'
        ? `PROPOSAL REJECTED under Risk Governance: ${risk.reasoning}. Capital preservation is non-negotiable.`
        : risk.verdict === 'MODIFIED'
        ? `Setup APPROVED WITH ADJUSTMENTS. Cross-examined against 1,000+ institutional rules: ${tech.matchedRulesCount} technical and ${fund.matchedRulesCount} fundamental matches confirmed. Sizing allocated at ${risk.parameters.positionSizeLots} lots, max loss limited to $${risk.parameters.maxLossUsd} (${risk.parameters.accountRiskPercent}% equity), targeting $${risk.parameters.projectedGainUsd} (R:R ${risk.parameters.riskRewardRatio}:1).`
        : `Proposal FULLY APPROVED. High confluence across all 4 agents validated by top institutional rules. Sizing set at ${risk.parameters.positionSizeLots} standard lots with hard stop at ${risk.parameters.stopLoss}. Order authorized for execution.`,
      sentiment: risk.verdict === 'VETOED' ? 'CAUTION' : risk.action === 'BUY' ? 'BULLISH' : 'BEARISH',
      timestamp: '00:15s',
    });

    return messages;
  }
}
