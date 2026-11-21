import { Candle, CurrencyPair, CurrencyStrength, IndianMarketAsset, IndianMarketMetrics, MacroIndicator, MarketSegment, MetalCommodityAsset, TimeFrame } from './types';

export const FOREX_PAIRS: CurrencyPair[] = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'USD/CHF', 'NZD/USD', 'EUR/GBP'
];

export const METALS_COMMODITIES: CurrencyPair[] = [
  'XAU/USD', 'XAG/USD', 'XPT/USD', 'COPPER', 'WTI_CRUDE', 'BRENT_CRUDE'
];

export const INDIAN_MARKET_ASSETS: CurrencyPair[] = [
  'NIFTY 50', 'BANK NIFTY', 'USD/INR', 'EUR/INR', 'GBP/INR', 'RELIANCE', 'TCS', 'HDFC BANK', 'INFY'
];

export const BASE_PRICES: Record<CurrencyPair, number> = {
  // Forex Majors (Live OANDA / Global Spot Market Parity)
  'EUR/USD': 1.0968,
  'GBP/USD': 1.3086,
  'USD/JPY': 158.56,
  'AUD/USD': 0.6619,
  'USD/CAD': 1.4343,
  'USD/CHF': 0.8401,
  'NZD/USD': 0.5471,
  'EUR/GBP': 0.8382,
  // Metals & Energy Commodities (Live Spot/TradingView OANDA Parity)
  'XAU/USD': 3538.20, // Spot Gold ($/oz) (Matches TradingView OANDA:XAUUSD live feed ~3538)
  'XAG/USD': 41.22,   // Spot Silver ($/oz) (Matches TradingView TVC:SILVER)
  'XPT/USD': 1296.60, // Spot Platinum ($/oz)
  'COPPER': 5.485,    // COMEX Copper ($/lb) (Matches TradingView COMEX:HG1!)
  'WTI_CRUDE': 83.41, // WTI Light Sweet Crude Oil ($/bbl) (Matches TradingView NYMEX:CL1!)
  'BRENT_CRUDE': 92.57,// Brent Global Benchmark ($/bbl) (Matches TradingView NYMEX:BB1!)
  // Indian Market & Currency (Live NSE & FX Parity)
  'NIFTY 50': 25800.60,
  'BANK NIFTY': 64635.20,
  'USD/INR': 92.66,
  'EUR/INR': 101.62,
  'GBP/INR': 121.20,
  'RELIANCE': 1377.50,
  'TCS': 2376.20,
  'HDFC BANK': 846.00,
  'INFY': 1098.00,
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
  // Metals & Commodities
  'XAU/USD': 0.10,    // Gold pip/point
  'XAG/USD': 0.01,    // Silver pip
  'XPT/USD': 0.10,    // Platinum
  'COPPER': 0.001,    // Copper tick
  'WTI_CRUDE': 0.01,  // Oil cent
  'BRENT_CRUDE': 0.01,// Oil cent
  // Indian
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
  // Forex
  'EUR/USD': 'OANDA:EURUSD',
  'GBP/USD': 'OANDA:GBPUSD',
  'USD/JPY': 'OANDA:USDJPY',
  'AUD/USD': 'OANDA:AUDUSD',
  'USD/CAD': 'OANDA:USDCAD',
  'USD/CHF': 'OANDA:USDCHF',
  'NZD/USD': 'OANDA:NZDUSD',
  'EUR/GBP': 'OANDA:EURGBP',
  // Metals & Commodities
  'XAU/USD': 'OANDA:XAUUSD',
  'XAG/USD': 'OANDA:XAGUSD',
  'XPT/USD': 'TVC:PLATINUM',
  'COPPER': 'COMEX:HG1!',
  'WTI_CRUDE': 'NYMEX:CL1!',
  'BRENT_CRUDE': 'NYMEX:BB1!',
  // Indian Markets
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

// Authoritative TradingView Global Scanner tickers for instant REST quote aggregation
export const TRADINGVIEW_SCANNER_MAP: Record<CurrencyPair, string> = {
  'EUR/USD': 'OANDA:EURUSD',
  'GBP/USD': 'OANDA:GBPUSD',
  'USD/JPY': 'OANDA:USDJPY',
  'AUD/USD': 'OANDA:AUDUSD',
  'USD/CAD': 'OANDA:USDCAD',
  'USD/CHF': 'OANDA:USDCHF',
  'NZD/USD': 'OANDA:NZDUSD',
  'EUR/GBP': 'OANDA:EURGBP',
  'XAU/USD': 'OANDA:XAUUSD',
  'XAG/USD': 'TVC:SILVER',
  'XPT/USD': 'TVC:PLATINUM',
  'COPPER': 'COMEX:HG1!',
  'WTI_CRUDE': 'NYMEX:CL1!',
  'BRENT_CRUDE': 'NYMEX:BB1!',
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
  if (INDIAN_MARKET_ASSETS.includes(symbol)) return 'INDIAN_MARKET';
  if (METALS_COMMODITIES.includes(symbol)) return 'METALS_COMMODITIES';
  return 'FOREX';
}

export function generateCandles(pair: CurrencyPair, timeframe: TimeFrame, count: number = 60): Candle[] {
  const basePrice = BASE_PRICES[pair] || 100.0;
  const isJpy = pair.includes('JPY');
  const isIndianIndex = pair === 'NIFTY 50' || pair === 'BANK NIFTY';
  const isIndianStock = pair === 'RELIANCE' || pair === 'TCS' || pair === 'HDFC BANK' || pair === 'INFY';
  const isRupeePair = pair.includes('/INR');
  const isGold = pair === 'XAU/USD';
  const isSilver = pair === 'XAG/USD';
  const isPlatinum = pair === 'XPT/USD';
  const isCopper = pair === 'COPPER';
  const isOil = pair === 'WTI_CRUDE' || pair === 'BRENT_CRUDE';

  let pip = 0.0001;
  let volatility = 0.0012;

  if (isIndianIndex) {
    pip = 0.05;
    volatility = basePrice * 0.0018; // ~40-60 points
  } else if (isIndianStock) {
    pip = 0.05;
    volatility = basePrice * 0.0025; // ~5-10 INR
  } else if (isGold) {
    pip = 0.10;
    volatility = 3.80; // ~$3.80 per gold candle matching OANDA spot gold
  } else if (isSilver) {
    pip = 0.01;
    volatility = 0.18; // ~$0.18 silver move
  } else if (isPlatinum) {
    pip = 0.10;
    volatility = 4.20;
  } else if (isCopper) {
    pip = 0.001;
    volatility = 0.015;
  } else if (isOil) {
    pip = 0.01;
    volatility = 0.45; // ~$0.45 crude move
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
    
    let decimalPlaces = 5;
    if (isIndianIndex || isIndianStock || isGold || isPlatinum || isOil) decimalPlaces = 2;
    else if (isSilver || isJpy || isRupeePair) decimalPlaces = 3;
    else if (isCopper) decimalPlaces = 4;

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
    name: 'Fed FOMC Interest Rate Decision & Powell Presser',
    region: 'USD',
    actual: '4.75%',
    forecast: '4.75%',
    previous: '5.00%',
    impact: 'HIGH',
    date: '2026-11-05',
    time: '14:00 EST / 00:30 IST',
    timeIST: '00:30 IST',
    timeUTC: '19:00 UTC',
    timestamp: 1793905200000,
  },
  {
    name: 'US Spot Gold & Metals Bullion Reserve Inflows',
    region: 'XAU',
    actual: '+38.4 Tons',
    forecast: '+22.0 Tons',
    previous: '+18.5 Tons',
    impact: 'HIGH',
    date: '2026-11-06',
    time: '10:30 EST / 21:00 IST',
    timeIST: '21:00 IST',
    timeUTC: '15:30 UTC',
    timestamp: 1793979000000,
  },
  {
    name: 'US Non-Farm Payrolls (NFP) & Unemployment',
    region: 'USD',
    actual: '175K',
    forecast: '160K',
    previous: '223K',
    impact: 'HIGH',
    date: '2026-11-06',
    time: '08:30 EST / 19:00 IST',
    timeIST: '19:00 IST',
    timeUTC: '13:30 UTC',
    timestamp: 1793971800000,
  },
  {
    name: 'OPEC+ Crude Production Quotas & Strategic Reserve',
    region: 'WTI',
    actual: '-1.2M bpd',
    forecast: '-1.0M bpd',
    previous: '-1.0M bpd',
    impact: 'HIGH',
    date: '2026-11-07',
    time: '12:00 CET / 16:30 IST',
    timeIST: '16:30 IST',
    timeUTC: '11:00 UTC',
    timestamp: 1794049800000,
  },
  {
    name: 'LBMA London Vault Physical Delivery Clearing Report',
    region: 'XAU',
    actual: '+18.2 Tons',
    forecast: '+12.0 Tons',
    previous: '+9.4 Tons',
    impact: 'HIGH',
    date: '2026-11-10',
    time: '15:00 GMT / 20:30 IST',
    timeIST: '20:30 IST',
    timeUTC: '15:00 UTC',
    timestamp: 1794323400000,
  },
  {
    name: 'US EIA Crude Oil Inventory Stocks & SPR Flow',
    region: 'WTI',
    actual: '-2.8M bbl',
    forecast: '-1.5M bbl',
    previous: '+1.2M bbl',
    impact: 'MEDIUM',
    date: '2026-11-11',
    time: '10:30 EST / 21:00 IST',
    timeIST: '21:00 IST',
    timeUTC: '15:30 UTC',
    timestamp: 1794411600000,
  },
  {
    name: 'US Consumer Price Index (CPI) Headline & Core YoY',
    region: 'USD',
    actual: '2.4%',
    forecast: '2.5%',
    previous: '2.6%',
    impact: 'HIGH',
    date: '2026-11-12',
    time: '08:30 EST / 19:00 IST',
    timeIST: '19:00 IST',
    timeUTC: '13:30 UTC',
    timestamp: 1794480600000,
  },
  {
    name: 'S&P Global Flash US Manufacturing PMI',
    region: 'USD',
    actual: '51.8',
    forecast: '50.6',
    previous: '50.2',
    impact: 'HIGH',
    date: '2026-11-14',
    time: '09:45 EST / 20:15 IST',
    timeIST: '20:15 IST',
    timeUTC: '14:45 UTC',
    timestamp: 1794667500000,
  },
  {
    name: 'India Wholesale Price Index (WPI) Inflation YoY',
    region: 'INR',
    actual: '2.14%',
    forecast: '2.20%',
    previous: '2.31%',
    impact: 'MEDIUM',
    date: '2026-11-14',
    time: '12:00 IST / 06:30 UTC',
    timeIST: '12:00 IST',
    timeUTC: '06:30 UTC',
    timestamp: 1794637800000,
  },
  {
    name: 'ECB Monetary Policy Statement & Lagarde Presser',
    region: 'EUR',
    actual: '3.25%',
    forecast: '3.25%',
    previous: '3.50%',
    impact: 'HIGH',
    date: '2026-11-16',
    time: '14:15 CET / 18:45 IST',
    timeIST: '06:45 PM IST',
    timeUTC: '13:15 UTC',
    timestamp: 1794834900000,
  },
  {
    name: 'US Consumer Price Index (CPI) Headline YoY & MoM',
    region: 'USD',
    actual: '2.6%',
    forecast: '2.5%',
    previous: '2.4%',
    impact: 'HIGH',
    date: '2026-11-16',
    time: '08:30 EST / 19:00 IST',
    timeIST: '07:00 PM IST',
    timeUTC: '13:30 UTC',
    timestamp: 1794835800000,
  },
  {
    name: 'US Core CPI YoY & MoM (Ex Food & Energy)',
    region: 'USD',
    actual: '3.3%',
    forecast: '3.3%',
    previous: '3.3%',
    impact: 'HIGH',
    date: '2026-11-16',
    time: '08:30 EST / 19:00 IST',
    timeIST: '07:00 PM IST',
    timeUTC: '13:30 UTC',
    timestamp: 1794835800000,
  },
  {
    name: 'Eurozone Harmonised HICP Inflation Final YoY',
    region: 'EUR',
    actual: '2.0%',
    forecast: '2.0%',
    previous: '1.7%',
    impact: 'HIGH',
    date: '2026-11-16',
    time: '11:00 CET / 15:30 IST',
    timeIST: '03:30 PM IST',
    timeUTC: '10:00 UTC',
    timestamp: 1794823200000,
  },
  {
    name: 'India Consumer Price Index (CPI) Headline YoY',
    region: 'INR',
    actual: '6.21%',
    forecast: '5.81%',
    previous: '5.49%',
    impact: 'HIGH',
    date: '2026-11-16',
    time: '17:30 IST / 12:00 UTC',
    timeIST: '05:30 PM IST',
    timeUTC: '12:00 UTC',
    timestamp: 1794830400000,
  },
  {
    name: 'US Empire State Manufacturing Index',
    region: 'USD',
    actual: '31.2',
    forecast: '-0.7',
    previous: '-11.9',
    impact: 'MEDIUM',
    date: '2026-11-16',
    time: '08:30 EST / 19:00 IST',
    timeIST: '07:00 PM IST',
    timeUTC: '13:30 UTC',
    timestamp: 1794835800000,
  },
  {
    name: 'Eurozone Harmonised CPI YoY',
    region: 'EUR',
    actual: '2.1%',
    forecast: '2.1%',
    previous: '2.2%',
    impact: 'HIGH',
    date: '2026-11-04',
    time: '11:00 CET / 15:30 IST',
    timeIST: '15:30 IST',
    timeUTC: '10:00 UTC',
    timestamp: 1793800200000,
  },
  {
    name: 'Bank of Japan Policy Rate & Yield Curve Control',
    region: 'JPY',
    actual: '0.25%',
    forecast: '0.25%',
    previous: '0.25%',
    impact: 'HIGH',
    date: '2026-11-02',
    time: '11:30 JST / 08:00 IST',
    timeIST: '08:00 IST',
    timeUTC: '02:30 UTC',
    timestamp: 1793608200000,
  },
  {
    name: 'RBI Monetary Policy Repo Rate Decision',
    region: 'INR',
    actual: '6.50%',
    forecast: '6.50%',
    previous: '6.50%',
    impact: 'HIGH',
    date: '2026-12-06',
    time: '10:00 IST / 04:30 UTC',
    timeIST: '10:00 IST',
    timeUTC: '04:30 UTC',
    timestamp: 1796531400000,
  },
];

export const CURRENCY_STRENGTH_INDEX: CurrencyStrength[] = [
  { currency: 'USD', score: 7.8, trend: 'STRENGTHENING' },
  { currency: 'XAU (Gold)', score: 9.2, trend: 'STRENGTHENING' },
  { currency: 'INR', score: 7.2, trend: 'STABLE' },
  { currency: 'EUR', score: 6.2, trend: 'STABLE' },
  { currency: 'GBP', score: 5.9, trend: 'WEAKENING' },
  { currency: 'JPY', score: 3.4, trend: 'WEAKENING' },
  { currency: 'AUD', score: 6.8, trend: 'STRENGTHENING' },
  { currency: 'CAD', score: 5.1, trend: 'STABLE' },
  { currency: 'CHF', score: 7.1, trend: 'STRENGTHENING' },
];

export function getActiveTradingSession(targetDate: Date = new Date()): {
  session: 'TOKYO' | 'LONDON' | 'NEW_YORK' | 'LONDON_NY_OVERLAP' | 'NSE_INDIA' | 'OFF_HOURS' | 'WEEKEND_FREEZE';
  liquidityRating: 'OPTIMAL' | 'MODERATE' | 'LOW' | 'THIN';
  volatilityExpected: 'HIGH' | 'NORMAL' | 'SUBDUED';
  isMarketClosed?: boolean;
} {
  const currentUtcDay = targetDate.getUTCDay();
  const currentUtcHour = targetDate.getUTCHours();
  const currentUtcMinute = targetDate.getUTCMinutes();
  const currentUtcMinutes = currentUtcHour * 60 + currentUtcMinute;

  const istMinutes = currentUtcMinutes + 330;
  const istDay = (currentUtcDay + Math.floor(istMinutes / 1440)) % 7;
  const istHour = Math.floor((istMinutes / 60) % 24);
  const istMinute = istMinutes % 60;
  const istTotal = istHour * 60 + istMinute;

  // Weekend check: Friday 22:00 UTC to Sunday 22:00 UTC
  const isWeekend = 
    (currentUtcDay === 5 && currentUtcMinutes >= 22 * 60) || // Friday after 22:00 UTC
    (currentUtcDay === 6) ||                                 // All Saturday
    (currentUtcDay === 0 && currentUtcMinutes < 22 * 60);    // Sunday before 22:00 UTC

  if (isWeekend) {
    return {
      session: 'WEEKEND_FREEZE',
      liquidityRating: 'THIN',
      volatilityExpected: 'SUBDUED',
      isMarketClosed: true,
    };
  }

  // NSE Indian hours: Monday-Friday 09:15 to 15:30 IST (03:45 to 10:00 UTC)
  if (istDay >= 1 && istDay <= 5 && istTotal >= (9 * 60 + 15) && istTotal <= (15 * 60 + 30)) {
    return {
      session: 'NSE_INDIA',
      liquidityRating: 'OPTIMAL',
      volatilityExpected: 'HIGH',
      isMarketClosed: false,
    };
  }

  if (currentUtcHour >= 13 && currentUtcHour <= 16) {
    return {
      session: 'LONDON_NY_OVERLAP',
      liquidityRating: 'OPTIMAL',
      volatilityExpected: 'HIGH',
      isMarketClosed: false,
    };
  } else if (currentUtcHour >= 8 && currentUtcHour < 13) {
    return {
      session: 'LONDON',
      liquidityRating: 'OPTIMAL',
      volatilityExpected: 'HIGH',
      isMarketClosed: false,
    };
  } else if (currentUtcHour > 16 && currentUtcHour <= 21) {
    return {
      session: 'NEW_YORK',
      liquidityRating: 'MODERATE',
      volatilityExpected: 'NORMAL',
      isMarketClosed: false,
    };
  } else if (currentUtcHour >= 0 && currentUtcHour < 8) {
    return {
      session: 'TOKYO',
      liquidityRating: 'MODERATE',
      volatilityExpected: 'NORMAL',
      isMarketClosed: false,
    };
  } else {
    return {
      session: 'OFF_HOURS',
      liquidityRating: 'THIN',
      volatilityExpected: 'SUBDUED',
      isMarketClosed: false,
    };
  }
}
