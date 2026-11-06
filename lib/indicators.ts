import { Candle, TechnicalIndicators } from './types';

export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]);
      continue;
    }
    const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val, 0);
    sma.push(Number((sum / period).toFixed(5)));
  }
  return sma;
}

export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const multiplier = 2 / (period + 1);

  if (data.length === 0) return ema;

  let currentEma = data[0];
  ema.push(currentEma);

  for (let i = 1; i < data.length; i++) {
    currentEma = (data[i] - currentEma) * multiplier + currentEma;
    ema.push(Number(currentEma.toFixed(5)));
  }
  return ema;
}

export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (closes.length < period + 1) {
    return closes.map(() => 50);
  }

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses += Math.abs(diff);
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < period; i++) {
    rsi.push(50);
  }

  const initialRS = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const initialRSI = 100 - (100 / (1 + initialRS));
  rsi.push(Number(initialRSI.toFixed(2)));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? Math.abs(diff) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      const currentRsi = 100 - (100 / (1 + rs));
      rsi.push(Number(currentRsi.toFixed(2)));
    }
  }

  return rsi;
}

export function calculateMACD(closes: number[]): {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
} {
  const fastEMA = calculateEMA(closes, 12);
  const slowEMA = calculateEMA(closes, 26);

  const macdLine: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    macdLine.push(Number((fastEMA[i] - slowEMA[i]).toFixed(6)));
  }

  const signalLine = calculateEMA(macdLine, 9);
  const histogram: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    histogram.push(Number((macdLine[i] - signalLine[i]).toFixed(6)));
  }

  return { macdLine, signalLine, histogram };
}

export function calculateBollingerBands(closes: number[], period: number = 20, multiplier: number = 2): {
  upper: number[];
  middle: number[];
  lower: number[];
  bandwidth: number[];
} {
  const middle = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];
  const bandwidth: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(closes[i]);
      lower.push(closes[i]);
      bandwidth.push(0);
      continue;
    }

    const slice = closes.slice(i - period + 1, i + 1);
    const mean = middle[i];
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const stdDev = Math.sqrt(variance);

    const up = Number((mean + multiplier * stdDev).toFixed(5));
    const low = Number((mean - multiplier * stdDev).toFixed(5));
    const bw = Number((((up - low) / mean) * 100).toFixed(3));

    upper.push(up);
    lower.push(low);
    bandwidth.push(bw);
  }

  return { upper, middle, lower, bandwidth };
}

export function calculateATR(candles: Candle[], period: number = 14): number[] {
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr.push(candles[i].high - candles[i].low);
      continue;
    }
    const currentHigh = candles[i].high;
    const currentLow = candles[i].low;
    const prevClose = candles[i - 1].close;

    const trueRange = Math.max(
      currentHigh - currentLow,
      Math.abs(currentHigh - prevClose),
      Math.abs(currentLow - prevClose)
    );
    tr.push(trueRange);
  }

  return calculateSMA(tr, period);
}

export function calculateVWAP(candles: Candle[]): number[] {
  const vwap: number[] = [];
  let cumulativeTypicalPriceVolume = 0;
  let cumulativeVolume = 0;

  for (const c of candles) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumulativeTypicalPriceVolume += typicalPrice * c.volume;
    cumulativeVolume += c.volume;

    const currentVwap = cumulativeVolume > 0 ? cumulativeTypicalPriceVolume / cumulativeVolume : typicalPrice;
    vwap.push(Number(currentVwap.toFixed(5)));
  }

  return vwap;
}

export function calculateFibonacciLevels(high: number, low: number, isUptrend: boolean): {
  level0: number;
  level236: number;
  level382: number;
  level500: number;
  level618: number;
  level786: number;
  level100: number;
} {
  const diff = high - low;
  if (isUptrend) {
    return {
      level0: high,
      level236: Number((high - 0.236 * diff).toFixed(5)),
      level382: Number((high - 0.382 * diff).toFixed(5)),
      level500: Number((high - 0.500 * diff).toFixed(5)),
      level618: Number((high - 0.618 * diff).toFixed(5)),
      level786: Number((high - 0.786 * diff).toFixed(5)),
      level100: low,
    };
  } else {
    return {
      level0: low,
      level236: Number((low + 0.236 * diff).toFixed(5)),
      level382: Number((low + 0.382 * diff).toFixed(5)),
      level500: Number((low + 0.500 * diff).toFixed(5)),
      level618: Number((low + 0.618 * diff).toFixed(5)),
      level786: Number((low + 0.786 * diff).toFixed(5)),
      level100: high,
    };
  }
}

export interface SmartMoneyConcepts {
  fairValueGaps: {
    type: 'BULLISH_FVG' | 'BEARISH_FVG';
    top: number;
    bottom: number;
    mitigated: boolean;
  }[];
  orderBlocks: {
    type: 'BULLISH_OB' | 'BEARISH_OB';
    high: number;
    low: number;
    strength: number; // 1-10
  }[];
  liquiditySweep: {
    detected: boolean;
    type?: 'BUY_SIDE_SWEPT' | 'SELL_SIDE_SWEPT';
    level?: number;
  };
  marketStructure: 'BOS_BULLISH' | 'BOS_BEARISH' | 'CHOCH_REVERSAL' | 'CONSOLIDATION';
}

export function detectSmartMoneyConcepts(candles: Candle[]): SmartMoneyConcepts {
  const fvgs: SmartMoneyConcepts['fairValueGaps'] = [];
  const obs: SmartMoneyConcepts['orderBlocks'] = [];
  let liquiditySweep: SmartMoneyConcepts['liquiditySweep'] = { detected: false };
  let marketStructure: SmartMoneyConcepts['marketStructure'] = 'CONSOLIDATION';

  if (candles.length < 5) {
    return { fairValueGaps: [], orderBlocks: [], liquiditySweep, marketStructure };
  }

  // 1. Detect 3-bar Fair Value Gaps (FVG)
  for (let i = 2; i < candles.length; i++) {
    const c1 = candles[i - 2];
    const c2 = candles[i - 1];
    const c3 = candles[i];

    // Bullish FVG: Low of candle 3 is higher than High of candle 1
    if (c3.low > c1.high && c2.close > c2.open) {
      fvgs.push({
        type: 'BULLISH_FVG',
        top: c3.low,
        bottom: c1.high,
        mitigated: candles[candles.length - 1].low <= c3.low,
      });
    }
    // Bearish FVG: High of candle 3 is lower than Low of candle 1
    else if (c3.high < c1.low && c2.close < c2.open) {
      fvgs.push({
        type: 'BEARISH_FVG',
        top: c1.low,
        bottom: c3.high,
        mitigated: candles[candles.length - 1].high >= c3.high,
      });
    }
  }

  // 2. Detect Institutional Order Blocks
  const lastIndex = candles.length - 1;
  const recentCandles = candles.slice(-15);
  let highestHigh = -Infinity;
  let lowestLow = Infinity;
  recentCandles.forEach(c => {
    if (c.high > highestHigh) highestHigh = c.high;
    if (c.low < lowestLow) lowestLow = c.low;
  });

  const lastCandle = candles[lastIndex];
  if (lastCandle.high >= highestHigh) {
    liquiditySweep = {
      detected: true,
      type: 'BUY_SIDE_SWEPT',
      level: highestHigh,
    };
    marketStructure = 'CHOCH_REVERSAL';
  } else if (lastCandle.low <= lowestLow) {
    liquiditySweep = {
      detected: true,
      type: 'SELL_SIDE_SWEPT',
      level: lowestLow,
    };
    marketStructure = 'CHOCH_REVERSAL';
  } else {
    const last3Closes = candles.slice(-3).map(c => c.close);
    if (last3Closes[2] > last3Closes[1] && last3Closes[1] > last3Closes[0]) {
      marketStructure = 'BOS_BULLISH';
    } else if (last3Closes[2] < last3Closes[1] && last3Closes[1] < last3Closes[0]) {
      marketStructure = 'BOS_BEARISH';
    }
  }

  // Bullish and Bearish Order Blocks
  const prevBearish = recentCandles.find(c => c.close < c.open);
  if (prevBearish) {
    obs.push({
      type: 'BULLISH_OB',
      high: prevBearish.high,
      low: prevBearish.low,
      strength: 8,
    });
  }

  const prevBullish = recentCandles.find(c => c.close > c.open);
  if (prevBullish) {
    obs.push({
      type: 'BEARISH_OB',
      high: prevBullish.high,
      low: prevBullish.low,
      strength: 7,
    });
  }

  return {
    fairValueGaps: fvgs.slice(-3),
    orderBlocks: obs.slice(-2),
    liquiditySweep,
    marketStructure,
  };
}

export function detectCandlePattern(candles: Candle[]): string {
  if (candles.length < 3) return 'Standard Consolidation';
  const c1 = candles[candles.length - 1];
  const c2 = candles[candles.length - 2];

  const body1 = Math.abs(c1.close - c1.open);
  const range1 = c1.high - c1.low;
  const isBullish1 = c1.close > c1.open;
  const isBearish1 = c1.close < c1.open;

  const isBullish2 = c2.close > c2.open;
  const isBearish2 = c2.close < c2.open;
  const body2 = Math.abs(c2.close - c2.open);

  if (isBearish2 && isBullish1 && c1.close > c2.open && c1.open < c2.close) {
    return 'Bullish Engulfing';
  }
  if (isBullish2 && isBearish1 && c1.close < c2.open && c1.open > c2.close) {
    return 'Bearish Engulfing';
  }
  const lowerWick1 = isBullish1 ? c1.open - c1.low : c1.close - c1.low;
  const upperWick1 = isBullish1 ? c1.high - c1.close : c1.high - c1.open;
  if (range1 > 0 && lowerWick1 >= 2 * body1 && upperWick1 < 0.2 * range1) {
    return 'Bullish Pinbar / Hammer';
  }
  if (range1 > 0 && upperWick1 >= 2 * body1 && lowerWick1 < 0.2 * range1) {
    return 'Bearish Shooting Star';
  }
  if (range1 > 0 && body1 / range1 < 0.1) {
    return 'Indecision Doji';
  }

  return isBullish1 ? 'Bullish Expansion Candle' : 'Bearish Impulse Candle';
}

export function computeTechnicalIndicators(candles: Candle[]): TechnicalIndicators {
  const closes = candles.map(c => c.close);
  const lastIndex = closes.length - 1;

  const ema20Arr = calculateEMA(closes, 20);
  const ema50Arr = calculateEMA(closes, 50);
  const ema200Arr = calculateEMA(closes, Math.min(200, closes.length));
  const rsiArr = calculateRSI(closes, 14);
  const macdData = calculateMACD(closes);
  const bbData = calculateBollingerBands(closes, 20, 2);
  const atrArr = calculateATR(candles, 14);

  const lastCandle = candles[lastIndex];
  const p = (lastCandle.high + lastCandle.low + lastCandle.close) / 3;
  const r1 = 2 * p - lastCandle.low;
  const s1 = 2 * p - lastCandle.high;
  const r2 = p + (lastCandle.high - lastCandle.low);
  const s2 = p - (lastCandle.high - lastCandle.low);

  return {
    rsi: rsiArr[lastIndex] || 50,
    ema20: ema20Arr[lastIndex] || closes[lastIndex],
    ema50: ema50Arr[lastIndex] || closes[lastIndex],
    ema200: ema200Arr[lastIndex] || closes[lastIndex],
    macd: {
      macdLine: macdData.macdLine[lastIndex] || 0,
      signalLine: macdData.signalLine[lastIndex] || 0,
      histogram: macdData.histogram[lastIndex] || 0,
    },
    bollingerBands: {
      upper: bbData.upper[lastIndex] || closes[lastIndex],
      middle: bbData.middle[lastIndex] || closes[lastIndex],
      lower: bbData.lower[lastIndex] || closes[lastIndex],
      bandwidth: bbData.bandwidth[lastIndex] || 0,
    },
    atr: atrArr[lastIndex] || 0.0015,
    supportLevels: [Number(s1.toFixed(5)), Number(s2.toFixed(5))],
    resistanceLevels: [Number(r1.toFixed(5)), Number(r2.toFixed(5))],
  };
}
