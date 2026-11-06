import { Candle, CurrencyPair, CurrencyStrength, IndianMarketAsset, IndianMarketMetrics, MacroIndicator, MarketSegment, TimeFrame } from './types';

export const FOREX_PAIRS: CurrencyPair[] = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP'
];

export const INDIAN_MARKET_ASSETS: CurrencyPair[] = [
  'NIFTY 50', 'BANK NIFTY', 'USD/INR', 'EUR/INR', 'GBP/INR', 'RELIANCE', 'TCS', 'HDFC BANK', 'INFY'
];

export const BASE_PRICES: Record<CurrencyPair, number> = {
  // Forex Majors
  'EUR/USD': 1.0850,
  'GBP/USD': 1.2940,
  'USD/JPY': 153.25,
  'AUD/USD': 0.6580,
  'USD/CAD': 1.3890,
  'USD/CHF': 0.8670,
  'NZD/USD': 0.5980,
  'EUR/GBP': 0.8385,
  // Indian Market & Currency
  'NIFTY 50': 24180.50,
  'BANK NIFTY': 51840.25,
  'USD/INR': 84.38,
  'EUR/INR': 91.55,
  'GBP/INR': 109.28,
  'RELIANCE': 2715.40,
  'TCS': 4125.60,
  'HDFC BANK': 1748.20,
  'INFY': 1828.50,
};

export const PIP_VALUES: Record<CurrencyPair, number> = {
  'EUR/USD': 0.0001,
  'GBP/USD': 0.0001,
  'USD/JPY': 0.01,
  'AUD/USD': 0.0001,
  'USD/CAD': 0.0001,
  'USD/CHF': 0.0001,
  'NZD/USD': 0.0001,
  'EUR/GBP': 0.0001,
  'NIFTY 50': 0.05,
  'BANK NIFTY': 0.05,
  'USD/INR': 0.0025,
  'EUR/INR': 0.0025,
  'GBP/INR': 0.0025,
  'RELIANCE': 0.05,
  'TCS': 0.05,
  'HDFC BANK': 0.05,
  'INFY': 0.05,
};

// Maps internal symbols to real OANDA / TradingView widget symbols!
export const OANDA_TRADINGVIEW_MAP: Record<CurrencyPair, string> = {
  'EUR/USD': 'OANDA:EURUSD',
  'GBP/USD': 'OANDA:GBPUSD',
  'USD/JPY': 'OANDA:USDJPY',
  'AUD/USD': 'OANDA:AUDUSD',
  'USD/CAD': 'OANDA:USDCAD',
  'USD/CHF': 'OANDA:USDCHF',
  'NZD/USD': 'OANDA:NZDUSD',
  'EUR/GBP': 'OANDA:EURGBP',
  'NIFTY 50': 'NSE:NIFTY',
  'BANK NIFTY': 'NSE:BANKNIFTY',
  'USD/INR': 'FX_IDC:USDINR',
  'EUR/INR': 'FX_IDC:EURINR',
  'GBP/INR': 'FX_IDC:GBPINR',
  'RELIANCE': 'NSE:RELIANCE',
  'TCS': 'NSE:TCS',
  'HDFC BANK': 'NSE:HDFCBANK',
  'INFY': 'NSE:INFY',
};

export function getMarketSegmentForSymbol(symbol: CurrencyPair): MarketSegment {
  return INDIAN_MARKET_ASSETS.includes(symbol) ? 'INDIAN_MARKET' : 'FOREX';
}

export function generateCandles(pair: CurrencyPair, timeframe: TimeFrame, count: number = 60): Candle[] {
  const basePrice = BASE_PRICES[pair] || 100.0;
  const isJpy = pair.includes('JPY');
  const isIndianIndex = pair === 'NIFTY 50' || pair === 'BANK NIFTY';
  const isIndianStock = pair === 'RELIANCE' || pair === 'TCS' || pair === 'HDFC BANK' || pair === 'INFY';
  const isRupeePair = pair.includes('/INR');

  let pip = 0.0001;
  let volatility = 0.0012;

  if (isIndianIndex) {
    pip = 0.05;
    volatility = basePrice * 0.0018; // ~40-60 points
  } else if (isIndianStock) {
    pip = 0.05;
    volatility = basePrice * 0.0025; // ~5-10 INR
  } else if (isRupeePair) {
    pip = 0.0025;
    volatility = 0.04;
  } else if (isJpy) {
    pip = 0.01;
    volatility = 0.15;
  }

  const candles: Candle[] = [];
  let currentClose = basePrice;
  const now = Date.now();
  const intervals: Record<TimeFrame, number> = {
    '1m': 60 * 1000,
    '5m': 5 * 60 * 1000,
    '15m': 15 * 60 * 1000,
    '1h': 60 * 60 * 1000,
    '4h': 4 * 60 * 60 * 1000,
    '1d': 24 * 60 * 60 * 1000,
  };

  const intervalMs = intervals[timeframe];
  const startTime = now - count * intervalMs;

  for (let i = 0; i < count; i++) {
    const timeMs = startTime + i * intervalMs;
    const timeStr = new Date(timeMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const wave = Math.sin(i / 5) * volatility * 0.6;
    const randomStep = (Math.random() - 0.49) * volatility * 1.4;
    const open = currentClose;
    const decimalPlaces = (isIndianIndex || isIndianStock) ? 2 : (isJpy || isRupeePair ? 3 : 5);
    const close = Number((open + wave + randomStep).toFixed(decimalPlaces));
    const high = Number((Math.max(open, close) + Math.random() * volatility * 0.7).toFixed(decimalPlaces));
    const low = Number((Math.min(open, close) - Math.random() * volatility * 0.7).toFixed(decimalPlaces));
    const volume = Math.floor(10000 + Math.random() * 50000);

    candles.push({
      time: timeStr,
      timestamp: timeMs,
      open,
      high,
      low,
      close,
      volume,
    });

    currentClose = close;
  }

  return candles;
}

export const INDIAN_MARKET_TELEMETRY: IndianMarketMetrics = {
  fiiNetFlowCr: 1845.50,
  diiNetFlowCr: 2310.20,
  indiaVix: 14.15,
  niftyPcr: 1.18,
  giftNiftyDelta: 42.50,
  rbiRepoRate: 6.50,
  inrUsdRate: 84.38,
  tradingSession: 'REGULAR_NSE',
};

export const MACRO_ECONOMIC_CALENDAR: MacroIndicator[] = [
  {
    name: 'RBI Monetary Policy Repo Rate Decision',
    region: 'INR',
    actual: '6.50%',
    forecast: '6.50%',
    previous: '6.50%',
    impact: 'HIGH',
    date: '2026-12-06',
  },
  {
    name: 'India Retail CPI Inflation YoY',
    region: 'INR',
    actual: '4.85%',
    forecast: '4.90%',
    previous: '5.08%',
    impact: 'HIGH',
    date: '2026-11-12',
  },
  {
    name: 'Fed Interest Rate Decision',
    region: 'USD',
    actual: '4.75%',
    forecast: '4.75%',
    previous: '5.00%',
    impact: 'HIGH',
    date: '2026-11-05',
  },
  {
    name: 'US Non-Farm Payrolls (NFP)',
    region: 'USD',
    actual: '175K',
    forecast: '160K',
    previous: '223K',
    impact: 'HIGH',
    date: '2026-11-06',
  },
  {
    name: 'Eurozone Harmonised CPI YoY',
    region: 'EUR',
    actual: '2.1%',
    forecast: '2.1%',
    previous: '2.2%',
    impact: 'HIGH',
    date: '2026-11-04',
  },
  {
    name: 'Bank of Japan Policy Rate',
    region: 'JPY',
    actual: '0.25%',
    forecast: '0.25%',
    previous: '0.25%',
    impact: 'HIGH',
    date: '2026-11-02',
  },
];

export const CURRENCY_STRENGTH_INDEX: CurrencyStrength[] = [
  { currency: 'USD', score: 7.8, trend: 'STRENGTHENING' },
  { currency: 'INR', score: 7.2, trend: 'STABLE' },
  { currency: 'EUR', score: 6.2, trend: 'STABLE' },
  { currency: 'GBP', score: 5.9, trend: 'WEAKENING' },
  { currency: 'JPY', score: 3.4, trend: 'WEAKENING' },
  { currency: 'AUD', score: 6.8, trend: 'STRENGTHENING' },
  { currency: 'CAD', score: 5.1, trend: 'STABLE' },
  { currency: 'CHF', score: 7.1, trend: 'STRENGTHENING' },
];

export function getActiveTradingSession(): {
  session: 'TOKYO' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP' | 'NSE_INDIA' | 'OFF_HOURS';
  liquidityRating: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'THIN';
  volatilityExpected: 'HIGH' | 'NORMAL' | 'SUBDUED';
} {
  const currentUtcHour = new Date().getUTCHours();
  const currentUtcMinute = new Date().getUTCMinutes();
  const istMinutes = currentUtcHour * 60 + currentUtcMinute + 330; // UTC+5:30
  const istHour = Math.floor((istMinutes / 60) % 24);

  // NSE Indian hours: 09:15 to 15:30 IST (03:45 to 10:00 UTC)
  if (istHour >= 9 && istHour <= 15) {
    return {
      session: 'NSE_INDIA',
      liquidityRating: 'OPTIMAL',
      volatilityExpected: 'HIGH',
    };
  }

  if (currentUtcHour >= 13 && currentUtcHour <= 16) {
    return {
      session: 'LONDON_NY_OVERLAP',
      liquidityRating: 'OPTIMAL',
      volatilityExpected: 'HIGH',
    };
  } else if (currentUtcHour >= 8 && currentUtcHour < 13) {
    return {
      session: 'LONDON',
      liquidityRating: 'OPTIMAL',
      volatilityExpected: 'HIGH',
    };
  } else if (currentUtcHour > 16 && currentUtcHour <= 21) {
    return {
      session: 'NEW_YORK',
      liquidityRating: 'MODERATE',
      volatilityExpected: 'NORMAL',
    };
  } else if (currentUtcHour >= 0 && currentUtcHour < 8) {
    return {
      session: 'TOKYO',
      liquidityRating: 'MODERATE',
      volatilityExpected: 'NORMAL',
    };
  } else {
    return {
      session: 'OFF_HOURS',
      liquidityRating: 'THIN',
      volatilityExpected: 'SUBDUED',
    };
  }
}
