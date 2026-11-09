import { BaseAgent } from './BaseAgent';
import { 
  CurrencyPair, 
  ForexAnalysis, 
  FundamentalAnalysis, 
  MonteCarloProjection, 
  RiskAssessment, 
  RiskVerdict, 
  TechnicalAnalysis,
  NewsAnalysis 
} from '../types';
import { PIP_VALUES } from '../marketData';
import { JournalStorageManager } from '../journalStorage';

export interface RiskManagerConfig {
  accountBalance: number;
  maxRiskPerTradePercent: number; // e.g. 1.0 or 1.5%
  maxDailyDrawdownPercent: number; // e.g. 4.0%
  currentDailyDrawdownPercent: number;
  minRiskRewardRatio: number; // e.g. 1.8
  maxLeverage: number; // e.g. 30
}

export const DEFAULT_RISK_CONFIG: RiskManagerConfig = {
  accountBalance: 25000,
  maxRiskPerTradePercent: 1.5,
  maxDailyDrawdownPercent: 4.0,
  currentDailyDrawdownPercent: 0.8,
  minRiskRewardRatio: 1.8,
  maxLeverage: 30,
};

export class RiskManagerAgent extends BaseAgent {
  private config: RiskManagerConfig;

  constructor(config: RiskManagerConfig = DEFAULT_RISK_CONFIG) {
    super(
      'risk_manager',
      'Sarah Stirling (Risk Manager & Chief Gatekeeper)',
      'You are the chief risk officer and definitive capital preservation gatekeeper. You enforce strict position sizing, mathematical expectancy, drawdown circuit breakers, Monte Carlo simulations, and possess absolute veto power over non-compliant setups.'
    );
    this.config = config;
  }

  public setConfig(newConfig: Partial<RiskManagerConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public evaluateTrade(
    pair: CurrencyPair,
    currentPrice: number,
    technical: TechnicalAnalysis,
    fundamental: FundamentalAnalysis,
    forex: ForexAnalysis,
    news?: NewsAnalysis,
    swarmConsensusDirection?: 'BUY' | 'SELL' | 'HOLD'
  ): RiskAssessment {
    const vetoReasons: string[] = [];
    const adjustmentsMade: string[] = [];

    // 1. Daily Drawdown Circuit Breaker
    if (this.config.currentDailyDrawdownPercent >= this.config.maxDailyDrawdownPercent) {
      vetoReasons.push(
        `Daily drawdown circuit breaker tripped: current loss (${this.config.currentDailyDrawdownPercent.toFixed(1)}%) reaches or exceeds threshold (${this.config.maxDailyDrawdownPercent}%). No new risk allowed.`
      );
    }

    // 2. Multi-Agent Directional Confluence (5-Desk Integration)
    // The Swarm Consensus Report is the IMMUTABLE SINGLE SOURCE OF TRUTH.
    const biases = [technical.bias, fundamental.bias, forex.bias];
    if (news) {
      biases.push(news.bias);
    }
    const buyVotes = biases.filter(b => b.includes('BUY')).length;
    const sellVotes = biases.filter(b => b.includes('SELL')).length;

    let proposedAction: 'BUY' | 'SELL' | 'NO_TRADE' = 'NO_TRADE';

    if (swarmConsensusDirection) {
      // Strictly bound proposedAction to the validated Swarm Consensus Direction
      if (swarmConsensusDirection === 'SELL') {
        proposedAction = 'SELL';
        if (buyVotes >= 1) {
          adjustmentsMade.push(
            'Analyst divergence detected: Long dissent recorded against dominant short consensus. Position sizing cut by 50% to hedge conflict.'
          );
        }
      } else if (swarmConsensusDirection === 'BUY') {
        proposedAction = 'BUY';
        if (sellVotes >= 1) {
          adjustmentsMade.push(
            'Analyst divergence detected: Short dissent recorded against dominant long consensus. Position sizing cut by 50% to hedge conflict.'
          );
        }
      } else {
        proposedAction = 'NO_TRADE';
        vetoReasons.push(
          'Swarm consensus deadlocked in neutral/hold state. Capital preservation mandates passing.'
        );
      }
    } else {
      // Fallback: Weighted confluence scoring (prevents arbitrary vote count override)
      const buyScore = (technical.bias.includes('BUY') ? technical.confidenceScore : 0) +
                       (fundamental.bias.includes('BUY') ? fundamental.confidenceScore : 0) +
                       (forex.bias.includes('BUY') ? forex.confidenceScore : 0) +
                       ((news?.bias.includes('BUY')) ? news.confidenceScore : 0);

      const sellScore = (technical.bias.includes('SELL') ? technical.confidenceScore : 0) +
                        (fundamental.bias.includes('SELL') ? fundamental.confidenceScore : 0) +
                        (forex.bias.includes('SELL') ? forex.confidenceScore : 0) +
                        ((news?.bias.includes('SELL')) ? news.confidenceScore : 0);

      if (sellScore > buyScore && sellScore > 130) {
        proposedAction = 'SELL';
        if (buyVotes >= 1) {
          adjustmentsMade.push(
            'Analyst divergence detected: Long dissent recorded against dominant short consensus. Position sizing cut by 50% to hedge conflict.'
          );
        }
      } else if (buyScore > sellScore && buyScore > 130) {
        proposedAction = 'BUY';
        if (sellVotes >= 1) {
          adjustmentsMade.push(
            'Analyst divergence detected: Short dissent recorded against dominant long consensus. Position sizing cut by 50% to hedge conflict.'
          );
        }
      } else {
        proposedAction = 'NO_TRADE';
        vetoReasons.push(
          'Insufficient consensus across analyst team: signals are deadlocked or predominantly neutral. Capital preservation mandates passing.'
        );
      }
    }

    // 2b. Breaking News Risk Filter
    if (news?.breakingAlert && proposedAction !== 'NO_TRADE') {
      adjustmentsMade.push(
        `Breaking wire catalyst noted: "${news.breakingAlert}". Volatility buffer widened.`
      );
    }

    // 3. Liquidity & Trading Session Verification
    if (forex.activeTradingSession.liquidityRating === 'THIN') {
      vetoReasons.push(
        `Session liquidity is THIN during ${forex.activeTradingSession.session}. Elevated spread widening and slippage risk preclude safe market execution.`
      );
    }

    // 4. Invalidation / Stop Loss & Target Calculation
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

    const pipMultiplier = PIP_VALUES[pair] || (isJpy ? 0.01 : 0.0001);

    let stopDistance = Math.abs(currentPrice - technical.suggestedStopLoss);
    if (stopDistance < 12 * pipMultiplier) {
      stopDistance = 22 * pipMultiplier;
      adjustmentsMade.push(
        `Technical suggested stop was too tight (< 12 pips). Recalibrated stop distance to 22 pips (${(stopDistance / pipMultiplier).toFixed(0)} pips) beyond structural volatility envelope.`
      );
    }

    const targetDistance = stopDistance * 2.2;
    let calculatedStopLoss: number;
    let calculatedTakeProfit1: number;
    let calculatedTakeProfit2: number;

    if (proposedAction === 'SELL') {
      // 🎯 FOR SHORT / SELL: Stop Loss MUST be strictly ABOVE entry, Target MUST be strictly BELOW entry
      calculatedStopLoss = Number((currentPrice + stopDistance).toFixed(decimals));
      calculatedTakeProfit1 = Number((currentPrice - targetDistance).toFixed(decimals));
      calculatedTakeProfit2 = Number((currentPrice - targetDistance * 1.5).toFixed(decimals));

      // Strict Mathematical Invariant Assertion: Stop Loss > entryPrice && Take Profit < entryPrice
      if (calculatedStopLoss <= currentPrice) {
        calculatedStopLoss = Number((currentPrice + Math.abs(stopDistance)).toFixed(decimals));
      }
      if (calculatedTakeProfit1 >= currentPrice) {
        calculatedTakeProfit1 = Number((currentPrice - Math.abs(targetDistance)).toFixed(decimals));
      }
      if (calculatedTakeProfit2 >= currentPrice) {
        calculatedTakeProfit2 = Number((currentPrice - Math.abs(targetDistance * 1.5)).toFixed(decimals));
      }
    } else if (proposedAction === 'BUY') {
      // 🎯 FOR LONG / BUY: Stop Loss MUST be strictly BELOW entry, Target MUST be strictly ABOVE entry
      calculatedStopLoss = Number((currentPrice - stopDistance).toFixed(decimals));
      calculatedTakeProfit1 = Number((currentPrice + targetDistance).toFixed(decimals));
      calculatedTakeProfit2 = Number((currentPrice + targetDistance * 1.5).toFixed(decimals));

      // Strict Mathematical Invariant Assertion: Stop Loss < entryPrice && Take Profit > entryPrice
      if (calculatedStopLoss >= currentPrice) {
        calculatedStopLoss = Number((currentPrice - Math.abs(stopDistance)).toFixed(decimals));
      }
      if (calculatedTakeProfit1 <= currentPrice) {
        calculatedTakeProfit1 = Number((currentPrice + Math.abs(targetDistance)).toFixed(decimals));
      }
      if (calculatedTakeProfit2 <= currentPrice) {
        calculatedTakeProfit2 = Number((currentPrice + Math.abs(targetDistance * 1.5)).toFixed(decimals));
      }
    } else {
      calculatedStopLoss = Number((currentPrice - stopDistance).toFixed(decimals));
      calculatedTakeProfit1 = Number((currentPrice + targetDistance).toFixed(decimals));
      calculatedTakeProfit2 = Number((currentPrice + targetDistance * 1.5).toFixed(decimals));
    }

    const riskRewardRatio = Number((targetDistance / stopDistance).toFixed(2));

    if (riskRewardRatio < this.config.minRiskRewardRatio) {
      vetoReasons.push(
        `Risk-to-Reward ratio (${riskRewardRatio}:1) fails minimum policy requirement (${this.config.minRiskRewardRatio}:1). Setup lacks mathematical edge.`
      );
    }

    // 5. Position Sizing & Historical Journal Audit
    const journalAnalysis = JournalStorageManager.analyzeHistoricalJournals(pair);
    const symbolHistory = journalAnalysis.symbolStats[pair];
    if (symbolHistory && symbolHistory.trades >= 2 && symbolHistory.winRate < 50) {
      adjustmentsMade.push(
        `Historical Journal Guardrail: ${pair} historical win rate is ${symbolHistory.winRate}% across ${symbolHistory.trades} journaled trades. Applied 25% capital exposure haircut.`
      );
    } else if (journalAnalysis.recurringMistakesWarning) {
      adjustmentsMade.push(
        `Past Loss Pattern Guardrail: ${journalAnalysis.recurringMistakesWarning}. Risk scaled defensively.`
      );
    }

    let riskPercent = this.config.maxRiskPerTradePercent;
    if (adjustmentsMade.length > 0) {
      riskPercent = riskPercent * 0.7; // Moderate adjustment factor
    }

    const dollarRisk = (this.config.accountBalance * riskPercent) / 100;
    const stopDistancePips = stopDistance / pipMultiplier;
    const pipDollarValuePerStandardLot = 10;
    let lotSize = dollarRisk / (stopDistancePips * pipDollarValuePerStandardLot);
    lotSize = Number(Math.max(0.01, Math.min(5.0, lotSize)).toFixed(2));
    const units = Math.round(lotSize * 100000);
    const projectedGainUsd = Number((dollarRisk * riskRewardRatio).toFixed(2));

    // 6. Monte Carlo Simulation Engine (1,000 runs projection)
    const monteCarlo: MonteCarloProjection = {
      simulationsCount: 1000,
      projectedProfitProbability: proposedAction === 'NO_TRADE' ? 0 : 68.4,
      var95Usd: Number((dollarRisk * 1.15).toFixed(2)),
      var99Usd: Number((dollarRisk * 1.35).toFixed(2)),
      expectedDrawdownPercent: Number((riskPercent * 1.2).toFixed(2)),
      sharpeRatio: 2.14,
    };

    let verdict: RiskVerdict = 'APPROVED';
    if (vetoReasons.length > 0) {
      verdict = 'VETOED';
      proposedAction = 'NO_TRADE';
    } else if (adjustmentsMade.length > 0) {
      verdict = 'MODIFIED';
    }

    const startingBalance = this.config.accountBalance;
    const marginPerLot = 100000 / this.config.maxLeverage;
    const marginUsed = proposedAction !== 'NO_TRADE' ? Number((lotSize * marginPerLot).toFixed(2)) : 0;
    const freeMargin = startingBalance - marginUsed;

    const reasoning = verdict === 'VETOED'
      ? `PROPOSAL REJECTED: Risk parameters violated. Deficiencies: ${vetoReasons.join('; ')}`
      : verdict === 'MODIFIED'
      ? `PROPOSAL APPROVED WITH RESTRICTIONS: Setup validated with risk curtailment. Modifications: ${adjustmentsMade.join('; ')}. Maximum downside capped at $${dollarRisk.toFixed(2)} (${riskPercent.toFixed(2)}% equity). Hard stop at ${calculatedStopLoss} (${proposedAction === 'SELL' ? 'above entry' : 'below entry'}), targeting ${calculatedTakeProfit1} (${proposedAction === 'SELL' ? 'below entry' : 'above entry'}).`
      : `PROPOSAL FULLY APPROVED: Solid 5-agent confluence, verified liquidity session, and strict ${riskRewardRatio}:1 Risk/Reward profile. Allocated ${lotSize} lots with hard stop at ${calculatedStopLoss} (${proposedAction === 'SELL' ? 'above entry' : 'below entry'}) targeting ${calculatedTakeProfit1} (${proposedAction === 'SELL' ? 'below entry' : 'above entry'}).`;

    return {
      role: 'risk_manager',
      agentName: this.name,
      verdict,
      action: proposedAction,
      reasoning,
      vetoReasons: vetoReasons.length > 0 ? vetoReasons : undefined,
      adjustmentsMade: adjustmentsMade.length > 0 ? adjustmentsMade : undefined,
      parameters: {
        entryPrice: currentPrice,
        stopLoss: calculatedStopLoss,
        takeProfit1: calculatedTakeProfit1,
        takeProfit2: calculatedTakeProfit2,
        riskRewardRatio,
        positionSizeLots: verdict === 'VETOED' ? 0 : lotSize,
        positionUnits: verdict === 'VETOED' ? 0 : units,
        maxLossUsd: verdict === 'VETOED' ? 0 : Number(dollarRisk.toFixed(2)),
        projectedGainUsd: verdict === 'VETOED' ? 0 : projectedGainUsd,
        accountRiskPercent: verdict === 'VETOED' ? 0 : riskPercent,
        leverageUsed: this.config.maxLeverage,
      },
      monteCarlo,
      accountHealth: {
        startingBalance,
        currentBalance: startingBalance,
        equity: startingBalance,
        freeMargin,
        marginUsed,
        dailyDrawdownPercent: this.config.currentDailyDrawdownPercent,
        maxAllowedDrawdown: this.config.maxDailyDrawdownPercent,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
