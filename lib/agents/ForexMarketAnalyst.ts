import { BaseAgent } from './BaseAgent';
import { CurrencyPair, ForexAnalysis, SignalDirection } from '../types';
import { CURRENCY_STRENGTH_INDEX, getActiveTradingSession } from '../marketData';

export class ForexMarketAnalystAgent extends BaseAgent {
  constructor() {
    super(
      'forex_analyst',
      'Kenji Sato (Forex Market Analyst)',
      'You are a high-tier foreign exchange specialist focusing on currency strength relativity, carry trade interest rate spreads, Dollar Index (DXY) trend transmissions, intermarket cross-asset flows, and global FX liquidity sessions.'
    );
  }

  public analyze(pair: CurrencyPair): ForexAnalysis {
    const [base, quote] = pair.split('/');
    const session = getActiveTradingSession();

    // 1. Currency Strength Meter lookup
    const baseCS = CURRENCY_STRENGTH_INDEX.find(c => c.currency === base)?.score || 5.0;
    const quoteCS = CURRENCY_STRENGTH_INDEX.find(c => c.currency === quote)?.score || 5.0;
    const strengthDelta = baseCS - quoteCS; // -10 to +10

    // 2. DXY Trend evaluation
    const usdCS = CURRENCY_STRENGTH_INDEX.find(c => c.currency === 'USD')?.score || 5.0;
    let dxyTrend: ForexAnalysis['dxyTrend'] = 'RANGING';
    if (usdCS > 7.0) dxyTrend = 'BULLISH';
    else if (usdCS < 4.0) dxyTrend = 'BEARISH';

    // 3. Carry trade yield differential estimation
    const yieldRates: Record<string, number> = {
      USD: 4.75, EUR: 3.25, GBP: 4.75, JPY: 0.25, AUD: 4.35, CAD: 3.75, CHF: 1.00, NZD: 4.75
    };
    const carrySpread = Number(((yieldRates[base] || 3.0) - (yieldRates[quote] || 3.0)).toFixed(2));

    // 4. Intermarket cross-asset correlation
    const intermarketCorrelation: ForexAnalysis['intermarketCorrelation'] = [];
    if (pair.includes('CAD')) {
      intermarketCorrelation.push({
        asset: 'WTI Crude Oil',
        correlation: pair.startsWith('CAD') ? 0.78 : -0.78,
        interpretation: 'Energy exports heavily influence Canadian Dollar terms of trade.',
      });
    }
    if (pair.includes('AUD') || pair.includes('NZD')) {
      intermarketCorrelation.push({
        asset: 'Copper / Commodities Index',
        correlation: 0.82,
        interpretation: 'Strong pro-cyclical commodity sensitivity drives antipodean currencies.',
      });
    }
    if (pair.includes('JPY') || pair.includes('CHF')) {
      intermarketCorrelation.push({
        asset: 'S&P 500 / Global Equities (Risk Appetite)',
        correlation: -0.74,
        interpretation: 'Inverse risk sentiment: equity sell-offs provoke safe-haven capital inflow.',
      });
    }
    intermarketCorrelation.push({
      asset: 'US 10Y Sovereign Yield Spread',
      correlation: pair.includes('USD') ? (pair.startsWith('USD') ? 0.85 : -0.85) : 0.40,
      interpretation: 'Benchmark bond spread remains the prime driver of FX institutional positioning.',
    });

    // 5. Forex Score calculation
    let fxScore = strengthDelta * 12; // -120 to +120
    if (carrySpread > 1.5) fxScore += 15;
    else if (carrySpread < -1.5) fxScore -= 15;

    fxScore = Math.max(-100, Math.min(100, Math.round(fxScore)));

    let bias: SignalDirection = 'NEUTRAL';
    if (fxScore >= 35) bias = 'STRONG_BUY';
    else if (fxScore >= 12) bias = 'BUY';
    else if (fxScore <= -35) bias = 'STRONG_SELL';
    else if (fxScore <= -12) bias = 'SELL';

    const relativeAdvantage = strengthDelta > 0 
      ? `${base} holds strength edge (+${strengthDelta.toFixed(1)} pts) over ${quote}` 
      : `${quote} holds strength edge (+${Math.abs(strengthDelta).toFixed(1)} pts) over ${base}`;

    const thesis = `Forex currency strength matrix registers ${base} at ${baseCS}/10 and ${quote} at ${quoteCS}/10 (${relativeAdvantage}). DXY is in a ${dxyTrend} posture. The net annual carry yield differential is ${carrySpread > 0 ? '+' : ''}${carrySpread}%. Current trading window (${session.session}) provides ${session.liquidityRating.toLowerCase()} liquidity with ${session.volatilityExpected.toLowerCase()} execution slippage. Overall FX positioning tilts ${bias.replace('_', ' ')}.`;

    return {
      role: 'forex_analyst',
      agentName: this.name,
      bias,
      confidenceScore: Math.min(94, Math.abs(fxScore) + 20),
      dxyTrend,
      relativeStrengthComparison: {
        baseStrength: baseCS,
        quoteStrength: quoteCS,
        advantage: relativeAdvantage,
      },
      carryTradeYieldSpread: carrySpread,
      intermarketCorrelation,
      activeTradingSession: session,
      thesis,
      timestamp: new Date().toISOString(),
    };
  }
}
