import { CurrencyPair, Position, RiskVerdict, SwarmConsensusResult, TimeFrame, TradeHistoryItem } from './types';
import { DEFAULT_RISK_CONFIG, RiskManagerConfig } from './agents/RiskManager';

export interface PortfolioState {
  balance: number;
  equity: number;
  freeMargin: number;
  marginUsed: number;
  dailyStartingBalance: number;
  positions: Position[];
  tradeHistory: TradeHistoryItem[];
}

export const INITIAL_PORTFOLIO: PortfolioState = {
  balance: 25000,
  equity: 25000,
  freeMargin: 25000,
  marginUsed: 0,
  dailyStartingBalance: 25000,
  positions: [
    {
      id: 'pos-1',
      symbol: 'EUR/USD',
      type: 'BUY',
      lots: 0.5,
      entryPrice: 1.08420,
      currentPrice: 1.08510,
      stopLoss: 1.08150,
      takeProfit: 1.08980,
      openTime: new Date(Date.now() - 3600000 * 2).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pnl: 45.00,
      pnlPercent: 0.83,
      riskReward: 2.1,
    }
  ],
  tradeHistory: [
    {
      id: 'th-1',
      symbol: 'GBP/USD',
      type: 'SELL',
      lots: 0.4,
      entryPrice: 1.2980,
      exitPrice: 1.2935,
      stopLoss: 1.3005,
      takeProfit: 1.2930,
      openTime: 'Yesterday 14:20',
      closeTime: 'Yesterday 18:45',
      pnl: 180.00,
      outcome: 'WIN',
      riskManagerVerdict: 'APPROVED',
      strategyNotes: 'Forex Analyst flagged DXY momentum; Technical confirmed EMA breakdown. TP reached.',
    },
    {
      id: 'th-2',
      symbol: 'USD/JPY',
      type: 'BUY',
      lots: 0.3,
      entryPrice: 152.10,
      exitPrice: 151.70,
      stopLoss: 151.70,
      takeProfit: 153.20,
      openTime: '2 days ago',
      closeTime: '2 days ago',
      pnl: -80.00,
      outcome: 'LOSS',
      riskManagerVerdict: 'MODIFIED',
      strategyNotes: 'BOJ surprise hawkish commentary triggered Yen spike; stopped out cleanly with restricted size.',
    }
  ],
};
