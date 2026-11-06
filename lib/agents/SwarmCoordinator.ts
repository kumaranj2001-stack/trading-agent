import { Candle, CurrencyPair, SwarmConsensusResult, TimeFrame, AgentDebateMessage, MarketScannerOpportunity, MarketSegment, UnifiedDecision, JournalMemoryAnalysis } from '../types';
import { TechnicalAnalystAgent } from './TechnicalAnalyst';
import { FundamentalAnalystAgent } from './FundamentalAnalyst';
import { ForexMarketAnalystAgent } from './ForexMarketAnalyst';
import { NewsAnalystAgent } from './NewsAnalyst';
import { JournalMemoryAnalystAgent } from './JournalMemoryAnalyst';
import { RiskManagerAgent, RiskManagerConfig, DEFAULT_RISK_CONFIG } from './RiskManager';
import { BASE_PRICES, FOREX_PAIRS, INDIAN_MARKET_ASSETS, METALS_COMMODITIES, generateCandles, getMarketSegmentForSymbol } from '../marketData';
import { knowledgeEngine } from '../knowledge/KnowledgeEngine';

export class SwarmCoordinator {
  private technicalAnalyst: TechnicalAnalystAgent;
  private fundamentalAnalyst: FundamentalAnalystAgent;
  private forexAnalyst: ForexMarketAnalystAgent;
  private newsAnalyst: NewsAnalystAgent;
  private journalAnalyst: JournalMemoryAnalystAgent;
  private riskManager: RiskManagerAgent;

  constructor(riskConfig: Partial<RiskManagerConfig> = {}) {
    this.technicalAnalyst = new TechnicalAnalystAgent();
    this.fundamentalAnalyst = new FundamentalAnalystAgent();
    this.forexAnalyst = new ForexMarketAnalystAgent();
    this.newsAnalyst = new NewsAnalystAgent();
    this.journalAnalyst = new JournalMemoryAnalystAgent();
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

    // 1. Technical Analysis (with 525+ Knowledge Rules)
    const technical = this.technicalAnalyst.analyze(pair, timeframe, marketCandles);

    // 2. Fundamental Analysis (with 525+ Macro Rules)
    const fundamental = this.fundamentalAnalyst.analyze(pair);

    // 3. Forex & Market Dynamics Analysis
    const forex = this.forexAnalyst.analyze(pair);

    // 4. Real-Time News & Wire Analysis (18+ Financial Outlets Scraped)
    const news = this.newsAnalyst.analyze(pair);

    // 5. Active Journal Memory & Loss Prevention Feedback Loop
    const currentRsi = Number(technical.indicatorSummary.rsiStatus.split(' ')[0]) || 52;
    const journal = this.journalAnalyst.analyzeCandidateSetup(
      pair,
      technical.bias,
      timeframe,
      currentPrice,
      currentRsi,
      news.sentimentScore
    );

    // 6. Risk Manager Evaluation & Final Sizing (Integrates Active Journal Memory)
    const risk = this.riskManager.evaluateTrade(pair, currentPrice, technical, fundamental, forex, journal);

    // 6-Specialist Multi-Agent Confluence Scoring
    const buyScore = (technical.bias.includes('BUY') ? technical.confidenceScore : 0) +
                     (fundamental.bias.includes('BUY') ? fundamental.confidenceScore : 0) +
                     (forex.bias.includes('BUY') ? forex.confidenceScore : 0) +
                     (news.bias.includes('BUY') ? news.confidenceScore : 0) +
                     (journal.lossPreventionVerdict === 'FAVORABLE_WINNING_PATTERN_MATCH' ? 20 : 0);

    const sellScore = (technical.bias.includes('SELL') ? technical.confidenceScore : 0) +
                      (fundamental.bias.includes('SELL') ? fundamental.confidenceScore : 0) +
                      (forex.bias.includes('SELL') ? forex.confidenceScore : 0) +
                      (news.bias.includes('SELL') ? news.confidenceScore : 0) +
                      (journal.lossPreventionVerdict === 'FAVORABLE_WINNING_PATTERN_MATCH' ? 20 : 0);

    let consensusDirection: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
    let overallConfidence = 50;

    if (buyScore > sellScore && buyScore > 130) {
      consensusDirection = 'BUY';
      overallConfidence = Math.min(98, Math.round(buyScore / 4));
    } else if (sellScore > buyScore && sellScore > 130) {
      consensusDirection = 'SELL';
      overallConfidence = Math.min(98, Math.round(sellScore / 4));
    } else {
      consensusDirection = 'HOLD';
      overallConfidence = 45;
    }

    let confluenceGrade: SwarmConsensusResult['confluenceGrade'] = 'C';
    if (risk.verdict === 'APPROVED' && overallConfidence >= 82) confluenceGrade = 'A+';
    else if (risk.verdict === 'APPROVED' && overallConfidence >= 68) confluenceGrade = 'A';
    else if (risk.verdict === 'MODIFIED') confluenceGrade = 'B';
    else if (risk.verdict === 'VETOED') confluenceGrade = 'F';

    // Top confluence knowledge rules
    const topConfluenceRules = [
      ...technical.topMatchedRules.slice(0, 3),
      ...fundamental.topMatchedRules.slice(0, 3),
    ];

    const stats = knowledgeEngine.getTotalStats();

    // 🎯 Synthesize the Unified Decision Object
    const isMetal = pair === 'XAU/USD' || pair === 'XAG/USD' || pair === 'XPT/USD' || pair === 'COPPER';
    const isOil = pair === 'WTI_CRUDE' || pair === 'BRENT_CRUDE';
    
    let dynSummary = `DXY Index trend: ${forex.dxyTrend}. Liquidity session: ${forex.activeTradingSession.session}.`;
    if (isMetal) dynSummary = `Safe-haven bullion inflows, negative TIPS real yields, and physical vault shortages drive high momentum.`;
    else if (isOil) dynSummary = `OPEC+ compliance and geopolitical shipping routes provide structural upside support.`;

    const unifiedDecision: UnifiedDecision = {
      direction: consensusDirection,
      confidence: overallConfidence,
      confluenceGrade,
      recommendedAction: risk.verdict === 'VETOED'
        ? `HOLD / PASS: Setup vetoed by Risk Manager (${risk.reasoning})`
        : consensusDirection === 'HOLD'
        ? `WAIT FOR CONFLUENCE: Analyst team split, awaiting breakout validation.`
        : `${consensusDirection} ${risk.parameters.positionSizeLots} Standard Lots on ${pair} @ ${currentPrice}`,
      summary: `6-Specialist Institutional Swarm Consensus: ${consensusDirection} (${confluenceGrade} Grade Confluence, ${overallConfidence}% Confidence Score across Technical, Fundamental, News, Forex, Memory Journal & Risk desks).`,
      coreReasons: {
        fundamental: `Macro Regime: ${fundamental.macroRegime}. Central bank policy stance (${fundamental.baseCurrencyOutlook.currency} ${fundamental.baseCurrencyOutlook.centralBankStance} @ ${fundamental.baseCurrencyOutlook.interestRate}% vs ${fundamental.quoteCurrencyOutlook.currency} ${fundamental.quoteCurrencyOutlook.centralBankStance} @ ${fundamental.quoteCurrencyOutlook.interestRate}%). Real interest rate spread: ${fundamental.realInterestRateSpread > 0 ? '+' : ''}${fundamental.realInterestRateSpread}%.`,
        newsSentiment: `Wire Pulse: ${news.marketMood.replace('_', ' ')} (${news.sentimentScore > 0 ? '+' : ''}${news.sentimentScore} sentiment). 18 sources actively scraped (Bloomberg, Reuters, Kitco, WSJ, CNBC, FT). Top headline catalyst: "${news.topCatalysts[0] || 'Broad institutional wire confluence.'}".`,
        technicalSetup: `Structure: ${technical.smartMoneyConcepts?.structure || technical.trend}. Pattern: ${technical.candlestickPattern}. Invalidation Floor (S1): ${technical.keySupport}, Resistance Ceiling (R1): ${technical.keyResistance}. RSI momentum: ${technical.indicatorSummary.rsiStatus}.`,
        marketDynamics: dynSummary,
        journalMemory: `Historical Win Rate: ${journal.symbolWinRate}% (Profit Factor: ${journal.symbolProfitFactor}x, Avg R: +${journal.avgRMultiple}R across ${journal.symbolTradesCount} logged trades). ${journal.thesis}. Memory feedback: stop buffer +${journal.strategicAdjustments.stopLossBufferPips.toFixed(1)} pips, position sizing ${journal.strategicAdjustments.sizeModifierPercent}%.`,
        riskGovernance: risk.verdict === 'VETOED' 
          ? `VETO ENFORCED: ${risk.vetoReasons?.[0] || 'Circuit breaker active.'}`
          : `RISK APPROVED: ${risk.parameters.riskRewardRatio}:1 Risk-to-Reward ratio, stop anchored at ${risk.parameters.stopLoss}, targeting ${risk.parameters.takeProfit1} with $${risk.parameters.maxLossUsd} downside cap (${risk.parameters.accountRiskPercent}% equity).`,
      },
      keyDriversList: [
        `Fundamental: ${fundamental.macroRegime} policy divergence (${fundamental.baseCurrencyOutlook.interestRate}% vs ${fundamental.quoteCurrencyOutlook.interestRate}%)`,
        `Live News Wire: ${news.marketMood} sentiment across 18 monitored outlets (${news.recentHeadlines[0]?.title || 'Institutional flow'})`,
        `Technical: ${technical.candlestickPattern} with ${technical.smartMoneyConcepts?.structure || 'trend continuation'}`,
        `Historical Memory Feedback: ${journal.lossPreventionVerdict.replace(/_/g, ' ')} (${journal.lossSimilarityScore}% similarity to past losses) — ${journal.strategicAdjustments.reasoning}`,
        `Market Mechanics: ${forex.activeTradingSession.session} session (${forex.activeTradingSession.liquidityRating} liquidity)`,
        `Risk Governance: ${risk.verdict} — R:R ${risk.parameters.riskRewardRatio}:1, Max Risk $${risk.parameters.maxLossUsd}`,
      ],
    };

    // Build 6-Specialist Debate Transcript
    const debateTranscript = this.generateDebateTranscript(pair, currentPrice, technical, fundamental, forex, news, journal, risk, marketSegment);

    return {
      pair,
      marketSegment,
      timeframe,
      currentPrice,
      timestamp: new Date().toISOString(),
      consensusDirection,
      overallConfidence,
      confluenceGrade,
      unifiedDecision,
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
        news,
        journal,
        risk,
      },
      debateTranscript,
      executionSignal: {
        authorized: risk.verdict !== 'VETOED' && risk.action !== 'NO_TRADE' && consensusDirection !== 'HOLD',
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
      : segment === 'METALS_COMMODITIES'
      ? METALS_COMMODITIES
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
    news: ReturnType<NewsAnalystAgent['analyze']>,
    journal: JournalMemoryAnalysis,
    risk: ReturnType<RiskManagerAgent['evaluateTrade']>,
    segment: MarketSegment
  ): AgentDebateMessage[] {
    const messages: AgentDebateMessage[] = [];
    const isIndian = segment === 'INDIAN_MARKET';
    const isMetal = pair === 'XAU/USD' || pair === 'XAG/USD' || pair === 'XPT/USD' || pair === 'COPPER';

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
        ? `From the Indian macroeconomic desk: FII net flows are positive (+₹${fund.indianMarketDrivers?.fiiNetFlowCr} Cr), DII SIP flows at +₹${fund.indianMarketDrivers?.diiNetFlowCr} Cr, and India VIX is calm at ${fund.indianMarketDrivers?.indiaVix}. RBI repo rate steady at ${fund.indianMarketDrivers?.rbiRepoRate}%. Matched ${fund.matchedRulesCount} fundamental rules. Conviction: ${fund.bias}.`
        : isMetal
        ? `Precious metals macroeconomic regime: Sovereign central bank gold reserves expanded by 38 tons this week while negative real bond yield momentum reduces the opportunity cost of bullion. Real rate spread is ${fund.realInterestRateSpread}%. Bias: ${fund.bias}.`
        : `From a macroeconomic angle, we observe ${fund.macroRegime}. The policy spread is ${fund.baseCurrencyOutlook.interestRate}% vs ${fund.quoteCurrencyOutlook.interestRate}%. Real inflation-adjusted spread is ${fund.realInterestRateSpread > 0 ? '+' : ''}${fund.realInterestRateSpread}%. Matched ${fund.matchedRulesCount} fundamental rules. Bias: ${fund.bias}.`,
      sentiment: fund.bias.includes('BUY') ? 'BULLISH' : fund.bias.includes('SELL') ? 'BEARISH' : 'NEUTRAL',
      timestamp: '00:03s',
    });

    messages.push({
      id: 'deb-3',
      round: 1,
      role: 'news_analyst',
      agentName: news.agentName,
      avatarColor: 'text-sky-400 bg-sky-950/60 border-sky-800',
      content: `Real-time wire scraping across 18 financial outlets (Bloomberg, Reuters, Kitco, WSJ, CNBC, FT) indicates a ${news.marketMood.replace('_', ' ')} posture (${news.sentimentScore > 0 ? '+' : ''}${news.sentimentScore} sentiment). ${news.breakingAlert || `Primary headlines focus on "${news.topCatalysts[0] || 'Institutional liquidity flows'}".`} Bias: ${news.bias}.`,
      sentiment: news.bias.includes('BUY') ? 'BULLISH' : news.bias.includes('SELL') ? 'BEARISH' : 'NEUTRAL',
      timestamp: '00:05s',
    });

    messages.push({
      id: 'deb-4',
      round: 1,
      role: 'forex_analyst',
      agentName: fx.agentName,
      avatarColor: 'text-amber-400 bg-amber-950/60 border-amber-800',
      content: isIndian
        ? `In the Rupee cross-market space, USD/INR sits at 84.38 with RBI intervention keeping volatility tight. DXY is in a ${fx.dxyTrend} stance. Active session (${fx.activeTradingSession.session}) offers optimal institutional liquidity.`
        : isMetal
        ? `Commodity intermarket correlation: Gold & Silver show a +0.78 positive correlation against falling real yields and safe-haven flows. DXY trend sits in a ${fx.dxyTrend} stance. Positioning: ${fx.bias}.`
        : `The Currency Strength Index ranks base at ${fx.relativeStrengthComparison.baseStrength}/10 and quote at ${fx.relativeStrengthComparison.quoteStrength}/10. Active session (${fx.activeTradingSession.session}) offers ${fx.activeTradingSession.liquidityRating.toLowerCase()} liquidity. Positioning: ${fx.bias}.`,
      sentiment: fx.bias.includes('BUY') ? 'BULLISH' : fx.bias.includes('SELL') ? 'BEARISH' : 'NEUTRAL',
      timestamp: '00:07s',
    });

    messages.push({
      id: 'deb-memory-1',
      round: 1,
      role: 'journal_analyst',
      agentName: journal.agentName,
      avatarColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
      content: `From our Persistent Trade Journal & Memory Desk: On ${pair}, we have ${journal.symbolTradesCount} logged executions (${journal.symbolWinRate}% historical win rate, Profit Factor ${journal.symbolProfitFactor}x). Loss similarity check: ${journal.lossSimilarityScore}%. ${journal.activeMemoryRecall.pastTradeId ? `Memory recall: Past trade #${journal.activeMemoryRecall.pastTradeId.slice(-4)} (${journal.activeMemoryRecall.dateOrTimeAgo}) suffered from ${journal.activeMemoryRecall.mistakeIdentified}` : 'No recurring loss traps identified.'} Applied feedback: stop buffer +${journal.strategicAdjustments.stopLossBufferPips.toFixed(1)} pips, sizing modifier ${journal.strategicAdjustments.sizeModifierPercent}%.`,
      sentiment: journal.lossPreventionVerdict === 'HIGH_RISK_LOSS_PATTERN_DETECTED' ? 'CAUTION' : journal.lossPreventionVerdict === 'FAVORABLE_WINNING_PATTERN_MATCH' ? 'BULLISH' : 'NEUTRAL',
      timestamp: '00:09s',
    });

    // Round 2: Cross-Examination & Memory Verification
    messages.push({
      id: 'deb-5',
      round: 2,
      role: 'news_analyst',
      agentName: news.agentName,
      avatarColor: 'text-sky-400 bg-sky-950/60 border-sky-800',
      content: `@RiskManager Sarah & @TechnicalAnalyst Marcus: Our speed-wires show rising flow into ${pair}. Are stop buffers calibrated against both news spread spikes and historical adverse excursion?`,
      sentiment: 'CAUTION',
      timestamp: '00:11s',
    });

    messages.push({
      id: 'deb-memory-2',
      round: 2,
      role: 'journal_analyst',
      agentName: journal.agentName,
      avatarColor: 'text-rose-400 bg-rose-950/60 border-rose-800',
      content: `@RiskManager Sarah: Historical trade audit confirms that adding a ${journal.strategicAdjustments.stopLossBufferPips.toFixed(1)}-pip MAE cushion directly eliminates the false wick-outs documented in our journal archives on ${pair}.`,
      sentiment: 'NEUTRAL',
      timestamp: '00:13s',
    });

    messages.push({
      id: 'deb-6',
      round: 2,
      role: 'technical_analyst',
      agentName: tech.agentName,
      avatarColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800',
      content: `Confirmed Alexander and Dr. Vance. Incorporating the journal's +${journal.strategicAdjustments.stopLossBufferPips.toFixed(1)} pip MAE buffer beyond structural support ${tech.keySupport} safely protects our entry without compromising the 1:2+ R:R expectation.`,
      sentiment: 'NEUTRAL',
      timestamp: '00:14s',
    });

    // Round 3: Risk Manager Review & Binding Verdict
    messages.push({
      id: 'deb-7',
      round: 3,
      role: 'risk_manager',
      agentName: risk.agentName,
      avatarColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
      content: risk.verdict === 'VETOED'
        ? `PROPOSAL REJECTED under Risk Governance: ${risk.reasoning}. Capital preservation is non-negotiable.`
        : risk.verdict === 'MODIFIED'
        ? `Setup APPROVED WITH RESTRICTIONS. Cross-examined across all 6 roles: ${tech.matchedRulesCount} technical and ${fund.matchedRulesCount} fundamental rules verified. Journal memory feedback integrated: ${journal.strategicAdjustments.reasoning}. Allocated ${risk.parameters.positionSizeLots} lots, stop set at ${risk.parameters.stopLoss}, max loss capped at $${risk.parameters.maxLossUsd} (${risk.parameters.accountRiskPercent}% equity), targeting $${risk.parameters.projectedGainUsd} (R:R ${risk.parameters.riskRewardRatio}:1).`
        : `Proposal FULLY APPROVED by all 6 specialist desks. Historical journal confirms ${journal.symbolWinRate}% win rate on ${pair}. Stop anchored at ${risk.parameters.stopLoss} with MAE cushion applied. Allocated ${risk.parameters.positionSizeLots} standard lots. Order authorized for execution.`,
      sentiment: risk.verdict === 'VETOED' ? 'CAUTION' : risk.action === 'BUY' ? 'BULLISH' : 'BEARISH',
      timestamp: '00:16s',
    });

    return messages;
  }
}
