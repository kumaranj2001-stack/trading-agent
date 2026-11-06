import { BaseAgent } from './BaseAgent';
import { CurrencyPair, NewsAnalysis, SignalDirection } from '../types';
import { realTimeNewsEngine } from '../newsEngine';

export class NewsAnalystAgent extends BaseAgent {
  constructor() {
    super(
      'news_analyst',
      'Alexander Vance (Chief Real-Time News & Wire Analyst)',
      'You are the chief real-time financial wire and news analyst. You continuously scrape and monitor 18 global financial websites, central bank dispatches, precious metals bullion feeds, and macroeconomic calendars in real time to synthesize breaking sentiment, detect critical market-moving headlines, and supply the swarm with instant informational edge.'
    );
  }

  public analyze(symbol: CurrencyPair): NewsAnalysis {
    const headlines = realTimeNewsEngine.scrapeNewsForSymbol(symbol);
    const synthesis = realTimeNewsEngine.synthesizeSentiment(headlines);

    let bias: SignalDirection = 'NEUTRAL';
    if (synthesis.sentimentScore >= 0.65) bias = 'STRONG_BUY';
    else if (synthesis.sentimentScore >= 0.20) bias = 'BUY';
    else if (synthesis.sentimentScore <= -0.65) bias = 'STRONG_SELL';
    else if (synthesis.sentimentScore <= -0.20) bias = 'SELL';

    const confidenceScore = Math.min(95, Math.round(Math.abs(synthesis.sentimentScore) * 45 + 50));

    const isMetal = symbol === 'XAU/USD' || symbol === 'XAG/USD' || symbol === 'XPT/USD' || symbol === 'COPPER';
    const isOil = symbol === 'WTI_CRUDE' || symbol === 'BRENT_CRUDE';
    const isIndian = symbol === 'NIFTY 50' || symbol === 'BANK NIFTY' || symbol.includes('/INR') || symbol === 'RELIANCE';

    let assetContext = `across major forex currency crosses`;
    if (isMetal) assetContext = `across physical bullion desks (Kitco, LBMA, COMEX) and sovereign gold reserve inflows`;
    else if (isOil) assetContext = `across OPEC+ supply quota compliance, Middle East transit routes, and SPR repurchases`;
    else if (isIndian) assetContext = `across Indian cash market FII/DII liquidity, RBI MPC guidance, and NSE derivatives positioning`;

    const thesis = `Real-time synthesis across 18 monitored financial outlets confirms a ${synthesis.marketMood.replace('_', ' ')} posture (${synthesis.sentimentScore > 0 ? '+' : ''}${synthesis.sentimentScore} sentiment score) ${assetContext}. Primary wire drivers: ${synthesis.topCatalysts.slice(0, 2).join('; ')}.`;

    return {
      role: 'news_analyst',
      agentName: this.name,
      bias,
      confidenceScore,
      sentimentScore: synthesis.sentimentScore,
      sourcesMonitoredCount: synthesis.sourcesMonitoredCount,
      breakingAlert: synthesis.breakingAlert,
      recentHeadlines: headlines,
      topCatalysts: synthesis.topCatalysts,
      marketMood: synthesis.marketMood,
      thesis,
      timestamp: new Date().toISOString(),
    };
  }
}
